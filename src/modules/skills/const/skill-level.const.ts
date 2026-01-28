/**
 * Skill levels for portfolio skills display
 * Used in skill-bento.grid.tsx
 */
export const SKILL_LEVELS = ["Intermediate", "Advanced", "Expert"] as const;

export type SkillLevel = (typeof SKILL_LEVELS)[number];
