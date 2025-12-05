import { useQuery } from '@tanstack/react-query'
import { clientsApi } from '../api'
import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function ClientsAdminPage() {
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<'salesCount' | 'totalSalesAmount'>('salesCount')
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['clients', search], queryFn: () => clientsApi.list(search) })
  const formatNumber = (value: any) => {
    const num = Number(value ?? 0)
    if (Number.isNaN(num)) return '--'
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(num)
  }

  const sorted = (data ?? []).slice().sort((a: any, b: any) => {
    const av = Number(a[sortKey] ?? 0)
    const bv = Number(b[sortKey] ?? 0)
    return bv - av
  })

  return (
    <div>
      <div className="header-row">
        <div>
          <h2 style={{ margin: 0 }}>Clients</h2>
          <p style={{ color: '#64748b' }}>Manage customers and their balances</p>
        </div>
        <div style={{ display: 'grid', gap: '0.5rem', gridTemplateColumns: '1fr auto auto', alignItems: 'center', minWidth: 0 }}>
          <input
            className="input"
            placeholder="Search by name/phone/email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && refetch()}
            style={{ width: '100%' }}
          />
          <button className="button" onClick={() => refetch()} style={{ whiteSpace: 'nowrap' }}>
            Search
          </button>
          <select
            className="input"
            style={{ width: '220px' }}
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as any)}
          >
            <option value="salesCount">Sort by # of sales (desc)</option>
            <option value="totalSalesAmount">Sort by total amount (desc)</option>
          </select>
        </div>
      </div>

      {isLoading && <p>Loading…</p>}
      {error && <p style={{ color: '#dc2626' }}>Failed to load clients</p>}

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>WhatsApp</th>
              <th>Sales</th>
              <th>Total Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((c: any) => (
              <tr key={c.id}>
                <td><Link to={`/clients/${c.id}`}>{c.fullName}</Link></td>
                <td>{c.phone}</td>
                <td>{c.email ?? '—'}</td>
                <td>{c.whatsapp ?? '—'}</td>
                <td>{formatNumber(c.salesCount ?? 0)}</td>
                <td>{formatNumber(c.totalSalesAmount ?? 0)}</td>
                <td>
                  <Link to={`/clients/${c.id}`} className="pill">
                    View history
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
