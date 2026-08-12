// AccountService (Go/Gin) — Google SSO 後端。合約見 frontend-login-integration.md。
// 這是唯一知道後端合約的地方；路徑 / 欄位若變，只改這裡。
//   POST /api/auth/google  body { credential }  -> 200 { token, user } / 400,401,500
//   GET  /api/auth/me       Authorization: Bearer -> 200 { user } / 401
// credential = Google ID token（1h，只用來換 token）；token = AccountService 自簽 JWT（7d）。
const AUTH_BASE_URL = import.meta.env.VITE_AUTH_BASE_URL ?? '';

export interface AccountUser {
  email: string;
  name?: string;
  picture?: string | null;
  email_verified?: boolean;
  member_level?: number;
  created_at?: string;
  last_login_at?: string;
}

export interface LoginResponse {
  token: string;
  user: AccountUser;
}

// 帶 HTTP status 的錯誤，讓呼叫端能區分 401（憑證無效）與其他失敗（連線 / 5xx）。
function httpError(status: number, label: string): Error & { status: number } {
  const err = new Error(`HTTP ${status}: ${label}`) as Error & { status: number };
  err.status = status;
  return err;
}

export const accountApi = {
  // 用 Google credential 換 AccountService JWT（新使用者會自動註冊）。
  async loginWithGoogle(credential: string): Promise<LoginResponse> {
    const res = await fetch(`${AUTH_BASE_URL}/api/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential })
    });
    if (!res.ok) throw httpError(res.status, 'auth/google');
    return res.json();
  },

  // 用保存的 JWT 確認登入狀態並取回使用者資料。
  async fetchMe(token: string): Promise<{ user: AccountUser }> {
    const res = await fetch(`${AUTH_BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw httpError(res.status, 'auth/me');
    return res.json();
  }
};

export default accountApi;
