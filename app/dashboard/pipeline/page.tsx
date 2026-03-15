'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PIPELINE_STAGES, type PipelineStage, type PipelineEntry, type Job } from '@/lib/types'
import Link from 'next/link'
import { ChevronDown, Plus } from 'lucide-react'

export default function PipelinePage() {
  const supabase = createClient()
  const [jobs, setJobs] = useState<Job[]>([])
  const [selectedJob, setSelectedJob] = useState<string>('')
  const [pipeline, setPipeline] = useState<PipelineEntry[]>([])
  const [candidates, setCandidates] = useState<any[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [addCandidateId, setAddCandidateId] = useState('')
  const [addStage, setAddStage] = useState<PipelineStage>('sourced')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase.from('jobs')
      .select('*, client:clients(name)')
      .eq('stage', 'open')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) { setJobs(data as any); if (data.length > 0) setSelectedJob(data[0].id) }
      })
    supabase.from('candidates').select('id, full_name').order('full_name')
      .then(({ data }) => { if (data) setCandidates(data) })
  }, [])

  useEffect(() => {
    if (!selectedJob) return
    supabase.from('pipeline')
      .select('*, candidate:candidates(id, full_name, current_title, current_company)')
      .eq('job_id', selectedJob)
      .then(({ data }) => { if (data) setPipeline(data as any) })
  }, [selectedJob])

  async function updateStage(entryId: string, newStage: PipelineStage) {
    await supabase.from('pipeline').update({ stage: newStage }).eq('id', entryId)
    setPipeline(prev => prev.map(p => p.id === entryId ? { ...p, stage: newStage } : p))
  }

  async function addToJob() {
    if (!addCandidateId || !selectedJob) return
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase.from('pipeline').insert({
      candidate_id: addCandidateId, job_id: selectedJob,
      stage: addStage, added_by: user?.id
    }).select('*, candidate:candidates(id, full_name, current_title, current_company)').single()
    if (data) {
      setPipeline(prev => [...prev, data as any])
      setShowAdd(false); setAddCandidateId(''); setAddStage('sourced')
    }
    setLoading(false)
  }

  async function removeFromPipeline(entryId: string) {
    if (!confirm('Remove this candidate from the pipeline?')) return
    await supabase.from('pipeline').delete().eq('id', entryId)
    setPipeline(prev => prev.filter(p => p.id !== entryId))
  }

  const byStage = (stage: PipelineStage) => pipeline.filter(p => p.stage === stage)
  const selectedJobData = jobs.find(j => j.id === selectedJob)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em' }}>Pipeline</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 3 }}>Manage candidates through the hiring funnel</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {/* Job selector */}
          <div style={{ position: 'relative' }}>
            <select
              className="input"
              value={selectedJob}
              onChange={e => setSelectedJob(e.target.value)}
              style={{ paddingRight: 32, minWidth: 220 }}>
              <option value="">Select a job…</option>
              {jobs.map(j => (
                <option key={j.id} value={j.id}>{j.title} — {(j as any).client?.name}</option>
              ))}
            </select>
          </div>
          <button className="btn-primary" onClick={() => setShowAdd(true)} disabled={!selectedJob}>
            <Plus size={14} /> Add Candidate
          </button>
        </div>
      </div>

      {!selectedJob ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 14 }}>Select a job to view its pipeline</div>
          <Link href="/dashboard/jobs/new" style={{ textDecoration: 'none' }}>
            <button className="btn-ghost" style={{ marginTop: 16 }}><Plus size={13} /> Create a job first</button>
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 12, alignItems: 'flex-start' }}>
          {PIPELINE_STAGES.filter(s => s.key !== 'rejected').map(({ key, label, color }) => {
            const cards = byStage(key)
            return (
              <div key={key} style={{ flexShrink: 0, width: 220 }}>
                {/* Column header */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  marginBottom: 10, padding: '0 4px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{label}</span>
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 600, color,
                    background: `${color}20`, borderRadius: 10, padding: '1px 7px',
                  }}>{cards.length}</span>
                </div>

                {/* Drop zone */}
                <div className="pipeline-col" style={{ padding: 8, minHeight: 120 }}>
                  {cards.map(entry => (
                    <div key={entry.id} style={{
                      background: 'var(--bg-3)', border: '1px solid var(--border)',
                      borderRadius: 8, padding: 12, marginBottom: 8,
                      cursor: 'default',
                    }}>
                      <Link href={`/dashboard/candidates/${entry.candidate_id}`} style={{ textDecoration: 'none' }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 2 }}>
                          {(entry.candidate as any)?.full_name}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10 }}>
                          {(entry.candidate as any)?.current_title}
                        </div>
                      </Link>

                      {/* Move stage buttons */}
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        <select
                          value={entry.stage}
                          onChange={e => updateStage(entry.id, e.target.value as PipelineStage)}
                          style={{
                            background: 'var(--bg-4)', border: '1px solid var(--border)',
                            borderRadius: 6, color: 'var(--text-secondary)',
                            fontSize: 11, padding: '4px 6px', cursor: 'pointer',
                            flex: 1,
                          }}>
                          {PIPELINE_STAGES.map(s => (
                            <option key={s.key} value={s.key}>{s.label}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => removeFromPipeline(entry.id)}
                          style={{
                            background: 'transparent', border: '1px solid var(--border)',
                            borderRadius: 6, color: 'var(--text-muted)', fontSize: 11,
                            padding: '4px 8px', cursor: 'pointer',
                          }}>✕</button>
                      </div>
                    </div>
                  ))}
                  {cards.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)', fontSize: 12 }}>
                      Empty
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add candidate modal */}
      {showAdd && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowAdd(false) }}>
          <div className="modal" style={{ maxWidth: 420 }}>
            <h2 style={{ fontSize: 17, fontWeight: 600, marginBottom: 20 }}>Add to pipeline</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="label">Candidate</label>
                <select className="input" value={addCandidateId} onChange={e => setAddCandidateId(e.target.value)}>
                  <option value="">Select candidate…</option>
                  {candidates.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Stage</label>
                <select className="input" value={addStage} onChange={e => setAddStage(e.target.value as PipelineStage)}>
                  {PIPELINE_STAGES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button className="btn-primary" onClick={addToJob} disabled={!addCandidateId || loading}
                style={{ flex: 1, justifyContent: 'center' }}>
                {loading ? 'Adding…' : 'Add to Pipeline'}
              </button>
              <button className="btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
