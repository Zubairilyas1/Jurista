"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ArrowRight, Mail, KeyRound } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

/* ─────────────────────────────────────────────────────────────
   COURTHOUSE WIREFRAME — Detailed Greek columns + pediment
───────────────────────────────────────────────────────────── */
function CourthouseWireframe() {
  const COL_X = [520, 590, 660, 730, 800, 870, 940];
  const COL_TOP = 280;
  const COL_BOT = 620;
  const GLOW = '#1de9a4';

  return (
    <svg
      viewBox="0 0 1100 750"
      className="absolute inset-0 w-full h-full pointer-events-none select-none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ opacity: 0.18 }}
    >
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* ── Pediment (triangle roof) ── */}
      <polyline
        points={`${COL_X[0] - 30},${COL_TOP} 730,160 ${COL_X[6] + 30},${COL_TOP}`}
        stroke={GLOW} strokeWidth="2" filter="url(#glow)"
      />
      {/* Pediment inner detail lines */}
      <line x1="625" y1={COL_TOP} x2="680" y2="205" stroke={GLOW} strokeWidth="0.8" strokeOpacity="0.5"/>
      <line x1="835" y1={COL_TOP} x2="780" y2="205" stroke={GLOW} strokeWidth="0.8" strokeOpacity="0.5"/>

      {/* ── Entablature (architrave band) ── */}
      <rect x={COL_X[0] - 30} y={COL_TOP} width={COL_X[6] - COL_X[0] + 60} height="22"
        stroke={GLOW} strokeWidth="1.5" filter="url(#glow)" />
      <rect x={COL_X[0] - 30} y={COL_TOP + 22} width={COL_X[6] - COL_X[0] + 60} height="14"
        stroke={GLOW} strokeWidth="1" strokeOpacity="0.6" />

      {/* ── Columns ── */}
      {COL_X.map((x, i) => (
        <g key={i} filter="url(#glow)">
          {/* Shaft */}
          <rect x={x - 14} y={COL_TOP + 36} width="28" height={COL_BOT - COL_TOP - 36}
            stroke={GLOW} strokeWidth="1.5" fill="none" />
          {/* Fluting lines inside column */}
          {[-8, -4, 0, 4, 8].map((off, j) => (
            <line key={j}
              x1={x + off} y1={COL_TOP + 38}
              x2={x + off} y2={COL_BOT - 12}
              stroke={GLOW} strokeWidth="0.35" strokeOpacity="0.5"
            />
          ))}
          {/* Capital (top) */}
          <rect x={x - 18} y={COL_TOP + 33} width="36" height="6"
            stroke={GLOW} strokeWidth="1" fill="none" />
          <ellipse cx={x} cy={COL_TOP + 38} rx="12" ry="3"
            stroke={GLOW} strokeWidth="0.8" fill="none" strokeOpacity="0.7" />
          {/* Base */}
          <rect x={x - 18} y={COL_BOT - 12} width="36" height="6"
            stroke={GLOW} strokeWidth="1" fill="none" />
          <rect x={x - 22} y={COL_BOT - 6} width="44" height="5"
            stroke={GLOW} strokeWidth="1" fill="none" />
        </g>
      ))}

      {/* ── Stylobate / Steps ── */}
      <rect x={COL_X[0] - 50} y={COL_BOT} width={COL_X[6] - COL_X[0] + 100} height="16"
        stroke={GLOW} strokeWidth="1.5" filter="url(#glow)" />
      <rect x={COL_X[0] - 70} y={COL_BOT + 16} width={COL_X[6] - COL_X[0] + 140} height="14"
        stroke={GLOW} strokeWidth="1.2" filter="url(#glow)" />
      <rect x={COL_X[0] - 90} y={COL_BOT + 30} width={COL_X[6] - COL_X[0] + 180} height="14"
        stroke={GLOW} strokeWidth="1" filter="url(#glow)" />

      {/* ── Shield + Key Watermark ── */}
      <g transform="translate(720, 310)" filter="url(#glow)" opacity="0.7">
        {/* Shield outline */}
        <path d="M60 0 L110 22 L110 72 Q110 110 60 130 Q10 110 10 72 L10 22 Z"
          stroke={GLOW} strokeWidth="2" fill="none" />
        <path d="M60 10 L100 28 L100 72 Q100 104 60 120 Q20 104 20 72 L20 28 Z"
          stroke={GLOW} strokeWidth="0.8" strokeOpacity="0.4" fill="none" />
        {/* Scales inside shield */}
        <line x1="60" y1="40" x2="60" y2="90" stroke={GLOW} strokeWidth="1.5" />
        <line x1="38" y1="52" x2="82" y2="52" stroke={GLOW} strokeWidth="1.5" />
        <path d="M38,52 L28,70 L48,70 Z" stroke={GLOW} strokeWidth="1" fill="none"/>
        <path d="M82,52 L72,70 L92,70 Z" stroke={GLOW} strokeWidth="1" fill="none"/>
        {/* Key */}
        <circle cx="60" cy="105" r="9" stroke={GLOW} strokeWidth="1.5" fill="none"/>
        <line x1="60" y1="114" x2="60" y2="128" stroke={GLOW} strokeWidth="1.5"/>
        <line x1="60" y1="120" x2="67" y2="120" stroke={GLOW} strokeWidth="1.5"/>
        <line x1="60" y1="125" x2="65" y2="125" stroke={GLOW} strokeWidth="1.5"/>
      </g>

      {/* ── Network Graph (left side) ── */}
      {[
        [[80,120],[160,65],[245,140],[55,290],[130,370],[195,275],[85,450],[170,510]],
        [[0,1],[1,2],[0,3],[3,4],[4,5],[1,5],[3,6],[6,7],[4,7],[2,5]]
      ].map((_, idx) => null)}
      {/* Nodes */}
      {[[80,120],[160,65],[245,140],[55,290],[130,370],[195,275],[85,450],[170,510],[300,90],[350,200],[420,130]].map(([cx,cy],i) => (
        <circle key={`n${i}`} cx={cx} cy={cy} r="3.5" fill={GLOW} opacity="0.7" filter="url(#glow)"/>
      ))}
      {/* Edges */}
      {[[0,1],[1,2],[0,3],[3,4],[4,5],[1,5],[3,6],[6,7],[4,7],[2,8],[8,9],[9,10],[2,9],[5,10]].map(([a,b],i) => {
        const pts = [[80,120],[160,65],[245,140],[55,290],[130,370],[195,275],[85,450],[170,510],[300,90],[350,200],[420,130]];
        return <line key={`e${i}`} x1={pts[a][0]} y1={pts[a][1]} x2={pts[b][0]} y2={pts[b][1]}
          stroke={GLOW} strokeWidth="0.8" opacity="0.5" filter="url(#glow)"/>;
      })}
    </svg>
  );
}

/* ─── JA Interwoven Logo ─── */
function JALogo({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none">
      <circle cx="22" cy="22" r="20" stroke="#1de9a4" strokeWidth="1.5" strokeOpacity="0.5"/>
      <path d="M19 10 L19 28 Q19 36 12 36" stroke="#1de9a4" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <path d="M24 34 L30 10 L36 34" stroke="#1de9a4" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <line x1="26" y1="26" x2="34" y2="26" stroke="#1de9a4" strokeWidth="2" strokeLinecap="round"/>
      <line x1="12" y1="39" x2="30" y2="39" stroke="#1de9a4" strokeWidth="1" strokeOpacity="0.4"/>
    </svg>
  );
}

export default function LoginPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const { login }               = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const fd = new URLSearchParams();
      fd.append('username', email);
      fd.append('password', password);
      const res = await fetch('http://127.0.0.1:8001/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: fd.toString(),
      });
      if (!res.ok) throw new Error('Invalid credentials');
      const data = await res.json();
      const userRes = await fetch('http://127.0.0.1:8001/api/v1/auth/me', {
        headers: { Authorization: `Bearer ${data.access_token}` },
      });
      login(data.access_token, await userRes.json());
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const inputBase = {
    background: 'rgba(5, 25, 16, 0.9)',
    border: '1px solid rgba(29, 233, 164, 0.22)',
    borderRadius: '3px',
    color: '#c8d8d0',
  };

  const onFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = 'rgba(29,233,164,0.65)';
    e.currentTarget.style.boxShadow = '0 0 0 2px rgba(29,233,164,0.08), inset 0 0 12px rgba(29,233,164,0.04)';
  };
  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = 'rgba(29, 233, 164, 0.22)';
    e.currentTarget.style.boxShadow = 'none';
  };

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden flex items-center justify-center"
      style={{
        background: 'radial-gradient(ellipse 80% 60% at 60% 50%, #061a10 0%, #040e08 40%, #020a05 100%)',
      }}
    >
      {/* Full-canvas wireframe graphics */}
      <CourthouseWireframe />

      {/* Subtle radial bloom behind card */}
      <div className="absolute pointer-events-none"
        style={{
          left: '50%', top: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px', height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(29,233,164,0.055) 0%, transparent 70%)',
        }}
      />

      {/* ── Top-left brand mark ── */}
      <div className="absolute top-7 left-8 flex items-center gap-3 z-20">
        <JALogo size={40} />
        <div>
          <p className="font-bold text-base tracking-widest uppercase text-white leading-none"
            style={{ fontFamily: 'Plus Jakarta Sans, Inter, sans-serif' }}>JURISTA</p>
          <p className="text-[9px] font-bold tracking-widest uppercase mt-0.5"
            style={{ color: '#1de9a4' }}>Advocate Assistant · Enterprise Edition</p>
        </div>
      </div>

      {/* ── Glass Login Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-[420px] mx-6"
        style={{
          background: 'rgba(4, 18, 11, 0.82)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          border: '1px solid rgba(29, 233, 164, 0.28)',
          borderRadius: '6px',
          boxShadow: [
            '0 0 0 1px rgba(29,233,164,0.06)',
            '0 0 60px rgba(29,233,164,0.09)',
            '0 40px 80px rgba(0,0,0,0.7)',
            'inset 0 1px 0 rgba(29,233,164,0.12)',
          ].join(', '),
        }}
      >
        {/* Top shimmer line */}
        <div className="absolute top-0 left-6 right-6 h-px rounded-full"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(29,233,164,0.5), transparent)' }} />

        <div className="px-10 py-9">

          {/* Card header */}
          <div className="flex items-center gap-3 mb-7">
            <JALogo size={42} />
            <div>
              <p className="font-bold text-white text-lg tracking-widest uppercase leading-none"
                style={{ fontFamily: 'Plus Jakarta Sans, Inter, sans-serif' }}>JURISTA</p>
              <p className="text-[9px] font-bold tracking-widest uppercase mt-1"
                style={{ color: '#1de9a4' }}>Advocate Assistant · Enterprise Edition</p>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-[38px] font-extrabold text-white uppercase leading-none tracking-wide mb-1.5"
            style={{ fontFamily: 'Plus Jakarta Sans, Inter, sans-serif' }}>
            Sign In
          </h1>
          <p className="text-[10px] font-semibold uppercase tracking-widest mb-7"
            style={{ color: '#5a8a70' }}>
            Access your secure legal intelligence workspace.
          </p>

          {/* Error */}
          {error && (
            <div className="mb-5 px-4 py-3 text-[10px] font-bold uppercase tracking-widest rounded border"
              style={{ color: '#ff6b6b', background: 'rgba(255,80,80,0.07)', borderColor: 'rgba(255,80,80,0.25)' }}>
              ⚠ {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="flex flex-col gap-5">

            {/* Email field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold tracking-widest uppercase"
                style={{ color: '#5a8a70' }}>Advocate Email</label>
              <div className="relative">
                <input
                  type="email" required value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="counsel@firm.com"
                  onFocus={onFocus} onBlur={onBlur}
                  className="w-full pl-9 pr-4 py-3 text-sm font-medium outline-none transition-all duration-200 placeholder:text-zinc-600"
                  style={{ ...inputBase }}
                />
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: '#1de9a4', opacity: 0.55 }} />
              </div>
            </div>

            {/* Password field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold tracking-widest uppercase"
                style={{ color: '#5a8a70' }}>Passphrase</label>
              <div className="relative">
                <input
                  type="password" required value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  onFocus={onFocus} onBlur={onBlur}
                  className="w-full pl-9 pr-4 py-3 text-sm font-medium outline-none transition-all duration-200 placeholder:text-zinc-600"
                  style={{ ...inputBase }}
                />
                <KeyRound size={14} className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: '#1de9a4', opacity: 0.55 }} />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit" disabled={loading}
              className="relative w-full py-[14px] text-[11px] font-bold tracking-widest uppercase text-white flex items-center justify-center gap-2 mt-2 overflow-hidden transition-all duration-300 disabled:opacity-50"
              style={{
                background: 'linear-gradient(90deg, #0ba360 0%, #1de9a4 100%)',
                borderRadius: '3px',
                boxShadow: '0 0 24px rgba(29,233,164,0.28)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 40px rgba(29,233,164,0.5)';
                (e.currentTarget as HTMLButtonElement).style.background = 'linear-gradient(90deg, #0d9e5c 0%, #1fffa8 100%)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 24px rgba(29,233,164,0.28)';
                (e.currentTarget as HTMLButtonElement).style.background = 'linear-gradient(90deg, #0ba360 0%, #1de9a4 100%)';
              }}
            >
              {loading ? 'Authenticating...' : 'Authorize Access'}
              {!loading && <ArrowRight size={14} />}
            </button>
          </form>

          {/* Secondary links */}
          <div className="mt-5 flex flex-col items-center gap-1.5">
            <button className="text-[10px] font-semibold tracking-widest uppercase underline transition-colors duration-200"
              style={{ color: '#5a8a70' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#1de9a4')}
              onMouseLeave={e => (e.currentTarget.style.color = '#5a8a70')}>
              Forgot Passphrase?
            </button>
            <p className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: '#5a8a70' }}>
              New Advocate?{' '}
              <Link href="/register"
                className="underline transition-colors duration-200"
                style={{ color: '#1de9a4' }}>
                Get Started
              </Link>
            </p>
          </div>

          {/* SSO divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px" style={{ background: 'rgba(29,233,164,0.12)' }} />
            <span className="text-[9px] font-bold tracking-widest uppercase whitespace-nowrap"
              style={{ color: '#3d6650' }}>Or Sign In With</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(29,233,164,0.12)' }} />
          </div>

          {/* SSO Buttons */}
          <div className="flex gap-3">
            <button
              className="flex-1 flex items-center justify-center gap-2 py-2.5 text-[10px] font-bold tracking-widest uppercase transition-all duration-200"
              style={{ background: 'rgba(4,18,11,0.8)', border: '1px solid rgba(29,233,164,0.18)', borderRadius: '3px', color: '#7aaa90' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(29,233,164,0.45)'; (e.currentTarget as HTMLButtonElement).style.color = '#c8d8d0'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(29,233,164,0.18)'; (e.currentTarget as HTMLButtonElement).style.color = '#7aaa90'; }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="0" y="0" width="7.5" height="7.5" fill="#F35325"/>
                <rect x="8.5" y="0" width="7.5" height="7.5" fill="#81BC06"/>
                <rect x="0" y="8.5" width="7.5" height="7.5" fill="#05A6F0"/>
                <rect x="8.5" y="8.5" width="7.5" height="7.5" fill="#FFBA08"/>
              </svg>
              Microsoft 365
            </button>

            <button
              className="flex-1 flex items-center justify-center gap-2 py-2.5 text-[10px] font-bold tracking-widest uppercase transition-all duration-200"
              style={{ background: 'rgba(4,18,11,0.8)', border: '1px solid rgba(29,233,164,0.18)', borderRadius: '3px', color: '#7aaa90' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(29,233,164,0.45)'; (e.currentTarget as HTMLButtonElement).style.color = '#c8d8d0'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(29,233,164,0.18)'; (e.currentTarget as HTMLButtonElement).style.color = '#7aaa90'; }}
            >
              {/* Shield icon */}
              <svg width="14" height="16" viewBox="0 0 14 16" fill="none">
                <path d="M7 1 L13 3.5 L13 9 Q13 13.5 7 15.5 Q1 13.5 1 9 L1 3.5 Z"
                  stroke="#7aaa90" strokeWidth="1.2" fill="none"/>
                <circle cx="7" cy="8" r="2.5" stroke="#7aaa90" strokeWidth="1"/>
              </svg>
              Firm ID
            </button>
          </div>

        </div>

        {/* Bottom shimmer line */}
        <div className="absolute bottom-0 left-6 right-6 h-px rounded-full"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(29,233,164,0.2), transparent)' }} />
      </motion.div>

      {/* Corner labels */}
      <div className="absolute bottom-5 left-8 flex items-center gap-2 z-10">
        <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#1de9a4' }} />
        <span className="text-[8px] font-bold tracking-widest uppercase" style={{ color: 'rgba(29,233,164,0.35)' }}>
          Secure Connection · TLS 1.3
        </span>
      </div>
      <div className="absolute bottom-5 right-8 z-10">
        <span className="text-[8px] font-bold tracking-widest uppercase" style={{ color: 'rgba(29,233,164,0.25)' }}>
          Jurista Enterprise v2.4 · PakLaw-AI
        </span>
      </div>
    </div>
  );
}
