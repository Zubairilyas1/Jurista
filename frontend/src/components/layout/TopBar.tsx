"use client";

import React from 'react';
import { AppBar, Toolbar, IconButton, Typography, Avatar, Box, Badge, Chip } from '@mui/material';
import { Menu as MenuIcon, Notifications as NotificationsIcon, Search as SearchIcon } from '@mui/icons-material';
import { usePathname } from 'next/navigation';

interface TopBarProps {
  handleDrawerToggle: () => void;
}

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/chat': 'Legal Chat',
  '/ocr': 'OCR Review',
  '/drafter': 'Petition Drafter',
  '/tracker': 'Cause Tracker',
};

export function TopBar({ handleDrawerToggle }: TopBarProps) {
  const pathname = usePathname();
  const title = pageTitles[pathname || '/'] || 'Jurista';

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' }, color: '#1a2a3a' }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a2a3a' }}>
            {title}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 0.5 }}>
            <Chip
              label="Hello, Muhammad"
              size="small"
              sx={{ bgcolor: '#e8f0fe', color: '#1a2a3a', fontWeight: 500, borderRadius: 2 }}
            />
          </Box>
          
          <IconButton>
            <SearchIcon sx={{ color: '#5a6a7a' }} />
          </IconButton>
          
          <IconButton>
            <Badge badgeContent={3} color="error">
              <NotificationsIcon sx={{ color: '#5a6a7a' }} />
            </Badge>
          </IconButton>
          
          <Avatar sx={{ width: 36, height: 36, bgcolor: '#4a90d9', color: '#fff', fontSize: '0.8rem', fontWeight: 600 }}>
            MA
          </Avatar>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
