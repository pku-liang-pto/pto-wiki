---
title: "Concepts"
type: index
status: draft
sources: []
last_updated: 2026-05-05
---

# Concepts

Concepts 是读 PTO-CANN wiki 时反复需要的基础词典和短教材。它不是完整 API reference，而是帮助读者先把几个层次分清：PyPTO 的语言/IR 词，PTO-ISA 的 tile/kernel 词，`simpler` 的 runtime/scheduler 词，以及 CANN/HCCL 的 supporting substrate 词。

## Pages

- [Basic Terms](./basic-terms.md): 非分布式阅读路径中的 PyPTO、PTO-ISA、tile、runtime 和 L2 launch 基础术语。
- [Distributed Execution Terms](./distributed-execution-terms.md): 分布式 runtime 文档中的标准术语和状态标签。
- [CANN Foundation](./cann-foundation.md): CANN/HCCL/HCOMM/SHMEM/HIXL 在本 wiki 中的支撑层定位和当前覆盖限制。

## Reading Hint

如果一个词在多个仓库里长得很像，先判断它属于哪一层。`InCore`、`Orchestration` 和 `CompiledProgram` 属于 PyPTO 语言/编译链；`Tile`、`TLOAD`、`TSTORE`、`TPUT`、`TGET` 属于 PTO-ISA kernel 层；`Worker(level=3)`、`TaskArgs`、TensorMap、ring buffer 属于 `simpler` runtime 层。这个分层比词面更重要。
