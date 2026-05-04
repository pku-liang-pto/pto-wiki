# Glossary

This glossary grows as terms are encountered during lookup and repository documentation.

| Term | Meaning | Source |
| --- | --- | --- |
| PTO | Target-set family for the PyPTO language/compiler/runtime, PTO-ISA kernel layer, and supporting runtime projects. | [Projects](./projects.md), [Overview](./overview.md) |
| PyPTO | Python DSL, IR, pass, codegen, and runtime-facing API. | [pypto](./repositories/pypto.md) |
| PTO-ISA | Tile-oriented virtual ISA / C++ tile library for kernel-level load/store/compute/communication. | [pto-isa](./repositories/pto-isa.md) |
| simpler | PTO runtime implementation for L2 chip launch and L3 host orchestration. | [simpler](./repositories/simpler.md) |
| Lingqu | Hierarchical runtime design language used by PyPTO/top-level design documents for L0-L6 mapping. | [Lingqu Level Map](./topics/lingqu-level-map.md) |
| Ascend | Huawei AI accelerator platform family targeted by CANN/PTO examples. | [Basic Terms](./concepts/basic-terms.md) |
| AICPU | Device-side scheduler/control CPU in simpler L2 launch path. | [Basic Terms](./concepts/basic-terms.md) |
| AICore / AIV | Device compute resources that execute PTO-ISA kernels. | [Basic Terms](./concepts/basic-terms.md) |
| CANN | Huawei Ascend software stack context for communication, memory, interconnect, and recipes in this target set. | [CANN Foundation](./concepts/cann-foundation.md) |
| HCCL | CANN collective communication library; used here as data-plane/window supporting evidence, not runtime control plane. | [CANN Foundation](./concepts/cann-foundation.md), [Distributed Execution](./topics/distributed-execution.md) |
| HCOMM | Lower-level communication/transport term from materials; still `open question` in this wiki. | [CANN Foundation](./concepts/cann-foundation.md) |
| URMA / RoCE | Remote memory/network data movement direction for future distributed runtime paths. | [Distributed Execution Terms](./concepts/distributed-execution-terms.md) |
| TensorMap | simpler runtime dependency map that records tensor producers and connects later consumers. | [Basic Terms](./concepts/basic-terms.md) |
| Ring buffer | Runtime storage pattern for task/output/dependency queues in `tensormap_and_ringbuffer`. | [Basic Terms](./concepts/basic-terms.md) |
| Target set | The configured group of repositories and concepts documented by this reusable wiki template. | `config/target-set.yml` |
| Repository profile | A wiki page that explains one repository's role, structure, dependencies, entry points, and open questions. | `.agents/templates/repo-profile.md` |
