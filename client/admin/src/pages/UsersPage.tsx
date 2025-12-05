import { FormEvent, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { usersApi } from '../api'
import { useAuth } from '../context/AuthContext'

export default function UsersPage() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const { data: users, isLoading, error: fetchError } = useQuery({ queryKey: ['users'], queryFn: usersApi.list })
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: 'ChangeMe123!',
    role: 'USER',
  })
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setError(null)
    setLoading(true)
    try {
      const res = await usersApi.create(form)
      setMessage(`User ${res.name} created`)
      setForm({ name: '', email: '', password: 'ChangeMe123!', role: 'USER' })
      qc.invalidateQueries({ queryKey: ['users'] })
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create user')
    } finally {
      setLoading(false)
    }
  }

  const revoke = async (id: string) => {
    setError(null)
    setMessage(null)
    try {
      await usersApi.remove(id)
      setMessage('User revoked')
      qc.invalidateQueries({ queryKey: ['users'] })
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to revoke user')
    }
  }

  return (
    <div>
      <div className="header-row">
        <div>
          <h2 style={{ margin: 0 }}>Users</h2>
          <p style={{ color: '#64748b' }}>Create additional users</p>
        </div>
      </div>

      {!user && <p style={{ color: '#dc2626' }}>Login required.</p>}

      <div className="card" style={{ maxWidth: 520 }}>
        <h3 style={{ marginTop: 0 }}>Create user</h3>
        <form className="form-stack" onSubmit={submit}>
          <input className="input" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input className="input" placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <input className="input" placeholder="Password" type="text" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
            <option value="SUPER_ADMIN">SUPER_ADMIN</option>
          </select>
          <button className="button" type="submit" disabled={!user || loading}>
            {loading ? 'Creating…' : 'Create user'}
          </button>
        </form>
        {(message || error) && <p style={{ color: message ? '#166534' : '#b91c1c' }}>{message || error}</p>}
      </div>

      <div className="card" style={{ marginTop: '1rem' }}>
        <h3 style={{ marginTop: 0 }}>All users</h3>
        {isLoading && <p>Loading…</p>}
        {fetchError && <p style={{ color: '#b91c1c' }}>Failed to load users</p>}
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(users ?? []).map((u: any) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td><span className="badge">{u.role}</span></td>
                <td>
                  {u.id !== user?.id && (
                    <button className="button" style={{ padding: '0.35rem 0.75rem' }} onClick={() => revoke(u.id)}>
                      Revoke
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
