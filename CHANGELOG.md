# Changelog

career-ops-tw 的版本歷史. 格式參照 [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), 版本號遵循 [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

這個 fork 從 [santifer/career-ops](https://github.com/santifer/career-ops) 起家. v0.1.0 是 fork 後第一個 Taiwan-first release. 想看上游 santifer 的歷史請見原 repo.

## [Unreleased]

(待整理 — 把任何 main 上的新改動先列在這裡, 下次發 release 時搬到對應版本)

---

## [0.1.0] — 2026-04-08

第一個公開的 Taiwan-first release. 完整重構為繁體中文 + 台灣勞動條件 + 本土求職平台. 所有以下變動相對於 fork 起點的 santifer/career-ops 上游.

### Added

- **`scan-portal.mjs`** — 新增單一 CLI helper, 直接打台灣本土求職平台. 支援 4 個 platform:
  - **104**: JSON API `/jobs/search/api/jobs` (帶 Referer + `X-Requested-With: XMLHttpRequest`)
  - **Yourator**: JSON API `/api/v4/jobs?term[]=...`
  - **Cake (cake.me)**: Next.js SSR HTML scraping (用 `__jobTitle` / `__companyName` class)
  - **1111**: Nuxt SSR HTML scraping (用 anchor `title=` 屬性)
  - 統一 JSONL 輸出格式 (`{platform, query, title, company, url, location, salary, posted}`), 不依賴 Playwright
- **`lib/states.mjs`** — 新增唯一真實來源讀取器, 從 `templates/states.yml` 載入 canonical states. 內建 tiny YAML parser (零 npm dep). Exports: `getStates`, `getCanonicalLabels`, `getCanonicalIds`, `resolveLabel`, `validateStatus`, `isKnownStatus`. 接受 canonical label / id / 任何 alias (legacy 西文 / zh-TW / 英文 shorthand) 都解析到 canonical 英文 label.
- **`config/profile.taiwan.example.yml`** — 台灣使用者預設範本: NTD 幣別、Asia/Taipei 時區、勞退 6%、年終獎金月數、雙語姓名 (中文 + english_name 給國際 CV)、台灣特有勞動偏好 (試用期上限、預告期上限)、紅旗清單 (責任制 / 投保薪資低於實領 / 競業條款無補償 / 派遣).
- **`templates/portals.taiwan.example.yml`** — 台灣求職平台範本, 預載:
  - 本土平台: 104, Cake, Yourator, 1111 (用 `scan_method: portal_api` 指向 helper)
  - 台灣外商: Google TW, Microsoft TW, AWS TW, ByteDance TW, Trend Micro
  - 在地新創: Appier, Gogolook, KKBOX, Dcard, 17LIVE, PicCollage, iKala, 17 Media, 玉山金控
  - 對台友善遠端: GitLab, Automattic, Vercel, Hugging Face, Anthropic
- **`modes/zh-TW/`** — 16 個 mode 檔, 完整繁中翻譯 (auto-pipeline / batch / scan / contacto / deep / project / training / tracker / pipeline / oferta / ofertas / apply / pdf / _shared / _profile.template / README).
- **`modes/zh-TW/_shared.md`** 內新增的台灣專屬內容:
  - 10 種 Taiwan archetype 對照表 (後端 / 前端 / 全端 / AI / 資料 / DevOps / PM / 設計師 / 技術主管 / 半導體韌體)
  - 2026 Taipei 薪資基準表 (本土公司 vs 外商台灣分公司 vs 國際遠端 USD, 5 個 level)
  - 10 個 Taiwan 紅旗 (責任制 / 投保薪資低於實領 / 試用期 > 3 個月 / 預告期 > 30 天 / 競業條款無補償 / 派遣外包 / 薪資面議 / 加班常態化 / 「家庭般氣氛」/ 自備電腦不補助)
  - 10 個加分項 (明列年終月數 / 勞退提撥 > 6% / 加班費明列 / 彈性工時 / 教育訓練補助 / 上市櫃透明 / 明確 level 制度等)
- **CV PDF 繁體中文輸出** — `templates/cv-template.html` 內建 `Noto Sans TC` 字型 fallback (Google Fonts), 搭配 `generate-pdf.mjs` 設 Playwright `locale: 'zh-TW'` 讓 CJK glyph shaping 正確. 同一份 template 中英雙語通用, section 標題 (`{{SECTION_*}}`) 由 Claude 在生成時填中文或英文.
- **Tracker 多語狀態別名** — `templates/states.yml` 加入完整 zh-TW alias (`已申請`, `面試中`, `已收到 offer`, `婉拒`, `放棄`, `略過` 等), 寫進 TSV 時自動正規化成英文 canonical.
- **`cv.example.md`** — 通用台灣 CV 範本 (繁中骨架 + 撰寫提示).
- **`CHANGELOG.md`** — 這個檔案.
- **`.github/workflows/ci.yml`** — GitHub Actions CI, matrix ubuntu × node 18/20/22. 跑 `test-all.mjs --quick`, `verify-pipeline.mjs`, `merge-tracker.mjs --dry-run`, `normalize-statuses.mjs --dry-run`, `scan-portal.mjs` smoke test, `lib/states.mjs` resolver smoke test (8 cases).
- **README CI badge** — 顯示最新 main 是否健康.
- **`npm run test`** + **`npm run scan`** scripts in `package.json`.

### Changed

- **預設模式** 從 `modes/` (英文) 改為 `modes/zh-TW/`. CLAUDE.md 重寫成 Taiwan-only onboarding. Onboarding Step 5 加入台灣特有問題 (是否接受責任制 / 期待年終月數 / 偏好本土 vs 外商 vs 遠端 / 對上市櫃透明度的要求).
- **Canonical states** 從西班牙文 (`Evaluada`, `Aplicado`, `Rechazado`, `Descartado`, `NO APLICAR` 等) 遷移到英文 (`Evaluated`, `Applied`, `Rejected`, `Discarded`, `SKIP`). 既有 `data/applications.md` 的 row 在 normalize-statuses 跑過後自動 migrate. zh-TW 別名同時加入 states.yml.
- **`merge-tracker.mjs` `roleFuzzyMatch()`** 升級為 level-aware. 加入 25 個 level token 表 (junior / senior / staff / lead / 資深 / 主任 / 主管 / 總監 等中英並列), 加 `LEVEL_ALIAS` 把 `sr↔senior` / `jr↔junior` 正規化. 如果兩個 role 文字相似但 level 不交集 → 視為不同職缺. 修掉「AmazingTalker 產品設計師 (junior)」被「資深產品設計師 (senior)」覆蓋的 bug. 12/12 unit test pass.
- **`merge-tracker.mjs` 自動 migration** — 每次跑時, 既有 row 的 status 會被 `lib/states.mjs` `resolveLabel()` 即時正規化到 canonical 英文, 寫回時整批升級.
- **`verify-pipeline.mjs` + `normalize-statuses.mjs`** 重構 — 移除 hardcoded 西文 canonical state list, 全部改用 `lib/states.mjs` 的 `isKnownStatus` / `resolveLabel`. 唯一真實來源是 `templates/states.yml`.
- **`scan-portal.mjs` Cake handler** — 抽 title / company 用更穩定的 class 片段 (`__jobTitle` / `__companyName`) 而不是 first-text-after-anchor.
- **`scan-portal.mjs` 1111 handler** — 改用 anchor 的 `title=` 屬性 + `/corp/` anchor 的 `title=` 抽公司, 而不是脆弱的 fuzzy text match.
- **CLAUDE.md 整段 onboarding** 改寫為繁中, 把使用者範本路徑全部更新成 `modes/zh-TW/_profile.template.md` / `config/profile.taiwan.example.yml` / `templates/portals.taiwan.example.yml`.
- **CLAUDE.md "Update Check" 段落** 整段移除, 改為「Updates」段, 直接教 `git pull` 與 cherry-pick upstream santifer 的流程.
- **README.md** 全文重寫為 Taiwan-first 開源描述, 加上跟原版的對照表, 雙語 quick-start checklist (含 `npx playwright install chromium` 提醒).
- **`templates/portals.taiwan.example.yml` `title_filter.negative`** 加入「責任制」「薪資面議」「面議」「高薪低報」「助理」 — 這些之前只在 evaluation 階段被 flag, 現在在 scan 階段就先過濾掉.
- **`package.json`** — name → `career-ops-tw`, version → `0.1.0`, author → `career-ops-tw contributors`, repo url → 指向新 fork, 加 keywords (`taiwan`, `104`, `cakeresume`, `yourator`).
- **`VERSION`** 從 `1.2.0` (santifer) 改為 `0.1.0` (Taiwan fork 第一版).

### Removed

- **`modes/` 內所有英文 mode 檔** (16 個) — `modes/zh-TW/` 已是完整繁中對應, 不需要英文 fallback.
- **`modes/de/`** (German DACH 模式) 與 **`modes/fr/`** (Francophone 模式) — 此 fork 只服務台灣市場.
- **`templates/portals.example.yml`** (santifer 的英文市場範本) 與 **`config/profile.example.yml`** (santifer 的英文 profile 範本) — 用 Taiwan 版替代.
- **`update-system.mjs`** + 其在 `package.json`、`CLAUDE.md`、`test-all.mjs` 內的所有引用 — 沒有 auto-updater, 改用 `git pull`.
- **`.github/FUNDING.yml`** (santifer 的 sponsor) — 維護者可自行加回.
- **santifer 的個人 narrative** 從 `modes/zh-TW/_shared.md` 剔除 (`tokenomics` framing 等), 改為通用的「依使用者背景客製」框架.
- **santifer 的西班牙文殘留** (`Match con CV` → `CV 對應`, `Bloque G` → `區塊 G`, `Pendientes` → `待處理`, `Procesadas` → `已處理`).

### Fixed

- **`merge-tracker.mjs` AmazingTalker bug** — junior tier (#040, 2.4/5) 跟 senior tier (#054, 4.0/5) 被 fuzzy match 當成同一筆, 導致 senior 評估覆蓋 junior. 修法見上 (`Changed` 區的 level-aware fuzzy match).
- **`lib/states.mjs` 唯一真實來源** — 之前 `merge-tracker.mjs` / `verify-pipeline.mjs` / `normalize-statuses.mjs` 各自 hardcode 自己版本的 canonical state 與 alias, 容易 drift. 集中化後三個 script 共用同一份解析邏輯.
- **CLAUDE.md 檔名引用 (audit finding)** — 之前混雜 santifer 上游的 `config/profile.example.yml` / `templates/portals.example.yml` / `modes/_profile.template.md` 路徑, 改為正確的 `*.taiwan.example.yml` / `modes/zh-TW/_profile.template.md`.
- **`modes/zh-TW/scan.md` + `pipeline.md` 區段名稱對齊** — 文件還在引用 `Pendientes` / `Procesadas`, 但實際 `data/pipeline.md` 已是繁中「待處理 / 已處理」. 統一.
- **CI scan-portal smoke test** — 第一版 CI 用 `node -e "import('./scan-portal.mjs')"` 做 smoke test, 但 scan-portal 是 CLI script, top-level 會 process.exit. 改用 `--help` + 故意觸發 unknown platform error (用 `!` 反向 exit code).
- **`lib/states.mjs` parser bash heredoc escaping bug** — 開發 unit test 時遇到 bash heredoc 把 `\\b` 吃掉的問題, 改用 Write tool 跳過 shell escape.

### Security

- 移除所有個人資料 (cv.md, profile.yml, applications.md, reports/, output/, batch/tracker-additions/merged/, interview-prep/, screenshots, .yml.bak files). 詳細清單見 [初始 commit](https://github.com/PxtrickC/career-ops-tw/commit/1d7f45c).
- `.gitignore` 已涵蓋 `data/applications.md`, `data/pipeline.md`, `data/scan-history.tsv`, `cv.md`, `config/profile.yml`, `portals.yml`, `reports/`, `output/`, `batch/tracker-additions/`, `.claude/settings.local.json`. 使用者自己的資料不會被意外 commit.
- `test-all.mjs` 內建 personal data leak guard — 任何維護者 / 貢獻者的真名 / email / 電話 / 路徑都不會通過 CI.
- LICENSE 為雙重 MIT copyright (santifer 為原作者, Patrick Chiang 為 fork 維護者), 兩者皆受 MIT 條款保護.

### Known issues / 已知問題

- **Meet.jobs 不在 `scan-portal.mjs` 支援清單** — Meet.jobs 的搜尋過濾完全在前端 React, URL 參數 (`?q=`, `?keyword=`, `?term=`) 全部無效, 也沒有可發現的公開 JSON API. 需求 Meet.jobs 訊號的話, 改用 Level 3 WebSearch + `site:meet.jobs` filter, 或等社群貢獻 reverse engineering.
- **CV PDF 繁中字型載入依賴 Google Fonts** — 第一次生成 PDF 時若無網路會 fallback 到系統字型. Offline 環境建議手動把 Noto Sans TC 下載到 `templates/fonts/` 並改 template 內的 @font-face 來源.
- **Audit subagent 飛掉的建議**: GIF demo / dry-run mode / dashboard quickstart 文件 / `examples/taiwan-*` 範例候選人. 留待後續版本.

---

[Unreleased]: https://github.com/PxtrickC/career-ops-tw/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/PxtrickC/career-ops-tw/releases/tag/v0.1.0
