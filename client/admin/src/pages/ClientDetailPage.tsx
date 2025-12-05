import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { clientsApi } from '../api'

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading, error } = useQuery({
    queryKey: ['client', id],
    queryFn: () => clientsApi.get(id!),
    enabled: !!id,
  })

  const formatNumber = (value: any) => {
    const num = Number(value ?? 0)
    if (Number.isNaN(num)) return '--'
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(num)
  }

  if (!id) return <p>Missing client id</p>
  if (isLoading) return <p>Loading…</p>
  if (error) return <p style={{ color: '#dc2626' }}>Failed to load client</p>
  if (!data) return <p>Not found</p>

  return (
    <div>
      <div className="header-row">
        <div>
          <h2 style={{ margin: 0 }}>{data.fullName}</h2>
          <p style={{ color: '#64748b' }}>{data.phone}</p>
        </div>
        <Link to="/clients" className="pill">
          Back to clients
        </Link>
      </div>

      <div className="card-grid" style={{ marginBottom: '1rem' }}>
        <div className="card">
          <div style={{ color: '#64748b' }}>Email</div>
          <div>{data.email ?? '—'}</div>
        </div>
        <div className="card">
          <div style={{ color: '#64748b' }}>WhatsApp</div>
          <div>{data.whatsapp ?? '—'}</div>
        </div>
        <div className="card">
          <div style={{ color: '#64748b' }}>Total sales</div>
          <div>{formatNumber(data.totalSales ?? data.sales?.length ?? 0)}</div>
        </div>
        <div className="card">
          <div style={{ color: '#64748b' }}>Outstanding</div>
          <div>{formatNumber(data.outstanding ?? 0)}</div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Sales history</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Product</th>
              <th>Total</th>
              <th>Paid</th>
              <th>Remaining</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {(data.sales ?? []).map((s: any) => (
              <tr key={s.id}>
                <td>{new Date(s.saleDate).toLocaleDateString()}</td>
                <td>{s.product?.title ?? '—'}</td>
                <td>{formatNumber(s.totalAmount)}</td>
                <td>{formatNumber(s.totalPaid)}</td>
                <td>{formatNumber(s.remainingAmount)}</td>
                <td>
                  <span className="badge">{s.paymentStatus}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
