# Repository Profiles

Repository profiles are created after an agent performs a documentation pass on a target repository.

Each profile should explain:

- what the repository does
- where it fits in the target set
- important dependencies and build files
- source layout and major modules
- public entry points or APIs
- tests, examples, and scripts
- verified facts, inferred architecture, and open questions

Use `.agents/templates/repo-profile.md` when creating a new profile.

## Pages

- [simpler](./simpler.md): PTO runtime、hierarchical worker execution、L3 examples、HCCL window 支撑。
- [pto-isa](./pto-isa.md): PTO Tile Library、communication ISA、SDMA/URMA examples。
- [pypto](./pypto.md): Python DSL、distributed codegen、基于 simpler 的 L3 runner。
