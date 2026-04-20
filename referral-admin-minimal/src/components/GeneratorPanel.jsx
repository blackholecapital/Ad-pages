import React, { useEffect, useMemo, useState } from 'react'
import { useAccount } from 'wagmi'
import { addLinkToReferrer, addReferee, loadStore, setSettings, upsertReferrer } from '../lib/store.js'
import { downloadText } from '../lib/download.js'
import '../styles/Card.css'
import '../styles/GeneratorPanel.css'

const mkId = (p) => p + '_' + Math.random().toString(16).slice(2) + '_' + Date.now().toString(16)

function buildLink(baseUrl, param, code){
  try{ const u = new URL(baseUrl); u.searchParams.set(param, code); return u.toString() }
  catch{ const sep = baseUrl.includes('?')?'&':'?'; return baseUrl + sep + encodeURIComponent(param)+'='+encodeURIComponent(code) }
}

export default function GeneratorPanel(){
  const { address, isConnected } = useAccount()
  const [mode, setMode] = useState('email')
  const [email, setEmail] = useState('')
  const [label, setLabel] = useState('')
  const [baseUrl, setBaseUrl] = useState('https://example.com/signup')
  const [param, setParam] = useState('ref')
  const [refLink, setRefLink] = useState('')
  const [refCode, setRefCode] = useState('')
  const [last, setLast] = useState([])

  useEffect(() => {
    const s = loadStore()
    setBaseUrl(s.settings.baseUrl || baseUrl)
    setParam(s.settings.param || param)
  }, [])

  useEffect(() => { if(mode==='wallet' && !isConnected) setMode('email') }, [mode, isConnected])

  const ident = useMemo(() => {
    if(mode==='wallet' && isConnected && address) return { id:'wallet:'+address.toLowerCase(), wallet:address, email:'' }
    if(mode==='email') return { id:'email:'+(email||'').trim().toLowerCase(), wallet:'', email:(email||'').trim() }
    return { id:'', wallet:'', email:'' }
  }, [mode, isConnected, address, email])

  const canGen = (mode==='wallet' ? !!ident.wallet : !!ident.email)

  function generate(){
    if(!canGen) return
    setSettings({ baseUrl, param })
    const code = mkId(mode==='wallet'?'w':'e')
    const link = buildLink(baseUrl, param, code)
    upsertReferrer({ id: ident.id, label: label || (mode==='wallet'?'WALLET REFERRER':'EMAIL REFERRER'), wallet: ident.wallet, email: ident.email })
    addLinkToReferrer(ident.id, link)
    setRefCode(code); setRefLink(link)
    setLast(prev => [{ link, at: new Date().toISOString() }, ...prev].slice(0,5))
  }

  const copy = (t) => navigator.clipboard?.writeText(t)

  function demoAddReferee(){
    if(!ident.id) return
    addReferee(ident.id, { id:'ref_'+Math.random().toString(16).slice(2), label:'NEW SIGNUP', fee:(5).toFixed(2) })
  }

  return (
    <div className="mm-genGrid">
      <div className="mm-card"><div className="mm-cardInner">
        <div className="mm-subhdr"><div className="mm-subhdrLeft"><div className="mm-star">*** REFERRAL LINK GENERATOR ***</div><div className="mm-rule"/></div><div className="mm-label">{mode==='wallet'?'WALLET MODE':'EMAIL MODE'}</div></div>

        <div className="mm-modeRow">
          <button className={mode==='email'?'mm-pill mm-pillOn':'mm-pill'} onClick={()=>setMode('email')}>EMAIL</button>
          <button className={mode==='wallet'?'mm-pill mm-pillOn':'mm-pill'} onClick={()=>setMode('wallet')} disabled={!isConnected}>WALLET</button>
          <div className="mm-hint">{mode==='wallet' && isConnected ? 'Linked to connected wallet.' : 'Wallet mode requires Connect Wallet.'}</div>
        </div>

        <div className="mm-field"><div className="mm-label">Referrer label</div>
          <input className="mm-input" value={label} onChange={e=>setLabel(e.target.value)} placeholder="ex: Partner A / Influencer Name" />
        </div>

        {mode==='email' ? (
          <div className="mm-field"><div className="mm-label">Email identifier</div>
            <input className="mm-input" value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@domain.com" />
          </div>
        ) : (
          <div className="mm-field"><div className="mm-label">Connected wallet</div>
            <div className="mm-walletLine">{address ? `${address.slice(0,10)}…${address.slice(-8)}` : '—'}</div>
          </div>
        )}

        <div className="mm-split">
          <div className="mm-field"><div className="mm-label">Base signup URL</div><input className="mm-input" value={baseUrl} onChange={e=>setBaseUrl(e.target.value)} /></div>
          <div className="mm-field"><div className="mm-label">Query param</div><input className="mm-input" value={param} onChange={e=>setParam(e.target.value)} /></div>
        </div>

        <div className="mm-actionsRow">
          <button className="mm-btn" onClick={generate} disabled={!canGen}>GENERATE LINK</button>
          <button className="mm-btn" onClick={()=>downloadText('referral_link.txt', refLink || 'NO LINK YET\n')}>EXPORT LINK TXT</button>
          <button className="mm-btn" onClick={demoAddReferee} disabled={!ident.id}>DEMO: ADD REFEREE</button>
        </div>

        <div className="mm-outBox">
          <div className="mm-label">Output link</div>
          <div className="mm-outLine">
            <input className="mm-input mm-outInput" value={refLink} readOnly placeholder="Generate to populate..." />
            <button className="mm-btn" onClick={()=>copy(refLink)} disabled={!refLink}>COPY</button>
          </div>
          <div className="mm-mini"><span className="mm-label">Code</span><span className="mm-value">{refCode || '—'}</span></div>
        </div>

        <div className="mm-last">
          <div className="mm-label">Last generated (local)</div>
          <div className="mm-lastList">
            {last.length===0 ? <div className="mm-muted">No links yet.</div> : last.map((x,i)=>(
              <div className="mm-lastItem" key={i}>
                <div className="mm-lastMeta">{new Date(x.at).toLocaleString()}</div>
                <div className="mm-lastLink" title={x.link}>{x.link}</div>
                <button className="mm-miniBtn" onClick={()=>copy(x.link)}>COPY</button>
              </div>
            ))}
          </div>
        </div>
      </div></div>

      <div className="mm-card"><div className="mm-cardInner">
        <div className="mm-subhdr"><div className="mm-subhdrLeft"><div className="mm-star">*** NOTES ***</div><div className="mm-rule"/></div><div className="mm-label">STANDALONE</div></div>
        <div className="mm-muted">This demo stores referrers/referees locally (localStorage). Hook to your DB/API later.</div>
        <div className="mm-muted mm-padTop">Admin tab shows referrers (left) and referees (right), plus JSON/CSV export.</div>
      </div></div>
    </div>
  )
}
