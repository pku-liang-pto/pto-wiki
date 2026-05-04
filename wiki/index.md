---
title: "PTO-CANN Toolchain Wiki"
type: index
status: draft
sources:
  - config/target-set.yml
last_updated: 2026-05-05
---

# PTO-CANN Toolchain Wiki

这是 PTO-CANN target set 的公开学习入口。它把 PyPTO、PTO-ISA、simpler 和相关 CANN 通信材料组织成可直接阅读的知识层：先讲概念和例子，再用源码、PR、issue、材料和 evidence ledger 支撑审计。

## Start Here

```text
Concepts
  -> Examples
  -> Repository profiles
  -> Topics
  -> Materials / evidence when auditing
```

- 新读者先看 [Basic Terms](./concepts/basic-terms.md)，再看 [Examples](./examples/)。
- 想理解代码归属：读 [Repositories](./repositories/)，尤其 [simpler](./repositories/simpler.md)、[pto-isa](./repositories/pto-isa.md)、[pypto](./repositories/pypto.md)。
- 想理解执行路径：读 [Non-Distributed Execution](./topics/non-distributed-execution.md)，再读 [Distributed Execution](./topics/distributed-execution.md)。
- 想核对原始材料：读 [Materials](./materials/)。

## Public Areas

- [Repositories](./repositories/): 仓库角色、架构边界、代表性入口。
- [Examples](./examples/): 从 hello/add 到 LLaMA mini、L3 allreduce、missing distributed NN 的示例学习路径。
- [Topics](./topics/): execution flow、runtime architecture、distributed execution、level map、maintainer guide。
- [Concepts](./concepts/): 基础术语、CANN foundation、distributed terminology。
- [Materials](./materials/): 用户提供材料的公开原文，用于审计和追溯。
