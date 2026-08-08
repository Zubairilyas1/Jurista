"use client";

import React from 'react';
import { Box, List, ListItem, ListItemIcon, ListItemText, Typography, Divider, Avatar, Badge } from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Chat as ChatIcon,
  Description as DescriptionIcon,
  Edit as EditIcon,
  CalendarToday as CalendarIcon,
  Settings as SettingsIcon,
  Help as HelpIcon,
  Gavel as GavelIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

const navItems = [
  { label: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { label: 'Legal Chat', icon: <ChatIcon />, path: '/chat' },
  { label: 'OCR Review', icon: <DescriptionIcon />, path: '/ocr' },
  { label: 'Petition Drafter', icon: <EditIcon />, path: '/drafter' },
  { label: 'Cause Tracker', icon: <CalendarIcon />, path: '/tracker' },
];

const bottomItems = [
  { label: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  { label: 'Help', icon: <HelpIcon />, path: '/help' },
];

interface SidebarProps {
  drawerWidth: number;
  mobileOpen: boolean;
  handleDrawerToggle: () => void;
  isMobile: boolean;
}

export function Sidebar({ drawerWidth, mobileOpen, handleDrawerToggle, isMobile }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleNavigate = (path: string) => {
    router.push(path);
    if (isMobile) handleDrawerToggle();
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', py: 2 }}>
      {/* Logo */}
      <Box sx={{ px: 3, mb: 4, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <GavelIcon sx={{ color: '#4a90d9', fontSize: 28 }} />
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#ffffff', letterSpacing: '-0.5px' }}>
          Jurista
        </Typography>
      </Box>

      {/* Navigation */}
      <Box sx={{ flex: 1, px: 1.5 }}>
        <List>
          {navItems.map((item) => {
            const active = pathname === item.path || (item.path !== '/' && pathname?.startsWith(item.path));
            return (
              <ListItem
                key={item.path}
                component={motion.li}
                whileHover={{ x: 4 }}
                transition={{ duration: 0.15 }}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  cursor: 'pointer',
                  py: 1.2,
                  backgroundColor: active ? 'rgba(74, 144, 217, 0.15)' : 'transparent',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.05)' },
                  borderLeft: active ? '3px solid #4a90d9' : '3px solid transparent',
                }}
                onClick={() => handleNavigate(item.path)}
              >
                <ListItemIcon sx={{ color: active ? '#4a90d9' : 'rgba(255,255,255,0.6)', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  sx={{
                    '& .MuiTypography-root': {
                      color: active ? '#ffffff' : 'rgba(255,255,255,0.7)',
                      fontWeight: active ? 600 : 400,
                      fontSize: '0.9rem',
                    },
                  }}
                />
                {active && (
                  <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#4a90d9' }} />
                )}
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* Upgrade to Pro - Match reference */}
      <Box sx={{ px: 2, mb: 2 }}>
        <Box
          sx={{
            bgcolor: 'rgba(74, 144, 217, 0.1)',
            borderRadius: 3,
            p: 2,
            border: '1px solid rgba(74, 144, 217, 0.15)',
          }}
        >
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Upgrade to Pro
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 500, mt: 0.5 }}>
            Get 1 month free
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>
            and unlock all features
          </Typography>
        </Box>
      </Box>

      {/* User Profile - Match reference */}
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mx: 2 }} />
      <Box sx={{ px: 2, mt: 2 }}>
        <ListItem sx={{ px: 0, borderRadius: 2, cursor: 'pointer', '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } }}>
          <Avatar sx={{ width: 40, height: 40, bgcolor: '#4a90d9', color: '#fff', fontSize: '0.9rem', fontWeight: 600 }}>
            MA
          </Avatar>
          <Box sx={{ ml: 2, flex: 1 }}>
            <Typography variant="body2" sx={{ color: '#ffffff', fontWeight: 500 }}>Muhammad Ali</Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>Senior Advocate</Typography>
          </Box>
          <Badge variant="dot" color="success" />
        </ListItem>
      </Box>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
    >
      {isMobile ? (
        <></>
      ) : (
        <Box sx={{ width: drawerWidth, height: '100vh', position: 'fixed', top: 0, left: 0, bgcolor: '#1a2a3a', zIndex: 1200 }}>
          {drawer}
        </Box>
      )}
    </Box>
  );
}
