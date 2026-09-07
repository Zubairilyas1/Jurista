import React from 'react';
import { UploadCloud, ShieldAlert } from 'lucide-react';

export function OpponentAnalyzer() {
  return (
    <div className="w-full h-full flex flex-col p-8 bg-zinc-950 overflow-y-auto custom-scrollbar">
      <div className="max-w-4xl mx-auto w-full flex flex-col gap-8">
        
        <header className="flex flex-col gap-2 border-b border-zinc-800 pb-6">
          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <ShieldAlert className="text-emerald-500" />
            Opponent Analyzer
          </h2>
          <p className="text-sm text-zinc-400">Scan opposing briefs for legal loopholes, contradictions, and overruled precedents.</p>
        </header>

        <section className="flex flex-col gap-4">
          <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-tight">1. Upload Pleading / Notice PDF</h3>
          <div className="border-2 border-dashed border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800/50 transition-colors rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer text-center group">
            <UploadCloud size={32} className="text-zinc-500 group-hover:text-emerald-400 transition-colors mb-3" />
            <p className="text-sm font-medium text-zinc-300 mb-1">Click to upload or drag & drop</p>
            <p className="text-xs text-zinc-500">Supports PDF, DOCX, and JPG up to 10MB</p>
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-tight">2. Or Paste Opponent Arguments</h3>
          <textarea 
            rows={6}
            placeholder="Paste the raw text of the opposing arguments here..."
            className="w-full bg-zinc-800/60 border border-zinc-700 rounded-xl p-4 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all custom-scrollbar resize-none"
          ></textarea>
        </section>

        <div className="flex items-center justify-end pt-4">
          <button className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold tracking-tight rounded-xl shadow-sm transition-colors flex items-center gap-2">
            <ShieldAlert size={16} /> Scan Logic & Contradictions
          </button>
        </div>

      </div>
    </div>
  );
}