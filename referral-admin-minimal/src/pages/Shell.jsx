import React, { useMemo, useState } from 'react'
import Navbar from '../components/Navbar.jsx'
import GameOverBubble from '../components/GameOverBubble.jsx'
import Tabs from '../components/Tabs.jsx'
import GeneratorPanel from '../components/GeneratorPanel.jsx'
import WidgetsPanel from '../components/WidgetsPanel.jsx'
import AdminPanel from '../components/AdminPanel.jsx'
import '../styles/PageShell.css'

export default function Shell(){
  const [tab, setTab] = useState('generator')
  const content = useMemo(() => (tab==='generator' ? <GeneratorPanel/> : tab==='widgets' ? <WidgetsPanel/> : <AdminPanel/>), [tab])
  return (
    <div className="mm-shell">
      <div className="mm-wallpaper" aria-hidden="true" />
      <Navbar />
      <div className="mm-main">
        <div className="mm-toprow"><Tabs value={tab} onChange={setTab} /></div>
        <div className="mm-content">{content}</div>
      </div>
      <GameOverBubble />
    </div>
  )
}
