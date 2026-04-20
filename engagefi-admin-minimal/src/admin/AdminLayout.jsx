import React, { useEffect, useMemo, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { supabaseHealthCheck } from '../lib/questService'
import '../styles/AdminMuiOverrides.css'

import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
   Toolbar,
  Typography,
  Chip,
  Button,
} from '@mui/material'
import AssignmentIcon from '@mui/icons-material/Assignment'
import PeopleIcon from '@mui/icons-material/People'
import FactCheckIcon from '@mui/icons-material/FactCheck'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
const drawerWidth = 240

function SideNavItem({ to, icon, label }) {
  const location = useLocation()
  const selected = location.pathname === to
  return (
    <ListItemButton component={NavLink} to={to} selected={selected}>
      <ListItemIcon>{icon}</ListItemIcon>
      <ListItemText primary={label} />
    </ListItemButton>
  )
}

export default function AdminLayout() {
  const [status, setStatus] = useState({ ok: false, error: null, checked: false })

  useEffect(() => {
    let ignore = false
    async function check() {
      try {
        const res = await supabaseHealthCheck()
        if (!ignore) setStatus({ ...res, checked: true })
      } catch (e) {
        if (!ignore) setStatus({ ok: false, error: e, checked: true })
      }
    }
    check()
    const t = setInterval(check, 8000)
    return () => { ignore = true; clearInterval(t) }
   }, [])

    const envChip = useMemo(() => {
    if (!status.checked) return <Chip size="small" label="Supabase: checking…" title="Checking Supabase connection…" />
    if (status.ok) return <Chip size="small" color="success" label="Supabase: connected" title="Supabase connected" />
    const msg = status?.error?.message || 'Supabase not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
    return <Chip size="small" color="error" label="Supabase: not connected" title={msg} />
  }, [status])

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button color="inherit" component={NavLink} to="/quests" startIcon={<ArrowBackIcon />}>
              Back
            </Button>
            <Typography variant="h6" noWrap component="div">
              EngageFi QuestBoard Admin
            </Typography>
          </Box>
          {envChip}
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            <SideNavItem to="/admin/quests" icon={<AssignmentIcon />} label="Quests" />
            <SideNavItem to="/admin/users" icon={<PeopleIcon />} label="Users" />
            <SideNavItem to="/admin/completions" icon={<FactCheckIcon />} label="Completions" />
          </List>
          <Divider />
          <Box sx={{ p: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Demo mode: anon key + permissive access.
            </Typography>
          </Box>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  )
}
