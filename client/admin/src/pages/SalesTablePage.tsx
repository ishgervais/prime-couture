import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { salesApi } from '../api'
import TablePager from '../components/TablePager'

export default function SalesTablePage() {
  const qc = useQueryClient()
  const now = useMemo(() => new Date(), [])
  const [yearFilter, setYearFilter] = useState<string>(String(now.getFullYear()))
  const [monthFilter, setMonthFilter] = useState<string>(String(now.getMonth() + 1)) // 1-12 as string
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all')
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [importing, setImporting] = useState(false)
  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ['sales', yearFilter, monthFilter, paymentStatusFilter, paymentMethodFilter, search, page, pageSize],
    queryFn: () => {
      const params: any = {}
      const yearNum = yearFilter !== 'all' ? Number(yearFilter) : null
      const monthNum = monthFilter !== 'all' ? Number(monthFilter) : null
      if (yearNum) {
        if (monthNum) {
          const from = new Date(yearNum, monthNum - 1, 1)
          const to = new Date(yearNum, monthNum, 0)
          params.from = from.toISOString().slice(0, 10)
          params.to = to.toISOString().slice(0, 10)
        } else {
          params.from = `${yearNum}-01-01`
          params.to = `${yearNum}-12-31`
        }
      } else if (monthNum) {
        const y = now.getFullYear()
        const from = new Date(y, monthNum - 1, 1)
        const to = new Date(y, monthNum, 0)
        params.from = from.toISOString().slice(0, 10)
        params.to = to.toISOString().slice(0, 10)
      }
      if (paymentStatusFilter !== 'all') params.paymentStatus = paymentStatusFilter
      if (paymentMethodFilter !== 'all') params.paymentMethod = paymentMethodFilter
      if (search.trim()) params.search = search.trim()
      params.page = page
      params.pageSize = pageSize
      return salesApi.list(params)
    },
    keepPreviousData: true,
  })
  const items = data?.items ?? []
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

  const parseCsv = async (file: File) => {
    const text = await file.text()
    const lines = text.trim().split(/\r?\n/)
    if (!lines.length) return []
    const header = lines[0].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map((h) => h.replace(/"/g, '').trim())
    return lines.slice(1).map((line) => {
      const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map((c) => c.replace(/^"|"$/g, '').trim())
      const row: any = {}
      header.forEach((key, idx) => {
        const normalized = key.toLowerCase().replace(/\s+/g, '')
        const val = cols[idx]
        if (row[normalized] && (!val || val.length === 0)) return
        row[normalized] = val
      })
      return {
        date: row['date'],
        pickupDate: row['pickupdate'],
        customerName: row['customername'],
        product: row['product'],
        productType: row['producttype'],
        qty: row['qty'] || row['quantity'],
        unitPrice: row['unitprice'],
        total: row['total'] || row['totalamount'],
        prePayment: row['pre-payment'] || row['prepayment'] || row['prepaymentamount'],
        remainingAmount: row['remainingamount'],
        productionCost: row['productioncost'],
        profit: row['profit'],
        paymentMethod: row['paymentmethod'],
        status: row['status'],
        notes: row['notes'],
      }
    })
  }

  const handleImport = async (file?: File | null) => {
    if (!file) return
    setImporting(true)
    try {
      const rows = await parseCsv(file)
      const result = await salesApi.importRows(rows)
      window.alert(`Import done: ${result.created ?? rows.length} created${result.errors?.length ? `, ${result.errors.length} errors` : ''}`)
      qc.invalidateQueries({ queryKey: ['sales'] })
    } catch (err: any) {
      window.alert(err?.message || 'Failed to import CSV')
    } finally {
      setImporting(false)
    }
  }

  const years = useMemo(() => {
    const set = new Set<string>()
    if (items) {
      items.forEach((sale: any) => {
        const y = new Date(sale.saleDate).getFullYear()
        set.add(String(y))
      })
    }
    set.add(String(now.getFullYear()))
    return ['all', ...Array.from(set).sort((a, b) => Number(b) - Number(a))]
  }, [items, now])

  // Ensure current selection exists even before data loads
  useEffect(() => {
    if (!years.includes(yearFilter)) {
      setYearFilter(years[0] ?? 'all')
    }
  }, [years, yearFilter])

  const filteredSales = items
  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  const pager = (
    <TablePager
      page={page}
      pageSize={pageSize}
      total={total}
      onPageChange={(p) => setPage(p)}
      onPageSizeChange={(n) => {
        setPageSize(n)
        setPage(1)
      }}
    />
  )

  // debounce search input
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 300)
    return () => clearTimeout(t)
  }, [searchInput])

  useEffect(() => {
    setPage(1)
  }, [yearFilter, monthFilter, paymentStatusFilter, paymentMethodFilter, search])

  const agg = data?.aggregates || {}
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
      { label: 'Total Sales', value: formatNumber(agg.totalAmount ?? totals.total) },
      { label: 'Total Paid', value: formatNumber(agg.totalPaid ?? totals.paid) },
      { label: 'Outstanding', value: formatNumber(agg.remainingAmount ?? totals.remaining) },
      { label: 'Profit', value: formatNumber(agg.profit ?? totals.profit) },
    ],
    [agg.totalAmount, agg.totalPaid, agg.remainingAmount, agg.profit, totals],
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
          <div style={{ display: 'grid', gap: '0.25rem' }}>
            <label style={{ color: '#0f172a', fontWeight: 600 }}>Status</label>
            <select className="input" value={paymentStatusFilter} onChange={(e) => setPaymentStatusFilter(e.target.value)}>
              <option value="all">All</option>
              <option value="FULL">Full</option>
              <option value="PARTIAL">Partial</option>
              <option value="NONE">None</option>
            </select>
          </div>
          <div style={{ display: 'grid', gap: '0.25rem' }}>
            <label style={{ color: '#0f172a', fontWeight: 600 }}>Payment</label>
            <select className="input" value={paymentMethodFilter} onChange={(e) => setPaymentMethodFilter(e.target.value)}>
              <option value="all">All</option>
              <option value="MOBILE_MONEY">Mobile money</option>
              <option value="CASH">Cash</option>
              <option value="CARD">Card</option>
              <option value="BANK_TRANSFER">Bank transfer</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div style={{ display: 'grid', gap: '0.25rem', flex: 1, minWidth: '160px' }}>
            <label style={{ color: '#0f172a', fontWeight: 600 }}>Search (client/product)</label>
            <input
              className="input"
              placeholder="Type to filter"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <button type="button" className="pill" onClick={exportCsv} style={{ marginTop: '1.25rem' }}>
            Export CSV
          </button>
          <label className="pill" style={{ marginTop: '1.25rem', cursor: 'pointer', display: 'inline-flex', gap: '0.4rem' }}>
            Import CSV
            <input
              type="file"
              accept=".csv"
              style={{ display: 'none' }}
              onChange={(e) => handleImport(e.target.files?.[0])}
              disabled={importing}
            />
          </label>
        </div>
        {pager}
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
            {((isLoading && (!data || !data.items?.length)) ? Array.from({ length: 10 }) : filteredSales).map((sale: any, idx: number) => {
              if (isLoading && (!data || !data.items?.length)) {
                return (
                  <tr key={`skeleton-${idx}`}>
                    <td className="skeleton" style={{ height: '32px' }} colSpan={visibleCols.notes ? 15 : 14}></td>
                  </tr>
                )
              }
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
            {filteredSales.length < pageSize &&
              Array.from({ length: Math.max(0, pageSize - filteredSales.length) }).map((_, idx) => (
                <tr key={`pad-${idx}`} style={{ opacity: 0.25, height: '42px' }}>
                  <td colSpan={visibleCols.notes ? 15 : 14}></td>
                </tr>
              ))}
          </tbody>
        </table>
        {isFetching && !isLoading && <div className="table-overlay">Updating…</div>}

        {pager}
      </div>
    </div>
  )
}
