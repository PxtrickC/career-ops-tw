# 模式：scan —— Portal Scanner（職缺發現）

掃描已設定的職缺 portal，依職稱相關度過濾，把新職缺加進 pipeline 等待後續評估。

## 建議執行方式

以 subagent 背景執行，避免吃掉主對話的 context：

```
Agent(
    subagent_type="general-purpose",
    prompt="[此檔案內容 + 具體資料]",
    run_in_background=True
)
```

## 設定

讀取 `portals.yml`，裡面包含：
- `search_queries`：用 `site:` 過濾的 WebSearch query 清單（廣泛發現）
- `tracked_companies`：要直接追蹤的公司，帶 `careers_url` 可直接導航
- `title_filter`：positive / negative / seniority_boost keyword，用來過濾職稱

## 4 層發現策略

### Level 0 —— Portal API helper (台灣本土平台首選)

**對 `tracked_companies` 中 `scan_method: portal_api` 的 entry**: 用 Bash 跑 `node scan-portal.mjs <platform> [args]`. Helper 直接呼叫各平台的 JSON API (104, yourator) 或抓 SSR HTML (cake, 1111), 不需 Playwright. Output 是 JSONL, 一行一筆 job, 含 `title / company / url / location / salary / posted`.

支援的 platform: `104`, `yourator`, `cake`, `1111`. 詳見 `scan-portal.mjs --help`. **不支援**: meet.jobs (純前端 React, 無 URL 參數, 無公開 API).

執行範例 (從 portals.yml entry 拼出):
```bash
node scan-portal.mjs 104 --keyword "資深產品設計師" --area 6001001000 --remote --pages 2
node scan-portal.mjs yourator --term designer --pages 3
node scan-portal.mjs cake --keyword "founding designer" --remote --pages 2
node scan-portal.mjs 1111 --keyword "產品設計師" --pages 2
```

每個 entry 的 `helper_args` 欄就是要傳給 `node scan-portal.mjs` 的 argv. 用 Bash 跑, parse stdout 的 JSONL, 把每筆 job append 到候選清單.

**Level 0 是台灣本土平台 (104/Cake/Yourator/1111) 的首選**, 因為這些站都是 SPA, Level 1 的 Playwright 在沒有 MCP 的環境跑不了, Level 3 的 Google `site:` filter 又抓不到 SPA 動態載入的 listing.

### Level 1 —— Playwright 直接導航 (備援, 通用)

對 `tracked_companies` 中 `scan_method: playwright` (或無 `scan_method`) 的 entry: 用 Playwright (`browser_navigate` + `browser_snapshot`) 導到 `careers_url`, 讀所有看得到的 job listing. 適合非台灣的 SPA portal (Ashby, Lever, Workday) 與一般公司 careers page.

**Playwright 環境檢查**: 啟動時若沒有 `mcp__playwright__*` 工具, 要明確跳過 Level 1 的 Playwright entries (改 fallback 到 WebFetch + 該 entry 的 `scan_query`), **不要無聲失敗**.

### Level 2 —— Greenhouse / Lever / Ashby API (結構化 fallback)

對 `tracked_companies` 中有 `api:` 欄位 (e.g., `boards-api.greenhouse.io/v1/boards/{slug}/jobs`) 的 entry, 用 WebFetch 抓 JSON. 比 Playwright 快, 但只對該家 ATS 有效.

### Level 3 —— WebSearch queries (跨 portal 廣泛發現)

帶 `site:` 的 `search_queries` 用來發現還不在 `tracked_companies` 裡的**新公司**. **結果可能過時 (Google cache 數週)**, 所以 Level 3 的每筆新 URL 都要在加入 pipeline 之前用 WebFetch 二次驗證 (見步驟 7.5).

**執行優先順序 (相加, 去重):**
1. Level 0: portal_api helper → 所有 `enabled: true` 且有 `scan_method: portal_api` 的 `tracked_companies` (台灣本土平台)
2. Level 1: Playwright → 所有有 `careers_url` 的 `tracked_companies`
3. Level 2: API → 所有有 `api:` 的 `tracked_companies`
4. Level 3: WebSearch → 所有 `enabled: true` 的 `search_queries`

## Workflow

1. **讀設定：** `portals.yml`
2. **讀歷史：** `data/scan-history.tsv` → 已看過的 URL
3. **讀去重來源：** `data/applications.md` + `data/pipeline.md`

4. **Level 0 —— Portal API helper** (台灣本土平台, 每批 3-5 筆並行 Bash):
   對每個 `enabled: true` 且 `scan_method: portal_api` 的 `tracked_companies`:
   a. 拼指令: `node scan-portal.mjs <helper_args 內的全部 token>`
   b. Bash 跑, 拿 stdout
   c. 逐行 parse JSONL → `{title, url, company, location, salary, posted}`
   d. 累積到候選清單
   e. 任何單行解析失敗就 skip 該行繼續, 不要中斷整個 entry
   f. 若 helper 整個 exit code != 0: 標記該 entry 失敗, 記在最後 report

4.5. **Level 1 —— Playwright scan** (每批 3-5 筆並行):
   對每一家 `enabled: true` 且有 `careers_url` 但 *不是* `scan_method: portal_api` 的 `tracked_companies`:
   a. `browser_navigate` 到 `careers_url`
   b. `browser_snapshot` 讀所有 job listing
   c. 如果頁面有部門 / 過濾器，走相關區段
   d. 每筆 job listing 抽出：`{title, url, company}`
   e. 如果有分頁，走後續頁面
   f. 累積到候選清單
   g. 如果 `careers_url` 失敗（404、redirect），fallback 試 `scan_query`，並記下要更新 URL

5. **Level 2 —— Greenhouse APIs**（並行）：
   對每一家 `enabled: true` 且有 `api:` 的 `tracked_companies`：
   a. WebFetch API URL → 拿 JSON job 清單
   b. 每筆抽出：`{title, url, company}`
   c. 累積到候選清單（與 Level 1 去重）

6. **Level 3 —— WebSearch queries**（可能的話並行）：
   對每個 `enabled: true` 的 `search_queries`：
   a. 用 `query` 執行 WebSearch
   b. 每筆結果抽出：`{title, url, company}`
      - **title**：結果標題（" @ " 或 " | " 之前）
      - **url**：結果 URL
      - **company**：標題中 " @ " 之後，或從 domain / path 抽出
   c. 累積到候選清單（與 Level 1+2 去重）

6. **依職稱過濾** 用 `portals.yml` 的 `title_filter`：
   - 至少 1 個 `positive` keyword 要出現在職稱（case-insensitive）
   - 0 個 `negative` keyword 出現
   - `seniority_boost` 會拉高優先度，但不是必要條件

7. **與 3 個來源去重：**
   - `scan-history.tsv` → URL 精確比對
   - `applications.md` → 公司 + 正規化職稱已評估過
   - `pipeline.md` → URL 已在 pending 或 processed

7.5. **驗證 Level 3 WebSearch 結果是否仍 active** —— 在加入 pipeline 之前：

   WebSearch 的結果可能已過期（Google 會 cache 數週甚至數月）。為避免評估已關閉的職缺，對所有 Level 3 來的新 URL 用 Playwright 驗證一次。Level 1 與 2 本來就是即時的，不需要這步。

   對每個 Level 3 的新 URL（**順序執行** —— Playwright 絕對不可並行）：
   a. `browser_navigate` 到 URL
   b. `browser_snapshot` 讀內容
   c. 分類：
      - **Active：** 可以看到職稱 + 職缺描述 + Apply / Submit / 投遞 按鈕
      - **Expired**（以下任一訊號）：
        - URL 結尾含 `?error=true`（Greenhouse 關閉職缺時的重導）
        - 頁面含 "job no longer available" / "no longer open" / "position has been filled" / "this job has expired" / "page not found"
        - 只看到 navbar + footer，沒有 JD 內容（內容 < 約 300 字元）
   d. Expired：寫進 `scan-history.tsv`，status `skipped_expired`，丟掉
   e. Active：進入步驟 8

   **單筆 URL 失敗不要中斷整個 scan。** 如果 `browser_navigate` 出錯（timeout、403 等），標成 `skipped_expired` 就繼續下一筆。

8. **每一筆通過驗證與過濾的新職缺：**
   a. 加進 `pipeline.md` 的「Pendientes」區：`- [ ] {url} | {company} | {title}`
   b. 寫進 `scan-history.tsv`：`{url}\t{date}\t{query_name}\t{title}\t{company}\tadded`

9. **被職稱過濾掉的職缺：** 寫進 `scan-history.tsv`，status `skipped_title`
10. **重複的職缺：** 寫進 `scan-history.tsv`，status `skipped_dup`
11. **Level 3 過期的職缺：** 寫進 `scan-history.tsv`，status `skipped_expired`

## 從 WebSearch 結果抽出職稱與公司

WebSearch 結果通常是：`"Job Title @ Company"`、`"Job Title | Company"` 或 `"Job Title — Company"`。

常見 portal 的抽取模式：
- **Ashby**：`"Senior AI PM (Remote) @ EverAI"` → title: `Senior AI PM`, company: `EverAI`
- **Greenhouse**：`"AI Engineer at Anthropic"` → title: `AI Engineer`, company: `Anthropic`
- **Lever**：`"Product Manager - AI @ Temporal"` → title: `Product Manager - AI`, company: `Temporal`

通用 regex：`(.+?)(?:\s*[@|—–-]\s*|\s+at\s+)(.+?)$`

## 私有 URL

如果發現無法公開存取的 URL：
1. 把 JD 存到 `jds/{company}-{role-slug}.md`
2. 在 pipeline.md 加：`- [ ] local:jds/{company}-{role-slug}.md | {company} | {title}`

## Scan History

`data/scan-history.tsv` 追蹤**所有**看過的 URL：

```
url	first_seen	portal	title	company	status
https://...	2026-02-10	Ashby — AI PM	PM AI	Acme	added
https://...	2026-02-10	Greenhouse — SA	Junior Dev	BigCo	skipped_title
https://...	2026-02-10	Ashby — AI PM	SA AI	OldCo	skipped_dup
https://...	2026-02-10	WebSearch — AI PM	PM AI	ClosedCo	skipped_expired
```

## 輸出總結格式

```
Portal Scan —— {YYYY-MM-DD}
━━━━━━━━━━━━━━━━━━━━━━━━━━
執行的 query 數：N
找到的職缺：N 筆
依職稱過濾後：N 筆相關
重複的：N（已評估或已在 pipeline）
過期丟棄：N（死連結，Level 3）
新加到 pipeline.md：N 筆

  + {company} | {title} | {query_name}
  ...

→ 執行 /career-ops pipeline 評估新職缺。
```

## careers_url 管理

`tracked_companies` 中每家公司都應該有 `careers_url` —— 職缺頁面的直接 URL。這樣就不用每次重找。

**各平台的常見模式：**
- **Ashby：** `https://jobs.ashbyhq.com/{slug}`
- **Greenhouse：** `https://job-boards.greenhouse.io/{slug}` 或 `https://job-boards.eu.greenhouse.io/{slug}`
- **Lever：** `https://jobs.lever.co/{slug}`
- **Custom：** 公司自己的 URL（例：`https://openai.com/careers`）
- **Cake：** `https://www.cake.me/companies/{slug}/jobs`
- **Yourator：** `https://www.yourator.co/companies/{slug}`

**如果公司還沒有 `careers_url`：**
1. 試該平台的常見模式
2. 不行的話快速 WebSearch：`"{company}" careers jobs`
3. 用 Playwright 確認可以打開
4. **把找到的 URL 存回 portals.yml** 供後續 scan 使用

**如果 `careers_url` 回 404 或 redirect：**
1. 在輸出總結中記錄
2. Fallback 試 scan_query
3. 標記為要手動更新

## portals.yml 的維護

- **新增公司時一律寫入 `careers_url`**
- 發現新 portal 或新角色時追加 query
- 某個 query 產生太多噪音時設 `enabled: false`
- 隨著目標角色演化調整過濾 keyword
- 值得密切追蹤的公司加入 `tracked_companies`
- 定期檢查 `careers_url` —— 公司會換 ATS 平台
