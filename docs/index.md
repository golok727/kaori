---
layout: home

hero:
  name: "Kaori"
  text: "A Fragrant Framework"
  tagline: Build reactive UIs with familiar syntax and powerful reactivity
  image:
    src: /logo.svg
    alt: Kaori Logo
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/golok727/kaori

features:
  - icon: 💖
    title: Reactive by Design
    details: Built on signals from @preact/signals-core. Automatic fine-grained reactivity without manual optimization.
  - icon: ⚡
    title: Lightning Fast
    details: Powered by lit-html for efficient DOM updates. Only re-renders what actually changed.
  - icon: 🎨
    title: Familiar Syntax
    details: Write JSX like you're used to. Component patterns inspired by React and Solid.js.
  - icon: 🪶
    title: Lightweight
    details: Small bundle size with zero unnecessary dependencies. Only pay for what you use.
  - icon: 🔧
    title: TypeScript First
    details: Built with TypeScript. Full type safety and excellent IDE support out of the box.
  - icon: 🎯
    title: Easy to Learn
    details: Simple API surface. If you know React or Solid.js, you already know Kaori.
---

<style>
.VPFeature {
  transition: all 0.3s ease;
}

.VPFeature:hover {
  background: linear-gradient(135deg, var(--vp-c-brand-soft), var(--vp-c-purple-soft));
}
</style>
