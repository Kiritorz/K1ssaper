# 📚 K1ssaper

<div align="center">
  <p><strong>一个极简、本地优先且支持云端同步的跨平台论文管理工具</strong></p>
  <p><strong>Minimal, Local-First Cross-Platform Paper Management Tool with Cloud Sync</strong></p>
  <p>
    <img src="https://img.shields.io/badge/Electron-25.0+-blue.svg" alt="Electron Version">
    <img src="https://img.shields.io/badge/React-18.0+-61DAFB.svg" alt="React Version">
    <img src="https://img.shields.io/badge/Tailwind_CSS-3.0+-38B2AC.svg" alt="Tailwind CSS Version">
    <img src="https://img.shields.io/badge/Supabase-Supported-3ECF8E.svg" alt="Supabase">
    <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="MIT License">
  </p>
  <!-- 可选：添加项目截图（建议放在此处，示例路径） -->
  <!-- <img src="./public/screenshot.png" width="80%" alt="K1ssaper 界面截图"> -->
</div>

## 📖 简介 | Introduction

**K1ssaper** 是为我自己量身打造的轻量级桌面论文管理应用。它坚持 **「本地优先 (Local-First)」** 的设计原则，同时提供了 **可选的云端同步** 功能。

**K1ssaper** is a lightweight desktop paper management application built for personal use. It follows a **"Local-First"** design principle while offering **optional cloud synchronization**.

- 📥 **Local Handling**: Import PDFs, manage metadata locally.
- ☁️ **Hybrid Storage**: Choose between pure local storage or **Supabase Cloud** sync.
- 📝 **Advanced Notes**: Markdown notes with LaTeX support, organized in nested folders.
- 🔒 **Privacy**: Local data remains fully in your control; cloud sync is opt-in.

## ✨ 核心特性 | Core Features

### ☁️ 双模存储 (Hybrid Storage)
- **本地模式 (Local Mode)**:
  - 数据完全存储在本地磁盘。
  - 适合注重隐私、单设备使用的场景。
  - PDF 自动归档整理。
- **云端模式 (Supabase Cloud Mode)**:
  - 基于 Supabase 实现多端数据同步。
  - **智能同步**: 自动跳过未修改的记录和已存在的 PDF，节省流量和时间。
  - **连接验证**: 实时检测数据库连接状态，并提供直观的 UI 反馈（在线/离线）。
  - 支持元数据与 PDF 文件的完整云端备份。

### 📝 增强型笔记系统 (Enhanced Notes)
- **无限层级文件夹**: 支持拖拽创建文件夹、移动笔记，像文件资源管理器一样管理你的知识。
- **Markdown + LaTeX**: 内置编辑器支持 Markdown 语法及 KaTeX 公式渲染。
- **双向关联**: 笔记可独立存在，也可关联特定论文。
- **全屏专注模式**: 沉浸式写作体验，支持左右分栏预览。

### 🏷️ 灵活组织与检索
- **智能分组**: 自定义多标签体系，自动统计。
- **状态管理**: 一键标记「已读/未读」。
- **全局搜索**: 毫秒级检索论文标题、作者、会议及年份。

### 🎨 现代化交互体验
- **国际化 (i18n)**: 完美支持 **中文** 与 **English** 界面切换。
- **自适应视图**: 列表 (List) 与网格 (Grid) 视图无缝切换。
- **原生体验**: 适配 macOS/Windows 原生窗口控制，拖拽区域优化。
- **主题感知**: 云端模式下启用专属绿色主题，本地模式保持经典黑白风格。

## 🛠️ 技术栈 | Tech Stack

| 类别 (Category) | 技术/工具 (Tech/Tools) |
| -------- | ---------------------------------------------------------- |
| **Runtime** | [Electron](https://www.electronjs.org/) (Main Process) |
| **Frontend** | [React](https://react.dev/) + [Vite](https://vitejs.dev/) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) |
| **Database** | Native File System (JSON) / [Supabase](https://supabase.com/) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Markdown** | React Markdown + Remark GFM + KaTeX |
| **Build** | [Electron Builder](https://www.electron.build/) |

## 🚀 快速开始 | Getting Started

### 环境要求 | Prerequisites
- Node.js ≥ 18.x
- npm / yarn / pnpm

### 安装与启动 | Install & Run

```bash
# Clone the repository
git clone https://github.com/your-username/k1ssaper-desktop.git

# Install dependencies
npm install

# Start development server
npm run electron:dev
```

### 构建应用 | Build

```bash
# Build for Windows
npm run electron:build -- --win

# Build for macOS
npm run electron:build -- --mac
```

## ⚙️ Supabase 配置 (Optional)

若要启用云端同步功能，请在 Supabase 创建项目并运行以下 SQL 初始化数据库：

To enable cloud sync, create a Supabase project and run the following SQL:

```sql
-- Create Papers Table
create table public.papers (
  id uuid not null primary key,
  title text,
  authors text,
  venue text,
  year int,
  group text, -- comma separated tags
  summary text,
  url text,
  "isRead" boolean default false,
  "hasPdf" boolean default false,
  "updatedAt" timestamptz,
  "createdAt" timestamptz
);

-- Create Notes Table
create table public.notes (
  id uuid not null primary key,
  "parentId" uuid references public.notes(id), -- for folder structure
  type text default 'note', -- 'note' or 'folder'
  title text,
  content text,
  "updatedAt" timestamptz,
  "createdAt" timestamptz
);

-- Enable Storage
insert into storage.buckets (id, name, public) values ('pdfs', 'pdfs', true);
```

Then enter your **Project URL** and **Anon Key** in the App Settings.

## 📄 License

[MIT](./LICENSE) © K1ssaper

<p align="center">Made with ❤️ by K1ssinn</p>
