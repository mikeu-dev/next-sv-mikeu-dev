# 🪄 Next SV Portfolio

A modern, high-performance **portfolio website** built with **SvelteKit**, **Tailwind CSS**, and **Vite**.  
This project is designed for developers and designers who want a blazing-fast, animated, and customizable portfolio powered by cutting-edge frontend technologies.

---

## 📑 Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)

---

## Introduction

**Next SV Portfolio** is a SvelteKit-powered portfolio site optimized for performance, accessibility, and scalability.  
It includes rich animations, internationalization support, and a smooth developer workflow using **Vite**, **TypeScript**, **Storybook**, and **Vitest**.

This project can serve as a base for your personal site, design showcase, or any interactive web experience.

---

## Features

- ⚡️ **Blazing Fast** — Built with Vite and SvelteKit  
- 🎨 **Tailwind CSS** — Rapid UI development with utility classes  
- 🌙 **Dark Mode Support** via `mode-watcher`  
- 🧩 **Component-Driven Development** using Storybook  
- 🧠 **Type Safety** with TypeScript and Zod  
- 🔥 **Firebase Integration** (authentication, database, or hosting)  
- 🌍 **Internationalization** with `@inlang/paraglide-js`  
- 🎬 **Smooth Animations** using GSAP and Matter.js  
- 🧪 **Full Testing Suite** — Unit tests (Vitest) + E2E tests (Playwright)  
- 🧰 **Code Quality Tools** — ESLint, Prettier, Type Checking  

---

## Tech Stack

| Category | Technology |
|-----------|-------------|
| Framework | [SvelteKit](https://kit.svelte.dev/) |
| Build Tool | [Vite](https://vitejs.dev/) |
| Styling | [Tailwind CSS](https://tailwindcss.com/), `@tailwindcss/forms`, `@tailwindcss/typography` |
| Animations | [GSAP](https://greensock.com/gsap/), [Matter.js](https://brm.io/matter-js/) |
| Testing | [Vitest](https://vitest.dev/), [Playwright](https://playwright.dev/) |
| UI Development | [Storybook](https://storybook.js.org/) |
| Icons | [Lucide](https://lucide.dev/), `svelte-icons-pack` |
| Backend/Hosting | [Firebase](https://firebase.google.com/) |
| Type Checking | [TypeScript](https://www.typescriptlang.org/) |
| Linting & Formatting | ESLint + Prettier |

---

## Project Structure
```
next-sv-portfolio/
├── 📂 .gemini/
├── 📄 .npmrc
├── 📄 .prettierignore
├── 📄 .prettierrc
├── 📂 .storybook/
├── ⚙️ components.json
├── 📂 e2e/
├── 📜 eslint.config.js
├── 📖 GEMINI.md
├── 📂 messages/
├── 🔴 📦 **package.json**
├── 🔷 playwright.config.ts
├── ⚙️ pnpm-lock.yaml
├── ⚙️ pnpm-workspace.yaml
├── 📂 project.inlang/
├── 🔴 📖 **README.md**
├── 📁 src/
│   ├── 🎨 app.css
│   ├── 🔷 app.d.ts
│   ├── 🌐 app.html
│   ├── 🔷 demo.spec.ts
│   ├── 🔷 hooks.server.ts
│   ├── 🔷 hooks.ts
│   ├── 📚 lib/
│   │   ├── 📦 assets/
│   │   ├── 🧩 components/
│   │   ├── 📂 firebase/
│   │   ├── 🎣 hooks/
│   │   ├── 🔷 index.ts
│   │   ├── 📂 paraglide/
│   │   ├── 📂 server/
│   │   │   ├── 📂 core/
│   │   │   │   ├── 🔷 base.repository.ts
│   │   │   │   └── 🔷 base.service.ts
│   │   │   ├── 📂 exceptions/
│   │   │   │   └── 🔷 http.exception.ts
│   │   │   ├── 📂 firebase/
│   │   │   │   ├── 🔷 collections.ts
│   │   │   │   └── 🔷 firebase.server.ts
│   │   │   ├── 📂 repositories/
│   │   │   │   ├── 🔷 contacts.repository.ts
│   │   │   │   └── 🔷 projects.repository.ts
│   │   │   ├── 📂 services/
│   │   │   │   ├── 🔷 auth.service.ts
│   │   │   │   ├── 🔷 contacts.service.ts
│   │   │   │   ├── 🔷 projects.service.ts
│   │   │   │   └── 🔷 upload.service.ts
│   │   │   ├── 📂 storage/
│   │   │   │   └── 🔷 storage.helper.ts
│   │   │   └── 🔧 utils/
│   │   ├── 🔷 types.ts
│   │   └── 🔷 utils.ts
│   ├── 📂 routes/
│   │   ├── 📄 +layout.svelte
│   │   ├── 🔷 +page.server.ts
│   │   ├── 📄 +page.svelte
│   │   ├── 📂 about/
│   │   │   └── 📄 +page.svelte
│   │   ├── 🔌 api/
│   │   │   ├── 📂 auth/
│   │   │   │   └── 🔷 +server.ts
│   │   │   ├── 📂 contact/
│   │   │   │   └── 🔷 +server.ts
│   │   │   ├── 📂 projects/
│   │   │   │   └── 🔷 +server.ts
│   │   │   └── 📂 uploads/
│   │   │   │   └── 🔷 +server.ts
│   │   ├── 📂 blog/
│   │   │   ├── 📂 [slug]/
│   │   │   │   ├── 🔷 +page.server.ts
│   │   │   │   └── 📄 +page.svelte
│   │   │   ├── 🔷 +page.server.ts
│   │   │   └── 📄 +page.svelte
│   │   ├── 📂 contact/
│   │   │   ├── 🔷 +page.server.ts
│   │   │   └── 📄 +page.svelte
│   │   ├── 🔷 page.svelte.spec.ts
│   │   ├── 📂 project/
│   │   │   └── 📂 [slug]/
│   │   │   │   ├── 🔷 +page.server.ts
│   │   │   │   └── 📄 +page.svelte
│   │   └── 📂 projects/
│   │   │   ├── 🔷 +page.server.ts
│   │   │   └── 📄 +page.svelte
├── 📂 static/
│   └── 📄 robots.txt
├── 📜 svelte.config.js
├── 🟡 🔷 **tsconfig.json**
├── 🔷 vite.config.ts
└── 🔷 vitest-setup-client.ts
```

## 📖 Legend

### File Types
- ⚙️ Config: JSON files
- 🚫 DevOps: Git ignore
- 📄 Other: Other files
- 🔷 TypeScript: TypeScript files
- 📜 JavaScript: JavaScript files
- 📖 Docs: Markdown files
- ⚙️ Config: YAML files
- 🎨 Styles: Stylesheets
- 🌐 Web: HTML files
- 🎨 Assets: SVG images
- 🖼️ Assets: PNG images
- 📄 Docs: Text files

### Importance Levels
- 🔴 Critical: Essential project files
- 🟡 High: Important configuration files
- 🔵 Medium: Helpful but not essential filese