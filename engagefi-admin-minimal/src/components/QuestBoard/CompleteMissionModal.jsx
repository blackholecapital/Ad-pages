import React, { useEffect, useMemo, useState } from 'react'
import '../../styles/WireframeCard.css'

export default function CompleteMissionModal({ open, mission, onClose, onComplete }) {
  const [secondsLeft, setSecondsLeft] = useState(20)
  const needsTimer = mission?.type === 'time-based'

  useEffect(() => {
    if (!open || !needsTimer) return
    setSecondsLeft(20)
    const t = setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1))
    }, 1000)
    return () => clearInterval(t)
  }, [open, needsTimer, mission?.id])

  const canComplete = useMemo(() => {
    if (!mission) return false
    if (mission.type === 'signature') return false
    if (mission.type === 'time-based') return secondsLeft === 0
    return true
  }, [mission, secondsLeft])

  if (!open || !mission) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 20,
        background: 'rgba(0,0,0,.55)',
        display: 'grid',
        placeItems: 'center',
        padding: 14,
      }}
      onMouseDown={onClose}
    >
      <div className="wfCard wfPad" style={{ width: 'min(680px, 96vw)' }} onMouseDown={(e) => e.stopPropagation()}>
        <div className="wfRow" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div className="wfCol" style={{ gap: 6 }}>
            <div className="wfLabel">{mission.platform} · {mission.action} · {mission.type}</div>
            <div className="wfValue" style={{ fontSize: 16 }}>{mission.title}</div>
          </div>
          <button className="wfBtn" onClick={onClose}>CLOSE</button>
        </div>

        <div className="wfHr" style={{ margin: '14px 0' }} />

        {mission.type === 'signature' ? (
          <div className="wfCol" style={{ gap: 10 }}>
            <div className="wfValue">Signature missions are not implemented in this demo.</div>
            <div className="wfLabel">Phase 2 feature placeholder only.</div>
          </div>
        ) : (
          <div className="wfCol" style={{ gap: 12 }}>
            {mission.cta_url ? (
              <a className="wfBtn" href={mission.cta_url} target="_blank" rel="noreferrer">
                OPEN LINK
              </a>
            ) : (
              <div className="wfLabel">No external link provided. Follow the instruction and mark complete.</div>
            )}

            {mission.type === 'time-based' && (
              <div className="wfCard wfPad" style={{ background: 'rgba(0,255,170,.04)' }}>
                <div className="wfLabel">Time-based requirement</div>
                <div className="wfValue" style={{ marginTop: 6 }}>
                  Stay on this modal for <b>20 seconds</b> to unlock completion.
                </div>
                <div className="wfValue" style={{ marginTop: 10, fontSize: 18 }}>
                  {secondsLeft}s
                </div>
              </div>
            )}

            <div className="wfRow" style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
              <div className="wfPill">+{mission.points} pts</div>
              <button className="wfBtn" disabled={!canComplete} onClick={() => onComplete(mission)}>
                {canComplete ? 'MARK COMPLETE' : 'WAIT…'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
