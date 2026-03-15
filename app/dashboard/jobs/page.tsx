import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Briefcase } from 'lucide-react'

const stageBadge: Record<string, string> = {
  open: 'badge-green', on_hold: 'badge-amber', closed: 'badge-gray', filled: 'badge-blue'
}

export default async function JobsPage() {
  const supabase = createClient()
  const { data: jobs } = await supabase
    .from('jobs')
    .select('*, client:clients(name), owner:profiles(full_name)')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em' }}>Jobs</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 3 }}>{jobs?.length ?? 0} total</p>
        </div>
        <Link href="/dashboard/jobs/new" style={{ textDecoration: 'none' }}>
          <button className="btn-primary"><Plus size={14} /> Add Job</button>
        </Link>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 100px',
          gap: 12, padding: '10px 16px', borderBottom: '1px solid var(--border)',
          fontSize: 11, fontWeight: 500, color: 'var(--text-muted)',
          textTransform: 'uppercase', letterSpacing: '0.05em',
        }}>
          <span>Position</span><span>Client</span><span>Location</span><span>Stage</span><span>Headcount</span>
        </div>

        {jobs?.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
            <Briefcase size={28} strokeWidth={1} style={{ marginBottom: 10, opacity: 0.3 }} />
            <div style={{ fontSize: 14, marginBottom: 12 }}>No jobs yet</div>
            <Link href="/dashboard/jobs/new" style={{ textDecoration: 'none' }}>
              <button className="btn-primary" style={{ fontSize: 13 }}><Plus size={13} /> Add your first job</button>
            </Link>
          </div>
        )}

        {jobs?.map(j => (
          <Link key={j.id} href={`/dashboard/jobs/${j.id}`} style={{ textDecoration: 'none', display: 'block' }}>
            <div className="table-row" style={{ gridTemplateColumns: '2fr 1.5fr 1fr 1fr 100px', gap: 12 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{j.title}</div>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{(j.client as any)?.name ?? '—'}</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{j.location ?? '—'}</div>
              <span className={`badge ${stageBadge[j.stage] ?? 'badge-gray'}`} style={{ textTransform: 'capitalize', alignSelf: 'center' }}>
                {j.stage.replace('_', ' ')}
              </span>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                {j.headcount_min === j.headcount_max ? j.headcount_min : `${j.headcount_min}–${j.headcount_max}`}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
