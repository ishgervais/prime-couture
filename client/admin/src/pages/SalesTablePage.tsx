import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { salesApi } from '../api'

export default function SalesTablePage() {
  const { data, isLoading, error } = useQuery({ queryKey: ['sales'], queryFn: () => salesApi.list() })
  const [visibleCols, setVisibleCols] = useState<Record<string, boolean>>({
    date: true,
    pickup: true,
    client: true,
    product: true,
    qty: true,
    unit: true,
    total: true,
    prepay: true,
    remaining: true,
    production: false,
    profit: true,
    paymentMethod: false,
    status: true,
    notes: false,
  })
  const [openColumns, setOpenColumns] = useState(false)
  const dropdownRef = useRef<HTMLDivElement | null>(null)
  const now = useMemo(() => new Date(), [])
  const [yearFilter, setYearFilter] = useState<string>(String(now.getFullYear()))
  const [monthFilter, setMonthFilter] = useState<string>(String(now.getMonth() + 1)) // 1-12 as string

  const formatNumber = (value: any) => {
    const num = Number(value ?? 0)
    if (Number.isNaN(num)) return '--'
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(num)
  }

  const exportCsv = () => {
    if (!filteredSales.length) return
    const headers = [
      'Date',
      'Pickup',
      'Client',
      'Product',
      'Qty',
      'Unit Price',
      'Total',
      'Prepay',
      'Remaining',
      'Production',
      'Profit',
      'Payment Method',
      'Status',
      'Notes',
    ]
    const rows = filteredSales.map((s: any) => [
      new Date(s.saleDate).toISOString(),
      s.pickupDate ? new Date(s.pickupDate).toISOString() : '',
      s.client?.fullName ?? '',
      s.product?.title ?? '',
      s.quantity,
      s.unitPrice,
      s.totalAmount,
      s.prePaymentAmount,
      s.remainingAmount,
      s.productionCost ?? '',
      s.profit,
      s.paymentMethod,
      s.paymentStatus,
      s.notes ?? '',
    ])
    const csv = [headers, ...rows]
      .map((r) =>
        r
          .map((cell) => {
            if (cell === null || cell === undefined) return ''
            const val = String(cell).replace(/"/g, '""')
            if (/[",\n]/.test(val)) return `"${val}"`
            return val
          })
          .join(','),
      )
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sales-${yearFilter}-${monthFilter}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const years = useMemo(() => {
    const set = new Set<string>()
    if (data) {
      data.forEach((sale: any) => {
        const y = new Date(sale.saleDate).getFullYear()
        set.add(String(y))
      })
    }
    set.add(String(now.getFullYear()))
    return ['all', ...Array.from(set).sort((a, b) => Number(b) - Number(a))]
  }, [data, now])

  // Ensure current selection exists even before data loads
  useEffect(() => {
    if (!years.includes(yearFilter)) {
      setYearFilter(years[0] ?? 'all')
    }
  }, [years, yearFilter])

  const filteredSales = useMemo(() => {
    if (!data) return []
    return data.filter((sale: any) => {
      const d = new Date(sale.saleDate)
      const y = d.getFullYear()
      const m = d.getMonth() + 1
      const yearOk = yearFilter === 'all' ? true : y === Number(yearFilter)
      const monthOk = monthFilter === 'all' ? true : m === Number(monthFilter)
      return yearOk && monthOk
    })
  }, [data, yearFilter, monthFilter])

  const totals = useMemo(() => {
    return filteredSales.reduce(
      (acc: any, s: any) => {
        acc.total += Number(s.totalAmount ?? 0)
        acc.paid += Number(s.totalPaid ?? 0)
        acc.remaining += Number(s.remainingAmount ?? 0)
        acc.profit += Number(s.profit ?? 0)
        return acc
      },
      { total: 0, paid: 0, remaining: 0, profit: 0 },
    )
  }, [filteredSales])

  const cards = useMemo(
    () => [
      { label: 'Total Sales', value: formatNumber(totals.total) },
      { label: 'Total Paid', value: formatNumber(totals.paid) },
      { label: 'Outstanding', value: formatNumber(totals.remaining) },
      { label: 'Profit', value: formatNumber(totals.profit) },
    ],
    [totals],
  )

  const maxRemaining = useMemo(() => Math.max(...filteredSales.map((s: any) => Number(s.remainingAmount ?? 0)), 0), [filteredSales])
  const maxTotal = useMemo(() => Math.max(...filteredSales.map((s: any) => Number(s.totalAmount ?? 0)), 0), [filteredSales])

  const heatColor = (value: number, max: number, palette: 'red' | 'green') => {
    if (!max || max === 0) return {}
    const ratio = Math.min(Math.max(value / max, 0), 1)
    if (palette === 'red') {
      const bg = `rgba(248, 113, 113, ${0.15 + ratio * 0.45})` // light to denser red
      const color = ratio > 0.6 ? '#7f1d1d' : '#991b1b'
      return { background: bg, color }
    }
    const bg = `rgba(74, 222, 128, ${0.12 + ratio * 0.35})` // light to denser green
    const color = ratio > 0.6 ? '#065f46' : '#166534'
    return { background: bg, color }
  }

  const rowStyle = (status: string) => {
    if (status === 'FULL') return {}
    return { background: '#fff7e6' }
  }

  return (
    <div>
      <div className="header-row">
        <div>
          <h2 style={{ margin: 0 }}>Sales</h2>
          <p style={{ color: '#64748b' }}>Track sales, payments, and outstanding balances</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link to="/sales/new" className="button" style={{ padding: '0.65rem 1rem', textDecoration: 'none', color: '#fff' }}>
            + New Sale
          </Link>
        </div>
      </div>

      <div className="card-grid" style={{ marginBottom: '1rem' }}>
        {cards.map((c) => (
          <div className="card" key={c.label}>
            <div style={{ color: '#64748b', fontSize: '0.9rem' }}>{c.label}</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>{c.value}</div>
          </div>
        ))}
      </div>

      {isLoading && <p>Loading…</p>}
      {error && <p style={{ color: '#dc2626' }}>Failed to load sales</p>}

      <div className="card" style={{ fontSize: '0.92rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'grid', gap: '0.25rem' }}>
            <label style={{ color: '#0f172a', fontWeight: 600 }}>Year</label>
            <select className="input" value={yearFilter} onChange={(e) => setYearFilter(e.target.value)}>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y === 'all' ? 'All years' : y}
                </option>
              ))}
            </select>
          </div>
          <div style={{ display: 'grid', gap: '0.25rem' }}>
            <label style={{ color: '#0f172a', fontWeight: 600 }}>Month</label>
            <select className="input" value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)}>
              <option value="all">All months</option>
              {[
                ['1', 'Jan'],
                ['2', 'Feb'],
                ['3', 'Mar'],
                ['4', 'Apr'],
                ['5', 'May'],
                ['6', 'Jun'],
                ['7', 'Jul'],
                ['8', 'Aug'],
                ['9', 'Sep'],
                ['10', 'Oct'],
                ['11', 'Nov'],
                ['12', 'Dec'],
              ].map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <button type="button" className="pill" onClick={exportCsv} style={{ marginTop: '1.25rem' }}>
            Export CSV
          </button>
        </div>
        <div
          style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.75rem', position: 'relative' }}
          tabIndex={0}
          onBlur={(e) => {
            if (dropdownRef.current && e.relatedTarget && dropdownRef.current.contains(e.relatedTarget as Node)) return
            setOpenColumns(false)
          }}
        >
          <button
            type="button"
            className="pill"
            onClick={() => setOpenColumns((v) => !v)}
            style={{ cursor: 'pointer' }}
          >
            Columns ▾
          </button>
          {openColumns && (
            <div
              ref={dropdownRef}
              style={{
                position: 'absolute',
                right: 0,
                top: '2.5rem',
                background: '#fff',
                boxShadow: '0 10px 30px rgba(15,23,42,0.15)',
                borderRadius: '8px',
                padding: '0.75rem',
                zIndex: 10,
                minWidth: '220px',
                display: 'grid',
                gap: '0.5rem',
              }}
              tabIndex={-1}
            >
              {[
                ['date', 'Date'],
                ['pickup', 'Pickup'],
                ['client', 'Client'],
                ['product', 'Product'],
                ['qty', 'Quantity'],
                ['unit', 'Unit price'],
                ['total', 'Total'],
                ['prepay', 'Prepay'],
                ['remaining', 'Remaining'],
                ['production', 'Production cost'],
                ['profit', 'Profit'],
                ['paymentMethod', 'Payment method'],
                ['status', 'Status'],
                ['notes', 'Notes'],
              ].map(([key, label]) => (
                <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={visibleCols[key]}
                    onChange={(e) => setVisibleCols((v) => ({ ...v, [key]: e.target.checked }))}
                  />
                  {label}
                </label>
              ))}
            </div>
          )}
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              {visibleCols.date && <th>Date</th>}
              {visibleCols.pickup && <th>Pickup</th>}
              {visibleCols.client && <th>Client</th>}
              {visibleCols.product && <th>Product</th>}
              {visibleCols.qty && <th>Qty</th>}
              {visibleCols.unit && <th>Unit</th>}
              {visibleCols.total && <th>Total</th>}
              {visibleCols.prepay && <th>Prepay</th>}
              {visibleCols.remaining && <th>Remaining</th>}
              {visibleCols.production && <th>Production</th>}
              {visibleCols.profit && <th>Profit</th>}
              {visibleCols.paymentMethod && <th>Payment Method</th>}
              {visibleCols.status && <th>Status</th>}
              {visibleCols.notes && <th>Notes</th>}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSales.map((sale: any, idx: number) => {
              const date = new Date(sale.saleDate).toLocaleDateString()
              const pickup = sale.pickupDate ? new Date(sale.pickupDate).toLocaleDateString() : '—'
              return (
                <tr key={sale.id} style={rowStyle(sale.paymentStatus)}>
                  <td>{idx + 1}</td>
                  {visibleCols.date && <td>{date}</td>}
                  {visibleCols.pickup && <td>{pickup}</td>}
                  {visibleCols.client && (
                    <td>{sale.client ? <Link to={`/clients/${sale.clientId}`}>{sale.client.fullName}</Link> : '—'}</td>
                  )}
                  {visibleCols.product && <td>{sale.product?.title ?? '—'}</td>}
                  {visibleCols.qty && <td>{formatNumber(sale.quantity)}</td>}
                  {visibleCols.unit && (
                    <td>
                      {formatNumber(sale.unitPrice)} {sale.currency}
                    </td>
                  )}
                  {visibleCols.total && (
                    <td style={heatColor(Number(sale.totalAmount ?? 0), maxTotal, 'green')}>
                      {formatNumber(sale.totalAmount)} {sale.currency}
                    </td>
                  )}
                  {visibleCols.prepay && (
                    <td>
                      {formatNumber(sale.prePaymentAmount)} {sale.currency}
                    </td>
                  )}
                  {visibleCols.remaining && (
                    <td style={heatColor(Number(sale.remainingAmount ?? 0), maxRemaining, 'red')}>
                      {formatNumber(sale.remainingAmount)} {sale.currency}
                    </td>
                  )}
                  {visibleCols.production && <td>{sale.productionCost ? formatNumber(sale.productionCost) : '-'}</td>}
                  {visibleCols.profit && <td>{formatNumber(sale.profit)}</td>}
                  {visibleCols.paymentMethod && <td>{sale.paymentMethod}</td>}
                  {visibleCols.status && (
                    <td>
                      <span className="badge">{sale.paymentStatus}</span>
                    </td>
                  )}
                  {visibleCols.notes && <td>{sale.notes ?? ''}</td>}
                  <td style={{ whiteSpace: 'nowrap', display: 'flex', gap: '0.35rem' }}>
                    <Link to={`/sales/${sale.id}`} className="pill">
                      View
                    </Link>
                    <Link to={`/sales/${sale.id}?edit=true`} className="pill">
                      Edit
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
