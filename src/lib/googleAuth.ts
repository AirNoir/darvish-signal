// Google Identity Services (GIS) 載入與 ID token 解析
// 純前端 SPA：只用 ID token 取得使用者身分（sub / email / name / picture），
// 不做後端 session；自選股等個人資料以 sub 作為 localStorage 分隔鍵。

export const GOOGLE_CLIENT_ID: string = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '';

const GSI_SRC = 'https://accounts.google.com/gsi/client';

export interface GoogleCredentialResponse {
  credential: string;
}

interface GoogleIdApi {
  initialize(config: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
    auto_select?: boolean;
  }): void;
  renderButton(parent: HTMLElement, options: Record<string, unknown>): void;
  disableAutoSelect(): void;
}

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: GoogleIdApi;
      };
    };
  }
}

let loadPromise: Promise<GoogleIdApi> | null = null;

export function loadGoogleIdentity(): Promise<GoogleIdApi> {
  if (loadPromise) return loadPromise;
  loadPromise = new Promise<GoogleIdApi>((resolve, reject) => {
    const existing = window.google?.accounts?.id;
    if (existing) {
      resolve(existing);
      return;
    }
    const script = document.createElement('script');
    script.src = GSI_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      const api = window.google?.accounts?.id;
      if (api) resolve(api);
      else reject(new Error('Google Identity Services 載入失敗'));
    };
    script.onerror = () => {
      loadPromise = null;
      reject(new Error('無法載入 Google Identity Services script'));
    };
    document.head.appendChild(script);
  });
  return loadPromise;
}

export interface GoogleIdTokenPayload {
  sub: string;
  email?: string;
  name?: string;
  picture?: string;
  exp?: number;
}

// 解析 JWT payload（base64url）。僅用於前端顯示身分，非安全驗證。
export function decodeJwtPayload(token: string): GoogleIdTokenPayload | null {
  try {
    const part = token.split('.')[1];
    if (!part) return null;
    const base64 = part.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(json) as GoogleIdTokenPayload;
  } catch {
    return null;
  }
}
