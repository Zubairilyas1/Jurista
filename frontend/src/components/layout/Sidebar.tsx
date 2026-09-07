"use client";

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Globe, Scale, ScanText, ScrollText, CalendarClock, Settings, Plus, Briefcase, Gavel, Link2, ShieldAlert, GitCompare, LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const navGroups = [
  {
    id: 'core',
    items: [
      { label: 'Explore', icon: <Globe size={20} strokeWidth={2.5} />, path: '/' },
      { label: 'Workspace', icon: <Briefcase size={20} strokeWidth={2.5} />, path: '/workspace' },
    ]
  },
  {
    id: 'assistants',
    items: [
      { label: 'Legal Chat', icon: <Scale size={20} strokeWidth={2.5} />, path: '/chat' },
      { label: 'OCR Review', icon: <ScanText size={20} strokeWidth={2.5} />, path: '/ocr' },
      { label: 'Petition Drafter', icon: <ScrollText size={20} strokeWidth={2.5} />, path: '/petition' },
      { label: 'Opponent Analyzer', icon: <ShieldAlert size={20} strokeWidth={2.5} />, path: '/analyze' },
      { label: 'Contradiction Engine', icon: <GitCompare size={20} strokeWidth={2.5} />, path: '/contradiction' },
      { label: 'Moot Court', icon: <Gavel size={20} strokeWidth={2.5} />, path: '/moot' },
      { label: 'Legal Links', icon: <Link2 size={20} strokeWidth={2.5} />, path: '/links' },
    ]
  },
  {
    id: 'system',
    items: [
      { label: 'Cause Tracker', icon: <CalendarClock size={20} strokeWidth={2.5} />, path: '/tracker' },
      { label: 'Settings', icon: <Settings size={20} strokeWidth={2.5} />, path: '/settings' },
    ]
  }
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [initials, setInitials] = useState('JN');
  const [showLogout, setShowLogout] = useState(false);

  useEffect(() => {
    const handleStorage = () => {
      const stored = localStorage.getItem('jurista_user_profile');
      if (stored) {
        try {
          const profile = JSON.parse(stored);
          if (profile.fullName) {
            const parts = profile.fullName.replace(/Adv\.|Advocate/ig, '').trim().split(' ');
            if (parts.length >= 2) {
              setInitials((parts[0][0] + parts[parts.length-1][0]).toUpperCase());
            } else if (parts.length === 1 && parts[0]) {
              setInitials(parts[0].substring(0, 2).toUpperCase());
            }
          }
        } catch (e) {}
      }
    };
    handleStorage();
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return (
    <motion.div 
      initial={{ width: 80 }}
      animate={{ width: isHovered ? 260 : 80 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setShowLogout(false); }}
      className="h-full flex flex-col py-6 shrink-0 relative z-50 bg-[#0D0D0E] border-r border-zinc-800"
    >
      
      {/* Top Logo Badge */}
      <div className={`flex items-center ${isHovered ? 'px-6 justify-start' : 'justify-center'} mb-10 h-10 overflow-hidden`}>
        <div className="w-10 h-10 shrink-0 bg-[#18181C] border border-zinc-800 rounded-lg flex items-center justify-center text-white font-sans-hero font-bold text-sm tracking-wider">
          JX
        </div>
        <AnimatePresence>
          {isHovered && (
            <motion.span 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="ml-3 font-sans-hero font-bold tracking-widest uppercase text-sm text-white whitespace-nowrap"
            >
              Jurista
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation Pills */}
      <div className="flex flex-col px-3 flex-1 overflow-y-auto custom-scrollbar">
        {navGroups.map((group, groupIdx) => (
          <React.Fragment key={group.id}>
            {groupIdx > 0 && <div className="border-t border-zinc-800/80 my-2 mx-2"></div>}
            <div className="flex flex-col gap-1.5">
              {group.items.map((item) => {
                const active = pathname === item.path || (item.path !== '/' && pathname?.startsWith(item.path));
                return (
                  <button
                    key={item.path}
                    onClick={() => router.push(item.path)}
                    className={`group h-10 rounded-lg flex items-center transition-all overflow-visible relative ${isHovered ? 'px-3 justify-start' : 'justify-center'} ${
                      active 
                        ? 'bg-emerald-500/10 text-emerald-400 font-medium' 
                        : 'text-zinc-500 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 rounded-l-lg shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>}
                    <div className="shrink-0 z-10">{item.icon}</div>
                    <AnimatePresence>
                      {isHovered && (
                        <motion.span 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="ml-3 font-bold text-xs uppercase tracking-tight whitespace-nowrap z-10"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    
                    {/* Tooltip for collapsed state */}
                    {!isHovered && (
                      <div className="absolute left-16 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 bg-zinc-800 text-zinc-100 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1.5 rounded-md border border-zinc-700 shadow-xl whitespace-nowrap">
                        {item.label}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* User Profile Footer */}
      <div className={`mt-auto pt-6 px-4 flex flex-col gap-4 border-t border-zinc-800/80 mx-2`}>
        <div className="relative">
          <AnimatePresence>
            {showLogout && isHovered && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-full left-0 mb-2 w-full bg-[#18181C] border border-zinc-800 rounded-xl p-2 shadow-2xl"
              >
                <button className="w-full flex items-center gap-2 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 p-2 rounded-lg text-xs font-bold uppercase tracking-tight transition-colors">
                  <LogOut size={14} /> Sign Out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div 
            onClick={() => isHovered && setShowLogout(!showLogout)}
            className={`flex items-center gap-3 ${isHovered ? 'cursor-pointer p-2 hover:bg-white/5 rounded-xl transition-colors' : 'justify-center'}`}
          >
            <div className="w-9 h-9 shrink-0 bg-zinc-800 border border-zinc-700 rounded-full flex items-center justify-center text-white font-sans-hero font-bold text-sm tracking-wider">
              {initials}
            </div>
            
            <AnimatePresence>
              {isHovered && (
                <motion.div 
                  initial={{ opacity: 0, w: 0 }}
                  animate={{ opacity: 1, w: 'auto' }}
                  exit={{ opacity: 0, w: 0 }}
                  className="flex flex-col overflow-hidden"
                >
                  <span className="text-sm font-bold text-white tracking-tight truncate">Advocate {initials}</span>
                  <span className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold">Online</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      
    </motion.div>
  );
}