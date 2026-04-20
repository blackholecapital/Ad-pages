import React from 'react'
import '../styles/GameOverBubble.css'

export default function GameOverPanel() {
  return (
    <div className="gameOverBubble">
      <div className="gameOverInner">
        <div className="goTop">
          <div className="goTitle">GAME OVER</div>
          <div className="goBadge">DEMO</div>
        </div>
        <div className="goText">
          Insert coins to continue. Complete missions to level up tiers and climb the leaderboard.
        </div>
      </div>
    </div>
  )
}
