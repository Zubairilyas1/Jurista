"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, User, Briefcase, Sliders, CheckCircle2, 
  Save, ShieldCheck 
} from 'lucide-react';

interface UserProfile {
  fullName: string;
  barLicense: string;
  email: string;
  phone: string;
  firmName: string;
  firmAddress: string;
  defaultLanguage: 'bilingual' | 'english';
  defaultCourt: string;
  smsAlerts: boolean;
}

const defaultProfile: UserProfile = {
  fullName: '',
  barLicense: '',
  email: '',
  phone: '',
  firmName: '',
  firmAddress: '',
  defaultLanguage: 'bilingual',
  defaultCourt: 'Lahore High Court',
  smsAlerts: true
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'firm' | 'preferences'>('profile');
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success'>('idle');

  useEffect(() => {
    const stored = localStorage.getItem('jurista_user_profile');
    if (stored) {
      try {
        setProfile({ ...defaultProfile, ...JSON.parse(stored) });
      } catch (e) {
        console.error(e);
      }
    }
    setIsLoaded(true);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveStatus('idle');
    
    setTimeout(() => {
      localStorage.setItem('jurista_user_profile', JSON.stringify(profile));
      window.dispatchEvent(new Event('storage'));
      setSaveStatus('success');
      setIsSaving(false);
      setTimeout(() => setSaveStatus('idle'), 3000);
    }, 600); // Fake network delay for better UX
  };

  const tabs = [
    { id: 'profile', label: 'Advocate Profile', icon: <User size={18} /> },
    { id: 'firm', label: 'Firm Details', icon: <Briefcase size={18} /> },
    { id: 'preferences', label: 'App Preferences', icon: <Sliders size={18} /> },
  ] as const;

  if (!isLoaded) return null;

  return (
    <div className="w-full h-full flex flex-col p-8 bg-[#0D0D0E] overflow-hidden text-white">
      
      {/* Header */}
      <div className="mb-8 shrink-0 flex items-center justify-between">
        <div>
          <h1 className="font-sans-hero text-4xl font-semibold tracking-tight uppercase text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50 mb-2">
            Settings
          </h1>
          <p className="text-white/50 text-sm font-medium tracking-wider uppercase flex items-center gap-2">
            <Settings size={14} className="text-emerald-400" />
            Lawyer Profile & Preferences
          </p>
        </div>
        
        {saveStatus === 'success' && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-tight border border-emerald-500/20">
            <CheckCircle2 size={16} /> Saved Successfully
          </motion.div>
        )}
      </div>

      <div className="flex-1 flex gap-8 overflow-hidden min-h-0">
        
        {/* Left Sidebar Menu */}
        <div className="w-64 shrink-0 flex flex-col gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-5 py-4 rounded-xl text-sm font-bold tracking-tight uppercase transition-all ${
                activeTab === tab.id 
                  ? 'bg-emerald-500 text-black shadow-sm' 
                  : 'text-white/50 hover:bg-white/5 hover:text-white'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}

          {/* Profile Completion Widget */}
          <div className="mt-auto card-dark p-5 rounded-lg border border-zinc-800/50 bg-zinc-900/50">
            <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-tight mb-4">Profile Status</h3>
            <div className="flex flex-col gap-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-white/60">Advocate Details</span>
                {profile.fullName && profile.barLicense ? (
                  <span className="text-emerald-400 flex items-center gap-1"><ShieldCheck size={14}/> Complete</span>
                ) : (
                  <span className="text-amber-400">Incomplete</span>
                )}
              </div>
              <div className="text-xs text-white/40 leading-relaxed mt-2">
                Completing your profile allows Jurista to automatically fill your details in Legal Drafts.
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pb-10">
          <form onSubmit={handleSave} className="max-w-3xl flex flex-col gap-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="card-dark border-zinc-800 rounded-lg overflow-hidden flex flex-col"
              >
                
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <>
                    <div className="p-6 border-b border-zinc-800/50 bg-zinc-900/50">
                      <h2 className="text-lg font-bold uppercase tracking-tight">Advocate Profile</h2>
                      <p className="text-xs text-white/50 mt-1">Your personal details to be used in drafted petitions and documents.</p>
                    </div>
                    <div className="p-6 flex flex-col gap-6">
                      
                      <div className="grid grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] font-bold text-emerald-400 uppercase tracking-tight">Full Name (with Prefix)</label>
                          <input 
                            value={profile.fullName}
                            onChange={(e) => setProfile({...profile, fullName: e.target.value})}
                            placeholder="e.g. Adv. Muhammad Ali"
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-sm font-medium focus:border-emerald-500 outline-none transition-colors"
                          />
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] font-bold text-emerald-400 uppercase tracking-tight">Bar License Number</label>
                          <input 
                            value={profile.barLicense}
                            onChange={(e) => setProfile({...profile, barLicense: e.target.value})}
                            placeholder="e.g. 12345/HC"
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-sm font-medium focus:border-emerald-500 outline-none transition-colors"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] font-bold text-white/50 uppercase tracking-tight">Email Address</label>
                          <input 
                            type="email"
                            value={profile.email}
                            onChange={(e) => setProfile({...profile, email: e.target.value})}
                            placeholder="advocate@example.com"
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-sm font-medium focus:border-emerald-500 outline-none transition-colors"
                          />
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] font-bold text-white/50 uppercase tracking-tight">Contact Number</label>
                          <input 
                            value={profile.phone}
                            onChange={(e) => setProfile({...profile, phone: e.target.value})}
                            placeholder="+92 300 0000000"
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-sm font-medium focus:border-emerald-500 outline-none transition-colors"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Firm Tab */}
                {activeTab === 'firm' && (
                  <>
                    <div className="p-6 border-b border-zinc-800/50 bg-zinc-900/50">
                      <h2 className="text-lg font-bold uppercase tracking-tight">Firm Details</h2>
                      <p className="text-xs text-white/50 mt-1">Information about your law firm or chamber.</p>
                    </div>
                    <div className="p-6 flex flex-col gap-6">
                      
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold text-emerald-400 uppercase tracking-tight">Law Firm / Chamber Name</label>
                        <input 
                          value={profile.firmName}
                          onChange={(e) => setProfile({...profile, firmName: e.target.value})}
                          placeholder="e.g. Ali & Associates"
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-sm font-medium focus:border-emerald-500 outline-none transition-colors"
                        />
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold text-white/50 uppercase tracking-tight">Office Address</label>
                        <textarea 
                          value={profile.firmAddress}
                          onChange={(e) => setProfile({...profile, firmAddress: e.target.value})}
                          placeholder="e.g. Chamber No. 42, District Courts..."
                          rows={3}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-sm font-medium focus:border-emerald-500 outline-none transition-colors resize-none"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Preferences Tab */}
                {activeTab === 'preferences' && (
                  <>
                    <div className="p-6 border-b border-zinc-800/50 bg-zinc-900/50">
                      <h2 className="text-lg font-bold uppercase tracking-tight">App Preferences</h2>
                      <p className="text-xs text-white/50 mt-1">Configure your default workflow options.</p>
                    </div>
                    <div className="p-6 flex flex-col gap-6">
                      
                      <div className="grid grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] font-bold text-emerald-400 uppercase tracking-tight">Default Drafting Language</label>
                          <select 
                            value={profile.defaultLanguage}
                            onChange={(e) => setProfile({...profile, defaultLanguage: e.target.value as 'bilingual'|'english'})}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-sm font-medium focus:border-emerald-500 outline-none transition-colors appearance-none"
                          >
                            <option value="bilingual">Bilingual (English / Urdu)</option>
                            <option value="english">English (Standard)</option>
                          </select>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] font-bold text-emerald-400 uppercase tracking-tight">Default Court</label>
                          <input 
                            value={profile.defaultCourt}
                            onChange={(e) => setProfile({...profile, defaultCourt: e.target.value})}
                            placeholder="e.g. Lahore High Court"
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-sm font-medium focus:border-emerald-500 outline-none transition-colors"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-5 rounded-xl border border-zinc-800/50 bg-zinc-900/30 mt-4">
                        <div>
                          <h4 className="text-sm font-bold text-white mb-1">WhatsApp Cause List Alerts</h4>
                          <p className="text-xs text-white/50">Receive daily SMS alerts for tracked upcoming hearings.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer"
                            checked={profile.smsAlerts}
                            onChange={(e) => setProfile({...profile, smsAlerts: e.target.checked})}
                          />
                          <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                        </label>
                      </div>

                    </div>
                  </>
                )}
                
              </motion.div>
            </AnimatePresence>

            {/* Save Button */}
            <div className="flex justify-end">
              <button 
                type="submit"
                disabled={isSaving}
                className="pill-dark px-8 py-4 bg-emerald-500 text-black hover:bg-emerald-500/90 font-bold tracking-tight uppercase text-sm flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : <Save size={18} />}
                {isSaving ? 'Saving Profile...' : 'Save Profile Settings'}
              </button>
            </div>
            
          </form>
        </div>
      </div>
    </div>
  );
}
