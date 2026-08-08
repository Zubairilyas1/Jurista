"use client";

import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  TextField,
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Gavel as GavelIcon,
  Search as SearchIcon,
  DriveEta as DriveEtaIcon,
  LibraryBooks as LibraryBooksIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('http://localhost:8000/api/v1/rag/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: query, top_k: 5 }),
      });

      if (!res.ok) {
        throw new Error('Failed to fetch response');
      }

      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching the legal response.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: '100%' }}>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a2332' }}>
              Jurista Vehicle Law Assistant
            </Typography>
            <Typography variant="body1" sx={{ color: '#5a6a7a', mt: 1 }}>
              Ask questions about Pakistani traffic offenses, fines, and motor vehicle laws.
            </Typography>
          </Box>
          <Chip label="Prototype Phase" color="primary" sx={{ fontWeight: 600, borderRadius: 2 }} />
        </Box>
      </motion.div>

      <Grid container spacing={4} sx={{ mb: 4 }}>
        {/* Search Section */}
        <Grid item xs={12} md={7}>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card sx={{ height: '100%', minHeight: 400 }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SearchIcon color="primary" /> Legal Consultation
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
                  <TextField 
                    fullWidth 
                    variant="outlined" 
                    placeholder="e.g. What is the penalty for driving without a license?" 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSearch();
                      }
                    }}
                  />
                  <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={handleSearch}
                    disabled={loading || !query.trim()}
                    sx={{ minWidth: 120, fontWeight: 600 }}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Ask'}
                  </Button>
                </Box>

                {error && (
                  <Typography color="error" sx={{ mb: 2, p: 2, bgcolor: '#fdecea', borderRadius: 2 }}>
                    {error}
                  </Typography>
                )}

                {result && (
                  <Box sx={{ bgcolor: '#f5f7fa', p: 3, borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 700 }}>
                        AI Analysis
                      </Typography>
                      <Chip 
                        label={result.grounding_status === 'GROUNDED' ? 'Verified by Statutes' : 'No Authority Found'} 
                        size="small"
                        color={result.grounding_status === 'GROUNDED' ? 'success' : 'warning'}
                      />
                    </Box>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-line', lineHeight: 1.7 }}>
                      {result.answer.Full_Answer}
                    </Typography>
                    
                    {result.citations && result.citations.length > 0 && (
                      <Box sx={{ mt: 3 }}>
                        <Typography variant="caption" sx={{ fontWeight: 600, color: '#5a6a7a' }}>
                          Sources Cited:
                        </Typography>
                        <List dense>
                          {result.citations.map((c: any, i: number) => (
                            <ListItem key={i} sx={{ px: 0 }}>
                              <GavelIcon sx={{ fontSize: 16, mr: 1, color: '#4a90d9' }} />
                              <ListItemText 
                                primary={<Typography variant="caption" sx={{ fontWeight: 500 }}>{c.citation}</Typography>} 
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Database Stats Section */}
        <Grid item xs={12} md={5}>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LibraryBooksIcon color="primary" /> Knowledge Base
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, p: 2, bgcolor: '#e3f0fd', borderRadius: 2 }}>
                  <DriveEtaIcon color="primary" />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>Active Domain</Typography>
                    <Typography variant="caption" color="text.secondary">Pakistani Vehicle & Traffic Laws</Typography>
                  </Box>
                </Box>

                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: '#5a6a7a' }}>
                  Indexed Statutes
                </Typography>
                <List sx={{ p: 0 }}>
                  <ListItem sx={{ px: 0, py: 1.5, borderBottom: '1px solid #e8ecf0' }}>
                    <ListItemText 
                      primary={<Typography variant="body2" sx={{ fontWeight: 500 }}>National Highways Safety Ordinance, 2000</Typography>}
                      secondary="Sections 1-130"
                    />
                    <Chip label="Ready" size="small" color="success" variant="outlined" />
                  </ListItem>
                  <ListItem sx={{ px: 0, py: 1.5 }}>
                    <ListItemText 
                      primary={<Typography variant="body2" sx={{ fontWeight: 500 }}>Provincial Motor Vehicles Ordinance, 1965</Typography>}
                      secondary="Pending Full Ingestion"
                    />
                    <Chip label="Indexing" size="small" color="warning" variant="outlined" />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
}
