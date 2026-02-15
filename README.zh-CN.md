<div align="center">

<!-- TODO: add banner image at assets/banner.png (logo + tagline) -->
<!-- <img src="assets/banner.png" alt="OSS Stamp" width="600" /> -->

# OSS Stamp

**GitHub 贡献者健康度指标**

一个在 Pull Request 侧边栏中展示贡献者评分卡片的浏览器扩展。

简体中文 | [English](./README.md)

[![GitHub Stars](https://img.shields.io/github/stars/taiiiyang/oss-stamp?style=flat)](https://github.com/taiiiyang/oss-stamp)
[![License](https://img.shields.io/github/license/taiiiyang/oss-stamp)](./LICENSE)
[![Last Commit](https://img.shields.io/github/last-commit/taiiiyang/oss-stamp)](https://github.com/taiiiyang/oss-stamp/commits/main)

<!-- TODO: uncomment when published -->
<!-- [![Chrome Web Store](https://img.shields.io/chrome-web-store/v/EXTENSION_ID)](https://chrome.google.com/webstore/detail/EXTENSION_ID) -->
<!-- [![Firefox Add-ons](https://img.shields.io/amo/v/oss-stamp)](https://addons.mozilla.org/firefox/addon/oss-stamp) -->

</div>

## 演示

<!-- TODO: add screenshot or GIF at assets/demo.gif showing the score card in a real GitHub PR sidebar -->
<!-- <img src="assets/demo.gif" alt="OSS Stamp 演示" width="700" /> -->

> 截图即将上线 — 请参阅[安装](#安装)自行体验。

## 功能特性

### 贡献者评分卡

在 GitHub PR 侧边栏直接查看贡献者的等级（S/A/B/C/D）和综合评分。

### 多维度分析

从五个维度进行评估：贡献数量、合并率、代码审查、参与时长和社区影响力。

### 深色模式

自动适配 GitHub 的亮色或深色主题，无需手动切换。

### 多语言支持

支持英文和简体中文。

## 评分机制

每位贡献者从五个维度进行评分，每项归一化至 0–100：

| 维度     | 衡量内容                   |
| -------- | -------------------------- |
| 贡献量   | 已合并的 Pull Request 数量 |
| 合并率   | 已合并 PR 占总 PR 的比例   |
| 代码审查 | 给出的代码审查次数         |
| 参与时长 | 首次贡献距今的时间         |
| 活跃度   | 公开仓库数和关注者数       |

贡献量占最大权重，其余四个维度权重相同。

### 等级

| 等级  | 分数   |
| ----- | ------ |
| **S** | 90–100 |
| **A** | 70–89  |
| **B** | 50–69  |
| **C** | 30–49  |
| **D** | 0–29   |

## 安装

### 从商店安装

> 即将上线 — [Star 本仓库](https://github.com/taiiiyang/oss-stamp)以获取通知。

### 从源码构建

```bash
git clone https://github.com/taiiiyang/oss-stamp.git
cd oss-stamp
pnpm install && pnpm build
```

然后加载未打包的扩展：

- **Chrome**：前往 `chrome://extensions` → 启用开发者模式 → 加载已解压的扩展程序 → 选择 `.output/chrome-mv3`
- **Firefox**：前往 `about:debugging#/runtime/this-firefox` → 临时加载附加组件 → 选择 `.output/firefox-mv2` 中的任意文件

## 浏览器支持

| 浏览器  | 状态   |
| ------- | ------ |
| Chrome  | 已支持 |
| Firefox | 已支持 |

<details>
<summary><strong>开发</strong></summary>

### 环境要求

- [Node.js](https://nodejs.org) 22+
- [pnpm](https://pnpm.io)

### 命令

```bash
# 安装依赖
pnpm install

# 启动开发服务器（Chrome）
pnpm dev

# 启动开发服务器（Firefox）
pnpm dev:firefox

# 生产环境构建（Chrome）
pnpm build

# 生产环境构建（Firefox）
pnpm build:firefox
```

</details>

## 贡献指南

1. Fork 本仓库
2. 创建功能分支（`git checkout -b feat/amazing-feature`）
3. 使用 [Conventional Commits](https://www.conventionalcommits.org) 规范提交
4. Push 并发起 Pull Request

请参阅[开发](#开发)了解环境搭建。

## 许可证

[MIT](./LICENSE)
