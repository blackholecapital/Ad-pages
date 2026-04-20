// Canonical shell configuration for desktop-premium-v1 (2560×1440).
// Source of truth: shared/shells/desktop-premium-v1.json
// Both Studio and Receiver import this module — never duplicate these values.

const SHELL_CONFIG = {
  shellId: "desktop-premium-v1",
  stage: { w: 2560, h: 1440 },
  header: { h: 120 },
  leftRail: { w: 300 },
  rightRail: { w: 300 },
  workspace: { x: 300, y: 120, w: 1960, h: 1320 },
  grid: 20,
  wallpaper: {
    fit: "cover" as const,
    position: "center center",
    repeat: "no-repeat",
  },
} as const;

export default SHELL_CONFIG;

export type PremiumShellConfig = typeof SHELL_CONFIG;

export type PremiumStageTile = {
  id: string;
  asset?: string | null;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
};

export type PremiumShellLayout = {
  shellId: "desktop-premium-v1";
  stage: { w: 2560; h: 1440 };
  wallpaper?: string | null;
  tiles: PremiumStageTile[];
};
