"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Scale, ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="w-full h-screen bg-[#0D0D0E] flex items-center justify-center relative overflow-hidden text-white">
      
      {/* Background Floating Elements */}
      <motion.div 
        animate={{ 
          y: [0, -20, 0], 
          opacity: [0.1, 0.3, 0.1],
          scale: [1, 1.1, 1]
        }}
        transition={{ 
          duration: 8, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px]"
      />
      <motion.div 
        animate={{ 
          y: [0, 20, 0], 
          opacity: [0.1, 0.2, 0.1],
          scale: [1, 1.2, 1]
        }}
        transition={{ 
          duration: 10, 
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
        className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-emerald-900/10 rounded-full blur-[120px]"
      />

      <div className="z-10 flex flex-col items-center text-center p-8 max-w-2xl">
        
        {/* Floating Icon */}
        <motion.div
          animate={{ y: [-10, 10, -10] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="w-32 h-32 rounded-full border border-zinc-800 bg-[#18181C] flex items-center justify-center mb-10 shadow-2xl relative"
        >
          <div className="absolute inset-0 rounded-full border border-emerald-500/20 animate-[spin_10s_linear_infinite]" />
          <Scale size={48} className="text-emerald-400" />
        </motion.div>

        {/* 404 Text */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-sans-hero text-8xl font-bold tracking-widest text-white mb-2"
        >
          404
        </motion.h1>
        
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl font-bold uppercase tracking-widest text-emerald-400 mb-6"
        >
          Jurisdiction Not Found
        </motion.h2>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-sm font-medium tracking-widest uppercase text-white/50 mb-12 max-w-md leading-relaxed"
        >
          The page or legal resource you are looking for has been moved, deleted, or does not exist in our registry.
        </motion.p>

        {/* Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-4"
        >
          <a 
            href="/"
            className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-colors rounded-xl shadow-lg shadow-emerald-950/40"
          >
            <ArrowLeft size={16} /> Return to Dashboard
          </a>
          <button 
            className="px-8 py-4 bg-[#18181C] border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-colors rounded-xl"
          >
            <Search size={16} /> Search Registry
          </button>
        </motion.div>

      </div>
    </div>
  );
}
