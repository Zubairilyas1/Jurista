"use client";

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Download as DownloadIcon,
  Description as DescriptionIcon,
  Help as HelpIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

export const PetitionDrafter: React.FC = () => {
  const [form, setForm] = useState({
    petition_type: 'CRPC_497_BAIL',
    court: 'High Court of Sindh',
    case_number: '______/2025',
    petitioner: 'Muhammad Ali',
    respondent: 'The State',
    facts: 'The petitioner was arrested on allegations of...\n\nHe respectfully submits that the allegations are baseless and false.',
    prayer: 'Grant bail to the petitioner pending trial.\nPass any other order deemed fit.',
    party_type: 'Petitioner',
    bar_license_no: '1234/SC',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const name = e.target.name as string;
    const value = e.target.value as string;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('http://localhost:8000/api/v1/drafter/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to generate petition');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'petition.docx';
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/);
        if (match) filename = match[1];
      }
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e8ecf0' }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <EditIcon sx={{ color: '#4a90d9' }} /> Petition Drafter
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Generate a court?ready petition with pre?filled legal grounds and citations. Download as .docx.
        </Typography>

        {success && (
          <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }} icon={<DownloadIcon />}>
            Petition generated and downloaded successfully!
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Petition Type</InputLabel>
                <Select name="petition_type" value={form.petition_type} onChange={handleChange} label="Petition Type" sx={{ borderRadius: 2 }}>
                  <MenuItem value="CRPC_497_BAIL">Bail (CrPC 497)</MenuItem>
                  <MenuItem value="CPC_ORDER39_STAY">Stay (CPC Order 39)</MenuItem>
                  <MenuItem value="ART199_WRIT">Writ (Article 199)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Court" name="court" value={form.court} onChange={handleChange} sx={{ borderRadius: 2 }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Case Number" name="case_number" value={form.case_number} onChange={handleChange} sx={{ borderRadius: 2 }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Bar License No." name="bar_license_no" value={form.bar_license_no} onChange={handleChange} sx={{ borderRadius: 2 }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Petitioner / Plaintiff" name="petitioner" value={form.petitioner} onChange={handleChange} sx={{ borderRadius: 2 }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Respondent / Defendant" name="respondent" value={form.respondent} onChange={handleChange} sx={{ borderRadius: 2 }} />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Facts"
                name="facts"
                multiline
                rows={3}
                value={form.facts}
                onChange={handleChange}
                sx={{ borderRadius: 2 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Prayer"
                name="prayer"
                multiline
                rows={2}
                value={form.prayer}
                onChange={handleChange}
                sx={{ borderRadius: 2 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Party Type (for signature)" name="party_type" value={form.party_type} onChange={handleChange} sx={{ borderRadius: 2 }} />
            </Grid>
          </Grid>

          {error && (
            <Alert severity="error" sx={{ mt: 3, borderRadius: 2 }}>{error}</Alert>
          )}

          <Box sx={{ mt: 3 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <DownloadIcon />}
              sx={{ borderRadius: 2, px: 4, bgcolor: '#4a90d9', '&:hover': { bgcolor: '#2a70b9' } }}
            >
              {loading ? 'Generating...' : 'Generate & Download Petition'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};
