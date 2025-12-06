import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ordersApi } from '../api'
import TablePager from '../components/TablePager'

export default function OrdersPage() {
  const { data, isLoading, error } = useQuery({ queryKey: ['orders'], queryFn: ordersApi.list })
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return (data ?? []).filter((o: any) => {
      if (!q) return true
      return (
        o.product?.title?.toLowerCase().includes(q) ||
        o.customerName?.toLowerCase().includes(q) ||
        o.customerPhone?.toLowerCase().includes(q)
      )
    })
  }, [data, search])

  const total = filtered.length
  const paged = filtered.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize)
  const pager = (
    <TablePager
      page={page}
      pageSize={pageSize}
      total={total}
      onPageChange={setPage}
      onPageSizeChange={(n) => {
        setPageSize(n)
        setPage(1)
      }}
    />
  )

  return (
    <div>
      <div className="header-row">
        <div>
          <h2 style={{ margin: 0 }}>Orders</h2>
          <p style={{ color: '#64748b' }}>Track customer orders and statuses</p>
        </div>
      </div>

      {isLoading && <p>Loading…</p>}
      {error && <p style={{ color: '#dc2626' }}>Failed to load orders</p>}

      <div className="card">
        <div className="pager-row" style={{ justifyContent: 'flex-start' }}>
          <input
            className="input"
            placeholder="Search by product or customer"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            style={{ maxWidth: 260 }}
          />
        </div>
        {pager}
        <table className="table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Customer</th>
              <th>Qty</th>
              <th>Status</th>
              <th>Placed</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((order: any) => (
              <tr key={order.id}>
                <td>{order.product?.title ?? order.productId}</td>
                <td>
                  <div>{order.customerName}</div>
                  <div style={{ color: '#64748b', fontSize: '0.85rem' }}>{order.customerPhone}</div>
                </td>
                <td>{order.quantity}</td>
                <td>
                  <span className="badge">{order.status}</span>
                </td>
                <td>{new Date(order.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {pager}
      </div>
    </div>
  )
}
