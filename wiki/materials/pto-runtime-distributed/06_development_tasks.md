# 06. 后续开发任务

本章把开放问题转成可执行任务。优先级是基于当前资料的工程判断，实际排期还需要项目负责人确认。

## P0. 冻结目标蓝图与接口边界

### 任务

把 `03_distributed_blueprint.md` 中的目标蓝图变成项目认可的设计文档，尤其确认：

1. remote L3 是否是当前阶段必须做。
2. callable id 是否要统一覆盖 NEXT_LEVEL 和 SUB。
3. Send/Receive Runtime 是否进入近期开发范围。
4. platform 解耦是否必须支持无 CANN 通用服务器。

### 输入

当前文档、`RUNTIME_OPEN_PROBLEMS.md`、`SEND_RECV_RUNTIME.md`、聊天记录、GitHub 主线。

### 输出

一份冻结后的目标设计，作为后续 PR 拆分依据。

### 验收

关键 reviewer 同意以下边界：做什么、不做什么、先做什么、后做什么。

## P0. Remote L3 control plane 设计与最小 PoC

### 背景

2026-04-29 聊天记录把“RoCE 网络管理远端 L3”列为 top problem。当前主线没有 REMOTE WorkerManager mode。

### 任务

设计并实现最小 remote L3 PoC：

```text
L4 parent
    |
    +-- connect remote L3
    +-- register callable
    +-- submit taskargs
    +-- receive completion/error
```

最小 PoC 不需要一开始支持所有 tensor、comm window 和 failure recovery。它应该先证明下面这条链路：

```text
parent process
    |
    | RegisterCallable(fn or descriptor)
    v
remote L3 process
    |
    | returns remote callable_id
    v
parent process
    |
    | SubmitTask(remote callable_id, simple args)
    v
remote L3 process
    |
    | execute callable
    v
parent process receives completion/error
```

建议第一版请求/响应类型：

```text
HelloRequest:
    protocol_version
    client_name

HelloResponse:
    protocol_version
    capabilities

RegisterCallableRequest:
    callable_kind
    stable_name
    code_hash
    payload or symbol

RegisterCallableResponse:
    callable_id
    cache_hit

SubmitTaskRequest:
    task_id
    callable_id
    call_config
    serialized_task_args

TaskCompletion:
    task_id
    status
    error_code
    error_message
```

### 建议改动范围

```text
src/common/hierarchical/worker_manager.*
src/common/hierarchical/orchestrator.*
python/simpler/worker.py
python/simpler/orchestrator.py
新增 remote transport/session 模块
新增 tests/st remote-l3 或 local two-host simulation case
```

### 验收

1. 可在单机模拟两个 host/session。
2. L4 能向 remote L3 提交一个简单 task。
3. completion 和 error 能回传。
4. 不依赖 shared VA 或 fork-COW。

## P0. Callable 注册统一设计

### 背景

当前 NEXT_LEVEL 使用 `uint64_t callable`，SUB 使用 `callable_id`。远端 L3 无法使用父进程裸指针。

### 任务

设计 callable registry v2：

```text
register(callable) -> stable id
submit_next_level(callable_id, ...)
submit_sub(callable_id, ...)
remote_register(callable_package) -> remote callable id
```

建议落地顺序：

```text
step 1:
    引入 CallableDescriptor，但 local path 仍可用原 registry

step 2:
    给 SUB / NEXT_LEVEL 都建立 callable_id 概念

step 3:
    remote session 注册 callable_id 映射

step 4:
    AICPU/L2 callable cache 使用 descriptor hash，而不是裸 pointer
```

### 建议改动范围

```text
python/simpler/worker.py
python/simpler/orchestrator.py
src/common/hierarchical/orchestrator.*
src/common/hierarchical/worker_manager.*
src/a2a3/runtime/tensormap_and_ringbuffer/aicpu/*
src/a5/runtime/tensormap_and_ringbuffer/aicpu/*
```

### 验收

1. 本地 SUB 和 NEXT_LEVEL 语义一致。
2. remote L3 不需要 dereference parent pointer。
3. AICPU callable cache 可用 stable id 做 key。
4. 兼容现有 chip callable fast path 或提供迁移层。

## P0. 明确 logical rank / physical device id 映射

### 背景

聊天记录已确认 rank 应是任务组内 logical id，不能固定绑 physical device id。

### 任务

梳理所有 rank 使用点，确保：

```text
logical rank: passed into CommContext / kernel / task group
physical device id: used only for device binding and scheduling
```

### 建议检查路径

```text
python/simpler/worker.py
python/simpler/task_interface.py
examples/workers/l3/*
src/common/platform_comm/*
src/a2a3/platform/onboard/host/comm_hccl.cpp
tests/st/a2a3/tensormap_and_ringbuffer/test_l3_group.py
```

### 验收

1. 使用 physical devices `[0, 1, 4, 5]` 建立 4-rank group，kernel 看到 rank `[0, 1, 2, 3]`。
2. allreduce/allgather 类 demo 不要求 tensor rank 维度按全机 physical device 数定义。

## P1. Comm window / bootstrap 稳定化

### 背景

PR #592 已合入 HCCL backend，但依赖 CANN-private ABI。聊天记录中过 rootinfo/barrier 文件 freshness 问题。

### 任务

1. 补充 comm window 文档和测试。
2. 梳理 windowsIn/windowsOut 语义。
3. 增加 CANN version / symbol check。
4. 明确 bootstrap failure cleanup。

推荐 API 草案：

```text
create_comm_domain(workers, window_size) -> domain_id
    assigns logical ranks
    initializes each local/remote chip rank
    collects device CommContext metadata
    distributes final context

destroy_comm_domain(domain_id)
    barriers if possible
    frees windows
    destroys comm handles
```

### 验收

1. comm window demo 可稳定重跑，不被旧 rootinfo/barrier 文件污染。
2. windowsIn/windowsOut 使用方向在文档和 kernel 中一致。
3. CANN ABI drift 能在 build 或 dlopen 阶段清晰失败。

## P1. SDMA async completion 合入或替代方案

### 背景

PR #696 open，尚未合入。

### 任务

1. review #696。
2. 基于 `pto-isa` 仓库 `4e27a10` 中 `TPUT_ASYNC` / `TGET_ASYNC` / `BuildAsyncSession` / `AsyncEvent` 的语义，核对 #696 对 SDMA event record 的使用是否与 PTO-ISA 当前接口一致。
3. 决定合入、拆分还是改成新的 engine-aware API。

### 验收

1. SDMA async demo 在硬件上通过。
2. 原有 deferred notify demo 不退化。
3. `PTO2_ASYNC_ENGINE_SDMA` 与未来 URMA engine 不冲突。

## P1. URMA completion 抽象

### 背景

聊天记录指出 URMA completion 与 SDMA 不同，URMA 更偏 CQ polling。`pto-isa` 仓库 `4e27a10` 进一步确认 URMA 是 `DmaEngine::URMA` 分支，A5 demo 使用 HCCP V2 Jetty RDMA；`hcomm` 仓库 `2cbe889` 中也能看到 Jetty/SRQ 等底层接口痕迹。

### 任务

设计统一 completion condition：

```text
condition:
    engine
    addr / cq / opaque handle
    expected value or backend-specific predicate
```

### 验收

1. SDMA counter/event record 和 URMA CQ 都能通过同一 scheduler wait list 表达。
2. API 不把 URMA 强行伪装成普通 GM counter。

## P1. Send/Receive Runtime 第一阶段

### 背景

`SEND_RECV_RUNTIME.md` 已有 API 草案，但未见主线实现。

### 任务

实现最小 `RecvQueue` / `SendEndpoint` / `CompletionQueue` C++ 接口和 host TCP 或 shmem backend，用于验证 persistent run_loop 编程模型。

建议分阶段：

```text
phase 1:
    in-process or shm queue
    prove RecvQueue / CompletionQueue API shape

phase 2:
    local process backend
    child run_loop consumes queue

phase 3:
    hardware backend
    HCCL/URMA/RoCE/TCP selected by platform
```

### 验收

1. 一个 `run_loop` demo 能持续接收消息、提交 task、产出 completion。
2. 有退出协议。
3. 不阻塞当前 WorkerThread FIFO 模型导致死锁。

## P1. Platform 解耦调研

### 背景

通用服务器无 CANN 运行 simpler 的要求尚未解决。

### 任务

1. 列出当前 host-only control plane 需要哪些库。
2. 列出 comm backend 需要哪些 UB/URMA/RoCE/HCCL 库。
3. 判断 `libhcomm` / URMA 是否可脱离 full CANN 部署。
4. 给出 `.so` 拆分方案。

推荐拆分检查表：

```text
import simpler:
    must not dlopen CANN/HCCL

create host-only Worker:
    must not require device files

create chip Worker:
    may require ACL/CANN

comm_init:
    may require HCCL/hcomm

remote coordinator:
    should run without CANN unless it directly manages devices
```

### 验收

1. 无 CANN 机器可运行 host-only remote manager smoke test。
2. 有 CANN 机器可加载 device backend。
3. 缺少 comm lib 时错误可诊断，不影响纯 host 功能。

## P2. 文档与测试补全

### 任务

1. 为每个已合入能力补一个“怎么用/怎么测/常见失败”文档。
2. 把关键纯文本图固化到 repo docs。
3. 把 PR 历史中的 design notes 合并成稳定文档。

### 验收

1. 新接手者能按文档跑通至少一个 L3 multi-chip demo。
2. 能按文档定位 deferred completion 的关键文件。
3. 能按文档判断某个 task 是否应该指定 worker affinity。
