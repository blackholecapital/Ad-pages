import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import '../styles/Navbar.css'
import '../styles/WireframeCard.css'

import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { shortenAddr } from '../lib/questTypes'

function ConnectButtonInner() {
  const { address, isConnected } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()

  const isMobile = useMemo(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia && window.matchMedia('(max-width: 900px)').matches
  }, [])

  const primary = useMemo(() => {
    const list = connectors || []
    const injectedConn = list.find((c) => c.id === 'injected')
    const wcConn = list.find((c) => c.id === 'walletConnect')
    // Pattern A: prefer WalletConnect on mobile unless injected exists (Phantom/etc)
    if (isMobile) return injectedConn || wcConn || list[0]
    // Desktop: prefer injected
    return injectedConn || wcConn || list[0]
  }, [connectors, isMobile])

  if (!isConnected) {
    return (
      <button
        className="wfBtn connectBtn"
        onClick={() => {
          if (!primary) return
          connect({ connector: primary })
        }}
        disabled={!primary || isPending}
      >
        {isPending ? 'CONNECTING…' : 'CONNECT WALLET'}
      </button>
    )
  }

  return (
    <button className="wfBtn connectBtn" onClick={() => disconnect()}>
      {shortenAddr(address)} · DISCONNECT
    </button>
  )
}

export default function Navbar({ midText = '* * * INSERT COINS * * *' }) {
  return (
      <div className="navWrap">
        <div className="nav">
          <div className="brand">
            <div className="dot" />
            <div className="brandText">
              <div className="brandTop">EngageFi V-1</div>
              <div className="brandSub">*** .xyz Labs ***</div>
            </div>
          </div>

          <div className="midText">{midText}</div>

                    <div className="actions">
            <Link className="wfBtn connectBtn adminBtn" to="/admin/quests">
              ADMIN
            </Link>
            <ConnectButtonInner />
          </div>
        </div>
      </div>
  )
}
