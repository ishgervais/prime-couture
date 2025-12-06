import React from 'react'

type Props = {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

export default function TablePager({ page, pageSize, total, onPageChange, onPageSizeChange }: Props) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  const renderRange = () => {
    const range: (number | string)[] = []
    const windowSize = 1
    const start = Math.max(2, page - windowSize)
    const end = Math.min(totalPages - 1, page + windowSize)
    range.push(1)
    if (start > 2) range.push('…')
    for (let p = start; p <= end; p++) range.push(p)
    if (end < totalPages - 1) range.push('…')
    if (totalPages > 1) range.push(totalPages)
    return range
  }

  return (
    <div className="pager-row">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ color: '#0f172a' }}>Rows per page:</span>
        <select
          className="input"
          style={{ width: '90px' }}
          value={pageSize}
          onChange={(e) => {
            onPageSizeChange(Number(e.target.value))
          }}
        >
          {[10, 50, 100].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>
      <div className="pager">
        <button className="pager-button" disabled={page <= 1} onClick={() => onPageChange(Math.max(1, page - 1))}>
          Prev
        </button>
        {renderRange().map((val, idx) => {
          if (val === '…') {
            return (
              <span key={`ellipsis-${idx}`} className="pager-ellipsis">
                …
              </span>
            )
          }
          const p = val as number
          const active = p === page
          return (
            <button key={p} className={`pager-button${active ? ' active' : ''}`} onClick={() => onPageChange(p)}>
              {p}
            </button>
          )
        })}
        <button className="pager-button" disabled={page >= totalPages} onClick={() => onPageChange(Math.min(totalPages, page + 1))}>
          Next
        </button>
      </div>
    </div>
  )
}
