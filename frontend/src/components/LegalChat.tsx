"use client";

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Send as SendIcon,
  Gavel as GavelIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Cancel as CancelIcon,
  Description as DescriptionIcon,
  Link as LinkIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

interface Citation {
  citation: string;
  validity_status: string;
  retrieval_score: number | null;
}

interface Answer {
  Full_Answer?: string;
  Applicable_Law?: string;
}

interface QueryResponse {
  answer: Answer;
  citations: Citation[];
  grounding_status: string;
}

export const LegalChat: React.FC = () => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<QueryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch('http://localhost:8000/api/v1/rag/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim(), top_k: 5 }),
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const data: QueryResponse = await res.json();
      setResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    if (status === 'GROUNDED') return '#34a853';
    if (status === 'NO_RELIABLE_AUTHORITY_FOUND') return '#fbbc04';
    if (status === 'ONLY_OVERRULED_AUTHORITY_AVAILABLE') return '#ea4335';
    return '#5a6a7a';
  };

  const getStatusIcon = (status: string) => {
    if (status === 'GROUNDED') return <CheckCircleIcon />;
    if (status === 'NO_RELIABLE_AUTHORITY_FOUND') return <WarningIcon />;
    if (status === 'ONLY_OVERRULED_AUTHORITY_AVAILABLE') return <CancelIcon />;
    return <GavelIcon />;
  };

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e8ecf0' }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <GavelIcon sx={{ color: '#4a90d9' }} /> Legal Chat Assistant
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Ask legal questions in English or Urdu ? get grounded answers with verifiable citations.
        </Typography>

        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Ask a legal question (English, Urdu, or Roman Urdu)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={loading}
              InputProps={{ sx: { borderRadius: 2, bgcolor: '#f5f7fa' } }}
            />
            <Button
              type="submit"
              variant="contained"
              disabled={loading || !query.trim()}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
              sx={{ borderRadius: 2, px: 4, bgcolor: '#4a90d9', '&:hover': { bgcolor: '#2a70b9' } }}
            >
              {loading ? 'Searching...' : 'Ask'}
            </Button>
          </Box>
        </form>

        {error && (
          <Alert severity="error" sx={{ mt: 3, borderRadius: 2 }}>{error}</Alert>
        )}

        <AnimatePresence>
          {response && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
              <Box sx={{ mt: 4 }}>
                {/* Status badge */}
                <Chip
                  icon={getStatusIcon(response.grounding_status)}
                  label={response.grounding_status.replace(/_/g, ' ')}
                  sx={{
                    bgcolor: getStatusColor(response.grounding_status) + '15',
                    color: getStatusColor(response.grounding_status),
                    fontWeight: 500,
                    borderRadius: 2,
                    mb: 2,
                  }}
                />

                {/* Answer */}
                <Card variant="outlined" sx={{ borderRadius: 2, borderColor: '#e8ecf0', mb: 3 }}>
                  <CardContent>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                      {response.answer.Full_Answer || response.answer.Applicable_Law || 'No answer provided.'}
                    </Typography>
                  </CardContent>
                </Card>

                {/* Citations */}
                {response.citations && response.citations.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>Citations</Typography>
                    <List dense sx={{ bgcolor: '#f5f7fa', borderRadius: 2, p: 1 }}>
                      {response.citations.map((citation, idx) => (
                        <ListItem key={idx} divider={idx < response.citations.length - 1}>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <LinkIcon sx={{ color: '#4a90d9', fontSize: 18 }} />
                          </ListItemIcon>
                          <ListItemText
                            primary={citation.citation}
                            secondary={
                              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.5 }}>
                                <Chip
                                  label={citation.validity_status}
                                  size="small"
                                  sx={{
                                    bgcolor: citation.validity_status === 'GOOD_LAW' ? '#e8f5e9' : '#fef9e7',
                                    color: citation.validity_status === 'GOOD_LAW' ? '#34a853' : '#fbbc04',
                                    fontSize: '0.6rem',
                                    height: 20,
                                  }}
                                />
                                {citation.retrieval_score !== null && (
                                  <Typography variant="caption" color="text.secondary">
                                    score: {citation.retrieval_score.toFixed(3)}
                                  </Typography>
                                )}
                              </Box>
                            }
                            primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
              </Box>
            </motion.div>
          )}
        </AnimatePresence>

        {!response && !loading && !error && (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <GavelIcon sx={{ fontSize: 48, color: '#d0d7de', mb: 2 }} />
            <Typography variant="body1" color="text.secondary">Ask a legal question to get started.</Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};
