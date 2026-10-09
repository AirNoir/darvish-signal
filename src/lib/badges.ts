// 會員徽章判定。
// 創始會員（FOUNDER）由 AccountService 的 is_og_member 欄位決定（永久身份紀念，非付費 VIP）。
import type { AccountUser } from '../api/accountApi';

export function isOgMember(user?: AccountUser | null): boolean {
  return user?.is_og_member === true;
}
