export type UserRole = 'admin' | 'user'

export interface Profile {
  id: string
  full_name: string
  role: UserRole
  avatar_url?: string
  created_at: string
}

export interface Client {
  id: string
  name: string
  industry?: string
  website?: string
  location?: string
  stage: 'prospect' | 'active' | 'inactive' | 'lost'
  notes?: string
  owner_id?: string
  created_at: string
  updated_at: string
  // joined
  owner?: Profile
  jobs?: Job[]
}

export interface Job {
  id: string
  client_id: string
  title: string
  location?: string
  headcount_min: number
  headcount_max: number
  salary_min?: number
  salary_max?: number
  currency: string
  description?: string
  requirements?: string
  stage: 'open' | 'on_hold' | 'closed' | 'filled'
  owner_id?: string
  created_at: string
  updated_at: string
  // joined
  client?: Client
  owner?: Profile
}

export interface Candidate {
  id: string
  reference: string
  full_name: string
  email?: string
  phone?: string
  location?: string
  current_title?: string
  current_company?: string
  linkedin_url?: string
  cv_url?: string
  notice_period?: string
  current_salary?: number
  expected_salary?: number
  currency: string
  skills?: string[]
  specialisms?: string[]
  notes?: string
  owner_id?: string
  created_at: string
  updated_at: string
  // joined
  owner?: Profile
}

export type PipelineStage =
  | 'sourced'
  | 'screened'
  | 'submitted'
  | 'client_interview'
  | 'offer'
  | 'placed'
  | 'rejected'

export interface PipelineEntry {
  id: string
  candidate_id: string
  job_id: string
  stage: PipelineStage
  notes?: string
  added_by?: string
  created_at: string
  updated_at: string
  // joined
  candidate?: Candidate
  job?: Job
}

export type ActivityType = 'call' | 'email' | 'interview' | 'meeting' | 'note' | 'placement'

export interface Activity {
  id: string
  type: ActivityType
  candidate_id?: string
  job_id?: string
  client_id?: string
  title: string
  notes?: string
  scheduled_at?: string
  completed_at?: string
  owner_id?: string
  created_at: string
  // joined
  candidate?: Candidate
  job?: Job
  owner?: Profile
}

export const PIPELINE_STAGES: { key: PipelineStage; label: string; color: string }[] = [
  { key: 'sourced',          label: 'Sourced',           color: '#6366f1' },
  { key: 'screened',         label: 'Screened',          color: '#8b5cf6' },
  { key: 'submitted',        label: 'Submitted',         color: '#f59e0b' },
  { key: 'client_interview', label: 'Client Interview',  color: '#3b82f6' },
  { key: 'offer',            label: 'Offer',             color: '#10b981' },
  { key: 'placed',           label: 'Placed',            color: '#22c55e' },
  { key: 'rejected',         label: 'Rejected',          color: '#ef4444' },
]

export const CLIENT_STAGES = ['prospect', 'active', 'inactive', 'lost'] as const
export const JOB_STAGES = ['open', 'on_hold', 'closed', 'filled'] as const
export const ACTIVITY_TYPES: ActivityType[] = ['call', 'email', 'interview', 'meeting', 'note', 'placement']
