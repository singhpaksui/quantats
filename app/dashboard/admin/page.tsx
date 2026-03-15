'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Shield } from 'lucide-react'
import type { Profile } from '@/lib/types'

export default function AdminPage() {
  const supabase = createClient()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ full_name: '', email: '', password: '', role: 'user' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => { loadProfiles() }, [])

  async function loadProfiles() {
    const { data } = await supabase.from('profiles').select('*').order('created_at')
    if (data) setProfiles(data)
  }

  async function createUser(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError(''); setSuccess('')
    const res = await fetch('/api/admin/create-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error); setLoading(false); return }
    setSuccess(`User ${form.full_name} created!`)
    setForm({ full_name: '', email: '', password: '', role: 'user' })
    setShowForm(false)
    setLoading(false)
    loadProfiles()
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Shield size={20} color="var(--brand)" /> Admin
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 3 }}>Manage team members</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={14} /> Add User
        </button>
      </div>

      {success && (
        <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 8, padding: '10px 16px', color: '#4ade80', fontSize: 13, marginBottom: 20 }}>
          {success}
        </div>
      )}

      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{profiles.length} team member{profiles.length !== 1 ? 's' : ''}</span>
        </div>
        {profiles.map(p => (
          <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 34, height: 34, borderRadius: '50%',
                background: 'var(--brand-dim)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 600, color: 'var(--brand-light)',
              }}>{p.full_name.charAt(0)}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{p.full_name}</div>
              </div>
            </div>
            <span className={`badge ${p.role === 'admin' ? 'badge-purple' : 'badge-gray'}`}>
              {p.role}
            </span>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowForm(false) }}>
          <div className="modal">
            <h2 style={{ fontSize: 17, fontWeight: 600, marginBottom: 20 }}>Create team member</h2>
            <form onSubmit={createUser} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="label">Full name</label>
                <input className="input" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} required placeholder="Jane Smith" />
              </div>
              <div>
                <label className="label">Email</label>
                <input className="input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required placeholder="jane@firm.com" />
              </div>
              <div>
                <label className="label">Temporary password</label>
                <input className="input" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required placeholder="Min 8 characters" minLength={8} />
              </div>
              <div>
                <label className="label">Role</label>
                <select className="input" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              {error && <div style={{ color: '#f87171', fontSize: 12 }}>{error}</div>}
              <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                <button className="btn-primary" type="submit" disabled={loading} style={{ flex: 1, justifyContent: 'center' }}>
                  {loading ? 'Creating…' : 'Create user'}
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
