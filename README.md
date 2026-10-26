# PixelCraft • Offline Image Converter & Compressor

A lightweight, high-performance, offline desktop application built with **Tauri v2**, **Rust**, and **React 19 (TypeScript)** + **Tailwind CSS v4**.

---

## ⚡ Highlights

- **100% Local-First & Zero-Cloud**: No data ever leaves your device. Image decoding, color space transformation, and WebP compression run entirely on your local machine.
- **Ultra-Fast Batch Conversion**: Convert multiple PNG, JPEG, JPG, and WebP images simultaneously.
- **Customizable Compression**:
  - Quality slider (10% to 100%)
  - Lossless WebP mode for pixel-perfect graphics and logos
  - Built-in presets: *Web Standard (80%)*, *High Quality (92%)*, *Max Compression (55%)*, and *Lossless*
  - Smart dimension constraints: *Original*, *Fit 4K (3840px)*, *Fit 1080p (1920px)*, *Fit 720p (1280px)*, or *Custom Width & Height*
- **Visual Quality Inspector**: Interactive split-slider modal comparing original vs. converted images side-by-side.
- **Batch Export**: Download individual files or export the entire batch as an organized `.zip` archive.
- **Dual Engine Architecture**: Direct native Rust acceleration via Tauri command `convert_image` with instant client-side offline canvas fallback.

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Rust](https://rustup.rs/)

### 1. Install Dependencies

```bash
npm install
```

### 2. Development Mode

To run the Vite web interface in your browser:
```bash
npm run dev
```

To run the full native Tauri desktop application:
```bash
npm run tauri dev
```

### 3. Production Build

Build the production bundle:
```bash
npm run build
npm run tauri build
```

---

## 📦 Automated Release Pipeline (CI/CD)

The project includes an automated GitHub Actions pipeline in [`.github/workflows/release.yml`](.github/workflows/release.yml).

### How to trigger a release:

Push a git version tag:
```bash
git tag v1.0.0
git push origin v1.0.0
```

GitHub Actions will automatically matrix-build and attach the native installer binaries to a new GitHub Release:
- **Windows**: `.exe` / `.msi` installers
- **macOS**: `.dmg` (Apple Silicon `aarch64` and Intel `x86_64`)
- **Linux**: `.deb` package and `AppImage`
