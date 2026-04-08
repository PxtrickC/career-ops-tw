# 模式：pipeline —— URL 收件匣（Second Brain）

處理累積在 `data/pipeline.md` 的職缺 URL。使用者隨時把 URL 加進去，之後執行 `/career-ops pipeline` 一次處理完。

## Workflow

1. **讀取** `data/pipeline.md` → 在「待處理」段落找 `- [ ]` 項目
2. **對每筆待處理 URL:**
   a. 計算下一個 `REPORT_NUM` (讀 `reports/`, 取最大號 + 1)
   b. **抓 JD**: 台灣本土平台優先用 `scan-portal.mjs` (104/Cake/Yourator/1111). 國際 ATS 走 WebFetch (cake.me / job-boards.greenhouse.io 是 SSR, 直接抓有效). Playwright 是 fallback.
   c. URL 無法存取 → 標記為 `- [!]` 並加備註, 繼續下一個
   d. **跑完整 auto-pipeline:** A-F 評估 → Report .md → PDF (score >= 3.0) → Tracker (TSV 寫到 `batch/tracker-additions/`)
   e. **從「待處理」移到「已處理」:** `- [x] #NNN | URL | 公司 | 角色 | Score/5 | PDF ✅/❌`
3. **如果有 3 筆以上待處理:** 用 Agent 工具搭配 `run_in_background` 並行處理
4. **跑完之後**輸出總結表格:

```
| # | 公司 | 角色 | Score | PDF | 建議行動 |
```

## pipeline.md 格式

```markdown
## 待處理
- [ ] https://jobs.example.com/posting/123
- [ ] https://boards.greenhouse.io/company/jobs/456 | Company Inc | Senior PM
- [!] https://private.url/job — Error: login required

## 已處理
- [x] #143 | https://jobs.example.com/posting/789 | Acme Corp | AI PM | 4.2/5 | PDF ✅
- [x] #144 | https://boards.greenhouse.io/xyz/jobs/012 | BigCo | SA | 2.1/5 | PDF ❌
```

## 從 URL 智慧偵測 JD

1. **Playwright（首選）：**`browser_navigate` + `browser_snapshot`，所有 SPA 都 OK
2. **WebFetch（fallback）：**靜態頁面或 Playwright 不可用時
3. **WebSearch（最後手段）：**從次級 portal 找索引版本

**特殊情況：**

- **LinkedIn：**可能要登入 → 標 `[!]`，請使用者貼上原文
- **PDF：**URL 是 PDF 直接用 Read 工具讀
- **`local:` 前綴：**讀本地檔案。例如 `local:jds/linkedin-pm-ai.md` → 讀 `jds/linkedin-pm-ai.md`

## 自動編號

1. 列出 `reports/` 內所有檔案
2. 從前綴抽號碼（例如 `142-medispend...` → 142）
3. 新號碼 = 最大值 + 1

## 來源同步檢查

處理任何 URL 前，先驗證 sync：

```bash
node cv-sync-check.mjs
```

如果有不同步的警告，先告訴使用者再繼續。

---

## 語言提醒

- 對話與 report 內容用繁體中文
- 但 PDF 與求職信 PDF 一律用英文（見 `_shared.md` 開頭規則）
- 如果偵測到的 JD 是英文，整個 report 也可以用英文（與 JD 對齊）
