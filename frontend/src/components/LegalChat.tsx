"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Mic, FileText, Settings, HelpCircle, CheckCircle2, AlertTriangle, Send, ChevronDown, Database, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  citations?: {
    citation: string;
    raw_text: string;
    validity_status?: string;
  }[];
  isAttachment?: boolean;
}

const ThinkingBlock = ({ thinking, verification }: { thinking?: string, verification?: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  if (!thinking && !verification) return null;

  return (
    <div className="border border-white/10 rounded-xl bg-black/40 overflow-hidden mb-4">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full flex items-center justify-between p-3 text-xs uppercase tracking-widest font-bold text-muted hover:bg-white/5 transition-colors"
      >
        <span className="flex items-center gap-2"><Sparkles size={14} className="text-lime" /> AI Thought & Verification</span>
        <ChevronDown size={16} className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4 pb-4 text-sm text-white/60 font-light italic leading-relaxed whitespace-pre-wrap flex flex-col gap-4"
          >
            {thinking && (
              <div>
                <span className="font-bold text-white/40 not-italic uppercase tracking-widest text-[10px] block mb-1">Reasoning</span>
                {thinking}
              </div>
            )}
            {verification && (
              <div className="border-t border-white/5 pt-3">
                <span className="font-bold text-lime/50 not-italic uppercase tracking-widest text-[10px] block mb-1">Fact-Check Verification</span>
                {verification}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CitationsBlock = ({ citations, searchQuery, onHover }: { citations: any[], searchQuery: string, onHover?: (c: string | null) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedCitation, setExpandedCitation] = useState<number | null>(null);

  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    const stopWords = ['what', 'is', 'the', 'for', 'a', 'an', 'and', 'or', 'to', 'in', 'of', 'how', 'are', 'there', 'any'];
    const keywords = query.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 2 && !stopWords.includes(w));

    if (keywords.length === 0) return text;

    const regex = new RegExp(`(${keywords.join('|')})`, 'gi');
    
    const parts = text.split(regex);
    return parts.map((part, i) => {
      if (part.toLowerCase().match(regex)) {
        return <span key={i} className="bg-lime/20 text-lime font-bold rounded px-0.5">{part}</span>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="mt-6 pt-5 border-t border-white/5">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="flex items-center gap-2 text-[10px] font-black text-muted hover:text-white uppercase tracking-widest transition-colors mb-2"
      >
        <ChevronDown size={14} className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        VIEW {citations.length} SOURCES CITED
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex flex-col gap-2 overflow-hidden mt-4"
          >
            {citations.map((c, i) => (
              <div 
                key={i} 
                className="flex flex-col bg-black/40 border border-white/5 rounded-xl overflow-hidden transition-colors"
                onMouseEnter={() => onHover?.(c.citation)}
                onMouseLeave={() => onHover?.(null)}
              >
                <div 
                  onClick={() => setExpandedCitation(expandedCitation === i ? null : i)}
                  className="flex items-center justify-between p-3 cursor-pointer hover:bg-white/5"
                >
                  <div className="flex items-start gap-3 text-sm">
                    <FileText size={16} className="text-lime mt-0.5 shrink-0" />
                    <span className="text-white/80 font-medium">{c.citation.replace(/\?/g, '—')}</span>
                  </div>
                  <ChevronDown size={14} className={`text-muted transform transition-transform ${expandedCitation === i ? 'rotate-180' : ''}`} />
                </div>
                
                <AnimatePresence>
                  {expandedCitation === i && (
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="px-4 pb-4 pt-2 text-sm text-white/60 leading-relaxed border-t border-white/5"
                    >
                      {highlightText(c.raw_text, searchQuery)}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const LegalChat: React.FC<LegalChatProps> = ({onGenerateDraft, onCitationHover}) => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      if (data && data.value) {
        setQuery(prev => prev + (prev ? ' ' : '') + `"${data.value}"`);
      }
    } catch (err) {
      // ignore non-json drops
    }
  };

  const triggerApiCall = async (currentMessages: Message[]) => {
    setLoading(true);
    try {
      const history = currentMessages.slice(-6).map(m => ({
        role: m.type,
        content: m.content
      }));

      const res = await fetch('http://127.0.0.1:8001/api/v1/rag/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: currentMessages[currentMessages.length - 1].content, 
          top_k: 5,
          history: history
        }),
      });

      if (!res.ok) throw new Error('Failed to fetch response');
      const data = await res.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: data.answer.Full_Answer || data.answer.Applicable_Law || 'No answer found.',
        citations: data.citations,
        status: data.grounding_status
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        type: 'assistant', 
        content: 'Sorry, I encountered an error while processing your request.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const ocrContextStr = sessionStorage.getItem('ocrContext');
    if (ocrContextStr) {
      try {
        const ocrData = JSON.parse(ocrContextStr);
        
        const hiddenContextMsg: Message = {
          id: (Date.now() - 1).toString(),
          type: 'user',
          content: `[SYSTEM: USER SCANNED A DOCUMENT. HERE IS THE TRANSCRIBED TEXT TO USE AS CONTEXT FOR THE FOLLOWING QUESTIONS:]

${ocrData.text}`,
          isAttachment: true
        };
        
        const autoQueryMsg: Message = {
          id: Date.now().toString(),
          type: 'user',
          content: "Please provide a complete English summary of this document, including the date, parties, and the crime. Then explain the laws involved (e.g. PPC sections)."
        };
        
        const newMessages = [hiddenContextMsg, autoQueryMsg];
        setMessages(newMessages);
        sessionStorage.removeItem('ocrContext');
        
        triggerApiCall(newMessages);
      } catch (e) {
        console.error("Failed to parse ocr context", e);
      }
    }
  }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim() || loading) return;

    const userMessage: Message = { id: Date.now().toString(), type: 'user', content: query.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setQuery('');
    
    triggerApiCall(newMessages);
  };

  const renderStatus = (status?: string, msgIndex?: number, content?: string) => {
    if (!status) return null;
    const isGrounded = status === 'GROUNDED';
    return (
      <div className="flex items-center justify-between mb-4 w-full">
        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
          isGrounded ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
        }`}>
          {isGrounded ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
          {status.replace(/_/g, ' ')}
        </div>
        
        {onGenerateDraft && (
          <button
            onClick={() => {
              const previousUserMsg = msgIndex !== undefined && msgIndex > 0 ? messages[msgIndex - 1]?.content : query;
              const contextText = `User Question: ${previousUserMsg}\n\nLegal Answer:\n${content || ''}`;
              onGenerateDraft(contextText);
            }}
            className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase bg-lime/10 text-lime border border-lime/30 px-3 py-1.5 rounded-lg hover:bg-lime/20 transition-colors"
          >
            <FileText size={14} />
            Convert to Court Draft
          </button>
        )}
      </div>
    );
  };

    const renderMessageContent = (msg: Message) => {
      if (msg.isAttachment) {
        return (
          <div className="bg-black/30 border border-white/5 rounded-2xl p-4 flex items-center gap-4 w-full max-w-sm mt-1 mb-2">
             <div className="w-12 h-12 bg-lime/10 text-lime flex items-center justify-center rounded-xl shrink-0">
               <FileText size={24} />
             </div>
             <div className="flex flex-col">
               <span className="font-bold text-white text-sm uppercase tracking-wide">Document Attached</span>
               <span className="text-white/40 text-xs">AI context has been updated.</span>
             </div>
          </div>
        );
      }
      if (msg.type === 'user') return msg.content;
      
      let content = msg.content;
      let thinking = '';
      let suggestedQuestions: string[] = [];

      // Extract thinking block
      const thinkMatch = content.match(/<think>([\s\S]*?)<\/think>/);
      if (thinkMatch) {
        thinking = thinkMatch[1].trim();
        content = content.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
      }

      // Extract suggested questions
      const suggestionsMatch = content.match(/### Suggested Questions([\s\S]*)$/);
      if (suggestionsMatch) {
        const listText = suggestionsMatch[1];
        suggestedQuestions = listText.split('\n')
          .filter(line => line.trim().startsWith('*') || line.trim().startsWith('-'))
          .map(line => line.replace(/^[\*\-]\s*/, '').trim());
        content = content.replace(/### Suggested Questions[\s\S]*$/, '').trim();
      }

      let openDrafter = false;
      if (content.includes('[OPEN_PETITION_DRAFTER]')) {
        openDrafter = true;
        content = content.replace('[OPEN_PETITION_DRAFTER]', '').trim();
      }

      const markdownContent = content.replace(/\[(\d+)\]/g, '[$1](#cite-$1)');

      return (
        <div className="flex flex-col gap-4 w-full">
          <ThinkingBlock thinking={thinking} verification={msg.status === 'GROUNDED' ? 'Citations successfully cross-referenced with Jurista Legal Graph.' : undefined} />
          
          <div className="text-white/90 leading-relaxed font-medium prose prose-invert prose-lime prose-p:mb-4 prose-ul:mb-4 prose-li:my-1 prose-headings:text-lime max-w-none">
            <ReactMarkdown 
               remarkPlugins={[remarkGfm]}
               components={{
                 a: ({node, href, children, ...props}) => {
                   if (href?.startsWith('#cite-')) {
                     const citeIdx = parseInt(href.replace('#cite-', ''), 10) - 1;
                     const citation = msg.citations?.[citeIdx];
                     if (citation) {
                        const isOverruled = citation.validity_status === 'OVERRULED_FILTERED';
                        const colorClass = isOverruled ? 'text-red-500 bg-red-500/10' : 'text-lime bg-lime/10';
                        const badgeClass = isOverruled ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-lime/20 text-lime border-lime/30';
                        return (
                          <span className="relative group inline-block cursor-pointer mx-1 no-underline">
                            <span className={`${colorClass} text-xs font-bold px-1.5 py-0.5 rounded`}>
                              [{citeIdx + 1}]
                            </span>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-96 p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all bg-[#09090B] border border-white/10 shadow-2xl rounded-2xl z-50 pointer-events-none text-left font-sans">
                              <div className="flex items-center justify-between mb-3">
                                <p className="text-xs text-white/50 uppercase tracking-widest font-bold m-0">{citation.citation}</p>
                                <span className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-widest ${badgeClass} m-0`}>
                                  {isOverruled ? 'Overruled - Do Not Cite' : 'Good Law'}
                                </span>
                              </div>
                              <p className="text-sm text-white/90 leading-relaxed max-h-48 overflow-hidden m-0">{citation.raw_text}</p>
                            </div>
                          </span>
                        );
                     }
                   }
                   return <a href={href} className="text-blue-400 hover:underline" {...props}>{children}</a>;
                 }
               }}
            >
              {markdownContent}
            </ReactMarkdown>
          </div>
          
          {/* Show Your Work Panel */}
          {msg.citations && msg.citations.length > 0 && (
            <div className="mt-4 border border-white/10 rounded-xl overflow-hidden bg-black/20">
              <details className="group">
                <summary className="flex items-center justify-between p-4 cursor-pointer list-none text-xs font-bold uppercase tracking-widest text-white/50 hover:text-white transition-colors bg-white/5">
                  <span className="flex items-center gap-2">
                    <Database size={14} /> View AI Source Material ({msg.citations.length} citations)
                  </span>
                  <ChevronDown size={14} className="group-open:rotate-180 transition-transform" />
                </summary>
                <div className="p-4 border-t border-white/10 flex flex-col gap-4 max-h-96 overflow-y-auto custom-scrollbar">
                  {msg.citations.map((cit, idx) => (
                    <div key={idx} className="flex flex-col gap-2 p-4 bg-[#121215] rounded-lg border border-white/5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-lime uppercase tracking-widest">[{idx + 1}] {cit.citation}</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest ${cit.validity_status === 'OVERRULED_FILTERED' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-lime/20 text-lime border border-lime/30'}`}>
                          {cit.validity_status === 'OVERRULED_FILTERED' ? 'Overruled' : 'Good Law'}
                        </span>
                      </div>
                      <p className="text-xs text-white/70 leading-relaxed font-mono">{cit.raw_text}</p>
                    </div>
                  ))}
                </div>
              </details>
            </div>
          )}

          {openDrafter && (
            <div className="mt-4 flex">
              <button 
                onClick={() => window.location.href = '/petition'}
                className="pill-dark py-4 px-6 text-sm font-bold tracking-widest uppercase bg-blue-500 text-white hover:bg-blue-600 flex items-center gap-2 shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all"
              >
                <FileText size={18} />
                Open Petition Drafting Suite
              </button>
            </div>
          )}

          {suggestedQuestions.length > 0 && (
            <div className="mt-6 flex flex-col gap-2">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Suggested Follow-ups</span>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((sq, i) => (
                  <button 
                    key={i} 
                    onClick={() => setQuery(sq)}
                    className="text-left text-sm text-lime bg-lime/5 border border-lime/20 px-4 py-2 rounded-xl hover:bg-lime/10 transition-colors"
                  >
                    {sq}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    };

  return (
    <div 
      className={`w-full h-full bg-transparent flex flex-col relative overflow-hidden text-white ${isDraggingOver ? 'ring-2 ring-emerald-500/50 bg-emerald-500/5' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drop Zone Overlay */}
      <AnimatePresence>
        {isDraggingOver && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-emerald-500/10 backdrop-blur-sm border-2 border-dashed border-emerald-500/50 rounded-xl flex items-center justify-center pointer-events-none"
          >
            <div className="bg-zinc-950 px-6 py-4 rounded-xl shadow-2xl flex flex-col items-center gap-3 border border-emerald-500/30">
              <Database size={32} className="text-emerald-500 animate-bounce" />
              <span className="text-sm font-black uppercase tracking-widest text-emerald-400">Drop Fact to Insert</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

        {messages.length === 0 ? (
          /* Empty State */
          <div className="flex-1 flex flex-col items-center justify-center p-4 z-10 w-full overflow-hidden bg-zinc-950">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center text-center w-full"
            >
              <div className="w-12 h-12 rounded-xl bg-zinc-900 flex items-center justify-center mb-6 border border-zinc-800 shadow-sm">
                <Bot className="text-zinc-400" size={20} />
              </div>
              
              <h1 className="text-xl font-bold tracking-tight mb-1 text-zinc-100">
                AI Copilot
              </h1>
              <h2 className="text-xs font-medium text-zinc-500 mb-8">
                How can I assist your case today?
              </h2>

              {/* Input Box for Empty State */}
              <form onSubmit={handleSubmit} className="w-full max-w-sm relative mb-8 bg-zinc-900 border border-zinc-800 rounded-xl shadow-lg flex flex-col overflow-hidden">
                <textarea 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask a legal question or drop a prompt..."
                  className="w-full bg-transparent px-4 py-3 outline-none text-zinc-100 placeholder-zinc-500 text-sm resize-none"
                  rows={3}
                />
                <div className="flex items-center justify-between px-3 py-2 border-t border-zinc-800 bg-zinc-950/50">
                  <div className="flex items-center gap-2">
                    <button type="button" className="flex items-center gap-1.5 rounded px-2 py-1 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors uppercase tracking-wider">
                      <Sparkles size={10} /> Research
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" className="text-zinc-500 hover:text-zinc-300 transition-colors"><Mic size={14} /></button>
                    <button type="submit" disabled={!query.trim()} className="w-7 h-7 rounded-md flex items-center justify-center bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50 disabled:bg-zinc-700 disabled:text-zinc-500 transition-colors">
                      <Send size={12} />
                    </button>
                  </div>
                </div>
              </form>

              {/* Suggested Prompts */}
              <div className="flex flex-col gap-2 w-full max-w-sm text-left px-2">
                {[
                  { title: "Analyze Statute", desc: "Check if a 16-year old can drive..." },
                  { title: "Draft Petition", desc: "Create a standard bail petition..." },
                  { title: "Check Fines", desc: "List the fines for overspeeding..." }
                ].map((card, idx) => (
                  <div key={idx} className="bg-zinc-900 p-3 border border-zinc-800 hover:border-emerald-500/50 transition-colors cursor-pointer rounded-lg flex items-center gap-3 group">
                    <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center shrink-0 group-hover:bg-emerald-500/10 transition-colors">
                      <FileText size={14} className="text-zinc-400 group-hover:text-emerald-500 transition-colors" />
                    </div>
                    <div>
                      <h3 className="text-zinc-200 text-xs font-semibold mb-0.5">{card.title}</h3>
                      <p className="text-zinc-500 text-[10px] truncate">{card.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        ) : (
          /* Chat History State */
          <>
            <div className="flex-1 flex flex-col h-full w-full max-w-5xl mx-auto z-10 relative bg-zinc-950">
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 pb-40">
                <AnimatePresence initial={false}>
                  {messages.map((msg) => (
                    <motion.div 
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-8 flex items-start gap-4 w-full"
                    >
                      {/* Avatar */}
                      <div className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border border-zinc-800 mt-0.5">
                        {msg.type === 'user' ? (
                          <div className="w-full h-full bg-zinc-800 text-zinc-300 rounded-lg flex items-center justify-center font-bold text-xs">
                            JN
                          </div>
                        ) : (
                          <div className="w-full h-full bg-emerald-500/10 text-emerald-500 rounded-lg flex items-center justify-center">
                            <Bot size={16} />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 flex flex-col pt-1">
                        {msg.type === 'assistant' && renderStatus(msg.status, messages.indexOf(msg), msg.content)}
                        <div className="text-[14px] leading-relaxed font-medium text-zinc-300">
                          {renderMessageContent(msg)}
                        </div>

                        {/* Citations */}
                        {msg.citations && msg.citations.length > 0 && (
                          <CitationsBlock citations={msg.citations} searchQuery={messages[messages.indexOf(msg) - 1]?.content || ''} onHover={onCitationHover} />
                        )}
                      </div>
                    </motion.div>
                  ))}
                  
                  {loading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start mb-8 ml-12">
                      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </AnimatePresence>
              </div>
            </div>

            {/* Sticky Input for Chat State */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-zinc-950 via-zinc-950/95 to-transparent pointer-events-none">
              <div className="w-full mx-auto pointer-events-auto">
                <form onSubmit={handleSubmit} className="w-full bg-zinc-900 border border-zinc-800 shadow-2xl rounded-xl flex flex-col overflow-hidden">
                  <textarea 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Message AI Copilot..."
                    className="w-full bg-transparent px-4 py-3 outline-none text-zinc-100 placeholder-zinc-500 text-sm resize-none"
                    rows={2}
                  />
                  <div className="flex items-center justify-between px-3 py-2 border-t border-zinc-800 bg-zinc-950/50">
                    <div className="flex items-center gap-2">
                      <button type="button" className="flex items-center gap-1.5 rounded px-2 py-1 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors uppercase tracking-wider">
                        <Sparkles size={10} /> Research
                      </button>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-500">
                      <button type="button" className="hover:text-zinc-300 transition-colors"><Mic size={16} /></button>
                      <button type="submit" disabled={!query.trim() || loading} className="w-8 h-8 rounded-md flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-50 disabled:bg-zinc-700 disabled:text-zinc-500 transition-colors">
                        <Send size={14} />
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

