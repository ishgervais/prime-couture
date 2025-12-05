import { useQuery } from '@tanstack/react-query'
import api from '../api'

export default function AnalyticsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['analytics-summary'],
    queryFn: async () => {
      const res = await api.get('/analytics/summary')
      return res.data
    },
  })

  return (
    <div>
      <div className="header-row">
        <div>
          <h2 style={{ margin: 0 }}>Analytics</h2>
          <p style={{ color: '#64748b' }}>Pageview summaries</p>
        </div>
      </div>

      {isLoading && <p>Loading…</p>}
      {error && <p style={{ color: '#dc2626' }}>Failed to load analytics</p>}

      {data && (
        <div className="card-grid">
          <div className="card">
            <div style={{ color: '#64748b' }}>Total pageviews</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>{data.total ?? '--'}</div>
          </div>
          <div className="card">
            <div style={{ color: '#64748b' }}>Top paths</div>
            <ul style={{ paddingLeft: '1rem', margin: 0 }}>
              {(data.topPaths ?? []).map((p: any) => (
                <li key={p.path}>
                  {p.path} — {p.views}
                </li>
              ))}
            </ul>
          </div>
          <div className="card">
            <div style={{ color: '#64748b' }}>Trend (last 30d)</div>
            <ul style={{ paddingLeft: '1rem', margin: 0, maxHeight: '200px', overflow: 'auto' }}>
              {(data.trend ?? []).map((t: any) => (
                <li key={t.date}>
                  {t.date}: {t.views}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
