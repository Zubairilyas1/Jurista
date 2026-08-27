"use client";

import React from 'react';
import { motion, Variants } from 'framer-motion';
import { FileUp, MessageSquare, Scale, ShieldAlert, GitCompare, Gavel, Link2, Sparkles, ScrollText } from 'lucide-react';

interface WorkspaceHubProps {
  onSelect: (module: 'ocr' | 'chat' | 'draft' | 'petition' | 'analyze' | 'contradiction' | 'moot' | 'links') => void;
}

export function WorkspaceHub({ onSelect }: WorkspaceHubProps) {
  const containerVars: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  };

  const itemVars: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar bg-zinc-950 p-8 flex flex-col items-center w-full h-full">
      <motion.div 
        variants={containerVars}
        initial="hidden"
        animate="show"
        className="max-w-6xl w-full flex flex-col items-center justify-center min-h-full py-12"
      >
        <motion.div variants={itemVars} className="text-center mb-16">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-100 mb-3">
            Jurista Workspace
          </h1>
          <p className="text-sm text-zinc-400 max-w-lg mx-auto">
            Select a module to begin. Context flows seamlessly across documents, chats, and drafts.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full relative">
          
          {/* Module 1: Contradiction Engine */}
          <motion.div variants={itemVars} className="z-10 w-full">
            <button 
              onClick={() => onSelect('contradiction')}
              className="w-full h-full group relative flex flex-col items-center p-8 bg-zinc-900/30 hover:bg-zinc-800/50 border border-zinc-800 hover:border-zinc-700 rounded-lg transition-colors"
            >
              <div className="w-12 h-12 mb-6 rounded-lg bg-zinc-800/50 flex items-center justify-center text-zinc-400 group-hover:text-zinc-200 group-hover:bg-zinc-700/50 transition-colors">
                <GitCompare size={24} />
              </div>
              <h3 className="text-sm font-medium text-zinc-200 mb-2 text-center">Contradiction Engine</h3>
              <p className="text-xs text-zinc-500 text-center leading-relaxed">
                Cross-reference evidence to find loopholes.
              </p>
            </button>
          </motion.div>

          {/* Module 2: Analyzer */}
          <motion.div variants={itemVars} className="z-10 w-full">
            <button 
              onClick={() => onSelect('analyze')}
              className="w-full h-full group relative flex flex-col items-center p-8 bg-zinc-900/30 hover:bg-zinc-800/50 border border-zinc-800 hover:border-zinc-700 rounded-lg transition-colors"
            >
              <div className="w-12 h-12 mb-6 rounded-lg bg-zinc-800/50 flex items-center justify-center text-zinc-400 group-hover:text-zinc-200 group-hover:bg-zinc-700/50 transition-colors">
                <ShieldAlert size={24} />
              </div>
              <h3 className="text-sm font-medium text-zinc-200 mb-2 text-center">Opponent Analyzer</h3>
              <p className="text-xs text-zinc-500 text-center leading-relaxed">
                Scan opposing briefs for overruled law.
              </p>
            </button>
          </motion.div>

          {/* Module 3: OCR */}
          <motion.div variants={itemVars} className="z-10 w-full">
            <button 
              onClick={() => onSelect('ocr')}
              className="w-full h-full group relative flex flex-col items-center p-8 bg-zinc-900/30 hover:bg-zinc-800/50 border border-zinc-800 hover:border-zinc-700 rounded-lg transition-colors"
            >
              <div className="w-12 h-12 mb-6 rounded-lg bg-zinc-800/50 flex items-center justify-center text-zinc-400 group-hover:text-zinc-200 group-hover:bg-zinc-700/50 transition-colors">
                <FileUp size={24} />
              </div>
              <h3 className="text-sm font-medium text-zinc-200 mb-2 text-center">OCR Engine</h3>
              <p className="text-xs text-zinc-500 text-center leading-relaxed">
                Extract facts directly from raw FIRs and evidence images.
              </p>
            </button>
          </motion.div>

          {/* Module 4: Chat */}
          <motion.div variants={itemVars} className="z-10 w-full">
            <button 
              onClick={() => onSelect('chat')}
              className="w-full h-full group relative flex flex-col items-center p-8 bg-zinc-900/30 hover:bg-zinc-800/50 border border-zinc-800 hover:border-zinc-700 rounded-lg transition-colors"
            >
              <div className="w-12 h-12 mb-6 rounded-lg bg-zinc-800/50 flex items-center justify-center text-zinc-400 group-hover:text-zinc-200 group-hover:bg-zinc-700/50 transition-colors">
                <MessageSquare size={24} />
              </div>
              <h3 className="text-sm font-medium text-zinc-200 mb-2 text-center">Legal Chat</h3>
              <p className="text-xs text-zinc-500 text-center leading-relaxed">
                Discuss case law and cross-reference extracted facts.
              </p>
            </button>
          </motion.div>

          {/* Module 5: Smart Assembly */}
          <motion.div variants={itemVars} className="z-10 w-full">
            <button 
              onClick={() => onSelect('draft')}
              className="w-full h-full group relative flex flex-col items-center p-8 bg-zinc-900/30 hover:bg-zinc-800/50 border border-zinc-800 hover:border-zinc-700 rounded-lg transition-colors"
            >
              <div className="w-12 h-12 mb-6 rounded-lg bg-zinc-800/50 flex items-center justify-center text-zinc-400 group-hover:text-zinc-200 group-hover:bg-zinc-700/50 transition-colors">
                <Sparkles size={24} />
              </div>
              <h3 className="text-sm font-medium text-zinc-200 mb-2 text-center">Smart Assembly</h3>
              <p className="text-xs text-zinc-500 text-center leading-relaxed">
                Auto-generate contracts and notices from raw notes.
              </p>
            </button>
          </motion.div>

          {/* Module 6: Moot Court */}
          <motion.div variants={itemVars} className="z-10 w-full">
            <button 
              onClick={() => onSelect('moot')}
              className="w-full h-full group relative flex flex-col items-center p-8 bg-zinc-900/30 hover:bg-zinc-800/50 border border-zinc-800 hover:border-zinc-700 rounded-lg transition-colors"
            >
              <div className="w-12 h-12 mb-6 rounded-lg bg-zinc-800/50 flex items-center justify-center text-zinc-400 group-hover:text-zinc-200 group-hover:bg-zinc-700/50 transition-colors">
                <Gavel size={24} />
              </div>
              <h3 className="text-sm font-medium text-zinc-200 mb-2 text-center">Moot Court</h3>
              <p className="text-xs text-zinc-500 text-center leading-relaxed">
                Litigation sparring simulator for practice.
              </p>
            </button>
          </motion.div>

          {/* Module 7: Quick Links */}
          <motion.div variants={itemVars} className="z-10 w-full">
            <button 
              onClick={() => onSelect('links')}
              className="w-full h-full group relative flex flex-col items-center p-8 bg-zinc-900/30 hover:bg-zinc-800/50 border border-zinc-800 hover:border-zinc-700 rounded-lg transition-colors"
            >
              <div className="w-12 h-12 mb-6 rounded-lg bg-zinc-800/50 flex items-center justify-center text-zinc-400 group-hover:text-zinc-200 group-hover:bg-zinc-700/50 transition-colors">
                <Link2 size={24} />
              </div>
              <h3 className="text-sm font-medium text-zinc-200 mb-2 text-center">Legal Links</h3>
              <p className="text-xs text-zinc-500 text-center leading-relaxed">
                Directory of courts, statutes, and e-portals.
              </p>
            </button>
          </motion.div>

          {/* Module 8: Petition Drafter */}
          <motion.div variants={itemVars} className="z-10 w-full">
            <button 
              onClick={() => onSelect('petition')}
              className="w-full h-full group relative flex flex-col items-center p-8 bg-zinc-900/30 hover:bg-zinc-800/50 border border-zinc-800 hover:border-zinc-700 rounded-lg transition-colors"
            >
              <div className="w-12 h-12 mb-6 rounded-lg bg-zinc-800/50 flex items-center justify-center text-zinc-400 group-hover:text-zinc-200 group-hover:bg-zinc-700/50 transition-colors">
                <ScrollText size={24} />
              </div>
              <h3 className="text-sm font-medium text-zinc-200 mb-2 text-center">Petition Drafter</h3>
              <p className="text-xs text-zinc-500 text-center leading-relaxed">
                Generate structured court pleadings and forms.
              </p>
            </button>
          </motion.div>

        </div>
      </motion.div>
    </div>
  );
}
