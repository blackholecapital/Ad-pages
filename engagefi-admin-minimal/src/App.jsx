import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import QuestsPage from './pages/QuestsPage.jsx'

import AdminLayout from './admin/AdminLayout.jsx'
import AdminQuests from './admin/pages/AdminQuests.jsx'
import AdminUsers from './admin/pages/AdminUsers.jsx'
import AdminCompletions from './admin/pages/AdminCompletions.jsx'

import './styles/Scanlines.css'

export default function App() {
  return (
    <>
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
      <div className="scanlines" aria-hidden="true" />
    </>
  )
}
