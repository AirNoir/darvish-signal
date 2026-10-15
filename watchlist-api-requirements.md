# 自選股（Watchlist）前端邏輯 & 後端 API 需求

> 給後端參考，用來設計「自選股跨裝置同步」的 API。
> 目前自選股**只存在瀏覽器 localStorage**（依使用者 email 分隔），換裝置 / 換瀏覽器就不同步。
> 目標：改由後端保存，登入後跨裝置一致。前端合約集中在 `src/stores/watchlistStore.ts` 與 `src/api/accountApi.ts`。

---

## 1. 身分與認證（沿用現有 AccountService）

自選股 API 應**沿用登入那套認證**，不要另做一套：

- 認證方式：`Authorization: Bearer <token>`，`token` = AccountService 自簽 JWT（有效 7 天）。
- 使用者識別：前端目前用 **email** 當 key（`auth.user.email`）。後端請以 **JWT 內的使用者身分（sub / email）** 為準，前端不會、也不該傳 user id。
- 現有相關 endpoint（同一個後端服務，`VITE_AUTH_BASE_URL`）：
  - `POST /api/auth/google`　body `{ credential }` → `{ token, user }`
  - `GET  /api/auth/me`　　　`Authorization: Bearer` → `{ user }`（401 = 憑證失效）
- 錯誤處理慣例：前端靠 **HTTP status** 區分（401 = 憑證無效要登出；其他 = 連線／5xx，保留樂觀狀態）。新 API 請維持「用 status code 表達結果」。
- 未登入（guest）也能用自選股（存 localStorage guest 區）；**API 只服務已登入使用者**，guest 資料的處理見 §6 遷移。

---

## 2. 資料模型（目前前端結構）

```ts
interface WatchlistGroup {
  id: string;        // 群組 id（前端目前用 crypto.randomUUID() 產生）
  name: string;      // 群組名稱，如「自選股 1」
  symbols: string[]; // 台股代號字串，如 "2330"；順序有意義（顯示依此序）
}

interface PersistedWatchlist {
  activeGroupId: string;      // 目前選中的群組 id
  groups: WatchlistGroup[];   // 使用者的所有群組
}
```

### 重要規則 / 約束（前端目前行為，後端建議一致並在伺服器端也把關）

| 規則 | 值 / 說明 |
|---|---|
| 每人群組數上限 | `MAX_GROUPS = 5` |
| 每群組個股上限 | `MAX_SYMBOLS_PER_GROUP = 50` |
| symbol 型別 | **不透明字串**（台股代號，如 `2330`；大盤為特殊值 `TAIEX`）。自選股**只存代號**，股票名稱由前端另外向行情 API 解析，後端不需存名稱 |
| 同群組去重 | 同一 symbol 在**同一群組內不重複**；不同群組可各自擁有同一 symbol |
| 群組順序 / symbol 順序 | **陣列順序即顯示順序**，需保留（未來可能加拖曳排序） |
| 至少一個群組 | 永遠至少保留 1 個群組；刪到 0 個時前端會自動建一個預設群組 |
| 預設群組命名 | 新群組未命名時給 `自選股 {N}`（N = 目前群組數 + 1） |
| activeGroupId | 必須指向存在的群組；不存在時 fallback 到第一個群組 |

---

## 3. 前端目前的操作邏輯（store methods）

以下是 `watchlistStore.ts` 對外的操作，後端 API 需能支撐這些行為（不必一一對應成 endpoint，見 §5）：

| 操作 | 行為 | 規則 |
|---|---|---|
| `load()` | 讀取該使用者的自選股 | 目前從 localStorage；**未來改成登入後打 API 拉取** |
| `persist()` | 保存整份自選股 | 目前寫 localStorage；對 `groups` / `activeGroupId` 做 **deep watch，任何變更就整份存**（見 §5 同步模型） |
| `setActiveGroup(id)` | 切換目前群組 | id 需存在才切 |
| `addGroup(name?)` | 新增群組 | 超過 `MAX_GROUPS` 回 null（不新增）；未給名字用 `自選股 N` |
| `renameGroup(id, name)` | 改名 | name trim 後不可空 |
| `removeGroup(id)` | 刪群組 | 刪光會自動補一個預設群組；若刪到 active 群組會 fallback |
| `addSymbol(groupId, symbol)` | 加個股到群組 | 已存在 → 不加；超過 `MAX_SYMBOLS_PER_GROUP` → 不加 |
| `removeSymbol(groupId, symbol)` | 從群組移除個股 | — |
| `toggleSymbol(groupId, symbol)` | 有就移除、沒有就加入 | 星號按鈕 / 加入 modal 用 |
| `isInGroup(symbol, groupId?)` | 查個股是否在群組內 | 預設查 active 群組 |
| `groupsContaining(symbol)` | 回傳含此 symbol 的群組 id 清單 | 個股頁星號 popover 用（顯示已加入哪些群組） |

### 登入 / 登出切換
- 換帳號（`auth.user.email` 變動）時，前端會**重新 load** 該帳號自己的自選股。
- 登出後回到 guest 資料。

---

## 4. 前端對 API 的核心需求

1. **登入後拉取**：登入成功（或重整頁面 `validate()` 後）能取回該使用者完整自選股（groups + activeGroupId）。
2. **變更後保存**：使用者增刪群組 / 個股 / 改名 / 切換 active 時，能把變更持久化到後端。
3. **跨裝置一致**：不同裝置登入同一帳號看到同一份資料。
4. **認證一致**：全部走現有 Bearer JWT，401 即視為需重新登入。

---

## 5. 建議 API 設計（兩種模型，後端可擇一或混用）

> 前端目前是「**整份存**」的心智模型（deep watch → 全量寫入），所以 **模型 A 最貼近現況、整合成本最低**；若後端在意流量 / 併發，可採模型 B。

### 模型 A：整份文件 GET / PUT（推薦，優先）

```
GET  /api/watchlist            Authorization: Bearer
     → 200 { activeGroupId, groups }        // 首次無資料回預設或空，見下
     → 401

PUT  /api/watchlist            Authorization: Bearer
     body { activeGroupId, groups }         // 前端送整份覆蓋
     → 200 { activeGroupId, groups }        // 回存後的結果（伺服器可回正規化後版本）
     → 400 （超過上限 / 格式錯）/ 401
```

- 語意：**last-write-wins 全量覆蓋**。簡單、與現有 deep-watch 保存邏輯天然吻合。
- 首次無資料：建議 `GET` 回 `200 { activeGroupId: null, groups: [] }`，由前端建預設群組後 `PUT`；或後端直接回一個預設群組。請告知採哪種。
- 上限把關：`PUT` 時伺服器端也應驗 `MAX_GROUPS` / `MAX_SYMBOLS_PER_GROUP` 與同群組去重，超過回 400。

### 模型 B：細粒度 REST（流量 / 併發較佳，整合成本較高）

```
GET    /api/watchlist/groups                         → { groups, activeGroupId }
POST   /api/watchlist/groups        { name }         → { group }         // 201；超過上限 409/400
PATCH  /api/watchlist/groups/{id}   { name }         → { group }
DELETE /api/watchlist/groups/{id}                    → 204
PUT    /api/watchlist/active        { activeGroupId } → 200
POST   /api/watchlist/groups/{id}/symbols   { symbol } → 200 / 409(已存在) / 400(超上限)
DELETE /api/watchlist/groups/{id}/symbols/{symbol}   → 204
（可選）PUT /api/watchlist/groups/{id}/symbols { symbols[] } // 整組重排 / 覆蓋，供拖曳排序
```

- 若走 B，前端需改寫 store 的各 action 為對應 API 呼叫（可接受，但工程量比 A 大）。

### id 由誰產生？（請後端定案）
- 目前群組 id 是**前端 UUID**。若走模型 B 用 `POST` 建群組，建議改由**後端產生 id** 並回傳。走模型 A 則可維持前端 id、或後端在 `PUT` 時正規化。請告知偏好。

---

## 6. Guest 資料遷移 / 合併（登入當下）

使用者可能未登入就先加了自選股（存在 localStorage `kzone:watchlist:guest`）。登入後的處理請後端定策略，前端配合：

- **選項 1（推薦，簡單）**：登入後以「**伺服器資料為主**」。若伺服器該帳號還沒有任何自選股，則把 guest 的本地資料 `PUT` 上去當初始值；若已有，直接用伺服器的（本地 guest 丟棄或保留在 guest 區）。
- **選項 2（合併）**：把 guest 群組併進伺服器資料（需處理群組名衝突、上限）——較複雜，非必要不做。

請後端告知採哪種，前端據此實作登入後的 sync 流程。

---

## 7. 邊界情況 / 注意事項

- **symbol 當不透明字串**：後端不需驗證是否為有效台股代號（前端只從搜尋結果加入）；但同群組**去重**與**上限**建議伺服器端也把關。
- **順序保留**：`groups` 與 `symbols` 皆為有序陣列，後端儲存與回傳都要保序。
- **至少一群組 / active fallback**：這兩條前端已處理；模型 A 下後端只要如實存回即可，不必額外邏輯；模型 B 下 `DELETE` 最後一個群組的行為請與前端對齊（前端會再建一個預設群組）。
- **401 語意**：token 失效時 API 回 401，前端會清除登入狀態並要求重新登入。
- **CORS / base URL**：與登入 API 同源（`VITE_AUTH_BASE_URL`），前端各環境網域需在後端 CORS 允許清單內（同登入那份設定）。
- **並發**：模型 A 全量覆蓋在多分頁同時操作時可能互蓋；若在意可加 `updated_at` / version 做樂觀鎖（回 409 讓前端重拉），非首版必要。

---

## 8. 附錄：現有型別與範例 JSON

### TypeScript（前端現況，來源 `watchlistStore.ts`）
```ts
export const MAX_GROUPS = 5;
export const MAX_SYMBOLS_PER_GROUP = 50;

export interface WatchlistGroup {
  id: string;
  name: string;
  symbols: string[];
}
```

### 範例 payload（模型 A 的 GET / PUT body）
```json
{
  "activeGroupId": "b3f1c2a4-...",
  "groups": [
    {
      "id": "b3f1c2a4-...",
      "name": "自選股 1",
      "symbols": ["2330", "2317", "0050"]
    },
    {
      "id": "9de2...",
      "name": "當沖觀察",
      "symbols": ["3661", "6669"]
    }
  ]
}
```

### 使用者物件（登入回傳，供對照 identity 欄位）
```ts
interface AccountUser {
  email: string;          // 前端目前用來分隔自選股的 key
  name?: string;
  picture?: string | null;
  email_verified?: boolean;
  member_level?: number;
  created_at?: string;
  last_login_at?: string;
}
```

---

## 需要後端回覆確認的點
1. 採**模型 A（整份 PUT）**還是**模型 B（細粒度 REST）**？（前端傾向 A）
2. 群組 **id 由前端還是後端產生**？
3. **首次無資料**時 `GET /api/watchlist` 回空陣列還是預設群組？
4. **Guest 遷移**採「伺服器為主」還是「合併」？
5. 是否需要 **version / updated_at 樂觀鎖**（多裝置併發）？
