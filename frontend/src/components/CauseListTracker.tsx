"use client";

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  Grid,
  Divider,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Notifications as NotificationsIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

export const CauseListTracker: React.FC = () => {
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchCases = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('http://127.0.0.1:8001/api/v1/tracker/cases');
      if (!res.ok) throw new Error('Failed to fetch cases');
      const data = await res.json();
      setCases(data.cases || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading cases');
    } finally {
      setLoading(false);
    }
  };

  const refreshCauseList = async () => {
    setRefreshing(true);
    setError(null);
    try {
      const res = await fetch('http://127.0.0.1:8001/api/v1/tracker/refresh', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to refresh cause list');
      const data = await res.json();
      setLastRefresh(new Date());
      await fetchCases();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error refreshing cause list');
    } finally {
      setRefreshing(false);
    }
  };

  const sendAlert = async (caseNumber: string) => {
    const message = prompt(`Enter alert message for case ${caseNumber}:`);
    if (!message) return;
    try {
      const res = await fetch('http://127.0.0.1:8001/api/v1/tracker/alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ case_number: caseNumber, message }),
      });
      if (res.ok) alert('Alert sent successfully!');
      else alert('Failed to send alert.');
    } catch {
      alert('Error sending alert.');
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const getDeadlineStatus = (deadline: string) => {
    const days = Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (days < 0) return { label: 'Overdue', color: '#ea4335', icon: <WarningIcon /> };
    if (days < 3) return { label: 'Urgent', color: '#fbbc04', icon: <WarningIcon /> };
    return { label: 'On Track', color: '#34a853', icon: <CheckCircleIcon /> };
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e8ecf0' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', mb: 3 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarIcon sx={{ color: '#4a90d9' }} /> Cause List Tracker
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Track cause lists, compute deadlines, and send alerts.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {lastRefresh && (
              <Chip label={`Last refresh: ${lastRefresh.toLocaleTimeString()}`} size="small" variant="outlined" />
            )}
            <Button
              variant="contained"
              startIcon={refreshing ? <CircularProgress size={20} /> : <RefreshIcon />}
              onClick={refreshCauseList}
              disabled={refreshing}
              sx={{ borderRadius: 2, bgcolor: '#4a90d9', '&:hover': { bgcolor: '#2a70b9' } }}
            >
              {refreshing ? 'Refreshing...' : 'Refresh Cause List'}
            </Button>
          </Box>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        )}

        {!loading && cases.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <InfoIcon sx={{ fontSize: 48, color: '#d0d7de', mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              No tracked cases. Click "Refresh Cause List" to scrape today's cause list.
            </Typography>
          </Box>
        )}

        {!loading && cases.length > 0 && (
          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, borderColor: '#e8ecf0' }}>
            <Table>
              <TableHead sx={{ bgcolor: '#f5f7fa' }}>
                <TableRow>
                  <TableCell><strong>Case #</strong></TableCell>
                  <TableCell><strong>Parties</strong></TableCell>
                  <TableCell><strong>Court</strong></TableCell>
                  <TableCell><strong>Hearing Date</strong></TableCell>
                  <TableCell><strong>Deadline</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Action</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cases.map((c, idx) => {
                  const status = getDeadlineStatus(c.deadline);
                  return (
                    <TableRow key={idx} hover>
                      <TableCell sx={{ fontWeight: 500 }}>{c.case_number}</TableCell>
                      <TableCell>{c.parties}</TableCell>
                      <TableCell>{c.court}</TableCell>
                      <TableCell>{c.hearing_date}</TableCell>
                      <TableCell>{c.deadline}</TableCell>
                      <TableCell>
                        <Chip
                          icon={status.icon}
                          label={status.label}
                          size="small"
                          sx={{ bgcolor: status.color + '15', color: status.color, fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Send Alert">
                          <IconButton onClick={() => sendAlert(c.case_number)} color="primary" size="small">
                            <NotificationsIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
};
