"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Activity, Package, WifiOff, ShieldAlert, GitCompare, Sparkles, ScrollText, Scale, ScanText, Gavel, CalendarClock, ChevronRight, Link2
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import { CreateCaseWizard } from '@/components/CreateCaseWizard';
import { Plus, Briefcase } from 'lucide-react';


const mockChartData = [
  { name: 'Mon', cases: 2, drafts: 4 },
  { name: 'Tue', cases: 3, drafts: 7 },
  { name: 'Wed', cases: 1, drafts: 5 },
  { name: 'Thu', cases: 5, drafts: 8 },
  { name: 'Fri', cases: 4, drafts: 12 },
  { name: 'Sat', cases: 0, drafts: 2 },
  { name: 'Sun', cases: 0, drafts: 1 },
];

const juristaModules = [
  { id: 'analyze', name: 'Opponent Analyzer', desc: 'Scan opposing briefs for overruled law', icon: ShieldAlert, path: '/analyze' },
  { id: 'contradiction', name: 'Contradiction Engine', desc: 'Cross-reference evidence to find loopholes', icon: GitCompare, path: '/contradiction' },
  { id: 'draft', name: 'Smart Assembly', desc: 'Auto-generate contracts and notices', icon: Sparkles, path: '/workspace' },
  { id: 'petition', name: 'Petition Drafter', desc: 'Generate structured court pleadings', icon: ScrollText, path: '/petition' },
  { id: 'chat', name: 'Legal RAG Chat', desc: 'Discuss case law and query statutes', icon: Scale, path: '/chat' },
  { id: 'ocr', name: 'OCR Engine', desc: 'Extract facts from raw FIRs and images', icon: ScanText, path: '/ocr' },
  { id: 'moot', name: 'Moot Court', desc: 'Litigation sparring simulator', icon: Gavel, path: '/moot' },
  { id: 'links', name: 'Legal Links', desc: 'Directory of courts and statutes', icon: Link2, path: '/links' },
];

export default function Dashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState('Advocate');
  const [initials, setInitials] = useState('AD');
  const [upcomingHearings, setUpcomingHearings] = useState<any[]>([]);
  const [isLoadingHearings, setIsLoadingHearings] = useState(true);
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [showWizard, setShowWizard] = useState(false);

  useEffect(() => {
    fetch('http://127.0.0.1:8001/api/v1/projects/')
      .then(res => res.json())
      .then(data => setProjects(data))
      .catch(err => console.error("Could not fetch projects", err))
      .finally(() => setIsLoadingProjects(false));
  }, []);


  useEffect(() => {
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

    fetch('http://127.0.0.1:8001/api/v1/tracker/cases')
      .then(res => res.json())
      .then(data => {
        const sorted = data.sort((a: any, b: any) => new Date(a.next_hearing).getTime() - new Date(b.next_hearing).getTime());
        setUpcomingHearings(sorted.slice(0, 3));
      })
      .catch(err => console.error("Could not fetch hearings", err))
      .finally(() => setIsLoadingHearings(false));
  }, []);

  return (
    <div className="w-full h-full flex flex-col p-8 bg-zinc-950 overflow-y-auto custom-scrollbar text-zinc-100">
      
      {/* Structural Header (Replaced Vibe-Coded Slop) */}
      <header className="flex items-center justify-between w-full mb-10 border-b border-zinc-800 pb-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">
            Welcome back, {userName.replace(/Adv\.|Advocate/ig, '').trim().split(' ')[0]}
          </h1>
          <p className="text-sm text-zinc-400">System overview and workspace modules</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-1">
            <button onClick={() => router.push('/tracker')} className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-100 transition-colors flex items-center gap-2">
              <Activity size={14} /> Schedule
            </button>
            <div className="w-px h-4 bg-zinc-800 mx-1"></div>
            <button onClick={() => router.push('/courtroom')} className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-100 transition-colors flex items-center gap-2">
              <WifiOff size={14} /> Courtroom Mode
            </button>
          </div>
          <button onClick={() => router.push('/settings')} className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center font-medium text-sm text-zinc-200 border border-zinc-700 hover:bg-zinc-700 transition-colors" aria-label="Settings">
            {initials}
          </button>
        </div>
      </header>

      {/* Main Grid Layout (Replaced 3-card generic row) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Analytics & Data (Col Span 8) */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-zinc-100">Productivity Metrics</h2>
              <div className="flex gap-4">
                <span className="flex items-center gap-2 text-xs text-zinc-400">
                  <div className="w-2 h-2 rounded-full bg-zinc-100"></div> Drafts
                </span>
                <span className="flex items-center gap-2 text-xs text-zinc-400">
                  <div className="w-2 h-2 rounded-full bg-zinc-600"></div> Hearings
                </span>
              </div>
            </div>
            
            <div className="border border-zinc-800 rounded-xl bg-zinc-900/30 p-6 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="name" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                    itemStyle={{ color: '#f4f4f5', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="drafts" stroke="#f4f4f5" strokeWidth={2} fillOpacity={0.1} fill="#f4f4f5" />
                  <Area type="monotone" dataKey="cases" stroke="#52525b" strokeWidth={2} fillOpacity={0.1} fill="#52525b" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-zinc-100">Upcoming Hearings</h2>
              <button onClick={() => router.push('/tracker')} className="text-xs text-zinc-400 hover:text-zinc-100 transition-colors">
                View All
              </button>
            </div>
            
            <div className="border border-zinc-800 rounded-xl bg-zinc-900/30 overflow-hidden">
              {isLoadingHearings ? (
                <div className="flex flex-col divide-y divide-zinc-800/50">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="p-4 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-zinc-800/50 animate-pulse"></div>
                      <div className="flex flex-col gap-2 flex-1">
                        <div className="w-32 h-4 bg-zinc-800/50 rounded animate-pulse"></div>
                        <div className="w-48 h-3 bg-zinc-800/50 rounded animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : upcomingHearings.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center justify-center">
                  <CalendarClock size={24} className="text-zinc-600 mb-3" />
                  <h3 className="text-sm font-medium text-zinc-300 mb-1">No upcoming hearings</h3>
                  <p className="text-xs text-zinc-500 mb-4">Your calendar is clear.</p>
                  <button onClick={() => router.push('/tracker')} className="px-4 py-2 bg-zinc-100 text-zinc-900 hover:bg-white rounded-lg text-xs font-medium transition-colors">
                    Add Case
                  </button>
                </div>
              ) : (
                <div className="flex flex-col divide-y divide-zinc-800/50">
                  {upcomingHearings.map(caseItem => (
                    <button 
                      key={caseItem.id} 
                      onClick={() => router.push('/tracker')}
                      className="p-4 flex items-center justify-between hover:bg-zinc-800/30 transition-colors text-left group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-zinc-900 border border-zinc-800">
                          <span className="text-[10px] font-medium text-zinc-400 uppercase">{new Date(caseItem.next_hearing).toLocaleDateString('en-US', { month: 'short' })}</span>
                          <span className="text-sm font-medium text-zinc-100">{new Date(caseItem.next_hearing).getDate()}</span>
                        </div>
                        <div>
                          <h4 className="font-medium text-zinc-200 text-sm mb-0.5">{caseItem.case_title}</h4>
                          <p className="text-xs text-zinc-500">{caseItem.court_name} • {caseItem.stage}</p>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </section>

        </div>

        {/* Right Column: Active Workspaces (Col Span 4) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-zinc-100">Active Workspaces</h2>
            <button onClick={() => setShowWizard(true)} className="flex items-center gap-1 bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-tight hover:bg-emerald-500/20 transition-colors border border-emerald-500/20">
              <Plus size={12} /> New Case
            </button>
          </div>
          
          <div className="border border-zinc-800 rounded-xl bg-zinc-900/30 overflow-hidden flex flex-col h-[500px] overflow-y-auto custom-scrollbar relative">
            {isLoadingProjects ? (
              <div className="flex flex-col divide-y divide-zinc-800/50">
                {[1, 2, 3].map(i => (
                  <div key={i} className="p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-zinc-800/50 animate-pulse"></div>
                    <div className="flex flex-col gap-2 flex-1">
                      <div className="w-24 h-3 bg-zinc-800/50 rounded animate-pulse"></div>
                      <div className="w-32 h-2 bg-zinc-800/50 rounded animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : projects.length === 0 ? (
               <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <Briefcase size={32} className="text-zinc-600 mb-3" />
                  <h3 className="text-xs font-medium text-zinc-300 mb-1">No Active Cases</h3>
                  <p className="text-[10px] text-zinc-500 mb-4">Initialize a workspace to begin.</p>
                  <button onClick={() => setShowWizard(true)} className="px-4 py-2 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 rounded-lg text-xs font-medium transition-colors">
                    Initialize Workspace
                  </button>
               </div>
            ) : (
              <div className="flex flex-col divide-y divide-zinc-800/50">
                {projects.map((project: any) => (
                  <button 
                    key={project.id}
                    onClick={() => window.location.href = `/workspace/${project.id}`}
                    className="p-5 flex flex-col gap-2 hover:bg-zinc-800/30 transition-colors text-left group"
                  >
                    <div className="flex items-center justify-between w-full">
                      <h3 className="text-sm font-bold text-zinc-200 group-hover:text-emerald-400 transition-colors truncate">{project.title}</h3>
                      <ChevronRight size={14} className="text-zinc-600 group-hover:text-emerald-400 transition-colors" />
                    </div>
                    
                    <div className="flex items-center gap-1.5 flex-wrap mt-1">
                      {project.active_modules.slice(0, 3).map((mod: string) => (
                        <span key={mod} className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-400 text-[9px] font-bold uppercase tracking-wider rounded">
                          {mod}
                        </span>
                      ))}
                      {project.active_modules.length > 3 && (
                        <span className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-400 text-[9px] font-bold uppercase tracking-wider rounded">
                          +{project.active_modules.length - 3}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
      
      {showWizard && <CreateCaseWizard onClose={() => setShowWizard(false)} />}
    </div>
  );
}
