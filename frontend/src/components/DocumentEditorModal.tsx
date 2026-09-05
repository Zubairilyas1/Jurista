"use client";

import React, { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, FileText, CheckCircle2 } from 'lucide-react';
import 'react-quill/dist/quill.snow.css';

// Dynamic import for react-quill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

interface DocumentEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialHtml: string;
  petitionType: string;
}

export default function DocumentEditorModal({ isOpen, onClose, initialHtml, petitionType }: DocumentEditorModalProps) {
  const [content, setContent] = useState(initialHtml);
  const [isExporting, setIsExporting] = useState(false);
  const editorRef = useRef<any>(null);

  useEffect(() => {
    setContent(initialHtml);
  }, [initialHtml]);

  const getSaveFilename = (defaultName: string) => {
    const filename = window.prompt("Enter filename to save as:", defaultName);
    return filename || defaultName;
  };

  const handleExportPDF = async () => {
    try {
      let handle = null;
      let finalFilename = `Petition_${petitionType}.pdf`;
      
      if ((window as any).showSaveFilePicker) {
        handle = await (window as any).showSaveFilePicker({
          suggestedName: finalFilename,
          types: [{
            description: 'PDF Document',
            accept: { 'application/pdf': ['.pdf'] },
          }],
        });
      } else {
        finalFilename = getSaveFilename(finalFilename);
      }
      
      setIsExporting(true);
      const html2pdf = (await import('html2pdf.js')).default;
      const element = document.createElement('div');
      element.innerHTML = content;
      element.style.padding = '20px';
      
      const opt = {
        margin:       1,
        filename:     finalFilename,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
      };

      const pdfWorker = // @ts-ignore
html2pdf().set(opt).from(element);
      const pdfBlob = await pdfWorker.output('blob');
      
      if (handle) {
        const writable = await handle.createWritable();
        await writable.write(pdfBlob);
        await writable.close();
      } else {
        const url = window.URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = finalFilename;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (e: any) {
      if (e.name !== 'AbortError') {
        console.error(e);
        alert('Failed to export PDF');
      }
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportWord = async () => {
    try {
      let handle = null;
      let finalFilename = `Petition_${petitionType}.docx`;
      
      if ((window as any).showSaveFilePicker) {
        handle = await (window as any).showSaveFilePicker({
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

  const handleExportText = async () => {
    if (editorRef.current) {
      try {
        let handle = null;
        let finalFilename = `Petition_${petitionType}.txt`;
        
        if ((window as any).showSaveFilePicker) {
          handle = await (window as any).showSaveFilePicker({
            suggestedName: finalFilename,
            types: [{
              description: 'Text Document',
              accept: { 'text/plain': ['.txt'] },
            }],
          });
        } else {
          finalFilename = getSaveFilename(finalFilename);
        }
        
        setIsExporting(true);
        const text = editorRef.current.getEditor().getText();
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        
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
          alert('Failed to export Text Document');
        }
      } finally {
        setIsExporting(false);
      }
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

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-zinc-950 border border-zinc-800 rounded-lg shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden relative"
        >
          {/* Header */}
          <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <FileText size={20} className="text-emerald-400" />
              </div>
              <div>
                <h2 className="font-sans-hero font-bold text-lg text-white uppercase tracking-wider">Draft Editor</h2>
                <p className="text-xs text-white/50">{petitionType}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-zinc-900/50 rounded-xl p-1 border border-zinc-800">
                <button 
                  onClick={handleExportWord}
                  disabled={isExporting}
                  className="px-4 py-2 hover:bg-white/10 rounded-lg text-xs font-bold tracking-wider uppercase flex items-center gap-2 text-white transition-colors"
                >
                  Word
                </button>
                <div className="w-[1px] h-4 bg-white/10"></div>
                <button 
                  onClick={handleExportPDF}
                  disabled={isExporting}
                  className="px-4 py-2 hover:bg-white/10 rounded-lg text-xs font-bold tracking-wider uppercase flex items-center gap-2 text-white transition-colors"
                >
                  PDF
                </button>
              </div>
              
              <button onClick={onClose} className="p-2 text-white/50 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Editor Area */}
          <div className="flex-1 overflow-y-auto bg-white editor-container">
            // @ts-ignore
<ReactQuill 
              ref={editorRef}
              theme="snow" 
              value={content} 
              onChange={setContent} 
              modules={modules}
              className="h-full border-none text-black"
            />
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
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
