import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Building2 } from 'lucide-react'

const stageBadge: Record<string, string> = {
  prospect: 'badge-amber', active: 'badge-green', inactive: 'badge-gray', lost: 'badge-red'
}

export default async function ClientsPage() {
  const supabase = createClient()
  const { data: clients } = await supabase
    .from('clients')
    .select('*, owner:profiles(full_name)')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em' }}>Clients</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 3 }}>{clients?.length ?? 0} total</p>
        </div>
        <Link href="/dashboard/clients/new" style={{ textDecoration: 'none' }}>
          <button className="btn-primary"><Plus size={14} /> Add Client</button>
        </Link>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 100px',
          gap: 12, padding: '10px 16px', borderBottom: '1px solid var(--border)',
          fontSize: 11, fontWeight: 500, color: 'var(--text-muted)',
          textTransform: 'uppercase', letterSpacing: '0.05em',
        }}>
          <span>Client</span><span>Industry</span><span>Location</span><span>Stage</span><span>Jobs</span>
        </div>

        {clients?.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
            <Building2 size={28} strokeWidth={1} style={{ marginBottom: 10, opacity: 0.3 }} />
            <div style={{ fontSize: 14, marginBottom: 12 }}>No clients yet</div>
            <Link href="/dashboard/clients/new" style={{ textDecoration: 'none' }}>
              <button className="btn-primary" style={{ fontSize: 13 }}><Plus size={13} /> Add your first client</button>
            </Link>
          </div>
        )}

        {clients?.map(c => (
          <Link key={c.id} href={`/dashboard/clients/${c.id}`} style={{ textDecoration: 'none', display: 'block' }}>
            <div className="table-row" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 100px', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                  background: 'rgba(59,130,246,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700, color: '#60a5fa',
                }}>{c.name.charAt(0)}</div>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{c.name}</div>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{c.industry ?? '—'}</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{c.location ?? '—'}</div>
              <span className={`badge ${stageBadge[c.stage] ?? 'badge-gray'}`} style={{ textTransform: 'capitalize', alignSelf: 'center' }}>{c.stage}</span>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>—</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
