# 模式：apply —— 即時申請助手

互動模式：當候選人正在 Chrome 上填寫申請表單時使用。讀取畫面內容、載入該職缺先前的評估脈絡，並為表單上每個問題產生客製化答案。

> **重要：所有要丟到表單裡、提交給雇主的文字（cover letter、表單答案、上傳的 PDF）一律以英文輸出，除非該職缺本身是繁體中文職缺。對話與內部備註可以用中文。**

## 需求

- **建議搭配 Playwright（visible mode）：**候選人看得到瀏覽器，Claude 可以與頁面互動
- **沒有 Playwright：**候選人分享 screenshot，或手動貼上題目

## Workflow

```
1. DETECT     → 讀取 Chrome 當前 tab（screenshot / URL / 標題）
2. IDENTIFY   → 從頁面抽出公司 + 角色
3. SEARCH     → 與 reports/ 內既有 report 比對
4. LOAD       → 讀完整 report + Section G（如果有）
5. COMPARE    → 螢幕上的角色與評估時是否一致？若有變動 → 警告
6. ANALYZE    → 找出表單上所有題目
7. GENERATE   → 為每個題目產生客製化答案（英文，除非職缺為中文）
8. PRESENT    → 用可直接 copy-paste 的格式呈現
```

## 步驟 1 —— 偵測職缺

**有 Playwright：**對當前 tab 做 snapshot，讀取標題、URL、可見內容。

**沒有 Playwright：**請候選人：

- 分享表單的 screenshot（Read 工具可以讀圖）
- 或把題目當文字貼上來
- 或直接告訴我公司 + 角色，我幫你找

## 步驟 2 —— 識別並載入脈絡

1. 從頁面萃取公司名與角色名
2. 用 Grep（case-insensitive）搜尋 `reports/`
3. 有 match → 讀完整 report
4. 有 Section G → 載入先前的草稿答案當基礎
5. 沒有 match → 通知候選人，並提議跑一個快速 auto-pipeline

## 步驟 3 —— 偵測角色變動

如果畫面上的角色與當初評估的不同：

- **通知候選人：**「角色從 [X] 變成 [Y]。要重新評估，還是直接把答案調整成新的職稱？」
- **若調整：**根據新角色微調答案，不重新評估
- **若重新評估：**跑完整 A–F 評估、更新 report、重新生成 Section G
- **更新 tracker：**在 applications.md 改寫角色名稱

## 步驟 4 —— 分析表單題目

找出**所有**可見題目：

- 自由文字欄位（cover letter、why this role 等）
- 下拉選單（how did you hear、work authorization 等）
- Yes / No（relocation、visa 等）
- 薪資欄位（range、expectation）
- 上傳欄位（resume、cover letter PDF）

把每題分類：

- **Section G 已經有答案** → 改寫既有答案
- **新題目** → 從 report + cv.md 重新生成

## 步驟 5 —— 生成答案

每題都依照下列規則：

1. **Report 脈絡：**用 B 區塊的 proof points、F 區塊的 STAR 故事
2. **既有 Section G：**有草稿就以它為底改寫
3. **「I'm choosing you」語氣：**主動性，不是乞討
4. **具體性：**引用螢幕上 JD 的某個具體點
5. **Portfolio proof point：**如果有「Additional info」欄位，把 demo / dashboard 連結放進去

**輸出格式：**

```
## 答案：[公司] —— [角色]

依據：Report #NNN | Score: X.X/5 | Archetype: [類型]
語言：English（職缺為英文）/ 繁體中文（職缺為中文）

---

### 1. [表單原題]
> [可直接 copy-paste 的答案]

### 2. [下一題]
> [答案]

...

---

備註：
- [關於角色、變動、需注意之處]
- [建議候選人自己再 review 的個人化部分]
```

## 步驟 6 —— Post-apply（選用）

如果候選人確認已送出：

1. 把 `applications.md` 內的狀態從 `Evaluated` 改成 `Applied`
2. 用最終答案更新 report 的 Section G
3. 建議下一步：`/career-ops contacto` 找 LinkedIn 對口

## Scroll 處理

如果表單還有更多題目沒顯示：

- 請候選人捲動，再分享一張 screenshot
- 或把剩下的題目貼上來
- 一輪一輪處理直到整個表單跑完

---

## 重要規則 —— 提交前一律停下

**永遠不要替候選人按下 Submit / Send / Apply。**填好表單、生成答案、產出 PDF 都可以，但**最後一步必須由候選人本人決定**。
