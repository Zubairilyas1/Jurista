"use client";

import React, { useState, useEffect } from 'react';
import { Download, FileText, CheckCircle2 } from 'lucide-react';
import DocumentEditorModal from '@/components/DocumentEditorModal';

export default function PetitionDrafterPage() {
  const [isDrafting, setIsDrafting] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [draftHtml, setDraftHtml] = useState('');
  
  const [petitionType, setPetitionType] = useState('CRPC_497_BAIL');
  const [language, setLanguage] = useState('bilingual');
  
  const [formData, setFormData] = useState({
    petitioner: '',
    respondent: '',
    court: 'High Court',
    case_number: '______/2026',
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
        setLanguage(profile.defaultLanguage || 'bilingual');
        setFormData(prev => ({ ...prev, court: profile.defaultCourt || 'High Court' }));
        if (profile.fullName || profile.barLicense) {
          setAdvocateDetails({
            fullName: profile.fullName || '______________________',
            barLicense: profile.barLicense || '________'
          });
        }
      } catch (e) {
        console.error("Failed to parse settings");
      }
    }
  }, []);

  const handleDraft = async () => {
    setIsDrafting(true);
    try {
      const payload = {
        petition_type: petitionType,
        language: language,
        court: formData.court,
        case_number: formData.case_number,
        petitioner: formData.petitioner || '______________________',
        respondent: formData.respondent || '______________________',
        facts: formData.facts || 'The petitioner respectfully submits as follows:',
        prayer: "Grant relief as prayed.",
        party_type: "Petitioner",
        advocate_name: advocateDetails.fullName,
        bar_license_no: advocateDetails.barLicense
      };

      const res = await fetch('http://127.0.0.1:8001/api/v1/drafter/generate_html', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (data.html) {
        setDraftHtml(data.html);
        setIsEditorOpen(true);
      }
    } catch (e) {
      console.error(e);
      alert('Failed to generate draft');
    } finally {
      setIsDrafting(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col p-8 bg-[#0D0D0E] overflow-y-auto text-white">
      
      <div className="mb-8">
        <h1 className="font-sans-hero text-4xl font-semibold tracking-tight uppercase text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50 mb-2">
          Petition Drafter
        </h1>
        <p className="text-white/50 text-sm font-medium tracking-wider uppercase flex items-center gap-2">
          <FileText size={14} className="text-blue-400" />
          Manual Legal Drafting Engine
        </p>
      </div>

      <div className="max-w-4xl mx-auto w-full flex flex-col gap-6">
        <div className="card-dark p-6 border-t border-zinc-800 bg-zinc-900/50 flex flex-col gap-4 rounded-lg">
          
          <div className="flex gap-4">
            <div className="flex-1 flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase text-white/50 tracking-wider">Petition Type</label>
              <select 
                value={petitionType}
                onChange={(e) => setPetitionType(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm font-medium text-white outline-none focus:border-blue-500 transition-colors"
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
                className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm font-medium text-white outline-none focus:border-blue-500 transition-colors"
              >
                <option value="bilingual">Bilingual (English / Urdu)</option>
                <option value="english">English (Standard)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase text-white/50 tracking-wider">Petitioner Name</label>
              <input 
                value={formData.petitioner}
                onChange={e => setFormData({...formData, petitioner: e.target.value})}
                placeholder="e.g. سید سجاد حسین"
                className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm font-medium text-white outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase text-white/50 tracking-wider">Respondent Name</label>
              <input 
                value={formData.respondent}
                onChange={e => setFormData({...formData, respondent: e.target.value})}
                placeholder="e.g. State"
                className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm font-medium text-white outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase text-white/50 tracking-wider">Court Name</label>
              <input 
                value={formData.court}
                onChange={e => setFormData({...formData, court: e.target.value})}
                className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm font-medium text-white outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase text-white/50 tracking-wider">Case Number (Optional)</label>
              <input 
                value={formData.case_number}
                onChange={e => setFormData({...formData, case_number: e.target.value})}
                className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm font-medium text-white outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 mt-4">
            <label className="text-[10px] font-bold uppercase text-white/50 tracking-wider">Facts / Grounds</label>
            <textarea 
              value={formData.facts}
              onChange={e => setFormData({...formData, facts: e.target.value})}
              placeholder="Paste or type the facts of the case here..."
              rows={8}
              className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-sm font-medium text-white outline-none focus:border-blue-500 transition-colors resize-y"
            />
          </div>

          <button 
            onClick={handleDraft}
            disabled={isDrafting}
            className="pill-dark py-4 mt-6 w-full justify-center text-sm font-bold tracking-tight uppercase bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2 shadow-sm transition-all"
          >
            {isDrafting ? <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin" /> : <Download size={18} />}
            {isDrafting ? 'Generating Draft...' : 'Generate Editable Draft'}
          </button>
        </div>
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
