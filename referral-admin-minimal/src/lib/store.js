const KEY = 'mktmaker_referral_store_v1'
const nowISO = () => new Date().toISOString()
const safeParse = (s) => { try { return JSON.parse(s) } catch { return null } }

export function loadStore(){
  const raw = localStorage.getItem(KEY)
  const parsed = raw ? safeParse(raw) : null
  if(parsed && parsed.version === 1) return parsed
  const init = { version: 1, referrers: {}, settings:{ baseUrl:'https://example.com/signup', param:'ref' } }
  localStorage.setItem(KEY, JSON.stringify(init))
  return init
}
export function saveStore(store){ localStorage.setItem(KEY, JSON.stringify(store)) }

export function upsertReferrer({ id, label, wallet, email }){
  const store = loadStore()
  if(!store.referrers[id]){
    store.referrers[id] = { id, label: label||id, wallet: wallet||'', email: email||'', createdAt: nowISO(), links:[], referees:[] }
  } else {
    store.referrers[id].label = label || store.referrers[id].label
    store.referrers[id].wallet = wallet ?? store.referrers[id].wallet
    store.referrers[id].email = email ?? store.referrers[id].email
  }
  saveStore(store)
  return store.referrers[id]
}
export function addLinkToReferrer(referrerId, link){
  const store = loadStore()
  const r = store.referrers[referrerId]; if(!r) return
  r.links.unshift({ link, createdAt: nowISO() })
  r.links = r.links.slice(0,20)
  saveStore(store)
}
export function addReferee(referrerId, referee){
  const store = loadStore()
  const r = store.referrers[referrerId]; if(!r) return
  r.referees.unshift({ ...referee, createdAt: nowISO() })
  saveStore(store)
}
export function setSettings(patch){
  const store = loadStore()
  store.settings = { ...store.settings, ...patch }
  saveStore(store); return store.settings
}
export function exportJSON(){ return JSON.stringify(loadStore(), null, 2) }
export function exportCSV(){
  const store = loadStore()
  const rows = []
  rows.push(['referrer_id','referrer_label','referrer_wallet','referrer_email','referrer_created_at','referee_id','referee_label','referee_fee','referee_created_at'].join(','))
  const esc = (v) => {
    const s = String(v ?? '')
    if(/[",\n]/.test(s)) return '"' + s.replaceAll('"','""') + '"'
    return s
  }
  for(const rid of Object.keys(store.referrers)){
    const r = store.referrers[rid]
    const base = [rid, esc(r.label), esc(r.wallet), esc(r.email), r.createdAt]
    if(!r.referees.length) rows.push([...base,'','','',''].join(','))
    else for(const rf of r.referees) rows.push([...base, rf.id, esc(rf.label||''), rf.fee ?? '', rf.createdAt].join(','))
  }
  return rows.join('\n')
}
