# 01. 华为硬件、超节点与分布式软件栈

本章只补齐理解 PTO-Runtime 分布式拓展所需的背景。公开资料用于解释概念和官方接口语义，不用于证明项目实现状态。

## 1. 从单卡到超节点的最小心智模型

PTO-Runtime 分布式拓展要处理的不是“多开几个进程”这么简单，而是跨越 host 进程、AICPU runtime、AICore kernel、device GM、通信 window 和跨设备/跨节点互联的一整条链路。

```text
Host CPU / L3+ Runtime
    |
    | task dispatch / bootstrap / metadata
    v
AICPU / L2 Runtime
    |
    | schedule AICore task, observe completion
    v
AICore / L1 Kernel
    |
    | load/store/notify/wait/async event
    v
GM / Global Memory / Comm Window
    |
    | HCCS / UB / RoCE / RDMA-like path
    v
Peer Device GM
```

几个关键点：

1. **Host CPU** 负责 Python/C++ orchestration、worker 管理、HCCL 初始化、root info 交换、fork 或未来的远端进程管理。
2. **AICPU / L2 runtime** 负责设备侧调度、任务状态、completion 观察和部分 runtime 逻辑。
3. **AICore / L1 kernel** 执行真正的计算和通信原语，例如 TLOAD/TSTORE/TNOTIFY/TWAIT/TPUT_ASYNC/TGET_ASYNC。
4. **GM / Global Memory** 是 AICore 可通过 `__gm__` 指针访问的全局内存，也是 comm window 和 completion counter 的常见承载位置。

根据华为 Ascend C 公开文档，Ascend C 用逻辑位置 `TPosition` 隐藏不同层级物理存储，文档中明确 GM 对应 Global Memory；`__gm__` 地址空间限定符用于指向 Global Memory 上的对象。这些公开资料只用于解释 GM、`__gm__` 的语义，不说明 PTO-Runtime 的实现进度。参考：[Ascend C 通用约束](https://www.hiascend.com/document/detail/zh/canncommercial/80RC3/apiref/ascendcopapi/atlasascendc_api_07_0004.html)、[CCE Intrinsic 地址空间限定符](https://www.hiascend.com/document/detail/zh/CANNCommunityEdition/82RC1/opdevg/cceintrinsicguide/cceprogram_0013.html)。

为了自包含阅读，可以把这几个词先按下面理解：

```text
GM / Global Memory
    NPU device 上可被 AICore 通过 __gm__ 指针访问的大容量全局内存。
    PTO-Runtime 的 tensor buffer、comm window、completion flag/counter
    很多都会落在 GM 上。

__gm__
    Ascend C/CANN 设备代码里的地址空间标记。
    一个 __gm__ uint8_t* 不是普通 host pointer，而是指向 device GM。

TPosition
    Ascend C 对不同存储层级的抽象名。对本文最重要的是 GM，
    因为跨 rank 通信和异步完成通常都要让 AICore 能看到某个 GM 地址。
```

这直接影响 PTO-Runtime 的设计：host 侧的 `uint64_t ptr` 只有在明确知道它是 host VA、device VA、comm window VA 或 remote MR 地址时才有意义。远端 L3 不能把一个本地 `uint64_t` 裸指针发给另一个 host 就假设可用。

## 2. 单机、多机、超节点

### 2.1 单机多卡

单机多卡通常有一个 OS 视角下的 host 进程树，管理多个 NPU device。当前 `simpler` 的 L3 Worker 正是以此为主：L3 host 通过 fork 启动多个 chip child，每个 child 绑定一个 device id。

```text
One host OS
    |
    +-- L3 Worker process
          |
          +-- chip child process: device 0
          +-- chip child process: device 1
          +-- sub worker process
```

这种模式下，fork-COW、共享内存、父子进程相同虚拟地址等技巧还能工作。

### 2.2 多机

多机意味着远端 L3 不在同一个 fork 树中，也不能继承父进程地址空间。此时需要新的 control plane：

```text
Host A                                  Host B
------+                                 ------+
L4/POD Runtime                          Remote L3 Runtime
     |                                  |
     | RoCE / TCP / UB comm lib?        |
     +--------------------------------->|
        control: launch/register/run
```

这就是 `RUNTIME_OPEN_PROBLEMS.md` 中“没有通过 RoCE 网络管理 Next Level Worker 的能力”的核心。

### 2.3 超节点

公开论文《Serving Large Language Models on Huawei CloudMatrix384》描述 CloudMatrix384 supernode 将 384 个 Ascend 910C NPU 和 192 个 Kunpeng CPU 通过高带宽 Unified Bus 连接，实现 all-to-all 通信和资源池化。参考：[arXiv:2506.12708](https://arxiv.org/abs/2506.12708)。

对本项目来说，重要的不是 CloudMatrix384 的完整产品形态，而是它代表的设计趋势：

1. 资源不是“单机固定几张卡”，而是更大的池化拓扑。
2. CPU 与 NPU、NPU 与 NPU 之间可能有 UB、RoCE、HCCS 等不同路径。
3. Runtime 必须区分 control plane 和 data plane，不能假设所有 child worker 都在本地 fork 树中。

把“超节点”翻译成 runtime 设计语言，就是：

```text
传统单机 L3:
    一个 host 进程管理本机 device ids [0..N)
    child worker 可以通过 fork / shm / mailbox 建起来

超节点或多机 L4+:
    上层 runtime 面对的是一个资源池
    一个 task group 可能跨多个 host、多个 device island、多个通信后端
    worker id 必须从单整数扩展成可定位的 worker address
```

因此，本文后面说的 remote L3，不只是“远程调用一个函数”，而是把原本由 fork 隐式提供的地址空间继承、callable 继承、mailbox 继承、错误传播和退出清理全部显式协议化。

## 3. HCCL、HCOMM、URMA、RoCE 的边界

### 3.1 HCCL

HCCL 是昇腾生态里的集合通信库。对 PTO-Runtime 分布式拓展而言，HCCL 主要提供：

1. communicator / rank 语义。
2. root info 初始化。
3. 集合通信和 P2P 通信接口。
4. 通过项目中 private hcomm/HCCL 相关接口构造 comm window / CommContext。

根据华为昇腾 HCCL API 文档，`HcclGetRootInfo` 需要在 root 节点生成 root rank 标识信息，并广播给集群内其他 rank；`HcclCommInitRootInfo` 使用相同 `nRanks` 和 `rootInfo` 初始化通信域。参考：[HcclGetRootInfo](https://www.hiascend.com/document/detail/zh/canncommercial/800/apiref/hcclapiref/hcclcpp_07_0005.html)、[HcclCommInitRootInfo](https://www.hiascend.com/document/detail/en/canncommercial/800/apiref/hcclapiref/hcclcpp_07_0006.html)。

根据 HCCL 接口参考资料，`HcclSend` / `HcclRecv` 是同步且需要配对的 P2P 接口；这也是本文档不建议把它们直接等同于 PTO-Runtime `RecvQueue` 的原因。自包含地说，HCCL P2P 更像“一次 send 与一次 recv 的配对传输”，而 PTO-Runtime 需要的 `RecvQueue` 更像“由 runtime 持有的持续接收队列，可以被 long-running worker loop 反复 poll/pop/release”。

自包含地看，HCCL 初始化最小协议是：

```text
rank 0:
    rootInfo = HcclGetRootInfo()
    publish rootInfo to all ranks

rank i:
    wait / receive same rootInfo

all ranks:
    comm = HcclCommInitRootInfo(nRanks, rootInfo, myRank)
```

这里的 `rank` 是通信域里的逻辑编号，不是物理 device id。比如物理 device ids `[0, 1, 4, 5]` 可以组成逻辑 ranks `[0, 1, 2, 3]`。PTO-Runtime 的调度器要负责这个映射，否则 kernel 里用 rank 找 peer window 时会错位。

`HcclSend` / `HcclRecv` 和本文想要的 `RecvQueue` 的区别是：

```text
HCCL P2P pair
    sender explicitly calls send
    receiver explicitly calls recv
    usually one pair describes one transfer

Runtime RecvQueue
    receiver owns a persistent queue
    worker.run_loop can keep running
    incoming messages become task input / completion event
    queue semantics belongs to PTO-Runtime, not HCCL itself
```

### 3.2 HCOMM / private HCCL pieces

根据 GitHub PR #592，当前项目的 HCCL backend 明确依赖 CANN-private pieces：

1. `libhcomm.so`。
2. `HcclAllocComResourceByTiling`。
3. `HcomGetCommHandleByGroup`。
4. `HcomGetL0TopoTypeEx`。
5. reverse-engineered 的 tiling/resource structs，并用 `static_assert` 锁 offset 和 size。

这说明当前 comm window 基座已经能工作到一定程度，但它脆弱依赖 CANN 私有 ABI。后续 platform 解耦和 CANN 版本锁定必须考虑这一点。

当前 `simpler` 里的 HCCL backend 可以概括为下面这个 C API 面：

```cpp
CommHandle comm_init(int rank, int nranks, void *stream, const char *rootinfo_path);
int comm_alloc_windows(CommHandle h, size_t win_size, uint64_t *device_ctx_out);
int comm_barrier(CommHandle h);
int comm_free_windows(CommHandle h);
int comm_destroy(CommHandle h);
```

其中 `comm_init` 不自己创建 ACL stream，而是使用调用方传入的 stream；rank 0 生成 rootinfo 文件，其他 rank 等待该文件；所有 rank 再进入 barrier 并初始化 HCCL communicator。`comm_alloc_windows` 则进一步通过 private hcomm/HCCL 接口拿到 device 可读的 `CommContext`。

这意味着它已经是“设备数据面通信域”的基座，但还不是“host 间 remote worker 控制协议”。

### 3.3 URMA / UB

URMA 在本项目语境中主要与 A5 / UB / jetty / JFR / CQ polling 相关。`SEND_RECV_RUNTIME.md` 里把 A5 backend 设计为 URMA jetty/JFR，并指出 device 侧需要 `UrmaPollCq` 之类能力。

从聊天记录看，URMA completion 和 SDMA completion 的机制不同：SDMA async event 可以表现为某个 GM flag/counter，而 URMA completion 更接近检查 CQ。这一差异是后续统一 async poll API 的关键。

根据 `pto-isa` 仓库 `4e27a10` 的 `agents/skills/pto-comm-isa-reference/references/async-instructions.md`，`BuildAsyncSession<DmaEngine::URMA>` 是 A5 / Ascend950 路径，URMA workspace 由 host 侧 `UrmaWorkspaceManager` 分配，并要求大页内存。根据 `demos/baseline/allgather_async/README_zh.md`，A5 demo 4-6 通过 `TPUT_ASYNC<DmaEngine::URMA>` / `TGET_ASYNC<DmaEngine::URMA>` 使用 HCCP V2 Jetty RDMA。

根据本次拉取的 `hcomm` 仓库 `2cbe889`，`src/legacy/unified_platform/external_system/orion_adapter_hccp.h` 中能看到 UB/URMA 风格的 Jetty 创建、导入、绑定、post send、状态查询等接口，`src/hccd/hccd_impl_pml.cc` 中能看到 tag/data SRQ 创建和销毁逻辑。这能支撑“URMA/Jetties/SRQ/CQ 是 A5 数据面基础设施”的判断，但不能单独证明它已经被 PTO-Runtime remote L3 管理面使用。

几个 URMA/HCCP 词可以这样理解：

```text
Jetty
    可理解为 UB/RDMA 风格通信端点。hcomm 代码里有 create/import/bind/post send。

JFC / CQ
    完成队列相关对象。URMA 的 Wait 语义最终更像消费 CQE，
    而不是读一个普通 GM counter。

JFR / SRQ
    接收资源/共享接收队列相关对象。hcomm 里能看到 tag SRQ 和 data SRQ，
    分别对应接收请求消息和发送完成消息一类事件。

MR / huge page
    URMA 路径需要注册内存。PTO-ISA 文档提示 URMA workspace 或对称数据缓冲
    需要大页背景，否则底层注册可能失败。
```

所以后续如果把 URMA completion 接入 PTO-Runtime，不应设计成：

```text
only: poll *(uint32_t*)gm_addr == expected
```

而应设计成：

```text
condition:
    engine = SDMA | URMA | ROCE | CCU
    payload:
        SDMA -> GM flag / counter / event record
        URMA -> CQ / opaque handle / expected CQE count
```

### 3.4 RoCE

RoCE 是 `RDMA over Converged Ethernet`，也就是把 RDMA 能力放到 Ethernet 网络上。`RDMA` 是 `Remote Direct Memory Access`：一端的网卡或通信引擎在建立连接、注册内存和权限后，可以读写另一端暴露出来的 memory region。和普通 TCP/RPC 相比，RDMA 的直觉差异是：

```text
Normal TCP / RPC intuition
--------------------------
sender app
  -> kernel/socket stack
  -> NIC
  -> Ethernet
  -> receiver NIC
  -> kernel/socket stack
  -> receiver app copies/parses bytes

RDMA / RoCE intuition
---------------------
host B registers memory region MR_B
host A obtains permission + remote address/key for MR_B
host A NIC/RDMA engine
  -> Ethernet fabric
  -> host B NIC/RDMA engine writes or reads MR_B

CPU 主要负责 setup、权限、queue pair、completion 处理；
真正的数据搬运尽量由 NIC/RDMA engine 完成。
```

NVIDIA DOCA 文档把 RoCE 定义为在 lossless Ethernet 上承载 RDMA，用于高吞吐、低延迟的 server-to-server memory transfer，并说明 RoCEv1 使用专用 Ethernet EtherType，RoCEv2 把 RDMA 封装进 UDP/IP，UDP 端口为 `4791`，因此可以跨 IP Layer 3 routing。该文档也强调可靠部署通常需要 Ethernet flow control，例如 Priority Flow Control。Ascend/HCCL 文档则说明 HCCL 是基于 Ascend AI processors 的集合通信库，支持 single-server multi-device 和 multi-server multi-device 场景，并在 HCCS、RoCE、PCIe 等高速链路上实现 AllReduce、Broadcast、AllGather、ReduceScatter、AlltoAll 等 collective primitives。Ascend PyTorch 通信基础文档也把 RoCE 解释为承载在融合以太网上的 RDMA 技术，并在该语境中特指 RoCE v2。

资料来源：

- NVIDIA DOCA, [RDMA over Converged Ethernet](https://docs.nvidia.com/doca/sdk/rdma-over-converged-ethernet/index.html)
- Huawei Ascend, [HCCL Overview](https://www.hiascend.com/document/detail/en/canncommercial/800/hcclug/hcclug/hcclug_000001.html)
- Huawei Ascend, [通信基础概述](https://www.hiascend.com/document/detail/zh/Pytorch/700/ptmoddevg/trainingmigrguide/performance_tuning_0050.html)

对 PTO-Runtime 来说，RoCE 的位置应该这样读：

```text
PTO Runtime remote-L3 problem
-----------------------------
control plane:
  launch/discover remote Worker
  register callable identity
  submit task metadata
  maintain heartbeat/failure/retry
  report completion/error

possible data/transport substrate:
  TCP socket      -> easiest control path, more CPU/kernel involvement
  RoCE/RDMA      -> low-latency registered-memory data path
  HCCL/HCOMM     -> collective/window-oriented NPU communication
  URMA           -> Ascend/UB-oriented remote memory access path
```

因此，RoCE 不是 “remote L3”。它只回答“跨 host 低延迟搬数据可以走什么链路”这一层问题。Remote L3 还需要回答“谁启动远端进程、远端如何知道 callable 是什么、参数怎么序列化、Tensor identity 如何跨 host 表达、失败时如何回收资源”等 control-plane 问题。

一个容易误读的点是：HCCL 已经可以在 RoCE 上做 multi-server collective communication，不等于 PTO-Runtime 已经拥有远端 L3 worker 管理。HCCL/HCOMM 更像 data plane 和 communication domain：它知道 rank、window、collective operation 和 device-side task orchestration。PTO-Runtime 的 remote L3 则需要 host-side worker ownership 和 task lifecycle：

```text
HCCL over RoCE can help with:
  rank-based collective communication
  comm window / memory information exchange
  device-side wait/notify and transfer tasks

PTO Runtime still needs:
  remote Worker process lifecycle
  callable registry across hosts
  TaskArgs / TensorMap serialization boundary
  async completion and error propagation into scheduler
  cleanup when a remote host or communication endpoint fails
```

`RUNTIME_OPEN_PROBLEMS.md` 和 2026-04-29 聊天记录把“通过 RoCE 网络管理远端 L3”列为 top problem，应该按这个拆解理解：RoCE 是候选 transport/data path；remote L3 management 是尚未完成的 runtime control-plane 设计。聊天记录中提到可以在一个 16 卡节点上“假装两个 8 卡 host”验证 RoCE 自通信思路，这只能证明某些网络路径或通信配置可实验，不代表 remote L3 已经实现。

## 4. PTO-Runtime 中 control plane 和 data plane 的区别

分布式拓展必须明确两条平面：

```text
Control plane
-------------
remote L3 discovery / launch
callable register
worker.run / submit_next_level
heartbeat / failure detection
metadata exchange
task lifecycle

Data plane
----------
HCCL / HCOMM comm window
URMA / RoCE send-recv
TLOAD / TSTORE / TNOTIFY / TWAIT
TPUT_ASYNC / TGET_ASYNC
completion counter / CQ
```

HCCL/comm window 主要解决 data plane。remote L3、callable registry、长循环 `run_loop` 的生命周期管理主要属于 control plane。两者相关，但不能混为一个功能。

## 5. 设计影响

对 PTO-Runtime 分布式拓展来说，硬件和软件栈背景带来以下设计约束：

1. **不能假设地址可共享**：本地 fork 下裸 VA 可用，远端 L3 不可用。
2. **不能把 physical device id 当 logical rank**：任务组内 rank 应该是逻辑编号。
3. **不能把 HCCL P2P 当 persistent queue**：HCCL send/recv 是配对通信接口，不等同于 runtime 需要的一等 `RecvQueue`。
4. **不能把 SDMA 和 URMA completion 写死成同一种 counter**：runtime 需要 engine-aware 的 poll/complete 抽象。
5. **不能假设所有 host 都有 CANN**：2026-04-30 聊天记录提到通用服务器也要能跑 simpler，这会影响 platform 依赖切分。
