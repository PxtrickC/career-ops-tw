# 模式：pdf —— ATS 最佳化 PDF 生成

## 預設規則 —— PDF 預設輸出繁體中文

> **預設情況下, 履歷 PDF 與求職信 PDF 都用繁體中文輸出.**
> 投國際職、海外遠端、或使用者明確要求英文時, 才切到英文版.

切換英文 CV 的方式:
1. 使用者單次說「英文 CV」/「English CV」/「給我英文版」 → 該次 PDF 用英文
2. 使用者在 `config/profile.yml` 設 `language.cv_language: en` → 永久英文
3. 偵測到 JD 是英文 + 海外公司 → 主動建議:「這份是國際職, 我用英文 CV 比較好過 ATS, 可以嗎?」

## 完整 pipeline (預設繁中)

1. 讀 `cv.md` 作為真實來源 (預設繁中, 但若內容是英文也可)
2. 如脈絡裡沒有 JD 就跟使用者要 (文字或 URL)
3. 從 JD 萃取 15-20 個關鍵字 (中英都收, 看 JD 語言)
4. 偵測公司所在地 → 紙張格式:
   - 美 / 加 → `letter`
   - 台灣 / 亞洲 / 歐洲 → `a4`
5. 偵測角色 archetype → 調整 framing
6. 重寫 Professional Summary, 注入 JD 關鍵字 + 你的職涯敘事 (例:「從新創 0→1 起家, 現在把系統思維帶進 AI 整合」)
7. 選 top 3-4 個與職缺最相關的專案
8. 依 JD 相關度重排經歷的 bullets
9. 從 JD 條件建立 competency grid (6-8 個關鍵字 phrases)
10. 在既有成就裡自然注入關鍵字 (**絕不捏造**)
11. **填入 template section 標題** (繁中):
    - `SECTION_SUMMARY` → 「個人簡介」
    - `SECTION_COMPETENCIES` → 「核心專長」
    - `SECTION_EXPERIENCE` → 「工作經歷」
    - `SECTION_PROJECTS` → 「重點專案」
    - `SECTION_EDUCATION` → 「學歷」
    - `SECTION_CERTIFICATIONS` → 「證照」
    - `SECTION_SKILLS` → 「技能」
    - `LANG` → `zh-Hant-TW`
12. 用 template + 客製內容生成完整 HTML
13. 寫到 `/tmp/cv-candidate-{company}.html`
14. 執行: `node generate-pdf.mjs /tmp/cv-candidate-{company}.html output/cv-candidate-{company}-{YYYY-MM-DD}.pdf --format={letter|a4}`
15. 回報 PDF 路徑、頁數、關鍵字覆蓋率 (繁中)

## 英文 CV pipeline (fallback)

跟上面一樣, 但:
- 即時把 `cv.md` 內容翻成英文 (若原本是繁中)
- 用使用者 `profile.yml` 內的 `english_name` 而不是中文名
- Section 標題改英文:
  - `SECTION_SUMMARY` → "Professional Summary"
  - `SECTION_COMPETENCIES` → "Core Competencies"
  - `SECTION_EXPERIENCE` → "Work Experience"
  - `SECTION_PROJECTS` → "Projects"
  - `SECTION_EDUCATION` → "Education"
  - `SECTION_CERTIFICATIONS` → "Certifications"
  - `SECTION_SKILLS` → "Skills"
  - `LANG` → `en`
- 檔名加 `-en` 後綴: `output/cv-candidate-{company}-en-{YYYY-MM-DD}.pdf`

## ATS 規則 (乾淨 parsing)

- 單欄佈局 (不要 sidebar、不要平行雙欄)
- 標準 header (中文版用上面 11. 列出的中文標題, 英文版用下面那組)
- 圖片 / SVG 內不要放文字
- 重要資訊不要放在 PDF 的 header / footer (ATS 會忽略)
- UTF-8、可選取的文字 (不要 raster)
- 不要巢狀表格
- JD 關鍵字分散: Summary (top 5)、每個職位的第一個 bullet、Skills 區塊
- **中文 PDF 注意**: 確認 Noto Sans TC 字型有載入成功 (Playwright `document.fonts.ready` 已處理), 否則會 fallback 到方框

## PDF 視覺設計

詳見 `templates/cv-template.html`. **不要修改 template 的字體、版型、顏色** —— 那是設計層的真實來源. 字型已內建 `Noto Sans TC` fallback (給中文字), Latin 字仍走 DM Sans / Space Grotesk. 如果使用者要改設計, 引導他直接編輯 template, 不要在這個模式裡改.

## 道德關鍵字注入策略 (基於事實)

合法改寫範例:

- JD 寫「RAG pipelines」、CV 寫「LLM workflows with retrieval」 → 改成「RAG pipeline 設計與 LLM orchestration workflows」
- JD 寫「stakeholder management」、CV 寫「跨部門協作」 → 改成「跨工程、營運、業務的 stakeholder management」

**絕對不要加上候選人沒有的技能. 只能用 JD 用語重新表達既有經驗.**

## 生成後

- 如果該職缺已在 tracker: 把 PDF 欄位從 ❌ 改成 ✅
- 用繁體中文回報結果摘要: PDF 路徑、頁數、關鍵字覆蓋率、有無警告
- 提醒使用者 **送出前自己再 review 一次**

## Canva CV (選用)

如果 `config/profile.yml` 設定了 `canva_resume_design_id`, 可在生成前讓使用者選:

- **HTML/PDF (快、ATS 最佳化)** —— 上面的流程
- **Canva CV (視覺保留)** —— 透過 Canva MCP, Claude 會 duplicate 你既有的 Canva design, 套用 JD 客製內容後輸出. 需要在 `config/profile.yml` 設 `canva_resume_design_id`. 此流程仍是實驗性的, 預設用 HTML/PDF 路徑即可.
