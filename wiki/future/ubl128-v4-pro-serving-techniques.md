---
title: "UBL128 V4 Pro Serving Techniques"
type: future
status: draft
sources:
  - ../materials/UBL128_serving.md
  - ../materials/simpler_distributed_runtime_design.md
  - ../evidence/future-ubl128-v4-pro-serving-techniques.md
  - https://github.com/ai-dynamo/dynamo
  - https://github.com/NVIDIA/TensorRT-LLM
  - https://github.com/NVIDIA/Megatron-LM
  - https://github.com/ai-dynamo/nixl
  - https://github.com/triton-inference-server/tensorrtllm_backend
last_updated: 2026-05-10
---

# UBL128 V4 Pro Serving Techniques

本页面回答一个具体 Future question：如果目标是 [UBL128 Serving Design](../materials/UBL128_serving.md) 中的 DeepSeek V4 Pro serving，`simpler` distributed runtime 应该从 NVIDIA 面向大模型 serving 的系统里学什么，不能学什么，下一步应该补哪些抽象。

它不是说 UBL128 会运行 CUDA、NCCL、NVLink、TensorRT-LLM 或 Dynamo。UBL128 的目标平台是 Ascend 950、UB、Urma、SU/SO/DCN、SSU 和 `simpler` / PyPTO / PTO-ISA 体系。这里借 NVIDIA 体系是为了学习已经被大规模 LLM serving 反复验证的系统分层：kernel engine、model-parallel process group、prefill/decode serving orchestration、KV data plane、fleet-level routing 和 deployment boundary。

所有 source snapshots、commit、checksum、claim status 和未解决问题见 [UBL128 V4 Pro Serving Techniques Evidence](../evidence/future-ubl128-v4-pro-serving-techniques.md)。

## How To Read This Page

先把目标和参考系分清楚：

```text
target system
  UBL128 HBD
  128 Ascend 950 NPU per HBD
  SU for tight NPU collectives inside one HBD
  SO for cross-HBD / NPU-CPU / NPU-SSU hot data plane
  DCN/RoCE for external ingress, ops, CPU-only services
  SSU for persistent KV / prefix blocks
  simpler distributed runtime as the programmable execution substrate

reference systems
  TensorRT-LLM: single-engine runtime, kernels, KV cache, TP/PP/EP/DP/CP, disaggregated serving
  Megatron Core: explicit TP/PP/CP/EP/DP process groups and MoE communication
  Dynamo: datacenter-scale routing, KV-aware scheduling, disaggregated prefill/decode pools
  NIXL: point-to-point inference transfer abstraction across GPU/CPU/storage memory
  Triton TensorRT-LLM backend: serving endpoint, inflight batching, MPI leader/orchestrator deployment
```

本页的核心结论是：UBL128 V4 Pro serving 不能只做一个 “remote `Worker.run()` over RPC”。它至少需要四层可组合机制：

1. `KernelRuntime`: 负责单 rank 内 kernel sequence、graph capture、stream/event、local KV page/block。
2. `ParallelGroupRuntime`: 负责 TP/PP/EP/DP/CP 这样的 rank group、collective、P2P 和 MoE token exchange。
3. `ServingRuntime`: 负责 prefill/decode pool、KV block manager、request lifecycle、prefill-to-decode handoff。
4. `FleetRuntime`: 负责 UBL128/PC16/SSU placement、router、planner、failure boundary、telemetry。

`simpler_distributed_runtime_design.md` 里的 `IWorker.run(payload)` 和 recursive `DistWorker` 可以作为底座，但不能独自表达所有 serving semantics。它需要长生命周期的 worker group、异步 request lifecycle、rank topology、KV block ownership 和 data-plane transport domain。

## UBL128 Target In One Picture

`UBL128_serving.md` 的大规模场景 C 是目标锚点：一个 UBL128 HBD 做 prefill，一个 UBL128 HBD 做 decode，12 个 SSU12 frame 提供 144 个 SSU，服务入口和 KV Meta server 由 CPU 服务器承担。简化图如下：

```text
external users
    |
    | HTTP/gRPC over DCN
    v
F: access / router / scheduler CPU
    |
    | PrefixMatch / Dispatch metadata
    | hot control over SO uRPC / Urma
    v
M: KV Meta CPU
    |
    | ChunkRecord / LBA / prefix metadata
    v
S: SSU storage on SO

prefill UBL128 HBD                         decode UBL128 HBD
  128 NPU, SU internal collectives           128 NPU, SU internal collectives
  PN ranks compute prompt KV                 DN ranks read KV and stream tokens
      |                                             ^
      | KV write/read over SO Urma                  |
      +------------------- SSU / SO ----------------+
```

三个网络不能混用：

```text
SU
  inside one UBL128 HBD
  NPU-to-NPU
  EP/DP/TP-like tight collective and all-to-all traffic

SO
  across HBD, CPU, NPU, SSU
  uRPC over UB Urma and direct KV / tensor data plane
  prefill-to-decode handoff, KV read/write, prefix sharing

DCN/RoCE
  CPU-visible external/control/ops plane
  HTTP, gRPC, JSON, POSIX/object storage outside KV hot path
```

这意味着 UBL128 的 runtime design 必须把 “control RPC protocol” 和 “data transport domain” 放进类型系统或配置系统里。一个 request 不能只带 `endpoint`。它至少要知道本次通信属于 external control、hot control、KV transfer、model collective、operator input/output 还是 telemetry。

## What NVIDIA Stacks Teach

### TensorRT-LLM: Engine Runtime Is More Than A Kernel Launcher

TensorRT-LLM 的价值在于把 LLM inference engine 拆成几类稳定问题：parallel strategy、paged KV cache、request scheduler、disaggregated KV transfer、compiled/fused kernels 和 serving API。它不是只把一个 GEMM kernel launch 出去，而是在每个 decode iteration 中同时处理 batch packing、KV block allocation/reuse、attention/MoE/GEMM kernel sequence、collective synchronization 和 result streaming。

可以用下面的 source-shaped pseudocode 读它的运行形态：

```text
while engine_has_work:
  ready = scheduler.pick_requests(
    queue,
    kv_cache_capacity,
    max_num_tokens,
    max_batch_size,
    policy = max_utilization | guaranteed_no_evict
  )

  kv_blocks = kv_cache_manager.allocate_or_reuse(ready)
  metadata = build_attention_and_moe_metadata(ready, kv_blocks)

  launch attention / GEMM / MoE / sampler kernels
  run TP / EP / PP communication where the model shard requires it
  append new KV blocks
  stream generated tokens and update request state
```

TensorRT-LLM 的 `parallel-strategy.md` 把 inference parallelism 分成 TP、PP、DP、EP、CP 和 Wide-EP。对 UBL128 最重要的是两点。

第一，parallelism 是 module-level decision，而不是全局唯一开关。Attention 可以走 TP 或 attention-DP；MoE FFN 可以走 TP、EP 或 hybrid ETP；超长 context 可以考虑 CP；decode throughput 可以依赖 DP。UBL128 的配置也不能只写一个 `parallel_size=128`。它需要按 attention、MoE、KV、prefill、decode 选择不同 group。

第二，MoE serving 的瓶颈不只是专家 GEMM。对 DeepSeek-like MoE，token router、token dispatch/combine、expert load imbalance、top-k fusion、all-to-all 和 small-message latency 都会决定性能。TensorRT-LLM 的 Wide-EP 文档把 “expert slot” 和 “expert id” 分离，这对 UBL128 很关键：模型里的 expert 是语义对象，运行时里的 slot 是 placement object。后续 `simpler` 不应该把 expert id 直接等同于 physical NPU id。

### Megatron Core: Large-Domain Synchronization Starts With Process Groups

Megatron Core 的启发不是 “serving 应该照搬 training schedule”，而是它清楚地把并行域显式化：TP group、PP group、CP group、EP group、DP group 都是 rank 的集合。每个 group 有自己的 collective pattern。

```text
global ranks
  |
  +-- tensor parallel group
  |     split one layer's matrices / attention heads
  |     synchronize by all-reduce / all-gather / reduce-scatter
  |
  +-- pipeline parallel group
  |     split layers by depth
  |     synchronize by send_forward / recv_forward P2P
  |
  +-- expert parallel group
  |     split MoE experts
  |     synchronize by token dispatch / combine all-to-all
  |
  +-- context parallel group
  |     split sequence/context dimension
  |     synchronize attention metadata and sequence shards
  |
  +-- data parallel group
        replicate model or sub-model
        route independent requests or training batches
```

这对 `simpler` 的 lesson 很直接：`DistWorker(level=4)` 不能只持有一串 child workers。它还要持有 rank topology 和 group membership。一个 child worker 可能同时属于 `tp_group=0`、`ep_group=3`、`hbd=decode-0`、`transport_domain=SU`。调度时传入的也不只是 callable，而是 “在哪个 group 上执行哪个 fragment，并在 fragment 内执行哪些 collectives”。

Megatron 的 MoE 代码和文档还说明，MoE 通信不是普通 RPC。EP token dispatcher 需要根据 router output 把 tokens 发送到拥有目标 experts 的 ranks，再把 expert output combine 回原 token order。这个过程在高性能实现里通常是 all-to-all 或 fused all-to-all，并且需要处理动态 token counts。UBL128 的 SU 网络正是应该优先服务这种通信的地方。

### Dynamo: Serving Orchestration Is A Separate Layer

Dynamo 的核心定位是 “orchestration layer above inference engines”。它不替代 TensorRT-LLM、vLLM 或 SGLang，而是给多节点 serving 加上 frontend、router、planner、KV-aware routing、disaggregated prefill/decode、KVBM 和 deployment recipes。

这对 UBL128 很重要，因为 `UBL128_serving.md` 已经不是单 engine 问题。它有 F、M、PC、PN、DC、DN、S 七类角色：

```text
F  access / scheduler / tokenizer / external endpoint
M  KV Meta / prefix radix tree / ChunkRecord / LBA allocation
PC prefill CPU controller
PN prefill NPU ranks
DC decode CPU controller
DN decode NPU ranks
S  SSU storage
```

Dynamo 的 DeepSeek-V4-Pro recipe 给出一个近似的 serving lesson：超大 MoE 模型可能需要把 aggregated serving 和 disaggregated prefill/decode 都作为部署形态；prefill/decode 可以用不同 parallel strategy；GB200 上的 recipe 明确出现 TP=8、Expert Parallel、DP=8 + EP、NIXL KV transfer、MNNVL/NVLink72 placement 和 Kubernetes ComputeDomain。UBL128 不会使用这些 NVIDIA 设施，但它同样需要：

```text
request router
  chooses prefill/decode worker group
  considers KV prefix state and worker load

prefill worker group
  computes prompt KV
  writes KV blocks to shared data plane
  returns handoff metadata

decode worker group
  retrieves KV blocks
  runs token-by-token decode
  streams output

planner / placement
  decides how many prefill/decode groups exist
  respects topology and data-plane capacity
```

这个分层也能防止 `simpler` 设计过重。`simpler` 不一定要内置完整 Dynamo-like fleet platform，但它必须暴露足够清楚的 runtime primitives，让上层 serving system 可以安全地实现这个 orchestration。

### NIXL: KV/Data Plane Needs Registered Memory And Metadata

NIXL 的抽象对 UBL128 非常贴近：它把 inference data plane 看成跨 CPU/GPU/storage memory 的 point-to-point transfer，并把 backend、memory section、metadata handler 分开。NIXL 不是 serving scheduler。它假设有 conductor process 负责用户请求、内存分配和 metadata side channel。

UBL128 的 SO/Urma/SSU data plane 也应该这样分层：

```text
Serving conductor
  knows request id, prefix id, worker group, KV block ids
  exchanges metadata through F/M/PC/DC control path

Transfer agent
  knows registered memory regions and remote descriptors
  posts async read/write/notification
  checks completion without owning model semantics

Transport backend
  implements SO Urma, SU local collective, DCN fallback, SSU LBA path
```

最关键的 rule 是：memory registration 和 remote metadata exchange 应该尽量在 initialization 或 long-lived session 阶段完成，不应该每个 token、每个 layer、每个 request 都重新注册内存。这一点和 PR #711 当前 host-memory `TensorPool` prototype 的方向一致，但 UBL128 需要把它提升为生产级：long-lived pools、lease/refcount、remote descriptor cache、abort semantics、completion notification 和 telemetry。

### Triton TensorRT-LLM Backend: Endpoint Is Not The Runtime

Triton TensorRT-LLM backend 说明了另一个边界：对用户暴露的 server、model repository、ensemble、preprocessing/postprocessing 和 inflight batching，是 serving endpoint 层；真正的 model execution 仍由 TensorRT-LLM runtime 和 MPI rank group 驱动。

这对 UBL128 的 lesson 是：`F` 可以暴露 HTTP/gRPC/OpenAI-compatible endpoint，但不要让 endpoint layer 直接承载 kernel orchestration。endpoint 应该只做 request validation、tokenization/detokenization、streaming、load balancing 和 cancellation。它向下调用的是 serving/runtime API：

```text
external endpoint
  parse request
  assign request_id
  call serving runtime
  stream tokens

serving runtime
  place prefill/decode
  manage KV handoff
  handle cancellation and failure

engine / group runtime
  launch kernels
  run collectives
  update KV blocks
```

## Kernel Composition From One Device To Hundreds

### Single Device

单 device 上，kernel composition 的主要问题是 sequence：embedding、attention projection、attention kernel、KV append、MLP/MoE、norm、logits、sampler 等算子如何在 stream 上排布，哪些 kernel 可以 fuse，哪些 decode shapes 可以 capture 成 graph，KV page/block 如何定位。

```text
one rank decode step
  read token ids and position
  prepare attention metadata
  launch attention projections
  read old KV pages, append new KV
  launch attention kernel
  launch MoE router
  launch expert GEMM or local expert kernels
  launch logits / sampler
  write next token
```

`simpler` 今天更接近 task/kernel execution substrate。要支撑 V4 Pro serving，它需要把 “单 operator callable” 升级为 “engine fragment”：一个 fragment 内可以有多个 kernels、临时 buffers、metadata preparation、stream/event dependency 和 optional graph capture。

### Tensor Parallel

TP 把同一个 layer 的权重和中间张量切到多个 ranks。典型形态是 column/row parallel linear、attention heads 分片，以及若干 all-reduce/all-gather/reduce-scatter。

```text
TP group of 8 ranks
  each rank owns 1/8 of projection weights
  each rank computes local GEMM
  collective combines partial result
  next kernel sees a logically complete tensor
```

在 UBL128 上，TP-like traffic 如果发生在同一个 HBD 内，应该走 SU。它要求 runtime 知道 `tp_group` 的 ranks 是否完全位于同一个 HBD。跨 HBD 做 TP 会把 tight collective 推到 SO，可能破坏 KV traffic 和 prefill/decode handoff 的带宽预算。

### Pipeline Parallel

PP 把 layers 按深度切到 stages。推理时它可以让大模型放进更多设备，但会引入 activation P2P、stage bubble、microbatch scheduling 和 failure propagation。

```text
stage 0 layers 0..15   --activation--> stage 1 layers 16..31
stage 1 layers 16..31  --activation--> stage 2 layers 32..47
stage 2 layers 32..47  --activation--> stage 3 layers 48..63
```

对于 UBL128，PP 更适合跨 PC16 或跨 HBD 的 “层级分段”，但 decode latency 会被 stage hops 放大。V4 Pro serving 是否采用 PP，要看模型尺寸、HBM、KV cache 和 latency 目标，不能从 NVIDIA recipe 直接复制。

### Expert Parallel

EP 是 DeepSeek-like MoE 的中心问题。Router 为每个 token 选择 top-k experts，runtime 将 token hidden states 送到拥有这些 experts 的 ranks，执行 expert GEMM，再把输出 combine 回原 token order。

```text
tokens on all ranks
  |
  | router: token -> expert ids
  v
dispatch all-to-all over EP group
  |
  | local expert grouped GEMM
  v
combine all-to-all over EP group
  |
  v
tokens restored in original logical order
```

这里需要四类 metadata：token-to-expert mapping、per-destination token counts、expert placement table、combine order。它们都不能临时靠 Python list 拼出来后用普通 RPC 广播。高性能 serving 需要在 runtime 层准备 compact metadata，并让 communication kernel 和 expert kernel 直接消费。

### Disaggregated Prefill/Decode

Prefill 负责长 prompt 的 KV 生成，decode 负责 token-by-token generation。两者的 compute shape 不同：prefill 更像大 batch、大 sequence、吞吐导向；decode 更像小步迭代、latency/TPOT 导向。Disaggregated serving 的核心不是 “两个服务进程”，而是稳定的 KV handoff。

```text
prefill request
  compute missing prefix KV
  write KV blocks to data plane
  return ctx_params / ChunkRecord-like handoff metadata

decode request
  receive handoff metadata
  map logical tokens to KV blocks
  request / read needed KV blocks
  start decode only after required KV is complete
```

UBL128 已经把这个 handoff 设计成 KV Meta + SSU + SO path。`simpler` 需要提供的不是 `memcpy`，而是可审计的 KV lifecycle：block id、prefix hash、layer id、chunk id、owner、lease、refcount、completion、eviction、failure recovery。

## Large-Domain Synchronization Model

几百个 devices 的同步不能靠一个全局 barrier。更合理的模型是分层同步：

```text
inside one rank
  stream/event dependency
  graph capture boundary
  local memory allocator / KV page state

inside one parallel group
  TP all-reduce / all-gather
  EP all-to-all dispatch/combine
  PP send/recv activation
  group-local error and timeout

between prefill and decode groups
  KV block completion
  handoff metadata durability
  transfer completion notification
  cancellation / lease release

between serving components
  router placement
  health heartbeat
  metrics and planner decisions
  topology-aware scale up/down
```

这也是 `simpler` 当前 `IWorker.run(payload)` 的边界。Blocking `run()` 很适合表达 local task completion，但 LLM serving request 是 streaming lifecycle：一个 request 在 prefill 完成、KV transfer 完成、decode 每步产生 token、用户取消、worker failure、KV lease release 等节点都有状态变化。未来 runtime 可以保留 blocking `run()` 作为 fragment primitive，但 serving 层需要 async request object。

## Lessons For Simpler Distributed Design

### Lesson 1: Keep Worker Isomorphism, Add Worker Group Semantics

`simpler_distributed_runtime_design.md` 的优点是统一：`ChipWorker`、`SubWorker`、`DistWorker` 都实现 blocking `run(payload)`。这个抽象仍然应该保留，因为它让 L2/L3/L4 递归组合有一致接口。

但 UBL128 serving 的最小执行单元不是单个 worker，而是 worker group：

```text
DistWorkerGroup
  group_id
  role = prefill | decode | kv_meta_client | storage_client
  ranks = [rank0, rank1, ...]
  topology = HBD / PC16 / NUMA / NPU ids
  groups = TP / EP / PP / DP / CP memberships
  transports = SU / SO / DCN capabilities
  lifecycle = init, warmup, drain, shutdown
```

一个 `Worker.run(payload)` 可以运行一个 fragment；一个 `WorkerGroup.run_plan(plan)` 才能表达多 rank collectives、KV handoff 和 serving lifecycle。

### Lesson 2: Separate Execution Plan From Transport Plan

Future `simpler` 不应该让 operator code 直接选择 socket、Urma endpoint 或 SSU LBA。更好的形态是两张 plan：

```text
ExecutionPlan
  model layer fragments
  kernel sequence
  rank group per fragment
  dependencies and output tensors

TransportPlan
  logical tensor / KV block movement
  source and destination memory spaces
  transport domain = SU | SO | DCN | SHM
  completion and retry semantics
```

这样才能满足 UBL128 的硬约束：EP/DP/TP tight collectives 优先 SU；KV and prefill/decode handoff 走 SO；external RPC 和运维走 DCN；SSU 只承载 KV/prefix block，不混入普通 POSIX filesystem。

### Lesson 3: Make KV Block Manager A First-Class Runtime Object

UBL128 design 中的 `KV Meta server`、prefix radix tree、`ChunkRecord`、SSU LBA 和 V4 Hybrid Attention chunking，本质上就是一个 production KV Block Manager。它不应该只是 serving 应用的一堆 Python dict。

`simpler` 需要能表达：

```text
KVBlock {
  model_id
  request_id
  prefix_hash
  layer_id
  chunk_id
  attention_kind = CSA | HCA | other
  token_range
  storage_location = HBM | host | SSU_LBA
  owner_group
  lease_state
  completion_state
}
```

NVIDIA 体系里的 KV cache reuse、paged KV、KVBM、NIXL transfer 都指向同一个 lesson：KV 是 serving runtime 的核心数据结构，不是 attention kernel 的内部临时 buffer。

### Lesson 4: Make MoE Dispatch Visible In The Runtime

DeepSeek V4 Pro 是 MoE 模型。对 MoE，runtime 如果只看到 “run FFN” 就太晚了。它需要看到 router output、expert placement、token counts、communication domain 和 grouped GEMM shapes。

```text
MoEFragment
  router_kernel
  token_to_expert metadata
  expert_slot_table
  dispatch_collective
  local_grouped_gemm
  combine_collective
```

这能让 UBL128 runtime 做三件事：把 all-to-all 放到 SU；把 hot experts 的 placement 和 slot replication 做成配置/计划；把 communication overlap 和 expert GEMM overlap 留给底层 kernel/runtime。

### Lesson 5: Treat Prefill/Decode Handoff As A Protocol

Prefill-to-decode handoff 不是单个 `send_tensor`。它至少包括：

```text
handoff metadata
  global request id
  logical token ranges
  KV block ids
  per-layer chunk locations
  data-plane endpoint descriptors
  completion fences
  lease / refcount owner
  failure and cancellation action
```

TensorRT-LLM disaggregated serving 里的 `ctx_params`、global request id 和 KV transfer overlap，NIXL 的 metadata exchange，以及 UBL128 的 `ChunkRecord` 都说明：handoff metadata 必须可追踪、可重试、可释放。它不能只依赖 “prefill 进程返回了一个本地 pointer”。

### Lesson 6: Build Hierarchical Scheduling, Not One Giant Scheduler

UBL128 scenario C 有 256 NPU 用于 prefill/decode，另有 SSU、CPU router、KV Meta server。一个单体 scheduler 很难同时决定 token batch packing、EP all-to-all timing、KV LBA placement、SSU queueing、fleet scale 和 HTTP streaming。

更合理的 hierarchy 是：

```text
F / fleet scheduler
  choose prefill group, decode group, priority, routing

ServingRuntime per group
  manage request queue, batching, cancellation, handoff

ParallelGroupRuntime
  manage rank groups, collectives, P2P, group-level failure

KernelRuntime per rank
  launch kernels, manage stream/event, local memory, graph cache
```

`simpler` 的 scheduler 可以成为 `ParallelGroupRuntime` 和 `KernelRuntime` 的一部分；上层 serving scheduler 不应该塞进当前 L3 scheduler thread。

## Concrete Upgrade Plan For Future Simpler Work

这不是本 PR 要实现的代码，而是后续 design/implementation 的 decomposition。

### Slice 1: Group Runtime Skeleton

目标是让 `simpler` 能描述一组 ranks 和它们的 topology。

```text
WorkerGroupConfig:
  role: prefill
  ranks:
    - host: pc16-0
      device: npu0
      hbd: ubl128-a
      su_domain: a
  parallel_groups:
    tp: [[0,1,2,3,4,5,6,7]]
    ep: [[0,1,2,3,4,5,6,7]]
  transports:
    collective: SU
    kv: SO
    external_control: DCN
```

验收标准不是性能，而是 plan 可以阻止错误配置：例如 tight EP group 跨了不允许跨的 domain，KV path 被误配置到 DCN，或者 business code 硬编码了 SSU endpoint。

### Slice 2: KV Block Metadata Prototype

目标是把 `KVBlock` / `ChunkRecord` 做成 runtime-facing schema，并能在 fake backend 上完成 prefill-write、decode-read 和 lease release。

```text
prefill:
  allocate KV blocks
  write fake bytes
  mark complete

decode:
  resolve prefix
  acquire lease
  read fake bytes
  release lease
```

这个 slice 应先跑在 host memory/fake SSU 上，再接 SO/Urma/SSU。不要一开始就绑定真实硬件。

### Slice 3: MoE Dispatch Metadata Slice

目标是让 runtime 显式接收 router output，并生成 token dispatch metadata。

```text
input: token_to_expert = [[3, 17], [8, 9], ...]
placement: expert_id -> rank / slot
output:
  per_destination_counts
  send_offsets
  combine_order
```

这可以先在 CPU 或 PyTorch mock 上验证，再映射到 SU communication primitive。

### Slice 4: Disaggregated Prefill/Decode Mini Serving

目标是最小可运行 serving lifecycle：

```text
HTTP/gRPC test frontend
  -> prefill group fake engine
  -> KV block manager
  -> decode group fake engine
  -> streaming tokens
```

这一步必须支持 cancellation、timeout、request id、handoff metadata dump 和 telemetry。没有这些，就不能安全扩到 UBL128。

### Slice 5: Transport Domain Backend

目标是把 `TransportPlan` 接到真实或近真实 backend：

```text
SHM backend for local tests
RoCE/RDMA backend for host-host prototype
SO/Urma backend for UBL128 target
SSU LBA backend for KV persistence
```

这里可以借鉴 NIXL 的分层，但接口要服从 UBL128 的 UB/Urma/SSU 语义。

## Status Boundary

本页的 NVIDIA-side claims 是 source-survey claims：它们来自 2026-05-10 克隆的 upstream repositories 和本仓库 materials，不代表本 PR 在本地运行了这些框架，也不代表 UBL128 已经实现对应能力。

本页对 `simpler` 的结论是 `design-intended` / `recommendation`，不是 implemented state。当前 `simpler` foundation 仍以 existing wiki repository/topic pages 和 `simpler_distributed_runtime_design.md` 为准。PR #711 remote L3 / data-plane prototype 的状态见 [PR 711 Remote Dispatch and Data Plane Primer](./pr711-grpc-dispatch-primer.md) 和 [Runtime Dispatch and Serving Roadmap](./runtime-dispatch-and-serving-roadmap.md)。

## Open Questions

- V4 Pro 在 UBL128 上的真实 operator list、attention kernel shape、MoE expert count、routing policy 和 precision policy，需要从模型实现和平台 kernel 计划继续确认。
- UBL128 material 中 NPU direct SSU read/write 与 CPU/agent LBA client 的边界需要进一步定稿；production KV path 不应在 wiki 中被写成已经解决。
- `simpler` 应该内置多少 serving orchestration，多少交给外部 serving platform，需要单独设计。当前建议是让 `simpler` 提供 worker group、plan、KV/data-plane primitives，而不是直接复制 Dynamo。
- Blocking `IWorker.run(payload)` 如何和 streaming decode、cancellation、handoff completion、partial failure 共存，需要新的 async request lifecycle 设计。
- SU/SO/DCN 的性能模型和 admission control 尚未建立。没有这个模型，就无法判断 TP/EP/PP/DP 的最佳 group shape。

## What To Remember

UBL128 V4 Pro serving 是四层系统，不是一个 RPC feature：kernel runtime 负责单 rank 内执行，parallel group runtime 负责 collectives 和 rank synchronization，serving runtime 负责 prefill/decode 与 KV lifecycle，fleet runtime 负责 placement、routing 和 health。`simpler` 的 recursive worker model 是好底座，但必须补上 worker group、execution plan、transport plan、KV block manager、MoE dispatch metadata 和 async serving lifecycle，才能面向 UBL128 HBD 上的大模型 serving。
