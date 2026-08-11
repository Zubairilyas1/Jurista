"use client";

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Globe, Scale, ScanText, ScrollText, CalendarClock, Settings, Plus, Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { label: 'Explore', icon: <Globe size={20} strokeWidth={2.5} />, path: '/' },
  { label: 'Workspace', icon: <Briefcase size={20} strokeWidth={2.5} />, path: '/workspace' },
  { label: 'Legal Chat', icon: <Scale size={20} strokeWidth={2.5} />, path: '/chat' },
  { label: 'OCR Review', icon: <ScanText size={20} strokeWidth={2.5} />, path: '/ocr' },
  { label: 'Petition Drafter', icon: <ScrollText size={20} strokeWidth={2.5} />, path: '/petition' },
  { label: 'Cause Tracker', icon: <CalendarClock size={20} strokeWidth={2.5} />, path: '/tracker' },
  { label: 'Settings', icon: <Settings size={20} strokeWidth={2.5} />, path: '/settings' },
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
      className="h-full flex flex-col py-6 shrink-0 relative z-50 bg-[#0D0D0E]"
    >
      
      {/* Top Logo Badge */}
      <div className={`flex items-center ${isHovered ? 'px-6 justify-start' : 'justify-center'} mb-12 h-12 overflow-hidden`}>
        <div className="w-12 h-12 shrink-0 bg-white rounded-full flex items-center justify-center text-black font-sans-hero font-black text-xl">
          {initials}
        </div>
        <AnimatePresence>
          {isHovered && (
            <motion.span 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="ml-4 font-sans-hero font-black tracking-widest uppercase text-lg text-white whitespace-nowrap"
            >
              Jurista
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation Pills */}
      <div className="flex flex-col gap-2 px-3">
        {navItems.map((item) => {
          const active = pathname === item.path || (item.path !== '/' && pathname?.startsWith(item.path));
          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`h-12 rounded-full flex items-center transition-all overflow-hidden relative ${isHovered ? 'px-4 justify-start' : 'justify-center'} ${
                active 
                  ? 'bg-lime/10 text-lime border border-lime/20 shadow-[0_0_15px_rgba(204,255,0,0.1)]' 
                  : 'text-[#8E8E93] hover:bg-[#26262B] hover:text-white'
              }`}
              title={!isHovered ? item.label : undefined}
            >
              <div className="shrink-0 z-10">{item.icon}</div>
              <AnimatePresence>
                {isHovered && (
                  <motion.span 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="ml-4 font-bold text-sm tracking-wide whitespace-nowrap z-10"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          );
        })}
      </div>

      {/* Bottom Action Button */}
      <div className={`mt-auto ${isHovered ? 'px-4' : 'px-3'}`}>
        <button 
          onClick={() => router.push('/chat')}
          className={`h-14 bg-[#26262B] text-white rounded-2xl flex items-center hover:bg-[#323238] transition-colors shadow-lg border border-white/5 overflow-hidden ${isHovered ? 'w-full px-4' : 'w-full justify-center'}`}
        >
          <Plus size={24} strokeWidth={2.5} className="shrink-0 text-lime" />
          <AnimatePresence>
            {isHovered && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="ml-3 font-bold text-sm tracking-widest uppercase whitespace-nowrap text-white/80"
              >
                New Chat
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
      
    </motion.div>
  );
}
