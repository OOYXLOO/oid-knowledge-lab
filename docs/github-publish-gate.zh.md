# GitHub 发布门槛

这个项目可以作为公开仓库发布，但公开仓库只保存爬虫代码、可复现的开放数据索引、静态检索页面、派生报告和发布护栏。

不要提交：

- OID-base 页面正文镜像；
- 未授权的完整 raw Markdown/HTML；
- `data/full/`、`data/raw/`、`data/sample/records.jsonl`；
- IANA 联系人级 JSONL；
- 任何私有客户资产清单、账号数据、cookie、token、付款、税务或 KYC 信息。

## 首次发布步骤

1. 在 GitHub 创建空仓库：`OOYXLOO/oid-knowledge-lab`。
2. 仓库可以设为 Public；不要额外添加 README、license 或 `.gitignore`，本地仓库已经包含这些文件。
3. 本地检查：

```powershell
git remote -v
git status -sb
npm run audit:local:stable
npm audit --audit-level=moderate
git push -u origin master
```

## 当前发布状态

- 远端地址：`https://github.com/OOYXLOO/oid-knowledge-lab.git`
- 主分支已能推送到 GitHub。
- GitHub Pages 使用仓库的 Pages/Actions 配置发布 `public/` 目录。
- 公开提交前优先运行 `npm run audit:local:stable`，它会固定报告生成时间，避免仅因时间戳产生无意义 diff。

## 授权完整爬取

完整页面正文爬取不是默认公开流程。只有取得 OID-base 所有者明确授权后，才运行：

```powershell
$env:OID_BASE_FULL_CRAWL_AUTHORIZED = "1"
node src/cli.js crawl --authorized-full --authorization-note "authorization reference" --delay-ms 1500 --out data/full --resume
```

`data/full/` 默认不进入 Git。若授权文本允许公开再分发，也应先更新 `docs/compliance.md` 和发布护栏，再单独提交。
