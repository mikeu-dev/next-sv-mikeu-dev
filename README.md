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
  <a href="#getting-started">Getting Started</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#project-structure">Structure</a> •
  <a href="#scripts">Scripts</a>
</p>

</div>

---

## 📖 Introduction

**Mikeu Dev Portfolio** is a cutting-edge, production-ready fullstack application engineered for extreme performance and scalability. Built with **SvelteKit** and **Svelte 5 Runes**, it features a unique **Brutalist Design** language, an interactive **3D World Visualization**, and a fully-featured **Admin CRM** with role-based authentication.

This isn't just a portfolio; it's a showcase of modern web engineering, combining blazing-fast load times with rich, interactive experiences.

## ✨ Features

### 🌍 Folded World Visualization
- **Interactive 3D Globe**: Real-time visitor map powered by **Three.js** and GeoIP data.
- **Dynamic Node Mapping**: Visualizes global traffic with high-performance instanced rendering.
- **Minimalist Teaser**: A lightweight version of the globe integrated into the landing page for maximum impact with minimum overhead.

### 🛡️ Core & Admin CRM
- **Unified Admin Dashboard**: Securely manage projects, blogs, skills, and social links in one place.
- **Role-Based Security**: Exclusive owner access protection using Firebase Auth and custom server-side hooks.
- **Real-time Data**: Fully reactive content management powered by Firestore and Svelte 5 Runes.

### ⚡ Performance & DX
- **Svelte 5 Runes**: Pure signal-based reactivity for the most efficient UI updates.
- **Tailwind CSS 4**: Next-gen styling with the latest utility-first framework.
- **Type Safety**: 100% TypeScript coverage with **Zod** schema validation for all data boundaries.
- **I18n Ready**: Full multi-language support (English & Indonesian) via **Paraglide-JS**.

### 🎨 UI & UX
- **Brutalist Aesthetics**: High-contrast, bold typography and raw layouts for a distinct digital identity.
- **Complex Animations**: Seamless transitions and micro-interactions powered by **GSAP** and **Matter.js**.
- **PWA Capabilities**: Installable, offline-ready experience with optimized service workers.
- **AI-Enhanced**: Integration with **Google Gemini** for dynamic content generation and smart features.

## 🛠️ Tech Stack

<div align="center">

| Core | Styles & UI | Data & Backend | Tools |
| :--- | :--- | :--- | :--- |
| ![Svelte 5](https://img.shields.io/badge/-Svelte_5-orange?logo=svelte) | ![Tailwind 4](https://img.shields.io/badge/-Tailwind_4-38B2AC?logo=tailwind-css) | ![Firebase](https://img.shields.io/badge/-Firebase-FFCA28?logo=firebase) | ![Vite 6](https://img.shields.io/badge/-Vite-646CFF?logo=vite) |
| ![SvelteKit 2](https://img.shields.io/badge/-SvelteKit_2-FF3E00?logo=svelte) | ![Three.js](https://img.shields.io/badge/-Three.js-000000?logo=three.js) | ![Firestore](https://img.shields.io/badge/-Firestore-FFCA28?logo=firebase) | ![Vitest](https://img.shields.io/badge/-Vitest-729B1B?logo=vitest) |
| ![TypeScript](https://img.shields.io/badge/-TypeScript_5-blue?logo=typescript) | ![GSAP](https://img.shields.io/badge/-GSAP-88CE02?logo=greensock) | ![Gemini AI](https://img.shields.io/badge/-Gemini_AI-4285F4?logo=google-gemini) | ![Storybook 10](https://img.shields.io/badge/-Storybook_10-FF4785?logo=storybook) |

</div>

## 📂 Project Structure

| Directory | Description |
| :--- | :--- |
| **`src/routes/world`** | The "Folded World" interactive 3D visualization. |
| **`src/routes/admin`** | Protected CRM dashboard for content management. |
| **`src/lib/server`** | Server-side logic, repositories, and Firebase Admin SDK services. |
| **`src/lib/components`** | Atomic UI components following strict design tokens. |
| **`messages/`** | Translation source files for i18n support. |
| **`static/`** | Public assets, including PWA manifest and optimized images. |

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

| Command | Description |
| :--- | :--- |
| `pnpm dev` | Start development server with HMR |
| `pnpm build` | Production build (optimized for Vercel/Node) |
| `pnpm preview` | Locally preview production build |
| `pnpm check` | Type-check Svelte and TypeScript files |
| `pnpm lint` | Run ESLint and Prettier checks |
| `pnpm storybook` | Launch Storybook UI workshop |

---

<div align="center">
  <p>Built with ❤️ by <b>Mikeu</b></p>
  <p><a href="https://www.mikeudev.my.id">www.mikeudev.my.id</a></p>
</div>
