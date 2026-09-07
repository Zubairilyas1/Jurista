"use client";

import React, { useState, useEffect } from 'react';
import { FileText, Download, Copy, Printer, CheckCircle2, ChevronRight, Scale } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const QUICK_GROUNDS = [
  "Delay in FIR", 
  "Rule of Consistency", 
  "Falsely Implicated", 
  "Statutory Delay"
];

export default function PetitionDrafterPage() {
  const [petitionType, setPetitionType] = useState('CRPC_497_BAIL');
  const [language, setLanguage] = useState('english');
  const [isDrafting, setIsDrafting] = useState(false);
  
  const [formData, setFormData] = useState({
    petitioner: '',
    respondent: '',
    court: 'High Court of Sindh, Karachi Bench',
    case_number: '__ / 2026',
    facts: ''
  });
  
  const [advocateDetails, setAdvocateDetails] = useState({
    fullName: '______________________',
    barLicense: '________'
  });

  useEffect(() => {
    const stored = localStorage.getItem('jurista_user_profile');
    if (stored) {
      try {
        const profile = JSON.parse(stored);
        setLanguage(profile.defaultLanguage || 'english');
        setFormData(prev => ({ ...prev, court: profile.defaultCourt || 'High Court of Sindh, Karachi Bench' }));
        if (profile.fullName || profile.barLicense) {
          setAdvocateDetails({
            fullName: profile.fullName || '______________________',
            barLicense: profile.barLicense || '________'
          });
        }
      } catch (e) {}
    }
  }, []);

  const addQuickGround = (ground: string) => {
    setFormData(prev => ({
      ...prev,
      facts: prev.facts ? `${prev.facts}\n- ${ground}` : `- ${ground}`
    }));
  };

  const handleExport = (format: string) => {
    setIsDrafting(true);
    setTimeout(() => {
      setIsDrafting(false);
      alert(`Exported as ${format} (Simulated)`);
    }, 1000);
  };

  const InputField = ({ label, value, onChange, placeholder, dir = "ltr" }: any) => (
    <div className="flex flex-col gap-3">
      <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest">{label}</label>
      <input 
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        dir={dir}
        className={`w-full bg-transparent border-b border-zinc-800 pb-3 text-white placeholder-white/20 font-medium focus:border-emerald-500 outline-none transition-colors rounded-none ${dir === 'rtl' ? 'font-urdu' : ''}`}
      />
    </div>
  );

  return (
    <div className="w-full h-full flex flex-col bg-[#0D0D0E] overflow-hidden text-white selection:bg-emerald-500/30">
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 h-full">
        
        {/* LEFT PANEL: Input Form Drawer */}
        <div className="bg-[#18181C] border border-zinc-800 flex flex-col overflow-y-auto custom-scrollbar">
          
          <div className="p-6 border-b border-zinc-800 flex items-center justify-between sticky top-0 bg-[#18181C] z-10">
            <h1 className="font-sans-hero text-xl font-bold tracking-widest uppercase flex items-center gap-2">
              <Scale size={18} className="text-emerald-400" />
              Petition Drafter
            </h1>
            <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold tracking-widest uppercase rounded-lg">
              PakLaw Engine v2.4
            </span>
          </div>

          <div className="p-8 flex flex-col gap-10">
            
            <div className="grid grid-cols-2 gap-10">
              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Petition Type</label>
                <select 
                  value={petitionType}
                  onChange={(e) => setPetitionType(e.target.value)}
                  className="w-full bg-transparent border-b border-zinc-800 pb-3 text-white font-medium focus:border-emerald-500 outline-none transition-colors rounded-none appearance-none cursor-pointer"
                >
                  <option value="CRPC_497_BAIL" className="bg-[#18181C]">Bail Petition (CrPC 497)</option>
                  <option value="CPC_ORDER39_STAY" className="bg-[#18181C]">Stay Petition (CPC Order 39)</option>
                  <option value="ART199_WRIT" className="bg-[#18181C]">Writ Petition (Article 199)</option>
                </select>
              </div>
              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Language Format</label>
                <select 
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full bg-transparent border-b border-zinc-800 pb-3 text-white font-medium focus:border-emerald-500 outline-none transition-colors rounded-none appearance-none cursor-pointer"
                >
                  <option value="bilingual" className="bg-[#18181C]">Bilingual (English/Urdu)</option>
                  <option value="english" className="bg-[#18181C]">English Only</option>
                  <option value="urdu" className="bg-[#18181C]">Urdu Only</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-10">
              <InputField label="Court Name" value={formData.court} onChange={(e: any) => setFormData({...formData, court: e.target.value})} placeholder="High Court of Sindh..." />
              <InputField label="Case / Year Number" value={formData.case_number} onChange={(e: any) => setFormData({...formData, case_number: e.target.value})} placeholder="__ / 2026" />
            </div>

            <div className="grid grid-cols-2 gap-10">
              <InputField label="Petitioner Name" value={formData.petitioner} onChange={(e: any) => setFormData({...formData, petitioner: e.target.value})} placeholder="e.g. Ahmed Ali" dir={language !== 'english' ? 'rtl' : 'ltr'} />
              <InputField label="Respondent Name" value={formData.respondent} onChange={(e: any) => setFormData({...formData, respondent: e.target.value})} placeholder="e.g. The State" />
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Facts / Grounds</label>
                <div className="flex flex-wrap gap-2 justify-end">
                  {QUICK_GROUNDS.map(ground => (
                    <button
                      key={ground}
                      onClick={() => addQuickGround(ground)}
                      className="px-2 py-1 bg-white/5 hover:bg-emerald-500/10 hover:text-emerald-400 text-[9px] font-bold uppercase tracking-wider text-white/60 border border-zinc-800 rounded transition-colors"
                    >
                      + {ground}
                    </button>
                  ))}
                </div>
              </div>
              
              <textarea 
                value={formData.facts}
                onChange={e => setFormData({...formData, facts: e.target.value})}
                placeholder="Paste or type the facts of the case here..."
                rows={8}
                className="w-full bg-zinc-950/50 border border-zinc-800 p-4 text-sm font-medium text-white outline-none focus:border-emerald-500 transition-colors resize-y rounded-lg custom-scrollbar"
              />
            </div>

            <button 
              onClick={() => handleExport('.DOCX')}
              disabled={isDrafting}
              className="mt-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold tracking-widest uppercase text-[10px] w-full py-4 flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-emerald-950/40"
            >
              {isDrafting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : <FileText size={16} />}
              {isDrafting ? 'GENERATING...' : 'GENERATE EDITABLE DRAFT'}
            </button>
          </div>
        </div>

        {/* RIGHT PANEL: Live Document Preview */}
        <div className="bg-[#121212] border border-zinc-800 flex flex-col relative shadow-2xl">
          
          {/* Preview Toolbar */}
          <div className="h-14 border-b border-zinc-800 flex items-center justify-between px-6 bg-[#0D0D0E]/80 sticky top-0 z-10 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
              <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Live Preview: {petitionType.replace(/_/g, ' ')}</span>
            </div>
            
            <div className="flex items-center gap-3">
              <button onClick={() => handleExport('.DOCX')} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center gap-1.5 rounded">
                <Download size={12} /> .DOCX
              </button>
              <button onClick={() => handleExport('.PDF')} className="px-3 py-1.5 bg-transparent border border-zinc-700 hover:bg-white/5 text-white/70 text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center gap-1.5 rounded">
                <Printer size={12} /> .PDF
              </button>
              <button className="p-1.5 hover:bg-white/10 text-white/50 hover:text-white transition-colors rounded" title="Copy Text">
                <Copy size={14} />
              </button>
            </div>
          </div>

          {/* Paper Canvas */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-10 bg-zinc-950 flex justify-center">
            <div className="w-[210mm] min-h-[297mm] bg-white text-black p-[25mm] shadow-lg flex flex-col">
              
              <div className="text-center font-bold text-xl uppercase mb-8">
                IN THE {formData.court.toUpperCase() || 'HIGH COURT'}
              </div>
              
              <div className="text-right font-mono text-sm mb-8">
                Case No: {formData.case_number || '________'}
              </div>

              <div className="mb-8">
                <p className="font-bold mb-4">{formData.petitioner || '______________________'}</p>
                <p className="text-center italic mb-4">Versus</p>
                <p className="font-bold">{formData.respondent || '______________________'}</p>
              </div>

              <div className="text-center font-bold text-lg underline mb-8 uppercase">
                {petitionType.replace(/_/g, ' ')}
              </div>

              <div className="text-justify leading-loose mb-10">
                <p className="indent-8 mb-4">
                  Respectfully Sheweth:
                </p>
                
                {formData.facts ? (
                  formData.facts.split('\n').map((fact, i) => (
                    <p key={i} className="mb-4">{fact}</p>
                  ))
                ) : (
                  <>
                    <p className="mb-4">1. That the petitioner is a law-abiding citizen...</p>
                    <p className="mb-4">2. That the facts of the case are...</p>
                  </>
                )}
              </div>

              <div className="mt-auto pt-20 flex justify-between">
                <div>
                  <p className="mb-8">Dated: ______________</p>
                </div>
                <div className="text-right">
                  <p className="mb-2 uppercase font-bold">{advocateDetails.fullName}</p>
                  <p className="text-sm">Advocate High Court</p>
                  <p className="text-sm">License: {advocateDetails.barLicense}</p>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
