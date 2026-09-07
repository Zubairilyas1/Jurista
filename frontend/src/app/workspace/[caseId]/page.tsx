"use client";

import React, { useState, useEffect } from 'react';
import { Bot, ScanSearch, FileSignature, Layout, ShieldAlert, Gavel, Link2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LegalChat } from '@/components/LegalChat';
import { PetitionDrafter } from '@/components/PetitionDrafter';
import { OcrReview } from '@/components/OcrReview';
import { WorkspaceHub } from '@/components/WorkspaceHub';
import { MootCourtSimulator } from '@/components/MootCourtSimulator';
import { LegalLinks } from '@/components/LegalLinks';
import { OpponentAnalyzer } from '@/components/OpponentAnalyzer';

export default function WorkspacePage({ params }: { params: { caseId: string } }) {
  const { caseId } = params;
  
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [primaryView, setPrimaryView] = useState<'hub' | 'ocr' | 'chat' | 'draft' | 'petition' | 'analyze' | 'contradiction' | 'moot' | 'links'>('hub');

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await fetch(`http://localhost:8001/api/v1/projects/${caseId}`);
        if (res.ok) {
          const data = await res.json();
          setProject(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [caseId]);

  if (loading) {
    return <div className="flex h-full bg-zinc-950 items-center justify-center text-emerald-500 font-bold tracking-tight uppercase animate-pulse">Loading Workspace Brain...</div>;
  }

  if (!project) {
    return <div className="flex h-full bg-zinc-950 items-center justify-center text-red-500 font-bold tracking-tight uppercase">Case Not Found</div>;
  }

  const activeModules = project.active_modules || [];

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950 text-zinc-100 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 relative">
        <header className="flex flex-col border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md shrink-0 z-10 sticky top-0">
          <div className="h-14 px-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-sm font-bold tracking-tight text-zinc-200">
                {project.title}
              </h1>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                Active Context
              </span>
            </div>
            <div className="flex items-center gap-4">
              {/* Optional top-right controls */}
            </div>
          </div>
          
          <div className="flex items-center gap-1 px-6 border-t border-zinc-800/50 pt-2">
            <TabButton label="Mission Control" isActive={primaryView === 'hub'} onClick={() => setPrimaryView('hub')} />
            {activeModules.includes('chat') && <TabButton label="AI Copilot" isActive={primaryView === 'chat'} onClick={() => setPrimaryView('chat')} />}
            {activeModules.includes('draft') && <TabButton label="Petition Drafter" isActive={primaryView === 'draft'} onClick={() => setPrimaryView('draft')} />}
            {activeModules.includes('ocr') && <TabButton label="OCR Scanner" isActive={primaryView === 'ocr'} onClick={() => setPrimaryView('ocr')} />}
            {activeModules.includes('analyze') && <TabButton label="Opponent Analyzer" isActive={primaryView === 'analyze'} onClick={() => setPrimaryView('analyze')} />}
          </div>
        </header>

        <div className="flex-1 overflow-hidden flex relative">
          <AnimatePresence mode="wait">
            <motion.div 
              key={primaryView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-zinc-950"
            >
              {primaryView === 'hub' && <WorkspaceHub onSelect={(mod: any) => setPrimaryView(mod)} availableModules={activeModules} />}
              {primaryView === 'chat' && activeModules.includes('chat') && <LegalChat projectId={caseId} />}
              {primaryView === 'draft' && activeModules.includes('draft') && <PetitionDrafter />}
              {primaryView === 'ocr' && activeModules.includes('ocr') && <OcrReview />}
              {primaryView === 'moot' && activeModules.includes('moot') && <MootCourtSimulator />}
              {primaryView === 'links' && activeModules.includes('links') && <LegalLinks />}
              {primaryView === 'analyze' && activeModules.includes('analyze') && <OpponentAnalyzer />}
              
              {primaryView !== 'hub' && !activeModules.includes(primaryView) && (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <ShieldAlert size={40} className="mx-auto mb-4 text-zinc-600" />
                    <h3 className="text-zinc-300 font-bold uppercase tracking-tight">Module Disabled</h3>
                    <p className="text-zinc-500 text-sm">This tool was not enabled for this specific case workspace.</p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
    </div>
  );
}

const TabButton = ({ label, isActive, onClick }: { label: string, isActive: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`px-4 py-2 text-xs font-bold uppercase tracking-tight transition-all duration-200 border-b-2 ${
      isActive 
        ? 'border-emerald-500 text-emerald-400' 
        : 'border-transparent text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'
    }`}
  >
    {label}
  </button>
);