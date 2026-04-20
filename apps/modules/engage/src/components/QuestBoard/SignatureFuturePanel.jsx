import React from 'react'
import '../../styles/WireframeCard.css'

export default function SignatureFuturePanel() {
  return (
    <div className="wfCard wfPad">
      <div className="starHdr" style={{ marginBottom: 12 }}>
        <div className="starHdrTitle"><b>* * *</b> SIGNATURE VERIFICATION <b>* * *</b></div>
        <div className="wfPill">Phase 2</div>
      </div>

      <div className="wfCol" style={{ gap: 10 }}>
        <label className="wfCol" style={{ gap: 6 }}>
          <span className="wfLabel">Message Template (disabled)</span>
          <input className="wfBtn" disabled value="I confirm I completed this mission: {{missionId}}" />
        </label>
        <label className="wfCol" style={{ gap: 6 }}>
          <span className="wfLabel">Expected Wallet Signer (disabled)</span>
          <input className="wfBtn" disabled value="0x…" />
        </label>
        <label className="wfCol" style={{ gap: 6 }}>
          <span className="wfLabel">Signature (disabled)</span>
          <input className="wfBtn" disabled value="0x…" />
        </label>
        <div className="wfLabel">
          Note: Signature verification is a Phase 2 feature. This demo uses user-confirmed completion.
        </div>
      </div>
    </div>
  )
}
