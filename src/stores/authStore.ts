import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import {
  GOOGLE_CLIENT_ID,
  loadGoogleIdentity,
  type GoogleCredentialResponse
} from '../lib/googleAuth';
import { accountApi, type AccountUser } from '../api/accountApi';
import { trackEvent } from '../lib/analytics';

// 使用者身分來自 AccountService（後端驗證後回傳），不再前端 decode。
export type AuthUser = AccountUser;

const USER_KEY = 'kzone:auth-user';
const TOKEN_KEY = 'kzone:auth-token';

function loadPersistedUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AuthUser>;
    if (typeof parsed.email !== 'string' || !parsed.email) return null;
    return parsed as AuthUser;
  } catch {
    return null;
  }
}

export const useAuthStore = defineStore('auth', () => {
  // 樂觀還原：重整頁面時先用 localStorage 的身分，validate() 再跟後端確認。
  const user = ref<AuthUser | null>(loadPersistedUser());
  const token = ref<string | null>(localStorage.getItem(TOKEN_KEY));
  const showLoginModal = ref(false);
  const authError = ref<string | null>(null);

  const isLoggedIn = computed(() => user.value !== null && token.value !== null);
  const isConfigured = computed(() => GOOGLE_CLIENT_ID.length > 0);

  const persist = () => {
    try {
      if (user.value) localStorage.setItem(USER_KEY, JSON.stringify(user.value));
      else localStorage.removeItem(USER_KEY);
      if (token.value) localStorage.setItem(TOKEN_KEY, token.value);
      else localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* 無痕模式 / 配額滿時忽略 */
    }
  };

  // GIS callback：把 Google credential 交給 AccountService 換取後端 JWT。
  const handleCredential = async (response: GoogleCredentialResponse) => {
    try {
      const { token: jwt, user: u } = await accountApi.loginWithGoogle(response.credential);
      token.value = jwt;
      user.value = u;
      authError.value = null;
      persist();
      showLoginModal.value = false;
      trackEvent('login_success', { method: 'google' });
    } catch (e) {
      authError.value =
        (e as { status?: number }).status === 401
          ? 'Google 登入驗證失敗，請再試一次'
          : '登入服務暫時無法連線，請稍後再試';
      trackEvent('login_error', { method: 'google' });
    }
  };

  let initialized = false;

  // 載入 GIS 並把官方「使用 Google 帳戶登入」按鈕渲染到指定容器
  const renderGoogleButton = async (el: HTMLElement) => {
    if (!isConfigured.value) {
      authError.value = '尚未設定 VITE_GOOGLE_CLIENT_ID';
      return;
    }
    try {
      const api = await loadGoogleIdentity();
      if (!initialized) {
        api.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleCredential
        });
        initialized = true;
      }
      api.renderButton(el, {
        theme: 'filled_black',
        size: 'large',
        shape: 'pill',
        text: 'signin_with',
        locale: 'zh_TW',
        width: 280
      });
    } catch (err) {
      authError.value = err instanceof Error ? err.message : 'Google 登入初始化失敗';
    }
  };

  const openLogin = (source?: string) => {
    showLoginModal.value = true;
    trackEvent('login_modal_open', { source: source ?? 'unknown' });
  };

  const closeLogin = () => {
    showLoginModal.value = false;
  };

  const signOut = () => {
    user.value = null;
    token.value = null;
    persist();
    window.google?.accounts?.id?.disableAutoSelect();
    trackEvent('logout', { method: 'google' });
  };

  // 頁面載入時用保存的 JWT 驗證登入是否仍有效；只有 401 才登出，其他錯誤保留樂觀狀態。
  const validate = async () => {
    if (!token.value) return;
    try {
      const { user: u } = await accountApi.fetchMe(token.value);
      user.value = u;
      persist();
    } catch (e) {
      if ((e as { status?: number }).status === 401) {
        user.value = null;
        token.value = null;
        persist();
      }
    }
  };

  return {
    user,
    token,
    isLoggedIn,
    isConfigured,
    showLoginModal,
    authError,
    renderGoogleButton,
    openLogin,
    closeLogin,
    signOut,
    validate
  };
});
