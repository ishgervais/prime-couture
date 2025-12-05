import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { dashboardApi, salesApi } from '../api'

export default function DashboardPage() {
  const { data, isLoading, error } = useQuery({ queryKey: ['dashboard-kpis'], queryFn: dashboardApi.kpis })
  const [year, setYear] = useState<string>('current')
  const { data: monthly, isLoading: loadingMonthly } = useQuery({
    queryKey: ['sales-monthly', year],
    queryFn: () => salesApi.monthlyStats(year === 'all' ? 'all' : year === 'current' ? new Date().getFullYear().toString() : year),
  })

  const cards = [
    { label: 'Products', value: data?.products ?? '--' },
    { label: 'Orders', value: data?.orders ?? '--' },
    { label: 'New Orders', value: data?.newOrders ?? '--' },
    { label: 'Pageviews (7d)', value: data?.pageviews7d ?? '--' },
  ]

  const months = useMemo(() => monthly?.months ?? [], [monthly])
  const availableYears = useMemo(() => ['current', 'all', ...(monthly?.availableYears ?? [])], [monthly])
  const maxValue = useMemo(() => Math.max(...months.map((m: any) => Number(m.total ?? 0)), 0), [months])

  return (
    <div>
      <div className="header-row">
        <div>
          <h2 style={{ margin: 0 }}>Dashboard</h2>
          <p style={{ color: '#64748b' }}>Quick overview of store activity</p>
        </div>
      </div>

      {isLoading && <p>Loading…</p>}
      {error && <p style={{ color: '#dc2626' }}>Failed to load</p>}

      <div className="card-grid">
        {cards.map((card) => (
          <div className="card" key={card.label}>
            <div style={{ color: '#64748b', fontSize: '0.9rem' }}>{card.label}</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>{card.value}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <div>
            <h3 style={{ margin: 0 }}>Sales by month</h3>
            <p style={{ margin: 0, color: '#64748b' }}>Bar chart of monthly totals</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <label style={{ fontWeight: 600, color: '#0f172a' }}>Year</label>
            <select className="input" style={{ width: '140px' }} value={year} onChange={(e) => setYear(e.target.value)}>
              {availableYears.map((y) => (
                <option key={y} value={y}>
                  {y === 'current' ? `Current (${new Date().getFullYear()})` : y === 'all' ? 'All years' : y}
                </option>
              ))}
            </select>
          </div>
        </div>
        {loadingMonthly && <p>Loading chart…</p>}
        {!loadingMonthly && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, minmax(0,1fr))', gap: '0.5rem', alignItems: 'end' }}>
            {months.map((m: any) => {
              const height = maxValue ? Math.max((Number(m.total ?? 0) / maxValue) * 160, 4) : 4
              return (
                <div key={m.month} style={{ textAlign: 'center', fontSize: '0.85rem' }}>
                  <div
                    style={{
                      height: `${height}px`,
                      background: '#0f172a',
                      borderRadius: '6px',
                      transition: 'height 0.2s ease',
                    }}
                    title={`${m.total} total`}
                  ></div>
                  <div style={{ marginTop: '0.35rem', color: '#64748b' }}>{['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][m.month - 1]}</div>
                  <div style={{ color: '#0f172a', fontWeight: 600 }}>{Number(m.total ?? 0).toLocaleString()}</div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
