# @full-stack-app/features

## 0.4.4

### Patch Changes

- 892da88: Add media upload feature
- Updated dependencies [892da88]
  - @full-stack-app/shared@0.3.2
  - @full-stack-app/ui@0.2.6

## 0.4.3

### Patch Changes

- Updated dependencies [3238261]
  - @full-stack-app/shared@0.3.1
  - @full-stack-app/ui@0.2.5

## 0.4.2

### Patch Changes

- 14f19a9: Add login page test
- Updated dependencies [14f19a9]
  - @full-stack-app/ui@0.2.4

## 0.4.1

### Patch Changes

- 60d92ea: Refine ui exports
- 6589c7c: refine @full-stack-app/features exports
- Updated dependencies [60d92ea]
  - @full-stack-app/ui@0.2.3

## 0.4.0

### Minor Changes

- 5aa3930: Add i18n
- 602b812: Add admin page i18n

## 0.3.0

### Minor Changes

- b742424: feat: add LoginPage to features and reuse in frontend

## 0.2.3

### Patch Changes

- 89dc3a9: refactor: 將前後端驗證邏輯 (Validators/Schemas) 統一收容至 @full-stack-app/shared

  - [shared] 新增全域 Zod 驗證規格書 (schemas/)，包含使用者、身分驗證、好友申請與貼文管理，作為全專案單一真相來源。
  - [backend] 徹底移除本地舊版 `validators/`，改由 `validate` 中間件直接吃 shared schemas，實現 End-to-End 強型別防御。
  - [features] 配合全新 shared 型別系統調整 `useAdminUsers` Hook，消除前端型別推導盲區。

- Updated dependencies [89dc3a9]
  - @full-stack-app/shared@0.3.0
  - @full-stack-app/ui@0.2.2

## 0.2.2

### Patch Changes

- Updated dependencies [091aa94]
  - @full-stack-app/shared@0.2.0
  - @full-stack-app/ui@0.2.1

## 0.2.1

### Patch Changes

- Updated dependencies [eeb7b96]
  - @full-stack-app/ui@0.2.0

## 0.2.0

### Minor Changes

- 64c404d: add test and align vitest version
