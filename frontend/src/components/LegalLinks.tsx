"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Landmark, BookOpen, Scale, Building2, Gavel, FileText, Link2, X, RefreshCw, ChevronLeft } from 'lucide-react';

const CATEGORIES = [
  {
    title: "Statutes & Case Law",
    icon: <BookOpen size={18} className="text-emerald-400" />,
    links: [
      { name: "Pakistan Code", url: "http://pakistancode.gov.pk/", desc: "Official portal for all Federal Laws of Pakistan." },
      { name: "Punjab Laws Online", url: "http://punjablaws.gov.pk/", desc: "Database of all provincial laws of Punjab." },
      { name: "Sindh Code", url: "http://sindhlaws.gov.pk/", desc: "Provincial statutes and regulations for Sindh." }
    ]
  },
  {
    title: "Superior Courts",
    icon: <Landmark size={18} className="text-emerald-400" />,
    links: [
      { name: "Supreme Court of Pakistan", url: "https://www.supremecourt.gov.pk/", desc: "Cause lists, judgments, and court roster." },
      { name: "Lahore High Court", url: "https://lhc.gov.pk/", desc: "Case tracking, judgments, and cause lists for LHC." },
      { name: "Sindh High Court", url: "https://sindhhighcourt.gov.pk/", desc: "Official portal for the High Court of Sindh." },
      { name: "Islamabad High Court", url: "https://ihc.gov.pk/", desc: "Judgments and rosters for the Capital territory." }
    ]
  },
  {
    title: "Corporate & Tax",
    icon: <Building2 size={18} className="text-emerald-400" />,
    links: [
      { name: "SECP eServices", url: "https://eservices.secp.gov.pk/", desc: "Securities and Exchange Commission portal for company filings." },
      { name: "FBR IRIS", url: "https://iris.fbr.gov.pk/", desc: "Federal Board of Revenue tax filing portal." },
      { name: "FBR Active Taxpayers", url: "https://e.fbr.gov.pk/esbn/", desc: "Verify ATL status of individuals and companies." }
    ]
  },
  {
    title: "Bar Councils & Associations",
    icon: <Scale size={18} className="text-emerald-400" />,
    links: [
      { name: "Pakistan Bar Council", url: "http://pakistanbarcouncil.org/", desc: "Federal regulatory body for lawyers in Pakistan." },
      { name: "Punjab Bar Council", url: "https://pbbarcouncil.com/", desc: "Provincial licensing and regulatory authority." },
      { name: "Sindh Bar Council", url: "https://sindhbarcouncil.org/", desc: "Advocate licensing and disciplinary body for Sindh." }
    ]
  }
];

export function LegalLinks() {
  const [activeIframe, setActiveIframe] = useState<{name: string, url: string} | null>(null);
  const [iframeKey, setIframeKey] = useState(0); // For forcing refresh

  return (
    <div className="flex flex-col h-full bg-[#0D0D0E] overflow-hidden text-white selection:bg-emerald-500/30">
      
      {/* Header */}
      <div className="h-20 border-b border-zinc-800 flex items-center px-8 bg-[#0D0D0E] shrink-0 z-10 sticky top-0 justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/30">
            <Link2 size={20} className="text-emerald-400" />
          </div>
          <div className="flex flex-col">
            <h1 className="font-sans-hero text-xl font-bold tracking-widest uppercase text-white">
              Legal Resource Directory
            </h1>
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
              Quick Access Portals
            </span>
          </div>
        </div>
        
        {/* Search / Filter Bar (Visual Only for now) */}
        {!activeIframe && (
          <div className="flex items-center gap-2">
            <input 
              type="text" 
              placeholder="Filter resources..." 
              className="bg-[#18181C] border border-zinc-800 rounded-lg px-4 py-2 text-xs text-white placeholder-white/20 outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {activeIframe ? (
          /* Iframe Viewer Mode */
          <motion.div 
            key="iframe"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="flex-1 flex flex-col bg-[#18181C] m-6 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl"
          >
            {/* Embedded Toolbar */}
            <div className="h-12 border-b border-zinc-800 bg-[#0D0D0E]/80 flex items-center justify-between px-4 shrink-0">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setActiveIframe(null)}
                  className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  <ChevronLeft size={14} /> Back to Directory
                </button>
                <div className="w-px h-4 bg-zinc-800" />
                <span className="text-xs font-bold uppercase tracking-widest text-white/80">{activeIframe.name}</span>
                <span className="text-[10px] font-mono text-white/40">{activeIframe.url}</span>
              </div>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIframeKey(k => k + 1)}
                  className="p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded transition-colors"
                  title="Refresh Page"
                >
                  <RefreshCw size={14} />
                </button>
                <a 
                  href={activeIframe.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded text-[9px] font-bold uppercase tracking-widest transition-colors"
                >
                  <ExternalLink size={12} /> Open External
                </a>
                <button 
                  onClick={() => setActiveIframe(null)}
                  className="p-1.5 text-white/50 hover:text-white hover:bg-rose-500/20 hover:text-rose-400 rounded transition-colors ml-2"
                  title="Close Viewer"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
            
            <div className="flex-1 bg-white relative">
              {/* Note: Many external sites set X-Frame-Options to DENY or SAMEORIGIN, so this iframe may be blocked in a real browser for those specific sites. 
                  The "Open External" button serves as the necessary fallback. */}
              <iframe 
                key={iframeKey}
                src={activeIframe.url}
                className="w-full h-full border-none"
                title={activeIframe.name}
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
              />
            </div>
          </motion.div>
        ) : (
          /* Grid Directory Mode */
          <motion.div 
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 overflow-y-auto p-8 custom-scrollbar"
          >
            <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-8 pb-32">
              
              {CATEGORIES.map((category, idx) => (
                <div 
                  key={idx}
                  className="bg-[#18181C] border border-zinc-800 flex flex-col"
                >
                  <div className="flex items-center gap-3 p-6 border-b border-zinc-800/80 bg-[#0D0D0E]/30">
                    <div className="w-8 h-8 rounded bg-emerald-500/10 flex items-center justify-center border border-emerald-500/30">
                      {category.icon}
                    </div>
                    <h2 className="text-sm font-sans-hero font-bold uppercase tracking-widest text-white">{category.title}</h2>
                  </div>

                  <div className="flex flex-col p-6 gap-4">
                    {category.links.map((link, lIdx) => (
                      <button 
                        key={lIdx}
                        onClick={() => setActiveIframe({ name: link.name, url: link.url })}
                        className="group flex flex-col text-left p-4 bg-[#0D0D0E] hover:bg-emerald-500/5 border border-zinc-800 hover:border-emerald-500/30 transition-all"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="text-xs font-bold uppercase tracking-widest text-white group-hover:text-emerald-400 transition-colors flex items-center gap-2">
                            {link.name}
                          </h4>
                          <ExternalLink size={12} className="text-white/20 group-hover:text-emerald-400 transition-colors" />
                        </div>
                        <p className="text-[10px] font-medium tracking-widest uppercase text-white/40 leading-relaxed">
                          {link.desc}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              ))}

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

