---
'@full-stack-app/shared': minor
'@full-stack-app/features': patch
'backend': patch
---

refactor: 將前後端驗證邏輯 (Validators/Schemas) 統一收容至 @full-stack-app/shared

- [shared] 新增全域 Zod 驗證規格書 (schemas/)，包含使用者、身分驗證、好友申請與貼文管理，作為全專案單一真相來源。
- [backend] 徹底移除本地舊版 `validators/`，改由 `validate` 中間件直接吃 shared schemas，實現 End-to-End 強型別防御。
- [features] 配合全新 shared 型別系統調整 `useAdminUsers` Hook，消除前端型別推導盲區。
