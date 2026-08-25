"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { FileUp, MessageSquare, Scale, ArrowRight } from 'lucide-react';

interface WorkspaceHubProps {
  onSelect: (module: 'ocr' | 'chat' | 'draft') => void;
}

export function WorkspaceHub({ onSelect }: WorkspaceHubProps) {
  const containerVars = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.1 }
    }
  };

  const itemVars = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-[#0A0A0C] w-full h-full relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[100px]" />
      </div>

      <motion.div 
        variants={containerVars}
        initial="hidden"
        animate="show"
        className="relative z-10 flex flex-col items-center max-w-4xl w-full px-8"
      >
        <motion.div variants={itemVars} className="mb-16 text-center">
          <h1 className="text-4xl font-black text-white tracking-widest uppercase mb-4 drop-shadow-lg">
            Jurista Workspace
          </h1>
          <p className="text-zinc-400 font-medium max-w-lg mx-auto">
            Select a module to begin. The AI context flows seamlessly across your documents, chats, and drafts.
          </p>
        </motion.div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-4 w-full relative">
          
          {/* Connecting Lines (Desktop only) */}
          <div className="hidden md:block absolute top-1/2 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent -translate-y-1/2 z-0" />

          {/* Module 1: OCR */}
          <motion.div variants={itemVars} className="z-10 flex-1 w-full max-w-[280px]">
            <button 
              onClick={() => onSelect('ocr')}
              className="w-full group relative flex flex-col items-center p-8 bg-[#121217] hover:bg-[#16161D] border border-zinc-800 hover:border-emerald-500/50 rounded-2xl transition-all shadow-xl hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]"
            >
              <div className="w-16 h-16 mb-6 rounded-2xl bg-zinc-900 border border-zinc-800 group-hover:border-emerald-500/50 flex items-center justify-center transition-colors">
                <FileUp size={28} className="text-zinc-400 group-hover:text-emerald-400 transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-zinc-100 tracking-wide uppercase mb-2">OCR Engine</h3>
              <p className="text-xs text-zinc-500 text-center leading-relaxed">
                Extract facts directly from raw FIRs and evidence images.
              </p>
            </button>
          </motion.div>

          {/* Arrow */}
          <motion.div variants={itemVars} className="hidden md:flex z-10 text-emerald-500/50">
            <ArrowRight size={24} />
          </motion.div>

          {/* Module 2: Chat */}
          <motion.div variants={itemVars} className="z-10 flex-1 w-full max-w-[280px]">
            <button 
              onClick={() => onSelect('chat')}
              className="w-full group relative flex flex-col items-center p-8 bg-[#121217] hover:bg-[#16161D] border border-zinc-800 hover:border-emerald-500/50 rounded-2xl transition-all shadow-xl hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]"
            >
              <div className="w-16 h-16 mb-6 rounded-2xl bg-zinc-900 border border-zinc-800 group-hover:border-emerald-500/50 flex items-center justify-center transition-colors">
                <MessageSquare size={28} className="text-zinc-400 group-hover:text-emerald-400 transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-zinc-100 tracking-wide uppercase mb-2">Legal Chat</h3>
              <p className="text-xs text-zinc-500 text-center leading-relaxed">
                Discuss case law and cross-reference extracted facts.
              </p>
            </button>
          </motion.div>

          {/* Arrow */}
          <motion.div variants={itemVars} className="hidden md:flex z-10 text-emerald-500/50">
            <ArrowRight size={24} />
          </motion.div>

          {/* Module 3: Draft */}
          <motion.div variants={itemVars} className="z-10 flex-1 w-full max-w-[280px]">
            <button 
              onClick={() => onSelect('draft')}
              className="w-full group relative flex flex-col items-center p-8 bg-[#121217] hover:bg-[#16161D] border border-zinc-800 hover:border-emerald-500/50 rounded-2xl transition-all shadow-xl hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]"
            >
              <div className="w-16 h-16 mb-6 rounded-2xl bg-zinc-900 border border-zinc-800 group-hover:border-emerald-500/50 flex items-center justify-center transition-colors">
                <Scale size={28} className="text-zinc-400 group-hover:text-emerald-400 transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-zinc-100 tracking-wide uppercase mb-2">Drafter</h3>
              <p className="text-xs text-zinc-500 text-center leading-relaxed">
                Generate structured court petitions instantly.
              </p>
            </button>
          </motion.div>

        </div>
      </motion.div>
    </div>
  );
}
