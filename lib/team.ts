export const TEAM_AVATARS = ["🐻", "🦊", "🐯", "🐼", "🦁", "🐸", "🐙", "🦦", "🦄", "🏋️", "💪", "⚡"] as const;

export type TeamAvatar = (typeof TEAM_AVATARS)[number];
