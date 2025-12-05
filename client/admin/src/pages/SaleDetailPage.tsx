import { FormEvent, useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { salesApi } from '../api'

export default function SaleDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [params] = useSearchParams()
  const editingParam = params.get('edit')
  const [editing, setEditing] = useState(editingParam === 'true')
  const qc = useQueryClient()
  const navigate = useNavigate()

  const { data, isLoading, error } = useQuery({
    queryKey: ['sale', id],
    queryFn: () => salesApi.get(id!),
    enabled: !!id,
  })

  const [form, setForm] = useState<any>({})

  const updateMutation = useMutation({
    mutationFn: () => salesApi.update(id!, form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sale', id] })
      qc.invalidateQueries({ queryKey: ['sales'] })
      setEditing(false)
    },
  })

  const formatNumber = (value: any) => {
    const num = Number(value ?? 0)
    if (Number.isNaN(num)) return '--'
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(num)
  }

  const totalAmount = useMemo(() => {
    const qty = Number(form.quantity ?? data?.quantity ?? 0)
    const unit = Number(form.unitPrice ?? data?.unitPrice ?? 0)
    if (Number.isNaN(qty) || Number.isNaN(unit)) return '--'
    return formatNumber(qty * unit)
  }, [form.quantity, form.unitPrice, data])

  if (!id) return <p>Missing sale id</p>
  if (isLoading) return <p>Loading…</p>
  if (error || !data) return <p style={{ color: '#dc2626' }}>Failed to load sale</p>

  const sale = data

  return (
    <div>
      <div className="header-row">
        <div>
          <h2 style={{ margin: 0 }}>Sale detail</h2>
          <p style={{ color: '#64748b' }}>
            {sale.client?.fullName ?? 'Client'} • {sale.product?.title ?? 'Product'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link to="/sales" className="pill">
            Back to sales
          </Link>
          <button className="pill" onClick={() => setEditing((v) => !v)}>
            {editing ? 'Cancel edit' : 'Edit'}
          </button>
        </div>
      </div>

      <div className="card-grid" style={{ marginBottom: '1rem' }}>
        <div className="card">
          <div style={{ color: '#64748b' }}>Total</div>
          <div>{formatNumber(sale.totalAmount)} {sale.currency}</div>
        </div>
        <div className="card">
          <div style={{ color: '#64748b' }}>Paid</div>
          <div>{formatNumber(sale.totalPaid)} {sale.currency}</div>
        </div>
        <div className="card">
          <div style={{ color: '#64748b' }}>Remaining</div>
          <div>{formatNumber(sale.remainingAmount)} {sale.currency}</div>
        </div>
        <div className="card">
          <div style={{ color: '#64748b' }}>Profit</div>
          <div>{formatNumber(sale.profit)} {sale.currency}</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <h3 style={{ marginTop: 0, marginBottom: '0.75rem' }}>Sale info</h3>
        <form
          className="card-grid"
          style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', rowGap: '0.9rem' }}
          onSubmit={(e: FormEvent) => {
            e.preventDefault()
            updateMutation.mutate()
          }}
        >
          <div style={{ display: 'grid', gap: '0.35rem' }}>
            <label>Sale date</label>
            <input
              className="input"
              type="date"
              disabled={!editing}
              defaultValue={sale.saleDate ? new Date(sale.saleDate).toISOString().slice(0, 10) : ''}
              onChange={(e) => setForm({ ...form, saleDate: e.target.value })}
            />
          </div>
          <div style={{ display: 'grid', gap: '0.35rem' }}>
            <label>Pickup date</label>
            <input
              className="input"
              type="date"
              disabled={!editing}
              defaultValue={sale.pickupDate ? new Date(sale.pickupDate).toISOString().slice(0, 10) : ''}
              onChange={(e) => setForm({ ...form, pickupDate: e.target.value })}
            />
          </div>
          <div style={{ display: 'grid', gap: '0.35rem' }}>
            <label>Quantity</label>
            <input
              className="input"
              type="number"
              min={1}
              disabled={!editing}
              defaultValue={Number(sale.quantity)}
              onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
            />
          </div>
          <div style={{ display: 'grid', gap: '0.35rem' }}>
            <label>Unit price</label>
            <input
              className="input"
              type="number"
              min={0}
              disabled={!editing}
              defaultValue={Number(sale.unitPrice)}
              onChange={(e) => setForm({ ...form, unitPrice: Number(e.target.value) })}
            />
          </div>
          <div style={{ display: 'grid', gap: '0.35rem' }}>
            <label>Production cost</label>
            <input
              className="input"
              type="number"
              min={0}
              disabled={!editing}
              defaultValue={sale.productionCost ? Number(sale.productionCost) : ''}
              onChange={(e) => setForm({ ...form, productionCost: Number(e.target.value) })}
            />
          </div>
          <div style={{ display: 'grid', gap: '0.35rem' }}>
            <label>Total (calculated)</label>
            <input className="input" disabled value={totalAmount} />
          </div>
          <div style={{ gridColumn: '1 / -1', display: 'grid', gap: '0.35rem' }}>
            <label>Notes</label>
            <textarea
              className="input"
              disabled={!editing}
              defaultValue={sale.notes ?? ''}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
          {editing && (
            <button className="button" type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Saving…' : 'Save changes'}
            </button>
          )}
        </form>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0, marginBottom: '0.75rem' }}>Payments</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            {(sale.payments ?? []).map((p: any) => (
              <tr key={p.id}>
                <td>{new Date(p.paidAt).toLocaleDateString()}</td>
                <td>{formatNumber(p.amount)} {p.currency}</td>
                <td>{p.paymentMethod}</td>
                <td>{p.note ?? ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
