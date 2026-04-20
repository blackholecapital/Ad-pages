import React, { useEffect, useMemo, useState } from 'react'
import { exportCSV, exportJSON, loadStore } from '../lib/store.js'
import { downloadText } from '../lib/download.js'
import '../styles/Card.css'
import '../styles/AdminPanel.css'

const sumFees = (refs) => (refs||[]).reduce((a,r)=>a+Number(r.fee||0),0)

export default function AdminPanel(){
  const [store, setStore] = useState(()=>loadStore())
  const [selected, setSelected] = useState('')

  useEffect(() => {
    const tick = () => setStore(loadStore())
    const t = setInterval(tick, 700)
    return () => clearInterval(t)
  }, [])

  const referrers = useMemo(() => {
    const list = Object.values(store.referrers||{})
    list.sort((a,b)=>(b.referees?.length||0)-(a.referees?.length||0))
    return list
  }, [store])

  useEffect(() => { if(!selected && referrers.length) setSelected(referrers[0].id) }, [selected, referrers])

  const current = store.referrers?.[selected] || null

  return (
    <div className="mm-adminGrid">
      <div className="mm-card"><div className="mm-cardInner">
        <div className="mm-subhdr"><div className="mm-subhdrLeft"><div className="mm-star">*** REFERRERS (MASTER) ***</div><div className="mm-rule"/></div><div className="mm-label">{referrers.length} TOTAL</div></div>
        <div className="mm-adminBtns">
          <button className="mm-btn" onClick={()=>downloadText('mktmaker_referrals.json', exportJSON(), 'application/json')}>EXPORT JSON</button>
          <button className="mm-btn" onClick={()=>downloadText('mktmaker_referrals.csv', exportCSV(), 'text/csv')}>EXPORT CSV</button>
        </div>
        <div className="mm-refList">
          {referrers.length===0 ? <div className="mm-muted">No referrers yet. Generate a link in the first tab.</div> : referrers.map(r=>{
            const on = r.id===selected
            return (
              <button key={r.id} className={on?'mm-refItem mm-refItemOn':'mm-refItem'} onClick={()=>setSelected(r.id)}>
                <div className="mm-refTop"><div className="mm-refLabel">{r.label||r.id}</div><div className="mm-refMetric">{(r.referees?.length||0)} refs</div></div>
                <div className="mm-refMeta"><span className="mm-miniTag">{r.wallet?'WALLET':'EMAIL'}</span><span className="mm-miniMono">{r.wallet||r.email||r.id}</span></div>
                <div className="mm-refFees"><span className="mm-label">fees</span><span className="mm-value">{sumFees(r.referees).toFixed(2)}</span></div>
              </button>
            )
          })}
        </div>
      </div></div>

      <div className="mm-card"><div className="mm-cardInner">
        <div className="mm-subhdr"><div className="mm-subhdrLeft"><div className="mm-star">*** REFEREES (OUTPUT) ***</div><div className="mm-rule"/></div><div className="mm-label">{current?current.id:'—'}</div></div>
        {!current ? <div className="mm-muted">Select a referrer to view referees.</div> : (
          <div className="mm-outPane">
            <div className="mm-outHeader">
              <div><div className="mm-label">Referrer</div><div className="mm-value">{current.label}</div></div>
              <div className="mm-outStats">
                <div className="mm-stat"><div className="mm-label">Referees</div><div className="mm-value">{(current.referees||[]).length}</div></div>
                <div className="mm-stat"><div className="mm-label">Fees</div><div className="mm-value">{sumFees(current.referees).toFixed(2)}</div></div>
              </div>
            </div>
            <div className="mm-refereeTable">
              <div className="mm-rtHead"><div>ID</div><div>LABEL</div><div>FEE</div><div>CREATED</div></div>
              {(current.referees||[]).length===0 ? <div className="mm-muted mm-padTop">No referees yet. Use DEMO: ADD REFEREE in tab 1.</div> :
                current.referees.map(x=>(
                  <div className="mm-rtRow" key={x.id}>
                    <div className="mm-miniMono">{x.id}</div>
                    <div className="mm-miniMono">{x.label||''}</div>
                    <div className="mm-miniMono">{Number(x.fee||0).toFixed(2)}</div>
                    <div className="mm-miniMono">{new Date(x.createdAt).toLocaleString()}</div>
                  </div>
                ))
              }
            </div>
          </div>
        )}
      </div></div>
    </div>
  )
}
