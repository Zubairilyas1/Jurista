import React, { useState, useRef } from 'react';
import { UploadCloud, Search, Trash2, Edit2, CheckCircle2, ScanText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function OcrReview() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [editedText, setEditedText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
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

  return (
    <div className="w-full h-full flex flex-col p-8 bg-zinc-950 overflow-y-auto custom-scrollbar">
      <div className="max-w-6xl mx-auto w-full flex flex-col gap-8">
        
        <header className="flex flex-col gap-2 border-b border-zinc-800 pb-6">
          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <ScanText className="text-emerald-500" />
            OCR Scanner
          </h2>
          <p className="text-sm text-zinc-400">Extract facts, parties, and dates from raw FIRs, notices, and handwritten notes.</p>
        </header>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
            {error}
          </div>
        )}

        {!result ? (
          <div className="flex flex-col gap-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
            />
            
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800/50 transition-colors rounded-xl p-12 flex flex-col items-center justify-center cursor-pointer text-center group"
            >
              <UploadCloud size={40} className="text-zinc-500 group-hover:text-emerald-400 transition-colors mb-4" />
              <p className="text-sm font-medium text-zinc-300 mb-2">
                {file ? file.name : "Click to upload or drag & drop"}
              </p>
              <p className="text-xs text-zinc-500">Supports PDF, DOCX, and JPG up to 10MB</p>
            </div>

            <div className="flex justify-center mt-4">
              <button 
                onClick={handleUpload}
                disabled={!file || uploading}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:hover:bg-emerald-600 text-white text-sm font-bold tracking-tight rounded-xl shadow-sm transition-colors flex items-center gap-2"
              >
                {uploading ? (
                  <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Scanning...</span>
                ) : (
                  <><Search size={16} /> Process Document</>
                )}
              </button>
            </div>
          </div>
        ) : (
          <AnimatePresence>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Left Column: Editable OCR Text */}
              <div className="flex flex-col gap-4 bg-zinc-900/80 border border-zinc-800 rounded-xl p-6">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                  <h3 className="text-sm font-bold text-zinc-200">Extracted Text</h3>
                  <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider rounded flex items-center gap-1">
                    <Edit2 size={10} /> Editable
                  </span>
                </div>
                
                <textarea
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  className="w-full h-[400px] bg-zinc-800/60 border border-zinc-700 rounded-xl p-4 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all custom-scrollbar resize-none font-mono"
                ></textarea>

                <div className="flex justify-between items-center mt-2">
                  <button onClick={handleClear} className="text-xs text-red-400 hover:text-red-300 font-bold uppercase tracking-tight flex items-center gap-1">
                    <Trash2 size={14} /> Clear Session
                  </button>
                  <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold tracking-tight rounded-lg shadow-sm transition-colors flex items-center gap-2">
                    <CheckCircle2 size={14} /> Save Corrections
                  </button>
                </div>
              </div>

              {/* Right Column: Analytics & Confidence */}
              <div className="flex flex-col gap-6">
                <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-6 flex flex-col gap-4">
                  <h3 className="text-sm font-bold text-zinc-200 border-b border-zinc-800 pb-4">Extracted Intelligence</h3>
                  
                  <div className="flex flex-col gap-2">
                    <div className="bg-zinc-800/50 p-3 rounded-lg border border-zinc-700/50">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">Parties Identified</span>
                      <p className="text-sm text-zinc-200">{result.summary?.parties?.join(', ') || 'None found'}</p>
                    </div>
                    <div className="bg-zinc-800/50 p-3 rounded-lg border border-zinc-700/50">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">Sections / Laws</span>
                      <p className="text-sm text-emerald-400 font-medium">{result.summary?.sections?.join(', ') || 'None found'}</p>
                    </div>
                    <div className="bg-zinc-800/50 p-3 rounded-lg border border-zinc-700/50">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">Key Events</span>
                      <ul className="list-disc pl-4 text-sm text-zinc-300">
                        {result.summary?.events?.length > 0 ? (
                          result.summary.events.map((ev: string, i: number) => <li key={i}>{ev}</li>)
                        ) : (
                          <li>No events found</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-6 flex flex-col gap-4">
                  <h3 className="text-sm font-bold text-zinc-200 border-b border-zinc-800 pb-4">Line Confidence Scans</h3>
                  <div className="h-[200px] overflow-y-auto custom-scrollbar flex flex-col gap-3 pr-2">
                    {result.lines?.map((line: any, idx: number) => (
                      <div key={idx} className="flex flex-col gap-1">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-zinc-400 truncate pr-4">{line.text}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            line.confidence > 0.9 ? 'bg-emerald-500/10 text-emerald-400' :
                            line.confidence > 0.7 ? 'bg-yellow-500/10 text-yellow-400' :
                            'bg-red-500/10 text-red-400'
                          }`}>
                            {Math.round(line.confidence * 100)}%
                          </span>
                        </div>
                        <div className="w-full bg-zinc-800 rounded-full h-1">
                          <div 
                            className={`h-1 rounded-full ${
                              line.confidence > 0.9 ? 'bg-emerald-500' :
                              line.confidence > 0.7 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${Math.round(line.confidence * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </motion.div>
          </AnimatePresence>
        )}

      </div>
    </div>
  );
}