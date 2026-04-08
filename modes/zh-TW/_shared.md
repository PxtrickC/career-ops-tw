# 共享脈絡 — career-ops-tw (繁體中文)

<!-- ============================================================
     career-ops-tw 系統層共享脈絡. 第一次 onboarding 後使用者要做的事:
     1. 填寫 config/profile.yml (從 config/profile.taiwan.example.yml 複製)
     2. 在專案根目錄建立 cv.md (Markdown 履歷, 預設繁體中文)
     3. (選用) 建立 article-digest.md 收錄詳細 proof points
     4. 個人化敘事與 archetypes 寫進 modes/zh-TW/_profile.md (使用者層),
        不要直接編輯這個檔案 — 系統升級時會被覆蓋.
     ============================================================ -->

## 預設規則 — CV / PDF 預設繁體中文

> **預設情況下, 履歷 PDF 與求職信 PDF 都用繁體中文輸出.** Template (`templates/cv-template.html`) 內建 `Noto Sans TC` 字型 fallback, 透過 Google Fonts 載入. 同一份 template 兩種語言通用 — section 標題是 placeholder, 由 Claude 在生成時填中文或英文.

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
- Tracker canonical state ID (背後仍用 `Applied`、`Interview` 等; zh-TW 別名會自動正規化)

## 真實來源 (每次評估前一律先讀取)

| 檔案 | 路徑 | 何時讀 |
|------|------|--------|
| cv.md | `cv.md` (專案根目錄) | 每次 (預設繁中) |
| article-digest.md | `article-digest.md` (如存在) | 每次 (詳細 proof points) |
| profile.yml | `config/profile.yml` | 每次 (個人資料與目標職位) |
| _profile.md | `modes/zh-TW/_profile.md` | 每次 (使用者客製敘事與 archetype 覆寫) |

**規則：絕對不要把 proof points 中的數字 hardcode 在這裡。**評估時即時從 `cv.md` 與 `article-digest.md` 讀取。
**規則：文章／專案的數據以 `article-digest.md` 為準**（`cv.md` 內的數字可能較舊）。

---

## 評分系統

評估採用 6 個區塊（A–F），全域分數 1–5：

| 維度 | 衡量重點 |
|------|----------|
| CV 對應 (Match) | 技能、經歷、proof points 的對齊程度 |
| North Star alignment | 此職缺與目標 archetypes 的契合度 |
| Comp | 薪資相對市場（5 = 頂端 25%，1 = 明顯低於市場）|
| Cultural signals | 公司文化、成長性、穩定度、遠端政策 |
| Red flags | 阻礙因子、警訊（負向調整）|
| **Global** | 上述項目的加權平均 |

**分數解讀：**
- 4.5+ → 高度契合，建議立即投遞
- 4.0–4.4 → 不錯，值得投遞
- 3.5–3.9 → 還算可以但不理想，除非有特殊理由再投
- 低於 3.5 → 不建議投遞（請見 CLAUDE.md 的 Ethical Use 段落）

---

## North Star —— 目標角色

此 skill 對所有目標角色一視同仁，沒有主次之分。每個都可以是成功路徑，只要薪酬與成長性到位：

| Archetype | 主題軸線 | 公司在買的是什麼 |
|-----------|----------|------------------|
| **Founding Designer** | 0→1 產品、品牌、UX、成長 | 一個能在早期新創一手包辦品牌與產品設計的人 |
| **Product Designer (AI-native)** | AI tooling、agent、LLM 產品 | 懂 AI 產品節奏、能與工程快速協作的設計師 |
| **Design Engineer / Creative Technologist** | 用 AI 工具出貨、原型、互動 | 沒有傳統工程背景但能獨立 ship 產品的人 |
| **Brand & Growth Lead** | 品牌策略、GTM、社群 | 能把品牌與成長綁在一起的早期新創人才 |
| **Founding PM** | 0→1、發現、交付 | 真的出貨過產品的 operator |
| **Forward Deployed / Solutions Designer** | 客戶端、快速原型 | 能直接面對客戶、快速交付的人 |

<!-- [客製化] 依據你的目標角色調整上方原型 -->

### 各 archetype 的 framing

> **具體數據：每次評估時從 `cv.md` 與 `article-digest.md` 即時讀取。絕對不要 hardcode。**

| 如果職缺屬於... | 候選人要強調... | Proof point 來源 |
|-----------------|-----------------|------------------|
| Founding Designer | 0→1 出貨、品牌＋產品兼顧、自驅 | profile.yml + article-digest.md |
| Product Designer (AI-native) | 與 AI 共創、產品節奏、prototype 速度 | article-digest.md + cv.md |
| Design Engineer | 用 Claude Code／Antigravity 自主出貨 | article-digest.md + cv.md |
| Brand & Growth Lead | 品牌策略＋GTM 整合、社群操盤 | profile.yml + cv.md |
| Founding PM | 出貨節奏、商業敏感度、跨職能協作 | cv.md + article-digest.md |
| Forward Deployed | 快速交付、面對客戶、prototype to production | cv.md + article-digest.md |

### 轉職敘事（所有 framing 都要用到）

從 `config/profile.yml -> narrative.exit_story` 讀取，用來串接 PDF 摘要、STAR 故事、表單草稿：

- **PDF summary：**把過去經驗與現在的目標串起來 ——「Now applying the same [skills] to [JD 的領域]。」
- **STAR 故事：**呼應 `article-digest.md` 的 proof points
- **表單草稿 (區塊 G):** 轉職敘事放在第一題回答
- **當職缺出現「entrepreneurial」「autonomy」「builder」「end-to-end」**：這是最大的差異點，提高 match 權重

### 跨領域定位 (依使用者背景客製)

預設範本鼓勵把候選人定位成「能跨多個領域 ship 的人」, 但具體定位來自使用者的真實背景. 使用者第一次 onboarding 時把這段改寫進 `modes/zh-TW/_profile.md` (使用者層).

範例 framing 模板 (依角色類型挑一個出發點再客製):

- **對 PM**: 「能用原型快速降低不確定性, 再有紀律地把產品 ship 出去」
- **對 Engineer**: 「Day 1 就能交付, 且帶 observability 與 metrics」
- **對 Designer**: 「品牌、UX、研究、與工程協作都做過的全棧設計者」
- **對 Tech Lead / EM**: 「帶過跨職能小團隊, 從 0→1 出貨經驗充足」
- **對 Data / AI**: 「能把模型成果翻譯成業務語言, 不只 notebook 玩家」

關鍵原則: **真實的 proof points 讓定位站得住**. 不要放使用者沒做過的事 — 讓 AI 在評估時即時從 `cv.md` / `article-digest.md` / `_profile.md` 讀真實內容.

### Portfolio 作為 proof point

<!-- [客製化] 如果有 demo、dashboard 或公開專案，配置在 profile.yml 的 narrative.dashboard -->

如果候選人有 live demo／dashboard（檢查 `profile.yml`），在高優先職缺的申請信中主動提供連結。

---

## 薪酬情報（Comp Intelligence）

<!-- [客製化] 依目標角色研究薪資區間 -->

**通用建議：**
- 用 WebSearch 抓取當前市場資料（Glassdoor、Levels.fyi、Cake、104 薪資情報、Yourator、LinkedIn Salary）
- 以**職位名稱**錨定區間，而不是技能 —— 職稱決定薪資頻段
- 接案費率通常比正職時薪高 30–50%（要包含勞健保、特休、空窗期、業務開發成本）
- 遠端的 geo-arbitrage 對台灣求職者非常有利：以美元計薪、住台灣，實質購買力會大幅提升

### 台灣市場特性（重要）

繁中職缺與談薪時，有些用語在英文／西文市場不存在，必須正確處理：

| 名詞 | 意思 | 對評估的影響 |
|------|------|--------------|
| **試用期** | 通常 3 個月，最長不得超過勞基法規範 | 標準。若超過 3 個月要 flag |
| **預告期 / 離職預告** | 工作 3 個月以上：10 天；1 年以上：20 天；3 年以上：30 天 | 規劃到職日要納入 |
| **特休** | 依年資從 3 天起算，1 年 7 天，3 年 14 天等 | 低於勞基法即違法。新創常給「無上限特休」要驗證實際使用率 |
| **年終獎金 / 13 個月** | 多數台灣公司給 1–2 個月，外商可能 0 但底薪較高 | 比較總包時必須換算：年薪 = 月薪 × (12 + 年終)。**絕對不要漏算** |
| **三節獎金 / 紅包** | 端午、中秋、農曆年的小額獎金 | 加總後可能等於 0.5–1 個月薪資，傳產比較常見 |
| **分紅 / 股票** | 上市公司可能配發股票，新創可能給 options/RSU | options 在台灣稅務較複雜，要問清楚 vesting cliff 與行權條件 |
| **勞健保** | 法定保險，公司負擔約 70% | 標準。要注意「投保薪資」是不是按實際薪資申報（很多公司低報）|
| **勞退 6%** | 雇主強制提撥 6% 到個人帳戶 | 法定。可額外自提最高 6%（享稅務優惠）|
| **團保** | 公司加買的商業保險 | 中大型公司常見。要看含眷屬與否、額度、是否含意外醫療 |
| **競業條款** | 離職後限制就職範圍 | 必須有「合理補償」才合法。看到競業條款一律 flag 並要求釐清補償 |
| **保密協議（NDA）** | 範圍與期間 | 看清楚定義，過度寬廣的 NDA 要警覺 |
| **加班費／責任制** | 法律上「責任制」需經主管機關核定才合法 | 自稱責任制但不付加班費 → red flag |
| **派遣／約聘** | 透過第三方派遣公司聘僱 | senior 角色用派遣 → red flag，待遇與保障較差 |
| **遠端政策** | 全遠端 / hybrid（每週幾天）/ 進辦公室 | 用 profile.yml 的偏好評分；針對台灣外的混合制要降分但不歸零 |
| **時區重疊** | 對於跨國遠端職缺非常關鍵 | 台灣 GMT+8 對亞洲、歐洲尚可，對美國西岸有挑戰，要主動說明 |

---

## 談薪劇本

<!-- [客製化] 依個人狀況調整 -->

**期望薪資（通用框架）：**
> 「根據目前市場上類似職位的數據，我的目標區間是 [profile.yml 的 target_range]。我對結構保持彈性 —— 真正在意的是整體 package 與成長空間。」

**面對 geo-discount（地區折價）：**
> 「我競爭的角色都以成果衡量，不是地點。我的 track record 不會因為郵遞區號改變。」

**對方開的數字低於目標：**
> 「我目前同時在談的 package 落在 [更高區間]。[公司名] 對我有吸引力，因為 [具體理由]。是否有機會把數字拉到 [目標]？」

**年終／分紅怎麼比較：**
> 「為了能公平比較不同 offer 的 package，可以分別說明固定月薪、年終月數、變動分紅／options 的部分嗎？」

---

## 地點政策（Location Policy）

<!-- [客製化] 從 config/profile.yml -> location 讀取 -->

**填寫表單時：**
- 「能否到辦公室？」這類二元問題，依 `profile.yml` 的實際情況回答
- 自由欄位：明確說明時區重疊與可協作時段

**評估評分時：**
- 海外混合制職缺的 remote 維度：給 **3.0**（不是 1.0）
- 只有當職缺明確寫「強制 4–5 天進辦公室、無例外」時才給 1.0

---

## Time-to-offer 優先順序

- 可運作的 demo + metrics > 完美
- 早投 > 多學
- 80/20 原則，所有事 timebox

---

## 全域規則

### 永遠不要

1. 捏造經歷或數據
2. 修改 `cv.md` 或 portfolio 檔案
3. 替候選人按下送出
4. 在自動產出的訊息裡分享電話號碼
5. 推薦低於市場行情的薪資
6. 沒讀 JD 就生 PDF
7. 使用 corporate-speak 或空話
8. 忽略 tracker（每筆評估都要登記）
9. 在使用者沒明確同意的情況下, 用未驗證的資訊取代真實 cv.md 內容

### 永遠要

0. **求職信:** 只要表單允許, 一律附上. 視覺設計與 CV 一致, PDF 形式, **語言對齊 CV 與 JD** (繁中職缺用繁中, 英文職缺用英文), 1 頁以內, 引用 JD 原文對映 proof points
1. 評估前先讀 `cv.md` 與 `article-digest.md`（若存在）
1b. **每次 session 第一筆評估：**用 Bash 執行 `node cv-sync-check.mjs`，有警告就告訴使用者
2. 偵測角色 archetype，並依此調整 framing
3. 對應 JD 條件時，引用 CV 的精確字句
4. 用 WebSearch 查薪資與公司資料
5. 評估後寫入 tracker
6. 對話與報告用繁體中文；履歷 PDF／HTML 與求職信 PDF 用英文
7. 直接、可執行 —— 不要場面話
8. 自然台灣科技業中文：短句、動詞主導、避免被動。技術名詞（stack、pipeline、embedding、RAG、agent）保留英文
8b. **PDF Professional Summary 要包含 case study URL：**recruiter 常常只讀第一段。所有 URL 在 HTML 中要加 `white-space: nowrap`
9. **Tracker 新增用 TSV** —— 絕對不要直接編輯 applications.md 新增資料。把 TSV 寫到 `batch/tracker-additions/`，由 `merge-tracker.mjs` 處理
10. **每份 report header 都要有 `**URL:**`** —— 放在 Score 與 PDF 之間

### 工具

| 工具 | 用途 |
|------|------|
| WebSearch | 薪資、趨勢、企業文化、LinkedIn 聯絡人、職缺 fallback |
| WebFetch | 從靜態頁面抓 JD 的 fallback |
| Playwright | 驗證職缺是否仍開放（browser_navigate + browser_snapshot），也可抓 SPA 內容。**重要：絕不要 2 個以上 agent 同時用 Playwright，他們共享同一個瀏覽器實例** |
| Read | cv.md、article-digest.md、cv-template.html |
| Write | 暫存 HTML for PDF、applications.md、reports .md |
| Edit | 更新 tracker |
| Bash | `node generate-pdf.mjs` |

---

## 專業書寫與 ATS 相容（針對 PDF 與英文文件）

以下英文書寫規則只在「英文 CV / 英文 cover letter」分支時適用 — 預設情況下 PDF 已是繁體中文. 投國際職、海外遠端、或使用者明確要求英文版時, 才需要遵守.

### 避免老套句型

- 「passionate about」「results-oriented」「proven track record」
- 「leveraged」（改用 "used" 或具體工具名）
- 「spearheaded」（改用 "led" 或 "ran"）
- 「facilitated」（改用 "ran" 或 "set up"）
- 「synergies」「robust」「seamless」「cutting-edge」「innovative」
- 「in today's fast-paced world」
- 「demonstrated ability to」「best practices」（直接寫出 practice 名稱）

### Unicode 正規化

`generate-pdf.mjs` 會自動把 em-dash、智慧引號、零寬字元正規化為 ASCII，但建議一開始就不要產生它們。

### 句型多樣性

- 不要每個 bullet 都用同一個動詞開頭
- 句子長短交錯
- 不要永遠用「X, Y, and Z」 —— 有時兩個項目，有時四個

### 具體勝過抽象

- 「Cut p95 latency from 2.1s to 380ms」 > 「improved performance」
- 「Postgres + pgvector for retrieval over 12k docs」 > 「designed scalable RAG architecture」
- 在允許範圍內具體寫出工具、專案、客戶名稱

---

## 台灣市場 — 職缺類型 archetypes (補充)

預設 archetypes 偏向設計 / AI / 產品角色, 給其他台灣常見職缺類型參考:

| Archetype | 常見職稱 | 重點評估維度 |
|---|---|---|
| 後端工程師 | 資深後端、Senior Backend、Backend Lead | 系統設計、流量規模、語言 stack、CI/CD、on-call 政策 |
| 全端工程師 | 全端、Full Stack、Web Engineer | 前後端比例、framework、團隊規模 |
| 前端工程師 | 前端、Frontend、UI Developer | React/Vue 經驗、設計協作、效能 |
| AI / ML 工程師 | AI Engineer、ML Engineer、資料科學家 | 模型 stack (LLM / 傳統 ML)、生產化經驗、GPU 資源 |
| 資料工程師 | Data Engineer、ETL、Pipeline | 資料量、Lake/Warehouse 經驗、orchestration |
| DevOps / SRE | DevOps、SRE、雲端工程師 | 雲端 stack (AWS/GCP)、Terraform、on-call 強度 |
| 產品經理 | PM、Product Manager、產品主管 | 產品階段 (0→1 vs 1→N)、metrics 經驗、跨部門溝通 |
| 設計師 | UI/UX、Product Designer | 作品集深度、研究流程、與工程協作 |
| 技術主管 | Tech Lead、EM、技術經理 | 帶人經驗、團隊規模、招募經驗 |
| 半導體 / 韌體 | RD、IC 設計、韌體工程師 | 製程節點、Verilog/SystemVerilog、責任制風險 |

## 台灣市場 — 薪資區間 (2026 參考)

**台北** (年薪含年終, NTD):

| 職等 | 本土公司 | 外商台灣分公司 | 國際遠端 (USD) |
|---|---|---|---|
| Junior (0-2 yr) | 600K-900K | 800K-1.2M | $40K-60K |
| Mid (2-5 yr) | 900K-1.4M | 1.2M-1.8M | $60K-90K |
| Senior (5-8 yr) | 1.3M-2.0M | 1.8M-2.8M | $80K-130K |
| Staff / Lead (8+ yr) | 1.8M-2.8M | 2.5M-4.5M | $120K-200K |
| Principal / EM | 2.5M-4.5M | 3.5M-6.0M+ | $150K-280K |

備註:
- **新竹半導體** 通常比上表高 20-40%, 但工時、責任制風險也高
- **台中 / 高雄** 通常比台北低 15-25%
- 上面是「年薪總包」(月薪 × (12+年終月數)). 月薪計算: 年薪 ÷ 14 是常見預設 (12 月 + 2 個月年終)
- **不含**: 股票 / RSU、年中獎金、三節獎金、績效獎金 — 這些另外加

## 台灣市場 — 紅旗清單 (評估時自動扣分)

1. **責任制** — 變相無加班費. 除非角色本就高薪 + 高自主權, 否則扣 1 分
2. **投保薪資低於實領** — 高薪低報, 影響勞退、失業給付、產假給付. 違法但常見, 扣 1 分
3. **試用期超過 3 個月** — 法定上限通常 3 個月, 超過代表公司想保留長期裁人空間, 扣 0.5 分
4. **預告期超過 30 天** — 法定上限 30 天, 超過違法, 扣 1 分
5. **競業條款超過 1 年或無補償** — 違反勞基法 §9-1, 扣 1 分
6. **派遣 / 外包** — 除非明確標註且薪資合理, 否則扣 1 分
7. **薪資面議無區間** — 多半薪資偏低或想砍價, 扣 0.5 分
8. **「加班是常態」「需配合專案上線」措辭** — 工時過長警訊, 扣 0.5 分
9. **「年輕活潑團隊」「家庭般氣氛」** — 通常代表小公司無制度、低薪、模糊工時. 看脈絡扣 0-0.5 分
10. **要求自備電腦但不補助** — 待遇普通的小公司紅旗

## 台灣市場 — 加分項 (評估時加分)

1. **明列年終月數** — 願意承諾的公司透明度高, +0.5
2. **勞退提撥高於 6%** — 法定下限是 6%, 加碼是好訊號, +0.5
3. **明列加班費 / 補休制度** — 沒有責任制, +0.5
4. **彈性工時 / 遠端友善** — +0.5
5. **教育訓練補助** (Coursera / Udemy / 證照) — +0.3
6. **提供 Mac / 高階設備** — +0.3
7. **上市櫃 / 興櫃** — 財務透明, +0.3
8. **明確的職涯路徑 / level 制度** — +0.3
9. **內部 DEI / 性別平等政策** — +0.3
10. **無需面議, 直接寫薪資區間** — +0.5

## 台灣市場 — 評估維度補充

預設評估架構 (A-F) 維持不變, 但繁中模式下額外重視:
- **公司透明度** (上市櫃 / 興櫃 / 股權結構公開)
- **勞動權益** (上述紅旗 / 加分項)
- **加班文化** (過去員工 Glassdoor / Blind / Dcard 評論)
- **時區友善** (若是國際遠端, 是否要值美西半夜的會議)

