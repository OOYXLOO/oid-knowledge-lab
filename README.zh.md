# OID Knowledge Lab 中文说明

OID Knowledge Lab 是一个面向对象标识符（OID）的公开数据采集、清洗、检索和分析项目。

这个项目的目标不是把 OID-base 整站正文复制到 GitHub，而是做一套可以长期运营的 OID 知识库底座：

- 完整保存 OID-base 当前公开 `sitemap.xml` 中的 OID 页面目录。
- 不保存 OID-base 页面正文、raw Markdown、raw HTML 或未授权全文 JSONL 镜像。
- 导入 IANA Private Enterprise Numbers 这类可公开复用的数据源。
- 生成可搜索静态页面、覆盖分析、数据清单、资产审计样例和交付报告样例。
- 保留一个“取得授权后才能运行”的全量正文采集入口。

## 当前数据快照

最后刷新日期：2026-06-24。

- OID-base sitemap 目录：7,492 条公开 OID 页面入口。
- IANA PEN 原始解析：66,101 条注册记录。
- IANA PEN 公开检索索引：65,959 条记录，已排除联系人和邮箱字段。
- OID 覆盖报告：`reports/coverage-report.md`。
- 来源政策快照：`reports/source-policy.md`。
- 授权全量采集计划：`reports/authorized-crawl-plan.md`。
- 示例资产审计报告：`reports/asset-audit.md`。
- 示例修复队列：`reports/remediation-board.md` 和 `reports/remediation-board.csv`。
- 示例启动简报：`reports/sample-engagement-brief.md`。
- 示例交付包：`reports/sample-delivery-pack.md`。
- 静态检索面板：`public/index.html`。
- 浏览器版样例交付页：`public/sample-assessment.html`。
- 数据集清单：`reports/dataset-manifest.json`。

仓库中保存的是 OID-base 的完整 sitemap 级目录，不包含 OID-base 页面正文。

## 为什么不公开整站正文

OID-base 的使用条款说明，站点内容和数据汇编默认保留权利；下载、打印或复制站内内容必须限于非商业个人用途和“小部分数据”，除非得到站点所有者的明确授权。

因此本项目分成三层：

- 可以公开：爬虫代码、robots/sitemap 检查、运行回执、OID-base sitemap 目录、IANA PEN 公开索引、静态页面、覆盖分析、数据清单、来源政策快照、样例审计报告。
- 不公开：OID-base 全站页面正文、raw Markdown/HTML 镜像、未授权完整 JSONL 正文结果、账号数据、Cookie、token、私信、付款和 KYC 信息。
- 授权后可运行：带 `OID_BASE_FULL_CRAWL_AUTHORIZED=1` 和授权说明的完整采集命令。

相关来源：

- `https://oid-base.com/robots.txt`
- `https://oid-base.com/sitemap.xml`
- `https://oid-base.com/llms.txt`
- `https://oid-base.com/disclaimer.htm`

## 快速运行

```bash
npm run check
npm test
npm run refresh:publishable
npm run source-policy
npm run plan:authorized-full-crawl
npm run build:site
npm run audit:assets
npm run remediation:sample
npm run coverage:oid
npm run brief:sample
npm run delivery:sample
npm run guard:publishable
```

如果只想验证 OID-base 页面解析器，可以运行小样本采集：

```bash
npm run crawl:sample
npm run crawl:sample:resume
npm run report
```

小样本 JSON/JSONL 输出会写入 `data/sample/`，并被 Git 忽略。只有 `data/sample/RUN-*.md` 这种不含页面正文的运行回执适合提交。

如果单个 OID 页面临时返回 503 或网络错误，爬虫会把失败写入 `data/sample/failures.jsonl` 或授权全量目录中的同名文件，并继续处理后续条目；`records-summary.json` 和 `crawl-state.json` 会记录失败数量和失败 OID，便于后续 `--resume` 续跑。

## 重新生成可公开数据包

```bash
npm run refresh:publishable
```

这个命令会依次完成：

1. 重新抓取 OID-base sitemap，并生成 `reports/oid-base-sitemap-index.json`。
2. 重新导入 IANA PEN 注册表，并生成聚合报告和公开检索索引。
3. 重新生成 `reports/source-policy.json` 和 `reports/source-policy.md`。
4. 重新生成授权全量采集计划。
5. 重新生成 `public/` 静态页面。
6. 重新生成 `reports/dataset-manifest.json`。

## OID-base 目录索引

`reports/oid-base-sitemap-index.json` 是当前可公开的核心数据文件。它包含：

- OID 值。
- OID-base 页面 URL。
- 对应 Markdown URL。
- sitemap 中的最后修改日期。
- 根弧。
- OID 深度。

它不包含页面正文、描述正文或 raw Markdown。

## IANA PEN 公开索引

```bash
npm run import:iana-pen
```

这个命令会导入 IANA Private Enterprise Numbers 注册表。

完整 JSONL 位于 `data/iana/`，默认被 Git 忽略，因为它可能包含联系人字段。可提交的公开索引是 `reports/iana-pen-public-index.json`，只保留企业号、OID 和组织名。

## OID 资产审计

如果有一份本地 OID 清单，可以用下面的命令做交叉分析：

```bash
npm run audit:assets
```

默认输入是 `examples/sample-assets.csv`，输出：

- `reports/asset-audit.json`
- `reports/asset-audit.md`

真实客户清单不要提交到仓库。可以在本地指定输入：

```bash
node src/cli.js audit-assets --in path/to/assets.csv --out reports/asset-audit.json --markdown reports/asset-audit.md
```

静态页面 `public/index.html` 也提供浏览器端本地审计面板。用户可以直接粘贴 OID CSV，分析在浏览器里完成，不上传到服务器。站点还会生成 `public/sample-assessment.html`，把样例摘要、修复队列、证据映射和数据边界做成一个可扫读的交付页。

## 修复队列与交付包

```bash
npm run remediation:sample
npm run brief:sample
npm run delivery:sample
```

这些命令会把样例资产审计结果变成：

- 客户可读的启动简报。
- 可导入表格或 issue tracker 的修复队列。
- 脱敏交付包。

这部分是后续商业化更有价值的方向：给客户分析他们自己的 OID/MIB/PKI 清单，而不是出售未授权的 OID-base 镜像。

## 发布护栏

```bash
npm run guard:publishable
```

护栏会检查 Git 已跟踪文件，防止以下内容被误发到公开仓库：

- `data/full/` 授权全量采集结果。
- `data/raw/` raw Markdown/HTML 镜像。
- `data/sample/records.jsonl` 等样本正文结果。
- `data/iana/*.jsonl` 这类可能包含联系人字段的完整导入。
- 声称包含 OID-base 正文或 IANA 联系人字段的数据清单。

## 授权后的完整采集

只有在取得 OID-base 所有者明确授权后，才运行：

```powershell
$env:OID_BASE_FULL_CRAWL_AUTHORIZED = "1"
node src/cli.js crawl --authorized-full --authorization-note "authorization reference" --delay-ms 1500 --out data/full --resume
```

没有授权时，`crawl` 命令最多只做小样本采集，用于验证解析器和数据模型。

## 建议阅读顺序

1. `README.zh.md`：先看项目整体边界。
2. `reports/dataset-manifest.json`：确认哪些数据可以公开。
3. `reports/oid-base-sitemap-index.json`：查看完整 sitemap 目录数据。
4. `reports/coverage-report.md`：看 IANA PEN 与 OID-base sitemap 的覆盖关系。
5. `reports/asset-audit.md`：看本项目如何分析一份 OID 清单。
6. `public/sample-assessment.html`：看浏览器里可以展示给评审或客户的样例交付页。
7. `reports/sample-delivery-pack.md`：看未来可以交付给客户的报告形态。
8. `docs/authorized-full-crawl.zh.md`：如果以后拿到授权，再看全量正文采集流程。

## GitHub Pages

仓库包含 `.github/workflows/pages.yml`。远端仓库创建后，可以在 GitHub Pages 设置中选择 GitHub Actions 作为发布来源，工作流会发布 `public/` 目录里的静态页面。
