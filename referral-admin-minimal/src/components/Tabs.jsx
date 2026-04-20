import React from 'react'
import '../styles/Tabs.css'
export default function Tabs({ value, onChange }){
  return (
    <div className="mm-tabs">
      <button className={value==='generator'?'mm-tab mm-tabOn':'mm-tab'} onClick={()=>onChange('generator')}>REFERRAL LINK</button>
      <button className={value==='widgets'?'mm-tab mm-tabOn':'mm-tab'} onClick={()=>onChange('widgets')}>WIDGETS x3</button>
      <button className={value==='admin'?'mm-tab mm-tabOn':'mm-tab'} onClick={()=>onChange('admin')}>ADMIN</button>
    </div>
  )
}
