import { Job, Resume } from '../types';
import { supabase } from '../lib/supabase';
import { FeedbackData } from '../components/Dashboard/FeedbackModal';

const API_BASE =  "https://api.azendly.net";

async function getAuthToken(): Promise<string> {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session) throw new Error('Not authenticated');
  return session.access_token; // always fresh — Supabase auto-refreshes if expired
}

async function authHeaders(): Promise<HeadersInit> {
  const token = await getAuthToken();
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, options);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error ?? body?.message ?? `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}


const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ─── API Service ─────────────────────────────────────────────────────────────

export const apiService = {

  async getCredits(userId?: string ): Promise<any> {
    const res = await apiFetch<any[]>('/api/users/credits', {
      method: 'POST',
      headers: await authHeaders(),
      body: JSON.stringify({ userId }),
    });
    return res;
  },

  async addFeedback( feedbackData: FeedbackData, userId?: string ): Promise<any> {
    const res = await apiFetch<any[]>('/api/users/feedback', {
      method: 'POST',
      headers: await authHeaders(),
      body: JSON.stringify({ 
        feedback : feedbackData,
        userId : userId,
       }),
    });
    return res;
  },


  // ── Jobs ──────────────────────────────────────────────────────────────────

  async getJobs(): Promise<any[]> {
    const res = await apiFetch<any[]>('/api/users/jobs', {
      method: 'GET',
      headers: await authHeaders(),
    });
    return res;
  },

  async createJob(
    jobData: Omit<Job, 'id' | 'createdAt' | 'resumeCount'>,
  ): Promise<Job> {
    console.log('Creating job with data:', jobData);
    const { title, overview, skills, bio, experience, constraints, signals } = jobData as any;

    return apiFetch<Job>('/api/jobs', {
      method: 'POST',
      headers: await authHeaders(),
      body: JSON.stringify({ title, overview, skills, bio, experience, constraints, signals }),
    });
  },

  async addEvaluations(
    jobId: string,
    evaluations: Array<{ file: File | null; verdict: string }>
  ): Promise<{ success: boolean }> {
    console.log(`Adding evaluations for job ${jobId}:`, evaluations);

    const formData = new FormData();

    // Filter out any empty pairs just in case, then append using the index notation your backend expects
    evaluations
      .filter((item) => item.file !== null && item.verdict.trim() !== '')
      .forEach((item, index) => {
        if (item.file) {
          formData.append(`cv_${index}`, item.file);
          formData.append(`verdict_${index}`, item.verdict);
        }
      });


    const token = await getAuthToken();
    const baseHeaders: HeadersInit = {
      Authorization: `Bearer ${token}`,
    };

    return apiFetch<{ success: boolean }>(`/api/jobs/${jobId}/evals`, {
      method: 'POST',
      headers: baseHeaders,
      body: formData, // Passing the FormData object directly instead of JSON stringifying
    });
  },

  async deleteJob(jobId: string): Promise<void> {
    await apiFetch<void>('/api/jobs/delete-job', {
      method: 'POST',
      headers: await authHeaders(),
      body: JSON.stringify({ jobId }),
    });
  },

  async rankJob(jobId: string): Promise<void> {
    await apiFetch<void>('/api/jobs/rerank-job', {
      method: 'POST',
      headers: await authHeaders(),
      body: JSON.stringify({ jobId }),
    });
  },

  async checkJobStatus(jobId: string): Promise<void> {
    const res = await apiFetch<void>('/api/jobs/check-status', {
      method: 'POST',
      headers: await authHeaders(),
      body: JSON.stringify({ jobId }),
    });
    return res;
  },

  // ── Resumes ───────────────────────────────────────────────────────────────
  async getRankings(jobId: string): Promise<any[]> {
    const res= await apiFetch<any[]>('/api/jobs/rankings', {
      method: 'POST',
      headers: await authHeaders(),
      body: JSON.stringify({ jobId }),
    });
    return res;
  },

  async uploadResumes(
    jobId: string,
    files: File[],
    triggerScoring = false,
  ): Promise<Resume[]> {
    const headers = await authHeaders();

    // 1. Signal intent & get upload destinations
    const intentPayload = {
      jobId,
      files: files.map(f => ({ name: f.name, size: f.size, type: f.type })),
    };

    const intentResponse = await apiFetch<{
      uploadIntents: Array<{ signedUrl: string; resumeId: string , expiresIn: number }>,
      constraints: any;
    }>('/api/resumes/upload-intent', {
      method: 'POST',
      headers,
      body: JSON.stringify(intentPayload),
    });

    console.log(intentResponse.uploadIntents)
    // 2. Upload files directly to storage using the presigned URLs
    await Promise.all(
      intentResponse.uploadIntents.map(({ signedUrl }, idx) =>
        fetch(signedUrl, {
          method: 'PUT',
          body: files[idx],
          headers: { 'Content-Type': files[idx].type },
        }),
      ),
    );

    // 3. Confirm uploads & (optionally) trigger scoring
    const confirmedResumes = intentResponse.uploadIntents.map(({ resumeId }) => ({
      resumeId: resumeId,
    }));

    return apiFetch<Resume[]>('/api/resumes/upload-confirm', {
      method: 'POST',
      headers,
      body: JSON.stringify({ jobId, resumes: confirmedResumes, triggerScoring }),
    });
  },

  async getResumeUrl(resumeId: string , action: 'view' | 'download'): Promise<any> {
    const res = await apiFetch<{ url: string }>(`/api/resumes/${resumeId}/url?action=${action}`, {
      method: 'GET',
      headers: await authHeaders(),
    });
    return res.url;
  },

  async downloadBulkResumes(resumeIds: string[], jobId : string): Promise<Blob> { {
    const response = await fetch('/api/resumes/download-bulk', {
      method: 'POST',
      headers: {
        'Accept': 'application/zip, application/octet-stream',
        ...(await authHeaders())
      },
      body: JSON.stringify({ resumeIds, jobId }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to compile bulk zip archive (Status: ${response.status})`);
    }

    // Unpacks the incoming network stream data as a raw binary Blob object
    return response.blob(); 
  }}
};