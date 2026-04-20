import { supabase } from './supabaseClient'
import { DEFAULT_MISSIONS } from './questDefaults'

const DEMO_STORAGE_KEY = 'engagefi_demo_missions_v1'

function hashStringToHex(str) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0).toString(16).padStart(8, '0')
}

function normalizeDemoMission(m) {
  const key = `${String(m.platform || '').toLowerCase()}||${String(m.action || '').toLowerCase()}||${String(m.title || '').toLowerCase()}`
  const id = m.id || `demo_${hashStringToHex(key)}`
  return {
    id,
    platform: m.platform,
    action: m.action,
    type: m.type,
    title: m.title,
    cta_url: m.cta_url ?? null,
    points: Number(m.points || 0),
    tier_required: Number(m.tier_required || 1),
    is_active: Boolean(m.is_active),
    sort_order: Number(m.sort_order || 0),
  }
}

function loadDemoMissions() {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(DEMO_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveDemoMissions(list) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(list || []))
}

function ensureDemoInitialized() {
  const existing = loadDemoMissions()
  if (existing.length) return existing
  const seeded = (DEFAULT_MISSIONS || []).map(normalizeDemoMission)
  saveDemoMissions(seeded)
  return seeded
}

function ensureSupabase() {
  if (!supabase) throw new Error('Supabase client not configured. Set env vars and restart dev server.')
  return supabase
}

export async function supabaseHealthCheck() {
  if (!supabase) return { ok: false, error: new Error('Supabase client not configured') }
  const sb = ensureSupabase()
  const { error } = await sb.from('missions').select('id').limit(1)
  return { ok: !error, error }
}

export async function listMissions({ includeInactive = true } = {}) {
  if (!supabase) {
    const seeded = ensureDemoInitialized()
    const filtered = includeInactive ? seeded : seeded.filter((m) => m.is_active)
    return filtered
      .slice()
      .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0))
  }

  const sb = ensureSupabase()
  let q = sb.from('missions').select('*')
  if (!includeInactive) q = q.eq('is_active', true)
  const { data, error } = await q.order('sort_order', { ascending: true }).order('created_at', { ascending: true })
  if (error) throw error
  return data || []
}

export async function createMission(payload) {
  if (!supabase) {
    const list = ensureDemoInitialized()
    const created = normalizeDemoMission({ ...payload, id: `demo_${Date.now()}` })
    const next = [created, ...list]
    saveDemoMissions(next)
    return created
  }

  const sb = ensureSupabase()
  const { data, error } = await sb.from('missions').insert([payload]).select('*').single()
  if (error) throw error
  return data
}

export async function updateMission(id, patch) {
  if (!supabase) {
    const list = ensureDemoInitialized()
    const idx = list.findIndex((m) => String(m.id) === String(id))
    if (idx < 0) throw new Error('Mission not found')
    const updated = { ...list[idx], ...patch, id: list[idx].id }
    const next = list.slice()
    next[idx] = normalizeDemoMission(updated)
    saveDemoMissions(next)
    return next[idx]
  }

  const sb = ensureSupabase()
  const { data, error } = await sb.from('missions').update(patch).eq('id', id).select('*').single()
  if (error) throw error
  return data
}

export async function deleteMission(id) {
  if (!supabase) {
    const list = ensureDemoInitialized()
    const next = list.filter((m) => String(m.id) !== String(id))
    saveDemoMissions(next)
    return
  }

  const sb = ensureSupabase()
  const { error } = await sb.from('missions').delete().eq('id', id)
  if (error) throw error
}

export async function generateDefaultMissions() {
  const existing = await listMissions({ includeInactive: true })
  const key = (m) => `${String(m.platform || '').toLowerCase()}||${String(m.action || '').toLowerCase()}||${String(m.title || '').toLowerCase()}`
  const existingSet = new Set(existing.map(key))

  const toInsert = []
  let skipped = 0
  for (const m of DEFAULT_MISSIONS) {
    if (existingSet.has(key(m))) skipped++
    else toInsert.push(m)
  }

  if (toInsert.length === 0) return { inserted: 0, skipped }

  // Demo mode (no Supabase): merge defaults into localStorage
  if (!supabase) {
    const merged = [...existing]
    for (const m of toInsert) merged.push(normalizeDemoMission(m))
    saveDemoMissions(merged)
    return { inserted: toInsert.length, skipped }
  }

  const sb = ensureSupabase()
  const { data, error } = await sb.from('missions').insert(toInsert).select('id')
  if (error) throw error
  return { inserted: data?.length || 0, skipped }
}

export async function exportMissionsJSON() {
  const missions = await listMissions({ includeInactive: true })
  return missions
}

export async function resetDemoData() {
  if (!supabase && typeof window !== 'undefined') {
    window.localStorage.removeItem(DEMO_STORAGE_KEY)
    return true
  }

  const sb = ensureSupabase()
  // Clear completions first to satisfy FK constraints
  const { error: e1 } = await sb.from('user_mission_completions').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  if (e1) throw e1
  const { error: e2 } = await sb.from('users').update({ points_total: 0, tier: 1 }).neq('wallet_address', '')
  if (e2) throw e2
  return true
}
