"use client";

import React, { useState, useRef } from 'react';
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from 'react-resizable-panels';
import { LegalChat } from '@/components/LegalChat';
import DraftEditor, { DraftJSON } from '@/components/DraftEditor';
import { WorkspaceHub } from '@/components/WorkspaceHub';
import { MootCourtSimulator } from '@/components/MootCourtSimulator';
import { LegalLinks } from '@/components/LegalLinks';
import { PetitionDrafter } from '@/components/PetitionDrafter';
import { CloudUpload, FileText, Bot, Scale, Expand, Shrink, FileUp, Sparkles, Database, ScrollText, ShieldAlert, CheckCircle, XCircle, AlertTriangle, GitCompare, Gavel, Link2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function WorkspacePage() {
  // Global Workspace State
  const [sourceDocState, setSourceDocState] = useState({ 
    url: null as string | null, 
    ocrJson: null, 
    activeHighlightId: null,
    extractedFacts: [] as {id: string, type: string, value: string}[]
  });
  const [draftState, setDraftState] = useState({ jsonContent: null as DraftJSON | null, selectedText: '', activeVersion: 1 });
  const [aiState, setAiState] = useState({ extractedEntities: [], chatHistory: [], isGenerating: false });
  
  // OCR State
  const [isUploading, setIsUploading] = useState(false);
  const [chatKey, setChatKey] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Cross-Panel State
  const [hoveredCitation, setHoveredCitation] = useState<string | null>(null);

  // Analyzer State
  const [analyzerText, setAnalyzerText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzerResults, setAnalyzerResults] = useState<any[]>([]);
  const [analyzerError, setAnalyzerError] = useState<string | null>(null);

  // Contradiction State
  const [docAText, setDocAText] = useState('');
  const [docBText, setDocBText] = useState('');
  const [isFindingContradictions, setIsFindingContradictions] = useState(false);
  const [contradictionResults, setContradictionResults] = useState<any[]>([]);
  const [contradictionError, setContradictionError] = useState<string | null>(null);

  // Layout State
  const [layoutMode, setLayoutMode] = useState<'default' | 'review' | 'writing' | 'research'>('default');
  
  const [primaryView, setPrimaryView] = useState<'hub' | 'ocr' | 'draft' | 'petition' | 'chat' | 'analyze' | 'contradiction' | 'moot' | 'links'>('hub');

  // Smart Assembly State
  const [assemblyContext, setAssemblyContext] = useState('');
  const [assemblyType, setAssemblyType] = useState('Rental Agreement');
  const [isAssembling, setIsAssembling] = useState(false);
  const [draftHtml, setDraftHtml] = useState<string | null>(null);

  const handleHubSelect = (mod: 'ocr' | 'chat' | 'draft' | 'petition' | 'analyze' | 'contradiction' | 'moot' | 'links') => {
    setPrimaryView(mod);
  };

  const handleGenerateDraft = async (context: string) => {
    setAiState(prev => ({ ...prev, isGenerating: true }));
    try {
      const response = await fetch('http://127.0.0.1:8001/api/v1/drafter/generate_json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document_type: "Pre-emption Plaint",
          context_text: context
        }),
      });

      if (!response.ok) {
        throw new Error(`Draft generation failed: ${response.status}`);
      }

      const data: DraftJSON = await response.json();
      setDraftState(prev => ({ ...prev, jsonContent: data }));
    } catch (error) {
      console.error("Error generating draft:", error);
      alert("Failed to generate draft. Ensure backend is running.");
    } finally {
      setAiState(prev => ({ ...prev, isGenerating: false }));
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    const objectUrl = URL.createObjectURL(file);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('http://127.0.0.1:8001/api/v1/ocr/process', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('OCR process failed');

      const data = await res.json();
      sessionStorage.setItem('ocrContext', JSON.stringify({ text: data.text || 'No text found in document.' }));
      setChatKey(prev => prev + 1);
      
      // Mock Extracted Facts for Demo
      const mockFacts = [
        { id: '1', type: 'Person', value: 'Muhammad Ali (Complainant)' },
        { id: '2', type: 'Date', value: '14-Aug-2023 14:30' },
        { id: '3', type: 'Weapon', value: '9mm Pistol (Recovered)' },
        { id: '4', type: 'Location', value: 'DHA Phase 5' }
      ];
      
      setSourceDocState(prev => ({ ...prev, url: objectUrl as any, extractedFacts: mockFacts }));
      
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      console.error(error);
      alert('Failed to process document');
    } finally {
      setIsUploading(false);
    }
  };
  
  const runContradictionEngine = async () => {
    if (!docAText.trim() || !docBText.trim()) return;
    setIsFindingContradictions(true);
    setContradictionError(null);
    try {
      const res = await fetch('http://localhost:8001/api/v1/analyze-contradictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          doc_a_text: docAText, 
          doc_a_label: "Document A",
          doc_b_text: docBText,
          doc_b_label: "Document B"
        })
      });
      if (!res.ok) throw new Error("Analysis failed");
      const data = await res.json();
      setContradictionResults(data.contradictions || []);
    } catch (err) {
      console.error("Contradiction engine failed", err);
      setContradictionError("Failed to run the contradiction engine. Ensure the backend is running.");
    } finally {
      setIsFindingContradictions(false);
    }
  };

  const renderContradictionModule = () => (
    <div className="flex flex-col h-full bg-zinc-950">
      <div className="h-14 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md px-6 flex items-center justify-between shrink-0 z-10 sticky top-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-900/50 flex items-center justify-center border border-zinc-800 shadow-sm">
            <GitCompare size={16} className="text-purple-500" />
          </div>
          <h3 className="text-xs font-semibold tracking-tight text-zinc-200 uppercase">Contradiction Engine</h3>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={runContradictionEngine}
            disabled={isFindingContradictions}
            className="flex items-center gap-2 text-xs font-bold tracking-tight bg-purple-500 text-white hover:bg-purple-600 px-4 py-2 rounded-lg transition-all shadow-sm shrink-0 uppercase"
          >
            {isFindingContradictions ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <GitCompare size={16} />}
            {isFindingContradictions ? 'Analyzing...' : 'Find Loopholes'}
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden relative flex flex-col md:flex-row max-w-[1400px] mx-auto w-full gap-6 p-6">
        {/* Left: Input Documents */}
        <div className="flex-1 flex flex-col gap-6">
          <div className="flex-1 flex flex-col gap-2">
            <h4 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-tight">Document A (e.g. FIR)</h4>
            <textarea 
              className="flex-1 bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-300 focus:outline-none focus:border-zinc-700 resize-none custom-scrollbar"
              placeholder="Paste the first document here..."
              value={docAText}
              onChange={(e) => setDocAText(e.target.value)}
            />
          </div>
          <div className="flex-1 flex flex-col gap-2">
            <h4 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-tight">Document B (e.g. Medical Report or Witness Statement)</h4>
            <textarea 
              className="flex-1 bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-300 focus:outline-none focus:border-zinc-700 resize-none custom-scrollbar"
              placeholder="Paste the second document here..."
              value={docBText}
              onChange={(e) => setDocBText(e.target.value)}
            />
          </div>
        </div>

        {/* Right: Results Dashboard */}
        <div className="w-[500px] flex flex-col gap-3">
          <h4 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-tight">Identified Contradictions</h4>
          <div className="flex-1 bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 overflow-y-auto custom-scrollbar flex flex-col gap-4">
            {contradictionError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
                <AlertTriangle size={24} className="mx-auto mb-2 text-red-500" />
                <p className="text-xs text-red-400 font-medium">{contradictionError}</p>
              </div>
            )}
              {contradictionResults.length === 0 && !isFindingContradictions && !contradictionError && (
              <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
                <GitCompare size={40} className="mb-4 text-zinc-600" />
                <p className="text-sm font-medium text-zinc-400">No documents compared yet.</p>
              </div>
            )}
            
            {contradictionResults.map((res, i) => (
              <div key={i} className="p-4 rounded-xl border bg-zinc-900/50 border-zinc-800">
                <div className="flex items-start justify-between mb-3">
                  <h5 className="font-semibold text-sm text-purple-400 tracking-wide uppercase">{res.topic}</h5>
                  <AlertTriangle size={16} className="text-purple-500 shrink-0" />
                </div>
                
                <div className="flex flex-col gap-2 mb-4">
                  <div className="bg-zinc-900/50 rounded-lg p-3 border border-zinc-800">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Doc A states:</span>
                    <p className="text-xs text-zinc-300">"{res.doc_a_claims}"</p>
                  </div>
                  <div className="flex justify-center -my-3 z-10 relative">
                    <div className="bg-zinc-950 p-1 rounded-full border border-zinc-800 text-zinc-500">
                      <XCircle size={14} />
                    </div>
                  </div>
                  <div className="bg-zinc-900/50 rounded-lg p-3 border border-zinc-800">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Doc B states:</span>
                    <p className="text-xs text-zinc-300">"{res.doc_b_claims}"</p>
                  </div>
                </div>

                <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3">
                  <span className="text-[10px] font-bold text-emerald-500 uppercase block mb-1">Cross-Examination Strategy:</span>
                  <p className="text-xs text-emerald-400 font-medium">{res.suggested_question}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const runAnalyzer = async () => {
    if (!analyzerText.trim()) return;
    setIsAnalyzing(true);
    setAnalyzerError(null);
    try {
      const res = await fetch('http://localhost:8001/api/v1/analyze-opponent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ document_text: analyzerText })
      });
      if (!res.ok) throw new Error("Failed to scan document");
      const data = await res.json();
      setAnalyzerResults(data.citations || []);
    } catch (err) {
      console.error("Analysis failed", err);
      setAnalyzerError("Unable to connect to the analysis engine. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderAnalyzerModule = () => (
    <div className="flex flex-col h-full bg-zinc-950">
      <div className="h-14 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md px-6 flex items-center justify-between shrink-0 z-10 sticky top-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-900/50 flex items-center justify-center border border-zinc-800 shadow-sm">
            <ShieldAlert size={16} className="text-red-500" />
          </div>
          <h3 className="text-xs font-semibold tracking-tight text-zinc-200 uppercase">Opponent Analyzer</h3>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={runAnalyzer}
            disabled={isAnalyzing}
            className="flex items-center gap-2 text-xs font-bold tracking-tight bg-red-500 text-white hover:bg-red-600 px-4 py-2 rounded-lg transition-all shadow-sm shrink-0 uppercase"
          >
            {isAnalyzing ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <ShieldAlert size={16} />}
            {isAnalyzing ? 'Scanning...' : 'Scan For Red Flags'}
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden relative flex max-w-7xl mx-auto w-full gap-6 p-6">
        <div className="flex-1 flex flex-col gap-3">
          <h4 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-tight">Opponent's Brief / Arguments</h4>
          <textarea 
            className="flex-1 bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-300 focus:outline-none focus:border-zinc-700 resize-none custom-scrollbar"
            placeholder="Paste the opposing counsel's arguments or petition here to scan for cited case law..."
            value={analyzerText}
            onChange={(e) => setAnalyzerText(e.target.value)}
          />
        </div>

        <div className="w-[450px] flex flex-col gap-3">
          <h4 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-tight">Threat Dashboard</h4>
          <div className="flex-1 bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 overflow-y-auto custom-scrollbar flex flex-col gap-3">
            {analyzerError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
                <AlertTriangle size={24} className="mx-auto mb-2 text-red-500" />
                <p className="text-xs text-red-400 font-medium">{analyzerError}</p>
              </div>
            )}
              {analyzerResults.length === 0 && !isAnalyzing && !analyzerError && (
              <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
                <ShieldAlert size={40} className="mb-4 text-zinc-600" />
                <p className="text-sm font-medium text-zinc-400">No citations scanned yet.</p>
              </div>
            )}
            
            {analyzerResults.map((res, i) => {
              const isOverruled = res.status === 'OVERRULED';
              const isGood = res.status === 'GOOD_LAW';
              
              return (
                <div key={i} className={`p-4 rounded-xl border ${
                  isOverruled ? 'bg-zinc-900/50 border-zinc-800' : 
                  isGood ? 'bg-zinc-900/50 border-zinc-800' : 
                  'bg-zinc-900/50 border-zinc-800'
                }`}>
                  <div className="flex items-start justify-between mb-2">
                    <h5 className="font-bold text-sm text-white tracking-wide">{res.citation}</h5>
                    {isOverruled ? <XCircle size={16} className="text-red-500" /> : 
                     isGood ? <CheckCircle size={16} className="text-emerald-500" /> : 
                     <AlertTriangle size={16} className="text-yellow-500" />}
                  </div>
                  <p className={`text-xs font-bold mb-3 uppercase tracking-wider ${
                    isOverruled ? 'text-red-400' : isGood ? 'text-emerald-400' : 'text-yellow-400'
                  }`}>
                    {isOverruled ? 'CRITICAL: OVERRULED LAW' : isGood ? 'VALID PRECEDENT' : res.status}
                  </p>
                  <p className="text-xs text-zinc-400 italic mb-2">"{res.snippet}"</p>
                  <div className="bg-zinc-900/50 rounded-lg p-2 mt-2">
                    <p className="text-[10px] font-medium text-zinc-300">
                      <span className="opacity-50">AI Note:</span> {res.message}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  const renderOcrModule = () => (
    <div className="flex flex-col h-full bg-zinc-950">
      <div className="h-14 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md px-6 flex items-center justify-between shrink-0 z-10 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-900/50 flex items-center justify-center border border-zinc-800">
            <FileUp size={16} className="text-emerald-500" />
          </div>
          <h3 className="text-xs font-semibold tracking-tight text-zinc-300 uppercase">OCR Engine</h3>
        </div>
        <div>
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*,.pdf" />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-2 text-xs font-bold tracking-tight bg-emerald-500 text-white hover:bg-emerald-600 px-4 py-2 rounded-lg transition-all shadow-sm shrink-0 uppercase"
          >
            <CloudUpload size={16} />
            {isUploading ? 'Scanning...' : 'Upload Evidence'}
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6 flex flex-col relative custom-scrollbar bg-zinc-950/50">
        {sourceDocState.url ? (
          <div className="flex-1 flex flex-col gap-6 max-w-6xl mx-auto w-full">
            <div className="flex-1 w-full border border-zinc-800/80 rounded-lg overflow-hidden bg-black/60 p-4 flex items-center justify-center shadow-2xl relative min-h-[500px]">
              <img src={sourceDocState.url} alt="Source Document" className="max-w-full max-h-full object-contain drop-shadow-2xl relative z-0" />
              
              <AnimatePresence>
                {hoveredCitation && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="absolute z-10 w-3/4 max-w-lg h-40 top-1/4 left-1/2 -translate-x-1/2 bg-zinc-900/50 border-2 border-emerald-500/80 shadow-sm rounded-xl pointer-events-none flex flex-col backdrop-blur-[1px]"
                  >
                    <div className="absolute -top-3 left-4 bg-emerald-500 text-black text-[10px] font-semibold px-3 py-1 rounded-sm uppercase tracking-tight shadow-lg">
                      Fact Link Active
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-emerald-500/10" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {sourceDocState.extractedFacts.length > 0 && (
              <div className="shrink-0 p-5 bg-zinc-900/80 backdrop-blur-md border border-zinc-800/80 rounded-lg shadow-xl">
                <h4 className="text-xs font-semibold text-emerald-500 uppercase tracking-tight mb-4 flex items-center gap-2">
                  <Database size={14} /> Extracted Entities (Drag & Drop)
                </h4>
                <div className="flex flex-wrap gap-3">
                  {sourceDocState.extractedFacts.map((fact) => (
                    <div
                      key={fact.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('application/json', JSON.stringify(fact));
                        e.dataTransfer.effectAllowed = 'copy';
                      }}
                      className="cursor-grab active:cursor-grabbing flex items-center gap-2.5 px-4 py-2 bg-zinc-950 border border-zinc-700 hover:border-emerald-500/60 hover:bg-emerald-500/5 rounded-xl shadow-lg hover:shadow-emerald-500/20 transition-all group"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 group-hover:animate-pulse" />
                      <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{fact.type}:</span>
                      <span className="text-sm font-semibold text-zinc-100">{fact.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-600 gap-6 border-2 border-dashed border-zinc-800/80 rounded-xl m-6 bg-zinc-900/20 max-w-4xl mx-auto w-full min-h-[500px]">
            <div className="w-24 h-24 rounded-full bg-zinc-900/50 flex items-center justify-center border border-zinc-800">
              <FileUp size={40} className="text-zinc-700" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-semibold text-zinc-400 tracking-tight uppercase mb-2">Immersive Reading Mode</h2>
              <p className="text-sm text-zinc-500 font-medium max-w-md mx-auto">Upload an FIR or Evidence document to view it in full screen and extract interactive facts.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const runSmartAssembly = async () => {
    if (!assemblyContext.trim()) return;
    setIsAssembling(true);
    try {
      const res = await fetch('http://localhost:8001/api/v1/drafter/assemble', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          template_type: assemblyType,
          client_context: assemblyContext
        })
      });
      const data = await res.json();
      setDraftHtml(data.html_document);
      
      if (data.missing_variables && data.missing_variables.length > 0) {
        alert("Missing Variables detected:\n" + data.missing_variables.join(", "));
      }
    } catch (err) {
      console.error("Assembly failed", err);
    } finally {
      setIsAssembling(false);
    }
  };

  const renderDraftModule = () => (
    <div className="flex flex-col h-full bg-[#16161D]">
      <div className="h-14 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md px-6 flex items-center justify-between shrink-0 z-10 sticky top-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-900/50 flex items-center justify-center border border-zinc-800 shadow-sm">
            <Scale size={16} className="text-emerald-500" />
          </div>
          <h3 className="text-xs font-semibold tracking-tight text-zinc-200 uppercase">Draft Canvas & Smart Assembly</h3>
        </div>
      </div>
      
      <div className="flex-1 flex overflow-hidden w-full max-w-[1600px] mx-auto">
        {/* Left: Smart Assembly Panel */}
        <div className="w-[350px] border-r border-zinc-800/50 bg-zinc-950/50 flex flex-col p-4 shrink-0 overflow-y-auto custom-scrollbar">
          <h4 className="text-[10px] font-semibold text-emerald-500 uppercase tracking-tight mb-4 flex items-center gap-2">
            <Sparkles size={14} /> Auto-Assemble Template
          </h4>
          
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-tight">Select Template</label>
              <select 
                value={assemblyType} 
                onChange={(e) => setAssemblyType(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-sm text-zinc-200 focus:outline-none focus:border-zinc-700"
              >
                <option value="Rental Agreement">Rental Agreement</option>
                <option value="Legal Notice">Legal Notice</option>
              </select>
            </div>
            
            <div className="flex flex-col gap-2 flex-1 min-h-[250px]">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-tight">Client Notes / Email</label>
              <textarea 
                value={assemblyContext}
                onChange={(e) => setAssemblyContext(e.target.value)}
                className="flex-1 bg-zinc-900/50 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-300 focus:outline-none focus:border-zinc-700 resize-none custom-scrollbar"
                placeholder="E.g. The landlord is Ali Khan (CNIC 123) and tenant is Bob (CNIC 456). Rent is 50,000 for 11 months starting Jan 1st..."
              />
            </div>
            
            <button 
              onClick={runSmartAssembly}
              disabled={isAssembling}
              className="w-full flex items-center justify-center gap-2 text-xs font-bold tracking-tight bg-emerald-500 text-white hover:bg-emerald-600 px-4 py-3 rounded-xl transition-all shadow-sm uppercase"
            >
              {isAssembling ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Sparkles size={16} />}
              {isAssembling ? 'Extracting Data...' : 'Generate Auto-Fill'}
            </button>
          </div>
        </div>
        
        {/* Right: Draft Editor */}
        <div className="flex-1 overflow-hidden relative bg-[#16161D]">
          <DraftEditor draftData={draftState.jsonContent} htmlContent={draftHtml} petitionType="Custom Assembly" />
        </div>
      </div>
    </div>
  );

  const renderChatModule = () => (
    <div className="flex flex-col h-full bg-zinc-950">
      <div className="h-14 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md px-6 flex items-center justify-between shrink-0 z-10 sticky top-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-900/50 flex items-center justify-center border border-zinc-800 shadow-sm">
            <Bot size={16} className="text-emerald-500" />
          </div>
          <h3 className="text-xs font-semibold tracking-tight text-zinc-200 uppercase">AI Copilot</h3>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-900/50 border border-zinc-800 rounded-md text-[9px] font-bold text-emerald-400 uppercase tracking-tight">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Qwen 3.6
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-hidden relative flex flex-col max-w-5xl mx-auto w-full border-x border-zinc-800/50 bg-zinc-950/20 shadow-2xl">
        <LegalChat key={chatKey} onGenerateDraft={handleGenerateDraft} onCitationHover={setHoveredCitation} />
        {aiState.isGenerating && (
          <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-md flex items-center justify-center z-50">
            <div className="bg-zinc-900 border border-zinc-800 shadow-2xl p-6 rounded-lg flex flex-col items-center gap-5">
              <div className="w-10 h-10 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
              <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-tight">Drafting Document...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const DockIcon = ({ icon: Icon, label, isActive, onClick, alert }: any) => (
    <button 
      onClick={onClick}
      className={`group relative flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 ${
        isActive && !alert
          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
          : isActive && alert
            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
            : 'bg-transparent text-zinc-400 hover:bg-zinc-800/80 hover:text-zinc-100'
      }`}
    >
      <Icon size={22} strokeWidth={isActive ? 2.5 : 2} className={isActive ? (alert ? 'drop-shadow-sm' : 'drop-shadow-sm') : ''} />
      
      {/* Tooltip */}
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-zinc-900 border border-zinc-700 text-zinc-200 text-[10px] font-bold uppercase tracking-tight rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
        {label}
      </div>
    </button>
  );

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden bg-zinc-950 text-zinc-100 font-sans">
      
      {primaryView === 'hub' ? (
        <WorkspaceHub onSelect={handleHubSelect} />
      ) : (
        <div className="flex-1 flex w-full h-full overflow-hidden relative">
          
          {/* Main Immersive Canvas */}
          <div className="flex-1 w-full h-full overflow-hidden relative z-0">
              <AnimatePresence mode="wait">
              <motion.div 
                key={primaryView}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.2 }}
                className="w-full h-full"
              >
                {primaryView === 'links' && <LegalLinks />}
                {primaryView === 'petition' && <div className="h-full overflow-y-auto"><PetitionDrafter /></div>}
                {primaryView === 'moot' && <MootCourtSimulator />}
                {primaryView === 'analyze' && renderAnalyzerModule()}
                {primaryView === 'contradiction' && renderContradictionModule()}
                {primaryView === 'ocr' && renderOcrModule()}
                {primaryView === 'draft' && renderDraftModule()}
                {primaryView === 'chat' && renderChatModule()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* The Jurista Glass Dock */}
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="flex items-center gap-2 px-3 py-3 bg-zinc-950/70 backdrop-blur-xl border border-zinc-800 rounded-lg shadow-[0_20px_50px_rgba(0,0,0,0.5)] ring-1 ring-black/50"
            >
              <DockIcon 
                icon={Link2} 
                label="Legal Links" 
                isActive={primaryView === 'links'} 
                onClick={() => setPrimaryView('links')} 
              />
              <DockIcon 
                icon={Gavel} 
                label="Moot Court" 
                isActive={primaryView === 'moot'} 
                onClick={() => setPrimaryView('moot')} 
              />
              <DockIcon 
                icon={GitCompare} 
                label="Contradiction Engine" 
                isActive={primaryView === 'contradiction'} 
                onClick={() => setPrimaryView('contradiction')} 
              />
              <DockIcon 
                icon={ShieldAlert} 
                label="Opponent Analyzer" 
                isActive={primaryView === 'analyze'} 
                onClick={() => setPrimaryView('analyze')} 
                alert={true}
              />
              <div className="w-px h-8 bg-zinc-800 mx-1" />
              <DockIcon 
                icon={FileUp} 
                label="OCR Engine" 
                isActive={primaryView === 'ocr'} 
                onClick={() => setPrimaryView('ocr')} 
              />
              <DockIcon 
                icon={Sparkles} 
                label="Smart Assembly" 
                isActive={primaryView === 'draft'} 
                onClick={() => setPrimaryView('draft')} 
              />
              <DockIcon 
                icon={Bot} 
                label="AI Copilot" 
                isActive={primaryView === 'chat'}
                onClick={() => setPrimaryView('chat')} 
              />
            </motion.div>
          </div>

        </div>
      )}
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 20px;
          border: 2px solid rgba(9, 9, 11, 1);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.2);
        }
      `}} />
    </div>
  );
}




