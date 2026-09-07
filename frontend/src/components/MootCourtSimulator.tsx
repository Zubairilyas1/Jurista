"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Gavel, Swords, Send, Activity, ShieldAlert, CheckCircle2, ChevronRight, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function MootCourtSimulator() {
  const [setupMode, setSetupMode] = useState(true);
  const [scenario, setScenario] = useState('');
  const [difficulty, setDifficulty] = useState('Senior Counsel');
  
  const [history, setHistory] = useState<{role: 'user' | 'assistant', content: string}[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [score, setScore] = useState(70); // Initial score fallback state
  const [lastFeedback, setLastFeedback] = useState('');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, isProcessing]);

  const startSimulation = () => {
    setSetupMode(false);
    setHistory([{
      role: 'assistant',
      content: `I have reviewed the case scenario regarding "${scenario}". I am ready. You may present your opening statement, Advocate.`
    }]);
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isProcessing) return;
    
    const userMsg = inputValue.trim();
    setInputValue('');
    setHistory(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsProcessing(true);

    try {
      const res = await fetch('http://127.0.0.1:8001/api/v1/moot-court/argue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario,
          difficulty,
          argument: userMsg,
          history: history
        })
      });

      if (!res.ok) throw new Error("API failed");
      const data = await res.json();
      
      const opponentReply = data.response || "Opposing counsel could not process your argument.";
      const newScore = Number(data.score) || score; // Fix NaN Pts Judge Score Bug
      const feedback = data.feedback || "";

      setHistory(prev => [...prev, { role: 'assistant', content: opponentReply }]);
      setScore(newScore);
      if (feedback) {
        setLastFeedback(feedback);
        setTimeout(() => setLastFeedback(''), 5000);
      }
      
    } catch (err) {
      console.error(err);
      setHistory(prev => [...prev, { role: 'assistant', content: "Opposing counsel is analyzing your argument... [Network Error: Unable to reach court server]" }]);
      setLastFeedback("Connection lost to Moot Court Server.");
      setTimeout(() => setLastFeedback(''), 5000);
    } finally {
      setIsProcessing(false);
    }
  };

  const restMyCase = async () => {
    setIsGeneratingReport(true);
    setTimeout(() => {
      alert("Court session ended. Your final score is " + score);
      setIsGeneratingReport(false);
      setSetupMode(true);
      setHistory([]);
      setScore(70);
      setScenario('');
    }, 1500);
  };

  if (setupMode) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#0D0D0E] text-white selection:bg-emerald-500/30">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#18181C] border border-zinc-800 p-10 max-w-2xl w-full"
        >
          <div className="flex items-center gap-4 mb-10 border-b border-zinc-800 pb-6">
            <div className="w-12 h-12 flex items-center justify-center bg-emerald-500/10 border border-emerald-500/30">
              <Gavel size={24} className="text-emerald-400" />
            </div>
            <div>
              <h2 className="font-sans-hero text-2xl font-bold uppercase tracking-widest text-white">Moot Court Arena</h2>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">Configure your litigation sparring partner.</p>
            </div>
          </div>

          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-3">
              <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Case Scenario / Legal Issue</label>
              <textarea 
                value={scenario}
                onChange={(e) => setScenario(e.target.value)}
                className="w-full h-32 bg-[#0D0D0E] border border-zinc-800 p-4 text-sm font-medium text-white outline-none focus:border-emerald-500 transition-colors resize-none custom-scrollbar"
                placeholder="E.g. Pre-arrest bail hearing for a suspect accused of fraud under Section 489-F PPC..."
              />
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Opponent Difficulty</label>
              <div className="grid grid-cols-3 gap-4">
                {['Junior Associate', 'Senior Counsel', 'Supreme Court Advocate'].map(level => (
                  <button
                    key={level}
                    onClick={() => setDifficulty(level)}
                    className={`py-4 px-2 border text-[10px] font-bold uppercase tracking-widest transition-all ${
                      difficulty === level 
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-sm shadow-emerald-950/50' 
                        : 'bg-[#0D0D0E] border-zinc-800 text-white/40 hover:border-zinc-700 hover:text-white'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={startSimulation}
              disabled={!scenario.trim()}
              className="w-full mt-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold tracking-widest uppercase text-xs flex items-center justify-center gap-2 py-5 transition-all disabled:opacity-50 shadow-lg shadow-emerald-950/40"
            >
              ENTER THE COURTROOM <Gavel size={16} />
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#0D0D0E] text-white">
      {/* Header / Scoreboard */}
      <div className="h-20 border-b border-zinc-800 bg-[#0D0D0E] px-8 flex items-center justify-between shrink-0 z-10 sticky top-0 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-500/10 flex items-center justify-center border border-emerald-500/30">
            <Swords size={20} className="text-emerald-400" />
          </div>
          <div>
            <h3 className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Courtroom Arena</h3>
            <p className="text-xs font-bold text-white uppercase tracking-widest">Opponent: {difficulty}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
            <Activity size={14} className="text-emerald-400" />
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Score: {score} / 100</span>
          </div>
          
          <button 
            onClick={restMyCase}
            disabled={isGeneratingReport || history.length < 2}
            className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase bg-transparent border border-zinc-700 hover:bg-[#18181C] text-white/70 hover:text-white px-4 py-2 rounded transition-colors disabled:opacity-50"
          >
            {isGeneratingReport ? <div className="w-4 h-4 border-2 border-white/50 border-t-transparent rounded-full animate-spin" /> : <Gavel size={14} />}
            Rest My Case
          </button>
        </div>
      </div>

      {/* Chat Arena */}
      <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-8 custom-scrollbar max-w-4xl mx-auto w-full relative">
        {history.map((msg, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} w-full`}
          >
            <div className={`max-w-[80%] flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">
                {msg.role === 'user' ? 'You (Lawyer)' : `Opposing Counsel (${difficulty})`}
              </span>
              <div className={`p-5 text-sm leading-relaxed font-medium ${
                msg.role === 'user' 
                  ? 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-100 rounded-2xl rounded-tr-none shadow-md' 
                  : 'bg-[#18181C] border border-zinc-800 text-zinc-200 rounded-2xl rounded-tl-none shadow-md'
              }`}>
                {msg.content}
              </div>
            </div>
          </motion.div>
        ))}

        {isProcessing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start w-full">
            <div className="flex flex-col gap-2 items-start max-w-[80%]">
              <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Opposing Counsel ({difficulty})</span>
              <div className="bg-[#18181C] border border-zinc-800 p-5 rounded-2xl rounded-tl-none shadow-md flex items-center gap-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold ml-2">Opposing counsel is analyzing your argument...</span>
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Real-time Feedback Toast */}
      <AnimatePresence>
        {lastFeedback && (
          <motion.div 
            initial={{ opacity: 0, y: 20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className="fixed bottom-32 left-1/2 z-50 bg-[#18181C] border border-zinc-800 shadow-2xl rounded-lg p-4 flex items-center gap-3 max-w-lg w-full"
          >
            <ShieldAlert size={20} className={lastFeedback.includes('-') ? 'text-rose-500' : 'text-emerald-500'} />
            <p className="text-xs text-white/90 font-medium">{lastFeedback}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <div className="p-8 pb-12 bg-gradient-to-t from-[#0D0D0E] via-[#0D0D0E]/90 to-transparent shrink-0 flex items-center justify-center sticky bottom-0 z-20">
        <div className="max-w-4xl w-full flex gap-3 relative">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="State your argument... (Urdu or English)"
            disabled={isProcessing}
            className="flex-1 bg-[#18181C] border border-zinc-800 focus-within:border-emerald-500 rounded-2xl p-5 pr-20 text-sm font-medium text-white resize-none h-[80px] custom-scrollbar outline-none transition-colors shadow-2xl"
          />
          <button
            onClick={handleSend}
            disabled={isProcessing || !inputValue.trim()}
            className="absolute right-3 top-3 bottom-3 aspect-square bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 text-white rounded-xl flex items-center justify-center transition-colors shadow-md"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
