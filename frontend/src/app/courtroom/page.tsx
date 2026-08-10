"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, WifiOff, Clock, Search, FileText } from 'lucide-react';

export default function CourtroomMode() {
  const router = useRouter();
  const [cases, setCases] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // This relies entirely on localStorage for offline capabilities
  useEffect(() => {
    try {
      // For MVP offline simulation, we assume cases were cached to localStorage by the tracker
      const cached = localStorage.getItem('jurista_offline_cases');
      if (cached) {
        setCases(JSON.parse(cached));
      } else {
        // Fallback for demo purposes if nothing is cached
        setCases([
          { id: 1, case_title: "State vs. Imran Khan", stage: "Evidence", next_hearing: new Date().toISOString(), court_name: "Anti-Terrorism Court, ISB", facts: "Witness #3 (IO) cross-examination today. Contradiction in FIR timing to be highlighted." },
          { id: 2, case_title: "Ali Raza vs. FIA", stage: "Bail Arguments", next_hearing: new Date().toISOString(), court_name: "Special Judge Central", facts: "Cybercrime Act Sec 20. Argue malafide intent of complainant based on PLD 2023 SC 112." },
        ]);
      }
    } catch (e) {}
  }, []);

  const filteredCases = cases.filter(c => c.case_title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="w-full min-h-screen bg-black text-white p-4 md:p-8 font-sans overflow-y-auto">
      {/* High Contrast Header */}
      <div className="flex items-center justify-between border-b-2 border-white pb-4 mb-6">
        <button 
          onClick={() => router.push('/')}
          className="flex items-center gap-3 text-xl font-bold uppercase tracking-widest hover:text-white/70"
        >
          <ArrowLeft size={28} /> Exit Courtroom
        </button>
        <div className="flex items-center gap-2 text-xl font-black uppercase tracking-widest text-white border-2 border-white px-4 py-2">
          <WifiOff size={24} /> Offline Mode
        </div>
      </div>

      <h1 className="text-5xl font-black uppercase tracking-widest mb-8">Today's Cause List</h1>

      <div className="w-full border-2 border-white p-4 flex items-center gap-4 mb-8">
        <Search size={32} />
        <input 
          type="text" 
          placeholder="SEARCH CASES..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-transparent outline-none text-3xl font-bold uppercase w-full placeholder:text-white/30"
        />
      </div>

      <div className="flex flex-col gap-6">
        {filteredCases.map(c => (
          <div key={c.id} className="border-4 border-white p-6 flex flex-col gap-4 bg-black">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-4xl font-black uppercase tracking-widest mb-2">{c.case_title}</h2>
                <p className="text-2xl font-bold text-white/70 uppercase tracking-widest">{c.court_name}</p>
              </div>
              <div className="text-right">
                <span className="bg-white text-black text-2xl font-black uppercase px-4 py-2 tracking-widest">
                  {c.stage}
                </span>
              </div>
            </div>
            
            <div className="border-t-2 border-dashed border-white/50 pt-4 mt-2">
              <h3 className="text-xl font-bold uppercase tracking-widest flex items-center gap-2 mb-2 text-white/50">
                <FileText size={24} /> Case Notes & Facts
              </h3>
              <p className="text-3xl leading-snug font-medium">
                {c.facts || "No offline notes available for this case."}
              </p>
            </div>
          </div>
        ))}

        {filteredCases.length === 0 && (
          <div className="text-center p-12 border-4 border-dashed border-white/30">
            <h2 className="text-3xl font-black uppercase tracking-widest text-white/50">No cases match your search.</h2>
          </div>
        )}
      </div>

    </div>
  );
}
