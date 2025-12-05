import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Package, Boxes, Tags, ListChecks, ChartLine, User } from 'lucide-react'
import { authApi } from '../api'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/products', label: 'Products', Icon: Package },
  { to: '/collections', label: 'Collections', Icon: Boxes },
  { to: '/categories', label: 'Categories', Icon: Tags },
  { to: '/orders', label: 'Orders', Icon: ListChecks },
  { to: '/analytics', label: 'Analytics', Icon: ChartLine },
  { to: '/users', label: 'Users', Icon: User },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const logout = () => {
    authApi.logout()
    navigate('/login')
  }

  return (
    <div className="layout">
      <aside className="sidebar">
        <h1>Prime Couture Admin</h1>
        {user && (
          <div style={{ marginBottom: '1rem', fontSize: '0.85rem', lineHeight: 1.4 }}>
            <div style={{ fontWeight: 600 }}>{user.name}</div>
            <div style={{ opacity: 0.8 }}>{user.email}</div>
            <div className="badge" style={{ background: 'rgba(255,255,255,0.1)', color: '#f8fafc' }}>
              {user.role}
            </div>
          </div>
        )}
        <nav>
          {navItems.map(({ to, label, Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => (isActive ? 'active' : undefined)}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <Icon size={16} /> {label}
              </span>
            </NavLink>
          ))}
        </nav>
        <button className="button" style={{ marginTop: '1rem' }} onClick={logout}>
          Logout
        </button>
      </aside>
      <main className="content">{children}</main>
    </div>
  )
}
