export interface HardConstraints {
  educationLevel: string;
  languages: string;
  certification?: string;
  yearsOfExperience: string;
}

export interface Job {
  id: string;
  title: string;
  overview: string;
  expectedSkills: string;
  expectedExperience: string;
  candidateOverview: string;
  hardConstraints: HardConstraints;
  signals?: string;
  resumeCount: number;
  status: 'active' | 'archived';
  createdAt: number;
  userId: string;
  isRanking?: boolean;
}

export interface Resume {
  id: string;
  jobId: string;
  fileName: string;
  size: number;
  uploadedAt: number;
  ranking?: number;
  totalScore?: number;
  summary?: string;
  matchPercentage?: number;
  email?: string;
  phone?: string;
}
