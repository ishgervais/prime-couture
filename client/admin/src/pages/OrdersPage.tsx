import { useQuery } from '@tanstack/react-query'
import { ordersApi } from '../api'

export default function OrdersPage() {
  const { data, isLoading, error } = useQuery({ queryKey: ['orders'], queryFn: ordersApi.list })

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
            {(data ?? []).map((order: any) => (
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
      </div>
    </div>
  )
}
