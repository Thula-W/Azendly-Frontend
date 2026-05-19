import { Job, Resume } from '../types';

// ─── Config ──────────────────────────────────────────────────────────────────

const API_BASE =  '';

// Provide / replace this with however you obtain the Firebase ID token
async function getAuthToken(): Promise<string> {
  // e.g. from Firebase Auth:
  // const { getAuth } = await import('firebase/auth');
  // return (await getAuth().currentUser?.getIdToken()) ?? '';
  // throw new Error('getAuthToken() is not implemented');
  return 'eyJhbGciOiJFUzI1NiIsImtpZCI6IjI1ZmJkNmM2LTZhNWYtNDljZS05YzY2LTEwNGU2YzcxNjEzMSIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL3BjbHhpeGR0ZGZlbHFwaWtkYXJ4LnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiI2NjY4NDJkMC1iMzcxLTQ3MWEtYWM0Mi04NDA2ODdiYjYwODMiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzc5MTc0ODAwLCJpYXQiOjE3NzkxNzEyMDAsImVtYWlsIjoidGVzdEBlbWFpbC5jb20iLCJwaG9uZSI6IiIsImFwcF9tZXRhZGF0YSI6eyJwcm92aWRlciI6ImVtYWlsIiwicHJvdmlkZXJzIjpbImVtYWlsIl19LCJ1c2VyX21ldGFkYXRhIjp7ImVtYWlsX3ZlcmlmaWVkIjp0cnVlfSwicm9sZSI6ImF1dGhlbnRpY2F0ZWQiLCJhYWwiOiJhYWwxIiwiYW1yIjpbeyJtZXRob2QiOiJwYXNzd29yZCIsInRpbWVzdGFtcCI6MTc3OTE3MTIwMH1dLCJzZXNzaW9uX2lkIjoiZDUwNmQ2YWMtNmFjYS00NjE1LTg5NDMtYTAwZjExNTAzYjllIiwiaXNfYW5vbnltb3VzIjpmYWxzZX0.NVNs6Oxn7MJzrBz6C9l5JSf5DgRUHi1X51J9auwbDMcGyzEKZeQPaVGX6Xxc1T81jrRPrhNhc2pjXZsZ1Z08Cg'
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

// ─── Mock helpers (for endpoints not yet implemented in backend) ──────────────

const JOBS_KEY    = 'azendly_jobs';
const RESUMES_KEY = 'azendly_resumes';
const CREDITS_KEY = 'azendly_credits';
const INITIAL_CREDITS = 500;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ─── API Service ─────────────────────────────────────────────────────────────

export const apiService = {

  // ── Users ─────────────────────────────────────────────────────────────────

  /**
   * GET /api/users
   * Returns the current authenticated user (and credits).
   */
  async getMe() {
    return apiFetch<{ id: string; email: string; credits: number; [key: string]: unknown }>(
      '/api/users',
      { headers: await authHeaders() },
    );
  },

  // ── Credits ───────────────────────────────────────────────────────────────

  /**
   * Fetches credits from the real /api/users endpoint.
   * Falls back to localStorage while the backend is being wired up.
   */
  async getCredits(): Promise<number> {
    try {
      const user = await apiService.getMe();
      return user.credits ?? 0;
    } catch {
      // ── MOCK FALLBACK ──
      await delay(300);
      const credits = localStorage.getItem(CREDITS_KEY);
      if (credits === null) {
        localStorage.setItem(CREDITS_KEY, INITIAL_CREDITS.toString());
        return INITIAL_CREDITS;
      }
      return parseInt(credits);
    }
  },

  // ── Jobs ──────────────────────────────────────────────────────────────────

  async getJobs(userId: string): Promise<any[]> {
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

  async deleteJob(jobId: string): Promise<void> {
    await apiFetch<void>('/api/jobs/delete-job', {
      method: 'POST',
      headers: await authHeaders(),
      body: JSON.stringify({ jobId }),
    });
  },

  /**
   * POST /api/jobs/rerank-job
   * Body: { jobId }
   * Middleware: authenticate, checkJobStatus
   */
  async rankJob(jobId: string): Promise<void> {
    await apiFetch<void>('/api/jobs/rerank-job', {
      method: 'POST',
      headers: await authHeaders(),
      body: JSON.stringify({ jobId }),
    });
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

  /**
   * Two-step upload flow:
   *
   * Step 1 — POST /api/resumes/upload-intent
   *   Body: { jobId, files: [{ name, size, type }, ...] }
   *   Returns: presigned URLs or upload tokens for each file.
   *
   * Step 2 — Upload each file directly (e.g. to S3 / GCS) using the URLs
   *   returned by the intent endpoint.
   *
   * Step 3 — POST /api/resumes/upload-confirm
   *   Body: { jobId, resumes: [...confirmedFileRefs], triggerScoring?: boolean }
   *   Returns: Resume[]
   */
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
      uploadIntents: Array<{ signedUrl: string; resumeId: string; storagePath: string , expiresIn: number }>,
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
};