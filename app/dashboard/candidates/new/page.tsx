'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const SPECIALISMS = ['Quant Research', 'HFT', 'Market Making', 'DeFi', 'CeFi', 'Risk', 'Portfolio Management', 'Algo Trading', 'Data Science', 'Blockchain Dev', 'Crypto Trading']
const SKILLS = ['Python', 'C++', 'Rust', 'Java', 'R', 'MATLAB', 'Solidity', 'Machine Learning', 'Statistics', 'Options Pricing', 'Fixed Income', 'FX']

export default function NewCandidatePage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    full_name: '', email: '', phone: '', location: '',
    current_title: '', current_company: '', linkedin_url: '',
    notice_period: '', current_salary: '', expected_salary: '', currency: 'USD',
    skills: [] as string[], specialisms: [] as string[], notes: '',
  })

  function toggle(field: 'skills' | 'specialisms', val: string) {
    setForm(f => ({
      ...f,
      [field]: f[field].includes(val) ? f[field].filter(x => x !== val) : [...f[field], val]
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const { data: { user } } = await supabase.auth.getUser()
    const payload = {
      ...form,
      current_salary: form.current_salary ? parseInt(form.current_salary) : null,
      expected_salary: form.expected_salary ? parseInt(form.expected_salary) : null,
      owner_id: user?.id,
    }
    const { error } = await supabase.from('candidates').insert(payload)
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/dashboard/candidates')
  }

  const f = (field: string) => ({
    value: (form as any)[field],
    onChange: (e: any) => setForm(prev => ({ ...prev, [field]: e.target.value }))
  })

  return (
    <div style={{ maxWidth: 700 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <Link href="/dashboard/candidates" style={{ color: 'var(--text-muted)', display: 'flex' }}><ArrowLeft size={18} /></Link>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 600 }}>Add Candidate</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Build your talent database</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card" style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 13, fontWeight: 600, marginBottom: 16, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Basic Info</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="label">Full Name *</label>
              <input className="input" required placeholder="Jack Huang" {...f('full_name')} />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" placeholder="jack@firm.com" {...f('email')} />
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input" placeholder="+1 212 555 0100" {...f('phone')} />
            </div>
            <div>
              <label className="label">Location</label>
              <input className="input" placeholder="Hong Kong" {...f('location')} />
            </div>
            <div>
              <label className="label">LinkedIn URL</label>
              <input className="input" placeholder="linkedin.com/in/jackhuang" {...f('linkedin_url')} />
            </div>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 13, fontWeight: 600, marginBottom: 16, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Work</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label className="label">Current Title</label>
              <input className="input" placeholder="Quantitative Researcher" {...f('current_title')} />
            </div>
            <div>
              <label className="label">Current Company</label>
              <input className="input" placeholder="Windfall Research" {...f('current_company')} />
            </div>
            <div>
              <label className="label">Notice Period</label>
              <input className="input" placeholder="1 month" {...f('notice_period')} />
            </div>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 13, fontWeight: 600, marginBottom: 16, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Compensation</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
            <div>
              <label className="label">Currency</label>
              <select className="input" {...f('currency')}>
                <option>USD</option><option>HKD</option><option>SGD</option><option>GBP</option><option>EUR</option>
              </select>
            </div>
            <div>
              <label className="label">Current Salary</label>
              <input className="input" type="number" placeholder="120000" {...f('current_salary')} />
            </div>
            <div>
              <label className="label">Expected Salary</label>
              <input className="input" type="number" placeholder="150000" {...f('expected_salary')} />
            </div>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 13, fontWeight: 600, marginBottom: 14, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Specialisms</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {SPECIALISMS.map(s => (
              <button key={s} type="button" onClick={() => toggle('specialisms', s)}
                style={{
                  padding: '5px 12px', borderRadius: 20, fontSize: 12, cursor: 'pointer', border: '1px solid',
                  borderColor: form.specialisms.includes(s) ? 'var(--brand)' : 'var(--border)',
                  background: form.specialisms.includes(s) ? 'var(--brand-dim)' : 'transparent',
                  color: form.specialisms.includes(s) ? 'var(--brand-light)' : 'var(--text-secondary)',
                  transition: 'all 0.1s',
                }}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="card" style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 13, fontWeight: 600, marginBottom: 14, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Skills</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {SKILLS.map(s => (
              <button key={s} type="button" onClick={() => toggle('skills', s)}
                style={{
                  padding: '5px 12px', borderRadius: 20, fontSize: 12, cursor: 'pointer', border: '1px solid',
                  borderColor: form.skills.includes(s) ? '#3b82f6' : 'var(--border)',
                  background: form.skills.includes(s) ? 'rgba(59,130,246,0.1)' : 'transparent',
                  color: form.skills.includes(s) ? '#60a5fa' : 'var(--text-secondary)',
                  transition: 'all 0.1s',
                }}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="card" style={{ marginBottom: 20 }}>
          <label className="label">Notes</label>
          <textarea className="input" rows={4} placeholder="Background notes, personality, interview observations…"
            value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            style={{ resize: 'vertical' }} />
        </div>

        {error && <div style={{ color: '#f87171', fontSize: 13, marginBottom: 12 }}>{error}</div>}

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-primary" type="submit" disabled={loading} style={{ padding: '10px 24px' }}>
            {loading ? 'Saving…' : 'Save Candidate'}
          </button>
          <Link href="/dashboard/candidates" style={{ textDecoration: 'none' }}>
            <button className="btn-ghost" type="button">Cancel</button>
          </Link>
        </div>
      </form>
    </div>
  )
}
