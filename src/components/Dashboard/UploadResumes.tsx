import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Upload, 
  FileText, 
  X, 
  CheckCircle2, 
  FileUp,
  BarChart3,
  Loader2
} from 'lucide-react';
import { Job, Resume } from '../../types';
import { apiService } from '../../services/api';

interface UploadResumesProps {
  job: Job;
  onBack: () => void;
  onComplete: () => void;
  userId: string | null;
  resumesRemaining: number | null;
  rankingsRemaining: number | null;
  onAdjustCredits: (resumeDelta: number, rankingDelta: number) => void;
  onSyncCredits: (resumesRemaining?: number, rankingsRemaining?: number) => void;
}

export default function UploadResumes({ job, onBack, onComplete, userId, resumesRemaining, rankingsRemaining, onAdjustCredits, onSyncCredits }: UploadResumesProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'ranking' | 'done'>('idle');

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setIsDragging(true);
    else setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      const pdfFiles = Array.from(e.dataTransfer.files).filter((f) => (f as File).type === 'application/pdf') as File[];
      setFiles(prev => [...prev, ...pdfFiles]);
    }
  }, []);

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  // const handleUpload = async (andRank = false) => {
  //   if (files.length === 0) return;
    
  //   setLoading(true);
  //   setUploadStatus(andRank ? 'ranking' : 'uploading');
    
  //   try {
  //     await apiService.uploadResumes(job.id, files);
  //     if (andRank) {
  //       await apiService.rankJob(job.id);
  //     }
  //     setUploadStatus('done');
  //     setTimeout(onComplete, 1500);
  //   } catch (error) {
  //     console.error('Upload failed:', error);
  //     setUploadStatus('idle');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

const handleUpload = async (andRank = false) => {
  if (files.length === 0) return;

  // Guards — should be unreachable since buttons are disabled, but double-check
  if (resumesRemaining !== null && resumesRemaining < files.length) return;
  if (andRank && rankingsRemaining !== null && rankingsRemaining <= 0) return;

  setLoading(true);
  setUploadStatus(andRank ? 'ranking' : 'uploading');

  // Optimistic decrement, applied immediately and atomically
  onAdjustCredits(-files.length, andRank ? -1 : 0);

  try {
    await apiService.uploadResumes(job.id, files);

    if (andRank) {
      await new Promise((resolve) => setTimeout(resolve, 1000 * files.length)); // Artificial delay to simulate processing time
      await apiService.rankJob(job.id);
    }

    const creditsData =  await apiService.getCredits(userId ?? undefined);

    // finalResponse is the absolute truth — overwrite optimistic values
    onSyncCredits(creditsData.resumesRemaining, creditsData.rankingsRemaining);

    setUploadStatus('done');
    setTimeout(onComplete, 1500);
  } catch (error) {
    console.error('Upload failed:', error);
    // Roll back optimistic decrement
    onAdjustCredits(files.length, andRank ? 1 : 0);
    setUploadStatus('idle');
  } finally {
    setLoading(false);
  }
};

const insufficientResumes = resumesRemaining !== null && resumesRemaining < files.length;
const insufficientRankings = rankingsRemaining !== null && rankingsRemaining <= 0;

  return (
    <div className="min-h-screen bg-[#0D0D0F] pt-24 pb-12 px-6">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </button>

        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-black text-white">Upload Resumes</h1>
            <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-cyan-400">
              {job.title}
            </span>
          </div>
          <p className="text-gray-400">Select candidate PDFs to start ranking. You can bulk upload multiple resumes at once.</p>
        </div>

        <div className="space-y-8">
          {/* Dropzone */}
          <div 
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`
              relative group cursor-pointer
              p-12 rounded-[2.5rem] border-2 border-dashed transition-all
              flex flex-col items-center justify-center text-center
              ${isDragging ? 'border-cyan-500 bg-cyan-500/5' : 'border-white/10 bg-white/5 hover:bg-white/10'}
              ${uploadStatus !== 'idle' ? 'pointer-events-none opacity-50' : ''}
            `}
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <input 
              id="file-input"
              type="file" 
              multiple 
              accept=".pdf"
              className="hidden"
              onChange={(e) => {
                if (e.target.files) {
                  const pdfFiles = Array.from(e.target.files).filter((f) => (f as File).type === 'application/pdf') as File[];
                  setFiles(prev => [...prev, ...pdfFiles]);
                }
              }}
            />
            
            <div className={`
              w-20 h-20 rounded-3xl mb-6 flex items-center justify-center transition-transform
              ${isDragging ? 'scale-110 bg-cyan-500 text-black' : 'bg-white/5 text-gray-400 group-hover:scale-105'}
            `}>
              <FileUp size={40} />
            </div>
            
            <h3 className="text-xl font-bold text-white mb-2">
              {isDragging ? 'Drop those PDFs!' : 'Drag and drop PDFs here'}
            </h3>
            <p className="text-gray-500 max-w-xs mx-auto">
              or click to browse your computer. Supports bulk uploads of candidate resumes.
            </p>
          </div>

          {/* File List */}
          <AnimatePresence>
            {files.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between px-2">
                  <h4 className="text-xs font-black uppercase tracking-widest text-gray-500">
                    Selected Files ({files.length})
                  </h4>
                  <button 
                    onClick={() => setFiles([])}
                    className="text-[10px] font-black uppercase tracking-widest text-red-400 hover:underline"
                  >
                    Clear All
                  </button>
                </div>

                <div className="grid gap-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                  {files.map((file, i) => (
                    <motion.div 
                      key={`${file.name}-${i}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 group"
                    >
                      <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
                        <FileText size={18} />
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="text-sm font-bold text-white truncate">{file.name}</div>
                        <div className="text-[10px] text-gray-500 uppercase tracking-widest font-black">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </div>
                      </div>
                      <button 
                        onClick={() => removeFile(i)}
                        className="p-2 text-gray-600 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                      >
                        <X size={16} />
                      </button>
                    </motion.div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 pt-8 border-t border-white/5">
          
                  <button 
                    onClick={() => handleUpload(false)}
                    disabled={loading || insufficientResumes}
                    className="py-4 px-6 rounded-2xl bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {uploadStatus === 'uploading' ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      <Upload size={18} />
                    )}
                    {uploadStatus === 'uploading' ? 'Uploading...' : 'Upload only'}
                  </button>
                  <button 
                    onClick={() => handleUpload(true)}
                    disabled={loading || insufficientResumes || insufficientRankings }
                    className="py-4 px-6 rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-black uppercase tracking-widest text-xs hover:scale-[1.01] transition-all flex items-center justify-center gap-3 shadow-xl shadow-cyan-500/10 disabled:opacity-50"
                  >
                    {uploadStatus === 'ranking' ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      <BarChart3 size={18} />
                    )}
                    {uploadStatus === 'ranking' ? 'Ranking AI...' : 'Upload and Rank'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success State Overlay */}
          <AnimatePresence>
            {uploadStatus === 'done' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[130] bg-[#0D0D0F] flex flex-col items-center justify-center text-center p-6"
              >
                <div className="w-24 h-24 rounded-[2rem] bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-8">
                  <CheckCircle2 size={48} />
                </div>
                <h2 className="text-3xl font-black text-white mb-2">Upload Complete!</h2>
                <p className="text-gray-400 max-w-sm">
                  Candidate resumes have been successfully processed and ranked for {job.title}.
                </p>
                <div className="mt-8 flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce [animation-delay:0.4s]" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
