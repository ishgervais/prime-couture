import { useEffect, useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { expensesApi } from '../api'
import TablePager from '../components/TablePager'

export default function ExpensesPage() {
  const qc = useQueryClient()
  const now = useMemo(() => new Date(), [])
  const [year, setYear] = useState<string>(String(now.getFullYear()))
  const [month, setMonth] = useState<string>(String(now.getMonth() + 1))
  const [categoryId, setCategoryId] = useState<string>('all')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [importing, setImporting] = useState(false)
  const { data: expenseYears } = useQuery({
    queryKey: ['expense-years-options'],
    queryFn: () => expensesApi.monthly('all'),
  })

  const { data: categories } = useQuery({ queryKey: ['expense-categories'], queryFn: expensesApi.categories })
  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ['expenses', year, month, categoryId, search, page, pageSize],
    queryFn: () =>
      expensesApi.list({
        year: year !== 'all' ? year : undefined,
        month: month !== 'all' ? month : undefined,
        categoryId: categoryId !== 'all' ? categoryId : undefined,
        search,
        page,
        pageSize,
      }),
    keepPreviousData: true,
  })

  const items = data?.items ?? []
  const total = data?.total ?? 0
  const aggregates = data?.aggregates ?? { totalAmount: 0 }
  const years = useMemo(() => {
    const fromApi = expenseYears?.availableYears ?? []
    const current = String(now.getFullYear())
    const allYears = Array.from(new Set<string>([...fromApi, current])).sort(
      (a, b) => Number(b) - Number(a)
    )
    return ['all', ...allYears]
  }, [expenseYears, now])

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 300)
    return () => clearTimeout(t)
  }, [searchInput])

  useEffect(() => {
    setPage(1)
  }, [year, month, categoryId, search])

  const maxAmount = useMemo(() => Math.max(0, ...items.map((e: any) => Number(e.amount ?? 0))), [items])
  const maxRowId = useMemo(() => {
    let max = -Infinity
    let id: string | null = null
    items.forEach((e: any) => {
      const amt = Number(e.amount ?? 0)
      if (amt > max) {
        max = amt
        id = e.id
      }
    })
    return id
  }, [items])
  const formatNumber = (value: any) => {
    const num = Number(value ?? 0)
    if (Number.isNaN(num)) return '--'
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(num)
  }

  const parseCsv = async (file: File) => {
    const text = await file.text()
    const lines = text.trim().split(/\r?\n/)
    if (!lines.length) return []
    const header = lines[0].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map((h) => h.replace(/"/g, '').trim())
    return lines.slice(1).map((line) => {
      const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map((c) => c.replace(/^"|"$/g, '').trim())
      const row: any = {}
      header.forEach((key, idx) => (row[key] = cols[idx]))
      return row
    })
  }

  const handleImport = async (file?: File | null) => {
    if (!file) return
    setImporting(true)
    try {
      const rows = await parseCsv(file)
      const result = await expensesApi.importRows(rows)
      window.alert(`Imported ${result.created}${result.errors?.length ? `, ${result.errors.length} errors` : ''}`)
      qc.invalidateQueries({ queryKey: ['expenses'] })
      qc.invalidateQueries({ queryKey: ['expenses-summary'] })
    } catch (err: any) {
      window.alert(err?.message || 'Failed to import')
    } finally {
      setImporting(false)
    }
  }

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

  const heatAmount = (amount: number) => {
    if (!maxAmount || maxAmount === 0) return {}
    const ratio = Math.min(Math.max(amount / maxAmount, 0), 1)
    // Lighter red at low amounts, denser as it approaches the max; broaden alpha range for more contrast
    const alpha = 0.05 + ratio * 0.45
    return { background: `rgba(248,113,113, ${alpha})`, color: ratio > 0.65 ? '#7f1d1d' : '#991b1b' }
  }

  const exportCsv = () => {
    if (!items.length) return
    const headers = ['Date', 'Title', 'Category', 'Amount', 'Currency', 'Notes']
    const rows = items.map((e: any) => [
      new Date(e.expenseDate).toISOString().slice(0, 10),
      e.title,
      e.category?.name ?? '',
      e.amount,
      e.currency,
      e.notes ?? '',
    ])
    const csv = [headers, ...rows]
      .map((r) =>
        r
          .map((cell) => {
            if (cell === null || cell === undefined) return ''
            const val = String(cell).replace(/"/g, '""')
            return /[",\n]/.test(val) ? `"${val}"` : val
          })
          .join(','),
      )
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `expenses-${year}-${month}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const [createForm, setCreateForm] = useState({
    expenseDate: new Date().toISOString().slice(0, 10),
    title: '',
    amount: '',
    currency: 'RWF',
    categoryId: '',
    notes: '',
  })
  const [newCategory, setNewCategory] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)

  const submitExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await expensesApi.create({
        ...createForm,
        amount: Number(createForm.amount),
      })
      setCreateForm({
        expenseDate: new Date().toISOString().slice(0, 10),
        title: '',
        amount: '',
        currency: 'RWF',
        categoryId: '',
        notes: '',
      })
      qc.invalidateQueries({ queryKey: ['expenses'] })
      qc.invalidateQueries({ queryKey: ['expenses-summary-dashboard'] })
      setSuccess('Expense created successfully.')
    } catch (err: any) {
      window.alert(err?.response?.data?.message || 'Failed to create expense')
    }
  }

  const submitCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCategory.trim()) return
    try {
      await expensesApi.createCategory(newCategory.trim())
      setNewCategory('')
      qc.invalidateQueries({ queryKey: ['expense-categories'] })
      setSuccess('Category created successfully.')
    } catch (err: any) {
      window.alert(err?.response?.data?.message || 'Failed to create category')
    }
  }

  return (
    <div>
      <div className="header-row">
        <div>
          <h2 style={{ margin: 0 }}>Expenses</h2>
          <p style={{ color: '#64748b' }}>Track spend, import CSV, and monitor categories</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <label className="pill" style={{ cursor: 'pointer', display: 'inline-flex', gap: '0.4rem' }}>
            Import CSV
            <input type="file" accept=".csv" style={{ display: 'none' }} onChange={(e) => handleImport(e.target.files?.[0])} disabled={importing} />
          </label>
          <button type="button" className="pill" onClick={exportCsv}>
            Export CSV
          </button>
        </div>
      </div>

      <div className="card-grid" style={{ marginBottom: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div className="card">
          <div style={{ color: '#64748b' }}>Total expenses</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>{formatNumber(aggregates.totalAmount)} RWF</div>
        </div>
        <div className="card">
          <div style={{ color: '#64748b' }}>Entries</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>{total}</div>
        </div>
        <div className="card">
          <div style={{ color: '#64748b' }}>Avg per entry</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>
            {total ? formatNumber(Number(aggregates.totalAmount || 0) / total) : '--'} RWF
          </div>
        </div>
        <div className="card">
          <div style={{ color: '#64748b' }}>Max entry</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>
            {maxAmount ? formatNumber(maxAmount) : '--'} RWF
          </div>
        </div>
      </div>

      {error && <p style={{ color: '#dc2626' }}>Failed to load expenses</p>}

      <div className="card">
        <div
          role="button"
          tabIndex={0}
          onClick={() => setShowCreate((v) => !v)}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setShowCreate((v) => !v)}
          style={{
            marginBottom: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer',
            userSelect: 'none',
            padding: '0.6rem 0.8rem',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            background: '#f8fafc',
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center' }}>{showCreate ? '▾' : '▸'}</span>
          <strong>Add expense / category (click to {showCreate ? 'collapse' : 'expand'})</strong>
        </div>
        {showCreate && (
          <div className="card-grid" style={{ marginBottom: '0.75rem', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
            <div className="card" style={{ border: '1px dashed #e2e8f0' }}>
              <h4 style={{ marginTop: 0 }}>Add expense</h4>
              <form className="form-stack" onSubmit={submitExpense}>
                <input className="input" type="date" value={createForm.expenseDate} onChange={(e) => setCreateForm({ ...createForm, expenseDate: e.target.value })} required />
                <input className="input" placeholder="Title" value={createForm.title} onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })} required />
                <input
                  className="input"
                  type="number"
                  placeholder="Amount"
                  value={createForm.amount}
                  onChange={(e) => setCreateForm({ ...createForm, amount: e.target.value })}
                  required
                />
                <select className="input" value={createForm.currency} onChange={(e) => setCreateForm({ ...createForm, currency: e.target.value })}>
                  <option value="RWF">RWF</option>
                  <option value="USD">USD</option>
                </select>
                <select
                  className="input"
                  value={createForm.categoryId}
                  onChange={(e) => setCreateForm({ ...createForm, categoryId: e.target.value })}
                  required
                >
                  <option value="">Select category</option>
                  {(categories ?? []).map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <textarea className="input" placeholder="Notes" value={createForm.notes} onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })} />
                <button className="button" type="submit">
                  Create expense
                </button>
              </form>
            </div>
            <div className="card" style={{ border: '1px dashed #e2e8f0' }}>
              <h4 style={{ marginTop: 0 }}>Add category</h4>
              <form className="form-stack" onSubmit={submitCategory}>
                <input className="input" placeholder="Category name" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} required />
                <button className="button" type="submit">
                  Create category
                </button>
              </form>
            </div>
          </div>
        )}
        {success && (
          <div style={{ background: '#ecfdf3', color: '#166534', padding: '0.75rem 1rem', borderRadius: 10, marginBottom: '0.75rem' }}>
            {success}
          </div>
        )}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'grid', gap: '0.25rem' }}>
            <label style={{ fontWeight: 600 }}>Year</label>
            <select className="input" value={year} onChange={(e) => setYear(e.target.value)}>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y === 'all' ? 'All years' : y}
                </option>
              ))}
            </select>
          </div>
          <div style={{ display: 'grid', gap: '0.25rem' }}>
            <label style={{ fontWeight: 600 }}>Month</label>
            <select className="input" value={month} onChange={(e) => setMonth(e.target.value)}>
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
            <label style={{ fontWeight: 600 }}>Category</label>
            <select className="input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="all">All</option>
              {(categories ?? []).map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div style={{ display: 'grid', gap: '0.25rem', flex: 1, minWidth: 160 }}>
            <label style={{ fontWeight: 600 }}>Search</label>
            <input className="input" placeholder="Title/notes/category" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
          </div>
        </div>
        {pager}
        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Date</th>
              <th>Title</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {(isLoading && !items.length ? Array.from({ length: 10 }) : items).map((e: any, idx: number) => {
              if (isLoading && !items.length) {
                return (
                  <tr key={`s-${idx}`}>
                    <td className="skeleton" colSpan={6} style={{ height: 32 }}></td>
                  </tr>
                )
              }
              const amountNum = Number(e.amount ?? 0)
              return (
                <tr key={e.id} style={e.id === maxRowId ? { background: 'rgba(248,113,113,0.16)' } : undefined}>
                  <td>{(page - 1) * pageSize + idx + 1}</td>
                  <td>{new Date(e.expenseDate).toLocaleDateString()}</td>
                  <td>{e.title}</td>
                  <td>{e.category?.name ?? '—'}</td>
                  <td style={heatAmount(amountNum)}>
                    {formatNumber(amountNum)} {e.currency}
                  </td>
                  <td>{e.notes ?? ''}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {pager}
        {isFetching && !isLoading && <div className="table-overlay">Updating…</div>}
      </div>
    </div>
  )
}
