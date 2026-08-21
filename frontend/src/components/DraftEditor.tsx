"use client";

import React, { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Download, FileText, CheckCircle2 } from 'lucide-react';
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
  petitionType: string;
}

export default function DraftEditor({ draftData, petitionType }: DraftEditorProps) {
  const [content, setContent] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const editorRef = useRef<any>(null);

  useEffect(() => {
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

  const getSaveFilename = (defaultName: string) => {
    const filename = window.prompt("Enter filename to save as:", defaultName);
    return filename || defaultName;
  };

  const handleExportWord = async () => {
    if (!content) return;
    try {
      let handle = null;
      let finalFilename = `Petition_${petitionType.replace(/\s+/g, '_')}.docx`;
      
      if (window.showSaveFilePicker) {
        handle = await window.showSaveFilePicker({
          suggestedName: finalFilename,
          types: [{
            description: 'Word Document',
            accept: { 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] },
          }],
        });
      } else {
        finalFilename = getSaveFilename(finalFilename);
      }
      
      setIsExporting(true);
      const response = await fetch('/api/export-docx', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ html: content }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const blob = await response.blob();
      
      if (handle) {
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
      } else {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = finalFilename;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (e: any) {
      if (e.name !== 'AbortError') {
        console.error(e);
        alert('Failed to export Word Document');
      }
    } finally {
      setIsExporting(false);
    }
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
    <div className="flex flex-col h-full bg-[#121215] border border-white/5 rounded-[20px] overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between bg-black/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
            <FileText size={20} className="text-white/70" />
          </div>
          <div>
            <h2 className="font-sans-hero font-bold text-lg text-white uppercase tracking-widest">Draft Editor</h2>
            <p className="text-xs text-white/40">{petitionType || "No Draft Selected"}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={handleExportWord}
            disabled={isExporting || !content}
            className="px-5 py-2.5 bg-lime hover:bg-lime/90 disabled:opacity-50 disabled:hover:bg-lime text-black rounded-xl text-xs font-black tracking-widest uppercase flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(163,230,53,0.3)]"
          >
            <Download size={16} strokeWidth={2.5} />
            Export DOCX
          </button>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 overflow-y-auto bg-[#F8FAFC] editor-container relative">
        {!draftData ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#121215] text-white/30">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/10">
              <FileText size={32} strokeWidth={1.5} />
            </div>
            <p className="text-sm font-bold tracking-widest uppercase">Generate a draft to start editing</p>
          </div>
        ) : (
          <ReactQuill 
            ref={editorRef}
            theme="snow" 
            value={content} 
            onChange={setContent} 
            modules={modules}
            className="h-full border-none text-black"
          />
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
      `}} />
    </div>
  );
}
