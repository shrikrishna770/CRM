'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { Card, Button, Input } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { AlertCircle, ShieldAlert, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const { loginWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [showSimulatedGoogleModal, setShowSimulatedGoogleModal] = useState(false);
  const [simulatedEmail, setSimulatedEmail] = useState('');
  const [showCustomEmailInput, setShowCustomEmailInput] = useState(false);

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  // Initialize Google Sign-In
  const initializeGoogleSignIn = () => {
    try {
      const google = (window as any).google;
      if (!google || !googleClientId) return;

      google.accounts.id.initialize({
        client_id: googleClientId,
        callback: handleGoogleCallback,
      });

      google.accounts.id.renderButton(
        document.getElementById('google-signin-btn'),
        { 
          theme: 'filled_blue', 
          size: 'large', 
          width: '360',
          text: 'signin_with',
          shape: 'rectangular'
        }
      );
    } catch (err) {
      console.error('Error rendering Google button:', err);
    }
  };

  const handleGoogleCallback = async (response: any) => {
    setLoading(true);
    setError('');
    const res = await loginWithGoogle(response.credential);
    if (!res.success) {
      setError(res.error || 'Google Authentication failed.');
      setLoading(false);
    }
  };

  useEffect(() => {
    // If google script was already loaded in document, initialize immediately
    const google = (window as any).google;
    if (google && googleClientId) {
      const timer = setTimeout(() => {
        initializeGoogleSignIn();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [googleClientId]);

  const handleSimulatedGoogleSubmitDirect = async (emailStr: string) => {
    if (!emailStr.trim()) return;

    setLoading(true);
    setError('');
    setShowSimulatedGoogleModal(false);
    setShowCustomEmailInput(false);

    const mockToken = `mock_google_token_${emailStr.trim()}`;
    const res = await loginWithGoogle(mockToken);
    if (!res.success) {
      setError(res.error || 'Google Authentication failed.');
      setLoading(false);
    }
  };

  const handleSimulatedGoogleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    handleSimulatedGoogleSubmitDirect(simulatedEmail);
  };


  const handleLoginClick = () => {
    if (!googleClientId) {
      setShowSimulatedGoogleModal(true);
    }
  };

  return (
    <>
      {/* Load Google Identity Services SDK dynamically if Client ID is configured */}
      {googleClientId && (
        <Script
          src="https://accounts.google.com/gsi/client"
          onLoad={initializeGoogleSignIn}
          strategy="afterInteractive"
        />
      )}

      {/* Full screen wrapper */}
      <div className="fixed inset-0 w-full h-full flex items-center justify-center bg-[#1b55e2] bg-gradient-to-tr from-[#0b3ec5] via-[#1b55e2] to-[#3a7cfa] p-4 overflow-y-auto z-[9999]">
        
        {/* Soft Background circles */}
        <div className="absolute top-[10%] left-[5%] w-[300px] h-[300px] bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-[10%] right-[5%] w-[400px] h-[400px] bg-white/5 rounded-full blur-3xl pointer-events-none"></div>

        {/* Main Split Card Container */}
        <div className="relative w-full max-w-[950px] min-h-[520px] bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row my-8">
          
          {/* LEFT SIDE (Brand column) */}
          <div className="w-full md:w-1/2 bg-gradient-to-br from-[#1b55e2] to-[#3f83fc] p-8 md:p-12 flex flex-col justify-center items-center text-center relative overflow-hidden">
            
            {/* Grid overlay texture */}
            <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
            
            {/* Soft rings overlay */}
            <div className="absolute w-[200px] h-[200px] border border-white/5 rounded-full -top-10 -left-10 pointer-events-none"></div>
            <div className="absolute w-[350px] h-[350px] border border-white/5 rounded-full -bottom-20 -right-20 pointer-events-none"></div>

            {/* Logo box */}
            <div className="relative z-10 bg-white/10 border border-white/20 px-5 py-3 rounded-2xl flex items-center gap-3 backdrop-blur-md mb-8 shadow-inner">
              <div className="flex items-center">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                  <path d="M7 17L12 12L7 7" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M13 17L18 12L13 7" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-white font-extrabold text-lg tracking-wide">StartupsFiling</span>
            </div>

            {/* Content */}
            <div className="relative z-10">
              <h1 className="text-3xl font-extrabold text-white mb-3 tracking-tight">StartupsFiling CRM</h1>
              <p className="text-white/80 text-sm max-w-[320px] mx-auto leading-relaxed font-medium">
                Manage leads, track deals, and close faster with a transparent CRM workflow.
              </p>
            </div>
          </div>

          {/* RIGHT SIDE (Auth Column) */}
          <div className="w-full md:w-1/2 bg-[#f4f6f9] p-8 md:p-12 flex flex-col justify-center relative overflow-hidden">
            
            {/* Soft decorative background circles */}
            <div className="absolute top-[-100px] right-[-100px] w-[260px] h-[260px] bg-slate-200/50 rounded-full blur-xl pointer-events-none"></div>
            <div className="absolute bottom-[-100px] left-[-100px] w-[260px] h-[260px] bg-slate-200/50 rounded-full blur-xl pointer-events-none"></div>

            <div className="relative z-10 w-full max-w-[360px] mx-auto">
              
              <h2 className="text-2xl md:text-3xl font-extrabold text-[#1e293b] mb-1.5 tracking-tight flex flex-col">
                Login to your account
                <span className="w-12 h-1 bg-[#1b55e2] mt-2.5 rounded-full"></span>
              </h2>
              
              <p className="text-slate-500 text-xs mb-8 font-medium">
                Don't have an account?{' '}
                <Link href="/register" className="text-[#1b55e2] font-semibold hover:underline">
                  Request access
                </Link>
              </p>

              {error && (
                <div className="p-3.5 mb-5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs leading-relaxed flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Login Button Container */}
              <div className="w-full min-h-[48px] flex justify-center items-center mb-8">
                {googleClientId ? (
                  <div 
                    id="google-signin-btn" 
                    className="w-full flex justify-center [&_iframe]:w-full [&_iframe]:max-w-full [&_iframe]:rounded-xl"
                  ></div>
                ) : (
                  <button
                    type="button"
                    onClick={handleLoginClick}
                    className="w-full h-[48px] bg-[#1b55e2] hover:bg-[#1548c2] text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/35 transition-all text-center flex items-center justify-center active:scale-[0.99]"
                  >
                    Login
                  </button>
                )}
              </div>

              {!googleClientId && (
                <p className="text-[10px] text-amber-600 text-center font-bold bg-amber-500/10 py-1.5 px-3 rounded-lg border border-amber-500/15 mb-6">
                  ⚠️ Developer Demo Mode (Simulated Google Auth)
                </p>
              )}



            </div>
          </div>

        </div>
      </div>

      {/* Simulated Google Login Dialog Modal */}
      {showSimulatedGoogleModal && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-[#0e0e0e]/95 backdrop-blur-[2px]">
          <div className="w-full max-w-[760px] bg-[#1f1f1f] border border-[#2d2d2d] rounded-[28px] p-10 shadow-2xl relative flex flex-col md:flex-row gap-8 text-[#e3e3e3] font-sans">
            
            {/* LEFT COLUMN */}
            <div className="w-full md:w-1/2 flex flex-col justify-between min-h-[220px]">
              <div>
                {/* Google Logo & Header */}
                <div className="flex items-center gap-2 mb-8">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#ea4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.466 0-6.277-2.85-6.277-6.36s2.81-6.36 6.277-6.36c1.552 0 2.96.565 4.062 1.493l3.052-3.093C18.238 1.966 15.42 1 12.24 1 6.033 1 1 6.096 1 12.38s5.033 11.38 11.24 11.38c5.899 0 10.745-4.22 10.745-10.457 0-.7-.074-1.38-.204-2.018H12.24z" />
                  </svg>
                  <span className="text-[14px] text-[#e3e3e3] font-medium">Sign in with Google</span>
                </div>

                {/* Main Heading */}
                <h3 className="text-[32px] font-normal leading-[40px] text-[#e3e3e3] mb-2">
                  Choose an account
                </h3>
                <p className="text-[16px] text-[#c4c7c5]">
                  to continue to <span className="font-semibold text-white">startupsfiling.in</span>
                </p>
              </div>
              
              {/* Footer (Left) */}
              <div className="text-[12px] text-[#909090] mt-8 flex items-center gap-1 cursor-pointer hover:text-slate-300">
                English (United States)
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M7 10l5 5 5-5z"/>
                </svg>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="w-full md:w-1/2 flex flex-col justify-between min-h-[220px]">
              <div className="space-y-1">
                {/* Account Item 1 (Shrikrishna) */}
                <button
                  type="button"
                  onClick={() => {
                    handleSimulatedGoogleSubmitDirect('shrikrishna24@navgurukul.org');
                  }}
                  className="w-full flex items-center gap-4 p-4 rounded-full hover:bg-[#2d2d2d] transition-all text-left group"
                >
                  <div className="w-10 h-10 rounded-full bg-[#1558d6] flex items-center justify-center text-white font-semibold text-lg uppercase shrink-0">
                    s
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-white group-hover:text-white truncate">shri krishna kumar</p>
                    <p className="text-[12px] text-[#c4c7c5] truncate">shrikrishna24@navgurukul.org</p>
                  </div>
                </button>

                {/* Use another account section */}
                {!showCustomEmailInput ? (
                  <button
                    type="button"
                    onClick={() => setShowCustomEmailInput(true)}
                    className="w-full flex items-center gap-4 p-4 rounded-full hover:bg-[#2d2d2d] transition-all text-left group"
                  >
                    <div className="w-10 h-10 rounded-full border border-[#444746] flex items-center justify-center text-[#8ab4f8] shrink-0 group-hover:bg-[#2d2d2d]">
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M9 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm6 2h-1.27c-.71.36-1.52.57-2.38.57-1.12 0-2.14-.37-2.99-1H2v2c0 2.21 1.79 4 4 4h6c2.21 0 4-1.79 4-4v-1.57zM20 18v-3h-2v3h-3v2h3v3h2v-3h3v-2h-3z"/>
                      </svg>
                    </div>
                    <span className="text-[14px] font-medium text-[#8ab4f8] group-hover:text-[#a8c7fa]">Use another account</span>
                  </button>
                ) : (
                  <div className="p-4 rounded-2xl bg-[#282828] border border-[#3c3c3c] mt-2 space-y-3">
                    <label className="block text-xs text-[#c4c7c5] font-medium">Email address</label>
                    <input
                      type="email"
                      placeholder="e.g. user@navgurukul.org"
                      value={simulatedEmail}
                      onChange={(e) => setSimulatedEmail(e.target.value)}
                      className="w-full bg-[#1f1f1f] border border-[#444746] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#8ab4f8]"
                      autoFocus
                    />
                    <div className="flex justify-end gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          setShowCustomEmailInput(false);
                          setSimulatedEmail('');
                        }}
                        className="px-3 py-1.5 rounded-lg text-[#8ab4f8] hover:bg-[#333]"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSimulatedGoogleSubmitDirect(simulatedEmail)}
                        className="px-3 py-1.5 rounded-lg bg-[#1a73e8] text-white hover:bg-[#1558d6]"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer (Right) */}
              <div className="flex justify-between md:justify-end gap-4 text-[12px] text-[#909090] mt-8">
                <a href="#" className="hover:text-slate-300">Help</a>
                <a href="#" className="hover:text-slate-300">Privacy</a>
                <a href="#" className="hover:text-slate-300">Terms</a>
                <button
                  type="button"
                  onClick={() => setShowSimulatedGoogleModal(false)}
                  className="ml-auto md:ml-4 text-rose-400 hover:text-rose-300 font-bold"
                >
                  Close
                </button>
              </div>
            </div>
            
          </div>
        </div>
      )}
    </>
  );
}
