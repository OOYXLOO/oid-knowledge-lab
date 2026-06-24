# OID Knowledge Lab 中文说明

OID Knowledge Lab 是一个面向对象标识符（OID）的公开数据采集、清洗、检索和分析项目。它的目标不是复制 OID-base 的整站正文，而是把可以公开复现的数据整理成结构化索引，并保留一个“获得授权后才可运行”的完整正文采集入口。

## 当前已生成的数据包

最后刷新时间：2026-06-24。

- OID-base sitemap 目录：`7,492` 条公开 OID 页面入口。
- IANA Private Enterprise Numbers 原始解析：`66,101` 条注册记录。
- IANA PEN 公开检索索引：`65,959` 条记录，已排除联系人和邮箱字段。
- OID 覆盖报告：`reports/coverage-report.md`，比较 IANA PEN 与 OID-base sitemap 的覆盖关系。
- 示例资产审计报告：`reports/asset-audit.md`。
- 静态检索面板：`public/`。
- 数据集清单：`reports/dataset-manifest.json`，包含文件大小、哈希、来源链接和发布边界。

这个仓库保存的是 OID-base 的完整 sitemap 级目录，不保存 OID-base 页面正文、Markdown 原文或 HTML 镜像。

## 为什么不公开整站正文

OID-base 公开了 `robots.txt`、`sitemap.xml` 和 `llms.txt`，这些可以用来发现公开页面入口。但它的使用条款说明：下载、打印或复制站内内容只能用于非商业个人用途，并且只能限于小部分数据；除非获得 OID-base 所有者的明确授权。

因此本项目分成三层：

- 可以公开：爬虫代码、robots/sitemap 检查、小样本运行记录、OID-base sitemap 级目录、IANA PEN 开放数据报告、去除联系人字段后的公开检索索引、静态页面、覆盖分析报告。
- 不公开：OID-base 全站页面正文、raw Markdown/HTML 镜像、未授权的完整 JSONL 正文结果。
- 授权后可运行：带 `OID_BASE_FULL_CRAWL_AUTHORIZED=1` 和授权说明的完整采集命令。

相关来源：

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
npm run audit:assets
npm run coverage:oid
npm run guard:publishable
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

## OID 覆盖报告

```bash
npm run coverage:oid
```

这个命令会比较 `reports/iana-pen-public-index.json` 和 `reports/oid-base-sitemap-index.json`，输出：

- `reports/coverage-report.json`
- `reports/coverage-report.md`

当前真实运行结果显示：

- IANA PEN 公开记录：`65,959`
- OID-base 精确企业号匹配：`127`
- 只有子树匹配：`289`
- 缺少 OID-base sitemap 级证据：`65,543`
- 覆盖评分：`1/100`

这个报告的价值在于把“OID 资产清单里哪些条目缺少公开佐证”变成一份可执行的核对队列。后续可以把它扩展成面向客户资产清单的审计工具。

## 样例交付包

```bash
npm run delivery:sample
```

这个命令会生成 `reports/sample-delivery-pack.md`。它把样例资产审计、OID-base 覆盖上下文、行动计划、首批发现和客户数据边界合并成一份可给潜在客户看的脱敏交付样例。

## OID 资产清单分析

如果你有一份本地 OID 清单，可以用下面的命令把它和 IANA PEN、OID-base sitemap 目录做交叉分析：

```bash
npm run audit:assets
```

默认示例输入是 `examples/sample-assets.csv`，输出是：

- `reports/asset-audit.json`
- `reports/asset-audit.md`

真实客户清单不要提交到仓库，只在本地用 `--in` 指定：

```bash
node src/cli.js audit-assets --in path/to/assets.csv --out reports/asset-audit.json --markdown reports/asset-audit.md
```

输入可以是简单 CSV 或 tab 分隔文件，需要 `oid` 列，可选 `asset`、`name`、`id` 或 `label` 列。

静态页面 `public/index.html` 里也已经加入浏览器端本地审计面板。它接受同样的简单 CSV 格式，直接在浏览器里用已发布的 IANA/OID-base 索引完成分析，不需要上传客户清单。

## 发布护栏

```bash
npm run guard:publishable
```

这个命令会检查 Git 已跟踪文件，防止以下内容被误发布：

- `data/full/` 授权完整采集结果。
- `data/raw/` raw Markdown/HTML 镜像。
- `data/sample/records.jsonl` 等解析样本正文。
- `data/iana/*.jsonl` 可能含联系人字段的完整导入。
- 数据清单里声明包含 OID-base 正文或 IANA 联系人字段的包。

## 授权后的完整采集

只有在获得 OID-base 所有者明确授权后，才运行以下命令：

```powershell
$env:OID_BASE_FULL_CRAWL_AUTHORIZED = "1"
node src/cli.js crawl --authorized-full --authorization-note "authorization reference" --delay-ms 1500 --out data/full
```

没有授权时，`crawl` 命令最多只做小样本采集，用于验证解析器和数据模型。

## 关键文件

- `src/cli.js`：命令行入口。
- `src/sitemap.js`：OID-base sitemap 解析和目录索引生成。
- `src/parser.js`：OID-base Markdown 小样本解析器。
- `src/ianaPen.js`：IANA PEN 注册表导入和清洗。
- `src/coverage.js`：IANA PEN 与 OID-base sitemap 覆盖分析。
- `src/assetAudit.js`：本地 OID 资产清单审计。
- `src/manifest.js`：公开数据包清单和边界检查。
- `src/publishGuard.js`：发布护栏，防止误提交未授权正文或联系人数据。
- `reports/oid-base-sitemap-index.json`：OID-base sitemap 级目录。
- `reports/iana-pen-public-index.json`：不含联系人字段的 IANA PEN 公开索引。
- `reports/coverage-report.md`：OID 覆盖报告。
- `reports/asset-audit.md`：示例 OID 资产清单分析报告。
- `reports/dataset-manifest.json`：可公开数据包清单。
- `public/index.html`：静态检索面板入口。

## GitHub Pages

仓库包含 `.github/workflows/pages.yml`。远端仓库创建后，可以在 GitHub Pages 设置里选择 GitHub Actions 作为发布来源；工作流会发布 `public/` 目录里的静态面板。

如果只想本地预览，可以直接打开 `public/index.html`。
