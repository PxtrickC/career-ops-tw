# 模式：deep —— Deep Research Prompt

產生一份結構化的 prompt，可以直接丟給 Perplexity / Claude / ChatGPT，包含 6 個研究軸線：

```
## Deep Research：[公司] —— [角色]

脈絡：我正在評估 [公司] 的 [角色] 候選資格。我需要可直接用於面試的行動情報。

### 1. AI 策略
- 他們有哪些產品 / feature 使用 AI/ML？
- 他們的 AI stack 是什麼？（模型、infra、tools）
- 他們有 engineering blog 嗎？發什麼內容？
- 有發表過 AI 相關的 paper 或 talk 嗎？

### 2. 近期動向（最近 6 個月）
- AI / ML / product 的關鍵 hire？
- 併購或合作？
- Product launch 或 pivot？
- 募資輪或領導層異動？

### 3. Engineering 文化
- 他們怎麼出貨？（deploy 節奏、CI/CD）
- Mono-repo 或 multi-repo？
- 使用哪些語言 / framework？
- Remote-first 還是 office-first？
- Glassdoor / Blind / 面試趣 對 engineering 文化的評論？

### 4. 可能面臨的挑戰
- 有什麼 scaling 問題？
- Reliability、cost、latency 上的挑戰？
- 有沒有正在做 migration？（infra、model、platform）
- 評論中提到哪些 pain point？

### 5. 競爭者與差異化
- 主要競爭對手是誰？
- 他們的 moat / 差異點是什麼？
- 對比競爭對手他們怎麼定位？

### 6. 候選人切入角度
給定我的背景（請從 cv.md 與 profile.yml 讀取具體經歷）：
- 我可以為這個團隊帶來什麼獨特價值？
- 我哪些專案對這個角色最相關？
- 面試時我應該講哪個故事？
```

依照當次評估的具體脈絡，把每一節都客製化。
