'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import type { Client } from '@/lib/types'

export default function NewJobPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [clients, setClients] = useState<Client[]>([])
  const [form, setForm] = useState({
    client_id: '', title: '', location: '',
    headcount_min: '1', headcount_max: '1',
    salary_min: '', salary_max: '', currency: 'USD',
    description: '', requirements: '', stage: 'open',
  })

  useEffect(() => {
    supabase.from('clients').select('id, name').order('name').then(({ data }) => {
      if (data) setClients(data as any)
    })
  }, [])

  const f = (field: string) => ({
    value: (form as any)[field],
    onChange: (e: any) => setForm(prev => ({ ...prev, [field]: e.target.value }))
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const { data: { user } } = await supabase.auth.getUser()
    const payload = {
      ...form,
      headcount_min: parseInt(form.headcount_min),
      headcount_max: parseInt(form.headcount_max),
      salary_min: form.salary_min ? parseInt(form.salary_min) : null,
      salary_max: form.salary_max ? parseInt(form.salary_max) : null,
      owner_id: user?.id,
    }
    const { error } = await supabase.from('jobs').insert(payload)
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/dashboard/jobs')
  }

  return (
    <div style={{ maxWidth: 640 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <Link href="/dashboard/jobs" style={{ color: 'var(--text-muted)', display: 'flex' }}><ArrowLeft size={18} /></Link>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 600 }}>Add Job</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Create a new open position</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card" style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>Position Details</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="label">Job Title *</label>
              <input className="input" required placeholder="Quantitative Researcher" {...f('title')} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="label">Client *</label>
              <select className="input" required {...f('client_id')}>
                <option value="">Select client…</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Location</label>
              <input className="input" placeholder="Hong Kong / Remote" {...f('location')} />
            </div>
            <div>
              <label className="label">Stage</label>
              <select className="input" {...f('stage')}>
                <option value="open">Open</option>
                <option value="on_hold">On Hold</option>
                <option value="closed">Closed</option>
                <option value="filled">Filled</option>
              </select>
            </div>
            <div>
              <label className="label">Headcount Min</label>
              <input className="input" type="number" min="1" {...f('headcount_min')} />
            </div>
            <div>
              <label className="label">Headcount Max</label>
              <input className="input" type="number" min="1" {...f('headcount_max')} />
            </div>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>Compensation</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
            <div>
              <label className="label">Currency</label>
              <select className="input" {...f('currency')}>
                <option>USD</option><option>HKD</option><option>SGD</option><option>GBP</option><option>EUR</option>
              </select>
            </div>
            <div>
              <label className="label">Min Salary</label>
              <input className="input" type="number" placeholder="100000" {...f('salary_min')} />
            </div>
            <div>
              <label className="label">Max Salary</label>
              <input className="input" type="number" placeholder="200000" {...f('salary_max')} />
            </div>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14 }}>Description</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label className="label">Job Description</label>
              <textarea className="input" rows={4} placeholder="Role overview, responsibilities…"
                value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                style={{ resize: 'vertical' }} />
            </div>
            <div>
              <label className="label">Requirements</label>
              <textarea className="input" rows={4} placeholder="Must-have skills, experience…"
                value={form.requirements} onChange={e => setForm(f => ({ ...f, requirements: e.target.value }))}
                style={{ resize: 'vertical' }} />
            </div>
          </div>
        </div>

        {error && <div style={{ color: '#f87171', fontSize: 13, marginBottom: 12 }}>{error}</div>}
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-primary" type="submit" disabled={loading} style={{ padding: '10px 24px' }}>
            {loading ? 'Saving…' : 'Save Job'}
          </button>
          <Link href="/dashboard/jobs" style={{ textDecoration: 'none' }}>
            <button className="btn-ghost" type="button">Cancel</button>
          </Link>
        </div>
      </form>
    </div>
  )
}
