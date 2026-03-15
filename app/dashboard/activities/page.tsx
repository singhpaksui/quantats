'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus } from 'lucide-react'
import type { Activity, ActivityType, Candidate, Job } from '@/lib/types'

const TYPE_COLORS: Record<ActivityType, string> = {
  call: '#6366f1', email: '#3b82f6', interview: '#f59e0b',
  meeting: '#10b981', note: '#8b8b9e', placement: '#22c55e',
}
const TYPE_ICONS: Record<ActivityType, string> = {
  call: '📞', email: '✉️', interview: '🎯', meeting: '🤝', note: '📝', placement: '🏆',
}

export default function ActivitiesPage() {
  const supabase = createClient()
  const [activities, setActivities] = useState<Activity[]>([])
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [showForm, setShowForm] = useState(false)
  const [filterType, setFilterType] = useState<string>('all')
  const [form, setForm] = useState({
    type: 'call' as ActivityType, title: '', notes: '',
    candidate_id: '', job_id: '', scheduled_at: '',
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    const [{ data: acts }, { data: cands }, { data: js }] = await Promise.all([
      supabase.from('activities').select('*, candidate:candidates(full_name), owner:profiles(full_name)')
        .order('created_at', { ascending: false }).limit(100),
      supabase.from('candidates').select('id, full_name').order('full_name'),
      supabase.from('jobs').select('id, title, client:clients(name)').eq('stage', 'open'),
    ])
    if (acts) setActivities(acts as any)
    if (cands) setCandidates(cands as any)
    if (js) setJobs(js as any)
  }

  async function logActivity(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('activities').insert({
      ...form,
      candidate_id: form.candidate_id || null,
      job_id: form.job_id || null,
      scheduled_at: form.scheduled_at || null,
      owner_id: user?.id,
    })
    setShowForm(false)
    setForm({ type: 'call', title: '', notes: '', candidate_id: '', job_id: '', scheduled_at: '' })
    setLoading(false)
    loadAll()
  }

  const filtered = filterType === 'all' ? activities : activities.filter(a => a.type === filterType)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em' }}>Activities</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 3 }}>Log calls, interviews, meetings</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(true)}><Plus size={14} /> Log Activity</button>
      </div>

      {/* Filter pills */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['all', 'call', 'email', 'interview', 'meeting', 'note', 'placement'].map(t => (
          <button key={t} onClick={() => setFilterType(t)}
            style={{
              padding: '5px 14px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
              border: '1px solid', textTransform: 'capitalize',
              borderColor: filterType === t ? 'var(--brand)' : 'var(--border)',
              background: filterType === t ? 'var(--brand-dim)' : 'transparent',
              color: filterType === t ? 'var(--brand-light)' : 'var(--text-secondary)',
            }}>
            {t === 'all' ? 'All' : `${TYPE_ICONS[t as ActivityType]} ${t}`}
          </button>
        ))}
      </div>

      <div className="card" style={{ padding: 0 }}>
        {filtered.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
            No activities yet. Start by logging a call or interview.
          </div>
        )}
        {filtered.map(a => (
          <div key={a.id} style={{
            display: 'flex', alignItems: 'flex-start', gap: 14,
            padding: '14px 20px', borderBottom: '1px solid var(--border)',
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: 8, flexShrink: 0,
              background: `${TYPE_COLORS[a.type]}20`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
            }}>
              {TYPE_ICONS[a.type]}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{a.title}</div>
                  {(a as any).candidate && (
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                      Re: {(a as any).candidate.full_name}
                    </div>
                  )}
                  {a.notes && <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{a.notes}</div>}
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 16 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {new Date(a.created_at).toLocaleDateString()}
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
                    color: TYPE_COLORS[a.type], letterSpacing: '0.05em',
                  }}>{a.type}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Log activity modal */}
      {showForm && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowForm(false) }}>
          <div className="modal">
            <h2 style={{ fontSize: 17, fontWeight: 600, marginBottom: 20 }}>Log Activity</h2>
            <form onSubmit={logActivity} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="label">Type</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {(['call', 'email', 'interview', 'meeting', 'note', 'placement'] as ActivityType[]).map(t => (
                    <button key={t} type="button" onClick={() => setForm(f => ({ ...f, type: t }))}
                      style={{
                        padding: '6px 12px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
                        border: '1px solid',
                        borderColor: form.type === t ? TYPE_COLORS[t] : 'var(--border)',
                        background: form.type === t ? `${TYPE_COLORS[t]}18` : 'transparent',
                        color: form.type === t ? TYPE_COLORS[t] : 'var(--text-secondary)',
                      }}>
                      {TYPE_ICONS[t]} {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">Title *</label>
                <input className="input" required placeholder="e.g. Intro call with Jack Huang"
                  value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label className="label">Candidate</label>
                  <select className="input" value={form.candidate_id} onChange={e => setForm(f => ({ ...f, candidate_id: e.target.value }))}>
                    <option value="">None</option>
                    {candidates.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Job</label>
                  <select className="input" value={form.job_id} onChange={e => setForm(f => ({ ...f, job_id: e.target.value }))}>
                    <option value="">None</option>
                    {jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Date / Time</label>
                <input className="input" type="datetime-local"
                  value={form.scheduled_at} onChange={e => setForm(f => ({ ...f, scheduled_at: e.target.value }))} />
              </div>
              <div>
                <label className="label">Notes</label>
                <textarea className="input" rows={3} placeholder="Key points discussed…"
                  value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  style={{ resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button className="btn-primary" type="submit" disabled={loading} style={{ flex: 1, justifyContent: 'center' }}>
                  {loading ? 'Saving…' : 'Log Activity'}
                </button>
                <button className="btn-ghost" type="button" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
