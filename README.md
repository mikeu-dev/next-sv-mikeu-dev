<div align="center">

# 🪄 Mikeu Dev Portfolio

### A High-Performance, Brutalist Fullstack Portfolio & CRM

[![Svelte](https://img.shields.io/badge/Svelte-5-orange?style=flat-square&logo=svelte)](https://svelte.dev)
[![SvelteKit](https://img.shields.io/badge/SvelteKit-2-FF3E00?style=flat-square&logo=svelte)](https://kit.svelte.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com)
[![Firebase](https://img.shields.io/badge/Firebase-Integration-FFCA28?style=flat-square&logo=firebase)](https://firebase.google.com)
[![Three.js](https://img.shields.io/badge/Three.js-Latest-000000?style=flat-square&logo=three.js)](https://threejs.org/)

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#project-structure">Structure</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#scripts">Scripts</a>
</p>

</div>

---

## 📖 Introduction

**Mikeu Dev Portfolio** is a cutting-edge, production-ready fullstack application engineered for extreme performance and scalability. Built with **SvelteKit** and **Svelte 5 Runes**, it features a unique **Brutalist Design** language, an interactive **3D World Visualization**, and a fully-featured **Admin CRM** with role-based authentication.

This isn't just a portfolio; it's a showcase of modern web engineering, combining blazing-fast load times with rich, interactive experiences across multiple specialized pages.

## ✨ Features

### 🏢 Guest Experience & Portfolio

A collection of high-performance pages designed to showcase skills and experience.

- **Projects Showcase**: Interactive grid of work with detailed case studies and tech stacks.
- **Dynamic Blog**: High-performance reading experience with syntax highlighting and deep linking.
- **Professional Journey**: A curated timeline of experience, education, and key milestones.
- **Interactive About**: Immersive storytelling page with GSAP animations and Brutalist layouts.
- **3D Visitor Map**: The "Folded World" interactive globe showing real-time global visitors.
- **Contact Interface**: Type-safe form for guest inquiries with instant validation.

### 🛡️ Professional Admin CRM

A powerful, secure dashboard to manage every aspect of the platform in real-time.

- **Unified Management**: Centralized hub for managing Projects, Blog posts, and Journey entries.
- **Real-time Analytics**: Detailed visitor statistics and geolocation mapping.
- **System Monitoring**: Live health checks and system status tracking.
- **Communication Hub**: Integrated inbox for managing and responding to contact messages.
- **Tech Stack Editor**: Dynamic management of tools and skills displayed across the site.

### ⚡ Technical Excellence

- **Svelte 5 Runes**: Pure signal-based reactivity for the most efficient UI updates.
- **Native i18n**: Full multi-language support (English & Indonesian) via **Paraglide-JS**.
- **Type Safety**: 100% TypeScript coverage with **Zod** schema validation.
- **Repository Pattern**: Clean, abstracted data layer separating business logic from infrastructure.
- **PWA & SEO**: Installable, offline-capable, and fully optimized for search engines.

### 🎨 UI & UX

- **Brutalist Aesthetics**: High-contrast, bold typography and raw layouts for a distinct digital identity.
- **Motion System**: Seamless transitions powered by **GSAP** and physics-based interactions with **Matter.js**.
- **View Transitions**: Fluid page navigations using the native browser API.
- **AI-Enhanced**: Integration with **Google Gemini** for dynamic content generation.

## 🛠️ Tech Stack

<div align="center">

| Core                                                                           | Styles & UI                                                                      | Data & Backend                                                                  | Tools & Quality                                                                   |
| :----------------------------------------------------------------------------- | :------------------------------------------------------------------------------- | :------------------------------------------------------------------------------ | :-------------------------------------------------------------------------------- |
| ![Svelte 5](https://img.shields.io/badge/-Svelte_5-orange?logo=svelte)         | ![Tailwind 4](https://img.shields.io/badge/-Tailwind_4-38B2AC?logo=tailwind-css) | ![Firebase](https://img.shields.io/badge/-Firebase-FFCA28?logo=firebase)        | ![Vite 7](https://img.shields.io/badge/-Vite-646CFF?logo=vite)                    |
| ![SvelteKit 2](https://img.shields.io/badge/-SvelteKit_2-FF3E00?logo=svelte)   | ![Three.js](https://img.shields.io/badge/-Three.js-000000?logo=three.js)         | ![Firestore](https://img.shields.io/badge/-Firestore-FFCA28?logo=firebase)      | ![Storybook 10](https://img.shields.io/badge/-Storybook_10-FF4785?logo=storybook) |
| ![TypeScript](https://img.shields.io/badge/-TypeScript_5-blue?logo=typescript) | ![GSAP](https://img.shields.io/badge/-GSAP-88CE02?logo=greensock)                | ![Gemini AI](https://img.shields.io/badge/-Gemini_AI-4285F4?logo=google-gemini) | ![Vitest](https://img.shields.io/badge/-Vitest-729B1B?logo=vitest)                |
| ![Paraglide](https://img.shields.io/badge/-Paraglide_JS-E10098?logo=i18next)   | ![Matter.js](https://img.shields.io/badge/-Matter.js-4B0082?logo=physics)        | ![Vercel Analytics](https://img.shields.io/badge/-Analytics-000000?logo=vercel) | ![Playwright](https://img.shields.io/badge/-Playwright-45BA4B?logo=playwright)    |

</div>

## 📂 Project Structure

| Directory                | Description                                                  |
| :----------------------- | :----------------------------------------------------------- |
| **`src/routes/admin`**   | Protected CRM dashboard and management modules.              |
| **`src/routes/world`**   | Interactive 3D "Folded World" visitor visualization.         |
| **`src/lib/server`**     | Domain logic, repositories, and Firebase Admin SDK services. |
| **`src/lib/components`** | Atomic UI components and feature-specific blocks.            |
| **`src/lib/paraglide`**  | Generated i18n runtime and translation utilities.            |
| **`messages/`**          | Source translation files (JSON) for multi-language support.  |
| **`static/`**            | Public assets, PWA manifest, and optimized media.            |

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v20 or higher
- **pnpm**: v9 or higher

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/next-sv-mikeu-dev.git
   cd next-sv-mikeu-dev
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Environment Configuration**
   Copy `.env.example` to `.env` and populate your Firebase and Gemini API keys.

   ```bash
   cp .env.example .env
   ```

4. **Start Development**
   ```bash
   pnpm dev
   ```

## 📜 Scripts

| Command          | Description                                  |
| :--------------- | :------------------------------------------- |
| `pnpm dev`       | Start development server with HMR            |
| `pnpm build`     | Production build (optimized for Vercel/Node) |
| `pnpm preview`   | Locally preview production build             |
| `pnpm check`     | Type-check Svelte and TypeScript files       |
| `pnpm lint`      | Run ESLint and Prettier checks               |
| `pnpm storybook` | Launch Storybook UI workshop                 |
| `pnpm test`      | Run unit and E2E tests                       |

---

<div align="center">
  <p>Built with ❤️ by <b>Mikeu</b></p>
  <p><a href="https://www.mikeudev.my.id">www.mikeudev.my.id</a></p>
</div>
