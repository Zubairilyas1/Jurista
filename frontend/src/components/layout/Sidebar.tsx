"use client";

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Globe, Scale, ScanText, ScrollText, CalendarClock, Settings, Plus, Briefcase, Gavel, Link2, ShieldAlert, GitCompare
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
      onMouseLeave={() => setIsHovered(false)}
      className="h-full flex flex-col py-6 shrink-0 relative z-50 bg-zinc-950 border-r border-zinc-800"
    >
      
      {/* Top Logo Badge */}
      <div className={`flex items-center ${isHovered ? 'px-6 justify-start' : 'justify-center'} mb-10 h-10 overflow-hidden`}>
        <div className="w-10 h-10 shrink-0 bg-zinc-100 rounded-lg flex items-center justify-center text-zinc-900 font-bold text-sm">
          {initials}
        </div>
        <AnimatePresence>
          {isHovered && (
            <motion.span 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="ml-3 font-bold tracking-tight text-base text-zinc-100 whitespace-nowrap"
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
            {groupIdx > 0 && <div className="border-t border-zinc-800 my-2 mx-2"></div>}
            <div className="flex flex-col gap-1.5">
              {group.items.map((item) => {
                const active = pathname === item.path || (item.path !== '/' && pathname?.startsWith(item.path));
                return (
                  <button
                    key={item.path}
                    onClick={() => router.push(item.path)}
                    className={`group h-10 rounded-lg flex items-center transition-colors overflow-visible relative ${isHovered ? 'px-3 justify-start' : 'justify-center'} ${
                      active 
                        ? 'bg-zinc-800 text-zinc-100 font-medium' 
                        : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                    }`}
                  >
                    <div className="shrink-0 z-10">{item.icon}</div>
                    <AnimatePresence>
                      {isHovered && (
                        <motion.span 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="ml-3 font-medium text-sm tracking-wide whitespace-nowrap z-10"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    
                    {/* Tooltip for collapsed state */}
                    {!isHovered && (
                      <div className="absolute left-14 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 bg-zinc-800 text-zinc-100 text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap border border-zinc-700">
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

      {/* Bottom Action Button */}
      <div className={`mt-auto pt-4 ${isHovered ? 'px-3' : 'px-3'}`}>
        <button 
          onClick={() => router.push('/workspace')}
          className={`group relative h-10 bg-zinc-100 text-zinc-900 rounded-lg flex items-center hover:bg-white transition-colors overflow-visible ${isHovered ? 'w-full px-3' : 'w-full justify-center'}`}
        >
          <Plus size={18} strokeWidth={2.5} className="shrink-0" />
          <AnimatePresence>
            {isHovered && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="ml-2 font-semibold text-sm whitespace-nowrap"
              >
                New Case
              </motion.span>
            )}
          </AnimatePresence>
          
          {/* Tooltip */}
          {!isHovered && (
            <div className="absolute left-14 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 bg-zinc-800 text-zinc-100 text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap border border-zinc-700">
              New Case
            </div>
          )}
        </button>
      </div>
      
    </motion.div>
  );
}