"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Briefcase, FileText, MessageSquare, GitCompare, ShieldAlert, Gavel, Link2, ArrowRight } from 'lucide-react';

interface CreateCaseWizardProps {
  onClose: () => void;
}

const AVAILABLE_MODULES = [
  { id: 'chat', label: 'Legal Copilot', icon: MessageSquare, desc: 'Chat with case context' },
  { id: 'ocr', label: 'OCR Scanner', icon: FileText, desc: 'Extract text from docs' },
  { id: 'draft', label: 'Petition Drafter', icon: Briefcase, desc: 'Auto-draft legal petitions' },
  { id: 'analyze', label: 'Opponent Analyzer', icon: ShieldAlert, desc: 'Scan opponent arguments' },
  { id: 'contradiction', label: 'Contradiction Engine', icon: GitCompare, desc: 'Find logic loopholes' },
  { id: 'moot', label: 'Moot Simulator', icon: Gavel, desc: 'Practice arguments' },
  { id: 'links', label: 'Legal Links', icon: Link2, desc: 'Quick law references' },
];

export const CreateCaseWizard: React.FC<CreateCaseWizardProps> = ({ onClose }) => {
  const [title, setTitle] = useState('');
  const [activeModules, setActiveModules] = useState<string[]>(['chat', 'ocr']);
  const [loading, setLoading] = useState(false);

  const toggleModule = (id: string) => {
    setActiveModules(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const handleCreate = async () => {
    if (!title.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8001/api/v1/projects/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, active_modules: activeModules })
      });
      const data = await res.json();
      window.location.href = `/workspace/${data.id}`;
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between p-6 border-b border-zinc-800/80 bg-zinc-900/20">
          <div>
            <h2 className="text-lg font-bold text-zinc-100 tracking-tight">Create New Case Workspace</h2>
            <p className="text-xs text-zinc-500 mt-1">Provision a dedicated AI memory context for your case.</p>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-6">
          <div>
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-tight mb-2 block">Case Title</label>
            <input 
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., State vs. Ahmed (Bail Application)"
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500/50 transition-colors"
              autoFocus
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-tight mb-3 block">Enable Active Modules</label>
            <div className="grid grid-cols-2 gap-3">
              {AVAILABLE_MODULES.map(mod => {
                const Icon = mod.icon;
                const isActive = activeModules.includes(mod.id);
                return (
                  <div 
                    key={mod.id}
                    onClick={() => toggleModule(mod.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all flex items-start gap-3 ${isActive ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-zinc-900/30 border-zinc-800/80 hover:bg-zinc-900/80'}`}
                  >
                    <div className={`mt-0.5 ${isActive ? 'text-emerald-400' : 'text-zinc-500'}`}>
                      <Icon size={16} />
                    </div>
                    <div>
                      <h4 className={`text-xs font-bold tracking-tight ${isActive ? 'text-emerald-400' : 'text-zinc-300'}`}>{mod.label}</h4>
                      <p className="text-[10px] text-zinc-500 mt-0.5">{mod.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-zinc-800/80 bg-zinc-900/50 flex justify-end">
          <button 
            onClick={handleCreate}
            disabled={!title.trim() || loading || activeModules.length === 0}
            className="flex items-center gap-2 bg-emerald-500 text-zinc-950 px-5 py-2.5 rounded-lg text-xs font-bold tracking-tight uppercase hover:bg-emerald-400 transition-colors disabled:opacity-50 disabled:bg-zinc-700 disabled:text-zinc-500"
          >
            {loading ? 'Provisioning Workspace...' : 'Initialize Case Brain'}
            {!loading && <ArrowRight size={14} />}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
