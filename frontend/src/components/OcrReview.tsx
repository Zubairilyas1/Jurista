"use client";

import React, { useState, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  IconButton,
  Tooltip,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Clear as ClearIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

export const OcrReview: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [editedText, setEditedText] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first.');
      return;
    }
    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('http://127.0.0.1:8001/api/v1/ocr/process', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Failed to process OCR');
      }

      const data = await res.json();
      setResult(data);
      setEditedText(data.text || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setUploading(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setEditedText('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const renderConfidenceBar = (conf: number) => {
    let color = '#34a853';
    if (conf < 0.7) color = '#ea4335';
    else if (conf < 0.9) color = '#fbbc04';
    return <LinearProgress variant="determinate" value={conf * 100} sx={{ height: 6, borderRadius: 3, bgcolor: '#e8ecf0', '& .MuiLinearProgress-bar': { bgcolor: color } }} />;
  };

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e8ecf0' }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <DescriptionIcon sx={{ color: '#4a90d9' }} /> OCR Review & Correction
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Upload a PDF or image (JPEG/PNG) to extract text with confidence scoring and structured summary.
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.jpg,.jpeg,.png"
            style={{ display: 'none' }}
          />
          <Button
            variant="outlined"
            startIcon={<CloudUploadIcon />}
            onClick={() => fileInputRef.current?.click()}
            sx={{ borderRadius: 2 }}
          >
            Choose File
          </Button>
          {file && (
            <Chip
              label={file.name}
              onDelete={handleClear}
              variant="outlined"
              sx={{ borderRadius: 2 }}
            />
          )}
          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={!file || uploading}
            startIcon={uploading ? <CircularProgress size={20} /> : <SearchIcon />}
            sx={{ borderRadius: 2, bgcolor: '#4a90d9', '&:hover': { bgcolor: '#2a70b9' } }}
          >
            {uploading ? 'Processing...' : 'Upload & OCR'}
          </Button>
          {result && (
            <Button variant="text" color="error" onClick={handleClear} startIcon={<ClearIcon />}>
              Clear
            </Button>
          )}
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
              <Grid container spacing={3}>
                {/* Text with correction */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Card variant="outlined" sx={{ borderRadius: 2, borderColor: '#e8ecf0', height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle2" >OCR Text (edit below)</Typography>
                        <Chip icon={<EditIcon />} label="Editable" size="small" sx={{ bgcolor: '#e3f0fd', color: '#4a90d9' }} />
                      </Box>
                      <TextField
                        multiline
                        fullWidth
                        minRows={12}
                        value={editedText}
                        onChange={(e) => setEditedText(e.target.value)}
                        variant="outlined"
                        sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#f5f7fa', borderRadius: 2 } }}
                      />
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                        <Button variant="contained" color="success" startIcon={<SaveIcon />} onClick={() => alert('Corrections saved (placeholder)')}>
                          Save Corrections
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Summary and confidence */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Card variant="outlined" sx={{ borderRadius: 2, borderColor: '#e8ecf0', height: '100%' }}>
                    <CardContent>
                      <Typography variant="subtitle2"  sx={{ mb: 2 }}>Extracted Summary</Typography>
                      <Box sx={{ bgcolor: '#f5f7fa', p: 2, borderRadius: 2, mb: 2 }}>
                        <Typography variant="body2"><strong>Parties:</strong> {result.summary.parties.join(', ') || 'Not found'}</Typography>
                        <Typography variant="body2"><strong>Sections:</strong> {result.summary.sections.join(', ') || 'None'}</Typography>
                        <Typography variant="body2"><strong>Events:</strong></Typography>
                        <ul style={{ margin: 0, paddingLeft: 20 }}>
                          {result.summary.events.map((ev: string, i: number) => <li key={i}>{ev}</li>)}
                          {result.summary.events.length === 0 && <li>No events found</li>}
                        </ul>
                      </Box>

                      <Typography variant="subtitle2"  sx={{ mb: 1 }}>Per-Line Confidence</Typography>
                      <Box sx={{ maxHeight: 300, overflowY: 'auto', bgcolor: '#f5f7fa', p: 1, borderRadius: 2 }}>
                        {result.lines.map((line: any, idx: number) => (
                          <Box key={idx} sx={{ mb: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
                              <Typography variant="caption" sx={{ flex: 1 }}>{line.text}</Typography>
                              <Chip
                                label={`${Math.round(line.confidence * 100)}%`}
                                size="small"
                                sx={{
                                  bgcolor: line.confidence > 0.9 ? '#e8f5e9' : line.confidence > 0.7 ? '#fef9e7' : '#fde8e8',
                                  color: line.confidence > 0.9 ? '#34a853' : line.confidence > 0.7 ? '#fbbc04' : '#ea4335',
                                  fontSize: '0.6rem',
                                  height: 20,
                                  minWidth: 40,
                                }}
                              />
                            </Box>
                            {renderConfidenceBar(line.confidence)}
                          </Box>
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </motion.div>
          )}
        </AnimatePresence>

        {!result && !uploading && !error && (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <DescriptionIcon sx={{ fontSize: 48, color: '#d0d7de', mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              Upload a PDF or image to extract text.
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};
