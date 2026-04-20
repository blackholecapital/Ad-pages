export const PLATFORM_OPTIONS = [
  'X',
  'YouTube',
  'Instagram',
  'TikTok',
  'Facebook',
  'Discord',
  'Telegram',
  'Farcaster',
  'Lens',
  'Reviews',
]

export const ACTIONS_BY_PLATFORM = {
  X: ['Follow', 'Like Post', 'Repost', 'Reply', 'Quote Post'],
  YouTube: ['Subscribe', 'Like Video', 'Watch Video'],
  Instagram: ['Follow', 'Like Post', 'Comment'],
  TikTok: ['Follow', 'Like', 'Comment'],
  Facebook: ['Follow', 'Like Page', 'Share'],
  Discord: ['Join Server'],
  Telegram: ['Join Channel'],
  Farcaster: ['Follow', 'Recast'],
  Lens: ['Follow', 'Mirror'],
  Reviews: ['Leave Review'],
}

export const MISSION_TYPES = [
  { value: 'external-link', label: 'external-link' },
  { value: 'time-based', label: 'time-based' },
  { value: 'signature', label: 'signature (future)' },
  { value: 'custom', label: 'custom' },
]

export function shortenAddr(addr) {
  if (!addr) return ''
  const a = String(addr)
  if (a.length <= 12) return a
  return `${a.slice(0, 6)}…${a.slice(-4)}`
}

export const TIER_THRESHOLDS = [
  { tier: 1, minPoints: 0 },
  { tier: 2, minPoints: 75 },
  { tier: 3, minPoints: 150 },
]

export function computeTier(pointsTotal) {
  const pts = Number(pointsTotal || 0)
  if (pts >= 150) return 3
  if (pts >= 75) return 2
  return 1
}

export function nextTierInfo(pointsTotal) {
  const pts = Number(pointsTotal || 0)
  if (pts < 75) return { nextTier: 2, nextAt: 75 }
  if (pts < 150) return { nextTier: 3, nextAt: 150 }
  return { nextTier: null, nextAt: null }
}
