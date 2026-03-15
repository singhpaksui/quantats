import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Search } from 'lucide-react'

export default async function CandidatesPage() {
  const supabase = createClient()
  const { data: candidates } = await supabase
    .from('candidates')
    .select('*, owner:profiles(full_name)')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em' }}>Candidates</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 3 }}>
            {candidates?.length ?? 0} total
          </p>
        </div>
        <Link href="/dashboard/candidates/new" style={{ textDecoration: 'none' }}>
          <button className="btn-primary"><Plus size={14} /> Add Candidate</button>
        </Link>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {/* Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1.5fr 1.5fr 1fr 120px',
          gap: 12, padding: '10px 16px',
          borderBottom: '1px solid var(--border)',
          fontSize: 11, fontWeight: 500, color: 'var(--text-muted)',
          textTransform: 'uppercase', letterSpacing: '0.05em',
        }}>
          <span>Name</span>
          <span>Current Role</span>
          <span>Company</span>
          <span>Location</span>
          <span>Added</span>
        </div>

        {candidates?.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 14, marginBottom: 12 }}>No candidates yet</div>
            <Link href="/dashboard/candidates/new" style={{ textDecoration: 'none' }}>
              <button className="btn-primary" style={{ fontSize: 13 }}><Plus size={13} /> Add your first candidate</button>
            </Link>
          </div>
        )}

        {candidates?.map(c => (
          <Link key={c.id} href={`/dashboard/candidates/${c.id}`} style={{ textDecoration: 'none', display: 'block' }}>
            <div className="table-row" style={{
              gridTemplateColumns: '2fr 1.5fr 1.5fr 1fr 120px', gap: 12,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                  background: 'var(--brand-dim)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 600, color: 'var(--brand-light)',
                }}>{c.full_name.charAt(0)}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{c.full_name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.reference}</div>
                </div>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{c.current_title ?? '—'}</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{c.current_company ?? '—'}</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{c.location ?? '—'}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(c.created_at).toLocaleDateString()}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
