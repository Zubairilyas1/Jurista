"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useThemeMode } from '@/components/ThemeProvider';

interface ThemeToggleProps {
  collapsed?: boolean;
}

export function ThemeToggle({ collapsed = false }: ThemeToggleProps) {
  const { theme, toggleTheme, isDark } = useThemeMode();

  return (
    <button
      onClick={toggleTheme}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      className={`
        relative flex items-center gap-3 w-full
        ${collapsed ? 'justify-center' : ''}
        rounded-xl transition-colors duration-200
        p-2 group
        hover:bg-white/5
        ${!isDark ? 'hover:bg-black/5' : ''}
      `}
    >
      {/* Icon container with animated swap */}
      <div
        className="w-9 h-9 shrink-0 rounded-xl flex items-center justify-center border transition-colors duration-200"
        style={{
          backgroundColor: 'var(--bg-elevated)',
          borderColor: 'var(--border)',
          color: 'var(--text-muted)',
        }}
      >
        <AnimatePresence mode="wait">
          {isDark ? (
            <motion.div
              key="moon"
              initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.2 }}
            >
              <Sun size={16} className="text-amber-400" />
            </motion.div>
          ) : (
            <motion.div
              key="sun"
              initial={{ rotate: 90, opacity: 0, scale: 0.5 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: -90, opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.2 }}
            >
              <Moon size={16} className="text-indigo-400" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Label – only visible when sidebar is expanded */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.15 }}
            className="flex flex-col items-start overflow-hidden"
          >
            <span
              className="text-xs font-bold uppercase tracking-wider whitespace-nowrap"
              style={{ color: 'var(--text-muted)' }}
            >
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </span>
            <span
              className="text-[9px] font-bold uppercase tracking-widest"
              style={{ color: 'var(--text-faint)' }}
            >
              {isDark ? 'Currently: Dark' : 'Currently: Light'}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapsed tooltip */}
      {collapsed && (
        <div
          className="absolute left-16 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1.5 rounded-md border shadow-xl whitespace-nowrap"
          style={{
            backgroundColor: 'var(--bg-elevated)',
            color: 'var(--text-primary)',
            borderColor: 'var(--border)',
          }}
        >
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </div>
      )}
    </button>
  );
}
