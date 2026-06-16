import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSearchParams } from 'react-router-dom';
import { 
  Plus, 
  Upload, 
  BarChart3, 
  Trash2, 
  Briefcase, 
  Eye,
  FileText,
  ThumbsUp 
} from 'lucide-react';
import { Job } from '../../types';
import { apiService } from '../../services/api';
import AddJobModal from './AddJobModal';
import UploadResumes from './UploadResumes';
import JobDetailView from './JobDetailView';
import BillingView from './BillingView';
import { supabase } from '../../lib/supabase';
import FeedbackModal, { FeedbackData } from './FeedbackModal';

interface DashboardProps {
  onModalToggle?: (isOpen: boolean) => void;
}

export default function Dashboard({ onModalToggle }: DashboardProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState<number | null>(null);
  const [ranks, setRanks] = useState<number | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'upload' | 'view'>('list');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [rankingJobIds, setRankingJobIds] = useState<Set<string>>(new Set());
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };

    fetchUserData();
    fetchJobs();
  }, []);

  useEffect(() => {
    const view = searchParams.get('view');
    if (view === 'billing') {
      setViewMode('list'); 
    }
  }, [searchParams]);

  useEffect(() => {
    onModalToggle?.(isAddModalOpen || !!deleteConfirm);
  }, [isAddModalOpen, deleteConfirm, onModalToggle]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const [data, creditsData] = await Promise.all([
        apiService.getJobs(),
        apiService.getCredits(userId ||'')
      ]);
      setJobs(data);
      setCredits(creditsData.resumesRemaining);
      setRanks(creditsData.rankingsRemaining);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

;

  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    try {
      await apiService.deleteJob(id);
      setJobs(prevJobs => (Array.isArray(prevJobs) ? prevJobs.filter(j => j.id !== id) : []));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting job:', error);
    } finally {
      setIsDeleting(null);
    }
  };

  // const handleRank = async (jobId: string) => {
  //   setRankingJobIds(prev => new Set(prev).add(jobId));
  //   try {
  //     await apiService.rankJob(jobId);
  //     await fetchJobs();
  //     // After ranking, we could automatically switch to the view mode for that job , uncomment this ot achieve it
  //     // setSelectedJobId(jobId);
  //     // setViewMode('view');
  //   } catch (error) {
  //     console.error('Ranking failed:', error);
  //   }
  //   finally{
  //     setRankingJobIds(prev => {
  //       const newSet = new Set(prev);
  //       newSet.delete(jobId);
  //       return newSet;
  //     });
  //   }
  // };

  const handleRank = async (jobId: string) => {
    // Guard: don't even attempt if we already know we're out of ranking credits
    if (ranks !== null && ranks <= 0) return;

    setRankingJobIds(prev => new Set(prev).add(jobId));

    // Optimistic decrement, applied immediately
    adjustCredits(0, -1);

    try {
      await apiService.rankJob(jobId);
      await fetchJobs();
      const creditsData =  await apiService.getCredits(userId ?? undefined);
      // response is the absolute truth — overwrite whatever optimistic value is there now
      syncCredits(creditsData.resumesRemaining , creditsData.rankingsRemaining ?? null);
    } catch (error) {
      console.error('Ranking failed:', error);
      // Roll back the optimistic decrement since the request failed
      adjustCredits(0, +1);
    } finally {
      setRankingJobIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(jobId);
        return newSet;
      });
    }
  };

  const handleJobCreated = (newJob: Job) => {
    setJobs([newJob, ...jobs]);
    setIsAddModalOpen(false);
  };

  // Apply an immediate, optimistic delta to the credit counters.
  // Using functional updates so concurrent clicks on different jobs don't clobber each other.
  const adjustCredits = (resumeDelta: number, rankingDelta: number) => {
    if (resumeDelta !== 0) {
      setCredits(prev => (prev !== null ? Math.max(0, prev + resumeDelta) : prev));
    }
    if (rankingDelta !== 0) {
      setRanks(prev => (prev !== null ? Math.max(0, prev + rankingDelta) : prev));
    }
  };

  // Overwrite local state with the absolute truth returned by the backend.
  const syncCredits = (resumesRemaining?: number, rankingsRemaining?: number) => {
    if (typeof resumesRemaining === 'number') setCredits(resumesRemaining);
    if (typeof rankingsRemaining === 'number') setRanks(rankingsRemaining);
  };

  // Feedback modal state (closed by default)
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  // Handler for feedback submissions
  const handleFeedbackSubmit = async (data: FeedbackData) => {
    try {
      await apiService.addFeedback(data, userId ?? undefined);
      setIsFeedbackOpen(false);
    } catch (err) {
      console.error('Failed sending feedback profile', err);
    }
  };

  // Include feedback modal state in the global modal toggle tracking
  useEffect(() => {
    onModalToggle?.(isAddModalOpen || !!deleteConfirm || isFeedbackOpen);
  }, [isAddModalOpen, deleteConfirm, isFeedbackOpen, onModalToggle]);

  const selectedJob = jobs.find(j => j.id === selectedJobId) || null;

  if (viewMode === 'upload' && selectedJob) {
    return (
      <UploadResumes 
        job={selectedJob} 
        onBack={() => setViewMode('list')} 
        onComplete={() => {
          fetchJobs();
          setViewMode('list');
        }}
        userId={userId}
        resumesRemaining={credits}
        rankingsRemaining={ranks}
        onAdjustCredits={adjustCredits}
        onSyncCredits={syncCredits}
      />
    );
  }

  if (viewMode === 'view' && selectedJob) {
    return (
      <JobDetailView 
        job={selectedJob} 
        onBack={() => setViewMode('list')} 
      />
    );
  }

  if (searchParams.get('view') === 'billing') {
    return <BillingView onBack={() => setSearchParams({})} />;
  }

  return (
    <div className="min-h-screen bg-[#0D0D0F] pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-col md:flex-row md:items-center  gap-4 mb-2">
              <h1 className="text-3xl md:text-4xl font-black text-white">Dashboard</h1>

              <div className="flex items-center gap-2 flex-shrink-0">
                {(credits !== null || ranks !== null) && (
                  <div className="flex items-center bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-full px-1 py-1 shadow-inner">
                    <span className=" pl-3 pr-1 text-[11px] font-black text-white uppercase tracking-wider ">
                      Remaining:
                    </span>
                    {/* Credits Quota */}
                    {credits !== null && (
                      <div className="flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/10 rounded-full">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                        <span className="text-[10px] md:text-xs font-black text-cyan-200 uppercase tracking-wider whitespace-nowrap">
                          {credits} Resumes
                        </span>
                      </div>
                    )}

                    {/* Subtle Visual Divider */}
                    {credits !== null && ranks !== null && (
                      <div className="h-4 w-[1px] bg-zinc-800 mx-1.5" />
                    )}

                    {/* Rankings Quota */}
                    {ranks !== null && (
                      <div className="flex items-center gap-2 px-3 py-1 bg-violet-500/10 border border-violet-500/10 rounded-full">
                        <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                        <span className="text-[10px] md:text-xs font-black text-violet-200 uppercase tracking-wider whitespace-nowrap">
                          {ranks} Rankings
                        </span>
                      </div>
                    )}
                    
                  </div>
                )}
              </div>
            </div>
            <p className="text-gray-400 text-sm md:text-base">Manage your active job postings and candidate rankings</p>
          </div>
          <div className="w-full lg:w-auto">
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="w-full lg:w-auto px-4 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl text-white font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-all shadow-xl shadow-cyan-500/10"
            >
              <Plus size={20} />
              Add New Job
            </button>
            
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40">
            <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin shadow-lg shadow-cyan-500/10" />
            <p className="text-gray-400 text-sm mt-4 font-medium tracking-wide">Loading jobs...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 px-6 rounded-[2.5rem] bg-white/5 border border-dashed border-white/10">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6">
              <Briefcase className="text-gray-500" size={32} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 text-center">No active jobs yet</h3>
            <p className="text-gray-400 text-center max-w-sm mb-8">
              Post your first job to start ranking candidates with AI-powered insights.
            </p>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="text-cyan-400 font-bold hover:underline"
            >
              Click here to get started
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.sort((a, b) => {
              const aRanked = a.status === 'RANKED' ? 1 : 0;
              const bRanked = b.status === 'RANKED' ? 1 : 0;
              return aRanked - bRanked; // 0 (unranked) comes before 1 (ranked)
            }).map((job) => {
              const isRanked = job.status === 'RANKED';
              const isCurrentlyRanking = rankingJobIds.has(job.id);
              const insufficientRankings = !isRanked && ranks !== null && ranks <= 0;

              return (
                <motion.div
                  layout
                  key={job.id}
                  className="p-1 rounded-[2.5rem] bg-gradient-to-br from-white/10 to-white/5 hover:from-purple-500/20 hover:to-cyan-500/20 transition-all group border border-white/10"
                >
                  <div className="bg-[#0D0D0F] rounded-[calc(2.5rem-4px)] p-6 h-full flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 rounded-2xl bg-white/5 text-cyan-400">
                        <Briefcase size={20} />
                      </div>
                      <button 
                        onClick={() => setDeleteConfirm(job.id)}
                        className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">{job.title}</h3>
                    <div className="text-gray-400 text-sm mb-6 line-clamp-2 h-10 flex-grow">
                      {job.overview}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
                        <div className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Resumes</div>
                        <div className="text-xl font-black text-white flex items-center gap-2">
                          <FileText size={16} className="text-purple-400" />
                          {job.totalResumes}
                        </div>
                      </div>
                      <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
                        <div className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Status</div>
                        <div className="text-sm font-bold text-cyan-400 flex items-center gap-1.5 leading-none">
                          <div className={`w-1.5 h-1.5 rounded-full ${isRanked ? 'bg-cyan-400' : 'bg-green-400 animate-pulse'}`} />
                          {isRanked ? 'Ranked' : 'Active'}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      {!isRanked && (
                        <button 
                          onClick={() => {
                            setSelectedJobId(job.id);
                            setViewMode('upload');
                          }}
                          disabled={isCurrentlyRanking}
                          className="flex-1 py-3 px-4 rounded-xl bg-green-400 border border-white/10 text-white text-xs font-bold flex items-center justify-center gap-2 hover:bg-green-400 shadow-green-500/20 transition-all uppercase tracking-widest"
                        >
                          <Upload size={14} />
                          Upload
                        </button>
                      )}
                      <button 
                        onClick={() => {
                          if (isRanked) {
                            setSelectedJobId(job.id);
                            setViewMode('view');
                          } else if (job.totalResumes > 0) {
                            handleRank(job.id);
                          }
                        }}
                        // Disable button if it's currently processing OR if there are no resumes
                        disabled={isCurrentlyRanking || (!isRanked && (job.totalResumes ?? 0) === 0) || insufficientRankings}
                        className={`flex-1 py-3 px-4 rounded-xl text-black text-xs font-black flex items-center justify-center gap-2 transition-all uppercase tracking-widest shadow-lg ${
                          isCurrentlyRanking || isRanked || (job.totalResumes ?? 0) > 0 
                            ? 'bg-cyan-500 hover:bg-cyan-400 shadow-cyan-500/20' 
                            : 'bg-white/10 text-gray-500 cursor-not-allowed shadow-none'
                        } disabled:opacity-80`}
                      >
                        {isCurrentlyRanking ? (
                          <>
                            {/* Spinner layout element */}
                            <div className="w-3.5 h-3.5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                            <span>Ranking...</span>
                          </>
                        ) : (
                          <>
                            {isRanked ? <Eye size={14} /> : <BarChart3 size={14} />}
                            {isRanked ? 'View Results' : 'Rank'}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Fixed feedback button */}
      <div className="fixed bottom-8 right-6 z-50">
        <button
          onClick={() => setIsFeedbackOpen(true)}
          className="w-full lg:w-auto px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl text-white font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-all shadow-xl shadow-cyan-500/10"
            
        >
          <ThumbsUp size={16} />
          Give Feedback
        </button>
      </div>

      <AnimatePresence>
        {isAddModalOpen && (
          <AddJobModal 
            isOpen={isAddModalOpen} 
            onClose={() => setIsAddModalOpen(false)} 
            onJobCreated={handleJobCreated}
            userId={userId}
          />
        )}

        {deleteConfirm && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirm(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm p-8 rounded-[2rem] bg-[#0D0D0F] border border-white/10 shadow-2xl"
            >
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-6">
                  <Trash2 size={32} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Delete Job Posting?</h3>
                <p className="text-gray-400 mb-8">
                  This will permanently remove the job and all associated candidate rankings. This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setDeleteConfirm(null)}
                    className="flex-1 py-3 rounded-xl bg-white/5 text-white font-bold hover:bg-white/10 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
                    disabled={!!isDeleting}
                    className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-all flex items-center justify-center gap-2 disabled:bg-red-500/50 disabled:cursor-not-allowed"
                  >
                    {isDeleting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        <span>Deleting...</span>
                      </>
                    ) : (
                      <span>Yes, Delete</span>
                    )}
                  </button>
                  {/* <button 
                    onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
                    className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-all"
                  >
                    Yes, Delete
                  </button> */}
                </div>
              </div>
            </motion.div>
          </div>
        )}
        {isFeedbackOpen && (
          <FeedbackModal
            isOpen={isFeedbackOpen}
            onClose={() => setIsFeedbackOpen(false)}
            onSubmit={handleFeedbackSubmit}
          />
        )}
      </AnimatePresence>
    </div>
  );
}