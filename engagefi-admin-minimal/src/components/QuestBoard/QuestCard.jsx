import React from 'react'
import '../../styles/WireframeCard.css'

export default function QuestCard({ mission, status, onOpen }) {
  const locked = status === 'Locked'
  const completed = status === 'Completed'

  return (
    <div className="wfCard wfPad" style={{ opacity: locked ? 0.55 : 1 }}>
      <div className="wfRow" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div className="wfCol" style={{ gap: 6 }}>
          <div className="wfLabel">{mission.platform} · {mission.action} · {mission.type}</div>
          <div className="wfValue" style={{ fontSize: 15 }}>{mission.title}</div>
          <div className="wfRow" style={{ gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
            <span className="wfPill">+{mission.points} pts</span>
            <span className="wfPill">Tier {mission.tier_required}+</span>
            <span className="wfPill">{status}</span>
          </div>
        </div>

        <div className="wfCol" style={{ alignItems: 'flex-end', gap: 10 }}>
          <button className="wfBtn" disabled={locked || completed} onClick={() => onOpen(mission)}>
            {completed ? 'COMPLETED' : locked ? 'LOCKED' : 'OPEN'}
          </button>
        </div>
      </div>
    </div>
  )
}
