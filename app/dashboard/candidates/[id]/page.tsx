import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Mail, Phone, MapPin, Linkedin, Briefcase, Edit } from 'lucide-react'

export default async function CandidateDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: c } = await supabase
    .from('candidates')
    .select('*, owner:profiles(full_name)')
    .eq('id', params.id)
    .single()

  if (!c) notFound()

  const { data: pipeline } = await supabase
    .from('pipeline')
    .select('*, job:jobs(title, client:clients(name))')
    .eq('candidate_id', params.id)
    .order('created_at', { ascending: false })

  const { data: activities } = await supabase
    .from('activities')
    .select('*')
    .eq('candidate_id', params.id)
    .order('created_at', { ascending: false })

  const stageColors: Record<string, string> = {
    sourced: 'badge-purple', screened: 'badge-purple', submitted: 'badge-amber',
    client_interview: 'badge-blue', offer: 'badge-green', placed: 'badge-green', rejected: 'badge-red'
  }

  const activityIcons: Record<string, string> = {
    call: '📞', email: '✉️', interview: '🎯', meeting: '🤝', note: '📝', placement: '🏆'
  }

  return (
    <div style={{ maxWidth: 800 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/dashboard/candidates" style={{ color: 'var(--text-muted)', display: 'flex' }}><ArrowLeft size={18} /></Link>
          <div style={{
            width: 44, height: 44, borderRadius: '50%',
            background: 'var(--brand-dim)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, fontWeight: 600, color: 'var(--brand-light)',
          }}>{c.full_name.charAt(0)}</div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 600 }}>{c.full_name}</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
              {c.current_title}{c.current_company ? ` @ ${c.current_company}` : ''}
            </p>
          </div>
        </div>
        <Link href={`/dashboard/candidates/${params.id}/edit`} style={{ textDecoration: 'none' }}>
          <button className="btn-ghost"><Edit size={13} /> Edit</button>
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Contact info */}
        <div className="card">
          <h2 style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14 }}>Contact</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {c.email && <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}><Mail size={13} color="var(--text-muted)" /><a href={`mailto:${c.email}`} style={{ color: 'var(--brand-light)' }}>{c.email}</a></div>}
            {c.phone && <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}><Phone size={13} color="var(--text-muted)" /><span>{c.phone}</span></div>}
            {c.location && <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}><MapPin size={13} color="var(--text-muted)" /><span>{c.location}</span></div>}
            {c.linkedin_url && <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}><Linkedin size={13} color="var(--text-muted)" /><a href={c.linkedin_url} target="_blank" rel="noopener" style={{ color: 'var(--brand-light)' }}>LinkedIn</a></div>}
          </div>
        </div>

        {/* Compensation */}
        <div className="card">
          <h2 style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14 }}>Compensation</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 3 }}>Current</div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>
                {c.current_salary ? `${c.currency} ${c.current_salary.toLocaleString()}` : '—'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 3 }}>Expected</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--brand-light)' }}>
                {c.expected_salary ? `${c.currency} ${c.expected_salary.toLocaleString()}` : '—'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 3 }}>Notice Period</div>
              <div style={{ fontSize: 13 }}>{c.notice_period ?? '—'}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 3 }}>Ref</div>
              <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)' }}>{c.reference}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Skills + Specialisms */}
      {(c.specialisms?.length > 0 || c.skills?.length > 0) && (
        <div className="card" style={{ marginBottom: 16 }}>
          {c.specialisms?.length > 0 && (
            <div style={{ marginBottom: c.skills?.length > 0 ? 14 : 0 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Specialisms</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {c.specialisms.map((s: string) => <span key={s} className="badge badge-purple">{s}</span>)}
              </div>
            </div>
          )}
          {c.skills?.length > 0 && (
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Skills</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {c.skills.map((s: string) => <span key={s} className="badge badge-blue">{s}</span>)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Notes */}
      {c.notes && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Notes</div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{c.notes}</p>
        </div>
      )}

      {/* Pipeline */}
      <div className="card" style={{ marginBottom: 16, padding: 0 }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: 14, fontWeight: 600 }}>Jobs Pipeline</h2>
          <Link href={`/dashboard/pipeline?candidate=${params.id}`} style={{ textDecoration: 'none' }}>
            <button className="btn-ghost" style={{ fontSize: 12 }}><Briefcase size={12} /> Add to job</button>
          </Link>
        </div>
        {pipeline?.length === 0 && <div style={{ padding: 20, color: 'var(--text-muted)', fontSize: 13 }}>Not added to any jobs yet.</div>}
        {pipeline?.map(p => (
          <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderBottom: '1px solid var(--border)' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{(p.job as any)?.title}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{(p.job as any)?.client?.name}</div>
            </div>
            <span className={`badge ${stageColors[p.stage] ?? 'badge-gray'}`} style={{ textTransform: 'capitalize' }}>
              {p.stage.replace('_', ' ')}
            </span>
          </div>
        ))}
      </div>

      {/* Activity log */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: 14, fontWeight: 600 }}>Activity Log</h2>
        </div>
        {activities?.length === 0 && <div style={{ padding: 20, color: 'var(--text-muted)', fontSize: 13 }}>No activities logged.</div>}
        {activities?.map(a => (
          <div key={a.id} style={{ display: 'flex', gap: 12, padding: '12px 20px', borderBottom: '1px solid var(--border)', alignItems: 'flex-start' }}>
            <div style={{ fontSize: 16, marginTop: 1 }}>{activityIcons[a.type] ?? '📌'}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{a.title}</div>
              {a.notes && <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{a.notes}</div>}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{new Date(a.created_at).toLocaleDateString()}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
