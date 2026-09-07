"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Shield, Briefcase, Bell, CheckCircle2, AlertCircle, Save, Smartphone, ChevronRight, Settings } from 'lucide-react';

interface UserProfile {
  fullName: string;
  licenseNumber: string;
  barCouncil: string;
  email: string;
  phone: string;
  firmName: string;
  firmAddress: string;
  defaultCourt: string;
  defaultLanguage: 'english' | 'bilingual';
  smsAlerts: boolean;
}

const defaultProfile: UserProfile = {
  fullName: '',
  licenseNumber: '',
  barCouncil: 'Punjab Bar Council',
  email: '',
  phone: '',
  firmName: '',
  firmAddress: '',
  defaultCourt: '',
  defaultLanguage: 'english',
  smsAlerts: false
};

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [activeTab, setActiveTab] = useState<'profile' | 'firm' | 'preferences'>('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [progress, setProgress] = useState(65);

  useEffect(() => {
    const stored = localStorage.getItem('jurista_user_profile');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setProfile({ ...defaultProfile, ...parsed });
        calculateProgress({ ...defaultProfile, ...parsed });
      } catch (e) {
        console.error("Failed to load profile", e);
      }
    }
  }, []);

  const calculateProgress = (p: UserProfile) => {
    let filled = 0;
    const requiredKeys = ['fullName', 'licenseNumber', 'barCouncil', 'phone', 'firmName', 'defaultCourt'];
    requiredKeys.forEach(key => {
      if (p[key as keyof UserProfile]) filled++;
    });
    setProgress(Math.round((filled / requiredKeys.length) * 100));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveStatus('idle');
    
    setTimeout(() => {
      localStorage.setItem('jurista_user_profile', JSON.stringify(profile));
      calculateProgress(profile);
      window.dispatchEvent(new Event('storage')); 
      setIsSaving(false);
      setSaveStatus('success');
      
      setTimeout(() => setSaveStatus('idle'), 3000);
    }, 800);
  };

  const InputField = ({ label, value, onChange, placeholder, type = "text" }: any) => (
    <div className="flex flex-col gap-3">
      <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest">{label}</label>
      <input 
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-transparent border-b border-zinc-800 pb-3 text-white placeholder-white/20 font-medium focus:border-emerald-500 outline-none transition-colors rounded-none"
      />
    </div>
  );

  return (
    <div className="w-full h-full flex bg-[#0D0D0E] relative overflow-hidden text-white selection:bg-emerald-500/30">
      
      <div className="flex-1 flex flex-col h-full z-10 relative overflow-y-auto custom-scrollbar p-8 pb-32">
        <div className="max-w-5xl mx-auto w-full pt-8">
          
          {/* Header */}
          <div className="flex items-start justify-between mb-16">
            <div className="flex flex-col gap-2">
              <h1 className="font-sans-hero text-4xl font-semibold tracking-wider uppercase text-white">
                SETTINGS & PROFILE
              </h1>
              <h2 className="text-sm font-medium text-white/50 uppercase tracking-widest">
                Configure your workspace, firm details, and AI behavior.
              </h2>
            </div>
            
            <AnimatePresence>
              {saveStatus === 'success' && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg text-xs font-bold uppercase tracking-tight"
                >
                  <CheckCircle2 size={16} />
                  Profile Saved
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-start gap-12">
            
            {/* Left Sidebar (Tabs & Progress) */}
            <div className="w-72 shrink-0 flex flex-col gap-8">
              
              {/* Progress Widget (Premium Minimalist) */}
              <div className="bg-[#18181C] border border-zinc-800/50 p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Profile Completion</span>
                  <span className="text-xs font-bold text-emerald-400">{progress}%</span>
                </div>
                <div className="w-full h-1 bg-white/5 overflow-hidden">
                  <motion.div 
                    className="h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
                {progress < 100 && (
                  <p className="text-[10px] text-amber-500 font-bold uppercase tracking-widest mt-2 flex items-center gap-1.5">
                    <AlertCircle size={12} />
                    Missing Required Details
                  </p>
                )}
              </div>

              {/* Navigation Tabs */}
              <div className="flex flex-col">
                {[
                  { id: 'profile', icon: User, label: 'Advocate Profile' },
                  { id: 'firm', icon: Briefcase, label: 'Firm Details' },
                  { id: 'preferences', icon: Settings, label: 'App Preferences' }
                ].map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center justify-between p-4 transition-all border-l-2 ${
                        isActive 
                          ? 'border-emerald-500 bg-white/5 text-emerald-400' 
                          : 'border-transparent text-white/50 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <tab.icon size={18} />
                        <span className="text-xs font-bold uppercase tracking-widest">{tab.label}</span>
                      </div>
                      <ChevronRight size={14} className={isActive ? 'opacity-100' : 'opacity-0'} />
                    </button>
                  );
                })}
              </div>

            </div>

            {/* Right Content Area */}
            <form onSubmit={handleSave} className="flex-1 flex flex-col gap-10">
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="bg-[#18181C] border border-zinc-800/50 p-10 min-h-[400px]"
                >
                  
                  {/* Profile Tab */}
                  {activeTab === 'profile' && (
                    <div className="flex flex-col gap-10">
                      <div>
                        <h2 className="text-xl font-bold uppercase tracking-widest mb-1 text-white">Advocate Profile</h2>
                        <p className="text-xs text-white/40 uppercase tracking-widest font-medium">Verify your bar council registration details.</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-10">
                        <InputField 
                          label="Full Name" 
                          value={profile.fullName} 
                          onChange={(e: any) => setProfile({...profile, fullName: e.target.value})} 
                          placeholder="e.g. Adv. Zain Ahmed" 
                        />
                        <InputField 
                          label="Bar Council" 
                          value={profile.barCouncil} 
                          onChange={(e: any) => setProfile({...profile, barCouncil: e.target.value})} 
                          placeholder="e.g. Punjab Bar Council" 
                        />
                        <InputField 
                          label="License Number" 
                          value={profile.licenseNumber} 
                          onChange={(e: any) => setProfile({...profile, licenseNumber: e.target.value})} 
                          placeholder="e.g. PB-12345" 
                        />
                        <InputField 
                          label="Contact Number" 
                          value={profile.phone} 
                          onChange={(e: any) => setProfile({...profile, phone: e.target.value})} 
                          placeholder="+92 300 0000000" 
                        />
                        <InputField 
                          label="Email Address" 
                          value={profile.email} 
                          onChange={(e: any) => setProfile({...profile, email: e.target.value})} 
                          placeholder="advocate@example.com" 
                          type="email"
                        />
                      </div>
                    </div>
                  )}

                  {/* Firm Tab */}
                  {activeTab === 'firm' && (
                    <div className="flex flex-col gap-10">
                      <div>
                        <h2 className="text-xl font-bold uppercase tracking-widest mb-1 text-white">Firm Details</h2>
                        <p className="text-xs text-white/40 uppercase tracking-widest font-medium">Information about your law firm or chamber.</p>
                      </div>
                      
                      <div className="flex flex-col gap-10">
                        <InputField 
                          label="Law Firm / Chamber Name" 
                          value={profile.firmName} 
                          onChange={(e: any) => setProfile({...profile, firmName: e.target.value})} 
                          placeholder="e.g. Ali & Associates" 
                        />
                        
                        <div className="flex flex-col gap-3">
                          <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Office Address</label>
                          <textarea 
                            value={profile.firmAddress}
                            onChange={(e: any) => setProfile({...profile, firmAddress: e.target.value})}
                            placeholder="e.g. Chamber No. 42, District Courts..."
                            rows={3}
                            className="w-full bg-transparent border-b border-zinc-800 pb-3 text-white placeholder-white/20 font-medium focus:border-emerald-500 outline-none transition-colors resize-none rounded-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Preferences Tab */}
                  {activeTab === 'preferences' && (
                    <div className="flex flex-col gap-10">
                      <div>
                        <h2 className="text-xl font-bold uppercase tracking-widest mb-1 text-white">App Preferences</h2>
                        <p className="text-xs text-white/40 uppercase tracking-widest font-medium">Configure your default workflow options.</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-10">
                        <div className="flex flex-col gap-3">
                          <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Default Drafting Language</label>
                          <select 
                            value={profile.defaultLanguage}
                            onChange={(e: any) => setProfile({...profile, defaultLanguage: e.target.value as 'bilingual'|'english'})}
                            className="w-full bg-transparent border-b border-zinc-800 pb-3 text-white font-medium focus:border-emerald-500 outline-none transition-colors rounded-none appearance-none cursor-pointer"
                          >
                            <option value="bilingual" className="bg-[#18181C]">Bilingual (English / Urdu)</option>
                            <option value="english" className="bg-[#18181C]">English (Standard)</option>
                          </select>
                        </div>
                        
                        <InputField 
                          label="Default Court" 
                          value={profile.defaultCourt} 
                          onChange={(e: any) => setProfile({...profile, defaultCourt: e.target.value})} 
                          placeholder="e.g. Lahore High Court" 
                        />
                      </div>

                      <div className="flex items-center justify-between pt-6 border-t border-zinc-800/50 mt-4">
                        <div className="flex flex-col">
                          <h4 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2"><Smartphone size={16} className="text-emerald-400" /> WhatsApp Cause List Alerts</h4>
                          <p className="text-[10px] text-white/40 uppercase tracking-widest font-medium mt-1">Receive daily SMS alerts for tracked upcoming hearings.</p>
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
                  )}

                </motion.div>
              </AnimatePresence>

              {/* Save Button */}
              <div className="flex justify-end">
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold tracking-widest uppercase text-[10px] px-8 py-4 flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : <Save size={16} />}
                  {isSaving ? 'SAVING...' : 'SAVE PROFILE SETTINGS'}
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
