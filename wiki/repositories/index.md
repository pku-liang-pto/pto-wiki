---
title: "Repositories"
type: index
status: draft
sources:
  - config/target-set.yml
last_updated: 2026-05-05
---

# Repositories

本区只放已经完成 source-backed profile 的公开学习页。Repository profile 的任务不是列目录，而是讲清楚一个仓库在 PTO-CANN target set 中负责什么、读者应该先看哪些概念和例子、哪些能力已经实现、哪些判断仍然需要后续 evidence。

当前 profile 覆盖 PTO 核心三仓库：`pypto`、`pto-isa`、`simpler`。其他 target repositories 仍在 [Projects](../projects.md) 中保留状态，完成专门 source pass 前不会出现在公开 sidebar。

## Pages

- [simpler](./simpler.md): PTO runtime、hierarchical worker execution、L3 examples、HCCL window 支撑。
- [pto-isa](./pto-isa.md): PTO Tile Library、communication ISA、SDMA/URMA examples。
- [pypto](./pypto.md): Python DSL、distributed codegen、基于 simpler 的 L3 runner。

## Reading Order

如果你想知道“用户程序如何进入系统”，先读 [pypto](./pypto.md)。如果你想知道“kernel 内 load/compute/store/comm 如何表达”，读 [pto-isa](./pto-isa.md)。如果你想知道“runtime 如何启动 device、调度 task graph、管理 L3 worker”，读 [simpler](./simpler.md)，并继续读 [simpler Runtime Architecture](../topics/simpler-runtime-architecture.md)。
