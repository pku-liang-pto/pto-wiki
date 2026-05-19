---
title: "NVIDIA Distributed Communication Evidence"
type: evidence
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
last_updated: 2026-05-19
---

# NVIDIA Distributed Communication Evidence

This ledger supports [NVIDIA Distributed Communication](../topics/nvidia-distributed-communication.md). It records the official NVIDIA source set used for the multi-node, multi-GPU communication synthesis. Retrieved 2026-05-19.

## Source Set

| Source | Role |
| --- | --- |
| [CUDA Programming Guide: Programming Systems with Multiple GPUs](https://docs.nvidia.com/cuda/cuda-programming-guide/03-advanced/multi-gpu-systems.html) | CUDA multi-GPU process/thread/device model, P2P memory access, NVLink, IPC/VMM, NCCL/NVSHMEM/MPI positioning. |
| [NCCL Overview](https://docs.nvidia.com/deeplearning/nccl/user-guide/docs/overview.html) | NCCL definition, collective/P2P scope, topology-aware inter-GPU communication, supported interconnects. |
| [NCCL Collective Operations](https://docs.nvidia.com/deeplearning/nccl/user-guide/docs/usage/collectives.html) | Rank-level collective correctness requirement and allreduce semantics. |
| [GPU Operator: GPUDirect RDMA and GPUDirect Storage](https://docs.nvidia.com/datacenter/cloud-native/gpu-operator/22.9.1/gpu-operator-rdma.html) | GPUDirect RDMA definition and `nvidia-peermem` / Mellanox HCA GPU-memory access boundary. |
| [NVSHMEM Documentation](https://docs.nvidia.com/nvshmem/api/index.html) | NVSHMEM PGAS model and fine-grained GPU-GPU data movement API. |
| [IMEX Guide: Overview](https://docs.nvidia.com/multi-node-nvlink-systems/imex-guide/overview.html) | Multi-Node NVLink architecture, cross-OS-domain GPU memory export/import, IMEX role. |
| [GB200 NVL Multi-Node Tuning Guide: Communication Libraries](https://docs.nvidia.com/multi-node-nvlink-systems/multi-node-tuning-guide/ucx.html) | UCX primitives and GB200 Multi-Node NVLink versus InfiniBand path considerations. |
| [Mission Control High-Speed Fabric Management](https://docs.nvidia.com/mission-control/docs/systems-administration-guide/2.0.0/high-speed-fabric-management.html) | NVLink Domain, NVL72 default 72-GPU domain, user partition boundary. |

## Claim Map

| Claim ID | Topic claim | Evidence |
| --- | --- | --- |
| NVIDIA-COMM-001 | CUDA multi-GPU programming covers several host-thread/process models and includes multi-node NVLink-connected clusters. | CUDA guide lists single-thread, multi-thread, multi-process, and multi-node NVLink cluster models, and describes peer access, NVLink, IPC/VMM, NCCL/NVSHMEM/MPI support. |
| NVIDIA-COMM-002 | NCCL is a topology-aware inter-GPU communication library, not a full parallel programming framework. | NCCL overview says it provides collective and point-to-point primitives, supports PCIe/NVLink/InfiniBand Verbs/IP sockets, and is focused on accelerating inter-GPU communication. |
| NVIDIA-COMM-003 | NCCL collective correctness depends on every rank entering matching operations. | NCCL collective docs state each rank/CUDA device must call collectives with matching count and datatype, or undefined behavior can include hangs, crashes, or data corruption. |
| NVIDIA-COMM-004 | GPUDirect RDMA enables direct network-device access to GPU memory and depends on driver/kernel support. | GPU Operator docs describe GPUDirect RDMA as direct exchange between GPUs and peer devices over PCIe, and identify `nvidia-peermem` as enabling Mellanox InfiniBand HCA access to GPU memory. |
| NVIDIA-COMM-005 | NVSHMEM provides PGAS-style fine-grained GPU-GPU movement from CUDA kernels, streams, and CPU. | NVSHMEM docs define the OpenSHMEM model for clusters of NVIDIA GPUs and describe PGAS spanning GPU memory. |
| NVIDIA-COMM-006 | UCX is a lower-level communication substrate with get/put, send/receive, and active-message/RPC primitives across CPU/GPU endpoints. | GB200 tuning guide describes UCX primitives and notes multiple paths in GB200 environments, including Multi-Node NVLink and InfiniBand. |
| NVIDIA-COMM-007 | Multi-Node NVLink extends NVLink P2P across compute nodes/OS domains, but it is platform-specific and service-managed. | IMEX guide describes NVLink multi-node architecture and IMEX memory export/import orchestration; Mission Control docs describe NVL72 NVLink Domain and partitions. |

## Negative Findings

- No source in this pass supports treating NCCL as a complete distributed runtime scheduler or worker lifecycle manager.
- Multi-Node NVLink should not be generalized to ordinary NVIDIA clusters; official docs tie it to specific NVLink Network / NVL platforms, services, and partitioning.
- This pass did not inspect NVIDIA NCCL source code, performance whitepapers, vendor blogs, or non-NVIDIA third-party benchmark reports; the topic page intentionally stays at official documentation synthesis level.

## Status-Change Criteria

| Current claim boundary | Evidence needed to refine it |
| --- | --- |
| NCCL as data-plane communication library | Official NCCL docs or source-level investigation for a specific feature such as device-initiated communication, NVLS, CollNet, SHARP, or RAS behavior. |
| GPUDirect RDMA as direct GPU memory data path | Platform-specific driver/NIC/OFED/container documentation for the exact deployment. |
| Multi-Node NVLink as platform-specific capability | Exact system docs for the target hardware, including NVLink Domain, partition, IMEX, Fabric Manager, and job-launch requirements. |

## Open Questions

- Which NVIDIA platform generation is the intended comparison target for PTO-CANN: A100/H100 DGX-style IB cluster, GB200/GB300 NVL, or a generic PCIe GPU cluster?
- Does the PTO-CANN wiki need a deeper side-by-side page comparing NCCL and HCCL APIs, or is this platform overview sufficient for current distributed-runtime design work?
