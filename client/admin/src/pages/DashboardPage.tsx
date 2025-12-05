import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '../api'

export default function DashboardPage() {
  const { data, isLoading, error } = useQuery({ queryKey: ['dashboard-kpis'], queryFn: dashboardApi.kpis })

  const cards = [
    { label: 'Products', value: data?.products ?? '--' },
    { label: 'Orders', value: data?.orders ?? '--' },
    { label: 'New Orders', value: data?.newOrders ?? '--' },
    { label: 'Pageviews (7d)', value: data?.pageviews7d ?? '--' },
  ]

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
    </div>
  )
}
