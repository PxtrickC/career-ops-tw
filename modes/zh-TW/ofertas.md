# 模式：ofertas —— 多 offer 比較

用 10 維加權 scoring matrix：

| 維度 | 權重 | 1–5 評分標準 |
|------|------|---------------|
| North Star 對齊 | 25% | 5 = 完全目標角色，1 = 不相關 |
| 與 CV 的 match | 15% | 5 = 90%+ match，1 = <40% match |
| 職級（senior+） | 15% | 5 = staff+，4 = senior，3 = mid-senior，2 = mid，1 = junior |
| 預估薪酬 | 10% | 5 = 市場頂端 25%，1 = 低於市場 |
| 成長軌跡 | 10% | 5 = 清楚往下一個 level 的路徑，1 = 死路 |
| 遠端品質 | 5% | 5 = 全遠端 async，1 = 只能進辦公室 |
| 公司聲譽 | 5% | 5 = 頂級雇主，1 = 有明顯 red flag |
| 技術 stack 現代度 | 5% | 5 = 最新 AI/ML，1 = legacy |
| 到 offer 的速度 | 5% | 5 = 快，1 = 6 個月以上 |
| 文化訊號 | 5% | 5 = builder 文化，1 = 官僚 |

每個 offer：列出每個維度的分數，再算加權總分。
最終排名 + 建議，並考量 time-to-offer。

如果 context 裡還沒有 offer，請使用者提供 —— 可以是文字、URL，或 tracker 裡已評估過的 offer 編號。
