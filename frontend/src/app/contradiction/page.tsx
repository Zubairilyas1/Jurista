"use client";

import React, { useState } from 'react';
import { GitCompare, Sparkles, Scale } from 'lucide-react';

export default function ContradictionPage() {
  const [docAText, setDocAText] = useState('');
  const [docBText, setDocBText] = useState('');
  const [isFindingContradictions, setIsFindingContradictions] = useState(false);
  const [contradictionResults, setContradictionResults] = useState<any[]>([]);

  const runContradictionEngine = async () => {
    if (!docAText.trim() || !docBText.trim()) return;
    setIsFindingContradictions(true);
    try {
      const res = await fetch('http://localhost:8001/api/v1/analyze-contradictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          doc_a_text: docAText, 
          doc_a_label: "Document A",
          doc_b_text: docBText,
          doc_b_label: "Document B"
        })
      });
      const data = await res.json();
      setContradictionResults(data.contradictions || []);
    } catch (err) {
      console.error("Contradiction engine failed", err);
    } finally {
      setIsFindingContradictions(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      <div className="h-16 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md px-8 flex items-center justify-between shrink-0 z-10 sticky top-0 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-zinc-900/50 flex items-center justify-center border border-zinc-800 shadow-sm">
            <GitCompare size={20} className="text-purple-500" />
          </div>
          <div>
            <h3 className="text-xs font-semibold tracking-tight text-zinc-200 uppercase">Contradiction Engine</h3>
            <p className="text-[10px] font-bold text-purple-400 uppercase tracking-tight">Cross-Reference Evidence</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={runContradictionEngine}
            disabled={isFindingContradictions}
            className="flex items-center gap-2 text-sm font-bold tracking-tight bg-purple-600 text-white hover:bg-purple-500 px-6 py-2.5 rounded-xl transition-all shadow-sm shrink-0 uppercase"
          >
            {isFindingContradictions ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <GitCompare size={18} />}
            {isFindingContradictions ? 'Analyzing...' : 'Find Loopholes'}
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden relative flex max-w-7xl mx-auto w-full gap-8 p-8">
        
        <div className="flex-1 flex flex-col gap-6">
          <div className="flex-1 flex flex-col gap-3">
            <h4 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-zinc-700"></span> Document A (e.g. FIR)
            </h4>
            <textarea 
              className="flex-1 bg-zinc-900/50 border border-zinc-800 rounded-lg p-5 text-sm text-zinc-300 focus:outline-none focus:border-zinc-700 resize-none custom-scrollbar"
              placeholder="Paste the first document here..."
              value={docAText}
              onChange={(e) => setDocAText(e.target.value)}
            />
          </div>
          <div className="flex-1 flex flex-col gap-3">
            <h4 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-zinc-700"></span> Document B (e.g. Medical Report)
            </h4>
            <textarea 
              className="flex-1 bg-zinc-900/50 border border-zinc-800 rounded-lg p-5 text-sm text-zinc-300 focus:outline-none focus:border-zinc-700 resize-none custom-scrollbar"
              placeholder="Paste the conflicting document here..."
              value={docBText}
              onChange={(e) => setDocBText(e.target.value)}
            />
          </div>
        </div>

        <div className="w-[500px] flex flex-col gap-4">
          <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-tight flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
            Extracted Contradictions
          </h4>
          <div className="flex-1 bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 overflow-y-auto custom-scrollbar flex flex-col gap-5 shadow-xl">
            {contradictionResults.length === 0 && !isFindingContradictions && (
              <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
                <GitCompare size={48} className="mb-4 text-zinc-600" />
                <p className="text-sm font-bold text-zinc-400 tracking-tight uppercase">No loopholes found yet</p>
                <p className="text-xs text-zinc-500 mt-2 max-w-xs">Paste two documents and the AI will cross-reference them to find factual inconsistencies.</p>
              </div>
            )}
            
            {contradictionResults.map((res, i) => (
              <div key={i} className="p-5 rounded-xl border bg-purple-500/5 border-zinc-800 hover:border-purple-500/40 transition-colors group">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                  <h5 className="font-semibold text-xs text-purple-400 uppercase tracking-tight">{res.topic}</h5>
                </div>
                
                <div className="flex flex-col gap-3 mb-4">
                  <div className="bg-zinc-900/50 rounded-lg p-3 border border-zinc-800/50 relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-zinc-700"></div>
                    <span className="text-[9px] font-semibold uppercase text-zinc-500 tracking-tight block mb-1">Doc A</span>
                    <p className="text-xs text-zinc-300">"{res.doc_a_statement}"</p>
                  </div>
                  <div className="bg-zinc-900/50 rounded-lg p-3 border border-zinc-800/50 relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500/50"></div>
                    <span className="text-[9px] font-semibold uppercase text-purple-500/50 tracking-tight block mb-1">Doc B</span>
                    <p className="text-xs text-zinc-300">"{res.doc_b_statement}"</p>
                  </div>
                </div>

                <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={12} className="text-purple-400" />
                    <span className="text-[10px] font-semibold uppercase text-purple-400 tracking-tight">Cross-Examination Strategy</span>
                  </div>
                  <p className="text-xs font-medium text-purple-100 leading-relaxed">
                    {res.cross_examination_question}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
      `}} />
    </div>
  );
}
