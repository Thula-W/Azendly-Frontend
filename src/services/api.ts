import { Job, Resume } from '../types';

// Mock API Service using localStorage
const JOBS_KEY = 'azendly_jobs';
const RESUMES_KEY = 'azendly_resumes';
const CREDITS_KEY = 'azendly_credits';
const INITIAL_CREDITS = 500;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const apiService = {
  // Jobs
  async getJobs(userId: string): Promise<Job[]> {
    await delay(500);
    const jobs = localStorage.getItem(JOBS_KEY);
    return jobs ? JSON.parse(jobs).filter((j: Job) => j.userId === userId) : [];
  },

  async createJob(jobData: Omit<Job, 'id' | 'createdAt' | 'resumeCount'>): Promise<Job> {
    await delay(800);
    const jobs = JSON.parse(localStorage.getItem(JOBS_KEY) || '[]');
    const newJob: Job = {
      ...jobData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: Date.now(),
      resumeCount: 0,
      status: 'active'
    };
    jobs.push(newJob);
    localStorage.setItem(JOBS_KEY, JSON.stringify(jobs));
    return newJob;
  },

  async deleteJob(jobId: string): Promise<void> {
    await delay(500);
    let jobs = JSON.parse(localStorage.getItem(JOBS_KEY) || '[]');
    jobs = jobs.filter((j: Job) => j.id !== jobId);
    localStorage.setItem(JOBS_KEY, JSON.stringify(jobs));
    
    // Also delete resumes for this job
    let resumes = JSON.parse(localStorage.getItem(RESUMES_KEY) || '[]');
    resumes = resumes.filter((r: Resume) => r.jobId !== jobId);
    localStorage.setItem(RESUMES_KEY, JSON.stringify(resumes));
  },

  // Resumes
  async uploadResumes(jobId: string, files: File[]): Promise<Resume[]> {
    await delay(1500);
    const resumes = JSON.parse(localStorage.getItem(RESUMES_KEY) || '[]');
    const newResumes: Resume[] = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      jobId,
      fileName: file.name,
      size: file.size,
      uploadedAt: Date.now(),
      email: `${file.name.split('.')[0].toLowerCase().replace(/\s+/g, '.')}@example.com`,
      phone: `+1 (555) ${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`
    }));
    
    const updatedResumes = [...resumes, ...newResumes];
    localStorage.setItem(RESUMES_KEY, JSON.stringify(updatedResumes));
    
    // Update job resume count
    const jobs = JSON.parse(localStorage.getItem(JOBS_KEY) || '[]');
    const jobIndex = jobs.findIndex((j: Job) => j.id === jobId);
    if (jobIndex !== -1) {
      jobs[jobIndex].resumeCount += files.length;
      localStorage.setItem(JOBS_KEY, JSON.stringify(jobs));
    }

    // Deduct credits
    const currentCredits = parseInt(localStorage.getItem(CREDITS_KEY) || INITIAL_CREDITS.toString());
    localStorage.setItem(CREDITS_KEY, (currentCredits - files.length).toString());
    
    return newResumes;
  },

  async getCredits(): Promise<number> {
    await delay(300);
    const credits = localStorage.getItem(CREDITS_KEY);
    if (credits === null) {
      localStorage.setItem(CREDITS_KEY, INITIAL_CREDITS.toString());
      return INITIAL_CREDITS;
    }
    return parseInt(credits);
  },

  async getResumes(jobId: string): Promise<Resume[]> {
    await delay(500);
    const resumes = JSON.parse(localStorage.getItem(RESUMES_KEY) || '[]');
    return resumes.filter((r: Resume) => r.jobId === jobId);
  },

  async rankJob(jobId: string): Promise<void> {
    await delay(2000); // Simulate ranking process
    const jobs = JSON.parse(localStorage.getItem(JOBS_KEY) || '[]');
    const jobIndex = jobs.findIndex((j: Job) => j.id === jobId);
    if (jobIndex !== -1) {
      jobs[jobIndex].isRanking = true;
      localStorage.setItem(JOBS_KEY, JSON.stringify(jobs));
    }

    // Mock rankings for resumes
    const resumes = JSON.parse(localStorage.getItem(RESUMES_KEY) || '[]');
    resumes.forEach((r: Resume) => {
      if (r.jobId === jobId) {
        r.ranking = Math.floor(Math.random() * 10) + 1;
        r.totalScore = Math.floor(Math.random() * 40) + 60;
        r.matchPercentage = Math.floor(Math.random() * 30) + 70;
        r.summary = "Strong candidate with relevant experience in cloud architecture and team leadership.";
      }
    });
    localStorage.setItem(RESUMES_KEY, JSON.stringify(resumes));
  }
};
