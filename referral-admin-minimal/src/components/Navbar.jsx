import React, { useEffect, useMemo, useState } from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import '../styles/Navbar.css'

export default function Navbar(){
  const { address, isConnected } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const [mobile, setMobile] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 900px)')
    const on = () => setMobile(mq.matches)
    on()
    mq.addEventListener?.('change', on)
    return () => mq.removeEventListener?.('change', on)
  }, [])

  const primary = useMemo(() => {
    const list = connectors ?? []
    const injectedConn = list.find(c => c.type === 'injected')
    const wcConn = list.find(c => c.id === 'walletConnect')
    if(mobile) return injectedConn ?? wcConn ?? list[0]
    return injectedConn ?? wcConn ?? list[0]
  }, [connectors, mobile])

  const onConnect = () => { if(primary) connect({ connector: primary }) }

  return (
    <div className="mm-navWrap">
      <div className="mm-nav">
        <div className="mm-brand">
          <div className="mm-titleRow"><span className="mm-dot" /><div className="mm-title">Referrals V-1</div><span className="mm-dot" /></div>
          <div className="mm-sub">*** .xyz Labs ***</div>
        </div>
        <div className="mm-center">* * * INSERT COINS * * *</div>
        <div className="mm-actions">
          {isConnected ? (
            <button className="mm-connect" onClick={() => disconnect()}>{address?.slice(0,6)}…{address?.slice(-4)} / DISCONNECT</button>
          ) : (
            <button className="mm-connect" onClick={onConnect} disabled={!primary || isPending}>{isPending?'CONNECTING…':'CONNECT WALLET'}</button>
          )}
        </div>
      </div>
    </div>
  )
}
