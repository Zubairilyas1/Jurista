"use client";

import React, { useState } from 'react';
import { GitCompare, Sparkles, Scale, FileText, ChevronRight, CheckCircle2, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Removed Mock Results

export default function ContradictionPage() {
  const [docAText, setDocAText] = useState('');
  const [docBText, setDocBText] = useState('');
  const [isFindingContradictions, setIsFindingContradictions] = useState(false);
  const [contradictionResults, setContradictionResults] = useState<any[]>(null as any);
  const [errorMsg, setErrorMsg] = useState('');

  const loadDemo = () => {
    setDocAText("The attack occurred precisely at 9:00 PM near the central market. The accused was carrying a 9mm pistol in his right hand.");
    setDocBText("The patient was admitted to the emergency ward at 11:30 PM with no active bleeding. No weapon was recovered from the crime scene or the suspect's person during the initial raid.");
  };

  const runContradictionEngine = async () => {
    if (!docAText.trim() || !docBText.trim()) return;
    setIsFindingContradictions(true);
    setErrorMsg('');
    try {
      const res = await fetch('http://127.0.0.1:8001/api/v1/analyze-contradictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          doc_a_text: docAText, 
          doc_a_label: "Document A",
          doc_b_text: docBText,
          doc_b_label: "Document B"
        })
      });
      if (!res.ok) throw new Error("API failed");
      const data = await res.json();
      setContradictionResults(data.contradictions || []);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to connect to the Contradiction Engine. Ensure the backend is running.");
      setContradictionResults(null as any);
    } finally {
      setIsFindingContradictions(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#0D0D0E] overflow-hidden text-white selection:bg-emerald-500/30">
      
      {/* Header Bar */}
      <div className="h-20 border-b border-zinc-800 flex items-center justify-between px-8 bg-[#0D0D0E] z-10 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/30">
            <GitCompare className="text-emerald-400" size={20} />
          </div>
          <div className="flex flex-col">
            <h1 className="font-sans-hero text-xl font-bold tracking-widest uppercase text-white">
              Contradiction Engine
            </h1>
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
              Cross-Reference Evidence
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-px bg-zinc-800 h-full overflow-hidden">
        
        {/* LEFT PANEL: Dual Input Canvas */}
        <div className="bg-[#0D0D0E] flex flex-col p-8 overflow-y-auto custom-scrollbar">
          
          {/* Document A Input */}
          <div className="flex-1 flex flex-col min-h-[250px] mb-8">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-[10px] font-bold text-white/50 uppercase tracking-widest flex items-center gap-2">
                <FileText size={14} className="text-emerald-400" />
                Slot 1: Primary Evidence (e.g. FIR)
              </h4>
              <div className="flex gap-2">
                <button className="text-[9px] font-bold uppercase tracking-widest text-emerald-400 bg-white/5 px-2 py-1 rounded">Paste Text</button>
                <button className="text-[9px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors px-2 py-1">Drag & Drop PDF</button>
              </div>
            </div>
            <textarea 
              value={docAText}
              onChange={(e) => setDocAText(e.target.value)}
              placeholder="Paste the first document here..."
              className="flex-1 w-full bg-[#18181C] border border-zinc-800 p-6 text-sm font-medium text-white outline-none focus:border-emerald-500 transition-colors resize-none rounded-xl custom-scrollbar"
            />
          </div>

          {/* Document B Input */}
          <div className="flex-1 flex flex-col min-h-[250px]">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-[10px] font-bold text-white/50 uppercase tracking-widest flex items-center gap-2">
                <FileText size={14} className="text-amber-400" />
                Slot 2: Conflicting Evidence (e.g. Medical Report)
              </h4>
              <div className="flex gap-2">
                <button className="text-[9px] font-bold uppercase tracking-widest text-amber-400 bg-white/5 px-2 py-1 rounded">Paste Text</button>
                <button className="text-[9px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors px-2 py-1">Drag & Drop PDF</button>
              </div>
            </div>
            <textarea 
              value={docBText}
              onChange={(e) => setDocBText(e.target.value)}
              placeholder="Paste the conflicting document here..."
              className="flex-1 w-full bg-[#18181C] border border-zinc-800 p-6 text-sm font-medium text-white outline-none focus:border-emerald-500 transition-colors resize-none rounded-xl custom-scrollbar"
            />
          </div>

          <div className="mt-4 flex justify-end">
            <button onClick={loadDemo} className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest hover:underline">
              Load Sample Demo (FIR vs. MLC Medical Report)
            </button>
          </div>

          {errorMsg && (
            <div className="mt-6 text-rose-500 font-bold text-xs uppercase tracking-widest bg-rose-500/10 px-4 py-2 rounded-lg border border-rose-500/20">
              {errorMsg}
            </div>
          )}

          <button 
            onClick={runContradictionEngine}
            disabled={isFindingContradictions || !docAText.trim() || !docBText.trim()}
            className="mt-8 w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold tracking-widest uppercase text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-emerald-950/40 rounded-xl"
          >
            {isFindingContradictions ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : <GitCompare size={18} />}
            {isFindingContradictions ? 'CROSS-REFERENCING DOCUMENTS...' : 'CROSS-REFERENCE & DETECT CONTRADICTIONS'}
          </button>

        </div>

        {/* RIGHT PANEL: Analysis & Loophole Dashboard */}
        <div className="bg-[#0D0D0E] flex flex-col relative overflow-hidden">
          
          <AnimatePresence mode="wait">
            {!contradictionResults && !isFindingContradictions ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center p-12 text-center"
              >
                <div className="w-24 h-24 rounded-full bg-[#18181C] border border-zinc-800 flex items-center justify-center mb-6">
                  <GitCompare size={40} className="text-white/20" />
                </div>
                <h2 className="font-sans-hero text-2xl font-bold tracking-widest uppercase text-white mb-4">No Inconsistencies Scanned</h2>
                <p className="text-white/40 text-sm max-w-sm">Input two conflicting documents on the left to extract factual contradictions and generate cross-examination questions.</p>
              </motion.div>
            ) : isFindingContradictions ? (
              <motion.div 
                key="scanning"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center p-12 text-center"
              >
                <div className="w-24 h-24 rounded-full border border-emerald-500/30 flex items-center justify-center mb-8 relative">
                  <div className="absolute inset-0 border-t-2 border-emerald-500 rounded-full animate-spin"></div>
                  <GitCompare size={32} className="text-emerald-400 animate-pulse" />
                </div>
                <h2 className="text-sm font-bold uppercase tracking-widest text-emerald-400 animate-pulse">Running Contradiction Engine...</h2>
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
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Inconsistencies</span>
                    <span className="text-2xl font-sans-hero font-bold text-white">2</span>
                  </div>
                  <div className="bg-[#18181C] border border-rose-950 p-4 rounded-xl flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Critical Flaws</span>
                    <span className="text-2xl font-sans-hero font-bold text-rose-400">1</span>
                  </div>
                  <div className="bg-[#18181C] border border-emerald-950 p-4 rounded-xl flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Cross-Exam Q's</span>
                    <span className="text-2xl font-sans-hero font-bold text-emerald-400">2</span>
                  </div>
                </div>

                {/* Structured Contradiction Cards */}
                <div className="flex flex-col gap-6 pb-32">
                  {contradictionResults.map((res: any, idx: number) => (
                    <div key={idx} className="bg-[#18181C] border border-zinc-800 rounded-xl p-6 flex flex-col gap-5">
                      
                      <div className="flex items-start justify-between">
                        <h3 className="font-bold text-sm tracking-widest uppercase text-white">{res.topic}</h3>
                        <span className={`px-2.5 py-1 rounded text-[9px] font-bold uppercase tracking-widest border ${
                          res.severity === 'direct' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' :
                          'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        }`}>
                          {res.severity === 'direct' ? 'Direct Contradiction' : 'Material Omission'}
                        </span>
                      </div>
                      
                      {/* Side-by-Side Quote Comparison Box */}
                      <div className="bg-[#0D0D0E] border border-zinc-800/80 rounded-xl p-4 grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                          <span className="text-[9px] font-bold uppercase text-emerald-400 tracking-widest">Document A</span>
                          <div className="bg-rose-950/20 text-rose-200/80 p-3 rounded-lg text-xs leading-relaxed border border-rose-900/30">
                            "{res.doc_a_statement}"
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <span className="text-[9px] font-bold uppercase text-amber-400 tracking-widest">Document B</span>
                          <div className="bg-rose-950/20 text-rose-200/80 p-3 rounded-lg text-xs leading-relaxed border border-rose-900/30">
                            "{res.doc_b_statement}"
                          </div>
                        </div>
                      </div>

                      {/* Auto-Generated Cross-Examination Question */}
                      <div className="bg-emerald-950/10 border border-emerald-500/20 rounded-xl p-4 flex flex-col gap-2">
                        <span className="text-[10px] font-bold uppercase text-emerald-400 tracking-widest flex items-center gap-1.5">
                          <Sparkles size={12} /> Auto-Generated Strategy
                        </span>
                        <p className="text-sm font-medium text-emerald-100/90 leading-relaxed italic">
                          {res.cross_examination_question}
                        </p>
                      </div>
                      
                    </div>
                  ))}
                </div>

              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom Sticky Action Bar */}
          {contradictionResults && (
            <div className="absolute bottom-0 left-0 right-0 p-8 pt-20 bg-gradient-to-t from-[#0D0D0E] via-[#0D0D0E]/90 to-transparent pointer-events-none">
              <button className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-bold tracking-widest uppercase text-xs flex items-center justify-center gap-2 transition-colors border border-zinc-700 rounded-xl pointer-events-auto shadow-2xl">
                <Download size={16} /> Export Cross-Examination Cheat Sheet (.DOCX)
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
