---
title: "Glossary"
type: concept
status: draft
sources:
  - wiki/concepts/basic-terms.md
  - wiki/concepts/distributed-execution-terms.md
  - wiki/concepts/cann-foundation.md
last_updated: 2026-05-05
---

# Glossary

本页是快速查词入口。较长解释请读 [Basic Terms](./concepts/basic-terms.md)、[Distributed Execution Terms](./concepts/distributed-execution-terms.md) 和 [CANN Foundation](./concepts/cann-foundation.md)；这里保留短定义和 canonical link，帮助读者在长章节中快速回到正确概念层。

| Term | Meaning | Source |
| --- | --- | --- |
| PTO | 本 target set 中围绕 PyPTO language/compiler/runtime、PTO-ISA kernel layer 和 supporting runtime projects 的项目族。 | [Projects](./projects.md), [Overview](./overview.md) |
| PyPTO | Python DSL、IR、pass、codegen 和 runtime-facing API。 | [pypto](./repositories/pypto.md) |
| PTO-ISA | 面向 tile 的 virtual ISA / C++ tile library，用于 kernel-level load/store/compute/communication。 | [pto-isa](./repositories/pto-isa.md) |
| simpler | PTO runtime implementation，负责 L2 chip launch 和 L3 host orchestration。 | [simpler](./repositories/simpler.md) |
| Lingqu | PyPTO/top-level design documents 使用的 hierarchical runtime design language，用于 L0-L6 mapping。 | [Lingqu Level Map](./topics/lingqu-level-map.md) |
| Ascend | CANN/PTO examples 面向的 Huawei AI accelerator platform family。 | [Basic Terms](./concepts/basic-terms.md) |
| AICPU | `simpler` L2 launch path 中的 device-side scheduler/control CPU。 | [Basic Terms](./concepts/basic-terms.md) |
| AICore / AIV | 执行 PTO-ISA kernels 的 device compute resources。 | [Basic Terms](./concepts/basic-terms.md) |
| CANN | 本 target set 中 Ascend software stack 的上下文，覆盖 communication、memory、interconnect 和 recipes。 | [CANN Foundation](./concepts/cann-foundation.md) |
| HCCL | CANN collective communication library；本 wiki 中作为 data-plane/window supporting evidence，不是 runtime control plane。 | [CANN Foundation](./concepts/cann-foundation.md), [Distributed Execution](./topics/distributed-execution.md) |
| HCOMM | 材料中出现的 lower-level communication/transport term；本 wiki 当前仍为 `open question`。 | [CANN Foundation](./concepts/cann-foundation.md) |
| URMA / RoCE | future distributed runtime paths 相关的 remote memory/network data movement 方向。 | [Distributed Execution Terms](./concepts/distributed-execution-terms.md) |
| TensorMap | `simpler` runtime dependency map，记录 tensor producers 并连接后续 consumers。 | [Basic Terms](./concepts/basic-terms.md) |
| Ring buffer | `tensormap_and_ringbuffer` 中管理 task/output/dependency queues 的 runtime storage pattern。 | [Basic Terms](./concepts/basic-terms.md) |
| Target set | `config/target-set.yml` 配置的 repository 和 concept 集合，是本 wiki 的文档对象。 | `config/target-set.yml` |
| Repository profile | 解释一个 repository 的 role、structure、dependencies、entry points 和 open questions 的 wiki page。 | [Repository Profiles](./repositories/) |
