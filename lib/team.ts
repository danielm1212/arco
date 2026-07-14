export const TEAM_AVATARS = ["🐻", "🦊", "🐯", "🐼", "🦁", "🐸", "🐙", "🦦", "🦄", "🏋️", "💪", "⚡"] as const;

export type TeamAvatar = (typeof TEAM_AVATARS)[number];

const INVITE_CODE_LENGTH = 8;

/** Wpisywanie toleruje małe litery, spacje i myślnik, ale przechowujemy czysty kod. */
export function normalizeTeamInviteCode(value: string) {
  return value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .replace(/O/g, "0")
    .replace(/[IL]/g, "1")
    .slice(0, INVITE_CODE_LENGTH);
}

export function formatTeamInviteCode(value: string) {
  const code = normalizeTeamInviteCode(value);
  return code.length <= 4 ? code : `${code.slice(0, 4)}-${code.slice(4)}`;
}
