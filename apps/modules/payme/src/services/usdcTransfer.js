// PayMe USDC transfer service.
//
// Exports are aligned with the downstream payme-admin-minimal checkout
// engine's expected surface:
//   connectWallet, selectNetwork, sendUsdc, wagmiConfig,
//   transferUsdc (legacy), formatUsdc, toUsdcAtomicUnits, fromUsdcAtomicUnits.
//
// Canonical wagmi + send-USDC-on-Base logic lives in the product-shell
// wallet module. See apps/product-shell/src/wallet/README.md.

import { wagmiConfig } from '../lib/wagmi.js'
import {
  USDC_BASE_ADDRESS,
  USDC_DECIMALS,
  CHAIN_IDS,
} from '../../../../product-shell/src/wallet/constants'
import { sendUsdcOnBase } from '../../../../product-shell/src/wallet/sendUsdcOnBase'
import { connect, switchChain, getAccount } from 'wagmi/actions'

export { wagmiConfig }

export function toUsdcAtomicUnits(amount) {
  const n = typeof amount === 'string' ? Number(amount) : amount
  if (!Number.isFinite(n)) return '0'
  return String(Math.round(n * 10 ** USDC_DECIMALS))
}

export function fromUsdcAtomicUnits(amountAtomic) {
  const n = typeof amountAtomic === 'string' ? Number(amountAtomic) : amountAtomic
  if (!Number.isFinite(n)) return 0
  return n / 10 ** USDC_DECIMALS
}

export function formatUsdc(amount) {
  const n = typeof amount === 'string' ? Number(amount) : amount
  if (!Number.isFinite(n)) return '0.00'
  return n.toFixed(2)
}

// Wagmi-backed connect. Picks the first available connector (injected
// preferred). Falls back to whatever is wired into `wagmiConfig`.
export async function connectWallet() {
  const existing = getAccount(wagmiConfig)
  if (existing?.address) {
    return { address: existing.address, chainId: existing.chainId }
  }
  const connector = wagmiConfig.connectors?.[0]
  if (!connector) throw new Error('No wagmi connector available')
  const result = await connect(wagmiConfig, { connector })
  return { address: result.accounts?.[0], chainId: result.chainId }
}

export async function selectNetwork(chainId = CHAIN_IDS.base) {
  return switchChain(wagmiConfig, { chainId })
}

// Send USDC via the canonical EIP-1193 path. `amountRaw` is atomic units
// (string or bigint) to match the existing payme-admin-minimal call sites.
export async function sendUsdc({ to, amountRaw }) {
  const atomic = typeof amountRaw === 'bigint' ? amountRaw : BigInt(amountRaw)
  const amountUsdc = formatUsdc(Number(atomic) / 10 ** USDC_DECIMALS)
  return sendUsdcOnBase({ to, amountUsdc })
}

// Legacy entry point preserved for any older callers that passed a memo.
export async function transferUsdc({ to, amount, memo } = {}) {
  try {
    const txHash = await sendUsdcOnBase({ to: to ?? '', amountUsdc: formatUsdc(amount ?? 0) })
    return { status: 'sent', to: to ?? '', amount: formatUsdc(amount ?? 0), memo: memo ?? '', txHash }
  } catch (error) {
    return { status: 'error', to: to ?? '', amount: formatUsdc(amount ?? 0), memo: memo ?? '', txHash: null, error: String(error?.message || error) }
  }
}

export { USDC_BASE_ADDRESS, USDC_DECIMALS }
