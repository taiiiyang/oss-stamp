# OSS Stamp

> GitHub 贡献者健康度指标 —— 一个在 Pull Request 侧边栏中注入贡献者评分卡片的浏览器扩展。

简体中文 | [English](./README.md)

## 功能特性

- **贡献者评分卡** — 在 GitHub 侧边栏直接展示 PR 作者的综合评分和等级（S/A/B/C/D）
- **多维度指标** — 从贡献数量、合并率、代码审查、参与时长和活跃度五个维度进行评估
- **深色模式** — 自动适配 GitHub 主题
- **国际化** — 支持英文和简体中文（基于 `@wxt-dev/i18n`）

## 技术栈

| 技术                                                                    | 用途                        |
| ----------------------------------------------------------------------- | --------------------------- |
| [WXT](https://wxt.dev)                                                  | 浏览器扩展框架              |
| [React 19](https://react.dev)                                           | UI 库                       |
| [Tailwind CSS v4](https://tailwindcss.com)                              | 原子化 CSS 样式             |
| [Jotai](https://jotai.org)                                              | 原子化状态管理              |
| [TanStack Query](https://tanstack.com/query)                            | 异步数据获取与缓存          |
| [jotai-tanstack-query](https://github.com/jotaijs/jotai-tanstack-query) | Jotai + TanStack Query 集成 |
| [Radix UI](https://www.radix-ui.com)                                    | 无障碍 UI 基础组件          |
| [Lucide React](https://lucide.dev)                                      | 图标库                      |
| TypeScript                                                              | 类型安全                    |

## 快速开始

### 环境要求

- [Node.js](https://nodejs.org) 22+
- [pnpm](https://pnpm.io)

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
# Chrome
pnpm dev

# Firefox
pnpm dev:firefox
```

### 构建

```bash
# Chrome
pnpm build

# Firefox
pnpm build:firefox
```

## 评分算法

综合评分由五个维度加权求和计算，每个维度归一化至 0–100：

| 维度     | 权重 | 说明                                |
| -------- | ---- | ----------------------------------- |
| 贡献量   | 40%  | 已合并 PR 数量（对数缩放，上限 50） |
| 合并率   | 15%  | 已合并 PR / 总 PR                   |
| 代码审查 | 15%  | 审查次数（对数缩放，上限 30）       |
| 参与时长 | 15%  | 首次贡献距今时间（最长 24 个月）    |
| 活跃度   | 15%  | 公开仓库数 + 关注者数（上限 100）   |

### 等级

| 等级 | 分数范围 |
| ---- | -------- |
| S    | 90–100   |
| A    | 70–89    |
| B    | 50–69    |
| C    | 30–49    |
| D    | 0–29     |

## 浏览器支持

| 浏览器  | 状态   |
| ------- | ------ |
| Chrome  | 已支持 |
| Firefox | 已支持 |

## 脚本命令

| 命令                 | 说明                    |
| -------------------- | ----------------------- |
| `pnpm dev`           | 启动开发模式（Chrome）  |
| `pnpm dev:firefox`   | 启动开发模式（Firefox） |
| `pnpm build`         | 生产环境构建（Chrome）  |
| `pnpm build:firefox` | 生产环境构建（Firefox） |
| `pnpm zip`           | 打包发布（Chrome）      |
| `pnpm zip:firefox`   | 打包发布（Firefox）     |
| `pnpm check`         | TypeScript 类型检查     |
| `pnpm lint`          | 运行 ESLint             |
| `pnpm lint:fix`      | 运行 ESLint 并自动修复  |

## 贡献指南

1. Fork 本仓库
2. 创建功能分支（`git checkout -b feat/amazing-feature`）
3. 使用 [Conventional Commits](https://www.conventionalcommits.org) 规范提交
4. Push 并发起 Pull Request

本项目使用：

- **[husky](https://typicode.github.io/husky)** — Git 钩子管理
- **[lint-staged](https://github.com/lint-staged/lint-staged)** — 提交前代码检查
- **[commitlint](https://commitlint.js.org)** — 强制规范化提交信息

## 许可证

MIT
