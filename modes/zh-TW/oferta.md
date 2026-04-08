# 模式：oferta —— 完整 A–F 評估

當候選人貼上一份職缺（文字或 URL），**一律**輸出全部 6 個區塊。

## 步驟 0 —— 偵測 Archetype

把職缺分類到 6 個 archetypes 之一（見 `_shared.md`）。如果是混合型，標出最接近的 2 個。這會決定：

- B 區塊要優先強調哪些 proof points
- E 區塊要怎麼重寫 summary
- F 區塊要準備哪些 STAR 故事

## 區塊 A —— 角色摘要

用表格列出：

- 偵測到的 archetype
- Domain（platform / agentic / LLMOps / ML / enterprise / consumer / brand）
- Function（build / consult / manage / deploy / design）
- Seniority
- Remote 政策（全遠端 / 混合 / 進辦公室）
- 團隊規模（如果有提到）
- TL;DR 一句話總結

## 區塊 B —— 與 CV 的 Match

讀 `cv.md`。建立表格：把 JD 中每個條件對應到 CV 的精確字句。

**依 archetype 調整：**

- Founding Designer → 強調 0→1 出貨、品牌＋產品兼顧、自驅
- Product Designer (AI-native) → 強調 AI 產品節奏、prototype 速度、與工程協作
- Design Engineer → 強調獨立用 AI 工具出貨、無傳統工程背景仍能 ship
- Brand & Growth → 強調品牌策略 × GTM × 社群整合
- Founding PM → 強調出貨節奏、商業敏感、跨職能協作
- Forward Deployed → 強調快速交付、面對客戶

接著列出 **Gaps（缺口）**，每一項都要附帶 mitigation 策略：

1. 是 hard blocker 還是 nice-to-have？
2. 候選人有沒有相鄰經驗可以類比？
3. portfolio 裡有沒有相關專案可以補位？
4. 具體 mitigation 計畫（一句求職信用語、一個 quick prototype 等）

## 區塊 C —— Level 與策略

1. **JD 預期 level** vs **候選人在此 archetype 的自然 level**
2. **「不說謊地賣 senior」計畫**：依 archetype 調整的具體說法、要強調的具體成就、如何把創業／operator 經驗包裝成優勢
3. **「萬一被 downlevel」備案**：薪酬合理就接受，談 6 個月 review，要清楚的升遷標準

## 區塊 D —— 薪酬與市場需求

用 WebSearch 查：

- 該職位目前薪資（Glassdoor、Levels.fyi、Cake、104 薪資情報、Yourator、LinkedIn Salary）
- 該公司的薪酬聲譽（Glassdoor、面試趣、Blind）
- 該角色在亞洲／全球遠端市場的需求趨勢

用表格呈現，附上資料來源。沒有資料就誠實寫出來，不要編。

**台灣／華語市場必查項目：**

- 年終獎金幾個月？三節獎金？納入年薪計算
- 變動分紅、bonus、options/RSU？
- 試用期長度？是否符合法規？
- 競業條款？補償？
- 投保薪資是否按實際薪資申報？
- 是否「責任制」？是否經主管機關核定？
- 派遣／約聘還是正職？

## 區塊 E —— 客製化計畫

| # | 段落 | 目前狀態 | 建議修改 | 為什麼 |
|---|------|----------|----------|--------|
| 1 | Summary | ... | ... | ... |
| ... | ... | ... | ... | ... |

CV 的 top 5 修改 + LinkedIn 的 top 5 修改，最大化 match。
**注意：所有 CV／LinkedIn 修改建議都以英文輸出**（CV 一律保持英文）。

## 區塊 F —— 面試準備計畫

依 JD 條件對應 6–10 個 STAR+R 故事（STAR + **Reflection**）：

| # | JD 條件 | STAR+R 故事 | S | T | A | R | Reflection |
|---|---------|-------------|---|---|---|---|------------|

**Reflection** 欄位記錄學到了什麼、下次會怎麼做不一樣。這是 seniority 的訊號 —— junior 描述發生了什麼，senior 會萃取教訓。

**Story Bank：**如果 `interview-prep/story-bank.md` 存在，先檢查這些故事是否已經在裡面。如果沒有就新增。長期下來會累積 5–10 個可重複使用的核心故事，能應付各種面試題。

**依 archetype 篩選與包裝：**

- Founding Designer → 強調 0→1 與獨立交付
- Product Designer (AI-native) → 強調與 AI 共創節奏
- Design Engineer → 強調用 AI 工具獨立 ship
- Brand & Growth → 強調品牌與成長綁定的決策
- Founding PM → 強調 trade-off 與 discovery
- Forward Deployed → 強調快速交付與客戶端

也要包含：

- 1 個推薦 case study（推薦哪個專案，怎麼簡報）
- Red flag 問題與如何回答（例如：「為什麼結束你的公司？」「你帶過幾個直屬部屬？」「為什麼這麼短時間就換工作？」）

---

## 評估後

A–F 區塊產出後，**一律**執行：

### 1. 儲存 report .md

把完整評估存到 `reports/{###}-{company-slug}-{YYYY-MM-DD}.md`。

- `{###}` = 下一個流水號（3 位、補零）
- `{company-slug}` = 公司名小寫、無空白（用連字號）
- `{YYYY-MM-DD}` = 今天日期

**Report 格式：**

```markdown
# 評估：{公司} —— {角色}

**日期：** {YYYY-MM-DD}
**Archetype：** {偵測結果}
**Score：** {X/5}
**URL：** {職缺 URL}
**PDF：** {路徑或 pending}

---

## A) 角色摘要
（A 區塊完整內容）

## B) 與 CV 的 Match
（B 區塊完整內容）

## C) Level 與策略
（C 區塊完整內容）

## D) 薪酬與市場需求
（D 區塊完整內容）

## E) 客製化計畫
（E 區塊完整內容）

## F) 面試準備計畫
（F 區塊完整內容）

## G) 申請表單回答草稿
（僅在 score >= 4.5 時提供 —— 表單答案草稿，依職缺語言；JD 是中文就用中文，否則英文）

---

## 抽出的關鍵字
（從 JD 中萃取 15–20 個關鍵字，供 ATS 最佳化使用）
```

### 2. 寫入 tracker

依 `_shared.md` 的 TSV 規則，把新增資料寫到 `batch/tracker-additions/{num}-{company-slug}.tsv`，**不要直接編輯 `applications.md`**。

欄位：

- 流水號
- 今天日期
- 公司
- 角色
- 狀態：`Evaluated`
- Score：X.X/5
- PDF：✅ 或 ❌
- Report：相對連結（例如 `[001](reports/001-company-2026-01-01.md)`）
- 備註：一行摘要（可用繁體中文）
