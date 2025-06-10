# chatbot_ex_of_Carrefour

# Carrefour Web

Carrefour Web 是一個以 Flask 為後端、結合 Gemini LLM 智能推薦與多角色互動的家樂福商品推薦聊天網站。用戶可選擇不同角色（如療癒料理兔、實用家庭兔等），與 AI 進行對話並獲得個性化商品推薦。

## 目錄結構

```
carrefour_web/
│
├── carrefour_web/
│   ├── app.py                # Flask 主程式
│   ├── config.ini / config1.ini # API 金鑰設定
│   ├── assets/               # 靜態資源（影片、圖片）
│   ├── static/
│   │   ├── css/style.css     # 前端樣式
│   │   ├── js/main.js        # 前端主 JS
│   │   ├── js/recommendations.js # 商品推薦 JS
│   │   └── images/           # 商品圖片
│   └── templates/
│       └── index.html        # 首頁模板
├── .gitignore
└── config1.ini               # Gemini API 金鑰
```

## 安裝與執行

1. **安裝相依套件**
    ```sh
    pip install flask google-generativeai
    ```

2. **設定 Gemini API 金鑰**
    - 請將你的 Gemini API 金鑰填入 `config1.ini`：
      ```
      [Gemini]
      API_KEY=你的金鑰
      ```

3. **啟動伺服器**
    ```sh
    python carrefour_web/app.py
    ```
    - 預設會在 `http://127.0.0.1:5000/` 啟動。

## 主要功能

- 多角色切換（CaraBunny、CaraMom、CaraDad、Peter）
- Gemini LLM 智能對話
- 根據關鍵字自動推薦商品
- 商品推薦區塊動態更新
- 現代化 UI/UX 設計

## 專案檔案說明

- [`carrefour_web/app.py`](carrefour_web/app.py)：Flask 應用主程式，負責路由、LLM 互動與商品推薦邏輯。
- [`carrefour_web/static/js/main.js`](carrefour_web/static/js/main.js)：前端主 JS，處理聊天、角色切換與推薦商品渲染。
- [`carrefour_web/static/js/recommendations.js`](carrefour_web/static/js/recommendations.js)：商品推薦相關 JS 函式。
- [`carrefour_web/static/css/style.css`](carrefour_web/static/css/style.css)：網站樣式。
- [`carrefour_web/templates/index.html`](carrefour_web/templates/index.html)：首頁模板。
- [`config1.ini`](config1.ini)：Gemini API 金鑰設定檔。

## 注意事項

- 請勿將 API 金鑰上傳至公開倉庫。
- 若需自訂商品資料，可於 [`carrefour_web/app.py`](carrefour_web/app.py) 的 `product_data` 變數中修改。

