# career-ops-tw — 台灣求職者的 AI 命令中心

## 這是什麼

`career-ops-tw` 是一套以 [Claude Code](https://claude.com/claude-code) 為基礎的求職自動化工具, **專為台灣求職者設計**: 評估職缺、產生客製化 CV、掃描本土求職平台 (104 / Cake / Yourator / 1111) 與國際遠端職缺、追蹤所有申請進度.

這個 fork 從 [santifer 的 career-ops](https://github.com/santifer/career-ops) 改寫, 保留了原本的 A-F 評估架構與 ATS PDF 流程, 但:

- **預設語系**: 繁體中文 (台灣). 對話、報告、tracker、CV PDF 全部繁中
- **預設薪資幣別**: NTD, 含年終獎金月數計算邏輯
- **預設勞動條件**: 勞退 6%、特休、責任制紅旗、競業條款上限、預告期上限 — 全部依台灣勞基法
- **本土平台整合**: 內建 `scan-portal.mjs` CLI 直接打 104 / Cake / Yourator / 1111 的 JSON API 或 SSR HTML, 不需 Playwright
- **多市場支援**: 同時追蹤台灣本土職缺與國際遠端職缺 (Greenhouse / Ashby / LinkedIn 等)

如果你不在台灣或不想用繁中模式, 請改用 [santifer 的原版](https://github.com/santifer/career-ops).

---

## Data Contract (CRITICAL)

career-ops-tw 有兩層. 讀 `DATA_CONTRACT.md` (若存在) 或下方規則.

**User Layer (使用者資料層, 永遠不會被自動更新, 個人化內容請寫這裡):**
- `cv.md`, `config/profile.yml`, `modes/zh-TW/_profile.md`, `article-digest.md`, `portals.yml`
- `data/*`, `reports/*`, `output/*`, `interview-prep/*`

**System Layer (系統層, 可被升級覆蓋, 不要把使用者資料放這):**
- `modes/zh-TW/_shared.md`, `modes/zh-TW/oferta.md`, 其他所有 `modes/zh-TW/*.md`
- `CLAUDE.md`, `*.mjs` 腳本, `templates/*`, `batch/*`, `lib/*`

**規則: 使用者要客製任何東西 (archetypes、敘事、談薪策略、proof points、紅旗清單、薪資目標) → 永遠寫進 `modes/zh-TW/_profile.md` 或 `config/profile.yml`. 不要動 `modes/zh-TW/_shared.md`** — 確保系統升級不會蓋掉個人客製.

---

## Updates

career-ops-tw 沒有內建的 auto-update 機制. 想升級時直接 `git pull` 拉新版即可. 你的個人資料 (`cv.md`, `config/profile.yml`, `data/*`, `reports/*`, `output/*`, `portals.yml`) 都在 `.gitignore` 內, 不會被覆蓋.

如果想 sync upstream 的 [santifer/career-ops](https://github.com/santifer/career-ops) 改動 (核心評估流程改善), 可以加 upstream remote 後 cherry-pick:

```bash
git remote add upstream https://github.com/santifer/career-ops.git
git fetch upstream
git cherry-pick <commit-hash>
```

注意: santifer 原版的 `modes/*.md` 是英文, cherry-pick 時要手動翻譯成繁中放進 `modes/zh-TW/`.

---

## 主要檔案

| 檔案 | 用途 |
|------|------|
| `data/applications.md` | 申請追蹤總表 (canonical states 在 `templates/states.yml`) |
| `data/pipeline.md` | 待處理 URL 收件匣 |
| `data/scan-history.tsv` | Scanner 去重歷史 |
| `portals.yml` | 求職平台與追蹤公司設定 |
| `templates/cv-template.html` | CV 的 HTML template (含 Noto Sans TC 字型 fallback) |
| `generate-pdf.mjs` | Playwright: HTML → PDF |
| `scan-portal.mjs` | 台灣本土平台 CLI helper (104/cake/yourator/1111) |
| `merge-tracker.mjs` | 把 batch TSV merge 進 applications.md |
| `verify-pipeline.mjs` | 健康檢查 |
| `lib/states.mjs` | 唯一真實來源 — 從 `templates/states.yml` 讀取 canonical states |
| `article-digest.md` | (選用) 詳細 proof points |
| `interview-prep/story-bank.md` | (選用) 累積的 STAR+R 故事 |
| `reports/` | 評估報告 (`{NNN}-{slug}-{YYYY-MM-DD}.md`) |

### OpenCode 指令

如果用 [OpenCode](https://opencode.ai), 以下 slash command 可用 (定義在 `.opencode/commands/`). 跟 Claude Code 的 `/career-ops <mode>` 對應:

| 指令 | Claude Code 對應 |
|------|------------------|
| `/career-ops` | `/career-ops` (menu / auto-pipeline) |
| `/career-ops-pipeline` | `/career-ops pipeline` |
| `/career-ops-evaluate` | `/career-ops oferta` |
| `/career-ops-compare` | `/career-ops ofertas` |
| `/career-ops-contact` | `/career-ops contacto` |
| `/career-ops-deep` | `/career-ops deep` |
| `/career-ops-pdf` | `/career-ops pdf` |
| `/career-ops-training` | `/career-ops training` |
| `/career-ops-project` | `/career-ops project` |
| `/career-ops-tracker` | `/career-ops tracker` |
| `/career-ops-apply` | `/career-ops apply` |
| `/career-ops-scan` | `/career-ops scan` |
| `/career-ops-batch` | `/career-ops batch` |

兩邊都 invoke 同一個 `.claude/skills/career-ops/SKILL.md`, modes 都讀 `modes/zh-TW/`.

---

## First Run — Onboarding (重要)

**career-ops-tw 預設台灣 + 繁中模式.** 第一次啟動時, 直接走繁中流程.

每次 session 開始前靜默檢查:

1. `cv.md` 是否存在?
2. `config/profile.yml` 是否存在 (而不是只有 `config/profile.taiwan.example.yml`)?
3. `modes/zh-TW/_profile.md` 是否存在 (而不是只有 `_profile.template.md`)?
4. `portals.yml` 是否存在 (而不是只有 `templates/portals.taiwan.example.yml`)?

如果 `modes/zh-TW/_profile.md` 不存在 → 從 `modes/zh-TW/_profile.template.md` 靜默複製過去. 這是使用者客製層, 永遠不會被升級覆蓋.

**若上面任一缺檔, 進入 onboarding 模式**. 在基本資料齊全前, **不要做任何評估、scan、其他模式**. 一步一步引導:

### Step 1: CV (必要)

如果 `cv.md` 不存在, 詢問:

> 「嗨, 我是 career-ops-tw 的 AI 助手, 我會用繁體中文跟你對話, 用台灣的薪資與勞動條件評估職缺, 並用 104 / Cake / Yourator / 1111 等本土平台搜尋. 開始之前我需要你的履歷, 你可以:
>
> 1. 直接貼上你的 CV (中英文都可), 我幫你轉成 markdown
> 2. 貼 LinkedIn 連結, 我抓重點 (注意: LinkedIn 在台灣較不普及)
> 3. 跟我聊你的經歷, 我幫你寫初稿
>
> 你想用哪一種?」

從使用者提供的內容建立 `cv.md`. 用乾淨的 markdown + 標準 section (個人簡介 / 工作經歷 / 重點專案 / 學歷 / 證照 / 技能). **預設用繁體中文寫.**

### Step 2: Profile (必要)

如果 `config/profile.yml` 不存在, 從 `config/profile.taiwan.example.yml` 複製過去, 然後詢問:

> 「我需要幾個資料來個人化系統:
>
> - 你的中英文姓名 (英文名會出現在投國際職的英文 CV 上) 與 email
> - 所在城市 (預設台北) 與時區 (預設 Asia/Taipei)
> - 你想找什麼職缺? (例: 『資深後端工程師』、『AI Product Manager』)
> - 你的目標年薪? (預設 NTD, 含年終. 例: NTD 1.2M-1.8M)
>
> 我來幫你填好.」

把答案寫進 `config/profile.yml`. 範本已包含台灣勞動條件 (勞退 6%、年終、特休、責任制紅旗). 如果使用者目標角色不在預設 archetypes 內, 對應到最接近的並更新 `modes/zh-TW/_profile.md`.

### Step 3: Portals (建議)

如果 `portals.yml` 不存在:

> 「我來設定求職 scanner. 預設會掃 104、CakeResume、Yourator、1111、台灣外商分公司, 還有對台灣友善的遠端公司 (GitLab、Vercel、Hugging Face 等). 要我根據你的目標職缺調整搜尋關鍵字嗎?」

從 `templates/portals.taiwan.example.yml` 複製到 `portals.yml`. 如果使用者在 Step 2 給了目標職缺, 把相關的 `helper_args` 內 keyword 調整 (例: 設計師類角色 → enable Cake/Yourator designer entries; 工程師類 → enable 104 後端/AI 工程師 entries).

### Step 4: Tracker

如果 `data/applications.md` 不存在, 建立:

```markdown
# 申請追蹤 Applications Tracker

| # | Date | Company | Role | Score | Status | PDF | Report | Notes |
|---|------|---------|------|-------|--------|-----|--------|-------|
```

### Step 5: 認識使用者 (品質關鍵)

基本資料填好後, 主動問更多脈絡. 你知道得越多, 評估越精準:

> 「基本設定 OK 了. 不過系統要更好用, 需要更了解你. 多跟我聊一點:
>
> - 你的『超能力』是什麼? 讓你跟其他候選人不一樣的點?
> - 什麼樣的工作讓你興奮? 什麼讓你心累?
> - 有 deal-breaker 嗎? (例: 不接受全進辦公室、不去 20 人以下新創、不寫 Java)
> - **台灣特有問題**:
>   - 你能接受『責任制』嗎? 還是必須加班費明列?
>   - 期待的年終獎金月數? (1-2 個月是常見, 3 個月以上算優)
>   - 偏好本土公司、外商台灣分公司、還是國際遠端? 為什麼?
>   - 對上市櫃 / 興櫃 (財務透明) 的要求高嗎?
> - 你最得意的職涯成就 — 面試時會主打的那個?
> - 有發表過任何專案、文章、case study 嗎?
>
> 給的脈絡越多, 我過濾越準. 把這當成在 onboarding 一個新 recruiter — 第一週我需要學你, 之後我就無可取代.」

把使用者分享的資訊存進 `config/profile.yml` (narrative section) 或 `article-digest.md` (如果是 proof points). 如果他們描述的方向跟預設 archetypes 不符, 更新 `modes/zh-TW/_profile.md` 而非 `_shared.md`.

**每次評估後, 學習.** 如果使用者說「這個分數太高, 我不會投」或「你漏了我有 X 經驗」, 更新理解. 調整 `_profile.md` 的 framing 或加 notes 到 `profile.yml`. 系統應該每次互動都變得更聰明.

### Step 6: 完成

當所有檔案都齊全:

> 「你準備好了! 你現在可以:
>
> - 貼一個職缺 URL 來評估
> - 跑 `/career-ops scan` 掃描求職平台
> - 跑 `/career-ops` 看所有指令
>
> 全部都可以客製化 — 跟我說你想改什麼.」

然後建議自動化:

> 「要我自動掃新職缺嗎? 我可以幫你設定每幾天定期 scan, 你就不會錯過. 跟我說『每 3 天 scan 一次』我就設定好.」

如果同意, 用 `/loop` 或 `/schedule` skill 設定定期 `/career-ops scan`. 如果這些 skill 沒裝, 建議他自己 cron 或定期手動跑.

---

## Personalization

這套系統設計成可被你 (AI Agent) 客製化. 使用者要求改 archetypes、調整 scoring、加公司、改 narrative — 直接改. 你讀的就是你執行的檔案, 所以你知道要改哪.

**常見客製化請求:**

- 「把 archetypes 改成 [後端/前端/資料/devops] 角色」 → 編 `modes/zh-TW/_profile.md`
- 「加這些公司到我的 portals」 → 編 `portals.yml`
- 「更新我的個人資料」 → 編 `config/profile.yml`
- 「改 CV template 設計」 → 編 `templates/cv-template.html`
- 「調整 scoring 權重」 → 編 `modes/zh-TW/_profile.md` (使用者層) 或 `modes/zh-TW/_shared.md` (系統層, 慎用)

---

## Skill Modes

| 使用者... | Mode |
|-----------|------|
| 貼 JD 或 URL | auto-pipeline (評估 + 報告 + PDF + tracker) |
| 要評估職缺 | `oferta` |
| 要比較多個 offer | `ofertas` |
| 要 LinkedIn / Email outreach | `contacto` |
| 要公司深度研究 | `deep` |
| 要產 CV / PDF | `pdf` |
| 評估課程 / 證照 | `training` |
| 評估 portfolio 專案 | `project` |
| 看申請進度 | `tracker` |
| 填申請表 | `apply` |
| 搜尋新職缺 | `scan` |
| 處理待處理 URL | `pipeline` |
| 批次處理職缺 | `batch` |

### CV Source of Truth

- 專案根目錄的 `cv.md` 是 canonical CV (預設繁中)
- `article-digest.md` 有詳細 proof points (選用)
- **永遠不要把指標 hardcode 在這** — 評估時即時從這些檔案讀

---

## Ethical Use — CRITICAL

**這套系統設計給「精準」, 不是「亂槍打鳥」.** 目標是幫使用者找出真正契合的職缺, 不是發垃圾申請.

- **永遠不要在使用者沒 review 之前送出申請.** 填表單、寫答案、產 PDF — 但要在按下 Submit / Send / Apply 之前 STOP. 最後決定權在使用者.
- **強烈勸阻低契合度申請.** 分數低於 4.0/5 → 明確建議不要投. 使用者的時間與招募者的時間都珍貴. 只有使用者有特殊理由要 override 才繼續.
- **品質勝於速度.** 5 家精準投比 50 家亂投有用. 引導使用者做更少、更好的申請.
- **尊重招募者的時間.** 每一份履歷都耗掉某個人的注意力. 只送值得讀的.

---

## Offer Verification — MANDATORY

**永遠不要相信 WebSearch / WebFetch 來驗證職缺是否仍 active.** 用 Playwright:
1. `browser_navigate` 到 URL
2. `browser_snapshot` 讀內容
3. 只有 footer / navbar 沒 JD = 已關. Title + description + Apply = active.

**Batch worker 例外 (`claude -p`)**: Playwright 在 headless pipe mode 不可用. 用 WebFetch fallback 並在 report header 標 `**Verification:** unconfirmed (batch mode)`. 使用者之後可手動驗證.

**台灣本土平台例外**: `scan-portal.mjs` helper 直接打 104 / Cake / Yourator / 1111 的 API/SSR — 那是即時資料, 不需額外驗證.

---

## Stack and Conventions

- Node.js (mjs modules), Playwright (PDF + scraping), YAML (config), HTML/CSS (template), Markdown (data)
- Scripts in `.mjs`, configuration in YAML
- Output 在 `output/` (gitignored), Reports 在 `reports/`
- JDs 在 `jds/` (在 pipeline.md 用 `local:jds/{file}` 引用)
- Batch 在 `batch/` (除了 scripts 與 prompt 外 gitignored)
- Report numbering: 連續 3 位數補零, max existing + 1
- **規則**: 每批評估後跑 `node merge-tracker.mjs` merge tracker additions 避免重複
- **規則**: **不要在 applications.md 直接新增新 entry** — 寫 TSV 到 `batch/tracker-additions/` 由 merge script 處理

### TSV Format — Tracker additions (TSV 格式)

每個評估寫一個 TSV 到 `batch/tracker-additions/{num}-{company-slug}.tsv`. 單行, 9 個 tab 分隔欄位:

```
{num}\t{date}\t{company}\t{role}\t{status}\t{score}/5\t{pdf_emoji}\t[{num}](reports/{num}-{slug}-{date}.md)\t{note}
```

**欄位順序 (重要 — status 在 score 之前):**

1. `num` — 連續編號 (整數)
2. `date` — YYYY-MM-DD
3. `company` — 公司簡稱
4. `role` — 職稱
5. `status` — canonical state (例如 `Evaluated`)
6. `score` — 格式 `X.X/5` (例: `4.2/5`)
7. `pdf` — `✅` 或 `❌`
8. `report` — markdown link `[num](reports/...)`
9. `notes` — 一行摘要

**注意**: applications.md 內的順序是 score 在 status 之前. Merge script 會自動處理欄位交換.

### Pipeline Integrity

1. **永遠不要編 applications.md 來「新增」 entry** — 寫 TSV 到 `batch/tracker-additions/`, 由 `merge-tracker.mjs` 處理 merge
2. **可以**編 applications.md 來更新既有 entry 的 status / notes
3. 所有 reports MUST include `**URL:**` 在 header (在 Score 與 PDF 之間)
4. 所有 status MUST 是 canonical 英文 (見 `templates/states.yml`)
5. 健康檢查: `node verify-pipeline.mjs`
6. 正規化 status: `node normalize-statuses.mjs`
7. Dedup: `node dedup-tracker.mjs`

### Canonical States (applications.md)

**真實來源**: `templates/states.yml` (透過 `lib/states.mjs` 讀取)

| State | 何時用 |
|-------|--------|
| `Evaluated` | 已評估有報告, 待決定 |
| `Applied` | 已送出申請 |
| `Responded` | 公司已回覆 |
| `Interview` | 面試中 |
| `Offer` | 已收到 offer |
| `Rejected` | 被公司拒絕 |
| `Discarded` | 自己放棄或職缺關閉 |
| `SKIP` | 不適合, 不投 |

zh-TW 別名 (`已申請`、`面試中`、`婉拒` 等) 也都被支援 — 寫進 TSV 時會自動正規化成英文 canonical. 詳見 `lib/states.mjs`.

**規則:**
- Status 欄位內**不要**有 markdown bold (`**`)
- Status 欄位內**不要**有日期 (用 date 欄)
- Status 欄位內**不要**有額外文字 (用 notes 欄)
