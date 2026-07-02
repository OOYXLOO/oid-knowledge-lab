# Devpost 复制提交包（中文操作版）

用途：这份文件只服务提交动作。Devpost 表单里需要英文内容时，直接复制下面对应代码块；中文说明只给我们自己看。

## 1. Project title

```text
Review Log Agent for Slack
```

## 2. Tagline

```text
Turn messy Slack review threads into source-aware evidence logs, judge-ready summaries, and safer follow-up actions.
```

## 3. Inspiration

```text
Review work often happens in fast Slack threads, but the durable evidence gets lost: who asked for what, which source link supports a claim, which risk was accepted, and what the next action should be. Review Log Agent turns those threads into structured evidence logs that teams can audit later.
```

## 4. What it does

```text
Review Log Agent accepts Slack-style review messages, extracts decisions and source references, scores evidence quality, and generates a concise handoff log. The demo includes a slash command endpoint, an interactive playground, a submission page, public documentation, a demo video, and a source snapshot.
```

## 5. How we built it

```text
The project is a small Node.js and Vercel app with a Slack slash command handler, a review-log core, an MCP-style tool boundary, static demo pages, publish-safety guardrails, and tests for the review logic, Slack response contract, generated submission page, and public docs copy step. The public playground uses synthetic Slack-style data so judges can try the workflow without private workspace access.
```

## 6. Challenges we ran into

```text
The main challenge was keeping the agent useful without letting it overclaim. The implementation focuses on source-aware summaries, explicit uncertainty, safe publication boundaries, and Slack-compatible response shapes rather than pretending to fully automate human judgment.
```

## 7. Accomplishments that we're proud of

```text
- Working public demo and browser playground.
- Slack slash command endpoint that returns Slack-compatible JSON.
- Public agent-tool API with a build_review_log tool contract.
- Demo video and submission page.
- Public source snapshot.
- Slack app manifest template for a slash command and message shortcut.
- Publish guard that checks public files for unsafe content before release.
- Local tests for review logic, MCP-style tool output, Slack handler behavior, submission rendering, agent API behavior, and public docs copying.
```

## 8. What we learned

```text
The useful part of a Slack agent is not only generating an answer. For review-heavy teams, the agent also needs to preserve evidence, uncertainty, source boundaries, and unresolved blockers. A compact evidence log makes the human decision easier to inspect.
```

## 9. What's next

```text
Next steps are a real Slack app installation, richer Slack interactivity, workspace-specific review templates, and optional export to GitHub issues or documentation pull requests.
```

## 10. Built with

```text
JavaScript
Node.js
Vercel
Slack API
MCP-style tool interface
Static HTML/CSS
```

## 11. Demo URL

```text
https://review-log-agent-slack.vercel.app/
```

## 12. Video URL

Devpost 规则要求视频公开上传到 YouTube、Vimeo、Facebook Video 或 Youku。下面的 MP4 可以先用于预览；最终提交时如果 Devpost 表单不接受直接 MP4，请先上传到允许的平台，再填平台 URL。

```text
https://review-log-agent-slack.vercel.app/media/review-log-agent-slack-demo.mp4
```

## 13. Source URL

优先使用独立仓库；如果独立仓库还没有创建，就使用 OID Knowledge Lab 的公开源码快照。

```text
https://github.com/OOYXLOO/oid-knowledge-lab/tree/main/examples/review-log-agent-slack
```

## 14. Extra reviewer links

```text
Submission page:
https://review-log-agent-slack.vercel.app/submission.html

Interactive playground:
https://review-log-agent-slack.vercel.app/playground.html

Official requirements map:
https://review-log-agent-slack.vercel.app/docs/official-submission-requirements.md

Slack sandbox setup card:
https://review-log-agent-slack.vercel.app/docs/slack-sandbox-setup-card.md

Agent tools API:
https://review-log-agent-slack.vercel.app/api/agent/tools

Agent call API:
https://review-log-agent-slack.vercel.app/api/agent/call
```

## 15. Slack app / sandbox URL

这里必须等 Slack Developer Sandbox 或 Slack app 创建后再填。创建时可以使用：

```text
Sandbox event code:
SABC-7X2K-M9PL-4QFN

Judge access:
slackhack@salesforce.com
testing@devpost.com
```

```text
https://review-log-agent-slack.vercel.app/docs/slack-sandbox-setup-card.md
```

## 16. 最短提交顺序

1. 打开 Slack app setup card，创建或确认 Slack app / sandbox。
2. 拿到 Slack app 或 sandbox URL。
3. 打开 Devpost 项目提交页。
4. 复制本文件第 1 到第 15 节的内容。
5. Source URL 如果独立仓库还不存在，先用 OID source snapshot。
6. 提交后，把 Devpost submission URL 记回本地路线卡。
