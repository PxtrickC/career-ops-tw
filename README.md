# career-ops-tw 🇹🇼

> 為台灣求職者打造的 AI 命令中心 — 評估職缺、產生客製化 CV、掃描本土平台、追蹤所有申請. 全部繁體中文, 全部跑在 [Claude Code](https://claude.com/claude-code) 上.

![Claude Code](https://img.shields.io/badge/Claude_Code-000?style=flat&logo=anthropic&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright-2EAD33?style=flat&logo=playwright&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)

---

## 這是什麼

`career-ops-tw` 把 Claude Code 變成一個完整的求職指揮中心. 不再用 Excel 手動追蹤申請, 你會得到一個 AI 驅動的 pipeline:

- **評估職缺** — 結構化 A-F 評分系統 (10 個加權維度), 預設套用台灣勞動條件 (責任制紅旗、年終、勞退、特休、預告期、競業條款)
- **客製化 CV PDF** — 依職缺 JD 注入關鍵字、重排 bullets、選 a4/letter 格式. **預設輸出繁體中文** (template 內建 Noto Sans TC). 投國際職時可單次切英文.
- **本土平台 scanner** — 內建 `scan-portal.mjs` CLI 直接打 **104 / Cake / Yourator / 1111** 的 JSON API 與 SSR HTML, 不需 Playwright. 同時支援國際 ATS (Greenhouse, Ashby, Lever).
- **批次處理** — 平行評估 10+ 個 offer 用 sub-agent
- **完整追蹤** — 單一真實來源 + 自動 health check + dedup
- **狀態多語別名** — Tracker 用英文 canonical state, 但接受繁中別名 (`已申請`、`面試中`、`婉拒` 等), 自動正規化

> **重要: 這不是亂槍打鳥工具.** career-ops-tw 是過濾器 — 幫你從幾百個職缺裡找出少數值得花時間的. 系統會強烈建議不要投遞分數低於 4.0/5 的職缺. 你的時間珍貴, 招募者的時間也珍貴. 送出之前永遠自己 review.

career-ops-tw 是 agentic 的: Claude Code 會用 Playwright 走 careers page、用 `scan-portal.mjs` 打台灣平台 API、依你的 CV vs JD 內容推理契合度 (不是關鍵字 match)、依職缺客製履歷.

> **預期: 前幾次評估不會很準.** 系統還不認識你. 餵它 context — 你的 CV、職涯故事、proof points、偏好、強項、想避開的東西. 你越養它, 它越聰明. 把它當成在 onboarding 一個新 recruiter — 第一週它需要學你, 之後就無可取代.

---

## 為什麼有這個 fork

這個專案 fork 自 [santifer 的 career-ops](https://github.com/santifer/career-ops) (作者用原版評估了 740+ 職缺、產 100+ 客製 CV、最後拿到 Head of Applied AI 的 offer). 原版的 archetypes、scoring、negotiation script、proof point 結構都反映了 santifer 的職涯 — AI/automation 角色, 主要在歐洲市場.

`career-ops-tw` 是把這套架構**完整重構為台灣市場第一**的版本:

| 維度 | 原版 | career-ops-tw |
|------|------|---------------|
| 對話語言 | 英文 / 西文 | **繁體中文** |
| 報告語言 | 英文 / 西文 | **繁體中文** |
| Tracker 別名 | 西文 | **英文 canonical + 繁中別名** |
| CV PDF | 英文 | **繁體中文** (字型內建 Noto Sans TC) |
| 預設薪資幣別 | EUR / USD | **NTD** (含年終月數計算) |
| 預設勞動條件 | EU 法 | **台灣勞基法** (勞退 6%、特休、預告期、競業條款) |
| 預設求職平台 | LinkedIn / Greenhouse / Ashby | **104 / Cake / Yourator / 1111 + 台灣外商 + 對台友善遠端公司** |
| Archetype 預設 | AI/ML/Automation roles | **設計 / 工程 / PM / 資料 / DevOps 等通用台灣科技業職缺** |
| 紅旗清單 | 通用 | **台灣特有: 責任制 / 投保薪資低於實領 / 試用期過長 / 競業條款無補償 / 派遣** |

如果你不在台灣或不想用繁中模式, 請改用 [santifer 的原版](https://github.com/santifer/career-ops). 兩個 repo 共享相同的 A-F 評估架構與 ATS PDF 流程, 你可以挑適合的.

---

## 快速開始

**前置 checklist** (5 分鐘設定):

```bash
# 1. 確認 Node 18+
node --version    # 應該是 v18.x 或更新

# 2. 確認你已安裝 Claude Code (https://claude.com/claude-code) 並登入
claude --version

# 3. Clone + install
git clone https://github.com/PxtrickC/career-ops-tw.git
cd career-ops-tw
npm install

# 4. 安裝 Playwright 的 Chromium binary (CV PDF 生成需要)
npx playwright install chromium

# 5. 健康檢查 — 確認所有 script 跟模式檔都齊全
npm run test
# 或更詳細的: node test-all.mjs --quick
```

如果 step 5 顯示 `60 passed, 0 failed`, 就完成了. 1 個 warning 是正常的 (`cv-sync-check.mjs` 因為還沒建 cv.md 而 fail, 跑完 onboarding 後就會消失).

**第一次跑:**

開 Claude Code, 在這個目錄裡說一句「開始」或「我要找工作」. AI 會走完整 onboarding:

1. 問你的 CV (貼上原文 / LinkedIn 連結 / 跟它聊)
2. 建立 `config/profile.yml` (從 `config/profile.taiwan.example.yml` 複製)
3. 建立 `portals.yml` (從 `templates/portals.taiwan.example.yml` 複製)
4. 問你的台灣特有問題 (責任制接受度、年終預期、本土 vs 外商 vs 遠端偏好)
5. 完成

之後可以:

```
貼一個職缺 URL → 自動評估 + 產報告 + 產 PDF + 加進 tracker
/career-ops scan → 掃描求職平台
/career-ops pipeline → 處理累積的待處理 URL
/career-ops tracker → 看申請進度
```

---

## 主要功能

| 功能 | 說明 |
|------|------|
| **Auto-Pipeline** | 貼一個 URL, 拿到完整評估 + PDF + tracker 條目 |
| **6-Block 評估** | 角色摘要、CV match、Level 策略、薪酬研究、personalization、面試準備 (STAR+R) |
| **Interview Story Bank** | 累積 STAR+Reflection 故事 — 5-10 個 master story 應對任何行為面試 |
| **Negotiation Scripts** | 薪資談判框架、地理薪資差距 push back、競爭 offer leverage |
| **ATS PDF 生成** | 關鍵字注入 CV, 預設繁體中文 (Noto Sans TC) |
| **Portal Scanner** | 內建 4 個台灣本土平台 + 多家在地公司與外商 |
| **`scan-portal.mjs` CLI** | 直接打 104/Cake/Yourator/1111 的 API/SSR, 不需 Playwright |
| **批次處理** | `claude -p` worker 平行評估 |
| **Pipeline Integrity** | 自動 merge / dedup / status 正規化 / health check |
| **多語狀態別名** | 英文 canonical + 繁中別名, 自動正規化 |
| **Human-in-the-Loop** | AI 評估與建議, 你決定與行動. 系統永遠不會自動送出申請 |

---

## 主要檔案

```
career-ops-tw/
├─ CLAUDE.md                    # AI agent 的行為指引 (繁中)
├─ cv.md                        # 你的 CV (預設繁中) — 不會 commit
├─ config/
│  ├─ profile.yml               # 你的個人資料 — 不會 commit
│  └─ profile.taiwan.example.yml  # 範本 (NTD/台北/台灣勞動條件)
├─ portals.yml                  # 你的求職平台設定 — 不會 commit
├─ templates/
│  ├─ portals.taiwan.example.yml  # 求職平台範本 (104/Cake/Yourator/1111 + 在地公司)
│  ├─ cv-template.html          # CV HTML template (含 Noto Sans TC)
│  └─ states.yml                # canonical states + 多語別名
├─ modes/zh-TW/                 # 16 個繁中模式檔
│  ├─ _shared.md                # 共享脈絡 + 台灣 archetypes / 薪資 / 紅旗
│  ├─ _profile.template.md      # 使用者客製層範本
│  ├─ oferta.md                 # 完整評估 (A-F)
│  ├─ ofertas.md                # 多 offer 比較
│  ├─ pipeline.md               # URL 收件匣處理
│  ├─ auto-pipeline.md          # 自動評估流程
│  ├─ batch.md                  # 批次平行評估
│  ├─ scan.md                   # 求職平台掃描 (含 Level 0 helper)
│  ├─ pdf.md                    # CV PDF 生成
│  ├─ apply.md                  # 申請表單助手
│  ├─ contacto.md               # LinkedIn / Email outreach
│  ├─ deep.md                   # 公司深度研究
│  ├─ tracker.md                # 申請進度
│  ├─ training.md               # 評估課程 / 證照
│  └─ project.md                # 評估 portfolio 專案
├─ data/
│  ├─ applications.md           # 你的 tracker — 不會 commit
│  ├─ pipeline.md               # 待處理 URL 收件匣 — 不會 commit
│  └─ scan-history.tsv          # scanner 去重 — 不會 commit
├─ reports/                     # 評估報告 (繁中) — 不會 commit
├─ output/                      # 生成的 PDF — 不會 commit
├─ batch/tracker-additions/     # 待 merge 的 TSV — 不會 commit
├─ lib/states.mjs               # 唯一真實來源 — 讀 states.yml
├─ scan-portal.mjs              # 台灣本土平台 CLI helper
├─ generate-pdf.mjs             # HTML → PDF (Playwright)
├─ merge-tracker.mjs            # TSV → applications.md (level-aware fuzzy match)
├─ verify-pipeline.mjs          # 健康檢查
└─ normalize-statuses.mjs       # 狀態正規化
```

---

## 客製化

整個系統設計成可客製化. 跟 Claude Code 說你想改什麼, 它就會幫你改:

- **「把 archetypes 改成資料工程角色」** → 編 `modes/zh-TW/_profile.md`
- **「加 KKBOX 到我的 portals」** → 編 `portals.yml`
- **「我可以接受 1 年競業條款 (有補償)」** → 編 `config/profile.yml`
- **「改 CV template 配色」** → 編 `templates/cv-template.html`
- **「把『資深』改成『主任』階級」** → 編 `templates/states.yml`

每次評估後, 如果系統建議跟你想的不一樣 — **告訴它**, 它會調整 framing, 下次更準.

---

## Ethical Use

- **永遠不要在你 review 之前送出申請.** 系統會幫你填表單、寫答案、產 PDF, 但會在按下 Submit/Send/Apply 之前停住. 最後決定權在你.
- **強烈勸阻低契合度申請.** 分數低於 4.0/5 → 明確建議不投. 你的時間珍貴, 招募者的時間也珍貴.
- **品質勝於速度.** 5 家精準投比 50 家亂投有用.

---

## 貢獻

歡迎 PR, 特別是:

- 新增更多台灣求職平台到 `scan-portal.mjs` (例: Job Bank.tw, JobsGo.tw)
- 改善 `roleFuzzyMatch()` 對中文 title 的處理
- 補充 `modes/zh-TW/_shared.md` 內的薪資基準 (用真實的 2026 市場資料)
- 加更多 archetype 對應 (半導體 / 韌體 / 金融科技 / 醫療科技)
- 翻譯 / 校對 modes 內的繁中內容
- 加 dashboard / TUI 視覺化

詳見 `CONTRIBUTING.md`.

---

## License

MIT. 詳見 `LICENSE`.

這個 fork 基於 santifer 的原版 career-ops (也是 MIT). 感謝原作者讓這套系統有了起點.

---

## 致謝

- [santifer](https://santifer.io) — career-ops 原作者. 沒有他的開源, 這個 fork 不可能存在.
- [Patrick Chiang](https://github.com/PxtrickC) — career-ops-tw fork 維護者, 把整套系統重構為台灣市場第一.
- Anthropic 與 Claude Code 團隊.
- 所有為了讓台灣求職環境更好而努力的人.

如果你用這個工具找到了好工作 — 歡迎 share 你的故事 (匿名化後), 給其他台灣求職者一些信心.
