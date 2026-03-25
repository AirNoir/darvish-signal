# Airnoir AI Toolkit

本專案是一個可被其他專案引用的 AI 開發工具包，提供標準化的 Agents、Commands、Skills、Hooks 與 MCP 整合。

## 可用 Agents

| Agent | 用途 |
|-------|------|
| **SDD 分析師** | 開發前期的需求分析、技術選型、架構設計、風險評估 |
| **Coder** | 高品質程式碼撰寫，自動整合 ContextHub + Context7 版本確認 |
| **Reviewer** | Code Review（正確性、安全性、可維護性、deprecated API 檢查） |
| **Tester** | 撰寫與執行 Unit / Integration / E2E 測試 |

## 可用 Commands

| Command | 說明 |
|---------|------|
| `/analyze` | 呼叫 SDD 分析師進行需求 / 架構分析 |
| `/code` | 呼叫 Coder 執行開發任務 |
| `/review` | 呼叫 Reviewer 進行 Code Review |
| `/test` | 呼叫 Tester 撰寫或執行測試 |
| `/contexthub-update` | 更新 ContextHub 的 Library 文件快取 |

## Library 使用規範

**Coder 在取用任何 Library 前，必須：**
1. 查詢 **ContextHub** — 確認本地版本索引、deprecated API 清單
2. 查詢 **Context7 MCP** — 取得最新官方線上文件
3. 交叉比對後，以專案鎖定版本為準

詳見：`skills/shared/contexthub.md`

## Tech Stack Skills

### Frontend
- `skills/frontend/react.md` — React 18+（Web）
- `skills/frontend/react-native.md` — React Native（Expo）

### Backend（BaaS）
- `skills/backend/firebase.md` — Firebase（Auth / Firestore / Storage / Functions）
- `skills/backend/supabase.md` — Supabase（Auth / PostgreSQL / Storage / Edge Functions）

### 工作流程 Skills
- `skills/workflow/review.md` — Code Review 系統性流程
- `skills/workflow/write-spec.md` — 技術規格書撰寫
- `skills/workflow/unit-test.md` — 單元測試方法論
- `skills/workflow/ui-verify.md` — UI 校正與設計稿比對

## Hooks

| Hook | 觸發時機 | 行為 |
|------|----------|------|
| `skill-loader.sh` | UserPromptSubmit（每次提交 prompt） | 分析 prompt 關鍵字，自動注入相關 Skill 的路徑與閱讀指示 |
| `pre-lib-use.sh` | PreToolUse（Write / Edit 前） | 偵測 import 語句，提示執行 ContextHub + Context7 版本確認 |

## MCP 整合

| MCP | 用途 |
|-----|------|
| Context7 | 即時取得 Library 最新官方文件（必要） |
| GitHub | PR / Issue / 程式碼搜尋（選用） |
| Figma | 設計稿與元件標注（選用） |
| Atlassian | Jira / Confluence（選用） |
