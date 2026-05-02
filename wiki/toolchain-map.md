# Toolchain Map

The PTO-CANN target set combines PTO projects, CANN projects, runtime components, communication libraries, serving components, and recipes.

## Current View

| Area | Current Repositories | Notes |
| --- | --- | --- |
| PTO design and ISA | `pypto_top_level_documents`, `pto-isa` | Design and instruction-set knowledge should be documented with direct source references. |
| PTO implementation and libraries | `pypto`, `pto-li`, `simpler` | Implementation relationships require repository documentation passes before this wiki states firm architecture. |
| Runtime and serving | `distributed-runtime`, `serving-lib`, `ptoas` | Runtime and serving roles should be expanded from source, examples, and design docs. |
| CANN communication and memory | `hcomm`, `hccl`, `shmem`, `hixl` | Dependency and interface relationships should be verified from upstream repos. |
| CANN recipes | `cann-recipes-infer` | Recipe pages should link concrete examples to the libraries and runtime behavior they exercise. |

## Documentation Rule

This map is a starting orientation. Do not treat it as a complete architecture description until the relevant repositories have been inspected and cited.
