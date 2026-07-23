import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import {
  GOOGLE_CLIENT_ID,
  loadGoogleIdentity,
  decodeJwtPayload,
  type GoogleCredentialResponse
} from '../lib/googleAuth';
import { trackEvent } from '../lib/analytics';

export interface AuthUser {
  sub: string;
  email?: string;
  name?: string;
  picture?: string;
}

const STORAGE_KEY = 'kzone:auth-user';

function loadPersistedUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AuthUser>;
    if (typeof parsed.sub !== 'string' || !parsed.sub) return null;
    return {
      sub: parsed.sub,
      email: typeof parsed.email === 'string' ? parsed.email : undefined,
      name: typeof parsed.name === 'string' ? parsed.name : undefined,
      picture: typeof parsed.picture === 'string' ? parsed.picture : undefined
    };
  } catch {
    return null;
  }
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(loadPersistedUser());
  const showLoginModal = ref(false);
  const authError = ref<string | null>(null);

  const isLoggedIn = computed(() => user.value !== null);
  const isConfigured = computed(() => GOOGLE_CLIENT_ID.length > 0);

  const persist = () => {
    try {
      if (user.value) localStorage.setItem(STORAGE_KEY, JSON.stringify(user.value));
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* 無痕模式 / 配額滿時忽略 */
    }
  };

  const handleCredential = (response: GoogleCredentialResponse) => {
    const payload = decodeJwtPayload(response.credential);
    if (!payload?.sub) {
      authError.value = '無法解析 Google 登入資訊，請再試一次';
      return;
    }
    user.value = {
      sub: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture
    };
    authError.value = null;
    persist();
    showLoginModal.value = false;
    trackEvent('login_success', { method: 'google' });
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
    persist();
    window.google?.accounts?.id?.disableAutoSelect();
    trackEvent('logout', { method: 'google' });
  };

  return {
    user,
    isLoggedIn,
    isConfigured,
    showLoginModal,
    authError,
    renderGoogleButton,
    openLogin,
    closeLogin,
    signOut
  };
});
