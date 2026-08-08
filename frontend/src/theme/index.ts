"use client";

import { createTheme } from '@mui/material/styles';
import { Inter } from 'next/font/google';

export const inter = Inter({ subsets: ['latin'], weight: ['300','400','500','600','700'] });

// Colors from the reference image
const colors = {
  primary: '#1a2a3a',        // Dark navy (sidebar)
  primaryLight: '#2a4a6a',
  primaryDark: '#0d1a2a',
  secondary: '#4a90d9',       // Blue accent (stats, buttons)
  secondaryLight: '#6aafe9',
  secondaryDark: '#2a70b9',
  green: '#34a853',           // Green (Finished stats)
  greenLight: '#e8f5e9',
  orange: '#fbbc04',          // Orange (warning)
  red: '#ea4335',             // Red (danger)
  bgDefault: '#f5f7fa',       // Light grey background
  cardBg: '#ffffff',
  textPrimary: '#1a2332',
  textSecondary: '#5a6a7a',
  border: '#e8ecf0',
  shadow: '0 2px 12px rgba(0,0,0,0.06)',
};

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: colors.primary, light: colors.primaryLight, dark: colors.primaryDark, contrastText: '#ffffff' },
    secondary: { main: colors.secondary, light: colors.secondaryLight, dark: colors.secondaryDark, contrastText: '#ffffff' },
    success: { main: colors.green, light: colors.greenLight },
    background: { default: colors.bgDefault, paper: colors.cardBg },
    text: { primary: colors.textPrimary, secondary: colors.textSecondary },
    divider: colors.border,
  },
  typography: {
    fontFamily: inter.style.fontFamily,
    h1: { fontWeight: 700, fontSize: '2rem' },
    h2: { fontWeight: 600, fontSize: '1.5rem' },
    h3: { fontWeight: 600, fontSize: '1.25rem' },
    h4: { fontWeight: 600, fontSize: '1.1rem' },
    h5: { fontWeight: 500, fontSize: '1rem' },
    h6: { fontWeight: 500, fontSize: '0.9rem' },
    body1: { fontSize: '0.9rem' },
    body2: { fontSize: '0.8rem', color: colors.textSecondary },
    button: { fontWeight: 500, textTransform: 'none' },
  },
  shape: { borderRadius: 12 },
  shadows: ['none', colors.shadow, colors.shadow, colors.shadow, colors.shadow, colors.shadow, colors.shadow, colors.shadow, colors.shadow, colors.shadow, colors.shadow, colors.shadow, colors.shadow, colors.shadow, colors.shadow, colors.shadow, colors.shadow, colors.shadow, colors.shadow, colors.shadow, colors.shadow, colors.shadow, colors.shadow, colors.shadow, colors.shadow],
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          border: '1px solid #e8ecf0',
          transition: 'all 0.3s ease',
          '&:hover': { boxShadow: '0 8px 30px rgba(0,0,0,0.1)' },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 8, padding: '8px 20px', textTransform: 'none', fontWeight: 500 },
        contained: { boxShadow: 'none', '&:hover': { boxShadow: '0 4px 16px rgba(74,144,217,0.3)' } },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: { background: '#1a2a3a', border: 'none', color: '#ffffff' },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: { background: '#ffffff', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', borderBottom: '1px solid #e8ecf0' },
      },
    },
  },
});
