import { FormEvent, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { categoriesApi } from '../api'
import { useAuth } from '../context/AuthContext'

export default function CategoriesPage() {
  const qc = useQueryClient()
  const { data, isLoading, error } = useQuery({ queryKey: ['categories'], queryFn: categoriesApi.list })
  const { user } = useAuth()
  const [form, setForm] = useState({ name: '', slug: '', description: '' })
  const [message, setMessage] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setErr(null)
    try {
      await categoriesApi.create(form)
      setMessage('Category created')
      setForm({ name: '', slug: '', description: '' })
      qc.invalidateQueries({ queryKey: ['categories'] })
    } catch (ex: any) {
      setErr(ex?.response?.data?.message || 'Failed to create')
    }
  }

  return (
    <div>
      <div className="header-row">
        <div>
          <h2 style={{ margin: 0 }}>Categories</h2>
          <p style={{ color: '#64748b' }}>Manage categories</p>
        </div>
      </div>
      {isLoading && <p>Loading…</p>}
      {error && <p style={{ color: '#dc2626' }}>Failed to load</p>}

      <div className="card-grid" style={{ marginBottom: '1rem' }}>
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Create category</h3>
          {!user && <p style={{ color: '#dc2626' }}>Login required</p>}
          <form className="form-stack" onSubmit={submit}>
            <input className="input" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <input className="input" placeholder="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
            <textarea className="input" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <button className="button" type="submit" disabled={!user}>
              Save
            </button>
          </form>
          {(message || err) && <p style={{ color: message ? '#166534' : '#b91c1c' }}>{message || err}</p>}
        </div>
        <div className="card">
          <h3 style={{ marginTop: 0 }}>All categories</h3>
          <ul style={{ margin: 0, paddingLeft: '1rem' }}>
            {(data ?? []).map((c: any) => (
              <li key={c.id}>
                {c.name} <span className="badge">{c.slug}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
