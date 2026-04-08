# career-ops —— 繁體中文模式 (`modes/zh-TW/`)

**career-ops 預設使用此資料夾.** 此模式專為台灣求職者設計, 涵蓋本土求職平台、台灣勞動條件、NTD 薪資, 是 career-ops 的預設市場層.

## 預設設定

第一次跑 career-ops 時, 系統會自動:

- 從 `config/profile.taiwan.example.yml` 建立 `config/profile.yml` (NTD、台北、勞退 6%、責任制紅旗等)
- 從 `templates/portals.taiwan.example.yml` 建立 `portals.yml` (104、Cake、Yourator、Meet.jobs、台灣外商、對台友善遠端公司)
- 設 `language.modes_dir: modes/zh-TW`, 對話走繁中
- CV PDF 輸出繁體中文 (字型內建 Noto Sans TC)

## 何時使用?

適合:
- 主要投遞**台灣本土職缺** (104、CakeResume / Cake、Yourator、Meet.jobs、企業官網)
- 想用**自然台灣中文**對話、寫評估報告
- 需要處理**台灣勞動條件**: 勞基法、試用期、特休、勞退、健保、年終獎金、責任制、競業條款
- 投本土職缺主用繁中 CV, 偶爾要英文 CV 投國際職

## 不適合 (請切換英文模式)

如果你不在台灣或主要投英文 / 海外職缺, 跟 Claude 說:

> 「use English modes」/「I'm not in Taiwan」/「switch to English」

Claude 會切換到 `modes/` (英文)、`config/profile.example.yml`、`templates/portals.example.yml`.

## 重要 —— CV / PDF 預設繁體中文

> **預設情況下, 履歷 PDF 與求職信 PDF 都用繁體中文輸出.**
> Template (`templates/cv-template.html`) 已內建 `Noto Sans TC` 字型 fallback, 透過 Google Fonts 載入. 同一份 template 兩種語言通用 — section 標題是 placeholder, 由 Claude 在生成時填中文或英文.

英文 CV 的切換時機:
- 投國際職、海外遠端 → 使用者說「英文 CV」, 該次生成英文版
- 永久英文 CV → 在 `config/profile.yml` 設 `language.cv_language: en`
- Claude 偵測到 JD 是英文 + 海外公司 → 主動建議用英文 CV

繁體中文模式翻譯:
- AI 代理人對話語言
- 模式 (modes) 內的指令說明
- 評估報告 (`reports/*.md`)
- 追蹤器 (`data/applications.md`) 備註
- **CV / 求職信 PDF (預設)**

不翻譯 (永遠保留原文):
- 程式碼、檔案路徑、CLI 指令
- 工具名稱 (Playwright, WebSearch, Read, Write 等)
- Tracker canonical state ID (背後仍用 `Applied`、`Interview` 等)

## 如何啟用？

### 方式一 —— 單次使用

在對話開頭告訴 Claude：

> 「請使用 `modes/zh-TW/` 的繁體中文模式。」

Claude 之後會優先讀取此資料夾的檔案，而不是 `modes/`。

### 方式二 —— 永久啟用

在 `config/profile.yml` 中加入或修改：

```yaml
language:
  primary: zh-TW
  modes_dir: modes/zh-TW
```

之後 Claude 啟動時會自動使用繁體中文模式。

## 模式清單 (16 個檔案)

| 檔案 | 用途 |
|------|------|
| `_shared.md` | 共享脈絡、評分系統、台灣 archetypes 表、薪資基準、紅旗清單 (系統層, 不要直接編輯) |
| `_profile.template.md` | 使用者客製層範本 |
| `_profile.md` | 你的客製檔 (從 `_profile.template.md` 複製), **個人化內容寫這裡** |
| `oferta.md` | 完整職缺評估 (A-F 區塊) |
| `ofertas.md` | 多 offer 比較 |
| `apply.md` | 即時申請助手 (協助填表單) |
| `pipeline.md` | URL 收件匣 (Second Brain) |
| `auto-pipeline.md` | 自動偵測 + 評估 + PDF + tracker (一次到位) |
| `batch.md` | 批次平行評估 (多個 URL) |
| `scan.md` | 求職平台掃描 (含 Level 0 `scan-portal.mjs` helper) |
| `tracker.md` | 申請進度總覽 |
| `deep.md` | 公司深度研究 |
| `contacto.md` | LinkedIn / Email outreach |
| `project.md` | 評估 portfolio 專案構想 |
| `training.md` | 評估課程 / 證照 |
| `pdf.md` | CV PDF 生成 (**預設繁中**, 字型內建 Noto Sans TC) |

## 維持英文的詞彙

以下詞彙刻意不翻譯，保留科技業常用的英文用法：

- `cv.md`、`pipeline`、`tracker`、`report`、`score`、`archetype`、`proof point`
- 工具名稱（`Playwright`、`WebSearch`、`WebFetch`、`Read`、`Write`、`Edit`、`Bash`）
- Tracker 狀態值（`Evaluated`、`Applied`、`Interview`、`Offer`、`Rejected`）
- 程式碼片段、檔案路徑、CLI 指令

模式內使用台灣科技業自然的中英夾雜風格：中文敘述為主，技術名詞（stack、pipeline、deployment、embedding、RAG、agent）保留英文。不刻意把「Pipeline」翻成「管線」、把「Deploy」翻成「部署應用」。

## 對照詞彙表

如果你要修改或擴充模式，請參考下表保持一致性：

| 英文 | 繁體中文（本專案用法）|
|------|----------------------|
| Job posting | 職缺／職務 |
| Application | 應徵／申請 |
| Cover letter | 求職信 |
| Resume / CV | 履歷／CV |
| Salary | 薪資 |
| Compensation | 薪酬／待遇／package |
| Skills | 技能 |
| Interview | 面試 |
| Hiring manager | 用人主管 |
| Recruiter | 招募人員／recruiter |
| AI | AI（人工智慧）|
| Requirements | 條件／需求 |
| Career history | 工作經歷 |
| Notice period | 預告期／離職預告 |
| Probation | 試用期 |
| Vacation | 特休／年假 |
| 13th month salary | 年終獎金（通常 1–2 個月）|
| Permanent employment | 正職／不定期契約 |
| Fixed-term contract | 定期契約 |
| Freelance | 接案／自由工作者 |
| Remote | 遠端 |
| Hybrid | 混合辦公 |
| On-site | 進辦公室／on-site |
| Benefits | 福利 |
| Stock options | 股票選擇權／options |
| RSU | RSU（限制型股票）|
| Health insurance | 健保／團保 |
| Pension | 勞退 |
| Labor law | 勞基法 |
| Non-compete | 競業條款 |

## 貢獻

若你想改善翻譯或新增模式：

1. 開一個 Issue 提案（詳見 `CONTRIBUTING.md`）
2. 遵守上面的詞彙表，維持一致語氣
3. 翻譯要自然不死板，避免逐字直譯
4. 結構性元素（A–F 區塊、表格、程式碼區塊、工具呼叫）保持原樣
5. 用真實的繁中職缺（104、Cake、Yourator）測試後再送 PR
