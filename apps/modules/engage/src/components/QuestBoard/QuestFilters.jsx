import React from 'react'
import '../../styles/WireframeCard.css'
import { PLATFORM_OPTIONS } from '../../lib/questTypes'

export default function QuestFilters({ platform, setPlatform, status, setStatus }) {
  return (
    <div className="wfCard wfPad">
      <div className="starHdr" style={{ marginBottom: 12 }}>
        <div className="starHdrTitle"><b>* * *</b> FILTERS <b>* * *</b></div>
      </div>

      <div className="wfCol" style={{ gap: 12 }}>
        <label className="wfCol" style={{ gap: 6 }}>
          <span className="wfLabel">Platform</span>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="wfBtn"
            style={{ width: '100%', textAlign: 'left' }}
          >
            <option value="all">All</option>
            {PLATFORM_OPTIONS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
            <option value="custom">custom</option>
          </select>
        </label>

        <label className="wfCol" style={{ gap: 6 }}>
          <span className="wfLabel">Status</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="wfBtn"
            style={{ width: '100%', textAlign: 'left' }}
          >
            <option value="all">All</option>
            <option value="Available">Available</option>
            <option value="Completed">Completed</option>
            <option value="Locked">Locked</option>
          </select>
        </label>
      </div>
    </div>
  )
}
