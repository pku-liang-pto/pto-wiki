import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Toolchain Wiki',
  description: 'Reusable technical wiki template for a configured target set.',
  base: process.env.VITEPRESS_BASE ?? '/',
  cleanUrls: true,
  ignoreDeadLinks: [
    /^https:\/\/github\.com\//,
    /^https:\/\/gitcode\.com\//
  ],
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      {
        text: 'Repositories',
        items: [
          { text: 'simpler', link: '/repositories/simpler' },
          { text: 'pto-isa', link: '/repositories/pto-isa' },
          { text: 'pypto', link: '/repositories/pypto' }
        ]
      },
      {
        text: 'Examples',
        items: [
          { text: 'Examples index', link: '/examples/' },
          { text: 'PTO overview', link: '/examples/pto/' },
          { text: 'Hello / Elementwise', link: '/examples/pto/hello-elementwise' },
          { text: 'GEMM / FFN', link: '/examples/pto/gemm-ffn' },
          { text: 'Softmax / Attention', link: '/examples/pto/softmax-attention' },
          { text: 'Complete Models', link: '/examples/pto/complete-models' },
          { text: 'Distributed Runtime', link: '/examples/pto/distributed-runtime' },
          { text: 'Missing Roadmap', link: '/examples/pto/missing-roadmap' }
        ]
      },
      {
        text: 'Topics',
        items: [
          { text: '非分布式执行', link: '/topics/non-distributed-execution' },
          { text: 'Examples Feature Map', link: '/topics/examples-feature-map' },
          { text: 'simpler Runtime Architecture', link: '/topics/simpler-runtime-architecture' },
          { text: 'Distributed Execution', link: '/topics/distributed-execution' },
          { text: 'Lingqu Level Map', link: '/topics/lingqu-level-map' },
          { text: 'Developer Takeover Guide', link: '/topics/developer-takeover-guide' }
        ]
      },
      {
        text: 'Concepts',
        items: [
          { text: 'Basic Terms', link: '/concepts/basic-terms' },
          { text: 'CANN Foundation', link: '/concepts/cann-foundation' },
          { text: 'Distributed Terms', link: '/concepts/distributed-execution-terms' }
        ]
      },
      {
        text: 'Future',
        items: [
          { text: 'Future index', link: '/future/' },
          { text: 'PR 711 gRPC Dispatch Primer', link: '/future/pr711-grpc-dispatch-primer' },
          { text: 'Runtime Dispatch and Serving Roadmap', link: '/future/runtime-dispatch-and-serving-roadmap' }
        ]
      },
      {
        text: 'Materials',
        items: [
          { text: 'Materials Home', link: '/materials/' },
          { text: 'PTO Runtime Bundle Guide', link: '/materials/pto-runtime-distributed/' },
          { text: '00 Overview and Reading Paths', link: '/materials/pto-runtime-distributed/00_README' },
          { text: '01 Hardware, CANN, HCCL, RoCE', link: '/materials/pto-runtime-distributed/01_hardware_and_software_stack' },
          { text: '02 PTO-ISA and Runtime Basics', link: '/materials/pto-runtime-distributed/02_pto_isa_and_runtime_basics' },
          { text: '03 Distributed Runtime Blueprint', link: '/materials/pto-runtime-distributed/03_distributed_blueprint' },
          { text: '04 Feature Deep Dives', link: '/materials/pto-runtime-distributed/04_feature_deep_dives' },
          { text: '05 Progress and Timeline', link: '/materials/pto-runtime-distributed/05_progress_and_timeline' },
          { text: '06 Development Tasks', link: '/materials/pto-runtime-distributed/06_development_tasks' },
          { text: '07 Source and Evidence Notes', link: '/materials/pto-runtime-distributed/07_source_notes' },
          { text: '08 HostWorker / DistWorker Alignment', link: '/materials/pto-runtime-distributed/08_top_level_design_alignment' },
          { text: 'Document System Design', link: '/materials/pto-runtime-distributed/PTO-Runtime分布式拓展文档系统设计' }
        ]
      }
    ],
    sidebar: [
      {
        text: 'Home',
        items: [
          { text: 'Public entry', link: '/' }
        ]
      },
      {
        text: 'Repositories',
        items: [
          { text: 'simpler', link: '/repositories/simpler' },
          { text: 'pto-isa', link: '/repositories/pto-isa' },
          { text: 'pypto', link: '/repositories/pypto' }
        ]
      },
      {
        text: 'Examples',
        items: [
          { text: 'Examples index', link: '/examples/' },
          { text: 'PTO overview', link: '/examples/pto/' },
          { text: 'Hello / Elementwise', link: '/examples/pto/hello-elementwise' },
          { text: 'GEMM / FFN', link: '/examples/pto/gemm-ffn' },
          { text: 'Softmax / Attention', link: '/examples/pto/softmax-attention' },
          { text: 'Complete Models', link: '/examples/pto/complete-models' },
          { text: 'Distributed Runtime', link: '/examples/pto/distributed-runtime' },
          { text: 'Missing Roadmap', link: '/examples/pto/missing-roadmap' }
        ]
      },
      {
        text: 'Topics',
        items: [
          { text: '非分布式执行', link: '/topics/non-distributed-execution' },
          { text: 'Examples Feature Map', link: '/topics/examples-feature-map' },
          { text: 'simpler Runtime Architecture', link: '/topics/simpler-runtime-architecture' },
          { text: 'Distributed Execution', link: '/topics/distributed-execution' },
          { text: 'Lingqu Level Map', link: '/topics/lingqu-level-map' },
          { text: 'Developer Takeover Guide', link: '/topics/developer-takeover-guide' }
        ]
      },
      {
        text: 'Concepts',
        items: [
          { text: 'Basic Terms', link: '/concepts/basic-terms' },
          { text: 'CANN Foundation', link: '/concepts/cann-foundation' },
          { text: 'Distributed Terms', link: '/concepts/distributed-execution-terms' }
        ]
      },
      {
        text: 'Future',
        items: [
          { text: 'Future index', link: '/future/' },
          { text: 'PR 711 gRPC Dispatch Primer', link: '/future/pr711-grpc-dispatch-primer' },
          { text: 'Runtime Dispatch and Serving Roadmap', link: '/future/runtime-dispatch-and-serving-roadmap' }
        ]
      },
      {
        text: 'Materials',
        items: [
          { text: 'Materials Home', link: '/materials/' },
          { text: 'PTO Runtime Bundle Guide', link: '/materials/pto-runtime-distributed/' },
          { text: '00 Overview and Reading Paths', link: '/materials/pto-runtime-distributed/00_README' },
          { text: '01 Hardware, CANN, HCCL, RoCE', link: '/materials/pto-runtime-distributed/01_hardware_and_software_stack' },
          { text: '02 PTO-ISA and Runtime Basics', link: '/materials/pto-runtime-distributed/02_pto_isa_and_runtime_basics' },
          { text: '03 Distributed Runtime Blueprint', link: '/materials/pto-runtime-distributed/03_distributed_blueprint' },
          { text: '04 Feature Deep Dives', link: '/materials/pto-runtime-distributed/04_feature_deep_dives' },
          { text: '05 Progress and Timeline', link: '/materials/pto-runtime-distributed/05_progress_and_timeline' },
          { text: '06 Development Tasks', link: '/materials/pto-runtime-distributed/06_development_tasks' },
          { text: '07 Source and Evidence Notes', link: '/materials/pto-runtime-distributed/07_source_notes' },
          { text: '08 HostWorker / DistWorker Alignment', link: '/materials/pto-runtime-distributed/08_top_level_design_alignment' },
          { text: 'Document System Design', link: '/materials/pto-runtime-distributed/PTO-Runtime分布式拓展文档系统设计' }
        ]
      }
    ],
    search: {
      provider: 'local'
    }
  }
})
