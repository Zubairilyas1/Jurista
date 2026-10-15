"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ArrowRight, Mail, KeyRound, User } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

function CourthouseWireframe() {
  return (
    <svg viewBox="0 0 600 700" className="absolute right-0 bottom-0 h-full w-auto opacity-[0.13] pointer-events-none select-none" fill="none">
      <polyline points="60,200 300,60 540,200" stroke="#10b981" strokeWidth="1.5" />
      <line x1="60" y1="200" x2="540" y2="200" stroke="#10b981" strokeWidth="1.5" />
      <rect x="60" y="200" width="480" height="30" stroke="#10b981" strokeWidth="1" />
      {[100, 175, 250, 325, 400, 475].map((x, i) => (
        <g key={i}>
          <line x1={x} y1="230" x2={x} y2="580" stroke="#10b981" strokeWidth="1.5" />
          <line x1={x-6} y1="230" x2={x-6} y2="580" stroke="#10b981" strokeWidth="0.4" strokeDasharray="4 6" />
          <line x1={x+6} y1="230" x2={x+6} y2="580" stroke="#10b981" strokeWidth="0.4" strokeDasharray="4 6" />
          <ellipse cx={x} cy="234" rx="14" ry="5" stroke="#10b981" strokeWidth="1" />
          <ellipse cx={x} cy="576" rx="14" ry="5" stroke="#10b981" strokeWidth="1" />
        </g>
      ))}
      <rect x="50" y="580" width="500" height="18" stroke="#10b981" strokeWidth="1.2" />
      <rect x="30" y="598" width="540" height="18" stroke="#10b981" strokeWidth="1" />
    </svg>
  );
}

function NetworkGraph() {
  const nodes = [
    { cx: 80, cy: 120 }, { cx: 160, cy: 60 }, { cx: 240, cy: 150 },
    { cx: 50, cy: 300 }, { cx: 130, cy: 380 }, { cx: 200, cy: 280 },
    { cx: 310, cy: 80 }, { cx: 370, cy: 200 }, { cx: 500, cy: 320 },
  ];
  const edges = [[0,1],[1,2],[0,3],[3,4],[4,5],[1,6],[6,7],[7,8],[5,8]];
  return (
    <svg viewBox="0 0 580 520" className="absolute left-0 top-0 w-full h-full opacity-[0.09] pointer-events-none select-none" fill="none">
      {edges.map(([a,b],i) => <line key={i} x1={nodes[a].cx} y1={nodes[a].cy} x2={nodes[b].cx} y2={nodes[b].cy} stroke="#10b981" strokeWidth="0.8"/>)}
      {nodes.map((n,i) => <circle key={i} cx={n.cx} cy={n.cy} r="3" fill="#10b981" fillOpacity="0.6"/>)}
    </svg>
  );
}

function JALogo({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="22" stroke="#10b981" strokeWidth="1.5" strokeOpacity="0.4" />
      <path d="M22 12 L22 30 Q22 38 15 38" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <path d="M26 36 L32 12 L38 36" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <line x1="28" y1="28" x2="36" y2="28" stroke="#10b981" strokeWidth="2" strokeLinecap="round"/>
      <line x1="15" y1="41" x2="33" y2="41" stroke="#10b981" strokeWidth="1" strokeOpacity="0.5"/>
    </svg>
  );
}

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://127.0.0.1:8001/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, full_name: fullName }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Registration failed');
      }
      const fd = new URLSearchParams();
      fd.append('username', email);
      fd.append('password', password);
      const loginRes = await fetch('http://127.0.0.1:8001/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: fd.toString(),
      });
      if (loginRes.ok) {
        const loginData = await loginRes.json();
        const userRes = await fetch('http://127.0.0.1:8001/api/v1/auth/me', {
          headers: { Authorization: `Bearer ${loginData.access_token}` },
        });
        login(loginData.access_token, await userRes.json());
      } else {
        router.push('/login');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    background: 'rgba(6,20,14,0.8)',
    border: '1px solid rgba(16,185,129,0.25)',
    borderRadius: '2px',
    color: '#e2e8f0',
  };
  const focusField = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = 'rgba(16,185,129,0.7)';
    e.currentTarget.style.boxShadow = '0 0 0 2px rgba(16,185,129,0.1)';
  };
  const blurField = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = 'rgba(16,185,129,0.25)';
    e.currentTarget.style.boxShadow = 'none';
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg, #050f0a 0%, #071410 30%, #091a14 60%, #050d09 100%)' }}
    >
      <NetworkGraph />
      <CourthouseWireframe />

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[700px] h-[700px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 70%)' }} />
      </div>

      {/* Top-left logo */}
      <div className="absolute top-8 left-10 flex items-center gap-3 z-20">
        <JALogo size={38} />
        <div>
          <p className="text-white font-bold text-lg tracking-widest uppercase leading-none" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Jurista</p>
          <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: '#10b981' }}>Advocate Assistant · Enterprise Edition</p>
        </div>
      </div>

      {/* Glass Panel */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md mx-6"
        style={{
          background: 'rgba(8, 24, 18, 0.72)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(16,185,129,0.35)',
          borderRadius: '4px',
          boxShadow: '0 0 0 1px rgba(16,185,129,0.08), 0 0 40px 4px rgba(16,185,129,0.12), 0 32px 64px rgba(0,0,0,0.6)',
        }}
      >
        <div className="absolute top-0 left-8 right-8 h-px" style={{ background: 'linear-gradient(90deg, transparent, #10b981, transparent)' }} />

        <div className="p-10 relative">
          {/* Panel header */}
          <div className="flex items-center gap-4 mb-8">
            <JALogo size={48} />
            <div>
              <p className="text-white font-bold text-xl tracking-widest uppercase leading-none" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Jurista</p>
              <p className="text-[10px] font-bold tracking-widest uppercase mt-1" style={{ color: '#10b981' }}>Advocate Assistant · Enterprise Edition</p>
            </div>
          </div>

          <h1 className="text-4xl font-bold text-white uppercase tracking-wider mb-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Enroll Firm
          </h1>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-8" style={{ color: '#52877a' }}>
            Establish a secure workspace for your chambers.
          </p>

          {error && (
            <div className="mb-6 px-4 py-3 text-[10px] font-bold uppercase tracking-widest border"
              style={{ color: '#f43f5e', backgroundColor: 'rgba(244,63,94,0.08)', borderColor: 'rgba(244,63,94,0.3)' }}>
              ⚠ {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="flex flex-col gap-5">
            {/* Full Name */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold tracking-widest uppercase" style={{ color: '#52877a' }}>Advocate Name</label>
              <div className="relative">
                <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)}
                  placeholder="e.g. Ali Raza" onFocus={focusField} onBlur={blurField}
                  className="w-full text-sm font-medium outline-none pl-10 pr-4 py-3 transition-all duration-200 placeholder-zinc-600"
                  style={inputStyle}
                />
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#10b981', opacity: 0.6 }} />
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold tracking-widest uppercase" style={{ color: '#52877a' }}>Firm Email</label>
              <div className="relative">
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="counsel@firm.com" onFocus={focusField} onBlur={blurField}
                  className="w-full text-sm font-medium outline-none pl-10 pr-4 py-3 transition-all duration-200 placeholder-zinc-600"
                  style={inputStyle}
                />
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#10b981', opacity: 0.6 }} />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold tracking-widest uppercase" style={{ color: '#52877a' }}>Master Passphrase</label>
              <div className="relative">
                <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" onFocus={focusField} onBlur={blurField}
                  className="w-full text-sm font-medium outline-none pl-10 pr-4 py-3 transition-all duration-200 placeholder-zinc-600"
                  style={inputStyle}
                />
                <KeyRound size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#10b981', opacity: 0.6 }} />
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="relative w-full py-4 text-[11px] font-bold tracking-widest uppercase text-white flex items-center justify-center gap-2 transition-all duration-200 mt-2 overflow-hidden disabled:opacity-60"
              style={{
                background: loading ? '#065f46' : 'linear-gradient(90deg, #059669, #10b981)',
                borderRadius: '2px',
                boxShadow: '0 0 20px rgba(16,185,129,0.3)',
              }}
              onMouseEnter={e => { if(!loading){ (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 32px rgba(16,185,129,0.55)'; }}}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 20px rgba(16,185,129,0.3)'; }}
            >
              {loading ? 'Provisioning Workspace...' : 'Establish Workspace'} {!loading && <ArrowRight size={14} />}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: '#52877a' }}>
              Already enrolled?{' '}
              <Link href="/login" className="underline transition-colors" style={{ color: '#10b981' }}>
                Sign In
              </Link>
            </p>
          </div>
        </div>

        <div className="absolute bottom-0 left-8 right-8 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(16,185,129,0.3), transparent)' }} />
      </motion.div>

      <div className="absolute bottom-6 right-8 text-[9px] font-bold tracking-widest uppercase z-10" style={{ color: 'rgba(16,185,129,0.3)' }}>
        Jurista Enterprise v2.4 · PakLaw-AI
      </div>
      <div className="absolute bottom-6 left-10 flex items-center gap-2 z-10">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-[9px] font-bold tracking-widest uppercase" style={{ color: 'rgba(16,185,129,0.4)' }}>
          Secure Connection · TLS 1.3
        </span>
      </div>
    </div>
  );
}
