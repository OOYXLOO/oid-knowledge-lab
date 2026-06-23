# OID Knowledge Lab 中文说明

OID Knowledge Lab 是一个面向对象标识符（OID）的负责任采集、清洗和静态检索项目。它把可以公开复现的数据整理成结构化索引，并保留一个经过授权后才可启动的 OID-base 全量采集入口。

## 当前公开数据包

最后刷新时间：2026-06-24

- OID-base sitemap 目录：7,492 条公开 OID 页面入口。
- IANA Private Enterprise Numbers 原始解析：66,101 条注册记录。
- IANA PEN 公开检索索引：65,959 条记录，已排除联系人和邮箱字段。
- 静态检索面板：`public/`。
- 数据集清单：`reports/dataset-manifest.json`，包含文件大小、哈希、来源链接和发布边界。

这个仓库保存的是 OID-base 的完整 sitemap 级目录，不保存 OID-base 页面正文、Markdown 原文或 HTML 镜像。

## 为什么没有公开整站正文

OID-base 的公开规则允许访问 sitemap，也允许读取部分公开页面；但它的使用条款限制下载、打印或复制站内内容只能用于非商业个人用途，并且只能复制小部分数据，除非取得网站所有者的明确授权。

因此本仓库采用三个边界：

- 可以公开：爬虫代码、robots/sitemap 检查、小样本运行收据、OID-base sitemap 级目录、IANA PEN 开放数据报告、去联系人字段后的公开检索索引、静态面板。
- 不公开：OID-base 全站页面正文、raw Markdown/HTML 镜像、未授权的完整 JSONL 正文数据。
- 授权后可运行：带 `OID_BASE_FULL_CRAWL_AUTHORIZED=1` 和授权说明的全量采集命令。

相关入口：

- `https://oid-base.com/robots.txt`
- `https://oid-base.com/sitemap.xml`
- `https://oid-base.com/llms.txt`
- `https://oid-base.com/disclaimer.htm.md`

## 快速运行

```bash
npm run check
npm test
npm run refresh:publishable
npm run build:site
npm run crawl:sample
npm run report
```

## 重新生成可公开数据包

```bash
npm run refresh:publishable
```

这个命令会依次完成：

1. 重新抓取 OID-base sitemap，并生成 `reports/oid-base-sitemap-index.json`。
2. 重新导入 IANA PEN 注册表，并生成聚合报告和公开检索索引。
3. 重新生成 `public/` 静态页面。
4. 重新生成 `reports/dataset-manifest.json`。

## 授权后的全量采集

只有在取得 OID-base 所有者明确授权后，才运行以下命令：

```bash
set OID_BASE_FULL_CRAWL_AUTHORIZED=1
node src/cli.js crawl --authorized-full --authorization-note "authorization reference" --delay-ms 1500 --out data/full
```

没有授权时，`crawl` 命令最多只做小样本采集，用于验证解析器和数据模型。

## 关键文件

- `src/cli.js`：命令行入口。
- `src/sitemap.js`：OID-base sitemap 解析和目录索引生成。
- `src/parser.js`：OID-base Markdown 小样本解析器。
- `src/ianaPen.js`：IANA PEN 注册表导入和清洗。
- `src/manifest.js`：公开数据包清单和边界检查。
- `reports/oid-base-sitemap-index.json`：OID-base sitemap 级目录。
- `reports/iana-pen-public-index.json`：不含联系人字段的 IANA PEN 公开索引。
- `reports/dataset-manifest.json`：可公开数据包清单。
- `public/index.html`：静态检索面板入口。

## GitHub Pages

仓库包含 `.github/workflows/pages.yml`。远端仓库创建后，可以在 GitHub Pages 设置里选择 GitHub Actions 作为发布来源；工作流会发布 `public/` 目录里的静态面板。

如果只想本地预览，可以直接打开 `public/index.html`。
