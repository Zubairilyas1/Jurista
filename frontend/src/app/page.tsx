"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, Package, Activity, MessageSquare, Scale, ScanText, ScrollText, CalendarClock,
  Clock, CheckCircle2, AlertCircle, ChevronRight, Gavel, FileText, ShieldCheck, TrendingUp, Users, WifiOff
} from 'lucide-react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const mockChartData = [
  { name: 'Mon', cases: 2, drafts: 4 },
  { name: 'Tue', cases: 3, drafts: 7 },
  { name: 'Wed', cases: 1, drafts: 5 },
  { name: 'Thu', cases: 5, drafts: 8 },
  { name: 'Fri', cases: 4, drafts: 12 },
  { name: 'Sat', cases: 0, drafts: 2 },
  { name: 'Sun', cases: 0, drafts: 1 },
];

export default function Dashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState('Advocate');
  const [initials, setInitials] = useState('AD');
  const [upcomingHearings, setUpcomingHearings] = useState<any[]>([]);
  const [isLoadingHearings, setIsLoadingHearings] = useState(true);

  useEffect(() => {
    // 1. Fetch User Profile
    const stored = localStorage.getItem('jurista_user_profile');
    if (stored) {
      try {
        const profile = JSON.parse(stored);
        if (profile.fullName) {
          setUserName(profile.fullName);
          const parts = profile.fullName.replace(/Adv\.|Advocate/ig, '').trim().split(' ');
          if (parts.length >= 2) {
            setInitials((parts[0][0] + parts[parts.length-1][0]).toUpperCase());
          } else if (parts.length === 1 && parts[0]) {
            setInitials(parts[0].substring(0, 2).toUpperCase());
          }
        }
      } catch (e) {}
    }

    // 2. Fetch Upcoming Hearings
    fetch('http://127.0.0.1:8000/api/v1/tracker/cases')
      .then(res => res.json())
      .then(data => {
        // Sort by next_hearing date and take next 3
        const sorted = data.sort((a: any, b: any) => new Date(a.next_hearing).getTime() - new Date(b.next_hearing).getTime());
        setUpcomingHearings(sorted.slice(0, 3));
      })
      .catch(err => console.error("Could not fetch hearings", err))
      .finally(() => setIsLoadingHearings(false));
  }, []);

  return (
    <div className="w-full h-full flex flex-col p-8 bg-[#09090B] overflow-y-auto custom-scrollbar text-white relative">
      
      {/* Ambient Background Glows */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-lime/10 blur-[150px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/10 blur-[150px] rounded-full pointer-events-none translate-y-1/3 -translate-x-1/3"></div>

      {/* Topbar Nav */}
      <div className="flex items-center justify-between w-full mb-12 relative z-10">
        <div className="flex items-center gap-3">
          <div className="px-6 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full text-white flex items-center gap-2 shadow-xl shadow-black/50">
            <Package size={18} className="text-lime" />
            <span className="text-sm font-bold tracking-widest uppercase">Command Center</span>
          </div>
          <div className="px-6 py-3 bg-transparent hover:bg-white/5 rounded-full text-white/50 hover:text-white flex items-center gap-2 transition-all cursor-pointer border border-transparent hover:border-white/10" onClick={() => router.push('/tracker')}>
            <Activity size={18} />
            <span className="text-sm font-bold tracking-widest uppercase">My Schedule</span>
          </div>
          <div className="px-6 py-3 bg-black/50 hover:bg-black rounded-full text-white flex items-center gap-2 transition-all cursor-pointer border border-white/20 hover:border-white shadow-lg" onClick={() => router.push('/courtroom')}>
            <WifiOff size={18} />
            <span className="text-sm font-bold tracking-widest uppercase">Courtroom Mode</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => router.push('/settings')}>
            <div className="text-right hidden sm:block">
              <h4 className="text-sm font-bold text-white">{userName}</h4>
              <p className="text-[10px] text-lime uppercase tracking-widest font-bold drop-shadow-[0_0_10px_rgba(204,255,0,0.5)]">Jurista Premium</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-lime to-emerald-400 text-black flex items-center justify-center font-bold text-lg tracking-widest border-2 border-white/20 shadow-[0_0_30px_rgba(204,255,0,0.3)]">
              {initials}
            </div>
          </div>
        </div>
      </div>

      {/* Welcome Banner */}
      <div className="mb-12 relative z-10">
        <h1 className="font-sans-hero text-5xl font-black tracking-widest uppercase text-white mb-2 drop-shadow-2xl">
          Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime to-emerald-400">{userName.replace(/Adv\.|Advocate/ig, '').trim().split(' ')[0]}</span>
        </h1>
        <p className="text-white/60 text-sm font-medium tracking-wider uppercase flex items-center gap-2">
          Your intelligent law firm command center <TrendingUp size={16} className="text-lime" />
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 relative z-10">
        
        <motion.div 
          whileHover={{ y: -5, scale: 1.02 }}
          onClick={() => router.push('/petition')}
          className="card-dark border-blue-500/20 rounded-3xl p-8 cursor-pointer group bg-gradient-to-br from-blue-900/40 via-[#121215]/80 to-[#121215] hover:border-blue-400/50 transition-all relative overflow-hidden backdrop-blur-2xl shadow-2xl shadow-blue-900/20"
        >
          <div className="w-16 h-16 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center mb-6 border border-blue-400/30 shadow-[0_0_30px_rgba(59,130,246,0.3)] group-hover:scale-110 transition-transform">
            <ScrollText size={32} />
          </div>
          <h3 className="text-xl font-black uppercase tracking-widest mb-3 text-white">Draft Petition</h3>
          <p className="text-sm text-white/60 leading-relaxed mb-8">Instantly generate perfectly formatted petitions, applications, and legal notices in English and Urdu.</p>
          <div className="flex items-center text-xs font-black tracking-widest text-blue-400 uppercase gap-2 group-hover:translate-x-2 transition-transform">
            Start Drafting <ChevronRight size={16} />
          </div>
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-blue-500/20 blur-[60px] rounded-full pointer-events-none"></div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5, scale: 1.02 }}
          onClick={() => router.push('/chat')}
          className="card-dark border-lime/20 rounded-3xl p-8 cursor-pointer group bg-gradient-to-br from-lime/10 via-[#121215]/80 to-[#121215] hover:border-lime/50 transition-all relative overflow-hidden backdrop-blur-2xl shadow-2xl shadow-lime/5"
        >
          <div className="w-16 h-16 bg-lime/20 text-lime rounded-2xl flex items-center justify-center mb-6 border border-lime/30 shadow-[0_0_30px_rgba(204,255,0,0.3)] group-hover:scale-110 transition-transform">
            <Scale size={32} />
          </div>
          <h3 className="text-xl font-black uppercase tracking-widest mb-3 text-white">Legal RAG Chat</h3>
          <p className="text-sm text-white/60 leading-relaxed mb-8">Chat with Jurista's intelligent RAG engine to query Pakistani case laws, PLD, SCMR, and statutes.</p>
          <div className="flex items-center text-xs font-black tracking-widest text-lime uppercase gap-2 group-hover:translate-x-2 transition-transform">
            Open Chat <ChevronRight size={16} />
          </div>
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-lime/20 blur-[60px] rounded-full pointer-events-none"></div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5, scale: 1.02 }}
          onClick={() => router.push('/ocr')}
          className="card-dark border-purple-500/20 rounded-3xl p-8 cursor-pointer group bg-gradient-to-br from-purple-900/40 via-[#121215]/80 to-[#121215] hover:border-purple-400/50 transition-all relative overflow-hidden backdrop-blur-2xl shadow-2xl shadow-purple-900/20"
        >
          <div className="w-16 h-16 bg-purple-500/20 text-purple-400 rounded-2xl flex items-center justify-center mb-6 border border-purple-400/30 shadow-[0_0_30px_rgba(168,85,247,0.3)] group-hover:scale-110 transition-transform">
            <ScanText size={32} />
          </div>
          <h3 className="text-xl font-black uppercase tracking-widest mb-3 text-white">OCR Review</h3>
          <p className="text-sm text-white/60 leading-relaxed mb-8">Upload scanned FIRs, judgments, or affidavits to extract text, summarize facts, and cross-reference.</p>
          <div className="flex items-center text-xs font-black tracking-widest text-purple-400 uppercase gap-2 group-hover:translate-x-2 transition-transform">
            Upload Document <ChevronRight size={16} />
          </div>
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-purple-500/20 blur-[60px] rounded-full pointer-events-none"></div>
        </motion.div>

      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 relative z-10 pb-12">
        
        {/* Main Analytics Chart */}
        <div className="xl:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-bold tracking-widest uppercase text-white flex items-center gap-2">
              <Activity size={18} className="text-lime" />
              Weekly Productivity Analytics
            </h2>
            <div className="flex gap-4">
              <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-white/50">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div> Drafts Created
              </span>
              <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-white/50">
                <div className="w-2 h-2 rounded-full bg-lime"></div> Hearings Attended
              </span>
            </div>
          </div>
          
          <div className="card-dark border-white/10 rounded-3xl p-6 bg-[#121215]/80 backdrop-blur-xl h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDrafts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCases" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ccff00" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ccff00" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="name" stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#09090B', border: '1px solid #ffffff10', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="drafts" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorDrafts)" />
                <Area type="monotone" dataKey="cases" stroke="#ccff00" strokeWidth={3} fillOpacity={1} fill="url(#colorCases)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Upcoming Hearings */}
        <div className="xl:col-span-1 flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-bold tracking-widest uppercase text-white flex items-center gap-2">
              <CalendarClock size={18} className="text-lime" />
              Upcoming Hearings
            </h2>
            <button 
              onClick={() => router.push('/tracker')}
              className="text-[10px] font-bold text-lime uppercase tracking-widest hover:underline"
            >
              View Full Cause List
            </button>
          </div>
          
          <div className="card-dark border-white/10 rounded-3xl overflow-hidden bg-[#121215]/80 backdrop-blur-xl flex-1">
            {isLoadingHearings ? (
              <div className="p-8 text-center text-white/40 text-sm font-medium flex items-center justify-center h-full">Loading schedule...</div>
            ) : upcomingHearings.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center justify-center h-full">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-white/20 mb-4">
                  <Gavel size={32} />
                </div>
                <h3 className="text-lg font-bold mb-2">No upcoming hearings</h3>
                <p className="text-xs text-white/40 mb-6">Your calendar is currently clear.</p>
                <button 
                  onClick={() => router.push('/tracker')}
                  className="px-6 py-3 bg-white/5 text-white hover:bg-white/10 rounded-full text-xs font-bold uppercase tracking-widest transition-colors border border-white/10"
                >
                  Add a Case
                </button>
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-white/5 h-full">
                {upcomingHearings.map(caseItem => (
                  <div key={caseItem.id} className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors group cursor-pointer" onClick={() => router.push('/tracker')}>
                    <div className="flex items-center gap-5">
                      <div className="flex flex-col items-center justify-center w-14 h-14 rounded-2xl bg-black/40 border border-white/10 group-hover:border-lime/50 transition-colors shadow-lg">
                        <span className="text-[10px] font-black text-lime uppercase tracking-widest">{new Date(caseItem.next_hearing).toLocaleDateString('en-US', { month: 'short' })}</span>
                        <span className="text-lg font-black">{new Date(caseItem.next_hearing).getDate()}</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-white mb-1 flex items-center gap-2 text-sm">
                          {caseItem.case_title}
                        </h4>
                        <p className="text-xs text-white/50">{caseItem.court_name} • {caseItem.stage}</p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Spacer to push button down if few hearings */}
                <div className="flex-1"></div>
                
                <div className="p-4 bg-black/40 text-center">
                  <button onClick={() => router.push('/tracker')} className="text-xs font-bold uppercase tracking-widest text-white/50 hover:text-white transition-colors">
                    + Track New Case
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
