import React from 'react'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { wagmiConfig } from './lib/wagmi.js'
import Shell from './pages/Shell.jsx'

const qc = new QueryClient()

export default function App(){
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={qc}>
        <Shell />
      </QueryClientProvider>
    </WagmiProvider>
  )
}
