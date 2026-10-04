// 會員徽章判定。
// 創始會員（FOUNDER）名單：會員系統正式開放前先由前端名單控管，
// 之後改由 AccountService 的欄位（建議 isFounder 或 memberBadges，見素材包 README）提供，
// 屆時移除這份名單即可。創始會員是永久身份紀念，不是付費 VIP 等級。
const FOUNDING_MEMBER_EMAILS = new Set(['williams710504@gmail.com']);

export function isFoundingMember(email?: string | null): boolean {
  return !!email && FOUNDING_MEMBER_EMAILS.has(email.trim().toLowerCase());
}
