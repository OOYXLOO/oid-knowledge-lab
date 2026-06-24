# OID-base 授权申请说明

本项目默认只发布 OID-base 的 sitemap 级目录索引，不发布页面正文、raw Markdown、raw HTML 或完整正文 JSONL。

如果后续需要运行完整正文采集，应先取得 OID-base 所有者的明确授权。授权最好使用邮件、工单、公开页面或合同附件这类以后可审计的形式保存；不要把私人邮箱内容、验证码、账号凭据或付款信息提交到仓库。

## 建议申请范围

申请时建议把范围说清楚，避免后续交付边界模糊：

- 采集对象：`https://oid-base.com/sitemap.xml` 中列出的 OID 页面对应 Markdown 入口。
- 采集方式：礼貌限速，例如每次请求间隔至少 `1500 ms`。
- 排除范围：不访问 `robots.txt` 禁止的路径，不访问账号、管理、私有或交互式页面。
- 保存字段：OID、来源 URL、Markdown URL、最后修改时间、ASN.1 表示、描述、标签、子 OID、章节存在情况、正文哈希和采集时间。
- 本地用途：结构化检索、覆盖分析、重复项分析、资产清单核对和报告生成。
- 公开边界：除非授权明确允许再分发，否则公开仓库只发布聚合统计、目录索引、哈希、报告和工具代码，不公开页面正文。

## 英文申请模板

```text
Subject: Request for permission to run a polite OID-base research crawl

Hello,

I am maintaining a small open-source Object Identifier research workspace called OID Knowledge Lab.

The project currently uses only the public OID-base sitemap as a directory index and does not republish OID-base page bodies. I would like to request explicit permission to run a polite, rate-limited crawl of the Markdown OID pages listed in the OID-base sitemap for local structured analysis.

Requested scope:
- Source: OID pages listed in https://oid-base.com/sitemap.xml
- Fetch target: corresponding Markdown pages such as https://oid-base.com/get-md/<OID>
- Rate limit: at least 1500 ms between requests
- Exclusions: all paths disallowed by robots.txt, account/admin/private/interactive pages
- Stored fields: OID, source URL, Markdown URL, last modified date, ASN.1 notation, description, tags, child OIDs, section markers, body hash, fetch timestamp
- Publication boundary: unless you explicitly allow redistribution, the public repository will only publish aggregate statistics, sitemap-level directory metadata, hashes, reports, and crawler code, not OID-base page bodies or raw mirrors

If this is acceptable, could you please confirm the allowed scope and any attribution, rate-limit, storage, or redistribution conditions you require?

Thank you.
```

## 取得授权后的运行方式

拿到明确授权后，先把授权摘要写成不含隐私的短句，例如：

```text
Email approval from OID-base owner on 2026-06-24, local analysis only, no page-body redistribution.
```

然后运行：

```powershell
$env:OID_BASE_FULL_CRAWL_AUTHORIZED = "1"
node src/cli.js crawl --authorized-full --authorization-note "Email approval from OID-base owner on 2026-06-24, local analysis only, no page-body redistribution." --delay-ms 1500 --out data/full --resume
```

`data/full/` 默认被 Git 忽略。除非授权明确允许公开再分发，否则不要把完整正文结果提交到 GitHub。

## 没有授权时的替代路线

如果没有收到授权，继续使用当前可公开数据包：

- OID-base sitemap 级完整目录索引。
- IANA PEN 开放注册表索引。
- OID 覆盖分析报告。
- 本地 OID 资产清单审计工具。
- 静态检索面板。

这条路线仍然可以支持客户的 OID 资产清单核对、未知企业号定位、无效 OID 清理和证据包生成。
