# OID Knowledge Lab 阅读顺序

如果你只想快速同步这个项目做到什么程度，按下面顺序读：

1. `README.zh.md`
   - 看项目目标、数据边界、当前快照和常用命令。
2. `docs/snapshot-20260624.zh.md`
   - 看已经实际运行过哪些采集，生成了哪些公开文件。
3. `reports/source-policy.md`
   - 看为什么不能直接把 OID-base 整站正文放进公开 GitHub。
4. `reports/dataset-manifest.json`
   - 看公开数据包里到底包含哪些文件、哈希、大小和边界声明。
5. `reports/oid-base-sitemap-index.json`
   - 看完整的 OID-base sitemap 级目录。这个文件很大，适合用搜索或脚本看。
6. `public/index.html`
   - 看面向人的静态检索页面。它可以浏览 IANA PEN 和 OID-base sitemap 目录，也可以粘贴本地 OID 清单做浏览器端审计。
7. `reports/coverage-report.md`
   - 看 IANA PEN 与 OID-base sitemap 的覆盖差异。
8. `reports/asset-audit.md`
   - 看一份 OID 资产清单会被如何分析。
9. `reports/remediation-board.md` 或 `reports/remediation-board.csv`
   - 看如何把发现转成客户可以执行的修复队列。
10. `reports/sample-delivery-pack.md`
    - 看未来可以交付给客户的脱敏报告形态。
11. `docs/authorized-full-crawl.zh.md`
    - 只有在考虑申请授权、做完整正文采集时再读。
12. `docs/source-authorization-request.zh.md`
    - 需要向 OID-base 所有者申请授权时使用。

一句话：先读中文 README 和快照，再看 manifest 与静态页面，最后才看授权全量采集说明。

当前公开演示入口：

- `https://oid-knowledge-lab.vercel.app/`
- `https://oid-knowledge-lab.vercel.app/direct-client-fit.html`
- `https://oid-knowledge-lab.vercel.app/consulting-brief.html`
- `https://oid-knowledge-lab.vercel.app/starter-scope.html`
