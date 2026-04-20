import React, { useState } from 'react'
import { loadStore } from '../../lib/store.js'
import './WidgetShared.css'
import './WidgetC.css'
const makeLink=(b,p,c)=>{try{const u=new URL(b);u.searchParams.set(p,c);return u.toString()}catch{const s=b.includes('?')?'&':'?';return b+s+encodeURIComponent(p)+'='+encodeURIComponent(c)}}
export default function WidgetC(){
  const [out,setOut]=useState('')
  const s=loadStore()
  return (
    <div className="w-wrap wC">
      <button className="wC-btn" onClick={()=>setOut(makeLink(s.settings.baseUrl,s.settings.param,'wC_'+Math.random().toString(16).slice(2)))}>REF LINK</button>
      <div className="wC-out" title={out}>{out||'output…'}</div>
    </div>
  )
}
