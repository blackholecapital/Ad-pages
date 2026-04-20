import React from 'react'
import '../../styles/WireframeCard.css'
import { nextTierInfo } from '../../lib/questTypes'

export default function TierProgress({ pointsTotal, tier }) {
  const { nextTier, nextAt } = nextTierInfo(pointsTotal)
  const pct = nextAt ? Math.min(100, Math.round((Number(pointsTotal || 0) / nextAt) * 100)) : 100

  return (
    <div className="wfCard wfPad">
      <div className="starHdr" style={{ marginBottom: 12 }}>
        <div className="starHdrTitle"><b>* * *</b> PROGRESS <b>* * *</b></div>
        <div className="wfPill">Tier {tier}</div>
      </div>

      <div className="wfRow" style={{ justifyContent: 'space-between' }}>
        <div className="wfCol" style={{ gap: 6 }}>
          <div className="wfLabel">Points Total</div>
          <div className="wfValue" style={{ fontSize: 18 }}>{pointsTotal}</div>
        </div>

        <div className="wfCol" style={{ gap: 6, alignItems: 'flex-end' }}>
          <div className="wfLabel">Next Tier</div>
          <div className="wfValue">{nextTier ? `Tier ${nextTier} @ ${nextAt} pts` : 'Max Tier'}</div>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <div className="wfHr" />
        <div style={{ marginTop: 10, height: 10, borderRadius: 999, border: '1px solid rgba(0,255,170,.22)', background: 'rgba(0,255,170,.05)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: 'rgba(0,255,170,.35)' }} />
        </div>
        <div className="wfLabel" style={{ marginTop: 8 }}>{pct}% to {nextTier ? `Tier ${nextTier}` : 'max'}</div>
      </div>
    </div>
  )
}
