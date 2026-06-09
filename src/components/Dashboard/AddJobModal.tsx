import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Info, CheckCircle2, Trash2, Upload, ArrowRight } from 'lucide-react';
import { apiService } from '../../services/api';
import { Job } from '../../types';

interface AddJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJobCreated: (job: Job) => void;
  userId: string;
}

interface EvaluationItem {
  id: string;
  file: File | null;
  verdict: string;
}

type ModalStage = 'form' | 'evaluations';

export default function AddJobModal({ isOpen, onClose, onJobCreated, userId }: AddJobModalProps) {
  const [stage, setStage] = useState<ModalStage>('form');
  const [loading, setLoading] = useState(false);
  const [createdJob, setCreatedJob] = useState<Job | null>(null);
  
  // Job Form Data
  const [formData, setFormData] = useState({
    title: '',
    overview: '',
    expectedSkills: '',
    expectedExperience: '',
    candidateOverview: '',
    educationLevel: 'Select',
    yearsOfExperience: '0',
    signals: ''
  });

  // Evaluation Stage Data (Starts with one empty setup)
  const [evaluations, setEvaluations] = useState<EvaluationItem[]>([
    { id: crypto.randomUUID(), file: null, verdict: '' }
  ]);

  const isFormValid = 
    formData.title.trim() !== '' &&
    formData.overview.trim() !== '' &&
    formData.expectedSkills.trim() !== '' &&
    formData.expectedExperience.trim() !== '' &&
    formData.candidateOverview.trim() !== '';

  // Initial form submission to create the job position
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
          educationLevel: formData.educationLevel === 'Select' ? null : formData.educationLevel,
          yearsOfExperience: Number(formData.yearsOfExperience)
        },
        userId,
        status: 'active'
      });
      
      setCreatedJob(job);
      // Move to the evaluations step instead of closing immediately
      setStage('evaluations');
    } catch (error) {
      console.error('Error creating job:', error);
    } finally {
      setLoading(false);
    }
  };

  // Evaluation Actions
  const handleAddEvaluation = () => {
    if (evaluations.length >= 3) return;
    setEvaluations([
      ...evaluations,
      { id: crypto.randomUUID(), file: null, verdict: '' }
    ]);
  };

  const handleRemoveEvaluation = (id: string) => {
    setEvaluations(evaluations.filter(item => item.id !== id));
  };

  const handleFileChange = (id: string, file: File | null) => {
    setEvaluations(evaluations.map(item => item.id === id ? { ...item, file } : item));
  };

  const handleVerdictChange = (id: string, verdict: string) => {
    setEvaluations(evaluations.map(item => item.id === id ? { ...item, verdict } : item));
  };

  // Skip the evaluations stage completely
  const handleSkipEvaluations = () => {
    if (createdJob) {
      onJobCreated(createdJob);
    }
  };

  // Submit evaluation metrics and files 
  const handleSubmitEvaluations = async () => {
    if (!createdJob) return;
    
    // Filter out rows where no file has been picked yet
    const validEvaluations = evaluations.filter(item => item.file !== null);
    
    if (validEvaluations.length === 0) {
      // If they built structural rows but didn't actually attach documents, treat as a skip
      onJobCreated(createdJob);
      return;
    }

    setLoading(true);
    try {

      if (typeof apiService.addEvaluations === 'function') {
        await apiService.addEvaluations(createdJob.id, validEvaluations);
      } else {
        console.warn('apiService.addEvaluations endpoint is missing. Skipping mock attachment.');
      }

      onJobCreated(createdJob);
    } catch (error) {
      console.error('Error adding evaluations:', error);
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
        {/* Modal Header */}
        <div className="p-6 md:p-8 flex items-center justify-between border-b border-white/5">
          <div>
            <h2 className="text-2xl font-black text-white">
              {stage === 'form' ? 'Create New Job' : 'Add Initial Evaluations'}
            </h2>
            <p className="text-sm text-gray-500">
              {stage === 'form' 
                ? 'Define your requirements to start matching candidates' 
                : 'Upload up to 3 sample PDF files with optional verdicts to seed evaluations (Optional)'}
            </p>
          </div>
          <button 
            onClick={stage === 'form' ? onClose : handleSkipEvaluations}
            className="p-2 rounded-xl bg-white/5 text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* STAGE 1: Job Spec Setup Form */}
        {stage === 'form' && (
          <>
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
                        <option value="Select">Select</option>
                        <option value="Diploma">Diploma</option>
                        <option value="Bachelors">Bachelors</option>
                        <option value="Masters">Masters</option>
                        <option value="PhD">PhD</option>
                      </select>
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

            {/* Stage 1 Actions */}
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
                  <ArrowRight size={18} />
                )}
                {loading ? 'Creating...' : 'Create Job'}
              </button>
            </div>
          </>
        )}

        {/* STAGE 2: Add Evaluations Step */}
        {stage === 'evaluations' && (
          <>
            <div className="p-6 md:p-8 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-4">
                <AnimatePresence initial={false}>
                  {evaluations.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4 relative group"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-cyan-400 uppercase tracking-wider">
                          Evaluation Spec #{index + 1}
                        </span>
                        {evaluations.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveEvaluation(item.id)}
                            className="text-gray-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>

                    <div className="grid grid-cols-1 gap-4 items-start">
                      {/* Custom PDF File Input block */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-wider text-gray-500 ml-1">
                          PDF Document
                        </label>
                        <div className="relative h-12 flex items-center justify-center border border-dashed border-white/10 rounded-xl bg-white/5 hover:bg-white/10 transition-colors px-3 cursor-pointer">
                          <input
                            type="file"
                            accept="application/pdf"
                            onChange={(e) => handleFileChange(item.id, e.target.files?.[0] || null)}
                            className="absolute inset-0 opacity-0 w-full cursor-pointer z-10"
                          />
                          <div className="flex items-center gap-2 text-xs text-gray-400 pointer-events-none truncate max-w-full">
                            <Upload size={14} className="shrink-0 text-gray-500" />
                            <span className="truncate">
                              {item.file ? item.file.name : 'Choose PDF file'}
                            </span>
                          </div>
                        </div>
                      </div>

                    {/* Verdict Text input */}
                    <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-gray-500 ml-1">
                      Verdict Summary
                    </label>
                    <textarea
                      rows={3} // Adjust this number to increase or decrease the initial height block
                      value={item.verdict}
                      onChange={(e) => handleVerdictChange(item.id, e.target.value)}
                      placeholder="e.g. Strongly matched criteria due to solid leadership background."
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs text-white placeholder:text-gray-700 focus:border-cyan-500 focus:outline-none transition-all resize-none min-h-[5rem]"
                    />
                  </div>
                  </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Add More Option Button (Visible up to 3 pairs) */}
              {evaluations.length < 3 && (
                <button
                  type="button"
                  onClick={handleAddEvaluation}
                  className="w-full py-3 border border-dashed border-white/10 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-all uppercase tracking-wider"
                >
                  <Plus size={14} />
                  Add More Evaluations ({evaluations.length}/3)
                </button>
              )}
            </div>

            {/* Stage 2 Footer Actions */}
            <div className="p-6 md:p-8 border-t border-white/5 flex gap-4">
              <button 
                type="button"
                onClick={handleSkipEvaluations}
                disabled={loading}
                className="flex-1 py-4 px-6 rounded-2xl bg-white/5 text-gray-400 font-bold hover:bg-white/10 hover:text-white transition-all uppercase tracking-widest text-xs disabled:opacity-50"
              >
                Skip & Finish
              </button>
              <button 
                onClick={handleSubmitEvaluations}
                disabled={loading}
                className="flex-[2] py-4 px-6 rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-black hover:scale-[1.01] transition-all uppercase tracking-widest text-xs shadow-xl shadow-cyan-500/10 disabled:opacity-50 flex items-center justify-center gap-3 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Plus size={18} />
                )}
                {loading ? 'Saving Evaluations...' : 'Save & Dashboard'}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}