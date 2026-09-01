
"use client";

import React, { useState, useEffect } from 'react';
import { Briefcase, Plus, Search, Edit2, Trash2, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { CreateCaseWizard } from '@/components/CreateCaseWizard';

export default function WorkspaceManagerPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const fetchProjects = async () => {
    try {
      const res = await fetch('http://localhost:8001/api/v1/projects/');
      const data = await res.json();
      setProjects(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to completely delete this case and its AI brain? This cannot be undone.")) return;
    
    try {
      await fetch(`http://localhost:8001/api/v1/projects/${id}`, { method: 'DELETE' });
      setProjects(projects.filter(p => p.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const startEditing = (e: React.MouseEvent, project: any) => {
    e.stopPropagation();
    setEditingId(project.id);
    setEditTitle(project.title);
  };

  const handleSaveEdit = async (e: React.MouseEvent | React.FormEvent, id: string) => {
    e.stopPropagation();
    if (e.type === 'submit') e.preventDefault();
    if (!editTitle.trim()) return;

    try {
      await fetch(`http://localhost:8001/api/v1/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editTitle })
      });
      setProjects(projects.map(p => p.id === id ? { ...p, title: editTitle } : p));
      setEditingId(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950 text-zinc-100 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 relative">
      <header className="h-16 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md px-8 flex items-center justify-between z-10 sticky top-0 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
            <Briefcase size={16} className="text-emerald-400" />
          </div>
          <h1 className="text-sm font-bold tracking-tight text-zinc-100 uppercase">Case Management</h1>
        </div>
        
        <button 
          onClick={() => setShowWizard(true)}
          className="flex items-center gap-2 bg-emerald-500 text-zinc-950 px-4 py-2 rounded-lg text-xs font-bold tracking-tight uppercase hover:bg-emerald-400 transition-colors"
        >
          <Plus size={14} /> New Case
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-6xl mx-auto flex flex-col gap-8">
          
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input 
                type="text" 
                placeholder="Search active cases..." 
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500/50 transition-colors"
              />
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1,2,3].map(i => (
                <div key={i} className="h-32 bg-zinc-900/50 border border-zinc-800 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center bg-zinc-900/30 border border-zinc-800 rounded-2xl border-dashed">
              <Briefcase size={40} className="text-zinc-600 mb-4" />
              <h3 className="text-zinc-300 font-bold tracking-tight mb-2">No Active Cases</h3>
              <p className="text-zinc-500 text-sm max-w-sm mb-6">Create a new Case Workspace to begin working.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project, idx) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={project.id}
                  onClick={() => window.location.href = `/workspace/${project.id}`}
                  className="bg-zinc-900/50 border border-zinc-800 hover:border-emerald-500/30 rounded-xl p-5 cursor-pointer group transition-all flex flex-col relative overflow-hidden"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Activity size={14} className="text-emerald-500" />
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tight">Active</span>
                    </div>
                    
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => startEditing(e, project)} 
                        className="p-1.5 text-zinc-400 hover:text-emerald-400 hover:bg-zinc-800 rounded"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        onClick={(e) => handleDelete(e, project.id)} 
                        className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  
                  {editingId === project.id ? (
                    <form 
                      onSubmit={(e) => handleSaveEdit(e, project.id)} 
                      onClick={(e) => e.stopPropagation()} 
                      className="flex gap-2 mb-2"
                    >
                      <input 
                        type="text" 
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        autoFocus
                        className="flex-1 bg-zinc-950 border border-emerald-500/50 rounded px-2 py-1 text-sm text-zinc-100 focus:outline-none"
                      />
                      <button type="submit" className="px-2 py-1 bg-emerald-500 text-zinc-950 rounded text-xs font-bold">Save</button>
                    </form>
                  ) : (
                    <h3 className="text-zinc-200 font-bold tracking-tight mb-1 truncate pr-4">{project.title}</h3>
                  )}
                  
                  <p className="text-[10px] text-zinc-500 uppercase tracking-tight mb-4">{project.active_modules.length} Tools Enabled</p>
                  
                  <div className="mt-auto flex items-center gap-1.5 flex-wrap">
                    {project.active_modules.slice(0,4).map((mod: string) => (
                      <span key={mod} className="px-2 py-1 bg-zinc-800 text-zinc-400 text-[9px] font-bold uppercase tracking-wider rounded">
                        {mod}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {showWizard && <CreateCaseWizard onClose={() => setShowWizard(false)} />}
    </div>
  );
}
