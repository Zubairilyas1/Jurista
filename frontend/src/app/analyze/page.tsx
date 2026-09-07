"use client";

import React, { useState, useRef } from 'react';
import { ShieldAlert, FileText, Upload, ChevronRight, ShieldCheck, FileWarning, AlertTriangle, Scale, PenTool } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Remove Mock Threats

export default function OpponentAnalyzerPage() {
  const [inputMode, setInputMode] = useState<'text' | 'pdf'>('text');
  const [textInput, setTextInput] = useState('');
  const [dragActive, setDragActive] = useState(false);
  
  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleScan(e.dataTransfer.files[0]);
    }
  };

  const handleScan = async (file?: File) => {
    setIsScanning(true);
    setResults(null);
    setErrorMsg('');
    
    try {
      const formData = new FormData();
      if (inputMode === 'pdf' && file) {
        formData.append('file', file);
      } else {
        formData.append('text', textInput);
      }
      formData.append('mode', inputMode);

      const res = await fetch('http://127.0.0.1:8001/api/v1/analyze-opponent', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) throw new Error("API failed");
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to connect to the Opponent Analyzer engine. Ensure the backend is running.");
    } finally {
      setIsScanning(false);
    }
  };

  const loadPreset = () => {
    setTextInput("The respondent respectfully relies on the rule established in P.L.D. 2012 SC 110. Furthermore, under CrPC Section 497, bail cannot be granted as the offense falls within the prohibitory clause, and the petitioner's reliance on 2020 SCMR 551 is misplaced...");
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#0D0D0E] overflow-hidden text-white selection:bg-emerald-500/30">
      
      {/* Header Bar */}
      <div className="h-20 border-b border-zinc-800 flex items-center justify-between px-8 bg-[#0D0D0E] z-10 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/30">
            <ShieldAlert className="text-emerald-400" size={20} />
          </div>
          <div className="flex flex-col">
            <h1 className="font-sans-hero text-xl font-bold tracking-widest uppercase text-white">
              Opponent Analyzer
            </h1>
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
              Risk Detection Engine
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-px bg-zinc-800 h-full overflow-hidden">
        
        {/* LEFT PANEL: Input & Ingestion Canvas */}
        <div className="bg-[#0D0D0E] flex flex-col p-8 overflow-y-auto custom-scrollbar">
          
          <div className="flex items-center border-b border-zinc-800 mb-6 gap-2 pb-2">
            <button 
              onClick={() => setInputMode('text')}
              className={`px-4 py-2 text-xs font-bold tracking-widest uppercase transition-colors rounded-lg ${inputMode === 'text' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/80 hover:bg-white/5'}`}
            >
              Paste Text
            </button>
            <button 
              onClick={() => setInputMode('pdf')}
              className={`px-4 py-2 text-xs font-bold tracking-widest uppercase transition-colors rounded-lg ${inputMode === 'pdf' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/80 hover:bg-white/5'}`}
            >
              Upload Opponent Brief PDF
            </button>
          </div>

          <div className="flex-1 flex flex-col">
            {inputMode === 'text' ? (
              <textarea 
                value={textInput}
                onChange={e => setTextInput(e.target.value)}
                placeholder="Paste the opposing counsel's brief, petition, or written arguments here..."
                className="flex-1 w-full bg-[#18181C] border border-zinc-800 p-6 text-sm font-medium text-white outline-none focus:border-emerald-500 transition-colors resize-none rounded-xl custom-scrollbar"
              />
            ) : (
              <div 
                className={`flex-1 flex flex-col items-center justify-center border-2 border-dashed transition-all rounded-xl ${
                  dragActive ? 'border-emerald-500 bg-emerald-500/5' : 'border-zinc-800 hover:border-emerald-500/50 bg-[#18181C]'
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
                  accept=".pdf,.docx"
                  onChange={() => handleScan()}
                />
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                  <Upload size={32} className={`transition-colors ${dragActive ? 'text-emerald-400' : 'text-white/40'}`} />
                </div>
                <p className="text-sm font-bold uppercase tracking-widest text-white/50 mb-6">Drag & Drop PDF or DOCX</p>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-bold tracking-widest uppercase text-xs transition-colors rounded-lg"
                >
                  Browse Files
                </button>
              </div>
            )}
          </div>

          {inputMode === 'text' && (
            <div className="mt-4 flex justify-end">
              <button onClick={loadPreset} className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest hover:underline">
                Load Sample Opposing Brief (3 Cited Precedents)
              </button>
            </div>
          )}

          {errorMsg && (
            <div className="mt-6 text-rose-500 font-bold text-xs uppercase tracking-widest bg-rose-500/10 px-4 py-2 rounded-lg border border-rose-500/20">
              {errorMsg}
            </div>
          )}

          <button 
            onClick={() => handleScan()}
            disabled={isScanning || (inputMode === 'text' && !textInput.trim())}
            className="mt-8 w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold tracking-widest uppercase text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-emerald-950/40 rounded-xl"
          >
            {isScanning ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : <ShieldCheck size={18} />}
            {isScanning ? 'SCANNING FOR LEGAL FLAWS...' : 'SCAN FOR OVERRULED PRECEDENTS & MISQUOTES'}
          </button>

        </div>

        {/* RIGHT PANEL: Threat Dashboard & Risk Analysis */}
        <div className="bg-[#0D0D0E] flex flex-col relative overflow-hidden">
          
          <AnimatePresence mode="wait">
            {!results && !isScanning ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center p-12 text-center"
              >
                <div className="w-24 h-24 rounded-full bg-[#18181C] border border-zinc-800 flex items-center justify-center mb-6">
                  <ShieldAlert size={40} className="text-white/20" />
                </div>
                <h2 className="font-sans-hero text-2xl font-bold tracking-widest uppercase text-white mb-4">No Analysis Generated</h2>
                <p className="text-white/40 text-sm max-w-sm">Paste opposing counsel's brief on the left and click scan to detect legal flaws, overruled precedents, and misquotes.</p>
              </motion.div>
            ) : isScanning ? (
              <motion.div 
                key="scanning"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center p-12 text-center"
              >
                <div className="w-24 h-24 rounded-full border border-emerald-500/30 flex items-center justify-center mb-8 relative">
                  <div className="absolute inset-0 border-t-2 border-emerald-500 rounded-full animate-spin"></div>
                  <Scale size={32} className="text-emerald-400 animate-pulse" />
                </div>
                <h2 className="text-sm font-bold uppercase tracking-widest text-emerald-400 animate-pulse">Cross-referencing Supreme Court Database...</h2>
              </motion.div>
            ) : (
              <motion.div 
                key="results"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex-1 flex flex-col p-8 overflow-y-auto custom-scrollbar"
              >
                
                {/* Top Metrics Bar */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="bg-[#18181C] border border-zinc-800 p-4 rounded-xl flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Total Scanned</span>
                    <span className="text-2xl font-sans-hero font-bold text-white">{results.metrics.scanned}</span>
                  </div>
                  <div className="bg-[#18181C] border border-rose-950 p-4 rounded-xl flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Overruled</span>
                    <span className="text-2xl font-sans-hero font-bold text-rose-400">{results.metrics.overruled}</span>
                  </div>
                  <div className="bg-[#18181C] border border-amber-950 p-4 rounded-xl flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Distinguishable</span>
                    <span className="text-2xl font-sans-hero font-bold text-amber-400">{results.metrics.distinguishable}</span>
                  </div>
                </div>

                {/* Threat Severity Feed */}
                <div className="flex flex-col gap-4 pb-32">
                  {results.feed.map((threat: any, idx: number) => (
                    <div key={idx} className="bg-[#18181C] border border-zinc-800 rounded-xl p-5 flex flex-col gap-4">
                      
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {threat.type === 'overruled' && <ShieldAlert size={16} className="text-rose-400" />}
                          {threat.type === 'misquote' && <FileWarning size={16} className="text-amber-400" />}
                          {threat.type === 'distinguishable' && <Scale size={16} className="text-blue-400" />}
                          <h3 className="font-bold text-sm tracking-widest uppercase text-white">{threat.title}</h3>
                        </div>
                        
                        <span className={`px-2.5 py-1 rounded text-[9px] font-bold uppercase tracking-widest border ${
                          threat.type === 'overruled' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' :
                          threat.type === 'misquote' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                          'bg-blue-500/10 text-blue-400 border-blue-500/30'
                        }`}>
                          {threat.tag}
                        </span>
                      </div>
                      
                      <p className="text-xs text-white/70 leading-relaxed font-medium">
                        {threat.desc}
                      </p>
                      
                      <div className="flex justify-end pt-2 border-t border-zinc-800/50">
                        <a href={threat.link} className="text-[10px] text-white/40 hover:text-white font-bold uppercase tracking-widest flex items-center gap-1 transition-colors">
                          Read Judgment <ChevronRight size={12} />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>

              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom Sticky Action Bar */}
          {results && (
            <div className="absolute bottom-0 left-0 right-0 p-8 pt-20 bg-gradient-to-t from-[#0D0D0E] via-[#0D0D0E]/90 to-transparent pointer-events-none">
              <button className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-bold tracking-widest uppercase text-xs flex items-center justify-center gap-2 transition-colors border border-zinc-700 rounded-xl pointer-events-auto shadow-2xl">
                <PenTool size={16} /> Generate Counter-Argument Brief
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
