"use client";

import React, { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Download, FileText, CheckCircle2, Sparkles, Scale, Shield, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import 'react-quill/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

export interface DraftJSON {
  court_name?: string;
  parties?: string;
  facts_and_averments?: string[];
  cause_of_action?: string;
  valuation_and_jurisdiction?: string;
  legal_grounds?: string[];
  prayer_clause?: string;
  verification?: string;
}

interface DraftEditorProps {
  draftData: DraftJSON | null;
  htmlContent?: string | null;
  petitionType: string;
}

export default function DraftEditor({ draftData, htmlContent, petitionType }: DraftEditorProps) {
  const [content, setContent] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const editorRef = useRef<any>(null);

  // Floating AI Quick Actions State
  const [selectedRange, setSelectedRange] = useState<{ index: number, length: number } | null>(null);
  const [selectionBounds, setSelectionBounds] = useState<{ top: number, left: number, width: number } | null>(null);
  const [selectedText, setSelectedText] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [diffResult, setDiffResult] = useState<{ original: string, new: string } | null>(null);

  useEffect(() => {
    if (htmlContent) {
      setContent(htmlContent);
      return;
    }
    if (!draftData) {
      setContent("");
      return;
    }

    let html = `<div style="font-family: 'Times New Roman', serif; text-align: justify; line-height: 1.6;">`;
    
    if (draftData.court_name) {
      html += `<h2 style="text-align: center; font-weight: bold; text-decoration: underline; text-transform: uppercase;">${draftData.court_name}</h2><br/>`;
    }
    
    if (draftData.parties) {
      const partiesParts = draftData.parties.split(' vs.');
      if (partiesParts.length === 2) {
        html += `<p style="text-align: center;"><strong>${partiesParts[0].trim()}</strong></p>`;
        html += `<p style="text-align: center;"><em>Versus</em></p>`;
        html += `<p style="text-align: center;"><strong>${partiesParts[1].trim()}</strong></p><br/>`;
      } else {
        html += `<p style="text-align: center; font-weight: bold;">${draftData.parties}</p><br/>`;
      }
    }
    
    html += `<h3 style="text-align: center; font-weight: bold; text-decoration: underline;">${petitionType.toUpperCase()}</h3><br/>`;
    html += `<p><strong>Respectfully Sheweth:</strong></p>`;

    if (draftData.facts_and_averments && draftData.facts_and_averments.length > 0) {
      draftData.facts_and_averments.forEach((fact, idx) => {
        const cleanFact = fact.replace(/^\d+\.\s*/, '');
        html += `<p style="margin-bottom: 10px;">${idx + 1}. ${cleanFact}</p>`;
      });
    }

    if (draftData.cause_of_action) {
      html += `<p style="margin-bottom: 10px;"><strong>Cause of Action:</strong> ${draftData.cause_of_action}</p>`;
    }

    if (draftData.valuation_and_jurisdiction) {
      html += `<p style="margin-bottom: 10px;"><strong>Valuation & Jurisdiction:</strong> ${draftData.valuation_and_jurisdiction}</p>`;
    }

    if (draftData.legal_grounds && draftData.legal_grounds.length > 0) {
      html += `<p style="margin-top: 15px; margin-bottom: 5px;"><strong>GROUNDS:</strong></p>`;
      draftData.legal_grounds.forEach((ground, idx) => {
        const cleanGround = ground.replace(/^\d+\.\s*/, '');
        html += `<p style="margin-bottom: 10px;">${idx + 1}. ${cleanGround}</p>`;
      });
    }

    if (draftData.prayer_clause) {
      html += `<br/><p style="margin-bottom: 10px;"><strong>PRAYER:</strong></p>`;
      html += `<p>${draftData.prayer_clause}</p><br/><br/>`;
    }

    if (draftData.verification) {
      html += `<p style="text-align: right; margin-top: 40px;">_______________________</p>`;
      html += `<p style="text-align: right;">Plaintiff / Petitioner</p><br/>`;
      html += `<p><strong>VERIFICATION:</strong><br/>${draftData.verification}</p>`;
    }

    html += `</div>`;
    setContent(html);
  }, [draftData, petitionType]);

  const handleExportWord = async () => { /* ... original export code ... */ };

  const handleSelectionChange = (range: any, source: string, editor: any) => {
    if (range && range.length > 0) {
      const text = editor.getText(range.index, range.length);
      const bounds = editor.getBounds(range.index, range.length);
      setSelectedRange(range);
      setSelectedText(text);
      setSelectionBounds(bounds);
    } else {
      // Don't close immediately if diff is open
      if (!diffResult && !isAiLoading) {
        setSelectedRange(null);
        setSelectionBounds(null);
      }
    }
  };

  const executeAiAction = (action: string) => {
    setIsAiLoading(true);
    
    // MOCK AI PROCESSING
    setTimeout(() => {
      let result = selectedText;
      if (action === 'polish') result = `It is respectfully submitted that ${selectedText.toLowerCase()}`;
      if (action === 'legalese') result = `That the averments made in the preceding paragraphs categorically demonstrate that ${selectedText}`;
      if (action === 'anonymize') result = selectedText.replace(/[A-Z][a-z]+/g, "[REDACTED]");
      
      setDiffResult({
        original: selectedText,
        new: result
      });
      setIsAiLoading(false);
    }, 1200);
  };

  const handleAcceptDiff = () => {
    if (!selectedRange || !diffResult || !editorRef.current) return;
    const editor = editorRef.current.getEditor();
    editor.deleteText(selectedRange.index, selectedRange.length);
    editor.insertText(selectedRange.index, diffResult.new);
    handleRejectDiff();
  };

  const handleRejectDiff = () => {
    setDiffResult(null);
    setSelectedRange(null);
    setSelectionBounds(null);
    setIsAiLoading(false);
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      [{ 'direction': 'rtl' }],
      ['clean']
    ],
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-900/50 flex items-center justify-center border border-zinc-800">
            <Scale size={20} className="text-emerald-500" />
          </div>
          <div>
            <h2 className="font-bold text-sm text-zinc-100 uppercase tracking-tight">Draft Editor</h2>
            <p className="text-[10px] text-zinc-500 tracking-wider uppercase">{petitionType || "No Draft Selected"}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            disabled={!content}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-lg text-xs font-semibold tracking-tight uppercase flex items-center gap-2 transition-all shadow-sm"
          >
            <Download size={14} strokeWidth={2.5} />
            Export DOCX
          </button>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 overflow-y-auto bg-white editor-container relative">
        {!draftData ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#16161D] text-zinc-600">
            <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center mb-6 border border-zinc-800">
              <FileText size={32} strokeWidth={1.5} />
            </div>
            <p className="text-sm font-bold tracking-tight uppercase">Generate a draft to start editing</p>
          </div>
        ) : (
          <>
            // @ts-ignore
<ReactQuill 
              ref={editorRef}
              theme="snow" 
              value={content} 
              onChange={setContent}
              onChangeSelection={handleSelectionChange}
              modules={modules}
              className="h-full border-none text-black relative"
            />
            
            {/* FLOATING AI TOOLBAR & DIFF VIEWER */}
            <AnimatePresence>
              {selectionBounds && !diffResult && !isAiLoading && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  style={{
                    position: 'absolute',
                    top: selectionBounds.top - 60,
                    left: Math.max(20, selectionBounds.left + (selectionBounds.width / 2) - 150),
                    zIndex: 50
                  }}
                  className="bg-zinc-950 border border-zinc-800 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] p-1.5 flex gap-1"
                >
                  <button onClick={() => executeAiAction('polish')} className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-zinc-800 rounded-lg text-zinc-300 hover:text-emerald-400 text-xs font-bold transition-colors">
                    <Sparkles size={14} /> Polish
                  </button>
                  <div className="w-px h-6 bg-zinc-800 my-auto mx-1" />
                  <button onClick={() => executeAiAction('legalese')} className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-zinc-800 rounded-lg text-zinc-300 hover:text-emerald-400 text-xs font-bold transition-colors">
                    <Scale size={14} /> Legalese
                  </button>
                  <div className="w-px h-6 bg-zinc-800 my-auto mx-1" />
                  <button onClick={() => executeAiAction('anonymize')} className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-zinc-800 rounded-lg text-zinc-300 hover:text-emerald-400 text-xs font-bold transition-colors">
                    <Shield size={14} /> Anonymize
                  </button>
                </motion.div>
              )}

              {isAiLoading && selectionBounds && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{
                    position: 'absolute',
                    top: selectionBounds.top - 50,
                    left: Math.max(20, selectionBounds.left + (selectionBounds.width / 2) - 80),
                    zIndex: 50
                  }}
                  className="bg-zinc-950 border border-zinc-700 rounded-xl shadow-2xl px-4 py-2 flex items-center gap-3"
                >
                  <div className="w-4 h-4 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">AI Thinking...</span>
                </motion.div>
              )}

              {diffResult && selectionBounds && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  style={{
                    position: 'absolute',
                    top: selectionBounds.top + selectionBounds.height + 10,
                    left: Math.max(20, selectionBounds.left - 50),
                    zIndex: 50,
                    maxWidth: '400px'
                  }}
                  className="bg-zinc-950 border border-zinc-800 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden"
                >
                  <div className="px-4 py-2 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-emerald-500 uppercase tracking-tight flex items-center gap-1.5">
                      <Sparkles size={12} /> AI Suggestion
                    </span>
                  </div>
                  
                  <div className="p-4 flex flex-col gap-3 text-sm">
                    <div className="bg-zinc-900/50 border border-zinc-800 text-red-400 p-3 rounded-lg line-through opacity-70">
                      {diffResult.original}
                    </div>
                    <div className="bg-zinc-900/50 border border-zinc-800 text-emerald-400 p-3 rounded-lg font-medium shadow-[inset_0_0_20px_rgba(16,185,129,0.05)]">
                      {diffResult.new}
                    </div>
                  </div>

                  <div className="p-3 border-t border-zinc-800 bg-zinc-900/50 flex items-center justify-end gap-2">
                    <button onClick={handleRejectDiff} className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg text-xs font-bold transition-colors">
                      <X size={14} /> Reject
                    </button>
                    <button onClick={handleAcceptDiff} className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-colors shadow-lg shadow-emerald-500/20">
                      <Check size={14} /> Accept Change
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .editor-container .ql-container {
          font-family: 'Times New Roman', serif;
          font-size: 16px;
          border: none !important;
        }
        .editor-container .ql-toolbar {
          border: none !important;
          border-bottom: 1px solid #e5e7eb !important;
          background-color: #f8fafc;
          position: sticky;
          top: 0;
          z-index: 10;
        }
        .editor-container .ql-editor {
          padding: 40px;
          min-height: 100%;
        }
        /* Custom selection color to match Jurista theme */
        .editor-container .ql-editor::selection {
          background-color: rgba(16, 185, 129, 0.3);
        }
      `}} />
    </div>
  );
}
