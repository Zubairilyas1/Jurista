"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Calendar, RefreshCcw, Plus, Save, Phone, CheckCircle2, MessageSquare, AlertCircle, Clock, ChevronRight, X, PhoneCall, ExternalLink } from 'lucide-react';

interface Case {
  case_number: string;
  parties: string;
  court: string;
  hearing_date: string;
  deadline: string;
}

export default function CauseTrackerPage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Manual Case Form State
  const [newCase, setNewCase] = useState({
    case_number: '',
    parties: '',
    court: 'High Court',
    judge: '',
    hearing_date: ''
  });

  const fetchCases = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('http://127.0.0.1:8001/api/v1/tracker/cases');
      if (res.ok) {
        const data = await res.json();
        setCases(data.cases || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      const res = await fetch('http://127.0.0.1:8001/api/v1/tracker/refresh', { method: 'POST' });
      if (res.ok) {
        await fetchCases();
      } else {
        alert("Scraping failed or Twilio error. Check backend logs.");
      }
    } catch (e) {
      console.error(e);
      alert("Error refreshing tracker.");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://127.0.0.1:8001/api/v1/tracker/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCase)
      });
      if (res.ok) {
        setIsAddModalOpen(false);
        setNewCase({ case_number: '', parties: '', court: 'High Court', judge: '', hearing_date: '' });
        await fetchCases();
      } else {
        alert("Failed to add case");
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="w-full h-full flex flex-col p-8 bg-[#0D0D0E] overflow-y-auto text-white">
      
      {/* Header Area */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="font-sans-hero text-4xl font-black tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50 mb-2">
            Cause Tracker
          </h1>
          <p className="text-white/50 text-sm font-medium tracking-wider uppercase flex items-center gap-2">
            <Calendar size={14} className="text-lime" />
            Hearing Schedule & WhatsApp Alerts
          </p>
        </div>
        
        <div className="flex gap-4">
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="card-dark hover:bg-white/5 px-6 py-3 flex items-center gap-2 rounded-xl text-xs font-bold tracking-widest uppercase transition-all border border-white/10"
          >
            <Plus size={16} className="text-blue-400" /> Manually Track
          </button>
          
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="pill-dark px-6 py-3 flex items-center gap-2 text-xs font-bold tracking-widest uppercase transition-all bg-lime text-black hover:bg-lime/90 disabled:opacity-50"
          >
            <RefreshCcw size={16} className={isRefreshing ? "animate-spin" : ""} /> 
            {isRefreshing ? "Syncing..." : "Sync Court List"}
          </button>
        </div>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card-dark p-6 rounded-2xl border border-white/10 flex flex-col gap-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <CheckCircle2 size={64} className="text-lime" />
          </div>
          <p className="text-[10px] font-bold tracking-widest uppercase text-white/50">Active Cases</p>
          <p className="font-sans-hero text-5xl font-black">{cases.length}</p>
        </div>
        
        <div className="card-dark p-6 rounded-2xl border border-white/10 flex flex-col gap-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <Clock size={64} className="text-blue-500" />
          </div>
          <p className="text-[10px] font-bold tracking-widest uppercase text-white/50">Upcoming Hearings</p>
          <p className="font-sans-hero text-5xl font-black">{cases.filter(c => c.hearing_date !== 'N/A').length}</p>
        </div>

        <div className="card-dark p-6 rounded-2xl border border-white/10 flex flex-col gap-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <PhoneCall size={64} className="text-green-500" />
          </div>
          <p className="text-[10px] font-bold tracking-widest uppercase text-white/50">WhatsApp Alerts</p>
          <p className="font-sans-hero text-5xl font-black text-green-400">Active</p>
        </div>
      </div>

      {/* Main Table */}
      <div className="card-dark rounded-2xl border border-white/10 overflow-hidden flex-1 flex flex-col">
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/40">
          <h2 className="text-sm font-bold tracking-widest uppercase flex items-center gap-2">
            <AlertCircle size={16} className="text-blue-400" /> Tracked Cause List
          </h2>
        </div>
        
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="h-full flex items-center justify-center text-white/50">Loading cases...</div>
          ) : cases.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-white/30 gap-4">
              <Calendar size={48} className="opacity-50" />
              <p className="text-sm font-medium tracking-wider uppercase">No cases currently tracked</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black/20 text-[10px] font-bold tracking-widest uppercase text-white/50">
                  <th className="p-4 pl-6 border-b border-white/5">Case No.</th>
                  <th className="p-4 border-b border-white/5">Parties</th>
                  <th className="p-4 border-b border-white/5">Court</th>
                  <th className="p-4 border-b border-white/5">Next Hearing</th>
                  <th className="p-4 border-b border-white/5">Limitation Deadline</th>
                  <th className="p-4 pr-6 border-b border-white/5 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {cases.map((c, i) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={i} 
                    className="hover:bg-white/5 border-b border-white/5 transition-colors group"
                  >
                    <td className="p-4 pl-6 font-medium text-sm">{c.case_number}</td>
                    <td className="p-4 text-sm text-white/80">{c.parties}</td>
                    <td className="p-4 text-sm text-white/60">{c.court}</td>
                    <td className="p-4">
                      <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-xs font-bold tracking-wider">
                        {c.hearing_date}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-red-400">{c.deadline}</td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <div className="inline-flex items-center gap-1 text-green-400 text-xs font-bold uppercase tracking-wider">
                          <CheckCircle2 size={12} /> Alert Set
                        </div>
                        <a 
                          href={`/client/${c.id || i}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 bg-white/5 hover:bg-white/10 px-3 py-1 rounded text-xs font-bold uppercase tracking-widest transition-colors border border-white/10"
                        >
                          <ExternalLink size={12} /> Client Portal
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

      {/* Add Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#121215] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/40">
                <h3 className="font-bold tracking-widest uppercase text-sm">Track New Case</h3>
                <button onClick={() => setIsAddModalOpen(false)} className="text-white/50 hover:text-white"><X size={20} /></button>
              </div>
              <form onSubmit={handleManualSubmit} className="p-6 flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold tracking-widest uppercase text-white/50">Case Number</label>
                  <input required value={newCase.case_number} onChange={e => setNewCase({...newCase, case_number: e.target.value})} className="bg-black border border-white/10 rounded-lg p-3 text-sm focus:border-lime outline-none" placeholder="e.g. WP-1234/2026" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold tracking-widest uppercase text-white/50">Parties</label>
                  <input required value={newCase.parties} onChange={e => setNewCase({...newCase, parties: e.target.value})} className="bg-black border border-white/10 rounded-lg p-3 text-sm focus:border-lime outline-none" placeholder="e.g. State vs Ali" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold tracking-widest uppercase text-white/50">Court</label>
                  <input required value={newCase.court} onChange={e => setNewCase({...newCase, court: e.target.value})} className="bg-black border border-white/10 rounded-lg p-3 text-sm focus:border-lime outline-none" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold tracking-widest uppercase text-white/50">Hearing Date</label>
                  <input required type="date" value={newCase.hearing_date} onChange={e => setNewCase({...newCase, hearing_date: e.target.value})} className="bg-black border border-white/10 rounded-lg p-3 text-sm focus:border-lime outline-none [color-scheme:dark]" />
                </div>
                <button type="submit" className="mt-4 bg-lime text-black py-4 rounded-xl font-bold tracking-widest uppercase text-sm flex justify-center items-center gap-2 hover:bg-lime/90 transition-colors">
                  <CheckCircle2 size={18} /> Start Tracking
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
