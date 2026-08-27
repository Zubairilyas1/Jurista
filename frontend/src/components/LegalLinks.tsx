"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Landmark, BookOpen, Scale, Building2, Gavel, FileText } from 'lucide-react';

const CATEGORIES = [
  {
    title: "Statutes & Case Law",
    icon: <BookOpen size={18} className="text-blue-500" />,
    color: "blue",
    links: [
      { name: "Pakistan Code", url: "http://pakistancode.gov.pk/", desc: "Official portal for all Federal Laws of Pakistan." },
      { name: "Punjab Laws Online", url: "http://punjablaws.gov.pk/", desc: "Database of all provincial laws of Punjab." },
      { name: "Sindh Code", url: "http://sindhlaws.gov.pk/", desc: "Provincial statutes and regulations for Sindh." }
    ]
  },
  {
    title: "Superior Courts",
    icon: <Landmark size={18} className="text-amber-500" />,
    color: "amber",
    links: [
      { name: "Supreme Court of Pakistan", url: "https://www.supremecourt.gov.pk/", desc: "Cause lists, judgments, and court roster." },
      { name: "Lahore High Court", url: "https://lhc.gov.pk/", desc: "Case tracking, judgments, and cause lists for LHC." },
      { name: "Sindh High Court", url: "https://sindhhighcourt.gov.pk/", desc: "Official portal for the High Court of Sindh." },
      { name: "Islamabad High Court", url: "https://ihc.gov.pk/", desc: "Judgments and rosters for the Capital territory." }
    ]
  },
  {
    title: "Corporate & Tax",
    icon: <Building2 size={18} className="text-emerald-500" />,
    color: "emerald",
    links: [
      { name: "SECP eServices", url: "https://eservices.secp.gov.pk/", desc: "Securities and Exchange Commission portal for company filings." },
      { name: "FBR IRIS", url: "https://iris.fbr.gov.pk/", desc: "Federal Board of Revenue tax filing portal." },
      { name: "FBR Active Taxpayers", url: "https://e.fbr.gov.pk/esbn/", desc: "Verify ATL status of individuals and companies." }
    ]
  },
  {
    title: "Bar Councils & Associations",
    icon: <Scale size={18} className="text-purple-500" />,
    color: "purple",
    links: [
      { name: "Pakistan Bar Council", url: "http://pakistanbarcouncil.org/", desc: "Federal regulatory body for lawyers in Pakistan." },
      { name: "Punjab Bar Council", url: "https://pbbarcouncil.com/", desc: "Provincial licensing and regulatory authority." },
      { name: "Sindh Bar Council", url: "https://sindhbarcouncil.org/", desc: "Advocate licensing and disciplinary body for Sindh." }
    ]
  }
];

export function LegalLinks() {
  return (
    <div className="flex flex-col h-full bg-zinc-950 overflow-hidden">
      {/* Header */}
      <div className="h-16 border-b border-zinc-800 bg-zinc-950 px-8 flex items-center shrink-0 z-10 sticky top-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-zinc-900 flex items-center justify-center border border-zinc-800">
            <ExternalLink size={20} className="text-zinc-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold tracking-tight text-zinc-100">Legal Resource Directory</h3>
            <p className="text-xs font-medium text-zinc-400">Quick Access Links</p>
          </div>
        </div>
      </div>

      {/* Grid Content */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-8 pb-32">
          
          {CATEGORIES.map((category, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-zinc-900/30 border border-zinc-800 rounded-lg p-6"
            >
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-800/50">
                <div className={`p-2 rounded-lg bg-zinc-800 text-zinc-300`}>
                  {category.icon}
                </div>
                <h2 className="text-sm font-semibold text-zinc-100">{category.title}</h2>
              </div>

              <div className="flex flex-col gap-4">
                {category.links.map((link, lIdx) => (
                  <a 
                    key={lIdx}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block p-4 bg-zinc-900/50 hover:bg-zinc-800/50 border border-zinc-800 hover:border-zinc-700 rounded-xl transition-colors"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="text-sm font-medium text-zinc-200 group-hover:text-zinc-100 transition-colors flex items-center gap-2">
                        {link.name}
                        <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </h4>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">{link.desc}</p>
                  </a>
                ))}
              </div>
            </motion.div>
          ))}

        </div>
      </div>
    </div>
  );
}
