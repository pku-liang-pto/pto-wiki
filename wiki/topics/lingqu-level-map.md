---
title: "Lingqu Level Map"
type: topic
status: draft
sources:
  - repositories/pypto_top_level_documents/linqu_runtime_design.md
  - repositories/pypto/include/pypto/ir/function.h
  - wiki/materials/pto-runtime-distributed/08_top_level_design_alignment.md
  - wiki/evidence/lingqu-level-map.md
last_updated: 2026-05-05
---

# Lingqu Level Map

本页把 top-level Lingqu runtime design、PyPTO `Level` enum 和 simpler worker 层级放在一张表里，避免把“代码里能表达的层级”和“runtime 已经可运行的层级”混为一谈。

## How To Read This Page

先把 level 当成三个不同来源的对齐问题：design 文档给出理想 hierarchy，PyPTO enum 给出语言/IR 可表达层级，`simpler` examples 和 runtime source 给出当前可运行层级。三者名字相似，但证据强度不同。本页的表格只在这段 prose 之后才有意义。

```text
Lingqu design level
  -> PyPTO Level enum / Role enum
  -> simpler Worker(level=N) execution evidence
  -> status label per level
```

## 层级映射

| Lingqu level | PyPTO level | runtime 读法 | 当前状态 |
| --- | --- | --- | --- |
| L0 | `AIV` / `AIC` / `CORE_GROUP` | InCore / tile-level kernel | `implemented` through PTO-ISA and PyPTO kernel path |
| L1 | `CHIP_DIE` | chip 内更高一级 scope | `implemented`/partial，具体边界依赖 runtime |
| L2 | `CHIP` | chip orchestration / next-level worker | `implemented` in simpler local hierarchy |
| L3 | `HOST` | host orchestrator + chip workers + SubWorkers | `implemented` for single-host path |
| L4 | `CLUSTER_0` | 多 host / first cluster layer | `design-intended` |
| L5 | `CLUSTER_1` | higher cluster layer | `design-intended` |
| L6 | `CLUSTER_2` | higher cluster layer | `design-intended` |
| L7-like | `GLOBAL` | global orchestration label in PyPTO enum | `open question` for runtime semantics |

## 设计文档判断

`linqu_runtime_design.md` 的核心倾向是 hierarchy symmetry、O(1) ring buffers、zero-config discovery、code/data residency、logical isolation 和 unified programming model。它还明确把 existing simpler runtime 的 L0-L2 能力视为固定能力，并把 first implementation 缩到 hardware Level 3。

因此，本轮 wiki 的层级判断是：

- L0-L3：可以写具体 repo 事实，但要区分 PTO-ISA kernel、simpler runtime 和 PyPTO DSL。
- L4-L6：只能写设计目标，不能写成当前实现。
- `GLOBAL`：PyPTO enum 存在，但 runtime 语义需要后续证据。

这些状态标签的证据边界见 [Lingqu Level Map Evidence](../evidence/lingqu-level-map.md#claim-map)。

## 术语对齐

| 术语 | 在本 wiki 中的标准读法 |
| --- | --- |
| `HostWorker` | L3 host-side orchestration worker；当前通常是 local process |
| `DistWorker` | 材料中的 remote/distributed worker 目标角色；当前未看到稳定实现 |
| `SubWorker` | 同层 Python callable worker；PyPTO role 和 simpler registration 都使用 |
| `Orchestrator` | 提交下一层或同层 SubWorker 任务的 control function |
| `next-level worker` | 当前层 Orchestrator 调用的下一级 worker；在 PyPTO codegen 中对应 `submit_next_level` |

## 风险

层级名很容易让读者误以为“enum 已存在 = runtime 已实现”。本 wiki 页面使用状态标签避免这个误读：PyPTO 的 `Level` enum 是表达能力，simpler examples 是执行能力，remote L4-L6 是目标能力。
