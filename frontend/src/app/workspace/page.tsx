"use client";

import React, { useState, useRef } from 'react';
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from 'react-resizable-panels';
import { LegalChat } from '@/components/LegalChat';
import DraftEditor, { DraftJSON } from '@/components/DraftEditor';
import { WorkspaceHub } from '@/components/WorkspaceHub';
import { CloudUpload, FileText, Bot, Scale, Expand, Shrink, FileUp, Sparkles, Database } from 'lucide-react';
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

  // Layout State
  const [layoutMode, setLayoutMode] = useState<'default' | 'review' | 'writing' | 'research'>('default');

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
  
  // Modern Resize Handle
  const ResizeHandle = () => (
    <PanelResizeHandle className="w-1 bg-zinc-800 hover:bg-emerald-500 cursor-col-resize transition-colors shrink-0" />
  );

  const [primaryView, setPrimaryView] = useState<'hub' | 'ocr' | 'draft' | 'chat'>('hub');

  const handleHubSelect = (mod: 'ocr' | 'chat' | 'draft') => {
    setPrimaryView(mod);
  };

  const renderOcrModule = () => (
    <div className="flex flex-col h-full bg-[#0D0D12]">
      <div className="h-14 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md px-6 flex items-center justify-between shrink-0 z-10 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
            <FileUp size={16} className="text-emerald-500" />
          </div>
          <h3 className="text-xs font-black tracking-[0.2em] text-zinc-300 uppercase">OCR Engine</h3>
        </div>
        <div>
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*,.pdf" />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-2 text-xs font-bold tracking-widest bg-emerald-500 text-white hover:bg-emerald-600 px-4 py-2 rounded-lg transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] shrink-0 uppercase"
          >
            <CloudUpload size={16} />
            {isUploading ? 'Scanning...' : 'Upload Evidence'}
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6 flex flex-col relative custom-scrollbar bg-zinc-950/50">
        {sourceDocState.url ? (
          <div className="flex-1 flex flex-col gap-6 max-w-6xl mx-auto w-full">
            <div className="flex-1 w-full border border-zinc-800/80 rounded-2xl overflow-hidden bg-black/60 p-4 flex items-center justify-center shadow-2xl relative min-h-[500px]">
              <img src={sourceDocState.url} alt="Source Document" className="max-w-full max-h-full object-contain drop-shadow-2xl relative z-0" />
              
              <AnimatePresence>
                {hoveredCitation && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="absolute z-10 w-3/4 max-w-lg h-40 top-1/4 left-1/2 -translate-x-1/2 bg-emerald-500/10 border-2 border-emerald-500/80 shadow-[0_0_40px_rgba(16,185,129,0.3)] rounded-xl pointer-events-none flex flex-col backdrop-blur-[1px]"
                  >
                    <div className="absolute -top-3 left-4 bg-emerald-500 text-black text-[10px] font-black px-3 py-1 rounded-sm uppercase tracking-widest shadow-lg">
                      Fact Link Active
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-emerald-500/10" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {sourceDocState.extractedFacts.length > 0 && (
              <div className="shrink-0 p-5 bg-zinc-900/80 backdrop-blur-md border border-zinc-800/80 rounded-2xl shadow-xl">
                <h4 className="text-xs font-black text-emerald-500 uppercase tracking-widest mb-4 flex items-center gap-2">
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
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-600 gap-6 border-2 border-dashed border-zinc-800/80 rounded-3xl m-6 bg-zinc-900/20 max-w-4xl mx-auto w-full min-h-[500px]">
            <div className="w-24 h-24 rounded-full bg-zinc-900/50 flex items-center justify-center border border-zinc-800">
              <FileUp size={40} className="text-zinc-700" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-black text-zinc-400 tracking-widest uppercase mb-2">Immersive Reading Mode</h2>
              <p className="text-sm text-zinc-500 font-medium max-w-md mx-auto">Upload an FIR or Evidence document to view it in full screen and extract interactive facts.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderDraftModule = () => (
    <div className="flex flex-col h-full bg-[#16161D]">
      <div className="flex-1 overflow-hidden relative">
        <DraftEditor draftData={draftState.jsonContent} petitionType="Pre-emption Plaint" />
      </div>
    </div>
  );

  const renderChatModule = () => (
    <div className="flex flex-col h-full bg-[#0D0D12]">
      <div className="h-14 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md px-6 flex items-center justify-between shrink-0 z-10 sticky top-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
            <Bot size={16} className="text-emerald-500" />
          </div>
          <h3 className="text-xs font-black tracking-[0.2em] text-zinc-200 uppercase">AI Copilot</h3>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-md text-[9px] font-bold text-emerald-400 uppercase tracking-widest">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Qwen 3.6
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-hidden relative flex flex-col max-w-5xl mx-auto w-full border-x border-zinc-800/50 bg-zinc-950/20 shadow-2xl">
        <LegalChat key={chatKey} onGenerateDraft={handleGenerateDraft} onCitationHover={setHoveredCitation} />
        {aiState.isGenerating && (
          <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-md flex items-center justify-center z-50">
            <div className="bg-zinc-900 border border-emerald-500/30 shadow-2xl p-6 rounded-2xl flex flex-col items-center gap-5">
              <div className="w-10 h-10 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">Drafting Document...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const DockIcon = ({ icon: Icon, label, isActive, onClick }: any) => (
    <button 
      onClick={onClick}
      className={`group relative flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 ${
        isActive 
          ? 'bg-emerald-500/20 text-emerald-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_0_20px_rgba(16,185,129,0.2)]' 
          : 'bg-transparent text-zinc-400 hover:bg-zinc-800/80 hover:text-zinc-100'
      }`}
    >
      <Icon size={22} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]' : ''} />
      
      {/* Tooltip */}
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-zinc-900 border border-zinc-700 text-zinc-200 text-[10px] font-bold uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
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
              className="flex items-center gap-2 px-3 py-3 bg-zinc-950/70 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] ring-1 ring-black/50"
            >
              <DockIcon 
                icon={FileUp} 
                label="OCR Engine" 
                isActive={primaryView === 'ocr'} 
                onClick={() => setPrimaryView('ocr')} 
              />
              <DockIcon 
                icon={Scale} 
                label="Draft Canvas" 
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
          border: 2px solid rgba(9, 9, 11, 1); /* bg-zinc-950 */
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.2);
        }
      `}} />
    </div>
  );
}
