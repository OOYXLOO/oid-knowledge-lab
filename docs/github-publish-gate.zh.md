# GitHub 发布门槛

这个项目可以作为公开仓库发布，但公开仓库只保存爬虫代码、可复现的开放数据索引、静态检索页、报告和发布护栏。

不要把 OID-base 页面正文镜像、完整 raw Markdown/HTML、`data/full/`、`data/raw/`、`data/sample/records.jsonl`、IANA 联系人级 JSONL 或任何私有客户资产清单提交到 GitHub。

## 首次发布步骤

1. 在 GitHub 创建空仓库：`OOYXLOO/oid-knowledge-lab`。
2. 仓库可设为 Public；不要添加 README、license 或 `.gitignore`，本地仓库已经包含这些文件。
3. 在本地运行：

```powershell
git remote -v
git status -sb
npm run audit:local
npm audit --audit-level=moderate
git push -u origin master
```

## 当前阻塞记录

- 本地最新提交以 `git log -1 --oneline` 为准；当前提交说明为 `Improve OID crawl resilience`。
- 远端地址：`https://github.com/OOYXLOO/oid-knowledge-lab.git`。
- 2026-06-24 已尝试 `git push -u origin master`，GitHub 返回 `Repository not found`。
- 当前机器的便携 `gh` 位于 `C:\Users\YXL\.codex\tmp\gh-cli-portable\bin\gh.exe`，但 `gh auth status` 显示未登录。
- 后续只需要先创建空仓库，或登录 `gh` 后运行 `gh repo create OOYXLOO/oid-knowledge-lab --public --source . --remote origin --push`。

如果 GitHub Pages 要展示 `public/` 静态检索面板，在仓库 Settings -> Pages 里选择 GitHub Actions 作为发布来源；仓库内的 `.github/workflows/pages.yml` 会发布 `public/` 目录。

## 授权完整爬取

完整页面正文爬取不是默认公开流程。只有取得 OID-base 所有者明确授权后，才运行：

```powershell
$env:OID_BASE_FULL_CRAWL_AUTHORIZED = "1"
node src/cli.js crawl --authorized-full --authorization-note "authorization reference" --delay-ms 1500 --out data/full --resume
```

`data/full/` 默认不进入 Git。若授权文本允许公开再分发，也应先更新 `docs/compliance.md` 和发布护栏，再单独提交。
