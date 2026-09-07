"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileText, ChevronRight, CheckCircle2, Copy, PlayCircle, Settings, HelpCircle, Download, FileWarning, Calendar, User, MessageSquare, ExternalLink, RefreshCw, ScanText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock response for quick processing
const PPC_DEFINITIONS: Record<string, string> = {
  "PPC 386": "Extortion by putting a person in fear of death or grievous hurt",
  "CrPC 154": "Information in cognizable cases (FIR)",
  "PPC 302": "Punishment of qatl-i-amd (Murder)",
  "PPC 324": "Attempt to commit qatl-i-amd",
  "CrPC 497": "When bail may be taken in case of non-bailable offence"
};

export default function OcrReviewPage() {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  
  // Pipeline State
  const [stage, setStage] = useState<'upload' | 'processing' | 'results'>('upload');
  const [processStep, setProcessStep] = useState(0); 
  
  // Result State
  const [result, setResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'urdu' | 'english'>('urdu');
  const [errorMsg, setErrorMsg] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const processDocument = async (uploadedFile: File) => {
    setStage('processing');
    setProcessStep(0);
    setErrorMsg('');
    
    // Step 1: Preprocessing
    setTimeout(() => setProcessStep(1), 800);
    
    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);

      const res = await fetch('http://127.0.0.1:8001/api/v1/ocr/scan', {
        method: 'POST',
        body: formData
      });

      // Step 2: Running Models
      setProcessStep(2);
      
      if (!res.ok) throw new Error("Vision API processing failed.");
      
      const data = await res.json();
      
      setTimeout(() => {
        setResult(data);
        setStage('results');
      }, 800);

    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to connect to the OCR processing engine. Please ensure the backend server is running.");
      setStage('upload');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      processDocument(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      processDocument(e.target.files[0]);
    }
  };

  const handleDemoClick = async (type: string) => {
    // For demo purposes, we will try to fetch a local demo file or simulate a failure gracefully
    try {
      const response = await fetch(`/demo-${type}.pdf`);
      if (response.ok) {
        const blob = await response.blob();
        const demoFile = new File([blob], `demo-${type}.pdf`, { type: 'application/pdf' });
        setFile(demoFile);
        processDocument(demoFile);
      } else {
        throw new Error("Demo file not found");
      }
    } catch (err) {
      setErrorMsg(`Demo file for ${type} could not be loaded.`);
    }
  };

  return (
    <div className="w-full h-full flex bg-[#0D0D0E] relative overflow-hidden text-white selection:bg-emerald-500/30">
      
      {/* Top right actions */}
      <div className="absolute top-6 right-8 flex items-center gap-4 z-20">
        <button className="pill-dark w-10 h-10 hover:bg-white/10 text-white"><Settings size={18} /></button>
        <button className="pill-dark w-10 h-10 hover:bg-white/10 text-white"><HelpCircle size={18} /></button>
      </div>

      <div className="flex-1 flex flex-col h-full max-w-6xl mx-auto p-8 pt-24 pb-8 z-10 w-full relative">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/30">
              <ScanText className="text-emerald-400" size={20} />
            </div>
            <h1 className="font-sans-hero text-4xl font-semibold tracking-wider uppercase text-white">
              OCR ENGINE
            </h1>
          </div>
          <h2 className="text-sm font-medium text-white/50 uppercase tracking-widest pl-14">
            Digitize & Translate Legal Urdu Documents
          </h2>
        </div>

        {stage === 'upload' && (
          <div className="flex-1 flex flex-col items-center justify-center max-h-[60vh] mt-10">
            <div 
              className={`w-full max-w-3xl h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed transition-all rounded-xl ${
                dragActive ? 'border-emerald-500 bg-emerald-500/5 scale-[1.02]' : 'border-zinc-800 hover:border-emerald-500/50 bg-[#18181C]'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input 
                ref={fileInputRef}
                type="file" 
                className="hidden" 
                accept=".pdf,image/png,image/jpeg"
                onChange={handleChange}
              />
              
              <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6">
                <Upload size={40} className={`transition-colors ${dragActive ? 'text-emerald-400' : 'text-white/40'}`} />
              </div>
              <h2 className="text-2xl font-bold font-sans-hero mb-2 uppercase tracking-wide">Upload Document</h2>
              <p className="text-[10px] uppercase tracking-widest text-white/40 mb-8 font-bold">PDF, PNG, JPG up to 25MB</p>
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="pill-dark px-10 py-4 bg-emerald-500 text-black hover:bg-emerald-500/80 font-bold tracking-widest uppercase text-xs transition-colors"
              >
                Select Files
              </button>
              
              {errorMsg && (
                <div className="mt-6 text-rose-500 font-bold text-xs uppercase tracking-widest bg-rose-500/10 px-4 py-2 rounded-lg border border-rose-500/20">
                  {errorMsg}
                </div>
              )}
            </div>

            <div className="mt-8 flex items-center gap-4">
              <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Demo Presets:</span>
              <button onClick={() => handleDemoClick('fir')} className="pill-dark px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-white/5 text-emerald-400 border-emerald-500/30">
                Load Sample Urdu FIR (PPC 386)
              </button>
              <button onClick={() => handleDemoClick('bail')} className="pill-dark px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-white/5 text-emerald-400 border-emerald-500/30">
                Load Sample Bail Order
              </button>
            </div>
          </div>
        )}

        {stage === 'processing' && (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="bg-[#18181C] border border-zinc-800 p-12 rounded-xl flex flex-col items-center max-w-xl w-full shadow-2xl">
              
              <div className="w-24 h-24 rounded-full border border-emerald-500/30 flex items-center justify-center mb-10 relative">
                <div className="absolute inset-0 border-t-2 border-emerald-500 rounded-full animate-spin"></div>
                <ScanText size={32} className="text-emerald-400 animate-pulse" />
              </div>
              
              <div className="w-full flex flex-col gap-6">
                {[
                  { title: "Preprocessing & Noise Reduction", step: 0 },
                  { title: "Running EasyOCR Vision Models", step: 1 },
                  { title: "Entity Extraction & Legal Parsing", step: 2 }
                ].map((s, i) => {
                  const isCompleted = processStep > s.step;
                  const isActive = processStep === s.step;
                  const isPending = processStep < s.step;
                  
                  return (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-6 h-6 shrink-0 flex items-center justify-center">
                        {isCompleted ? (
                          <CheckCircle2 size={20} className="text-emerald-500" />
                        ) : isActive ? (
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-zinc-700" />
                        )}
                      </div>
                      <span className={`text-xs font-bold uppercase tracking-widest ${isCompleted ? 'text-white/60' : isActive ? 'text-emerald-400' : 'text-zinc-600'}`}>
                        {s.title}
                      </span>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>
        )}

        {stage === 'results' && result && (
          <div className="flex-1 flex gap-6 overflow-hidden mt-4">
            
            {/* Left: Document View */}
            <div className="flex-1 flex flex-col bg-[#18181C] border border-zinc-800 rounded-xl overflow-hidden relative">
              
              {/* Tab Switcher */}
              <div className="flex items-center border-b border-zinc-800 p-2 gap-2 bg-[#0D0D0E]/50">
                <button 
                  onClick={() => setActiveTab('urdu')}
                  className={`flex-1 py-3 text-xs font-bold tracking-widest uppercase transition-colors rounded-lg ${activeTab === 'urdu' ? 'bg-zinc-800 text-emerald-400 border border-zinc-700' : 'text-white/50 hover:bg-white/5 hover:text-white'}`}
                >
                  Urdu (Raw FIR)
                </button>
                <button 
                  onClick={() => setActiveTab('english')}
                  className={`flex-1 py-3 text-xs font-bold tracking-widest uppercase transition-colors rounded-lg ${activeTab === 'english' ? 'bg-zinc-800 text-emerald-400 border border-zinc-700' : 'text-white/50 hover:bg-white/5 hover:text-white'}`}
                >
                  English (AI Translation)
                </button>
              </div>
              
              {/* Content Area */}
              <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
                {activeTab === 'urdu' ? (
                  <div dir="rtl" className="font-urdu text-right leading-[2.5] text-zinc-200 text-lg md:text-xl font-medium">
                    {result.raw_text.split('\n').map((line: string, i: number) => (
                      <p key={i} className="mb-4">{line}</p>
                    ))}
                  </div>
                ) : (
                  <div className="leading-relaxed text-zinc-200 text-sm md:text-base font-medium">
                    {result.translation.split('\n').map((line: string, i: number) => (
                      <p key={i} className="mb-4">{line}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Interactive Legal Entities Sidebar */}
            <div className="w-[350px] shrink-0 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
              
              <div className="bg-[#18181C] border border-zinc-800 rounded-xl p-6">
                <h3 className="font-sans-hero font-bold tracking-widest text-xs uppercase mb-4 text-emerald-400 flex items-center gap-2">
                  <User size={14} /> Extracted Parties
                </h3>
                {result.summary?.parties?.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {result.summary.parties.map((p: string, i: number) => (
                      <div key={i} className="bg-[#0D0D0E] border border-zinc-800 p-3 rounded-lg text-xs font-bold uppercase tracking-tight text-white/80">
                        {p}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-white/40 text-xs">No parties detected.</p>
                )}
              </div>

              <div className="bg-[#18181C] border border-zinc-800 rounded-xl p-6">
                <h3 className="font-sans-hero font-bold tracking-widest text-xs uppercase mb-4 text-amber-400 flex items-center gap-2">
                  <FileWarning size={14} /> Penal Codes & Sections
                </h3>
                {result.summary?.sections?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {result.summary.sections.map((s: string, i: number) => (
                      <div key={i} className="group relative">
                        <span className="cursor-pointer bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-colors inline-block">
                          {s}
                        </span>
                        {PPC_DEFINITIONS[s] && (
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all bg-zinc-950 border border-zinc-800 shadow-2xl rounded-lg z-50 pointer-events-none text-left">
                            <p className="text-xs text-white/80 leading-relaxed font-medium capitalize m-0">{PPC_DEFINITIONS[s]}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-white/40 text-xs">No sections detected.</p>
                )}
              </div>

              <div className="bg-[#18181C] border border-zinc-800 rounded-xl p-6">
                <h3 className="font-sans-hero font-bold tracking-widest text-xs uppercase mb-4 text-blue-400 flex items-center gap-2">
                  <Calendar size={14} /> Dates & Events
                </h3>
                {result.summary?.events?.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {result.summary.events.map((e: string, i: number) => (
                      <div key={i} className="flex items-center gap-2 bg-[#0D0D0E] border border-zinc-800 p-3 rounded-lg text-xs font-bold uppercase tracking-tight text-white/80">
                        <Calendar size={12} className="text-blue-400" /> {e}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-white/40 text-xs">No dates detected.</p>
                )}
              </div>
              
              {/* Bottom Drafting Suite & Primary Actions */}
              <div className="bg-[#18181C] border border-zinc-800 rounded-xl p-6 mt-auto">
                <h3 className="font-sans-hero font-bold tracking-widest text-xs uppercase mb-4 text-white flex items-center gap-2">
                  Automated Drafting Suite
                </h3>
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={() => {
                      sessionStorage.setItem('ocrContext', JSON.stringify(result));
                      window.location.href = '/chat';
                    }} 
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold tracking-widest uppercase text-[10px] flex items-center justify-center gap-2 transition-colors rounded-lg"
                  >
                    <MessageSquare size={16} /> Analyze In Chat
                  </button>

                  <button 
                    onClick={() => { setStage('upload'); setResult(null); }} 
                    className="w-full py-3 bg-transparent border border-zinc-700 text-zinc-300 hover:bg-white/5 font-bold tracking-widest uppercase text-[10px] flex items-center justify-center gap-2 transition-colors rounded-lg"
                  >
                    <RefreshCw size={14} /> Scan Another Document
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
