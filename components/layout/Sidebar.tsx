'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/types'
import {
  LayoutDashboard, Users, Building2, Briefcase,
  Kanban, BarChart3, Activity, Settings, LogOut, Shield
} from 'lucide-react'

const NAV = [
  { href: '/dashboard',           label: 'Dashboard',   icon: LayoutDashboard },
  { href: '/dashboard/candidates',label: 'Candidates',  icon: Users },
  { href: '/dashboard/clients',   label: 'Clients',     icon: Building2 },
  { href: '/dashboard/jobs',      label: 'Jobs',        icon: Briefcase },
  { href: '/dashboard/pipeline',  label: 'Pipeline',    icon: Kanban },
  { href: '/dashboard/activities',label: 'Activities',  icon: Activity },
  { href: '/dashboard/analytics', label: 'Analytics',   icon: BarChart3 },
]

export default function Sidebar({ profile }: { profile: Profile | null }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function logout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside style={{
      width: 220,
      flexShrink: 0,
      background: 'var(--bg-0)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      padding: '20px 12px',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 8px', marginBottom: 28 }}>
        <div style={{
          width: 30, height: 30,
          background: 'var(--brand)',
          borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 15, fontWeight: 700, color: '#fff', flexShrink: 0,
        }}>Q</div>
        <span style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.01em' }}>QuantATS</span>
      </div>

      {/* Nav */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link key={href} href={href} className={`nav-item ${active ? 'active' : ''}`}>
              <Icon size={15} strokeWidth={1.8} />
              {label}
            </Link>
          )
        })}

        {profile?.role === 'admin' && (
          <Link href="/dashboard/admin" className={`nav-item ${pathname.startsWith('/dashboard/admin') ? 'active' : ''}`}>
            <Shield size={15} strokeWidth={1.8} />
            Admin
          </Link>
        )}
      </nav>

      {/* User */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginTop: 8 }}>
        <div style={{ padding: '0 8px', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'var(--brand-dim)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 600, color: 'var(--brand-light)',
              flexShrink: 0,
            }}>
              {profile?.full_name?.charAt(0).toUpperCase() ?? '?'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {profile?.full_name}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {profile?.role}
              </div>
            </div>
          </div>
        </div>
        <button onClick={logout} className="nav-item" style={{ width: '100%', border: 'none', background: 'none' }}>
          <LogOut size={14} strokeWidth={1.8} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
