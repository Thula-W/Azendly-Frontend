import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Info, CheckCircle2 } from 'lucide-react';
import { apiService } from '../../services/api';
import { Job } from '../../types';

interface AddJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJobCreated: (job: Job) => void;
  userId: string;
}

export default function AddJobModal({ isOpen, onClose, onJobCreated, userId }: AddJobModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    overview: '',
    expectedSkills: '',
    expectedExperience: '',
    candidateOverview: '',
    educationLevel: 'Bachelors',
    languages: '',
    yearsOfExperience: '0',
    signals: ''
  });

  const isFormValid = 
    formData.title.trim() !== '' &&
    formData.overview.trim() !== '' &&
    formData.expectedSkills.trim() !== '' &&
    formData.expectedExperience.trim() !== '' &&
    formData.candidateOverview.trim() !== '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    
    setLoading(true);
    try {
      const job = await apiService.createJob({
        title: formData.title,
        overview: formData.overview,
        skills: formData.expectedSkills,
        experience: formData.expectedExperience,
        bio: formData.candidateOverview,
        constraints: {
          educationLevel: formData.educationLevel,
          languages: formData.languages,
          yearsOfExperience: formData.yearsOfExperience
        },
        signals: formData.signals,
        userId,
        status: 'active'
      });
      onJobCreated(job);
    } catch (error) {
      console.error('Error creating job:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[130] flex items-start justify-center p-4 md:p-12 overflow-y-auto custom-scrollbar">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/95 backdrop-blur-xl"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-4xl rounded-[2.5rem] bg-[#111113] border border-white/10 shadow-2xl flex flex-col my-auto"
      >
        <div className="p-6 md:p-8 flex items-center justify-between border-b border-white/5">
          <div>
            <h2 className="text-2xl font-black text-white">Create New Job</h2>
            <p className="text-sm text-gray-500">Define your requirements to start matching candidates</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 custom-scrollbar">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">Job Title*</label>
              <input 
                required
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Senior Software Engineer"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white placeholder:text-gray-700 focus:border-cyan-500 focus:outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">Job Overview*</label>
                <textarea 
                  required
                  rows={3}
                  value={formData.overview}
                  onChange={e => setFormData({ ...formData, overview: e.target.value })}
                  placeholder="A brief description of the role..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white placeholder:text-gray-700 focus:border-cyan-500 focus:outline-none transition-all resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">Candidate Overview*</label>
                <textarea 
                  required
                  rows={3}
                  value={formData.candidateOverview}
                  onChange={e => setFormData({ ...formData, candidateOverview: e.target.value })}
                  placeholder="Ideal persona..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white placeholder:text-gray-700 focus:border-cyan-500 focus:outline-none transition-all resize-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">Expected Skills*</label>
              <textarea 
                required
                rows={6}
                value={formData.expectedSkills}
                onChange={e => setFormData({ ...formData, expectedSkills: e.target.value })}
                placeholder="Key technical and soft skills..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white placeholder:text-gray-700 focus:border-cyan-500 focus:outline-none transition-all resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">Expected Experience*</label>
              <textarea 
                required
                rows={6}
                value={formData.expectedExperience}
                onChange={e => setFormData({ ...formData, expectedExperience: e.target.value })}
                placeholder="Required background and career history..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white placeholder:text-gray-700 focus:border-cyan-500 focus:outline-none transition-all resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">Ranking Signals (Optional)</label>
              <textarea 
                rows={4}
                value={formData.signals}
                onChange={e => setFormData({ ...formData, signals: e.target.value })}
                placeholder="e.g. Look for open source contributions or leadership experience."
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white placeholder:text-gray-700 focus:border-cyan-500 focus:outline-none transition-all resize-none"
              />
            </div>

            <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <CheckCircle2 className="text-purple-400" size={18} />
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest text-white">Hard Constraints (Optional)</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Min. Education</label>
                  <select
                    value={formData.educationLevel}
                    onChange={e => setFormData({ ...formData, educationLevel: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs text-white focus:border-cyan-500 focus:outline-none appearance-none cursor-pointer [&>option]:bg-[#111113] [&>option]:text-white"
                  >
                    <option value="Diploma">Diploma</option>
                    <option value="Bachelors">Bachelors</option>
                    <option value="Masters">Masters</option>
                    <option value="PhD">PhD</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Languages</label>
                  <input 
                    value={formData.languages}
                    onChange={e => setFormData({ ...formData, languages: e.target.value })}
                    placeholder="e.g. English"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-2 lg:col-span-1">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Years of Exp</label>
                  <input 
                    value={formData.yearsOfExperience}
                    onChange={e => {
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      setFormData({ ...formData, yearsOfExperience: value });
                    }}
                    placeholder="e.g. 5"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </form>

        <div className="p-6 md:p-8 border-t border-white/5 flex gap-4">
          <button 
            type="button"
            onClick={onClose}
            className="flex-1 py-4 px-6 rounded-2xl bg-white/5 text-white font-bold hover:bg-white/10 transition-all uppercase tracking-widest text-xs"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={loading || !isFormValid}
            className="flex-[2] py-4 px-6 rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-black hover:scale-[1.01] transition-all uppercase tracking-widest text-xs shadow-xl shadow-cyan-500/10 disabled:opacity-50 flex items-center justify-center gap-3 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Plus size={18} />
            )}
            {loading ? 'Creating...' : 'Post Job'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
