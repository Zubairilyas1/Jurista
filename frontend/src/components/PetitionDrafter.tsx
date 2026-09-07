"use client";

import React, { useState } from 'react';
import { Download, FileSignature, Edit, ScrollText, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export function PetitionDrafter() {
  const [form, setForm] = useState({
    petition_type: 'CRPC_497_BAIL',
    court: 'High Court of Sindh',
    case_number: '______/2025',
    petitioner: 'Muhammad Ali',
    respondent: 'The State',
    facts: 'The petitioner was arrested on allegations of...\n\nHe respectfully submits that the allegations are baseless and false.',
    prayer: 'Grant bail to the petitioner pending trial.\nPass any other order deemed fit.',
    party_type: 'Petitioner',
    bar_license_no: '1234/SC',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('http://127.0.0.1:8001/api/v1/drafter/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to generate petition');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'petition.docx';
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/);
        if (match) filename = match[1];
      }
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex overflow-hidden bg-zinc-950">
      
      {/* Left Column: Form Inputs */}
      <div className="w-1/2 h-full flex flex-col border-r border-zinc-800 overflow-y-auto custom-scrollbar p-8">
        <header className="flex flex-col gap-2 border-b border-zinc-800 pb-6 mb-6">
          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <FileSignature className="text-emerald-500" />
            Petition Drafter
          </h2>
          <p className="text-sm text-zinc-400">Generate structured court pleadings with dynamic variables and automated formatting.</p>
        </header>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium flex items-center gap-2">
            <CheckCircle2 size={16} /> Petition generated and downloaded successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-tight">Petition Type</label>
              <select 
                name="petition_type" 
                value={form.petition_type} 
                onChange={handleChange}
                className="w-full bg-zinc-800/60 border border-zinc-700 rounded-lg p-2.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              >
                <option value="CRPC_497_BAIL">Bail (CrPC 497)</option>
                <option value="CPC_ORDER39_STAY">Stay (CPC Order 39)</option>
                <option value="ART199_WRIT">Writ (Article 199)</option>
              </select>
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-tight">Court</label>
              <input 
                name="court" 
                value={form.court} 
                onChange={handleChange}
                className="w-full bg-zinc-800/60 border border-zinc-700 rounded-lg p-2.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-tight">Case Number</label>
              <input 
                name="case_number" 
                value={form.case_number} 
                onChange={handleChange}
                className="w-full bg-zinc-800/60 border border-zinc-700 rounded-lg p-2.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-tight">Bar License No.</label>
              <input 
                name="bar_license_no" 
                value={form.bar_license_no} 
                onChange={handleChange}
                className="w-full bg-zinc-800/60 border border-zinc-700 rounded-lg p-2.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-tight">Petitioner</label>
              <input 
                name="petitioner" 
                value={form.petitioner} 
                onChange={handleChange}
                className="w-full bg-zinc-800/60 border border-zinc-700 rounded-lg p-2.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-tight">Respondent</label>
              <input 
                name="respondent" 
                value={form.respondent} 
                onChange={handleChange}
                className="w-full bg-zinc-800/60 border border-zinc-700 rounded-lg p-2.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-tight">Facts & Grounds</label>
            <textarea 
              name="facts" 
              rows={5}
              value={form.facts} 
              onChange={handleChange}
              className="w-full bg-zinc-800/60 border border-zinc-700 rounded-lg p-3 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none custom-scrollbar"
            />
          </div>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-tight">Prayer</label>
            <textarea 
              name="prayer" 
              rows={3}
              value={form.prayer} 
              onChange={handleChange}
              className="w-full bg-zinc-800/60 border border-zinc-700 rounded-lg p-3 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none custom-scrollbar"
            />
          </div>
          
          <div className="pt-2">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:hover:bg-emerald-600 text-white text-sm font-bold tracking-tight rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Compiling DOCX...</span>
              ) : (
                <><Download size={16} /> Generate & Download Petition</>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Right Column: Live Document Preview */}
      <div className="w-1/2 h-full bg-zinc-900/50 p-8 flex flex-col items-center justify-start overflow-y-auto custom-scrollbar">
        <div className="w-full max-w-[600px] bg-white text-black p-10 rounded shadow-xl min-h-[800px] flex flex-col gap-6 scale-[0.85] origin-top">
          
          <div className="text-center font-bold text-lg underline uppercase">
            IN THE {form.court.toUpperCase() || '[COURT NAME]'}
          </div>
          
          <div className="text-right text-sm">
            Case No: {form.case_number || '[CASE NUMBER]'}
          </div>

          <div className="flex flex-col gap-1 text-center font-bold">
            <span>{form.petitioner.toUpperCase() || '[PETITIONER NAME]'}</span>
            <span className="italic font-normal">...Petitioner</span>
          </div>
          
          <div className="text-center font-bold">VERSUS</div>
          
          <div className="flex flex-col gap-1 text-center font-bold">
            <span>{form.respondent.toUpperCase() || '[RESPONDENT NAME]'}</span>
            <span className="italic font-normal">...Respondent</span>
          </div>

          <div className="text-center font-bold underline mt-4 uppercase">
            PETITION UNDER {form.petition_type.replace(/_/g, ' ')}
          </div>

          <div className="text-sm leading-relaxed mt-4 whitespace-pre-wrap">
            <span className="font-bold">RESPECTFULLY SHEWETH:</span><br/><br/>
            {form.facts || '[FACTS OF THE CASE WILL APPEAR HERE]'}
          </div>

          <div className="text-sm leading-relaxed mt-4 whitespace-pre-wrap">
            <span className="font-bold">PRAYER:</span><br/>
            In view of the above submissions, it is prayed that this Honorable Court may be pleased to:<br/><br/>
            {form.prayer || '[PRAYER DETAILS WILL APPEAR HERE]'}
          </div>

          <div className="mt-20 flex justify-between items-end">
            <div className="flex flex-col">
              <span className="border-t border-black w-40 mb-1"></span>
              <span className="font-bold">Through Counsel</span>
              <span className="text-sm">License No: {form.bar_license_no || '[LICENSE NO]'}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="border-t border-black w-40 mb-1"></span>
              <span className="font-bold text-sm">Signature of {form.party_type || '[PARTY TYPE]'}</span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}