// 會員徽章判定。
// 創始會員（FOUNDER）由 AccountService 的 is_og_member 欄位決定（永久身份紀念，非付費 VIP）。
import type { AccountUser } from '../api/accountApi';

export function isOgMember(user?: AccountUser | null): boolean {
  return user?.is_og_member === true;
}

// 創始會員招募是否仍開放。後端目前沒有開關或截止日，先由這個常數控制：
// true 時登入引導會放「現在加入即成為創始會員」的誘因（FounderPromo）；
// 招募截止請改成 false，整段誘因就不再出現。
export const FOUNDER_ENROLLMENT_OPEN = true;

// 創始會員歡迎畫面一個帳號只出現一次（以 email 區分）
export const founderWelcomeSeenKey = (email: string) => `kzone:founder-welcome-seen:${email}`;
