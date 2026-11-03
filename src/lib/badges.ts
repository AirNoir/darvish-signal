// 會員徽章判定。
// 創始會員（FOUNDER）由 AccountService 的 is_og_member 欄位決定（永久身份紀念，非付費 VIP）。
import type { AccountUser } from '../api/accountApi';

export function isOgMember(user?: AccountUser | null): boolean {
  return user?.is_og_member === true;
}

// 創始會員招募截止時間：開放至 2026/11/03 22:00（台北時間），之後登入引導不再出現
// 「現在加入即成為創始會員」（FounderPromo）。介面依時間自動切換，到期不需要改版重佈。
// 已拿到徽章的會員不受影響（徽章看 is_og_member）。
// VITE_FOUNDER_ENROLLMENT_DEADLINE 可覆寫截止時間（ISO 字串），測試機用來提前預覽截止後畫面。
const DEFAULT_FOUNDER_DEADLINE = '2026-11-03T22:00:00+08:00';
export const FOUNDER_ENROLLMENT_DEADLINE = new Date(
  import.meta.env.VITE_FOUNDER_ENROLLMENT_DEADLINE || DEFAULT_FOUNDER_DEADLINE,
);
export const isFounderEnrollmentOpen = () => Date.now() < FOUNDER_ENROLLMENT_DEADLINE.getTime();

// 創始會員歡迎畫面一個帳號只出現一次（以 email 區分）
export const founderWelcomeSeenKey = (email: string) => `kzone:founder-welcome-seen:${email}`;
