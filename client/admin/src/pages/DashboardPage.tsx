import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { dashboardApi, salesApi } from '../api'
import {
  Package,
  ShoppingCart,
  Sparkles,
  Eye,
  DollarSign,
  Clock3,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react'

export default function DashboardPage() {
  const [year, setYear] = useState<string>('current')

  const { data, isLoading, error } = useQuery({ queryKey: ['dashboard-kpis'], queryFn: dashboardApi.kpis })
  const { data: monthly, isLoading: loadingMonthly } = useQuery({
    queryKey: ['sales-monthly', year],
    queryFn: () => salesApi.monthlyStats(year === 'all' ? 'all' : year === 'current' ? new Date().getFullYear().toString() : year),
  })
  const { data: salesSummary } = useQuery({
    queryKey: ['sales-summary-dashboard', year],
    queryFn: () => salesApi.summary(year === 'all' ? undefined : year === 'current' ? new Date().getFullYear().toString() : year),
  })

  const opsCards = [
    { label: 'Products', value: data?.products ?? '--', accent: '#0ea5e9', Icon: Package },
    { label: 'Orders', value: data?.orders ?? '--', accent: '#a855f7', Icon: ShoppingCart },
    { label: 'New Orders', value: data?.newOrders ?? '--', accent: '#f59e0b', Icon: Sparkles },
    { label: 'Pageviews (7d)', value: data?.pageviews7d ?? '--', accent: '#06b6d4', Icon: Eye },
  ]
  const financeCards = [
    { label: 'Sales (RWF)', value: salesSummary ? Math.round(salesSummary.totalSalesAmount).toLocaleString() : '--', accent: '#22c55e', Icon: DollarSign },
    { label: 'Outstanding (RWF)', value: salesSummary ? Math.round(salesSummary.totalOutstandingAmount).toLocaleString() : '--', accent: '#ef4444', Icon: Clock3 },
    { label: 'Paid (RWF)', value: salesSummary ? Math.round(salesSummary.totalPaidAmount).toLocaleString() : '--', accent: '#2563eb', Icon: CheckCircle2 },
    { label: 'Profit (RWF)', value: salesSummary ? Math.round(salesSummary.totalProfit).toLocaleString() : '--', accent: '#8b5cf6', Icon: TrendingUp },
  ]

  const months = useMemo(() => monthly?.months ?? [], [monthly])
  const availableYears = useMemo(() => ['current', 'all', ...(monthly?.availableYears ?? [])], [monthly])
  const maxValue = useMemo(() => Math.max(...months.map((m: any) => Number(m.total ?? 0)), 0), [months])
  const topMonths = useMemo(
    () =>
      [...months]
        .sort((a: any, b: any) => Number(b.total ?? 0) - Number(a.total ?? 0))
        .slice(0, 3)
        .map((m: any) => ({
          label: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][m.month - 1],
          total: Number(m.total ?? 0),
          profit: Number(m.profit ?? 0),
        })),
    [months],
  )
  const lowMonths = useMemo(
    () =>
      [...months]
        .sort((a: any, b: any) => Number(a.total ?? 0) - Number(b.total ?? 0))
        .slice(0, 3)
        .map((m: any) => ({
          label: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][m.month - 1],
          total: Number(m.total ?? 0),
          profit: Number(m.profit ?? 0),
        })),
    [months],
  )

  const chip = (color: string) => (
    <span
      style={{
        display: 'inline-block',
        width: 28,
        height: 28,
        borderRadius: '50%',
        background: color,
      }}
    />
  )
  const iconBubble = (accent: string, Icon: React.ComponentType<{ size?: number; color?: string }>) => (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 28,
        height: 28,
        borderRadius: '50%',
        background: accent,
        color: '#0f172a',
      }}
    >
      <Icon size={16} color="#0f172a" />
    </span>
  )

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

      <div className="card-grid" style={{ marginBottom: '1rem' }}>
        {opsCards.map((card) => (
          <div className="card" key={card.label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ color: '#64748b', fontSize: '0.9rem' }}>{card.label}</div>
              {iconBubble(`${card.accent}33`, card.Icon)}
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, marginTop: '0.25rem' }}>{card.value}</div>
          </div>
        ))}
      </div>

      <div className="card-grid" style={{ marginBottom: '1rem' }}>
        {financeCards.map((card) => (
          <div className="card" key={card.label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ color: '#64748b', fontSize: '0.9rem' }}>{card.label}</div>
              {iconBubble(`${card.accent}33`, card.Icon)}
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, marginTop: '0.25rem' }}>{card.value}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div>
            <h3 style={{ margin: 0 }}>Sales by month</h3>
            <p style={{ margin: 0, color: '#64748b' }}>Bar chart of monthly totals</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
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

      <div className="card" style={{ marginTop: '1rem' }}>
        <h3 style={{ marginTop: 0 }}>Highlights</h3>
        <div className="card-grid">
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b' }}>
              {chip('#e0f2fe')}
              <span>Avg sale (RWF)</span>
            </div>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, marginTop: '0.35rem' }}>
              {salesSummary?.totalSalesAmount && salesSummary?.totalPaidAmount
              ? Math.round(salesSummary.totalSalesAmount / Math.max(1, months.reduce((sum: number, m: any) => sum + (m.total > 0 ? 1 : 0), 0))).toLocaleString()
              : '--'}
            </div>
          </div>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b' }}>
              {chip('#dcfce7')}
              <span>Top months</span>
            </div>
            {topMonths.map((m) => (
              <div key={m.label} style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.35rem' }}>
                <span>{m.label}</span>
                <span style={{ fontWeight: 600 }}>{m.total.toLocaleString()}</span>
              </div>
            ))}
            <div style={{ marginTop: '0.5rem', color: '#94a3b8', fontWeight: 600 }}>Lowest months</div>
            {lowMonths.map((m) => (
              <div key={`low-${m.label}`} style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                <span>{m.label}</span>
                <span style={{ fontWeight: 500, color: '#ef4444' }}>{m.total.toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b' }}>
              {chip('#ffedd5')}
              <span>Outstanding vs Paid</span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <span className="badge" style={{ background: '#fee2e2', color: '#b91c1c' }}>
                Outstanding {salesSummary ? salesSummary.totalOutstandingAmount.toLocaleString() : '--'}
              </span>
              <span className="badge" style={{ background: '#dcfce7', color: '#166534' }}>
                Paid {salesSummary ? salesSummary.totalPaidAmount.toLocaleString() : '--'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
