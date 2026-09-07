"use client";

import React, { useState, useEffect } from 'react';
import { CalendarClock, Plus, Search, CheckCircle2, Clock, Calendar, AlertCircle, PhoneCall, X, ExternalLink, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TrackerPage() {
  const [cases, setCases] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const [newCase, setNewCase] = useState({
    case_number: '',
    parties: '',
    court: 'Lahore High Court',
    hearing_date: ''
  });

  const fetchCases = async () => {
    setIsLoading(true);
    let apiCases = [];
    try {
      const res = await fetch('http://127.0.0.1:8001/api/v1/cause-list');
      if (res.ok) {
        const data = await res.json();
        apiCases = data.cases || [];
      }
    } catch (e) {
      console.log('Backend not reachable. Showing local cases only.');
    }
    
    // Merge with localStorage manual cases
    const local = localStorage.getItem('jurista_manual_cases');
    if (local) {
      try {
        const manualCases = JSON.parse(local);
        apiCases = [...apiCases, ...manualCases];
      } catch (e) {}
    }
    
    setCases(apiCases);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry = { 
      ...newCase, 
      id: `manual_${Date.now()}`,
      deadline: 'N/A' 
    };
    const updatedCases = [...cases, newEntry];
    setCases(updatedCases);
    
    // Save to localStorage
    const local = localStorage.getItem('jurista_manual_cases');
    let manualCases = [];
    if (local) {
      try { manualCases = JSON.parse(local); } catch (e) {}
    }
    manualCases.push(newEntry);
    localStorage.setItem('jurista_manual_cases', JSON.stringify(manualCases));
    
    setIsAddModalOpen(false);
    setNewCase({ case_number: '', parties: '', court: 'Lahore High Court', hearing_date: '' });
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#0D0D0E] overflow-hidden text-white selection:bg-emerald-500/30">
      
      {/* Header Bar */}
      <div className="h-20 border-b border-zinc-800 flex items-center justify-between px-8 bg-[#0D0D0E] z-10 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/30">
            <CalendarClock className="text-emerald-400" size={20} />
          </div>
          <div className="flex flex-col">
            <h1 className="font-sans-hero text-xl font-bold tracking-widest uppercase text-white">
              Cause Tracker
            </h1>
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
              Automated Hearing Alerts
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={fetchCases}
            className="text-[10px] font-bold uppercase tracking-widest text-white/50 hover:text-white transition-colors flex items-center gap-2"
          >
            <RefreshCw size={14} /> Refresh List
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-colors rounded-lg shadow-lg shadow-emerald-950/40"
          >
            <Plus size={14} /> Track New Case
          </button>
        </div>
      </div>

      <div className="flex-1 p-8 overflow-y-auto custom-scrollbar max-w-7xl mx-auto w-full flex flex-col gap-6">
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
          <div className="bg-[#18181C] border border-zinc-800 p-6 rounded-xl flex flex-col gap-2 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <Calendar size={64} className="text-white" />
            </div>
            <p className="text-[10px] font-bold tracking-widest uppercase text-white/50">Total Tracked Cases</p>
            <p className="font-sans-hero text-4xl font-bold text-white">{cases.length}</p>
          </div>
          
          <div className="bg-[#18181C] border border-zinc-800 p-6 rounded-xl flex flex-col gap-2 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <Clock size={64} className="text-emerald-500" />
            </div>
            <p className="text-[10px] font-bold tracking-widest uppercase text-white/50">Upcoming Hearings</p>
            <p className="font-sans-hero text-4xl font-bold text-emerald-400">{cases.filter(c => c.hearing_date !== 'N/A').length}</p>
          </div>

          <div className="bg-[#18181C] border border-zinc-800 p-6 rounded-xl flex flex-col gap-2 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <PhoneCall size={64} className="text-emerald-500" />
            </div>
            <p className="text-[10px] font-bold tracking-widest uppercase text-white/50">WhatsApp Alerts</p>
            <p className="font-sans-hero text-2xl font-bold text-emerald-400 mt-2">ACTIVE</p>
          </div>
        </div>

        {/* Main Table */}
        <div className="bg-[#18181C] border border-zinc-800 rounded-xl flex-1 flex flex-col min-h-[400px]">
          
          <div className="flex-1 overflow-auto custom-scrollbar">
            {isLoading ? (
              <div className="h-full flex flex-col items-center justify-center gap-4 text-white/50">
                <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-[10px] font-bold tracking-widest uppercase">Syncing with Court Database...</p>
              </div>
            ) : cases.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center gap-4">
                <div className="w-20 h-20 rounded-full bg-[#0D0D0E] border border-zinc-800 flex items-center justify-center">
                  <Calendar size={32} className="text-white/20" />
                </div>
                <div>
                  <h2 className="font-sans-hero text-xl font-bold tracking-widest uppercase text-white mb-2">No Tracked Hearings Found</h2>
                  <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest max-w-xs">Track a new case manually or sync your dashboard to receive updates.</p>
                </div>
                <button 
                  onClick={() => setIsAddModalOpen(true)}
                  className="mt-2 px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold uppercase tracking-widest transition-colors rounded-lg"
                >
                  Track New Case
                </button>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#0D0D0E]/50 text-[9px] font-bold tracking-widest uppercase text-white/50 border-b border-zinc-800 sticky top-0">
                    <th className="p-4 pl-6">Case No.</th>
                    <th className="p-4">Parties</th>
                    <th className="p-4">Court</th>
                    <th className="p-4">Next Hearing</th>
                    <th className="p-4">Limitation Deadline</th>
                    <th className="p-4 pr-6 text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {cases.map((c, i) => (
                    <motion.tr 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      key={i} 
                      className="hover:bg-white/5 border-b border-zinc-800/50 transition-colors group"
                    >
                      <td className="p-4 pl-6 font-bold text-xs uppercase tracking-wider">{c.case_number}</td>
                      <td className="p-4 text-xs font-medium text-white/80">{c.parties}</td>
                      <td className="p-4 text-xs font-medium text-white/60">{c.court}</td>
                      <td className="p-4">
                        <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-widest uppercase">
                          {c.hearing_date}
                        </span>
                      </td>
                      <td className="p-4 text-xs font-bold text-rose-400 tracking-wider uppercase">{c.deadline}</td>
                      <td className="p-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <div className="inline-flex items-center gap-1.5 text-emerald-400 text-[9px] font-bold uppercase tracking-widest">
                            <CheckCircle2 size={12} /> Alert Set
                          </div>
                          <a 
                            href={`/client/${c.id || i}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 bg-[#0D0D0E] hover:bg-white/10 px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-colors border border-zinc-800 text-white/80"
                          >
                            <ExternalLink size={12} /> Portal
                          </a>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#18181C] border border-zinc-800 w-full max-w-md shadow-2xl p-8"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-sans-hero text-xl font-bold tracking-widest uppercase text-white">Track New Case</h3>
                <button onClick={() => setIsAddModalOpen(false)} className="text-white/50 hover:text-white transition-colors"><X size={20} /></button>
              </div>
              
              <form onSubmit={handleManualSubmit} className="flex flex-col gap-8">
                <div className="flex flex-col gap-3">
                  <label className="text-[10px] font-bold tracking-widest uppercase text-white/50">Case Number</label>
                  <input 
                    required 
                    value={newCase.case_number} 
                    onChange={e => setNewCase({...newCase, case_number: e.target.value})} 
                    className="bg-transparent border-b border-zinc-800 pb-3 text-white placeholder-white/20 font-medium focus:border-emerald-500 outline-none transition-colors rounded-none" 
                    placeholder="e.g. WP-1234/2026" 
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <label className="text-[10px] font-bold tracking-widest uppercase text-white/50">Parties</label>
                  <input 
                    required 
                    value={newCase.parties} 
                    onChange={e => setNewCase({...newCase, parties: e.target.value})} 
                    className="bg-transparent border-b border-zinc-800 pb-3 text-white placeholder-white/20 font-medium focus:border-emerald-500 outline-none transition-colors rounded-none" 
                    placeholder="e.g. State vs Ali" 
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <label className="text-[10px] font-bold tracking-widest uppercase text-white/50">Court</label>
                  <input 
                    required 
                    value={newCase.court} 
                    onChange={e => setNewCase({...newCase, court: e.target.value})} 
                    className="bg-transparent border-b border-zinc-800 pb-3 text-white placeholder-white/20 font-medium focus:border-emerald-500 outline-none transition-colors rounded-none" 
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <label className="text-[10px] font-bold tracking-widest uppercase text-white/50">Next Hearing Date</label>
                  <input 
                    required 
                    type="date" 
                    value={newCase.hearing_date} 
                    onChange={e => setNewCase({...newCase, hearing_date: e.target.value})} 
                    className="bg-transparent border-b border-zinc-800 pb-3 text-white placeholder-white/20 font-medium focus:border-emerald-500 outline-none transition-colors rounded-none [color-scheme:dark]" 
                  />
                </div>
                
                <button type="submit" className="mt-4 bg-emerald-600 hover:bg-emerald-500 text-white py-5 font-bold tracking-widest uppercase text-[10px] flex justify-center items-center gap-2 transition-colors shadow-lg shadow-emerald-950/40">
                  START TRACKING
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
