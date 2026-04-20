import React, { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useAccount } from 'wagmi'
import Navbar from '../components/Navbar.jsx'

import '../styles/PageShell.css'
import '../styles/WireframeCard.css'

import QuestFilters from '../components/QuestBoard/QuestFilters.jsx'
import TierProgress from '../components/QuestBoard/TierProgress.jsx'
import QuestCard from '../components/QuestBoard/QuestCard.jsx'
import CompleteMissionModal from '../components/QuestBoard/CompleteMissionModal.jsx'
import SignatureFuturePanel from '../components/QuestBoard/SignatureFuturePanel.jsx'

import { listMissions } from '../lib/questService'
import { getCompletionSet, upsertUser, completeMission } from '../lib/userProgressService'

export default function QuestsPage() {
  const { address, isConnected } = useAccount()

  const [loading, setLoading] = useState(false)
  const [missions, setMissions] = useState([])
  const [completionSet, setCompletionSet] = useState(new Set())
  const [user, setUser] = useState(null)

  const [platform, setPlatform] = useState('all')
  const [status, setStatus] = useState('all')

  const [activeMission, setActiveMission] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    let ignore = false
    async function load() {
      if (!isConnected || !address) return
      setLoading(true)
      try {
        const u = await upsertUser(address)
        if (ignore) return
        setUser(u)

        const [ms, cs] = await Promise.all([
          listMissions({ includeInactive: false }),
          getCompletionSet(address),
        ])
        if (ignore) return
        setMissions(ms || [])
        setCompletionSet(cs || new Set())
      } catch (e) {
        console.error(e)
        toast.error(e?.message || 'Failed to load quests')
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    load()
    return () => { ignore = true }
  }, [isConnected, address])

  const derived = useMemo(() => {
    const tier = Number(user?.tier || 1)
    const points = Number(user?.points_total || 0)

    const rows = (missions || []).map((m) => {
      const isCompleted = completionSet.has(m.id)
      const isLocked = tier < Number(m.tier_required || 1)
      const st = isCompleted ? 'Completed' : isLocked ? 'Locked' : 'Available'
      return { mission: m, status: st }
    })

    const filtered = rows.filter(({ mission, status: st }) => {
      if (platform !== 'all' && mission.platform !== platform) return false
      if (status !== 'all' && st !== status) return false
      return true
    })

    return { tier, points, rows: filtered }
  }, [missions, completionSet, user, platform, status])

  async function handleOpen(mission) {
    setActiveMission(mission)
    setModalOpen(true)
  }

  async function handleComplete(mission) {
    if (!isConnected || !address) {
      toast.error('Connect wallet first')
      return
    }
    try {
      toast.loading('Recording completion…', { id: 'complete' })
      const res = await completeMission({ walletAddress: address, mission })
      if (res.alreadyCompleted) {
        toast.success('Already completed', { id: 'complete' })
        setCompletionSet(new Set([...completionSet, mission.id]))
        setModalOpen(false)
        return
      }
      toast.success('Mission complete + points added', { id: 'complete' })
      setUser(res.user)
      setCompletionSet(new Set([...completionSet, mission.id]))
      setModalOpen(false)
    } catch (e) {
      console.error(e)
      toast.error(e?.message || 'Failed to complete mission', { id: 'complete' })
    }
  }

  return (
    <>
            <Navbar />

      <div className="page">
        <div className="shell">
          <div className="wfCol">
            <TierProgress pointsTotal={derived.points} tier={derived.tier} />
            <SignatureFuturePanel />
          </div>

                   <div className="wfCol" style={{ gap: 'var(--gap)' }}>
            <div className="questsTopRow">
              <div className="wfCard wfPad">
                <div className="starHdr" style={{ marginBottom: 12 }}>
                  <div className="starHdrTitle"><b>* * *</b> QUESTS <b>* * *</b></div>
                  <div className="wfPill">{isConnected ? 'WALLET CONNECTED' : 'CONNECT TO START'}</div>
                </div>

                {!isConnected && (
                  <div className="wfLabel">
                    Connect your wallet to load missions, track completions, and earn points.
                  </div>
                )}

                {isConnected && loading && (
                  <div className="wfLabel">Loading missions…</div>
                )}

                {isConnected && !loading && derived.rows.length === 0 && (
                  <div className="wfLabel">No missions match your filters (or none are active).</div>
                )}
              </div>

              <QuestFilters platform={platform} setPlatform={setPlatform} status={status} setStatus={setStatus} />
                       </div>

            <div className="questsList">
              {isConnected && derived.rows.map(({ mission, status }) => (
                <QuestCard key={mission.id} mission={mission} status={status} onOpen={handleOpen} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <CompleteMissionModal
        open={modalOpen}
        mission={activeMission}
        onClose={() => setModalOpen(false)}
        onComplete={handleComplete}
      />
    </>
  )
}
