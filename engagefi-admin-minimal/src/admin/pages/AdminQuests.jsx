import React, { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Switch,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Stack,
} from '@mui/material'

import { ACTIONS_BY_PLATFORM, MISSION_TYPES, PLATFORM_OPTIONS } from '../../lib/questTypes'
import { createMission, deleteMission, exportMissionsJSON, generateDefaultMissions, listMissions, resetDemoData, updateMission } from '../../lib/questService'

const emptyDraft = {
  platform: 'X',
  action: 'Follow',
  type: 'external-link',
  title: '',
  cta_url: '',
  points: 10,
  tier_required: 1,
  is_active: true,
  sort_order: 0,
}

function downloadJSON(filename, obj) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export default function AdminQuests() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)

  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [draft, setDraft] = useState(emptyDraft)

  const actionsForPlatform = useMemo(() => {
    return ACTIONS_BY_PLATFORM[draft.platform] || ['custom']
  }, [draft.platform])

  useEffect(() => {
    if (!actionsForPlatform.includes(draft.action)) {
      setDraft((d) => ({ ...d, action: actionsForPlatform[0] || 'custom' }))
    }
  }, [actionsForPlatform])

  async function refresh() {
    setLoading(true)
    try {
      const ms = await listMissions({ includeInactive: true })
      setRows(ms)
    } catch (e) {
      console.error(e)
      toast.error(e?.message || 'Failed to load missions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refresh() }, [])

  function openCreate() {
    setEditingId(null)
    setDraft(emptyDraft)
    setOpen(true)
  }

  function openEdit(m) {
    setEditingId(m.id)
    setDraft({
      platform: m.platform,
      action: m.action,
      type: m.type,
      title: m.title,
      cta_url: m.cta_url || '',
      points: m.points,
      tier_required: m.tier_required,
      is_active: m.is_active,
      sort_order: m.sort_order,
    })
    setOpen(true)
  }

  async function save() {
    try {
      toast.loading('Saving…', { id: 'save' })
      const payload = {
        platform: draft.platform,
        action: draft.action,
        type: draft.type,
        title: draft.title,
        cta_url: draft.cta_url ? draft.cta_url : null,
        points: Number(draft.points || 0),
        tier_required: Number(draft.tier_required || 1),
        is_active: Boolean(draft.is_active),
        sort_order: Number(draft.sort_order || 0),
      }
      if (!payload.title) throw new Error('Title is required')

      if (editingId) await updateMission(editingId, payload)
      else await createMission(payload)

      toast.success('Saved', { id: 'save' })
      setOpen(false)
      await refresh()
    } catch (e) {
      console.error(e)
      toast.error(e?.message || 'Failed to save', { id: 'save' })
    }
  }

  async function remove(id) {
    if (!confirm('Delete this mission?')) return
    try {
      toast.loading('Deleting…', { id: 'del' })
      await deleteMission(id)
      toast.success('Deleted', { id: 'del' })
      await refresh()
    } catch (e) {
      console.error(e)
      toast.error(e?.message || 'Failed to delete', { id: 'del' })
    }
  }

  async function handleGenerate() {
    try {
      toast.loading('Generating defaults…', { id: 'gen' })
      const res = await generateDefaultMissions()
      toast.success(`Inserted ${res.inserted}, skipped ${res.skipped}`, { id: 'gen' })
      await refresh()
    } catch (e) {
      console.error(e)
      toast.error(e?.message || 'Failed to generate defaults', { id: 'gen' })
    }
  }

  async function handleExport() {
    try {
      toast.loading('Exporting…', { id: 'exp' })
      const ms = await exportMissionsJSON()
      downloadJSON('missions-export.json', ms)
      toast.success('Downloaded missions-export.json', { id: 'exp' })
    } catch (e) {
      console.error(e)
      toast.error(e?.message || 'Failed to export', { id: 'exp' })
    }
  }

  async function handleReset() {
    if (!confirm('Reset demo data? This clears completions and resets user points/tier.')) return
    try {
      toast.loading('Resetting…', { id: 'rst' })
      await resetDemoData()
      toast.success('Demo data reset', { id: 'rst' })
    } catch (e) {
      console.error(e)
      toast.error(e?.message || 'Failed to reset', { id: 'rst' })
    }
  }

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 2, alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h5">Missions</Typography>
          <Typography variant="body2" color="text.secondary">
            CRUD missions + default generator (demo mode).
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
          <Button variant="outlined" onClick={handleExport}>Export Missions JSON</Button>
          <Button variant="outlined" color="warning" onClick={handleReset}>Reset Demo Data</Button>
          <Button variant="outlined" onClick={handleGenerate}>Generate Default Missions</Button>
          <Button variant="contained" onClick={openCreate}>Create Mission</Button>
        </Stack>
      </Stack>

      <Box sx={{ border: '1px solid rgba(0,0,0,.12)', borderRadius: 2, overflow: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Platform</TableCell>
              <TableCell>Action</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Title</TableCell>
              <TableCell align="right">Points</TableCell>
              <TableCell align="right">Tier</TableCell>
              <TableCell align="right">Active</TableCell>
              <TableCell align="right">Sort</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((m) => (
              <TableRow key={m.id} hover>
                <TableCell>{m.platform}</TableCell>
                <TableCell>{m.action}</TableCell>
                <TableCell>{m.type}</TableCell>
                <TableCell style={{ minWidth: 280 }}>{m.title}</TableCell>
                <TableCell align="right">{m.points}</TableCell>
                <TableCell align="right">{m.tier_required}</TableCell>
                <TableCell align="right">{m.is_active ? 'yes' : 'no'}</TableCell>
                <TableCell align="right">{m.sort_order}</TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button size="small" variant="outlined" onClick={() => openEdit(m)}>Edit</Button>
                    <Button size="small" color="error" variant="outlined" onClick={() => remove(m.id)}>Delete</Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
            {!loading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={9}>
                  <Typography variant="body2" color="text.secondary">
                    No missions yet. Click “Generate Default Missions”.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>

      <Box sx={{ mt: 3, p: 2, border: '1px dashed rgba(0,0,0,.2)', borderRadius: 2 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>Future: Signature Verification</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Phase 2 feature placeholder (visual only).
        </Typography>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField fullWidth disabled label="Message template" value="I confirm I completed mission {{missionId}}" />
          <TextField fullWidth disabled label="Expected wallet signer" value="0x…" />
          <TextField fullWidth disabled label="Signature" value="0x…" />
        </Stack>
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit Mission' : 'Create Mission'}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Platform</InputLabel>
              <Select
                label="Platform"
                value={draft.platform}
                onChange={(e) => setDraft((d) => ({ ...d, platform: e.target.value }))}
              >
                {PLATFORM_OPTIONS.map((p) => (
                  <MenuItem key={p} value={p}>{p}</MenuItem>
                ))}
                <MenuItem value="custom">custom</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Action</InputLabel>
              <Select
                label="Action"
                value={draft.action}
                onChange={(e) => setDraft((d) => ({ ...d, action: e.target.value }))}
              >
                {(actionsForPlatform || ['custom']).map((a) => (
                  <MenuItem key={a} value={a}>{a}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                label="Type"
                value={draft.type}
                onChange={(e) => setDraft((d) => ({ ...d, type: e.target.value }))}
              >
                {MISSION_TYPES.map((t) => (
                  <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Title"
              value={draft.title}
              onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
              fullWidth
            />

            <TextField
              label="CTA URL (optional)"
              value={draft.cta_url}
              onChange={(e) => setDraft((d) => ({ ...d, cta_url: e.target.value }))}
              fullWidth
            />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Points"
                type="number"
                value={draft.points}
                onChange={(e) => setDraft((d) => ({ ...d, points: e.target.value }))}
                fullWidth
              />
              <TextField
                label="Tier required"
                type="number"
                value={draft.tier_required}
                onChange={(e) => setDraft((d) => ({ ...d, tier_required: e.target.value }))}
                fullWidth
              />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
              <FormControlLabel
                control={<Switch checked={draft.is_active} onChange={(e) => setDraft((d) => ({ ...d, is_active: e.target.checked }))} />}
                label="Active"
              />
              <TextField
                label="Sort order"
                type="number"
                value={draft.sort_order}
                onChange={(e) => setDraft((d) => ({ ...d, sort_order: e.target.value }))}
                fullWidth
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={save}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
