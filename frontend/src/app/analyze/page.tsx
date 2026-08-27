"use client";

import React, { useState } from 'react';
import { ShieldAlert, XCircle, CheckCircle, AlertTriangle } from 'lucide-react';

export default function OpponentAnalyzerPage() {
  const [analyzerText, setAnalyzerText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzerResults, setAnalyzerResults] = useState<any[]>([]);

  const runAnalyzer = async () => {
    if (!analyzerText.trim()) return;
    setIsAnalyzing(true);
    try {
      const res = await fetch('http://localhost:8001/api/v1/analyze-opponent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ document_text: analyzerText })
      });
      const data = await res.json();
      setAnalyzerResults(data.citations || []);
    } catch (err) {
      console.error("Analysis failed", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      <div className="h-16 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md px-8 flex items-center justify-between shrink-0 z-10 sticky top-0 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-zinc-900/50 flex items-center justify-center border border-zinc-800 shadow-sm">
            <ShieldAlert size={20} className="text-red-500" />
          </div>
          <div>
            <h3 className="text-xs font-semibold tracking-tight text-zinc-200 uppercase">Opponent Analyzer</h3>
            <p className="text-[10px] font-bold text-red-400 uppercase tracking-tight">Identify Overruled Precedents</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={runAnalyzer}
            disabled={isAnalyzing}
            className="flex items-center gap-2 text-sm font-bold tracking-tight bg-red-500 text-white hover:bg-red-600 px-6 py-2.5 rounded-xl transition-all shadow-sm shrink-0 uppercase"
          >
            {isAnalyzing ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <ShieldAlert size={18} />}
            {isAnalyzing ? 'Scanning...' : 'Scan For Red Flags'}
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden relative flex mx-auto w-full gap-8 p-8 max-w-7xl">
        <div className="flex-1 flex flex-col gap-4">
          <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-tight flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-zinc-700"></span>
            Opponent's Brief / Arguments
          </h4>
          <textarea 
            className="flex-1 bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 text-sm text-zinc-300 focus:outline-none focus:border-zinc-700 resize-none custom-scrollbar shadow-inner"
            placeholder="Paste the opposing counsel's arguments or petition here to scan for cited case law..."
            value={analyzerText}
            onChange={(e) => setAnalyzerText(e.target.value)}
          />
        </div>

        <div className="w-[500px] flex flex-col gap-4">
          <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-tight flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            Threat Dashboard
          </h4>
          <div className="flex-1 bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 overflow-y-auto custom-scrollbar flex flex-col gap-4 shadow-xl">
            {analyzerResults.length === 0 && !isAnalyzing && (
              <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
                <ShieldAlert size={48} className="mb-4 text-zinc-600" />
                <p className="text-sm font-bold text-zinc-400 uppercase tracking-tight">No citations scanned yet</p>
                <p className="text-xs text-zinc-500 mt-2 max-w-xs">Paste text on the left and click scan to automatically detect legal citations and verify them.</p>
              </div>
            )}
            
            {analyzerResults.map((res, i) => {
              const isOverruled = res.status === 'OVERRULED';
              const isGood = res.status === 'GOOD_LAW';
              
              return (
                <div key={i} className={`p-5 rounded-xl border ${
                  isOverruled ? 'bg-zinc-900/50 border-zinc-800' : 
                  isGood ? 'bg-zinc-900/50 border-zinc-800' : 
                  'bg-zinc-900/50 border-zinc-800'
                }`}>
                  <div className="flex items-start justify-between mb-3">
                    <h5 className="font-bold text-sm text-white tracking-wide">{res.citation}</h5>
                    {isOverruled ? <XCircle size={18} className="text-red-500" /> : 
                     isGood ? <CheckCircle size={18} className="text-emerald-500" /> : 
                     <AlertTriangle size={18} className="text-yellow-500" />}
                  </div>
                  <p className={`text-[10px] font-semibold mb-4 uppercase tracking-tight px-2 py-1 inline-block rounded ${
                    isOverruled ? 'bg-red-500/20 text-red-400' : isGood ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {isOverruled ? 'CRITICAL: OVERRULED LAW' : isGood ? 'VALID PRECEDENT' : res.status}
                  </p>
                  <p className="text-xs text-zinc-400 italic mb-3 leading-relaxed">"{res.snippet}"</p>
                  <div className="bg-black/60 rounded-lg p-3 mt-2 border border-zinc-800/50">
                    <p className="text-[11px] font-medium text-zinc-300 leading-relaxed">
                      <span className="opacity-50 uppercase tracking-tight text-[9px] block mb-1">AI Context Note</span> 
                      {res.message}
                    </p>
                  </div>
                </div>
              );
            })}
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
