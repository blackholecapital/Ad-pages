import React, { useState } from 'react'
import { loadStore } from '../../lib/store.js'
import './WidgetShared.css'
const makeLink=(b,p,c)=>{try{const u=new URL(b);u.searchParams.set(p,c);return u.toString()}catch{const s=b.includes('?')?'&':'?';return b+s+encodeURIComponent(p)+'='+encodeURIComponent(c)}}
export default function WidgetA(){
  const [out,setOut]=useState('')
  const s=loadStore()
  return (
    <div className="w-wrap">
      <div className="w-row">
        <input className="w-input" placeholder="email or wallet address" />
        <button className="w-btn" onClick={()=>setOut(makeLink(s.settings.baseUrl,s.settings.param,'wA_'+Math.random().toString(16).slice(2)))}>MAKE REF LINK</button>
      </div>
      <div className="w-out" title={out}>{out||'output…'}</div>
      <div className="w-mini">Style A: compact row widget</div>
    </div>
  )
}
