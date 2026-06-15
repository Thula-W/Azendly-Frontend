import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Star, MessageSquare, Building2, Users, FileText, Sparkles } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FeedbackData) => Promise<void>;
}

export interface FeedbackData {
  rating: number;
  feedback: string;
  company?: string;
  hiresPerMonth: number;
  avgResumesPerRole: number;
  suggestions?: string;
}

export default function FeedbackModal({ isOpen, onClose, onSubmit }: FeedbackModalProps) {
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [feedback, setFeedback] = useState('');
  const [company, setCompany] = useState('');
  const [hiresPerMonth, setHiresPerMonth] = useState<number>(0);
  const [avgResumesPerRole, setAvgResumesPerRole] = useState<number>(0);
  const [suggestions, setSuggestions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return; // Basic validation for required fields
    
    setIsSubmitting(true);
    try {
      await onSubmit({
        rating,
        feedback,
        company: company.trim() || undefined,
        hiresPerMonth,
        avgResumesPerRole,
        suggestions: suggestions.trim() || undefined
      });
      // Reset state on successful submission
      setRating(0);
      setFeedback('');
      setCompany('');
      setHiresPerMonth(0);
      setAvgResumesPerRole(0);
      setSuggestions('');
      onClose();
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 md:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl rounded-[2.5rem] p-1 bg-gradient-to-br from-white/10 to-white/5 border border-white/10 shadow-2xl z-10 max-h-[90vh] flex flex-col"
          >
            <div className="bg-[#0D0D0F] rounded-[calc(2.5rem-4px)] p-6 md:p-8 overflow-y-auto h-full flex flex-col custom-scrollbar">
              
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  {/* <div className="inline-flex p-3 rounded-2xl bg-white/5 text-cyan-400 mb-3">
                    <Sparkles size={22} />
                  </div> */}
                  <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">Share Your Feedback</h2>
                  <p className="text-gray-400 text-sm mt-1">Help us optimize Azendly to match your recruiting habits.</p>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 rounded-xl bg-white/5 text-gray-500 hover:text-white transition-colors border border-white/5"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6 flex-1">
                
                {/* 1. Star Rating (1-5) */}
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest font-black text-gray-400">Overall Experience*</label>
                  <div className="flex items-center gap-2 py-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        className="transition-transform active:scale-95 focus:outline-none"
                      >
                        <Star
                          size={32}
                          className={`transition-all duration-150 ${
                            star <= (hoveredRating || rating)
                              ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.3)]'
                              : 'text-zinc-700 hover:text-zinc-500'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Feedback (Textarea) */}
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest font-black text-gray-400 flex items-center gap-1.5">
                    <MessageSquare size={14} className="text-purple-400" /> What you love *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Tell us about Azendly's impact on your recruiting process, how was your experience."
                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition-all text-sm resize-none"
                  />
                </div>

                {/* 3. Company (Optional) */}
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest font-black text-gray-400 flex items-center gap-1.5">
                    <Building2 size={14} className="text-zinc-500" /> Company Name <span className="text-zinc-600 font-normal lowercase italic">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="If you are a freelancer just add Freelancer :)"
                    className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition-all text-sm"
                  />
                </div>

                {/* 4. Numeric Recruitment metrics (Hires & Resumes) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-3xl p-5 border border-white/5 flex flex-col justify-between">
                    <div>
                      <label className="text-xs uppercase tracking-widest font-black text-gray-400 flex items-center gap-1.5 mb-1">
                        <Users size={14} className="text-cyan-400" /> Hires Per Month *
                      </label>
                      <p className="text-xs text-gray-500 mb-3">Average Job openings per month</p>
                    </div>
                    <input
                      type="number"
                      required
                      min="0"
                      value={hiresPerMonth || ''}
                      onChange={(e) => setHiresPerMonth(Math.max(0, parseInt(e.target.value) || 0))}
                      placeholder="0"
                      className="w-full px-4 py-3 bg-zinc-950/50 border border-white/5 rounded-xl text-white focus:outline-none focus:border-cyan-500/40 text-lg font-black tracking-wide"
                    />
                  </div>

                  <div className="bg-white/5 rounded-3xl p-5 border border-white/5 flex flex-col justify-between">
                    <div>
                      <label className="text-xs uppercase tracking-widest font-black text-gray-400 flex items-center gap-1.5 mb-1">
                        <FileText size={14} className="text-violet-400" /> Resumes Per Role *
                      </label>
                      <p className="text-xs text-gray-500 mb-3">Average applications per job role</p>
                    </div>
                    <input
                      type="number"
                      required
                      min="0"
                      value={avgResumesPerRole || ''}
                      onChange={(e) => setAvgResumesPerRole(Math.max(0, parseInt(e.target.value) || 0))}
                      placeholder="0"
                      className="w-full px-4 py-3 bg-zinc-950/50 border border-white/5 rounded-xl text-white focus:outline-none focus:border-cyan-500/40 text-lg font-black tracking-wide"
                    />
                  </div>
                </div>

                {/* 5. Improvements & Suggestions (Optional) */}
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest font-black text-gray-400 flex items-center gap-1.5">
                    Suggestions <span className="text-zinc-600 font-normal lowercase italic">(optional)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={suggestions}
                    onChange={(e) => setSuggestions(e.target.value)}
                    placeholder="Are there any improvements / new features you'd like to see ?"
                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition-all text-sm resize-none"
                  />
                </div>

                {/* Submit Footer Panel */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/5">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-3.5 rounded-xl bg-white/5 text-white font-bold text-sm hover:bg-white/10 transition-all order-2 sm:order-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || rating === 0}
                    className="flex-[2] py-3.5 bg-gradient-to-r from-purple-600 to-cyan-600 disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 hover:scale-[1.01] transition-all shadow-xl shadow-cyan-500/5 order-1 sm:order-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <span>Submit Feedback</span>
                    )}
                  </button>
                </div>

              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}