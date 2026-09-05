"use client";

import React, { useState, useRef } from 'react';
import { Upload, FileText, Settings, Copy, CheckCircle2, User, FileWarning, Calendar, MessageSquare, Download, Languages, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

import DocumentEditorModal from '@/components/DocumentEditorModal';


export default function OCRPage() {
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDrafting, setIsDrafting] = useState(false);
  const [petitionType, setPetitionType] = useState('CRPC_497_BAIL');
  const [language, setLanguage] = useState('english');

  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'raw' | 'translated'>('raw');
  
  // Editor State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [draftHtml, setDraftHtml] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files[0]);
    }
  };

  const handleUpload = async (file: File) => {
    setIsProcessing(true);
    setResult(null);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('http://127.0.0.1:8001/api/v1/ocr/process', {
        method: 'POST',
        body: formData,
      });
      
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setResult(data);
    } catch (error) {
      console.error(error);
      alert('Failed to process document.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDraft = async () => {
    if (!result) return;
    setIsDrafting(true);
    try {
      const payload = {
        petition_type: petitionType,
        language: language,
        court: "High Court",
        case_number: "______/2026",
        petitioner: result.summary?.parties?.[0] || "Petitioner",
        respondent: result.summary?.parties?.[1] || "The State",
        facts: result.text || "Extracted facts from FIR.",
        prayer: "Grant relief as prayed.",
        party_type: "Petitioner",
        bar_license_no: "1234/HC"
      };

      const res = await fetch('http://127.0.0.1:8001/api/v1/drafter/generate_html', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error('Drafting failed');
      
      const htmlContent = await res.text();
      setDraftHtml(htmlContent);
      setIsEditorOpen(true);
      
    } catch (e) {
      console.error(e);
      alert('Failed to generate draft.');
    } finally {
      setIsDrafting(false);
    }
  };

  const handleCopy = () => {
    const textToCopy = viewMode === 'translated' && translatedText ? translatedText : result?.text;
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleTranslate = async () => {
    if (!result?.text) return;
    setIsTranslating(true);
    try {
      const res = await fetch('http://127.0.0.1:8001/api/v1/ocr/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: result.text })
      });
      if (res.ok) {
        const data = await res.json();
        setTranslatedText(data.translated_text);
        setViewMode('translated');
      } else {
        alert('Translation failed.');
      }
    } catch (e) {
      console.error(e);
      alert('Translation failed.');
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col p-4 bg-[#0D0D0E] overflow-hidden text-white">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8 shrink-0">
        <h1 className="font-sans-hero text-4xl font-semibold tracking-wider uppercase">
          OCR ENGINE
        </h1>
        <div className="flex items-center gap-3">
          <div className="pill-dark px-5 py-2.5 bg-transparent border-zinc-800 text-muted flex items-center gap-2 text-sm hover:text-white transition-colors cursor-pointer">
            <Settings size={16} /> Configuration
          </div>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        
        {/* Main Content Area */}
        {result ? (
          /* RESULTS DASHBOARD */
          <div className="flex-1 flex gap-6 overflow-hidden">
            
            {/* Left: Raw Text Viewer */}
            <div className="flex-1 card-dark flex flex-col overflow-hidden relative">
              <div className="p-4 border-b border-zinc-800/50 flex items-center justify-between shrink-0 bg-zinc-900/50">
                <div className="flex items-center gap-2">
                  <FileText size={18} className="text-emerald-400" />
                  <h3 className="font-sans-hero font-bold tracking-tight text-sm uppercase">Raw Extracted Text</h3>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-black/50 p-1 rounded-xl flex items-center border border-zinc-800/50">
                    <button 
                      onClick={() => setViewMode('raw')}
                      className={`px-3 py-1.5 text-xs font-bold uppercase tracking-tight rounded-lg transition-all ${viewMode === 'raw' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/80'}`}
                    >
                      Urdu (Raw)
                    </button>
                    <button 
                      onClick={() => viewMode !== 'translated' && (translatedText ? setViewMode('translated') : handleTranslate())}
                      disabled={isTranslating}
                      className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold uppercase tracking-tight rounded-lg transition-all ${viewMode === 'translated' ? 'bg-blue-500/20 text-blue-400 border border-zinc-800' : 'text-white/40 hover:text-white/80'}`}
                    >
                      {isTranslating ? <Loader2 size={12} className="animate-spin" /> : <Languages size={12} />}
                      English
                    </button>
                  </div>
                  <button 
                    onClick={handleCopy}
                    className="flex items-center gap-2 text-xs font-bold uppercase tracking-tight bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg transition-colors border border-zinc-800/50"
                  >
                    {copied ? <CheckCircle2 size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-[#0D0D0E]">
                <pre className="font-sans whitespace-pre-wrap text-[15px] leading-relaxed text-white/80">
                  {viewMode === 'translated' && translatedText ? translatedText : (result.text || "No text extracted.")}
                </pre>
              </div>

              {/* Drafting Suite */}
              <div className="card-dark p-6 border-t border-zinc-800 bg-zinc-900/50 flex flex-col gap-4">
                <h3 className="font-sans-hero font-bold tracking-tight text-sm uppercase text-white flex items-center gap-2">
                  <Download size={16} /> Automated Drafting Suite
                </h3>
                
                <div className="flex gap-4">
                  <div className="flex-1 flex flex-col gap-2">
                    <label className="text-[10px] font-bold uppercase text-white/50 tracking-wider">Petition Type</label>
                    <select 
                      value={petitionType}
                      onChange={(e) => setPetitionType(e.target.value)}
                      className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm font-medium text-white outline-none focus:border-emerald-500/50"
                    >
                      <option value="CRPC_497_BAIL">Bail Petition (CrPC 497)</option>
                      <option value="CPC_ORDER39_STAY">Stay Petition (CPC Order 39)</option>
                      <option value="ART199_WRIT">Writ Petition (Article 199)</option>
                    </select>
                  </div>
                  
                  <div className="flex-1 flex flex-col gap-2">
                    <label className="text-[10px] font-bold uppercase text-white/50 tracking-wider">Language Format</label>
                    <select 
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm font-medium text-white outline-none focus:border-emerald-500/50"
                    >
                      <option value="english">English (Standard)</option>
                      <option value="bilingual">Bilingual (English / Urdu)</option>
                    </select>
                  </div>
                </div>

                <button 
                  onClick={handleDraft}
                  disabled={isDrafting}
                  className="pill-dark py-4 mt-2 w-full justify-center text-sm font-bold tracking-tight uppercase bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2 shadow-sm transition-all"
                >
                  {isDrafting ? <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin" /> : <Download size={18} />}
                  {isDrafting ? 'Generating Draft...' : 'Generate Editable Draft'}
                </button>
              </div>

            </div>

            {/* Right: AI Summary Metadata */}
            <div className="w-[350px] flex flex-col gap-4 overflow-y-auto custom-scrollbar">
              <div className="card-dark p-6">
                <h3 className="font-sans-hero font-bold tracking-tight text-sm uppercase mb-4 text-emerald-400 flex items-center gap-2">
                  <User size={16} /> Extracted Parties
                </h3>
                {result.summary?.parties?.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {result.summary.parties.map((p: string, i: number) => (
                      <div key={i} className="bg-white/5 border border-zinc-800 p-3 rounded-xl text-sm font-medium">
                        {p}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted text-sm">No parties detected.</p>
                )}
              </div>

              <div className="card-dark p-6">
                <h3 className="font-sans-hero font-bold tracking-tight text-sm uppercase mb-4 text-amber-400 flex items-center gap-2">
                  <FileWarning size={16} /> Penal Codes & Sections
                </h3>
                {result.summary?.sections?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {result.summary.sections.map((s: string, i: number) => (
                      <span key={i} className="bg-amber-400/10 text-amber-400 border border-amber-400/20 px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider uppercase">
                        {s}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted text-sm">No sections detected.</p>
                )}
              </div>

              <div className="card-dark p-6">
                <h3 className="font-sans-hero font-bold tracking-tight text-sm uppercase mb-4 text-blue-400 flex items-center gap-2">
                  <Calendar size={16} /> Dates & Events
                </h3>
                {result.summary?.events?.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {result.summary.events.map((e: string, i: number) => (
                      <div key={i} className="bg-blue-400/10 border border-blue-400/20 p-3 rounded-xl text-sm font-medium text-blue-100">
                        {e}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted text-sm">No dates detected.</p>
                )}
              </div>

              <button 
                onClick={() => {
                  sessionStorage.setItem('ocrContext', JSON.stringify(result));
                  window.location.href = '/chat';
                }} 
                className="pill-dark mt-4 py-4 w-full justify-center text-sm font-bold tracking-tight uppercase bg-emerald-500 text-black hover:bg-emerald-500/80 shadow-sm flex items-center gap-2"
              >
                <MessageSquare size={18} /> Analyze in Chat
              </button>

              

              <button 
                onClick={() => setResult(null)} 
                className="pill-dark mt-2 py-4 w-full justify-center text-sm font-bold tracking-tight uppercase hover:bg-white/10"
              >
                Scan Another Document
              </button>
            </div>

          </div>
        ) : (
          /* UPLOAD SCREEN */
          <div 
            className={`flex-1 card-dark p-8 flex flex-col items-center justify-center border-2 border-dashed transition-all ${
              dragActive ? 'border-emerald-500 bg-emerald-500/5 scale-[1.02]' : 'border-zinc-800 hover:border-emerald-500/50 bg-zinc-950'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input 
              ref={fileInputRef}
              type="file" 
              className="hidden" 
              accept=".pdf,image/png,image/jpeg"
              onChange={handleChange}
            />
            
            <AnimatePresence mode="wait">
              {isProcessing ? (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex flex-col items-center text-center"
                >
                  <div className="w-24 h-24 rounded-full border border-emerald-500/30 flex items-center justify-center mb-6 relative">
                    <div className="absolute inset-0 border-t-2 border-emerald-500 rounded-full animate-spin"></div>
                    <FileText size={32} className="text-emerald-400 animate-pulse" />
                  </div>
                  <h2 className="text-2xl font-bold font-sans-hero mb-2 text-emerald-400">Extracting Data...</h2>
                  <p className="text-muted max-w-sm">Running EasyOCR computer vision models. This may take a few moments for large documents.</p>
                </motion.div>
              ) : (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex flex-col items-center text-center"
                >
                  <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6">
                    <Upload size={40} className={`transition-colors ${dragActive ? 'text-emerald-400' : 'text-white/40'}`} />
                  </div>
                  <h2 className="text-2xl font-bold font-sans-hero mb-2">Upload Document</h2>
                  <p className="text-muted mb-8 max-w-sm">Drag and drop your PDF or image here, or click to browse. The engine will automatically extract text and metadata.</p>
                  
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="pill-dark px-8 py-4 bg-emerald-500 text-black hover:bg-emerald-500/80 font-bold tracking-wide"
                  >
                    Select Files
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

      </div>
      <DocumentEditorModal 
        isOpen={isEditorOpen} 
        onClose={() => setIsEditorOpen(false)} 
        initialHtml={draftHtml} 
        petitionType={petitionType} 
      />
    </div>
  );
}
