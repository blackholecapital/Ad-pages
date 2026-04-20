import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.jsx'
import { wagmiConfig } from './lib/wagmi'

const queryClient = new QueryClient()
const MODULE_ID = 'engage'
let trustedBootstrap = null

function getBridgeParams() {
  try {
    const u = new URL(window.location.href)
    return {
      moduleId: u.searchParams.get('moduleId') || MODULE_ID,
      frameId: u.searchParams.get('frameId') || 'frame-unknown',
      parentOrigin: u.searchParams.get('parentOrigin') || window.location.origin,
    }
  } catch {
    return { moduleId: MODULE_ID, frameId: 'frame-unknown', parentOrigin: window.location.origin }
  }
}

function postEnvelope(schema, payload, correlationId) {
  const { moduleId, parentOrigin } = getBridgeParams()
  if (!window.parent || window.parent === window) return
  window.parent.postMessage({
    schema,
    version: 1,
    requestId: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    moduleId,
    audience: 'shell',
    correlationId,
    timestampMs: Date.now(),
    payload,
  }, parentOrigin)
}

function validateBootstrap(payload) {
  const { frameId, parentOrigin } = getBridgeParams()
  if (!payload || payload.issuer !== 'backend') return 'issuer'
  if (payload.frame?.frameId !== frameId) return 'frameId'
  if (payload.frame?.allowedOrigin !== parentOrigin) return 'allowedOrigin'
  if (payload.expiresAtMs <= Date.now()) return 'expired'
  return null
}

function initGatewaySpineV1() {
  postEnvelope('gateway.microfrontend.ModuleReady', {
    moduleVersion: 'engage-2',
    buildId: 'engage-trust',
    supportedContracts: [
      'gateway.microfrontend.ShellBootstrap',
      'gateway.microfrontend.ShellNavigationResult',
      'gateway.microfrontend.ShellConfigEnvelope',
    ],
    requiredCapabilities: ['navigation.request'],
    health: { state: 'ready' },
  })

  postEnvelope('gateway.microfrontend.ModuleCapabilityRequest', {
    capabilityId: 'bootstrap.request',
    scope: 'session',
    requestKind: 'one_shot',
  })

  const { parentOrigin } = getBridgeParams()
  window.addEventListener('message', (evt) => {
    if (evt.origin !== parentOrigin) return
    const data = evt?.data
    if (!data || typeof data !== 'object' || data.version !== 1 || data.audience !== 'module') return

    if (data.schema === 'gateway.microfrontend.ShellBootstrap') {
      const err = validateBootstrap(data.payload)
      if (err) {
        postEnvelope('gateway.microfrontend.ModuleErrorEvent', { severity: 'error', code: 'BOOTSTRAP_INVALID', message: err })
        trustedBootstrap = null
        return
      }
      trustedBootstrap = data.payload
      return
    }

    if (data.schema === 'gateway.microfrontend.ModuleCapabilityGrant' && data.payload?.status === 'denied') {
      postEnvelope('gateway.microfrontend.ModuleErrorEvent', {
        severity: 'warn',
        code: 'CAPABILITY_DENIED',
        message: data.payload?.denyCode || 'capability denied',
      })
    }
  })
}

initGatewaySpineV1()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter basename="/apps/engage">
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>,
)
