import { FormEvent, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { clientsApi, productsApi, salesApi } from '../api'
import { useAuth } from '../context/AuthContext'

export default function NewSalePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { data: clients } = useQuery({ queryKey: ['clients'], queryFn: () => clientsApi.list() })
  const { data: products } = useQuery({ queryKey: ['products'], queryFn: productsApi.list })

  const [clientSearch, setClientSearch] = useState('')
  const [form, setForm] = useState({
    clientId: '',
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    productId: '',
    saleDate: new Date().toISOString().slice(0, 10),
    pickupDate: '',
    quantity: 1,
    unitPrice: '',
    productionCost: '',
    prePaymentAmount: '0',
    currency: 'RWF',
    paymentMethod: 'MOBILE_MONEY',
    notes: '',
  })
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const createSale = useMutation({
    mutationFn: () =>
      salesApi.create({
        ...form,
        clientEmail: form.clientEmail || undefined,
        prePaymentAmount: form.prePaymentAmount || 0,
        unitPrice: form.unitPrice || productPrice || 0,
        quantity: form.quantity || 1,
      }),
    onSuccess: () => {
      setMessage('Sale recorded')
      navigate('/sales')
      qc.invalidateQueries({ queryKey: ['sales'] })
    },
    onError: (err: any) => setError(err?.response?.data?.message || 'Failed to create sale'),
  })

  const productPrice = useMemo(() => {
    const p = (products ?? []).find((pr: any) => pr.id === form.productId)
    return p ? p.priceAmount : ''
  }, [products, form.productId])

  const totalAmount = useMemo(() => {
    const qty = Number(form.quantity || 0)
    const unit = Number(form.unitPrice || productPrice || 0)
    if (Number.isNaN(qty) || Number.isNaN(unit)) return ''
    return (qty * unit).toFixed(2)
  }, [form.quantity, form.unitPrice, productPrice])

  return (
    <div>
      <div className="header-row">
        <div>
          <h2 style={{ margin: 0 }}>New Sale</h2>
          <p style={{ color: '#64748b' }}>Record a sale with client info and payments</p>
        </div>
      </div>

      {!user && <p style={{ color: '#dc2626' }}>Login required</p>}

      <div className="card">
        <form
          className="card-grid"
          style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', rowGap: '1rem' }}
          onSubmit={(e: FormEvent) => {
            e.preventDefault()
            setMessage(null)
            setError(null)
            if (form.clientPhone && !/^0[0-9]{9}$/.test(form.clientPhone)) {
              setError('Phone must be 10 digits starting with 0')
              return
            }
            if (!form.pickupDate) {
              setError('Pickup date is required')
              return
            }
            createSale.mutate()
          }}
        >
          <div style={{ gridColumn: '1 / -1', display: 'grid', gap: '0.35rem' }}>
            <label style={{ color: '#0f172a', fontWeight: 600 }}>
              Search client <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              className="input"
              list="client-options"
              placeholder="Search existing client by name or phone"
              value={clientSearch}
              onChange={(e) => {
                const value = e.target.value
                setClientSearch(value)
                const match = (clients ?? []).find(
                  (c: any) =>
                    `${c.fullName} (${c.phone})` === value || c.id === value || c.fullName === value || c.phone === value,
                )
                if (match) {
                  setForm({ ...form, clientId: match.id, clientName: match.fullName, clientPhone: match.phone })
                } else {
                  setForm({ ...form, clientId: '', clientName: value || form.clientName, clientPhone: form.clientPhone })
                }
              }}
            />
            <datalist id="client-options">
              {(clients ?? []).map((c: any) => (
                <option key={c.id} value={`${c.fullName} (${c.phone})`} />
              ))}
            </datalist>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
              Select an existing client or keep typing to capture a new client.
            </p>
          </div>
          <div style={{ display: 'grid', gap: '0.35rem' }}>
            <label style={{ color: '#0f172a', fontWeight: 600 }}>
              Client name <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              className="input"
              placeholder="Client name"
              value={form.clientName}
              onChange={(e) => setForm({ ...form, clientName: e.target.value })}
              required
            />
          </div>
          <div style={{ display: 'grid', gap: '0.35rem' }}>
            <label style={{ color: '#0f172a', fontWeight: 600 }}>Client phone (format: 07XXXXXXXX)</label>
            <input
              className="input"
              type="tel"
              pattern="0[0-9]{9}"
              maxLength={10}
              placeholder="07XXXXXXXX"
              value={form.clientPhone}
              onChange={(e) => {
                const digits = e.target.value.replace(/\\D/g, '').slice(0, 10)
                setForm({ ...form, clientPhone: digits })
              }}
              title="Use 10 digits like 0788123456 (must start with 0)"
            />
          </div>
          <div style={{ display: 'grid', gap: '0.35rem' }}>
            <label style={{ color: '#0f172a', fontWeight: 600 }}>Client email (optional)</label>
            <input
              className="input"
              type="email"
              placeholder="client@email.com"
              value={form.clientEmail}
              onChange={(e) => setForm({ ...form, clientEmail: e.target.value })}
            />
          </div>
          <div style={{ display: 'grid', gap: '0.35rem' }}>
            <label style={{ color: '#0f172a', fontWeight: 600 }}>
              Product <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <select
              className="input"
              value={form.productId}
              onChange={(e) => {
                const value = e.target.value
                const selected = (products ?? []).find((p: any) => p.id === value)
                setForm({
                  ...form,
                  productId: value,
                  unitPrice: selected ? selected.priceAmount : form.unitPrice,
                })
              }}
              required
            >
              <option value="">Select product</option>
              {(products ?? []).map((p: any) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
            <Link to="/products" style={{ fontSize: '0.9rem', color: '#2563eb' }}>
              Product missing? Add it first.
            </Link>
          </div>
          <div style={{ display: 'grid', gap: '0.35rem' }}>
            <label style={{ color: '#0f172a', fontWeight: 600 }}>
              Sale date <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              className="input"
              type="date"
              value={form.saleDate}
              onChange={(e) => setForm({ ...form, saleDate: e.target.value })}
              required
            />
          </div>
          <div style={{ display: 'grid', gap: '0.35rem' }}>
            <label style={{ color: '#0f172a', fontWeight: 600 }}>
              Pickup date <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              className="input"
              type="date"
              value={form.pickupDate}
              onChange={(e) => setForm({ ...form, pickupDate: e.target.value })}
              required
            />
          </div>
          <div style={{ display: 'grid', gap: '0.35rem' }}>
            <label style={{ color: '#0f172a', fontWeight: 600 }}>
              Quantity <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              className="input"
              type="number"
              min={1}
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
              required
            />
          </div>
          <div style={{ display: 'grid', gap: '0.35rem' }}>
            <label style={{ color: '#0f172a', fontWeight: 600 }}>
              Unit price <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              className="input"
              type="number"
              min={0}
              placeholder="Unit price"
              value={form.unitPrice || productPrice}
              onChange={(e) => setForm({ ...form, unitPrice: e.target.value })}
              required
            />
          </div>
          <div style={{ display: 'grid', gap: '0.35rem' }}>
            <label style={{ color: '#0f172a', fontWeight: 600 }}>Production cost</label>
            <input
              className="input"
              type="number"
              min={0}
              placeholder="Production cost"
              value={form.productionCost}
              onChange={(e) => setForm({ ...form, productionCost: e.target.value })}
            />
          </div>
          <div style={{ display: 'grid', gap: '0.35rem' }}>
            <label style={{ color: '#0f172a', fontWeight: 600 }}>Pre-payment</label>
            <input
              className="input"
              type="number"
              min={0}
              placeholder="Pre-payment amount"
              value={form.prePaymentAmount}
              onChange={(e) => setForm({ ...form, prePaymentAmount: e.target.value })}
            />
          </div>
          <div style={{ display: 'grid', gap: '0.35rem' }}>
            <label style={{ color: '#0f172a', fontWeight: 600 }}>Total amount</label>
            <input className="input" value={totalAmount} disabled />
          </div>
          <div style={{ display: 'grid', gap: '0.35rem' }}>
            <label style={{ color: '#0f172a', fontWeight: 600 }}>Currency</label>
            <select className="input" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>
              <option value="RWF">RWF</option>
              <option value="USD">USD</option>
            </select>
          </div>
          <div style={{ display: 'grid', gap: '0.35rem' }}>
            <label style={{ color: '#0f172a', fontWeight: 600 }}>Payment method</label>
            <select
              className="input"
              value={form.paymentMethod}
              onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
            >
              <option value="MOBILE_MONEY">MOBILE_MONEY</option>
              <option value="CASH">CASH</option>
              <option value="CARD">CARD</option>
              <option value="BANK_TRANSFER">BANK_TRANSFER</option>
              <option value="OTHER">OTHER</option>
            </select>
          </div>
          <div style={{ gridColumn: '1 / -1', display: 'grid', gap: '0.35rem' }}>
            <label style={{ color: '#0f172a', fontWeight: 600 }}>Notes</label>
            <textarea
              className="input"
              placeholder="Notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
          <button className="button" type="submit" disabled={!user || createSale.isPending}>
            {createSale.isPending ? 'Saving…' : 'Save sale'}
          </button>
        </form>
        {(message || error || createSale.error) && (
          <p style={{ color: message ? '#166534' : '#b91c1c' }}>{message || error || (createSale.error as any)?.message}</p>
        )}
      </div>
    </div>
  )
}
