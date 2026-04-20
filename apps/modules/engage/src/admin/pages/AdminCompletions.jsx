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
import { listCompletions } from '../../lib/userProgressService'
import { shortenAddr } from '../../lib/questTypes'

export default function AdminCompletions() {
  const [rows, setRows] = useState([])

  useEffect(() => {
    let ignore = false
    async function load() {
      try {
        const data = await listCompletions()
        if (!ignore) setRows(data)
      } catch (e) {
        console.error(e)
        toast.error(e?.message || 'Failed to load completions')
      }
    }
    load()
    return () => { ignore = true }
  }, [])

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 0.5 }}>Completions (Audit)</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Latest completion rows joined with mission title/points.
      </Typography>

      <Box sx={{ border: '1px solid rgba(0,0,0,.12)', borderRadius: 2, overflow: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Completed At</TableCell>
              <TableCell>Wallet</TableCell>
              <TableCell>Mission</TableCell>
              <TableCell align="right">Points</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id} hover>
                <TableCell>{r.completed_at ? new Date(r.completed_at).toLocaleString() : ''}</TableCell>
                <TableCell>{shortenAddr(r.wallet_address)}</TableCell>
                <TableCell>{r.missions?.title || r.mission_id}</TableCell>
                <TableCell align="right">{r.missions?.points ?? ''}</TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={4}>
                  <Typography variant="body2" color="text.secondary">
                    No completions yet.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>
    </Box>
  )
}
