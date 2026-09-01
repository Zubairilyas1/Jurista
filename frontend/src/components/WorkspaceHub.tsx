import React from 'react';
import { Bot, ScanSearch, FileSignature, Mic, Scale, FileText, Layout, GitCompare, ShieldAlert, Gavel, Link2, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

interface WorkspaceHubProps {
  onSelect: (module: string) => void;
  availableModules?: string[];
}

const ALL_MODULES = [
  { id: 'chat', label: 'Legal Copilot', icon: Bot, desc: 'Chat directly with your case memory', color: 'emerald' },
  { id: 'ocr', label: 'OCR Scanner', icon: ScanSearch, desc: 'Extract & ingest documents', color: 'blue' },
  { id: 'draft', label: 'Petition Drafter', icon: FileSignature, desc: 'Generate drafts from memory', color: 'amber' },
  { id: 'analyze', label: 'Opponent Analyzer', icon: ShieldAlert, desc: 'Scan opponent arguments', color: 'red' },
  { id: 'contradiction', label: 'Contradiction Engine', icon: GitCompare, desc: 'Find logical loopholes', color: 'purple' },
  { id: 'moot', label: 'Moot Simulator', icon: Gavel, desc: 'Practice cross-examination', color: 'rose' },
  { id: 'links', label: 'Legal Links', icon: Link2, desc: 'Quick law references', color: 'indigo' },
];

export const WorkspaceHub: React.FC<WorkspaceHubProps> = ({ onSelect, availableModules = [] }) => {
  
  const modulesToRender = ALL_MODULES.filter(m => availableModules.includes(m.id));

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-zinc-950 w-full h-full relative overflow-hidden p-8">
      <div className="relative z-10 max-w-5xl w-full flex flex-col items-center">
        
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
            <Layout size={32} className="text-zinc-400" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-100 mb-2">Case Mission Control</h1>
          <p className="text-zinc-500 max-w-md mx-auto">Select a tool to interact with this case's shared intelligence.</p>
        </div>

        {modulesToRender.length === 0 ? (
          <div className="p-8 border border-zinc-800 border-dashed rounded-xl text-center">
            <ShieldAlert size={32} className="mx-auto mb-4 text-zinc-600" />
            <p className="text-zinc-400 font-bold uppercase tracking-tight">No Modules Enabled</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
            {modulesToRender.map((mod, idx) => {
              const Icon = mod.icon;
              return (
                <motion.div
                  key={mod.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => onSelect(mod.id)}
                  className="bg-zinc-900/30 border border-zinc-800 hover:border-emerald-500/30 rounded-xl p-5 flex flex-col items-center text-center cursor-pointer group transition-all"
                >
                  <div className="w-12 h-12 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon size={20} className="text-zinc-400 group-hover:text-emerald-400 transition-colors" />
                  </div>
                  <h3 className="text-sm font-bold text-zinc-200 mb-1 tracking-tight">{mod.label}</h3>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-tight">{mod.desc}</p>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
