# OID Knowledge Lab 中文说明

这是一个 OID 知识库采集与分析项目。它的目标是把公开、可复现、可发布的 OID 数据整理成后续可以分析的结构化资产。

## 当前已经采集到什么

2026-06-24 重新生成后的公开数据包包括：

- OID-base sitemap 目录：7,492 条公开 OID 页面入口。
- IANA PEN 原始注册表：66,101 条记录。
- IANA PEN 公开检索索引：65,959 条记录，已排除联系人、邮箱等不适合直接发布的字段。
- 静态检索页面：`public/`。
- 数据集清单：`reports/dataset-manifest.json`，包含每个公开产物的大小、哈希、来源和边界说明。

## 重要边界

这个仓库保存的是 OID-base 的完整 sitemap 目录层数据，不是 OID-base 全站正文镜像。

原因是 OID-base 的条款限制复制、下载和复用其站内数据。除非后续拿到明确授权，否则仓库不会公开保存 OID-base 页面正文、Markdown 原文或 HTML 原文。

## 如何重新生成

```bash
npm run refresh:publishable
```

这会依次完成：

1. 重新抓取 OID-base sitemap。
2. 重新导入 IANA PEN 开放注册表。
3. 重新生成静态检索页面。
4. 重新生成 `reports/dataset-manifest.json` 数据集清单。

## 关键文件

- `src/cli.js`：命令行入口。
- `src/sitemap.js`：OID-base sitemap 解析和目录索引生成。
- `src/ianaPen.js`：IANA PEN 注册表导入和清洗。
- `src/manifest.js`：公开数据包清单和安全边界检查。
- `reports/oid-base-sitemap-index.json`：OID-base 目录层完整结果。
- `reports/iana-pen-public-index.json`：公开可搜索 PEN 索引。
- `reports/dataset-manifest.json`：本次数据包的完整性清单。
- `public/index.html`：本地静态检索入口。

## 后续可做的分析方向

- OID 根弧和深度分布分析。
- 企业 PEN 新增速度和组织分布分析。
- OID-base sitemap 最新更新趋势分析。
- 与其他公开 OID/ASN.1 注册表做交叉比对。

