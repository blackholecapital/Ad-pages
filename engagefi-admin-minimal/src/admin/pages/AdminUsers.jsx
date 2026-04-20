import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material'
import { listUsers } from '../../lib/userProgressService'
import { shortenAddr } from '../../lib/questTypes'

export default function AdminUsers() {
  const [rows, setRows] = useState([])

  useEffect(() => {
    let ignore = false
    async function load() {
      try {
        const data = await listUsers()
        if (!ignore) setRows(data)
      } catch (e) {
        console.error(e)
        toast.error(e?.message || 'Failed to load users')
      }
    }
    load()
    return () => { ignore = true }
  }, [])

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 0.5 }}>Users (Leaderboard)</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Basic stats from the `users` table.
      </Typography>

      <Box sx={{ border: '1px solid rgba(0,0,0,.12)', borderRadius: 2, overflow: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Wallet</TableCell>
              <TableCell align="right">Points</TableCell>
              <TableCell align="right">Tier</TableCell>
              <TableCell align="right">Last Seen</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((u) => (
              <TableRow key={u.wallet_address} hover>
                <TableCell>{shortenAddr(u.wallet_address)}</TableCell>
                <TableCell align="right">{u.points_total}</TableCell>
                <TableCell align="right">{u.tier}</TableCell>
                <TableCell align="right">{u.last_seen ? new Date(u.last_seen).toLocaleString() : ''}</TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={4}>
                  <Typography variant="body2" color="text.secondary">No users yet. Connect a wallet and complete a mission.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>
    </Box>
  )
}
