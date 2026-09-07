"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Gavel, Calendar, CheckCircle2, Clock, ShieldCheck, FileText, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ClientPortal() {
  const params = useParams();
  const id = params?.id as string;
  
  const [caseData, setCaseData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Check Backend First
    fetch('http://127.0.0.1:8001/api/v1/tracker/cases')
      .then(res => res.json())
      .then(data => {
        const found = data.find((c: any) => c.id.toString() === id);
        if (found) {
          setCaseData(found);
          setIsLoading(false);
        } else {
          checkLocalFallback();
        }
      })
      .catch(e => {
        console.error("Backend unreachable, checking local database.");
        checkLocalFallback();
      });

    // 2. Check LocalStorage Fallback (for manually tracked cases without backend)
    const checkLocalFallback = () => {
      const local = localStorage.getItem('jurista_manual_cases');
      if (local) {
        try {
          const manualCases = JSON.parse(local);
          const found = manualCases.find((c: any) => c.id === id);
          if (found) {
            // Map tracker data format to client portal expected format
            setCaseData({
              id: found.id,
              case_title: found.parties,
              court_name: found.court,
              case_number: found.case_number,
              stage: "Pending Hearing",
              next_hearing: found.hearing_date,
              deadline: found.deadline
            });
          }
        } catch (e) {}
      }
      setIsLoading(false);
    };
  }, [id]);

  if (isLoading) {
    return (
      <div className="w-full h-screen bg-[#0D0D0E] flex flex-col items-center justify-center gap-6">
        <div className="w-12 h-12 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[10px] font-bold tracking-widest uppercase text-emerald-400">Loading Secure Client Portal...</p>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="w-full h-screen bg-[#0D0D0E] flex flex-col items-center justify-center text-white">
        <div className="w-24 h-24 rounded-full bg-[#18181C] border border-zinc-800 flex items-center justify-center mb-6">
          <ShieldCheck size={40} className="text-white/20" />
        </div>
        <h1 className="font-sans-hero text-2xl font-bold tracking-widest uppercase text-white mb-2">Case Not Found</h1>
        <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 max-w-sm text-center leading-relaxed">
          The requested case file is unavailable or restricted. Please contact your advocate's chamber to verify the link.
        </p>
      </div>
    );
  }

  // Parse Date Safely
  let formattedDate = caseData.next_hearing;
  try {
    const d = new Date(caseData.next_hearing);
    if (!isNaN(d.getTime())) {
      formattedDate = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    }
  } catch (e) {}

  return (
    <div className="w-full min-h-screen bg-[#0D0D0E] text-white selection:bg-emerald-500/30 font-sans">
      
      {/* Law Firm Branding Header */}
      <div className="w-full bg-[#0D0D0E] border-b border-zinc-800 py-6 px-8 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
            <Gavel size={24} className="text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xl font-sans-hero font-bold tracking-widest uppercase text-white">Zubair & Associates</h1>
            <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Advocates & Legal Consultants</p>
          </div>
        </div>
        <div className="hidden sm:block text-right">
          <p className="text-xs font-bold uppercase tracking-widest text-white/80">Secure Client Portal</p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mt-1">Confidential & Privileged</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 md:p-10 mt-4">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#18181C] rounded-2xl border border-zinc-800 overflow-hidden shadow-2xl"
        >
          {/* Case Header */}
          <div className="p-10 border-b border-zinc-800 bg-[#0D0D0E]/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <FileText size={120} className="text-white" />
            </div>
            
            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg text-[10px] font-bold uppercase tracking-widest mb-6 relative z-10">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Active Case File
            </span>
            
            <h2 className="text-3xl font-sans-hero font-bold tracking-widest uppercase text-white mb-4 relative z-10">
              {caseData.case_title}
            </h2>
            
            <div className="flex items-center gap-6 relative z-10">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/60 flex items-center gap-2">
                <ShieldCheck size={14} className="text-emerald-400" /> {caseData.court_name}
              </p>
              <div className="w-1 h-1 rounded-full bg-zinc-700" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">
                Case No: {caseData.case_number}
              </p>
            </div>
          </div>

          <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Status Card */}
            <div className="bg-[#0D0D0E] rounded-xl p-8 border border-zinc-800/80 hover:border-emerald-500/30 transition-colors group">
              <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Clock size={14} className="text-white/60 group-hover:text-emerald-400 transition-colors" /> Current Status
              </h3>
              <p className="text-2xl font-sans-hero font-bold text-white mb-4 uppercase tracking-widest">{caseData.stage}</p>
              <p className="text-xs text-white/60 leading-relaxed font-medium">
                Your case is currently at the <span className="text-emerald-400">{caseData.stage}</span> stage. Our team is preparing the necessary documentation and arguments for the upcoming hearing.
              </p>
            </div>

            {/* Next Hearing Card */}
            <div className="bg-emerald-950/20 rounded-xl p-8 border border-emerald-500/20 relative overflow-hidden group hover:bg-emerald-950/30 transition-colors">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                <Calendar size={80} className="text-emerald-500 group-hover:scale-110 transition-transform duration-500" />
              </div>
              <h3 className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-6 flex items-center gap-2 relative z-10">
                <Calendar size={14} /> Next Court Date
              </h3>
              <p className="text-3xl font-sans-hero font-bold text-emerald-400 mb-4 relative z-10 uppercase tracking-widest">
                {formattedDate}
              </p>
              <p className="text-xs text-emerald-100/60 font-medium relative z-10">
                Please ensure your availability if requested by your advocate. You will receive an SMS reminder 24 hours prior.
              </p>
            </div>

          </div>

          {/* Contact Footer */}
          <div className="bg-[#0D0D0E] border-t border-zinc-800 p-8 flex flex-col sm:flex-row items-center justify-between text-white">
            <div className="flex items-center gap-4 mb-6 sm:mb-0">
              <CheckCircle2 size={28} className="text-emerald-400" />
              <div>
                <p className="font-bold text-sm tracking-wide uppercase text-white">Need Legal Assistance?</p>
                <p className="text-[10px] font-bold tracking-widest uppercase text-white/40 mt-1">Contact the chamber directly to schedule a meeting.</p>
              </div>
            </div>
            <a href="tel:+923000000000" className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-bold tracking-widest uppercase transition-colors flex items-center gap-2 shadow-lg shadow-emerald-950/40">
              Call Office <ArrowRight size={14} />
            </a>
          </div>

        </motion.div>

        <div className="text-center mt-12 flex flex-col items-center gap-2 opacity-50">
          <p className="text-[9px] text-white font-bold uppercase tracking-widest">
            Powered by <span className="text-emerald-400">Jurista</span> Legal Intelligence
          </p>
          <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest">
            Secure • Encrypted • Confidential
          </p>
        </div>

      </div>
    </div>
  );
}
