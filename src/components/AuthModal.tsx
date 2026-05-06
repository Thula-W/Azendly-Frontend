import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User, Linkedin, Chrome } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'login' | 'signup';
  setMode: (mode: 'login' | 'signup') => void;
  onLogin: () => void;
}

export default function AuthModal({ isOpen, onClose, mode, setMode, onLogin }: AuthModalProps) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLoading(false);
    onLogin();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md max-h-[90vh] p-px rounded-[2rem] bg-gradient-to-br from-purple-500/20 to-cyan-500/20 shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="bg-[#0D0D0F] rounded-[calc(2rem-1px)] p-6 md:p-8 flex-grow flex flex-col relative overflow-y-auto custom-scrollbar">
              <button 
                onClick={onClose}
                className="absolute top-5 right-5 text-gray-500 hover:text-white transition-colors z-10"
              >
                <X size={20} />
              </button>

              <div className="text-center mb-6">
                <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-1">
                  {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="text-sm text-gray-400 max-w-xs mx-auto">
                  {mode === 'login' ? 'Enter your credentials to access your account' : 'Join Azendly and start hiring the top 1%'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <button className="w-full py-2.5 px-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center gap-2 hover:bg-white/10 transition-all font-bold text-[10px] uppercase tracking-widest">
                  <Chrome className="w-3.5 h-3.5 text-cyan-400" />
                  Google
                </button>
                <button className="w-full py-2.5 px-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center gap-2 hover:bg-white/10 transition-all font-bold text-[10px] uppercase tracking-widest">
                  <Linkedin className="w-3.5 h-3.5 text-[#0077B5]" />
                  LinkedIn
                </button>
              </div>

              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/5"></div>
                </div>
                <div className="relative flex justify-center text-[8px] uppercase">
                  <span className="bg-[#0D0D0F] px-3 text-gray-500 tracking-[0.3em] font-bold">Or continue with email</span>
                </div>
              </div>

              <form className="space-y-3 w-full" onSubmit={handleSubmit}>
                {mode === 'signup' && (
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-3.5 h-3.5" />
                    <input 
                      type="text" 
                      placeholder="Full Name"
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white text-xs placeholder:text-gray-600 focus:outline-none focus:border-cyan-500/50 transition-all"
                    />
                  </div>
                )}
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-3.5 h-3.5" />
                  <input 
                    type="email" 
                    placeholder="Email Address"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white text-xs placeholder:text-gray-600 focus:outline-none focus:border-cyan-500/50 transition-all"
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-3.5 h-3.5" />
                  <input 
                    type="password" 
                    placeholder="Password"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white text-xs placeholder:text-gray-600 focus:outline-none focus:border-cyan-500/50 transition-all"
                  />
                </div>
                {mode === 'signup' && (
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-3.5 h-3.5" />
                    <input 
                      type="password" 
                      placeholder="Confirm Password"
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white text-xs placeholder:text-gray-600 focus:outline-none focus:border-cyan-500/50 transition-all"
                    />
                  </div>
                )}

                <button 
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-black uppercase tracking-widest hover:scale-[1.02] transition-all shadow-xl shadow-cyan-500/10 mt-2 text-xs flex items-center justify-center gap-2"
                >
                  {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-500 font-medium text-[10px]">
                  {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
                  <button 
                    onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                    className="ml-1.5 text-cyan-400 font-black hover:underline uppercase tracking-widest"
                  >
                    {mode === 'login' ? 'Sign Up' : 'Login'}
                  </button>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
