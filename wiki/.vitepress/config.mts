import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Toolchain Wiki',
  description: 'Reusable technical wiki template for a configured target set.',
  cleanUrls: true,
  ignoreDeadLinks: [
    /^https:\/\/github\.com\//,
    /^https:\/\/gitcode\.com\//
  ],
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Projects', link: '/projects' },
      { text: 'Toolchain Map', link: '/toolchain-map' },
      { text: 'Glossary', link: '/glossary' }
    ],
    sidebar: [
      {
        text: 'Wiki',
        items: [
          { text: 'Home', link: '/' },
          { text: 'Projects', link: '/projects' },
          { text: 'Toolchain Map', link: '/toolchain-map' },
          { text: 'Glossary', link: '/glossary' }
        ]
      },
      {
        text: 'Repositories',
        items: [
          { text: 'Repository Profiles', link: '/repositories/' }
        ]
      }
    ],
    search: {
      provider: 'local'
    }
  }
})
