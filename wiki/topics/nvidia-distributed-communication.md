---
title: "NVIDIA Distributed Communication"
type: topic
status: draft
sources:
  - https://docs.nvidia.com/cuda/cuda-programming-guide/03-advanced/multi-gpu-systems.html
  - https://docs.nvidia.com/deeplearning/nccl/user-guide/docs/overview.html
  - https://docs.nvidia.com/deeplearning/nccl/user-guide/docs/usage/collectives.html
  - https://docs.nvidia.com/datacenter/cloud-native/gpu-operator/22.9.1/gpu-operator-rdma.html
  - https://docs.nvidia.com/nvshmem/api/index.html
  - https://docs.nvidia.com/multi-node-nvlink-systems/imex-guide/overview.html
  - https://docs.nvidia.com/multi-node-nvlink-systems/multi-node-tuning-guide/ucx.html
  - https://docs.nvidia.com/mission-control/docs/systems-administration-guide/2.0.0/high-speed-fabric-management.html
  - wiki/evidence/nvidia-distributed-communication.md
last_updated: 2026-05-19
---

# NVIDIA Distributed Communication

本页调研 NVIDIA 平台在多机多卡场景下的通信方式。它不是 PTO-CANN target set 的实现证明，而是外部平台背景：帮助读者把 NVIDIA 的 CUDA / NCCL / NVLink / InfiniBand / GPUDirect RDMA / NVSHMEM / UCX / Multi-Node NVLink 这些名字放到同一个分层模型里，再回头比较 PTO Runtime、HCCL、HCOMM、RoCE/URMA 相关设计。

状态边界：本页所有 NVIDIA 平台事实来自 NVIDIA 官方文档，检索日期为 2026-05-19；PTO-CANN 本地实现状态仍以 [Distributed Execution](./distributed-execution.md) 和对应 evidence 为准。证据摘录和 claim map 见 [NVIDIA Distributed Communication Evidence](../evidence/nvidia-distributed-communication.md)。

## How To Read This Page

先把“多机多卡通信”拆成三层：GPU 进程如何持有 device/context，GPU 之间的数据实际走什么 fabric，应用使用什么通信库。CUDA 是设备/内存/进程模型；NVLink、PCIe、InfiniBand/RoCE 是路径；NCCL、NVSHMEM、UCX/MPI 是程序员实际调用的通信层。

```text
Training / inference framework
  -> NCCL collectives / P2P, NVSHMEM PGAS, CUDA-aware MPI / UCX
  -> CUDA device memory, IPC/VMM, streams, kernels
  -> intra-node PCIe / NVLink / NVSwitch
  -> inter-node InfiniBand or RoCE with GPUDirect RDMA
  -> newer rack-scale option: Multi-Node NVLink / NVLink Domain with IMEX
```

## 基础模型

CUDA 文档把多 GPU 程序先定义成一个执行组织问题：程序可能由一个 host thread 驱动多张 GPU，也可能由多个 thread 或多个 process 分别驱动 GPU；多节点 NVLink 集群中，GPU 由跨多个 OS instance 的 thread/process 驱动。GPU 之间可以通过 device memory copy、peer access、IPC/VMM、NVLink、GPUDirect RDMA，以及 NCCL/NVSHMEM/MPI 这类上层库通信。见 NVIDIA CUDA Programming Guide 的 multi-GPU systems 章节。

这意味着“多机多卡”不是单一 API。常见训练系统通常会同时有：

- 进程/通信域：rank、world size、local rank、node rank。
- 设备映射：每个 rank 绑定一张或多张 GPU。
- 节点内路径：PCIe P2P、NVLink、NVSwitch。
- 节点间路径：InfiniBand 或 RoCE 上的 RDMA，通常希望直接读写 GPU memory。
- 集合通信语义：allreduce、reduce-scatter、allgather、broadcast、all-to-all。

## 节点内通信

节点内优先看 GPU 拓扑。没有 NVSwitch 时，GPU P2P 能力受 PCIe topology、NUMA 和 peer access 支持影响；有 NVLink/NVSwitch 时，GPU 到 GPU 可以用更高带宽、低延迟的 direct path。CUDA 文档明确把 NVLink 作为高性能 P2P memory access/transfer 的路径；NVIDIA AI Enterprise 的 NVSwitch 文档也把 NVSwitch 描述为让同一系统内多 GPU 以 NVLink 速率互达的 crossbar。

节点内通信通常表现为：

```text
rank0 GPU0 -- NVLink/NVSwitch or PCIe P2P -- rank1 GPU1
```

上层应用一般不直接手写复杂路由。NCCL 会根据 topology 做 collective 和 point-to-point 选择；CUDA IPC/VMM 适合更底层的跨进程 memory sharing；NVSHMEM 适合需要 GPU kernel 内细粒度 put/get 的 PGAS 风格程序。

## 节点间通信

经典多节点 GPU 集群的节点间路径是 InfiniBand 或 RoCE。GPUDirect RDMA 的关键作用是让网络设备直接访问 GPU memory，避免必须先把数据 bounce 到 CPU host memory。NVIDIA GPU Operator 文档说明 `nvidia-peermem` 模块让 Mellanox InfiniBand HCA 能直接 peer-to-peer 读写 GPU memory；这解释了为什么多机训练常同时关心 GPU、NIC、PCIe topology、OFED/MOFED、driver 和 container operator。

典型路径可以这样读：

```text
node A GPU memory
  -> local PCIe / NVLink path to NIC
  -> InfiniBand or RoCE fabric
  -> remote NIC
  -> node B GPU memory
```

NCCL 会在跨节点 collective 中使用网络后端，并暴露 `NCCL_SOCKET_IFNAME`、`NCCL_IB_HCA`、`NCCL_IB_GID_INDEX`、`NCCL_IB_ROCE_VERSION_NUM`、`NCCL_NET_GDR_LEVEL` 等环境变量用于选择 socket interface、InfiniBand/RoCE 设备和 GPUDirect RDMA 行为。实际部署中，错误的 NIC 选择、RoCE GID、PCIe ACS、driver/kernel module 或容器权限都可能导致性能退化或直接失败。

## NCCL

NCCL 是 NVIDIA 多 GPU 训练里最常见的 data-plane 通信库。官方文档把 NCCL 定义为 topology-aware 的 inter-GPU communication primitive library；它提供 collective 和 point-to-point send/receive，但不是完整 parallel programming framework。NCCL 支持 PCIe、NVLink、InfiniBand Verbs 和 IP sockets，可用于节点内和跨节点多 GPU 通信。

NCCL 的核心 mental model 是 rank 共同进入同一个通信操作：

```text
rank 0: ncclAllReduce(send0, recv0, count, ...)
rank 1: ncclAllReduce(send1, recv1, count, ...)
rank 2: ncclAllReduce(send2, recv2, count, ...)
rank 3: ncclAllReduce(send3, recv3, count, ...)

=> each recv contains reduction(send0, send1, send2, send3)
```

官方 collective 文档强调：每个 rank 都必须用相同 count 和 datatype 调用 collective，否则可能 hang、crash 或 data corruption。这一点对 runtime 设计很重要：control plane 必须保证 rank membership、shape、dtype、stream ordering 和 failure handling 一致；NCCL 负责高性能通信，不替代上层任务调度和语义检查。

## NVSHMEM

NVSHMEM 是另一个重要分支。它实现 OpenSHMEM 的 PGAS 模型，让跨 GPU 的 memory space 以 partitioned global address space 的方式组织，并支持从 CUDA kernel、CUDA stream 或 CPU 发起细粒度 GPU-GPU data movement。它适合需要 GPU-initiated communication、细粒度 put/get、或把通信嵌入 kernel 的场景。

可以把 NCCL 和 NVSHMEM 的常见分工粗略理解为：

```text
NCCL:     bulk collective / P2P for training framework communication
NVSHMEM: fine-grained PGAS put/get, including GPU-initiated patterns
```

这不是互斥关系。系统可能用 NCCL 做主训练 collective，用 NVSHMEM 或 UCX/MPI 做特殊通信路径。

## UCX / MPI / HPC-X

UCX 是更通用的通信 substrate。NVIDIA GB200 NVL Multi-Node Tuning Guide 描述 UCX 可在 CPU/GPU endpoint 之间提供 get/put、send/receive、active messages/RPC 等 primitive；在 GB200 Multi-Node NVLink 环境中，端点之间可能同时存在 Multi-Node NVLink 和 InfiniBand 路径。MPI、CUDA-aware MPI、UCC 和 NCCL 可以在不同层级使用 UCX/HPC-X 能力。

对 runtime 设计来说，UCX 的意义在于它不像 NCCL 那样只围绕 GPU collective；它更接近“可组合通信 substrate”，能承载 point-to-point、RMA 和 active message 风格的控制/数据混合路径。代价是上层需要自己定义更多语义：buffer lifetime、completion、progress、ordering、错误处理和 rank/session 生命周期。

## Multi-Node NVLink / NVLink Domain

传统经验里，NVLink 常被理解成节点内 GPU interconnect，跨节点主要靠 InfiniBand/RoCE。NVIDIA 新一代 Multi-Node NVLink 把这个边界往 rack-scale 扩展：IMEX Guide 说明 NVLink multi-node architecture 把 Multi-GPU NVLink P2P programming model 从单个 compute node / OS domain 扩展到多个 compute node，每个节点有独立 OS；IMEX 支持跨 OS domain 的 GPU memory export/import 和 shared memory 操作。

GB200/GB300 NVL72 文档还说明，一个 NVL72 rack 默认启用 72 GPU NVLink Domain，并可通过 NVLink Partition 把大 domain 切成多个 user partition。这类系统让“节点间”不一定只意味着 IB/RoCE；在 NVLink Domain 内，GPU memory fabric 本身成为通信路径的一部分。

```text
classic cluster:
  node-local NVLink/NVSwitch + inter-node InfiniBand/RoCE

Multi-Node NVLink system:
  multiple OS domains connected into an NVLink Domain
  IMEX handles cross-node memory export/import lifecycle
```

这个能力依赖具体平台、fabric manager/subnet manager、IMEX service 和 partition 配置。不能把它泛化到所有 NVIDIA GPU 集群。

## 和 PTO-CANN / HCCL 的对照

NVIDIA 平台的 NCCL 和 CANN 平台的 HCCL 在“集合通信库”位置上可类比：二者都更接近 data-plane collective/backend，而不是完整 distributed runtime control plane。PTO wiki 当前已经把 HCCL 标为 rank/window/data-plane supporting evidence，而不是 remote worker lifecycle 或 callable registry 的实现；NVIDIA 侧 NCCL 也类似，它提供高性能 collective/P2P，不替代训练框架、MPI launcher、scheduler 或 runtime 对任务生命周期的管理。

对 PTO Runtime 的 remote L3 / DistWorker 设计，NVIDIA 调研给出三条可迁移经验：

1. control plane 和 data plane 必须分开：rank discovery、callable registry、worker lifecycle、completion 是 runtime 语义；NCCL/RDMA/NVLink 是数据移动能力。
2. topology 不是细节：节点内 NVLink/NVSwitch、节点间 IB/RoCE、多 NIC、多 rail、Multi-Node NVLink partition 都会改变通信计划。
3. GPU memory sharing 需要生命周期服务：无论是 CUDA IPC/VMM、GPUDirect RDMA registration，还是 IMEX memory export/import，都要明确 handle、registration、import/unimport、completion 和 failure boundary。

## Practical Checklist

调研或排查一个 NVIDIA 多机多卡通信方案时，先问这些问题：

- Hardware: GPU 型号、SXM/PCIe、NVLink/NVSwitch、NIC 型号、IB/RoCE、是否 GB200/GB300 NVL / Multi-Node NVLink。
- Topology: `nvidia-smi topo -m`、NUMA、GPU-NIC affinity、多 rail、是否跨 NVLink partition。
- Runtime process model: one process per GPU、one process per node、MPI launcher、Kubernetes operator、容器权限。
- Communication library: NCCL collective、NVSHMEM PGAS、CUDA-aware MPI/UCX，还是自定义 RDMA。
- Memory path: host bounce copy、CUDA IPC/VMM、GPUDirect RDMA、IMEX export/import。
- Correctness: rank mapping、count/dtype/shape 一致、stream ordering、buffer lifetime、completion、timeout/failure policy。
- Tuning: NCCL socket/IB/RoCE/GDR 环境变量、UCX transport、NIC binding、SHARP/NVLS/MNNVL 能力是否真的可用。

## What To Remember

NVIDIA 多机多卡通信的主线是“CUDA 管设备和内存，fabric 负责路径，通信库给应用语义”。节点内常见路径是 PCIe P2P、NVLink、NVSwitch；节点间常见路径是 InfiniBand/RoCE + GPUDirect RDMA；NCCL 负责 bulk collective/P2P，NVSHMEM 负责 PGAS/细粒度 GPU-initiated 通信，UCX/MPI 提供更通用的 endpoint communication。Multi-Node NVLink 是新平台能力，需要按具体 NVLink Domain、IMEX 和 partition 配置判断，不能默认存在。
