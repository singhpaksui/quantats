'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewClientPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '', industry: '', website: '', location: '',
    stage: 'prospect', notes: '',
  })

  const f = (field: string) => ({
    value: (form as any)[field],
    onChange: (e: any) => setForm(prev => ({ ...prev, [field]: e.target.value }))
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('clients').insert({ ...form, owner_id: user?.id })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/dashboard/clients')
  }

  return (
    <div style={{ maxWidth: 600 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <Link href="/dashboard/clients" style={{ color: 'var(--text-muted)', display: 'flex' }}><ArrowLeft size={18} /></Link>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 600 }}>Add Client</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Add a new client company</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card" style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>Company Details</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label className="label">Company Name *</label>
              <input className="input" required placeholder="Rock Bund Capital" {...f('name')} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label className="label">Industry</label>
                <select className="input" {...f('industry')}>
                  <option value="">Select industry</option>
                  <option>Hedge Fund</option>
                  <option>Prop Trading</option>
                  <option>Crypto / DeFi</option>
                  <option>Investment Bank</option>
                  <option>Asset Management</option>
                  <option>Market Making</option>
                  <option>Family Office</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="label">Stage</label>
                <select className="input" {...f('stage')}>
                  <option value="prospect">Prospect</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="lost">Lost</option>
                </select>
              </div>
              <div>
                <label className="label">Location</label>
                <input className="input" placeholder="Hong Kong" {...f('location')} />
              </div>
              <div>
                <label className="label">Website</label>
                <input className="input" placeholder="https://firm.com" {...f('website')} />
              </div>
            </div>
            <div>
              <label className="label">Notes</label>
              <textarea className="input" rows={3} placeholder="Key contacts, relationship history…"
                value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                style={{ resize: 'vertical' }} />
            </div>
          </div>
        </div>

        {error && <div style={{ color: '#f87171', fontSize: 13, marginBottom: 12 }}>{error}</div>}
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-primary" type="submit" disabled={loading} style={{ padding: '10px 24px' }}>
            {loading ? 'Saving…' : 'Save Client'}
          </button>
          <Link href="/dashboard/clients" style={{ textDecoration: 'none' }}>
            <button className="btn-ghost" type="button">Cancel</button>
          </Link>
        </div>
      </form>
    </div>
  )
}
