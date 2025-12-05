# 📚 K1ssaper

<div align="center">
  <p><strong>一个极简、本地优先的跨平台论文管理工具</strong></p>
  <p>
    <img src="https://img.shields.io/badge/Electron-25.0+-blue.svg" alt="Electron Version">
    <img src="https://img.shields.io/badge/React-18.0+-61DAFB.svg" alt="React Version">
    <img src="https://img.shields.io/badge/Tailwind_CSS-3.0+-38B2AC.svg" alt="Tailwind CSS Version">
    <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="MIT License">
  </p>
  <!-- 可选：添加项目截图（建议放在此处，示例路径） -->
  <!-- <img src="./public/screenshot.png" width="80%" alt="K1ssaper 界面截图"> -->
</div>

## 📖 简介 | Introduction

**K1ssaper** 是为我自己量身打造的轻量级桌面论文管理应用，核心遵循 **「本地优先 (Local-First)」** 设计原则：

- 导入论文 PDF 文件，支持编辑和渲染 Markdown 格式的阅读笔记
- 所有数据（论文元数据、PDF 文件）均存储在用户指定的本地目录，无云依赖
- 完全掌控数据隐私与安全，无需担心云端同步风险
- 基于 Electron + React 构建，适配 Windows/macOS 双平台，提供原生级交互体验

## ✨ 核心特性 | Core Features

### 📂 本地数据掌控
- 自定义存储库路径，PDF/JSON 元数据全量本地存储
- PDF 文件自动重命名为 UUID 格式，彻底避免文件名冲突
- 跨设备迁移便捷：复制存储文件夹即可无缝切换设备

### 📝 强大的笔记系统
- 内置 Markdown 编辑器，支持 LaTeX 公式渲染（KaTeX）
- 实时编辑/预览模式切换，适配科研笔记书写习惯

### 🏷️ 灵活的组织管理
- 多标签分组：单篇论文可关联多个标签，侧边栏自动统计标签数量
- 阅读状态标记：一键切换「已读/未读」，视觉反馈直观
- 精准搜索筛选：支持标题/作者/会议关键词搜索 + 标签筛选

### 🎨 现代化交互体验
- 双视图切换：列表视图/网格视图自由切换
- 响应式布局：适配不同窗口尺寸，兼顾大屏/小屏使用
- macOS 深度适配：原生「红绿灯」窗口控制，贴合系统交互逻辑

### ⚡ 高效文件操作
- 一键定位：直接在系统文件管理器（Finder/Explorer）中打开 PDF 所在目录
- 稳定上传：点击式文件上传（原拖拽上传暂移除，保障稳定性）

## 🛠️ 技术栈 | Tech Stack

| 类别     | 技术/工具                                                  |
| -------- | ---------------------------------------------------------- |
| 运行时   | [Electron](https://www.electronjs.org/)（主进程 CommonJS） |
| 前端框架 | [React](https://react.dev/)（Hooks + 函数式组件）          |
| 构建工具 | [Vite](https://vitejs.dev/)                                |
| 样式     | [Tailwind CSS](https://tailwindcss.com/)                   |
| 图标     | [Lucide React](https://lucide.dev/)                        |
| 富文本   | Marked（Markdown 解析）、KaTeX（公式渲染）                 |
| 打包工具 | [Electron Builder](https://www.electron.build/)            |

## 🚀 快速开始 | Getting Started

### 环境要求
- Node.js ≥ 23.x（推荐 LTS 版本）
- npm / yarn / pnpm（任选其一）

### 安装依赖
```bash
# npm
npm install

# yarn
yarn install

# pnpm
pnpm install
```

### 启动开发环境

```bash
npm run electron:dev
```

> 该命令会同时启动 Vite 开发服务器和 Electron 窗口，修改代码后自动热更新

## 📦 打包构建 | Building

支持打包为 Windows/macOS 原生安装包，配置已内置 `electron-builder`。

### 构建 Windows 版本

```bash
# 生成 exe 安装包 + 免安装版
npm run electron:build -- --win
```

### 构建 macOS 版本

```bash
# 生成 dmg 安装包 + app 应用包
npm run electron:build -- --mac
```

> ⚠️ 注意：macOS 打包已禁用代码签名（Identity: null），生成的应用仅本地可用；若需发布，请配置 Apple 开发者证书。

## 📂 项目结构 | Project Structure

```plaintext
K1ssaper/
├── electron/           # Electron 主进程代码
│   └── main.cjs        # 窗口创建、IPC 通信、原生文件操作核心逻辑
├── src/                # React 前端代码
│   ├── OneFile.jsx     # 核心业务逻辑组件（单组件架构）
│   ├── App.jsx         # 应用入口组件
│   ├── index.css       # Tailwind 引入 + 全局样式
│   └── main.jsx        # React DOM 挂载入口
├── public/             # 静态资源（Logo、图标、截图等）
├── package.json        # 项目配置、依赖、脚本
└── LICENSE             # MIT 许可证文件
```

## ⚠️ 注意事项 | Notes

1. **数据迁移**：PDF 路径基于 UUID 动态计算，直接复制整个存储文件夹到其他设备，重新指定存储路径即可正常使用（支持 Windows ↔ macOS 跨系统迁移）。
2. **macOS 图标**：打包 macOS 版本需确保 `public/logo.icns` 存在（标准 .icns 格式图标）。
3. **依赖兼容**：若安装依赖失败，建议升级 npm/yarn 或切换 Node.js 23 LTS 版本。

## 📄 许可证 | License

本项目基于 MIT 协议开源 - 详见 [LICENSE](https://www.doubao.com/chat/LICENSE) 文件 © 2023 K1ssinn

<p align="center">Made with ❤️ by K1ssinn</p>
