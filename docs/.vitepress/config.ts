import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Kaori',
  description: 'A fragrant TypeScript framework for building reactive UIs ✨',
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
  ],
  themeConfig: {
    logo: '/logo.svg',
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'API', link: '/api/core' },
      { text: 'Examples', link: '/examples/basic' },
    ],
    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'What is Kaori?', link: '/guide/what-is-kaori' },
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Quick Start', link: '/guide/quick-start' },
          ]
        },
        {
          text: 'Core Concepts',
          items: [
            { text: 'Reactivity', link: '/guide/reactivity' },
            { text: 'Components', link: '/guide/components' },
            { text: 'Props', link: '/guide/props' },
            { text: 'Lifecycle', link: '/guide/lifecycle' },
          ]
        },
        {
          text: 'Control Flow',
          items: [
            { text: 'For Component', link: '/guide/for' },
            { text: 'Show Component', link: '/guide/show' },
          ]
        },
        {
          text: 'Special Attributes',
          items: [
            { text: 'Event Handlers', link: '/guide/events' },
            { text: 'Property Binding', link: '/guide/property-binding' },
            { text: 'Boolean Attributes', link: '/guide/boolean-attributes' },
            { text: 'Class & Style Maps', link: '/guide/class-style-maps' },
          ]
        }
      ],
      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: 'Core', link: '/api/core' },
            { text: 'Reactivity', link: '/api/reactivity' },
            { text: 'Components', link: '/api/components' },
            { text: 'Helpers', link: '/api/helpers' },
            { text: 'Directives', link: '/api/directives' },
          ]
        }
      ],
      '/examples/': [
        {
          text: 'Examples',
          items: [
            { text: 'Basic Counter', link: '/examples/basic' },
            { text: 'Todo List', link: '/examples/todo-list' },
            { text: 'Custom Hooks', link: '/examples/custom-hooks' },
            { text: 'Eye Widget', link: '/examples/eye-widget' },
          ]
        }
      ]
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/golok727/kaori' }
    ],
    footer: {
      message: 'Made with 💖 by golok',
      copyright: 'MIT Licensed'
    },
    search: {
      provider: 'local'
    }
  }
})
