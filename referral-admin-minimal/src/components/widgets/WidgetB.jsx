import React, { useState } from 'react'
import { loadStore } from '../../lib/store.js'
import './WidgetShared.css'
import '../../styles/Card.css'
import './WidgetB.css'
const makeLink=(b,p,c)=>{try{const u=new URL(b);u.searchParams.set(p,c);return u.toString()}catch{const s=b.includes('?')?'&':'?';return b+s+encodeURIComponent(p)+'='+encodeURIComponent(c)}}
export default function WidgetB(){
  const [out,setOut]=useState('')
  const s=loadStore()
  return (
    <div className="w-wrap">
      <div className="mm-card"><div className="mm-cardInner">
        <div className="wB-hdr">*** REFERRAL WIDGET ***</div>
        <div className="wB-step">1) enter identifier</div>
        <input className="w-input" placeholder="email or wallet address" />
        <div className="wB-step wB-top">2) generate</div>
        <button className="w-btn wB-full" onClick={()=>setOut(makeLink(s.settings.baseUrl,s.settings.param,'wB_'+Math.random().toString(16).slice(2)))}>GENERATE</button>
        <div className="w-out" title={out}>{out||'output…'}</div>
        <div className="w-mini">Style B: card / steps</div>
      </div></div>
    </div>
  )
}
