"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Gavel, Calendar, CheckCircle2, Clock, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ClientPortal() {
  const { id } = useParams();
  const [caseData, setCaseData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would hit a specific /api/v1/tracker/public/{id} endpoint
    fetch('http://127.0.0.1:8001/api/v1/tracker/cases')
      .then(res => res.json())
      .then(data => {
        const found = data.find((c: any) => c.id.toString() === id);
        if (found) {
          setCaseData(found);
        }
      })
      .catch(e => console.error(e))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return <div className="w-full h-screen bg-white flex items-center justify-center text-black">Loading...</div>;
  }

  if (!caseData) {
    return <div className="w-full h-screen bg-white flex flex-col items-center justify-center text-black font-sans">
      <ShieldCheck size={48} className="text-gray-300 mb-4" />
      <h1 className="text-2xl font-bold uppercase">Case Not Found</h1>
      <p className="text-gray-500">The requested case file is unavailable or restricted.</p>
    </div>;
  }

  const nextHearingDate = new Date(caseData.next_hearing);

  return (
    <div className="w-full min-h-screen bg-gray-50 font-sans">
      {/* Law Firm Branding Header */}
      <div className="w-full bg-slate-900 text-white py-6 px-8 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <Gavel size={28} className="text-emerald-400" />
          <div>
            <h1 className="text-xl font-bold tracking-tight uppercase">Zubair & Associates</h1>
            <p className="text-xs text-emerald-400 font-bold uppercase tracking-tight">Advocates & Legal Consultants</p>
          </div>
        </div>
        <div className="hidden sm:block text-right">
          <p className="text-sm font-medium">Client Status Portal</p>
          <p className="text-xs text-white/50">Confidential & Privileged</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-4 md:p-8 mt-4">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden"
        >
          {/* Case Header */}
          <div className="p-8 border-b border-gray-100">
            <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold uppercase tracking-tight mb-4">
              Active Case File
            </span>
            <h2 className="text-3xl font-semibold text-slate-900 mb-2">{caseData.case_title}</h2>
            <p className="text-slate-500 font-medium flex items-center gap-2">
              <ShieldCheck size={18} /> {caseData.court_name}
            </p>
          </div>

          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Status Card */}
            <div className="bg-slate-50 rounded-lg p-6 border border-slate-100">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-tight mb-4 flex items-center gap-2">
                <Clock size={14} /> Current Status
              </h3>
              <p className="text-2xl font-semibold text-slate-800 mb-2">{caseData.stage}</p>
              <p className="text-sm text-slate-500 leading-relaxed">
                Your case is currently at the <b>{caseData.stage}</b> stage. Our team is preparing the necessary documentation and arguments for the upcoming hearing.
              </p>
            </div>

            {/* Next Hearing Card */}
            <div className="bg-emerald-50 rounded-lg p-6 border border-emerald-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Calendar size={64} className="text-emerald-900" />
              </div>
              <h3 className="text-xs font-bold text-emerald-600 uppercase tracking-tight mb-4 flex items-center gap-2 relative z-10">
                <Calendar size={14} /> Next Court Date
              </h3>
              <p className="text-3xl font-semibold text-emerald-900 mb-1 relative z-10">
                {nextHearingDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
              <p className="text-sm text-emerald-700 font-medium relative z-10">
                Please ensure your availability if requested by your advocate.
              </p>
            </div>

          </div>

          {/* Contact Footer */}
          <div className="bg-slate-900 p-6 flex flex-col sm:flex-row items-center justify-between text-white">
            <div className="flex items-center gap-3 mb-4 sm:mb-0">
              <CheckCircle2 size={24} className="text-emerald-400" />
              <div>
                <p className="font-bold">Need assistance?</p>
                <p className="text-sm text-white/60">Contact the chamber directly.</p>
              </div>
            </div>
            <a href="tel:+923000000000" className="px-6 py-3 bg-white text-slate-900 rounded-full text-sm font-bold tracking-tight uppercase hover:bg-emerald-400 transition-colors">
              Call Office
            </a>
          </div>

        </motion.div>

        <p className="text-center text-xs text-gray-400 mt-8 font-medium">
          Powered by Jurista Legal Intelligence
        </p>

      </div>
    </div>
  );
}
