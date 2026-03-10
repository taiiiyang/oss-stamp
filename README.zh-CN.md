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

[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/dhhibeifipigpbkihogkolbhkcecjgfp)](https://chromewebstore.google.com/detail/oss-stamp/dhhibeifipigpbkihogkolbhkcecjgfp)

<!-- TODO: uncomment when published -->
<!-- [![Firefox Add-ons](https://img.shields.io/amo/v/oss-stamp)](https://addons.mozilla.org/firefox/addon/oss-stamp) -->

</div>

## 演示

<!-- TODO: add screenshot or GIF at assets/demo.gif showing the score card in a real GitHub PR sidebar -->
<!-- <img src="assets/demo.gif" alt="OSS Stamp 演示" width="700" /> -->

> 截图即将上线 — 请参阅[安装](#安装)自行体验。

## 功能特性

### 贡献者评分卡

在 GitHub PR 侧边栏直接查看贡献者的等级（S/A/B/C/D）和综合评分。

### 双评分体系

两套独立评分 — **Repo Trust Score**（基于当前仓库）和 **Profile Score**（基于全局画像）— 均为 0–100 分，各含四个维度。

### 深色模式

自动适配 GitHub 的亮色或深色主题，无需手动切换。

### 多语言支持

支持英文和简体中文。

## 评分机制

OSS Stamp 计算两套独立评分，均为 0–100 分，各含四个维度。

### Repo Trust Score（仓库信任分）

衡量贡献者与**当前仓库**的关系。

> **特殊情况：** 仓库 Owner 直接获得 **S / 100 分**。

| 维度               | 满分 | 评分因子                                                               |
| ------------------ | ---- | ---------------------------------------------------------------------- |
| Repo Familiarity   | 35   | 已合并 PR 数 (0–12)、审查次数 (0–8)、活跃时长 (0–10)、贡献者标记 (+5)  |
| Community Standing | 25   | 账号年龄 (0–5)、关注者数 (0–10)、组织成员 (+10)                        |
| OSS Influence      | 20   | 最高星标仓库 (0–15)、总星标数 (0–5)                                    |
| PR Track Record    | 20   | 合并率分段：<50% → 5, 50–74% → 10, 75–89% → 15, ≥90% → 20（无 PR → 5） |

### Profile Score（画像评分）

衡量贡献者的**全局 GitHub 画像**，与特定仓库无关。

| 维度               | 满分 | 评分因子                                                               |
| ------------------ | ---- | ---------------------------------------------------------------------- |
| Community Presence | 25   | 账号年龄 (0–5)、关注者数/对数 (0–12)、关注者/关注比 (0–4)、有 Bio (+4) |
| OSS Impact         | 25   | 最高星标仓库/对数 (0–10)、总星标数/对数 (0–10)、总 Fork 数/对数 (0–5)  |
| Activity           | 30   | 年度贡献量/对数 (0–18)、公开仓库数/对数 (0–12)                         |
| Ecosystem          | 20   | 组织成员数 (0–12)、语言多样性 (0–8)                                    |

### 等级

两套评分共享相同的等级阈值：

| 等级  | 分数   |
| ----- | ------ |
| **S** | 90–100 |
| **A** | 70–89  |
| **B** | 50–69  |
| **C** | 30–49  |
| **D** | 0–29   |

### 对数缩放

Profile Score 中多个因子使用对数缩放函数（`logScale(value, ref, max)`），防止极端值主导评分。`ref` 参数为映射到满分 ~70% 的参考值。例如 `logScale(followers, 200, 12)` 表示 200 个关注者 ≈ 8.4 分（满分 12）。

## 安装

### 从商店安装

- **Chrome**：[从 Chrome Web Store 安装](https://chromewebstore.google.com/detail/oss-stamp/dhhibeifipigpbkihogkolbhkcecjgfp)

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
