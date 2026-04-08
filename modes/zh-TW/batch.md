# 模式：batch —— 批次處理職缺

兩種使用模式：**conductor --chrome**（即時瀏覽 portal）或 **standalone**（處理已收集好的 URL 清單的 script）。

## 架構

```
Claude Conductor (claude --chrome --dangerously-skip-permissions)
  │
  │  Chrome：瀏覽 portal（使用登入 session）
  │  直接讀取 DOM —— 使用者可以即時看到所有過程
  │
  ├─ 職缺 1：從 DOM 讀 JD + URL
  │    └─► claude -p worker → report .md + PDF + tracker-line
  │
  ├─ 職缺 2：點下一個，讀 JD + URL
  │    └─► claude -p worker → report .md + PDF + tracker-line
  │
  └─ 結束：merge tracker-additions → applications.md + 總結
```

每個 worker 都是一個獨立的 `claude -p` 子程序，帶乾淨的 200K token context。Conductor 只負責協調。

## 檔案

```
batch/
  batch-input.tsv               # URL 清單（conductor 或手動）
  batch-state.tsv               # 進度（自動產生、gitignored）
  batch-runner.sh               # Standalone 協調 script
  batch-prompt.md               # Worker 用的 prompt template
  logs/                         # 每筆職缺一個 log（gitignored）
  tracker-additions/            # Tracker 新增行（gitignored）
```

## 模式 A：Conductor --chrome

1. **讀狀態：** `batch/batch-state.tsv` → 看哪些已經處理過
2. **瀏覽 portal：** Chrome → 搜尋結果 URL
3. **萃取 URL：** 讀結果頁 DOM → 抽出 URL 清單 → append 到 `batch-input.tsv`
4. **對每筆待處理 URL：**
   a. Chrome：點進職缺 → 從 DOM 讀 JD 文字
   b. 存 JD 到 `/tmp/batch-jd-{id}.txt`
   c. 計算下一個 REPORT_NUM（流水號）
   d. 透過 Bash 執行：
      ```bash
      claude -p --dangerously-skip-permissions \
        --append-system-prompt-file batch/batch-prompt.md \
        "Procesa esta oferta. URL: {url}. JD: /tmp/batch-jd-{id}.txt. Report: {num}. ID: {id}"
      ```
   e. 更新 `batch-state.tsv`（completed/failed + score + report_num）
   f. Log 寫到 `logs/{report_num}-{id}.log`
   g. Chrome：返回 → 下一筆職缺
5. **分頁：** 沒有更多結果 → 點 "Next" → 重複
6. **結束：** Merge `tracker-additions/` → `applications.md` + 總結

## 模式 B：Standalone script

```bash
batch/batch-runner.sh [OPTIONS]
```

Options：
- `--dry-run` —— 只列出待處理清單，不執行
- `--retry-failed` —— 只重試失敗的
- `--start-from N` —— 從 ID N 開始
- `--parallel N` —— N 個 worker 並行
- `--max-retries N` —— 每筆最多重試次數（預設 2）

## batch-state.tsv 格式

```
id	url	status	started_at	completed_at	report_num	score	error	retries
1	https://...	completed	2026-...	2026-...	002	4.2	-	0
2	https://...	failed	2026-...	2026-...	-	-	Error msg	1
3	https://...	pending	-	-	-	-	-	0
```

## 可續跑性（Resumability）

- 中途掛掉 → 重跑 → 讀 `batch-state.tsv` → 跳過已完成
- Lock file（`batch-runner.pid`）避免重複執行
- 每個 worker 獨立：#47 失敗不會影響其他筆

## Workers (claude -p)

每個 worker 吃 `batch-prompt.md` 當 system prompt，自帶完整 context。

Worker 產出：
1. `reports/` 內的 report `.md`
2. `output/` 內的 PDF
3. `batch/tracker-additions/{id}.tsv` 內的 tracker 行
4. Stdout 輸出結果 JSON

## 錯誤處理

| 錯誤 | 處理方式 |
|------|----------|
| URL 無法存取 | Worker 失敗 → conductor 標記 `failed`，繼續下一筆 |
| JD 需要登入 | Conductor 嘗試讀 DOM。失敗 → `failed` |
| Portal 改版 | Conductor 依 HTML 推理、自行調整 |
| Worker crash | Conductor 標記 `failed`，繼續。用 `--retry-failed` 重試 |
| Conductor 掛掉 | 重跑 → 讀 state → 跳過已完成 |
| PDF 失敗 | Report .md 仍會儲存。PDF 留 pending |
