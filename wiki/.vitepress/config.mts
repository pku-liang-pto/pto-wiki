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
          { text: '学习路径', link: '/examples/' },
          { text: '运行环境', link: '/examples/run-surfaces' },
          { text: '跨仓库示例族', link: '/examples/cross-repo-families' },
          { text: '缺失路线图', link: '/examples/missing-roadmap' }
        ]
      },
      {
        text: 'Topics',
        items: [
          { text: '非分布式执行', link: '/topics/non-distributed-execution' },
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
        text: 'Materials',
        items: [
          { text: 'Material index', link: '/materials/' },
          { text: 'Bundle overview', link: '/materials/pto-runtime-distributed/' },
          { text: '00 README', link: '/materials/pto-runtime-distributed/00_README' },
          { text: 'Stack', link: '/materials/pto-runtime-distributed/01_hardware_and_software_stack' },
          { text: 'ISA and Runtime Basics', link: '/materials/pto-runtime-distributed/02_pto_isa_and_runtime_basics' },
          { text: 'Distributed Blueprint', link: '/materials/pto-runtime-distributed/03_distributed_blueprint' },
          { text: 'Feature Deep Dives', link: '/materials/pto-runtime-distributed/04_feature_deep_dives' },
          { text: 'Progress and Timeline', link: '/materials/pto-runtime-distributed/05_progress_and_timeline' },
          { text: 'Development Tasks', link: '/materials/pto-runtime-distributed/06_development_tasks' },
          { text: 'Source Notes', link: '/materials/pto-runtime-distributed/07_source_notes' },
          { text: 'Design Alignment', link: '/materials/pto-runtime-distributed/08_top_level_design_alignment' },
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
          { text: '学习路径', link: '/examples/' },
          { text: '运行环境', link: '/examples/run-surfaces' },
          { text: '跨仓库示例族', link: '/examples/cross-repo-families' },
          { text: '缺失路线图', link: '/examples/missing-roadmap' }
        ]
      },
      {
        text: 'Topics',
        items: [
          { text: '非分布式执行', link: '/topics/non-distributed-execution' },
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
        text: 'Materials',
        items: [
          { text: 'Material index', link: '/materials/' },
          { text: 'Bundle overview', link: '/materials/pto-runtime-distributed/' },
          { text: '00 README', link: '/materials/pto-runtime-distributed/00_README' },
          { text: 'Stack', link: '/materials/pto-runtime-distributed/01_hardware_and_software_stack' },
          { text: 'ISA and Runtime Basics', link: '/materials/pto-runtime-distributed/02_pto_isa_and_runtime_basics' },
          { text: 'Distributed Blueprint', link: '/materials/pto-runtime-distributed/03_distributed_blueprint' },
          { text: 'Feature Deep Dives', link: '/materials/pto-runtime-distributed/04_feature_deep_dives' },
          { text: 'Progress and Timeline', link: '/materials/pto-runtime-distributed/05_progress_and_timeline' },
          { text: 'Development Tasks', link: '/materials/pto-runtime-distributed/06_development_tasks' },
          { text: 'Source Notes', link: '/materials/pto-runtime-distributed/07_source_notes' },
          { text: 'Design Alignment', link: '/materials/pto-runtime-distributed/08_top_level_design_alignment' },
          { text: 'Document System Design', link: '/materials/pto-runtime-distributed/PTO-Runtime分布式拓展文档系统设计' }
        ]
      }
    ],
    search: {
      provider: 'local'
    }
  }
})
