# 貢獻 career-ops-tw

謝謝你願意貢獻! career-ops-tw 是一個開源、為台灣求職者打造的工具. 歡迎所有 PR — 程式、文件、資料、翻譯都好.

這個專案是 [santifer/career-ops](https://github.com/santifer/career-ops) 的台灣繁中 fork. 跟原專案有關的核心評估架構問題, 也可以參考原專案的 issue / discussion.

## 開 PR 之前

**請先開 issue 討論你想做的改動.** 這幫助我們在你投入時間寫程式之前先對齊方向. 沒有對應 issue 的 PR 可能會因為跟專案架構或目標不符而被關掉.

### 好 PR 的特徵
- 修一個 issue 上列出的 bug
- 處理一個已經討論過、被認可的 feature request
- 清楚說明改了什麼、為什麼
- 遵守既有的程式風格與專案哲學 (簡單、極簡、品質勝於數量)

## 快速開始

1. 開 issue 討論你的想法
2. Fork repo
3. 開分支 (`git checkout -b feature/my-feature`)
4. 寫你的改動
5. 用 fresh clone 測試 (見 [docs/SETUP.md](docs/SETUP.md))
6. Commit & push
7. 開 PR 並 reference 對應的 issue

## 想貢獻什麼?

**很適合的第一次貢獻:**
- 加更多台灣求職平台到 `scan-portal.mjs` (例: Job Bank.tw, JobsGo.tw, 1111-tech)
- 新增公司 / 改善 keyword 到 `templates/portals.taiwan.example.yml`
- 補充 `modes/zh-TW/_shared.md` 內的薪資基準 (用真實 2026 市場資料 + 引用來源)
- 加更多 archetype 對應 (半導體 / 韌體 / 金融科技 / 醫療科技)
- 新增 example CV 到 `examples/` (虛構資料, 對應不同角色類型)
- 改善繁中翻譯 / 校對 modes 內容
- 文件改善

**較大的貢獻:**
- 新評估維度或 scoring 邏輯
- Dashboard / TUI 視覺化
- 新 skill modes
- `.mjs` 工具改善 (`scan-portal.mjs`, `merge-tracker.mjs`, `lib/states.mjs`)
- `roleFuzzyMatch()` 對中文 title 的處理改善

## 貢獻準則

- **永遠用繁體中文 (台灣)**, 不要用簡體或中國大陸用語. 例: 軟體 (不是软件)、程式 (不是程序)、網路 (不是网络)、檔案 (不是文件)、使用者 (不是用户).
- 程式碼註解可以英文也可以繁中, 但 markdown 文件 + 模式檔一律繁中
- Scripts 要 graceful handle 缺檔 (用 `existsSync` 之前先 check)
- 不要 commit 個人資料 (`cv.md`, `config/profile.yml`, `data/applications.md`, `reports/`, `output/`) — 這些都在 `.gitignore`
- 加新 canonical state 或別名一律走 `templates/states.yml` + `lib/states.mjs`, 不要 hardcode 在腳本內

## 我們**不**接受

- **scraping 違反 ToS 的平台.** LinkedIn 等明確禁止自動存取的平台不要 scrape. 用使用者貼上的內容處理.
- **自動送出申請的功能.** career-ops-tw 是決策輔助, 不是垃圾申請機器. 任何 `apply` 流程都要 human-in-the-loop.
- **未事先討論的外部 API 依賴.**
- **包含個人資料的 PR.** 真實的 CV / email / 電話都不要 commit. 用 `examples/` 加虛構資料.

## 開發

```bash
# 健康檢查
node verify-pipeline.mjs

# 狀態正規化 (修 legacy 西文 / 雜亂 status)
node normalize-statuses.mjs --dry-run

# 測試 portal helper
node scan-portal.mjs 104 --keyword "資深產品設計師" --area 6001001000 --pages 1
node scan-portal.mjs --help
```

## 需要幫忙?

- 開 issue 在這個 repo
- 讀架構文件 [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- 核心評估流程的問題: 參考 [santifer/career-ops](https://github.com/santifer/career-ops)
