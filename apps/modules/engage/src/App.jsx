import React, { useEffect } from 'react'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import QuestsPage from './pages/QuestsPage.jsx'
import { EMBEDDED } from './lib/embedded.js'

import AdminLayout from './admin/AdminLayout.jsx'
import AdminQuests from './admin/pages/AdminQuests.jsx'
import AdminUsers from './admin/pages/AdminUsers.jsx'
import AdminCompletions from './admin/pages/AdminCompletions.jsx'

import './styles/Scanlines.css'

const TAB_PATHS = {
  quests: '/quests',
  'admin-quests': '/admin/quests',
  'admin-users': '/admin/users',
  'admin-completions': '/admin/completions',
}


function EmbedController() {
  const navigate = useNavigate()

  useEffect(() => {
    if (EMBEDDED) document.documentElement.classList.add('engage-embedded')
    try {
      const tab = new URLSearchParams(window.location.search).get('tab')
      if (tab && TAB_PATHS[tab]) navigate(TAB_PATHS[tab], { replace: true })
    } catch {}
  }, []) // eslint-disable-line

  useEffect(() => {
    function onMessage(e) {
      if (e.data?.type === 'ENGAGE_NAVIGATE' && TAB_PATHS[e.data.tab]) {
        navigate(TAB_PATHS[e.data.tab])
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [navigate])

  return null
}

export default function App() {
  return (
    <>
      <EmbedController />
      <Routes>
        <Route path="/" element={<Navigate to="/quests" replace />} />

        <Route path="/quests" element={<QuestsPage />} />

        <Route path="/admin" element={<Navigate to="/admin/quests" replace />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="quests" element={<AdminQuests />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="completions" element={<AdminCompletions />} />
        </Route>

        <Route path="*" element={<Navigate to="/quests" replace />} />
      </Routes>

      <Toaster position="top-right" toastOptions={{ duration: 2500 }} />
      {!EMBEDDED && <div className="scanlines" aria-hidden="true" />}
    </>
  )
}
