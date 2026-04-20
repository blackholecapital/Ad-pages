import { supabase } from './supabaseClient'
import { computeTier } from './questTypes'

const DEMO_USERS_KEY = 'engagefi_demo_users_v1'
const DEMO_COMPLETIONS_KEY = 'engagefi_demo_completions_v1'

function loadJSON(key, fallback) {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return fallback
    const parsed = JSON.parse(raw)
    return parsed ?? fallback
  } catch {
    return fallback
  }
}

function saveJSON(key, value) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(key, JSON.stringify(value))
}

function ensureDemoUser(walletAddress) {
  const users = loadJSON(DEMO_USERS_KEY, {})
  const wa = String(walletAddress || '').toLowerCase()
  if (!users[wa]) {
    users[wa] = { wallet_address: wa, points_total: 0, tier: 1, last_seen: new Date().toISOString() }
    saveJSON(DEMO_USERS_KEY, users)
  }
  return users[wa]
}

function saveDemoUser(user) {
  const users = loadJSON(DEMO_USERS_KEY, {})
  const wa = String(user.wallet_address || '').toLowerCase()
  users[wa] = user
  saveJSON(DEMO_USERS_KEY, users)
  return users[wa]
}

function getDemoCompletionSet(walletAddress) {
  const rows = loadJSON(DEMO_COMPLETIONS_KEY, [])
  const wa = String(walletAddress || '').toLowerCase()
  return new Set(rows.filter((r) => String(r.wallet_address).toLowerCase() === wa).map((r) => String(r.mission_id)))
}

function addDemoCompletion(row) {
  const rows = loadJSON(DEMO_COMPLETIONS_KEY, [])
  rows.unshift(row)
  saveJSON(DEMO_COMPLETIONS_KEY, rows.slice(0, 2000))
}

function ensureSupabase() {
  if (!supabase) throw new Error('Supabase client not configured. Set env vars and restart dev server.')
  return supabase
}

export async function upsertUser(walletAddress) {
  if (!supabase) return saveDemoUser({ ...ensureDemoUser(walletAddress), last_seen: new Date().toISOString() })
  const sb = ensureSupabase()
  const now = new Date().toISOString()
  const { data, error } = await sb
    .from('users')
    .upsert({ wallet_address: walletAddress, last_seen: now }, { onConflict: 'wallet_address' })
    .select('*')
    .single()
  if (error) throw error
  return data
}

export async function getUser(walletAddress) {
  if (!supabase) return ensureDemoUser(walletAddress)
  const sb = ensureSupabase()
  const { data, error } = await sb.from('users').select('*').eq('wallet_address', walletAddress).single()
  if (error) throw error
  return data
}

export async function listUsers() {
  if (!supabase) {
    const users = loadJSON(DEMO_USERS_KEY, {})
    return Object.values(users).sort((a, b) => Number(b.points_total || 0) - Number(a.points_total || 0)).slice(0, 500)
  }
  const sb = ensureSupabase()
  const { data, error } = await sb.from('users').select('*').order('points_total', { ascending: false }).limit(500)
  if (error) throw error
  return data || []
}

export async function listCompletions() {
  if (!supabase) return loadJSON(DEMO_COMPLETIONS_KEY, []).slice(0, 1000)
  const sb = ensureSupabase()
  const { data, error } = await sb
    .from('user_mission_completions')
    .select('id,wallet_address,mission_id,status,completed_at,proof_payload, missions(title,points)')
    .order('completed_at', { ascending: false })
    .limit(1000)
  if (error) throw error
  return data || []
}

export async function getCompletionSet(walletAddress) {
  if (!supabase) return getDemoCompletionSet(walletAddress)
  const sb = ensureSupabase()
  const { data, error } = await sb
    .from('user_mission_completions')
    .select('mission_id')
    .eq('wallet_address', walletAddress)
  if (error) throw error
  const set = new Set((data || []).map((r) => r.mission_id))
  return set
}

export async function completeMission({ walletAddress, mission, proof_payload = null }) {
  if (!supabase) {
    const u = ensureDemoUser(walletAddress)
    const set = getDemoCompletionSet(walletAddress)
    if (set.has(String(mission.id))) return { alreadyCompleted: true }

    addDemoCompletion({
      wallet_address: walletAddress,
      mission_id: String(mission.id),
      status: 'completed',
      completed_at: new Date().toISOString(),
      proof_payload,
    })

    const newPoints = Number(u.points_total || 0) + Number(mission.points || 0)
    const newTier = computeTier(newPoints)
    const updated = saveDemoUser({ ...u, points_total: newPoints, tier: newTier, last_seen: new Date().toISOString() })
    return { alreadyCompleted: false, user: updated }
  }

  const sb = ensureSupabase()


  // Insert completion (unique constraint prevents dupes)
  const { error: cErr } = await sb.from('user_mission_completions').insert([
    {
      wallet_address: walletAddress,
      mission_id: mission.id,
      status: 'completed',
      proof_payload,
    },
  ])
  if (cErr) {
    // If duplicate, treat as no-op
    if (String(cErr.message || '').toLowerCase().includes('duplicate')) {
      return { alreadyCompleted: true }
    }
    throw cErr
  }

  // Update points + tier (demo-grade, last-write-wins)
  const { data: userRow, error: uErr } = await sb.from('users').select('*').eq('wallet_address', walletAddress).single()
  if (uErr) throw uErr

  const newPoints = Number(userRow.points_total || 0) + Number(mission.points || 0)
  const newTier = computeTier(newPoints)

  const { data: updated, error: upErr } = await sb
    .from('users')
    .update({ points_total: newPoints, tier: newTier, last_seen: new Date().toISOString() })
    .eq('wallet_address', walletAddress)
    .select('*')
    .single()
  if (upErr) throw upErr

  return { alreadyCompleted: false, user: updated }
}
