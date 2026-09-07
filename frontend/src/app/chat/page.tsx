"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Mic, FileText, Settings, HelpCircle, CheckCircle2, AlertTriangle, Send, ChevronDown, Database, PanelLeft, Plus, Trash2, Edit2, Check, X } from 'lucide-react';
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
  status?: string;
}

interface ChatSession {
  id: string;
  title: string;
  updatedAt: number;
  messages: Message[];
}

const ThinkingBlock = ({ thinking, verification }: { thinking?: string, verification?: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  if (!thinking && !verification) return null;

  return (
    <div className="border border-zinc-800 rounded-xl bg-zinc-900/50 overflow-hidden mb-4">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full flex items-center justify-between p-3 text-xs uppercase tracking-tight font-bold text-muted hover:bg-white/5 transition-colors"
      >
        <span className="flex items-center gap-2"><Sparkles size={14} className="text-emerald-400" /> AI Thought & Verification</span>
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
                <span className="font-bold text-white/40 not-italic uppercase tracking-tight text-[10px] block mb-1">Reasoning</span>
                {thinking}
              </div>
            )}
            {verification && (
              <div className="border-t border-zinc-800/50 pt-3">
                <span className="font-bold text-emerald-400/50 not-italic uppercase tracking-tight text-[10px] block mb-1">Fact-Check Verification</span>
                {verification}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CitationsBlock = ({ citations, searchQuery }: { citations: any[], searchQuery: string }) => {
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
        return <span key={i} className="bg-emerald-500/20 text-emerald-400 font-bold rounded px-0.5">{part}</span>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="mt-6 pt-5 border-t border-zinc-800/50">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="flex items-center gap-2 text-[10px] font-semibold text-muted hover:text-white uppercase tracking-tight transition-colors mb-2"
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
              <div key={i} className="flex flex-col bg-zinc-900/50 border border-zinc-800/50 rounded-xl overflow-hidden transition-colors">
                <div 
                  onClick={() => setExpandedCitation(expandedCitation === i ? null : i)}
                  className="flex items-center justify-between p-3 cursor-pointer hover:bg-white/5"
                >
                  <div className="flex items-start gap-3 text-sm">
                    <FileText size={16} className="text-emerald-400 mt-0.5 shrink-0" />
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
                      className="px-4 pb-4 pt-2 text-sm text-white/60 leading-relaxed border-t border-zinc-800/50"
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

export default function ChatPage() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // History Drawer State
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  // Load sessions from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('jurista_chats');
    if (saved) {
      try {
        setSessions(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const saveSessions = (newSessions: ChatSession[]) => {
    setSessions(newSessions);
    localStorage.setItem('jurista_chats', JSON.stringify(newSessions));
  };

  // Sync messages with current session
  useEffect(() => {
    if (currentSessionId && messages.length > 0) {
      setSessions(prev => {
        const updated = prev.map(s => s.id === currentSessionId ? { ...s, messages, updatedAt: Date.now() } : s);
        localStorage.setItem('jurista_chats', JSON.stringify(updated));
        return updated;
      });
    }
  }, [messages, currentSessionId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

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
          content: `[SYSTEM: USER SCANNED A DOCUMENT. HERE IS THE TRANSCRIBED TEXT TO USE AS CONTEXT FOR THE FOLLOWING QUESTIONS:]\n\n${ocrData.text}`,
          isAttachment: true
        };
        
        const autoQueryMsg: Message = {
          id: Date.now().toString(),
          type: 'user',
          content: "Please provide a complete English summary of this document, including the date, parties, and the crime. Then explain the laws involved (e.g. PPC sections)."
        };
        
        const newMessages = [hiddenContextMsg, autoQueryMsg];
        
        // Auto-create session for OCR
        const sessionId = Date.now().toString();
        setCurrentSessionId(sessionId);
        const newSession: ChatSession = { id: sessionId, title: 'OCR Scan Analysis', updatedAt: Date.now(), messages: newMessages };
        setSessions(prev => {
          const updated = [newSession, ...prev];
          localStorage.setItem('jurista_chats', JSON.stringify(updated));
          return updated;
        });

        setMessages(newMessages);
        sessionStorage.removeItem('ocrContext');
        
        triggerApiCall(newMessages);
      } catch (e) {
        console.error("Failed to parse ocr context", e);
      }
    }
  }, []);

  const handleSubmit = async (e?: React.FormEvent, promptOverride?: string) => {
    e?.preventDefault();
    const text = promptOverride || query;
    if (!text.trim() || loading) return;

    let sessionId = currentSessionId;
    if (!sessionId) {
      sessionId = Date.now().toString();
      setCurrentSessionId(sessionId);
      const newSession: ChatSession = { id: sessionId, title: text.slice(0, 30) + '...', updatedAt: Date.now(), messages: [] };
      setSessions(prev => {
        const updated = [newSession, ...prev];
        localStorage.setItem('jurista_chats', JSON.stringify(updated));
        return updated;
      });
    }

    const userMessage: Message = { id: Date.now().toString(), type: 'user', content: text.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setQuery('');
    
    triggerApiCall(newMessages);
  };

  const startNewChat = () => {
    setCurrentSessionId(null);
    setMessages([]);
    setQuery('');
  };

  const loadSession = (id: string) => {
    const session = sessions.find(s => s.id === id);
    if (session) {
      setCurrentSessionId(id);
      setMessages(session.messages);
    }
  };

  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = sessions.filter(s => s.id !== id);
    saveSessions(updated);
    if (currentSessionId === id) {
      startNewChat();
    }
  };

  const submitRename = (id: string, e?: React.FormEvent) => {
    e?.preventDefault();
    if (editTitle.trim()) {
      const updated = sessions.map(s => s.id === id ? { ...s, title: editTitle.trim() } : s);
      saveSessions(updated);
    }
    setEditingSessionId(null);
  };

  const renderStatus = (status?: string) => {
    if (!status) return null;
    const isGrounded = status === 'GROUNDED';
    return (
      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium mb-4 ${
        isGrounded ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
      }`}>
        {isGrounded ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
        {status.replace(/_/g, ' ')}
      </div>
    );
  };

  const renderMessageContent = (msg: Message) => {
    if (msg.isAttachment) {
      return (
        <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-lg p-4 flex items-center gap-4 w-full max-w-sm mt-1 mb-2">
           <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 flex items-center justify-center rounded-xl shrink-0">
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

    const thinkStart = content.indexOf('<think>');
    const lastThinkEnd = content.lastIndexOf('</think>');
    
    if (thinkStart !== -1 && lastThinkEnd !== -1 && lastThinkEnd > thinkStart) {
      thinking = content.substring(thinkStart + 7, lastThinkEnd).replace(/<\/?think>/g, '').trim();
      content = content.substring(lastThinkEnd + 8).trim();
    } else if (thinkStart !== -1) {
      content = content.replace(/<think>/g, '').trim();
    }

    content = content.replace(/<\/?think>/g, '').trim();

    if (!content && thinking) {
      content = thinking;
      thinking = '';
    }

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
        <ThinkingBlock thinking={thinking || undefined} verification={msg.status === 'GROUNDED' ? 'Citations successfully cross-referenced with Jurista Legal Graph.' : undefined} />

        <div className="prose prose-invert prose-emerald prose-p:mb-4 prose-ul:mb-4 prose-li:my-1 prose-headings:text-emerald-400 max-w-none text-white/90">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              a: ({node, href, children, ...props}) => {
                if (href?.startsWith('#cite-')) {
                  const citeIdx = parseInt(href.replace('#cite-', ''), 10) - 1;
                  const citation = msg.citations?.[citeIdx];
                  if (citation) {
                    const isOverruled = citation.validity_status === 'OVERRULED_FILTERED';
                    const colorClass = isOverruled ? 'text-red-500 bg-zinc-900/50' : 'text-emerald-400 bg-emerald-500/10';
                    const badgeClass = isOverruled ? 'bg-red-500/20 text-red-400 border-zinc-800' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
                    return (
                      <span className="relative group inline-block cursor-pointer mx-0.5 no-underline">
                        <span className={`${colorClass} text-xs font-bold px-1.5 py-0.5 rounded`}>[{citeIdx + 1}]</span>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-96 p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all bg-zinc-950 border border-zinc-800 shadow-2xl rounded-lg z-50 pointer-events-none text-left font-sans">
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-xs text-white/50 uppercase tracking-tight font-bold m-0">{citation.citation}</p>
                            <span className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase ${badgeClass}`}>{isOverruled ? 'Overruled' : 'Good Law'}</span>
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
        
        {msg.citations && msg.citations.length > 0 && (
          <div className="mt-4 border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/30">
            <details className="group">
              <summary className="flex items-center justify-between p-4 cursor-pointer list-none text-xs font-bold uppercase tracking-tight text-white/50 hover:text-white transition-colors bg-white/5">
                <span className="flex items-center gap-2">
                  <Database size={14} /> View AI Source Material ({msg.citations.length} citations)
                </span>
                <ChevronDown size={14} className="group-open:rotate-180 transition-transform" />
              </summary>
              <div className="p-4 border-t border-zinc-800 flex flex-col gap-4 max-h-96 overflow-y-auto custom-scrollbar">
                {msg.citations.map((cit, idx) => (
                  <div key={idx} className="flex flex-col gap-2 p-4 bg-zinc-950 rounded-lg border border-zinc-800/50">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-tight">[{idx + 1}] {cit.citation}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-tight ${cit.validity_status === 'OVERRULED_FILTERED' ? 'bg-red-500/20 text-red-400 border border-zinc-800' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
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
              className="pill-dark py-4 px-6 text-sm font-bold tracking-tight uppercase bg-blue-500 text-white hover:bg-blue-600 flex items-center gap-2 shadow-sm transition-all"
            >
              <FileText size={18} />
              Open Petition Drafting Suite
            </button>
          </div>
        )}

        {suggestedQuestions.length > 0 && (
          <div className="mt-6 flex flex-col gap-2">
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-tight">Suggested Follow-ups</span>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((sq, i) => (
                <button 
                  key={i} 
                  onClick={() => {
                    setQuery(sq);
                    handleSubmit(undefined, sq);
                  }}
                  className="text-left text-sm text-emerald-400 bg-emerald-500/5 border border-emerald-500/20 px-4 py-2 rounded-xl hover:bg-emerald-500/10 transition-colors"
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
    <div className="w-full h-full flex bg-[#0D0D0E] relative overflow-hidden text-white selection:bg-emerald-500/30">
      
      {/* Drawer */}
      <AnimatePresence>
        {isHistoryOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="h-full bg-[#131316] border-r border-zinc-800/80 flex flex-col shrink-0 overflow-hidden z-30"
          >
            <div className="p-6 border-b border-zinc-800/50 flex items-center justify-between shrink-0">
               <h3 className="font-sans-hero font-bold tracking-widest uppercase text-sm text-white">History</h3>
               <button onClick={startNewChat} className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center hover:bg-emerald-500/20 transition-colors" title="New Chat">
                 <Plus size={16} />
               </button>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 flex flex-col gap-2">
              {sessions.length === 0 ? (
                <p className="text-zinc-500 text-xs text-center mt-4">No recent chats.</p>
              ) : (
                sessions.sort((a, b) => b.updatedAt - a.updatedAt).map(session => (
                  <div 
                    key={session.id}
                    onClick={() => loadSession(session.id)}
                    className={`group relative p-3 rounded-xl cursor-pointer transition-colors border ${currentSessionId === session.id ? 'bg-zinc-800/60 border-zinc-700' : 'bg-transparent border-transparent hover:bg-zinc-800/30'}`}
                  >
                    {editingSessionId === session.id ? (
                      <form onSubmit={(e) => submitRename(session.id, e)} className="flex items-center gap-2">
                        <input 
                          autoFocus
                          value={editTitle}
                          onChange={e => setEditTitle(e.target.value)}
                          className="flex-1 bg-zinc-950 text-white text-xs p-1 px-2 rounded border border-emerald-500 outline-none w-full"
                          onClick={e => e.stopPropagation()}
                        />
                        <button type="submit" className="text-emerald-400 hover:text-emerald-300"><Check size={14} /></button>
                        <button type="button" onClick={(e) => { e.stopPropagation(); setEditingSessionId(null); }} className="text-red-400 hover:text-red-300"><X size={14} /></button>
                      </form>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <FileText size={14} className={currentSessionId === session.id ? "text-emerald-400 shrink-0" : "text-zinc-500 shrink-0"} />
                          <span className={`text-sm truncate ${currentSessionId === session.id ? 'text-white font-semibold' : 'text-zinc-400'}`}>
                            {session.title}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditTitle(session.title);
                              setEditingSessionId(session.id);
                            }} 
                            className="p-1.5 text-zinc-400 hover:text-white transition-colors"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button 
                            onClick={(e) => deleteSession(session.id, e)} 
                            className="p-1.5 text-zinc-400 hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col h-full relative">
        {/* Top left actions */}
        <div className="absolute top-6 left-8 flex items-center gap-4 z-20">
          <button onClick={() => setIsHistoryOpen(!isHistoryOpen)} className="pill-dark w-10 h-10 hover:bg-white/10 transition-colors flex items-center justify-center text-white">
            <PanelLeft size={18} />
          </button>
        </div>

        {/* Top right actions */}
        <div className="absolute top-6 right-8 flex items-center gap-4 z-20">
          <button className="pill-dark w-10 h-10 flex items-center justify-center hover:bg-white/10 text-white"><Settings size={18} /></button>
          <button className="pill-dark w-10 h-10 flex items-center justify-center hover:bg-white/10 text-white"><HelpCircle size={18} /></button>
        </div>

        {messages.length === 0 ? (
          /* Empty State (Sleek Dashboard Vibe) */
          <div className="flex-1 flex flex-col items-center justify-center p-8 z-10">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center text-center max-w-2xl w-full"
            >
              
              <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-8 border border-zinc-800 shadow-sm">
                <Mic className="text-white/40" size={40} strokeWidth={1.5} />
              </div>
              
              <h1 className="font-sans-hero text-4xl lg:text-5xl font-semibold tracking-wider uppercase mb-4 text-white">
                LEGAL ASSISTANT
              </h1>
              <h2 className="text-xl font-medium text-muted mb-12 uppercase tracking-tight">
                AI-POWERED RESEARCH & ANALYSIS
              </h2>

              {/* Input Box for Empty State */}
              <form onSubmit={handleSubmit} className="w-full max-w-3xl relative mb-12 card-dark p-2 border-zinc-800">
                <input 
                  type="text" 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask a legal question..."
                  className="w-full bg-transparent px-6 py-5 outline-none text-white placeholder-muted font-medium text-lg"
                />
                <div className="flex items-center justify-between px-4 pb-2 pt-2 border-t border-zinc-800">
                  <div className="flex items-center gap-2">
                    <button type="button" className="pill-dark px-4 py-2 text-sm gap-2 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 bg-transparent uppercase font-bold tracking-wider">
                      <Sparkles size={14} /> Deep Research
                    </button>
                  </div>
                  <div className="flex items-center gap-3 text-muted">
                    <button type="button" className="hover:text-white transition-colors"><Mic size={20} /></button>
                    <button type="submit" disabled={!query.trim()} className="pill-dark w-10 h-10 bg-white/10 hover:bg-white/20 text-white disabled:opacity-50">
                      <Send size={18} />
                    </button>
                  </div>
                </div>
              </form>

              {/* Suggested Prompts */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl text-left">
                {[
                  { title: "Analyze Statute", desc: "Check if a 16-year old can drive a motorcycle under NHSO.", prompt: "Check if a 16-year old can drive a motorcycle under NHSO." },
                  { title: "Draft Petition", desc: "Create a standard bail petition for a traffic offense.", prompt: "Create a standard bail petition for a traffic offense." },
                  { title: "Check Fines", desc: "List the fines for overspeeding in Punjab.", prompt: "List the fines for overspeeding in Punjab." }
                ].map((card, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => {
                      setQuery(card.prompt);
                      handleSubmit(undefined, card.prompt);
                    }}
                    className="card-dark bg-[#18181C] p-6 hover:border-emerald-500/50 transition-colors cursor-pointer group"
                  >
                    <div className="text-white/30 group-hover:text-emerald-400 transition-colors mb-4"><FileText size={24} /></div>
                    <h4 className="font-bold font-sans-hero tracking-tight text-sm uppercase text-white mb-2">{card.title}</h4>
                    <p className="text-sm text-muted leading-relaxed font-medium">{card.desc}</p>
                  </div>
                ))}
              </div>

            </motion.div>
          </div>
        ) : (
          /* Chat History State */
          <div className="flex-1 flex flex-col h-full w-full max-w-5xl mx-auto z-10 relative">
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-8 pb-40">
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div 
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12 flex items-start gap-6 w-full max-w-4xl mx-auto"
                  >
                    {/* Avatar */}
                    <div className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-lg border border-zinc-800/50 mt-1">
                      {msg.type === 'user' ? (
                        <div className="w-full h-full bg-white text-black rounded-full flex items-center justify-center font-sans-hero font-semibold text-sm">
                          JN
                        </div>
                      ) : (
                        <div className="w-full h-full bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center">
                          <Sparkles size={18} strokeWidth={2.5} />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 flex flex-col pt-1">
                      {msg.type === 'assistant' && renderStatus(msg.status)}
                      <div className="text-[15px] lg:text-[17px] leading-[1.8] font-medium text-white/90">
                        {renderMessageContent(msg)}
                      </div>

                    {/* Citations */}
                    {msg.citations && msg.citations.length > 0 && (
                      <CitationsBlock citations={msg.citations} searchQuery={messages[messages.indexOf(msg) - 1]?.content || ''} />
                    )}
                  </div>
                </motion.div>
              ))}
              
              {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start mb-8">
                  <div className="card-dark bg-[#18181C] border-zinc-800/50 rounded-[24px] rounded-tl-sm p-6 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce"></div>
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </AnimatePresence>
          </div>

          {/* Sticky Input for Chat State */}
          <div className="absolute bottom-0 left-0 right-0 p-8 pt-20 bg-gradient-to-t from-[#0D0D0E] via-[#0D0D0E]/90 to-transparent pointer-events-none">
            <div className="max-w-4xl mx-auto pointer-events-auto">
              <form onSubmit={handleSubmit} className="w-full card-dark p-2 border-zinc-800 shadow-2xl bg-[#18181C]">
                <input 
                  type="text" 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask a follow-up question..."
                  className="w-full bg-transparent px-6 py-4 outline-none text-white placeholder-muted font-medium text-lg"
                />
                <div className="flex items-center justify-between px-4 pb-2 pt-2 border-t border-zinc-800/50">
                  <div className="flex items-center gap-2">
                    <button type="button" className="pill-dark px-4 py-2 text-sm gap-2 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 bg-transparent uppercase font-bold tracking-wider">
                      <Sparkles size={14} /> Deep Research
                    </button>
                  </div>
                  <div className="flex items-center gap-3 text-muted">
                    <button type="button" className="hover:text-white transition-colors"><Mic size={20} /></button>
                    <button type="submit" disabled={!query.trim() || loading} className="pill-dark w-10 h-10 bg-white/10 hover:bg-white/20 text-white disabled:opacity-50">
                      <Send size={18} />
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
          
        </div>
      )}
      </div>
    </div>
  );
}
