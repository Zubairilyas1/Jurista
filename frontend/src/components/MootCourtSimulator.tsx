"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gavel, Send, ShieldAlert, Swords, Trophy, Activity, ArrowLeft } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'opponent';
  content: string;
}

export function MootCourtSimulator() {
  const [setupMode, setSetupMode] = useState(true);
  const [scenario, setScenario] = useState('');
  const [difficulty, setDifficulty] = useState('Senior Counsel');
  
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [score, setScore] = useState(0);
  const [lastFeedback, setLastFeedback] = useState<string | null>(null);
  
  const [report, setReport] = useState<any>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, isProcessing]);

  const startSimulation = () => {
    if (!scenario.trim()) return;
    setSetupMode(false);
    setHistory([{ 
      role: 'opponent', 
      content: `The court is now in session. The scenario is: ${scenario}. Counsel, you may begin your arguments.` 
    }]);
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    
    const userArg = inputValue;
    const newHistory = [...history, { role: 'user' as const, content: userArg }];
    setHistory(newHistory);
    setInputValue('');
    setIsProcessing(true);
    setLastFeedback(null);

    try {
      const res = await fetch('http://localhost:8001/api/v1/simulation/turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario,
          difficulty,
          history: newHistory,
          user_argument: userArg
        })
      });
      
      const data = await res.json();
      
      setHistory(prev => [...prev, { role: 'opponent', content: data.opponent_reply }]);
      setScore(prev => prev + data.points_awarded - data.points_deducted);
      
      if (data.judge_feedback) {
        setLastFeedback(`Points: +${data.points_awarded} | -${data.points_deducted}. Judge: ${data.judge_feedback}`);
      }
    } catch (err) {
      console.error("Simulation failed", err);
      setHistory(prev => [...prev, { role: 'opponent', content: "Objection! System error. Please try again." }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const restMyCase = async () => {
    if (history.length < 2) return;
    setIsGeneratingReport(true);
    
    try {
      const res = await fetch('http://localhost:8001/api/v1/simulation/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario,
          history
        })
      });
      
      const data = await res.json();
      setReport(data);
    } catch (err) {
      console.error("Report generation failed", err);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  if (report) {
    return (
      <div className="flex flex-col h-full bg-zinc-950 p-8 overflow-y-auto custom-scrollbar">
        <div className="max-w-4xl mx-auto w-full bg-zinc-900 border border-zinc-800 rounded-lg p-8 shadow-2xl relative">
          <button onClick={() => setReport(null)} className="absolute top-6 left-6 text-zinc-500 hover:text-white flex items-center gap-2 text-sm font-bold tracking-tight uppercase transition-colors">
            <ArrowLeft size={16} /> Back to Arena
          </button>
          
          <div className="flex flex-col items-center mb-10 mt-6">
            <div className="w-16 h-16 rounded-full bg-zinc-900/50 flex items-center justify-center border border-zinc-800 mb-4">
              <Trophy size={32} className="text-emerald-500" />
            </div>
            <h1 className="text-3xl font-semibold text-white tracking-tight uppercase">Post-Match Analytics</h1>
            <p className="text-zinc-400 mt-2 font-medium">Final Score: {score}</p>
          </div>

          <div className="space-y-8">
            <div className="bg-black/50 rounded-xl p-6 border border-zinc-800">
              <h3 className="text-sm font-semibold text-white tracking-tight uppercase mb-4 flex items-center gap-2">
                <Gavel size={18} className="text-emerald-500" /> Final Verdict
              </h3>
              <p className="text-zinc-300 leading-relaxed">{report.final_verdict}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-emerald-500/5 rounded-xl p-6 border border-zinc-800">
                <h3 className="text-sm font-semibold text-emerald-400 tracking-tight uppercase mb-4">Strongest Arguments</h3>
                <ul className="space-y-3">
                  {report.strongest_arguments.map((item: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-red-500/5 rounded-xl p-6 border border-zinc-800">
                <h3 className="text-sm font-semibold text-red-400 tracking-tight uppercase mb-4">Strategic Missteps</h3>
                <ul className="space-y-3">
                  {report.strategic_missteps.map((item: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-purple-500/5 rounded-xl p-6 border border-zinc-800">
              <h3 className="text-sm font-semibold text-purple-400 tracking-tight uppercase mb-4">Missed Opportunities / Case Law</h3>
              <ul className="space-y-3">
                {report.missed_opportunities.map((item: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (setupMode) {
    return (
      <div className="flex flex-col h-full bg-zinc-950 items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl w-full bg-zinc-900 border border-zinc-800 rounded-xl p-10 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 via-purple-500 to-emerald-500" />
          
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-lg bg-white/5 flex items-center justify-center border border-zinc-800">
              <Swords size={28} className="text-zinc-200" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-white tracking-tight uppercase">Moot Court Arena</h2>
              <p className="text-sm text-zinc-400 font-medium">Configure your litigation sparring partner.</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex flex-col gap-3">
              <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-tight">Case Scenario / Legal Issue</label>
              <textarea 
                value={scenario}
                onChange={(e) => setScenario(e.target.value)}
                className="w-full h-32 bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-200 focus:outline-none focus:border-zinc-700 resize-none custom-scrollbar"
                placeholder="E.g. Pre-arrest bail hearing for a suspect accused of fraud under Section 489-F PPC. The cheque was for an illegal drug transaction."
              />
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-tight">Opponent Difficulty</label>
              <div className="grid grid-cols-3 gap-3">
                {['Junior Associate', 'Senior Counsel', 'Supreme Court Advocate'].map(level => (
                  <button
                    key={level}
                    onClick={() => setDifficulty(level)}
                    className={`p-4 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all ${
                      difficulty === level 
                        ? 'bg-purple-500/20 border-purple-500 text-purple-400 shadow-sm' 
                        : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:bg-zinc-800'
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
              className="w-full mt-4 flex items-center justify-center gap-3 bg-white text-black hover:bg-zinc-200 px-6 py-4 rounded-xl text-sm font-semibold uppercase tracking-tight transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Enter The Courtroom <Gavel size={18} />
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      {/* Header / Scoreboard */}
      <div className="h-16 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md px-6 flex items-center justify-between shrink-0 z-10 sticky top-0 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-zinc-900/50 flex items-center justify-center border border-zinc-800">
            <Swords size={20} className="text-red-500" />
          </div>
          <div>
            <h3 className="text-xs font-semibold tracking-tight text-zinc-200 uppercase">Litigation Arena</h3>
            <p className="text-[10px] font-bold text-red-400 uppercase tracking-tight">Vs. {difficulty}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2">
            <Activity size={16} className="text-emerald-500" />
            <div className="flex flex-col">
              <span className="text-[9px] font-semibold text-zinc-500 uppercase tracking-tight">Judge's Score</span>
              <span className="text-sm font-semibold text-white">{score} Pts</span>
            </div>
          </div>
          
          <button 
            onClick={restMyCase}
            disabled={isGeneratingReport || history.length < 2}
            className="flex items-center gap-2 text-[10px] font-semibold tracking-[0.1em] bg-zinc-100 text-black hover:bg-zinc-300 px-4 py-2.5 rounded-lg transition-all uppercase disabled:opacity-50"
          >
            {isGeneratingReport ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <Gavel size={14} />}
            Rest My Case
          </button>
        </div>
      </div>

      {/* Chat Arena */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar max-w-5xl mx-auto w-full">
        {history.map((msg, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} w-full`}
          >
            <div className={`max-w-[80%] flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tight">
                {msg.role === 'user' ? 'You (Lawyer A)' : `Opposing Counsel (${difficulty})`}
              </span>
              <div className={`p-5 rounded-lg text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-zinc-800 text-white rounded-br-sm' 
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-bl-sm'
              }`}>
                {msg.content}
              </div>
            </div>
          </motion.div>
        ))}

        {isProcessing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start w-full">
            <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg rounded-bl-sm flex gap-2 items-center">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
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
            className="fixed bottom-24 left-1/2 z-50 bg-zinc-900 border border-zinc-700 shadow-2xl rounded-xl p-3 flex items-center gap-3 max-w-lg w-full"
          >
            <ShieldAlert size={20} className={lastFeedback.includes('-') ? 'text-red-500' : 'text-emerald-500'} />
            <p className="text-xs text-zinc-300 font-medium">{lastFeedback}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <div className="p-6 pb-28 bg-zinc-950/80 backdrop-blur-md border-t border-zinc-800/80 shrink-0 flex items-center justify-center">
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
            className="flex-1 bg-zinc-900 border border-zinc-700 focus:border-zinc-700 rounded-lg p-4 pr-16 text-sm text-white resize-none h-[60px] custom-scrollbar focus:outline-none transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={isProcessing || !inputValue.trim()}
            className="absolute right-2 top-2 bottom-2 aspect-square bg-red-500 hover:bg-red-600 disabled:bg-zinc-800 text-white rounded-xl flex items-center justify-center transition-colors shadow-lg"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
