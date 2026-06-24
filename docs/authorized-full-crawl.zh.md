# 授权全量采集说明

本项目默认不会公开镜像 OID-base 的页面正文。全量采集只应在取得 OID-base 所有者明确授权后运行。

## 默认模式

默认命令只做小样本采集：

```bash
npm run crawl:sample
```

这会抓取少量 Markdown 页面，用于验证解析器、字段模型和报告生成。生成的 JSONL 文件位于 `data/sample/`，并被 `.gitignore` 忽略。

## 全量模式的必要条件

运行全量采集前需要同时满足：

- 已取得 OID-base 所有者明确授权。
- 授权范围允许保存所需字段。
- 授权范围允许后续分析用途。
- 不采集 robots 禁止的路径。
- 使用礼貌延迟，避免高频请求。
- 不把未授权的正文镜像提交到公开 Git 仓库。

## 全量采集命令

PowerShell：

```powershell
$env:OID_BASE_FULL_CRAWL_AUTHORIZED = "1"
node src/cli.js crawl --authorized-full --authorization-note "authorization reference" --delay-ms 1500 --out data/full
```

Bash：

```bash
OID_BASE_FULL_CRAWL_AUTHORIZED=1 \
node src/cli.js crawl --authorized-full --authorization-note "authorization reference" --delay-ms 1500 --out data/full
```

`--authorization-note` 应写成以后可审计的授权摘要，例如公开授权页 URL、合同编号或脱敏后的授权记录编号。不要在仓库里保存私人邮件、验证码、账号信息、付款信息或任何敏感凭据。

## 发布边界

可以发布：

- 爬虫代码。
- 聚合统计。
- 不含正文的 sitemap 目录。
- 不含联系人字段的开放数据索引。
- 数据清单和哈希。

不要发布：

- OID-base 页面正文。
- OID-base raw Markdown/HTML 镜像。
- 未授权的完整 JSONL 正文结果。
- 私人通信、账号、Cookie、token、付款、税务或 KYC 信息。

## 发布前检查

```bash
npm run guard:publishable
```

这个命令会检查 Git 已跟踪文件和数据清单，阻止误提交 `data/full/`、`data/raw/`、正文样本 JSONL 或联系人级导入数据。
