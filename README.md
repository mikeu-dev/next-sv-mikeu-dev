<div align="center">

# 🪄 Next SV Portfolio
### A High-Performance, Animated Portfolio Template

[![Svelte](https://img.shields.io/badge/Svelte-5-orange?style=flat-square&logo=svelte)](https://svelte.dev)
[![SvelteKit](https://img.shields.io/badge/SvelteKit-Latest-FF3E00?style=flat-square&logo=svelte)](https://kit.svelte.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com)
[![Firebase](https://img.shields.io/badge/Firebase-Integration-FFCA28?style=flat-square&logo=firebase)](https://firebase.google.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](./LICENSE)

<p align="center">
  <a href="#features">Features</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#project-structure">Structure</a> •
  <a href="#contributing">Contributing</a>
</p>

</div>

---

## 📖 Introduction

**Next SV Portfolio** is a modern, production-ready portfolio template engineered for performance and scalability. Built with **SvelteKit** and **Svelte 5 Runes**, it features a fully functional **Admin CRM**, role-based authentication, and dynamic content management via **Firebase**.

Designed for developers who demand excellence, it combines blazing-fast load times with rich, interactive animations.

## ✨ Features

### 🛡️ Core & Admin
- **Admin Dashboard (CRM)**: Securely manage projects, blogs, skills, and social links.
- **Role-Based Auth**: Exclusive owner access protection using Firebase Auth.
- **Dynamic Content**: All portfolio data is fetched in real-time from Firestore.

### ⚡ Performance & DX
- **Svelte 5 Runes**: Utilizes the latest, most efficient reactivity model.
- **Blazing Fast**: Server-side rendering (SSR) and static generation (SSG) capabilities via SvelteKit.
- **Type Safety**: End-to-end type safety with **TypeScript** and **Zod** schema validation.

### 🎨 UI & UX
- **Tailwind CSS**: Utility-first styling for rapid, responsive design.
- **Dark Mode**: Built-in theme switching with `mode-watcher`.
- **Animations**: Smooth, complex animations powered by **GSAP** and **Matter.js**.
- **Internationalization**: Full i18n support using `@inlang/paraglide-js`.

## 🛠️ Tech Stack

<div align="center">

| Core | Styles & UI | Data & Backend | Tools |
| :---: | :---: | :---: | :---: |
| ![Svelte](https://img.shields.io/badge/-Svelte_5-orange?logo=svelte) | ![Tailwind](https://img.shields.io/badge/-Tailwind-38B2AC?logo=tailwind-css) | ![Firebase](https://img.shields.io/badge/-Firebase-FFCA28?logo=firebase) | ![Vite](https://img.shields.io/badge/-Vite-646CFF?logo=vite) |
| ![SvelteKit](https://img.shields.io/badge/-SvelteKit-FF3E00?logo=svelte) | ![Lucide](https://img.shields.io/badge/-Lucide_Icons-pink?logo=lucide) | ![Firestore](https://img.shields.io/badge/-Firestore-FFCA28?logo=firebase) | ![Vitest](https://img.shields.io/badge/-Vitest-729B1B?logo=vitest) |
| ![TypeScript](https://img.shields.io/badge/-TypeScript-blue?logo=typescript) | ![GSAP](https://img.shields.io/badge/-GSAP-88CE02?logo=greensock) | ![Zod](https://img.shields.io/badge/-Zod-3E67B1?logo=zod) | ![Playwright](https://img.shields.io/badge/-Playwright-45BA4B?logo=playwright) |

</div>

## 📂 Project Structure

A simplified overview of the architecture:

| Directory | Description |
| :--- | :--- |
| **`src/lib/server`** | Backend logic, repositories, and Firebase admin services. |
| **`src/routes/admin`** | Protected admin routes for content management (CRM). |
| **`src/routes/api`** | Server-side API endpoints (`/api/projects`, `/api/auth`, etc.). |
| **`src/routes/blog`** | Blog implementation with dynamic slug routing. |
| **`src/routes/projects`** | Project case study pages. |
| **`src/lib/components`** | Atomic, reusable UI components designated by atomic design principles. |
| **`messages/`** | Translation files for internationalization (`en`, `id`). |

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites
*   **Node.js**: v18 or higher
*   **pnpm**: Recommended package manager

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/next-sv-portfolio.git
    cd next-sv-portfolio
    ```

2.  **Install dependencies**
    ```bash
    pnpm install
    ```

3.  **Environment Configuration**
    Create a `.env` file in the root directory. You will need a Firebase project.
    
    ```env
    # Client-side Firebase
    PUBLIC_FIREBASE_API_KEY="your_api_key"
    PUBLIC_FIREBASE_AUTH_DOMAIN="your_project_id.firebaseapp.com"
    PUBLIC_FIREBASE_PROJECT_ID="your_project_id"
    PUBLIC_FIREBASE_STORAGE_BUCKET="your_project_id.firebasestorage.app"
    PUBLIC_FIREBASE_MESSAGING_SENDER_ID="..."
    PUBLIC_FIREBASE_APP_ID="..."
    
    # Server-side Firebase Admin
    GOOGLE_APPLICATION_CREDENTIALS="src/lib/server/firebase/service-account.json"
    ```
    > **Note**: Place your Firebase Admin SDK `service-account.json` in the specified path or update the variable.

4.  **Start Development Server**
    ```bash
    pnpm dev
    ```

## 📜 Scripts

Common commands for development:

| Command | Description |
| :--- | :--- |
| `pnpm dev` | Start the development server |
| `pnpm build` | Build the app for production |
| `pnpm preview` | Preview the production build locally |
| `pnpm check` | Run `svelte-check` for type validation |
| `pnpm lint` | Lint code with ESLint and Prettier |
| `pnpm test` | Run unit tests with Vitest |

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1.  Fork the project.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">
  <p>Built with ❤️ by <b>Mike</b></p>
</div>