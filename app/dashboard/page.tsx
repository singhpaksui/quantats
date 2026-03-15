import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Users, Building2, Briefcase, TrendingUp, Plus } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Parallel stat queries
  const [
    { count: candidateCount },
    { count: clientCount },
    { count: jobCount },
    { count: placementCount },
    { data: recentCandidates },
    { data: recentActivities },
  ] = await Promise.all([
    supabase.from('candidates').select('*', { count: 'exact', head: true }),
    supabase.from('clients').select('*', { count: 'exact', head: true }),
    supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('stage', 'open'),
    supabase.from('pipeline').select('*', { count: 'exact', head: true }).eq('stage', 'placed'),
    supabase.from('candidates').select('id, full_name, current_title, current_company, created_at')
      .order('created_at', { ascending: false }).limit(5),
    supabase.from('activities').select('id, type, title, created_at')
      .order('created_at', { ascending: false }).limit(6),
  ])

  const stats = [
    { label: 'Total Candidates', value: candidateCount ?? 0, icon: Users, color: 'var(--brand)', href: '/dashboard/candidates' },
    { label: 'Active Clients', value: clientCount ?? 0, icon: Building2, color: '#3b82f6', href: '/dashboard/clients' },
    { label: 'Open Jobs', value: jobCount ?? 0, icon: Briefcase, color: '#f59e0b', href: '/dashboard/jobs' },
    { label: 'Placements', value: placementCount ?? 0, icon: TrendingUp, color: '#22c55e', href: '/dashboard/pipeline' },
  ]

  const activityColors: Record<string, string> = {
    call: '#6366f1', email: '#3b82f6', interview: '#f59e0b',
    meeting: '#10b981', note: '#8b8b9e', placement: '#22c55e',
  }

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em' }}>Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 3 }}>
          Your recruitment overview
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {stats.map(({ label, value, icon: Icon, color, href }) => (
          <Link key={label} href={href} style={{ textDecoration: 'none' }}>
            <div className="stat-card" style={{ cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>{label}</div>
                  <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>{value}</div>
                </div>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={17} color={color} strokeWidth={1.8} />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent candidates + activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Recent candidates */}
        <div className="card" style={{ padding: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: 14, fontWeight: 600 }}>Recent Candidates</h2>
            <Link href="/dashboard/candidates/new" style={{ textDecoration: 'none' }}>
              <button className="btn-primary" style={{ padding: '6px 12px', fontSize: 12 }}>
                <Plus size={13} /> Add
              </button>
            </Link>
          </div>
          {recentCandidates?.length === 0 && (
            <div style={{ padding: 24, color: 'var(--text-muted)', fontSize: 13, textAlign: 'center' }}>
              No candidates yet
            </div>
          )}
          {recentCandidates?.map(c => (
            <Link key={c.id} href={`/dashboard/candidates/${c.id}`} style={{ textDecoration: 'none', display: 'block' }}>
              <div className="table-row" style={{ gridTemplateColumns: '1fr auto', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: '50%',
                    background: 'var(--brand-dim)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 600, color: 'var(--brand-light)', flexShrink: 0,
                  }}>
                    {c.full_name.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{c.full_name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.current_title} {c.current_company ? `@ ${c.current_company}` : ''}</div>
                  </div>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {new Date(c.created_at).toLocaleDateString()}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent activity */}
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: 14, fontWeight: 600 }}>Recent Activity</h2>
          </div>
          {recentActivities?.length === 0 && (
            <div style={{ padding: 24, color: 'var(--text-muted)', fontSize: 13, textAlign: 'center' }}>
              No activities logged yet
            </div>
          )}
          {recentActivities?.map(a => (
            <div key={a.id} className="table-row" style={{ gridTemplateColumns: 'auto 1fr auto', gap: 12 }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%', marginTop: 3,
                background: activityColors[a.type] ?? 'var(--text-muted)',
                flexShrink: 0,
              }}/>
              <div>
                <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>{a.title}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{a.type}</div>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {new Date(a.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
