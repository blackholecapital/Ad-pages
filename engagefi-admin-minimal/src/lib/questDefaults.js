export const DEFAULT_MISSIONS = [
  { platform: 'X', action: 'Follow', type: 'external-link', title: 'Follow EngageFi on X', cta_url: 'https://x.com/', points: 10, tier_required: 1, is_active: true, sort_order: 10 },
  { platform: 'X', action: 'Like Post', type: 'external-link', title: 'Like the pinned post on X', cta_url: 'https://x.com/', points: 10, tier_required: 1, is_active: true, sort_order: 20 },
  { platform: 'X', action: 'Repost', type: 'external-link', title: 'Repost the announcement thread', cta_url: 'https://x.com/', points: 10, tier_required: 1, is_active: true, sort_order: 30 },

  { platform: 'YouTube', action: 'Subscribe', type: 'external-link', title: 'Subscribe on YouTube', cta_url: 'https://www.youtube.com/', points: 15, tier_required: 1, is_active: true, sort_order: 40 },
  { platform: 'YouTube', action: 'Watch Video', type: 'time-based', title: 'Watch the intro video (20s)', cta_url: 'https://www.youtube.com/', points: 20, tier_required: 1, is_active: true, sort_order: 50 },

  { platform: 'Discord', action: 'Join Server', type: 'external-link', title: 'Join the Discord server', cta_url: 'https://discord.com/', points: 15, tier_required: 1, is_active: true, sort_order: 60 },
  { platform: 'Telegram', action: 'Join Channel', type: 'external-link', title: 'Join the Telegram channel', cta_url: 'https://t.me/', points: 15, tier_required: 1, is_active: true, sort_order: 70 },

  { platform: 'Instagram', action: 'Follow', type: 'external-link', title: 'Follow on Instagram', cta_url: 'https://www.instagram.com/', points: 10, tier_required: 2, is_active: true, sort_order: 80 },
  { platform: 'TikTok', action: 'Follow', type: 'external-link', title: 'Follow on TikTok', cta_url: 'https://www.tiktok.com/', points: 10, tier_required: 2, is_active: true, sort_order: 90 },

  { platform: 'custom', action: 'custom', type: 'custom', title: 'Generate a Referral Link', cta_url: 'https://example.com/referral', points: 25, tier_required: 2, is_active: true, sort_order: 100 },
  { platform: 'custom', action: 'custom', type: 'custom', title: 'Invite 1 Friend (placeholder)', cta_url: null, points: 25, tier_required: 2, is_active: true, sort_order: 110 },

  { platform: 'Farcaster', action: 'Follow', type: 'external-link', title: 'Follow on Farcaster', cta_url: 'https://warpcast.com/', points: 15, tier_required: 3, is_active: true, sort_order: 120 },
]
