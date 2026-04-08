# 模式：auto-pipeline —— 全自動完整 pipeline

當使用者貼上一份 JD（文字或 URL）且沒有明確指定子指令時，依序跑完整個 pipeline：

## 步驟 0 —— 萃取 JD

如果 input 是 **URL**（不是貼上的 JD 文字），依下列策略抓內容：

**優先順序：**

1. **Playwright（首選）：** 多數職缺 portal（Lever、Ashby、Greenhouse、Workday、Cake、Yourator）是 SPA。用 `browser_navigate` + `browser_snapshot` render 後讀取 JD。
2. **WebFetch（fallback）：** 靜態頁面（ZipRecruiter、WeLoveProduct、公司 careers page）。
3. **WebSearch（最後手段）：** 在次級 portal 用職稱 + 公司搜尋 HTML 靜態索引版。

**全部方法都失敗：** 請候選人手動貼 JD 或分享 screenshot。

**如果 input 已經是 JD 文字**（不是 URL）：直接使用，不需要 fetch。

## 步驟 1 —— A–F 評估
完全比照 `oferta` 模式執行（請讀 `modes/zh-TW/oferta.md` 內的 A–F 全部區塊）。

## 步驟 2 —— 儲存 Report .md
把完整評估存到 `reports/{###}-{company-slug}-{YYYY-MM-DD}.md`（格式見 `modes/zh-TW/oferta.md`）。

## 步驟 3 —— 產生 PDF
執行完整 `pdf` pipeline（請讀 `modes/zh-TW/pdf.md`）。**PDF 一律英文。**

## 步驟 4 —— Draft Application Answers（僅當 score >= 4.5）

如果最終分數 >= 4.5，產生申請表單的草稿答案：

1. **萃取表單題目：** 用 Playwright 導到表單頁並 snapshot。如果抽不到，用下方的通用題庫。
2. **依下方語氣生成答案。**
3. **寫進 report** 的 `## G) Draft Application Answers` 區塊。

### 通用題目（抽不到表單時使用）

- Why are you interested in this role?
- Why do you want to work at [Company]?
- Tell us about a relevant project or achievement
- What makes you a good fit for this position?
- How did you hear about this role?

### 表單答案的語氣

**定位：「I'm choosing you.」** 候選人有選擇，正在為了具體理由挑這家公司。

**語氣規則：**
- **自信但不傲慢：**"I've spent the past year building production AI agent systems — your role is where I want to apply that experience next"
- **有選擇性但不自大：**"I've been intentional about finding a team where I can contribute meaningfully from day one"
- **具體到細節：**一定要引用 JD 或公司的某個真實細節，以及候選人的一個真實經驗
- **直接，不要 fluff：**每題 2–4 句。不要用 "I'm passionate about..." 或 "I would love the opportunity to..."
- **Hook 是證據不是宣稱：**不要說 "I'm great at X"，改說 "I built X that does Y"

**每題的框架：**
- **Why this role?** → "Your [specific thing] maps directly to [specific thing I built]."
- **Why this company?** → 提一個公司具體的事。"I've been using [product] for [time/purpose]."
- **Relevant experience?** → 一個量化 proof point。"Built [X] that [metric]. Sold the company in 2025."
- **Good fit?** → "I sit at the intersection of [A] and [B], which is exactly where this role lives."
- **How did you hear?** → 誠實說："Found through [portal/scan], evaluated against my criteria, and it scored highest."

**語言：** 一律跟著 JD 的語言（預設英文）。JD 是繁中才用繁中，否則英文。

## 步驟 5 —— 更新 Tracker
依 TSV 規則寫到 `batch/tracker-additions/`，由 `merge-tracker.mjs` 合併到 `data/applications.md`。Report 與 PDF 欄都標 ✅。

**任何一步失敗時**，繼續跑後面的步驟，把失敗的步驟在 tracker 裡標成 pending。
