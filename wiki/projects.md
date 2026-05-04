# Projects

This page lists the current PTO-CANN target repositories. Roles are intentionally brief until each repository receives a documentation pass.

## PTO

| Repository | Role |
| --- | --- |
| [pypto_top_level_documents](https://github.com/hengliao1972/pypto_top_level_design_documents) | Top-level PTO design documents. |
| [serving-lib](https://github.com/hengliao1972/pypto-serving) | PTO serving library. |
| [pto-li](https://github.com/hw-native-sys/pypto-lib) | PTO library project. |
| [pypto](https://github.com/hw-native-sys/pypto/) | PTO implementation project. |
| [ptoas](https://github.com/zhangstevenunity/PTOAS) | PTOAS project. |
| [pto-isa](https://github.com/PTO-ISA/pto-isa) | PTO ISA project. |
| [simpler](https://github.com/hw-native-sys/simpler) | Supporting project in the PTO target set. |
| [distributed-runtime](https://github.com/hengliao1972/pypto_runtime_distributed) | Distributed PTO runtime. |

## CANN

| Repository | Role |
| --- | --- |
| [hcomm](https://gitcode.com/cann/hcomm) | CANN communication project. |
| [hccl](https://gitcode.com/cann/hccl) | CANN collective communication project. |
| [shmem](https://gitcode.com/cann/shmem) | CANN shared memory project. |
| [hixl](https://gitcode.com/cann/hixl) | CANN transfer or interconnect project. |
| [cann-recipes-infer](https://gitcode.com/cann/cann-recipes-infer) | CANN inference recipe project. |

## Documentation Status

Profile status below indicates how much source-backed wiki coverage exists for each configured repository.

| Repository | Profile status | Inspected ref / confidence | Next documentation need |
| --- | --- | --- | --- |
| `simpler` | [profiled](./repositories/simpler.md) | commit `5029466197ab26cdef80c34b5d2cdcfca86b71d7`; high for L2/L3 local runtime | add future remote-L3 updates when source lands |
| `pto-isa` | [profiled](./repositories/pto-isa.md) | commit `a977dd1161222a8b779fb5ff5d1c8b7f4518c3a2`; high for tile/comm examples | deepen CPU/manual kernel and roadmap coverage |
| `pypto` | [profiled](./repositories/pypto.md) | commit `f21c2dd48cfe1e5c4add78b0e391a31196420862`; high for DSL/compile/L3 runner | update when distributed API issues close |
| `pypto_top_level_documents` | evidence-only | `linqu_runtime_design.md` at commit `7faac0b910e40989a6bbd381a80595b65ab29708`; partial | create a standalone concept/profile if top-level design docs become primary learning material |
| `distributed-runtime` | not profiled | material mentions only; low | inspect repo before assigning remote L3 ownership |
| `serving-lib`, `pto-li`, `ptoas` | not profiled | target-set config only; low | document only when serving/library/toolchain questions require them |
| `hccl` | partial evidence | `master` commit `e8c897660d2afd02b1428b1daa2ce9576f00a5cd`; partial for communication support | create CANN communication profile if data-plane claims expand |
| `hcomm`, `shmem`, `hixl`, `cann-recipes-infer` | not profiled | target-set config/material mentions only; low | do not infer ownership or behavior without a dedicated pass |
