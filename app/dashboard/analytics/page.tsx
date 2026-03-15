'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { format, subWeeks, startOfWeek, eachWeekOfInterval } from 'date-fns'

export default function AnalyticsPage() {
  const supabase = createClient()
  const [range, setRange] = useState(8) // weeks
  const [weeklyData, setWeeklyData] = useState<any[]>([])
  const [totals, setTotals] = useState({ calls: 0, candidates: 0, interviews: 0, placements: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadData() }, [range])

  async function loadData() {
    setLoading(true)
    const since = subWeeks(new Date(), range).toISOString()

    const [{ data: acts }, { data: cands }, { data: placed }] = await Promise.all([
      supabase.from('activities').select('type, created_at').gte('created_at', since),
      supabase.from('candidates').select('created_at').gte('created_at', since),
      supabase.from('pipeline').select('updated_at').eq('stage', 'placed').gte('updated_at', since),
    ])

    // Build week buckets
    const weeks = eachWeekOfInterval({ start: subWeeks(new Date(), range - 1), end: new Date() })
    const buckets = weeks.map(w => ({
      week: format(w, 'MMM d'),
      calls: 0, interviews: 0, candidates: 0, placements: 0,
    }))

    function getBucket(dateStr: string) {
      const d = new Date(dateStr)
      const idx = weeks.findIndex((w, i) => {
        const next = weeks[i + 1]
        return d >= w && (next ? d < next : true)
      })
      return idx >= 0 ? idx : buckets.length - 1
    }

    acts?.forEach(a => {
      const i = getBucket(a.created_at)
      if (i >= 0 && i < buckets.length) {
        if (a.type === 'call') buckets[i].calls++
        if (a.type === 'interview') buckets[i].interviews++
      }
    })
    cands?.forEach(c => {
      const i = getBucket(c.created_at)
      if (i >= 0 && i < buckets.length) buckets[i].candidates++
    })
    placed?.forEach(p => {
      const i = getBucket(p.updated_at)
      if (i >= 0 && i < buckets.length) buckets[i].placements++
    })

    setWeeklyData(buckets)
    setTotals({
      calls: acts?.filter(a => a.type === 'call').length ?? 0,
      interviews: acts?.filter(a => a.type === 'interview').length ?? 0,
      candidates: cands?.length ?? 0,
      placements: placed?.length ?? 0,
    })
    setLoading(false)
  }

  const tooltipStyle = {
    background: '#18181f', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8, fontSize: 12, color: '#f0f0f5',
  }

  const stats = [
    { label: 'Calls Made', value: totals.calls, color: '#6366f1' },
    { label: 'New Candidates', value: totals.candidates, color: '#3b82f6' },
    { label: 'Interviews', value: totals.interviews, color: '#f59e0b' },
    { label: 'Placements', value: totals.placements, color: '#22c55e' },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em' }}>Analytics</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 3 }}>Track your team's performance</p>
        </div>
        <select className="input" value={range} onChange={e => setRange(Number(e.target.value))} style={{ width: 'auto' }}>
          <option value={4}>Last 4 weeks</option>
          <option value={8}>Last 8 weeks</option>
          <option value={12}>Last 12 weeks</option>
          <option value={26}>Last 6 months</option>
        </select>
      </div>

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {stats.map(({ label, value, color }) => (
          <div key={label} className="stat-card" style={{ ['--brand' as any]: color }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>{label}</div>
            <div style={{ fontSize: 30, fontWeight: 700, color, letterSpacing: '-0.02em' }}>{loading ? '—' : value}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>past {range} weeks</div>
          </div>
        ))}
      </div>

      {/* Calls & Interviews chart */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 13, fontWeight: 600, marginBottom: 20 }}>Calls &amp; Interviews per week</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={weeklyData} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="week" tick={{ fill: '#8b8b9e', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#8b8b9e', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Legend wrapperStyle={{ fontSize: 12, color: '#8b8b9e' }} />
            <Bar dataKey="calls" fill="#6366f1" radius={[4, 4, 0, 0]} name="Calls" />
            <Bar dataKey="interviews" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Interviews" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Candidates & Placements chart */}
      <div className="card">
        <h2 style={{ fontSize: 13, fontWeight: 600, marginBottom: 20 }}>Candidates added &amp; Placements</h2>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="week" tick={{ fill: '#8b8b9e', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#8b8b9e', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 12, color: '#8b8b9e' }} />
            <Line type="monotone" dataKey="candidates" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3, fill: '#3b82f6' }} name="New Candidates" />
            <Line type="monotone" dataKey="placements" stroke="#22c55e" strokeWidth={2} dot={{ r: 3, fill: '#22c55e' }} name="Placements" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
