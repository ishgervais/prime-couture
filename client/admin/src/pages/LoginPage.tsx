import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Mail, Lock, Eye, EyeOff, Shield } from 'lucide-react'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1f2937 45%, #0f172a 100%)',
        display: 'grid',
        placeItems: 'center',
        padding: '2rem',
        color: '#fff',
      }}
    >
      <div
        style={{
          width: '380px',
          background: '#fff',
          color: '#0f172a',
          padding: '2rem',
          borderRadius: '16px',
          boxShadow: '0 20px 50px rgba(15,23,42,0.25)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.9rem', color: '#64748b', letterSpacing: '0.04em' }}>Prime Couture</div>
            <h2 style={{ margin: '0.1rem 0 0' }}>Admin Login</h2>
          </div>
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: '50%',
              background: '#0f172a',
              color: '#fff',
              display: 'grid',
              placeItems: 'center',
              fontWeight: 700,
              letterSpacing: '0.06em',
            }}
          >
            <Shield size={20} />
          </div>
        </div>
        <p style={{ color: '#475569', marginTop: 0, marginBottom: '1.25rem' }}>
          Sign in to manage products, sales, expenses, and analytics.
        </p>
        <form onSubmit={onSubmit} className="form-stack">
          <div style={{ display: 'grid', gap: '0.35rem' }}>
            <label style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Mail size={16} /> Email
            </label>
            <div style={{ position: 'relative' }}>
              <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <Mail size={16} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            </div>
          </div>
          <div style={{ display: 'grid', gap: '0.35rem' }}>
            <label style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Lock size={16} /> Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                className="input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'inline-flex',
                  alignItems: 'center',
                }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          {error && (
            <div style={{ color: '#dc2626', fontSize: '0.9rem', background: '#fef2f2', padding: '0.5rem 0.75rem', borderRadius: 8 }}>
              {error}
            </div>
          )}
          <button
            className="button"
            type="submit"
            disabled={loading}
            style={{ width: '100%', background: '#0f172a', padding: '0.9rem', fontWeight: 700, letterSpacing: '0.02em' }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
