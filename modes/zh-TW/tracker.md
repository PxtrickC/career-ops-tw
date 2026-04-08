# 模式：tracker —— 應徵追蹤表

讀取並顯示 `data/applications.md`。

**Tracker 格式：**
```markdown
| # | Date | Company | Role | Score | Status | PDF | Report |
```

可能狀態：`Evaluated` → `Applied` → `Responded` → `Interview` → `Offer` / `Rejected` / `Discarded` / `SKIP`
（完整定義請見 `templates/states.yml`）

- `Applied` = 候選人已送出申請
- `Responded` = 有 recruiter / 公司聯絡，候選人已回覆（inbound）
- `Interview` = 正在面試流程中

如果使用者要求更新狀態，就直接編輯該行（允許編輯既有資料；但**新增 entry 只能透過 `batch/tracker-additions/` TSV + `merge-tracker.mjs`**）。

也順便顯示統計：
- 總應徵數
- 各狀態分布
- 平均分數
- 已產 PDF 比例
- 已產 report 比例
