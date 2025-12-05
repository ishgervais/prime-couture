import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Package, Boxes, Tags, ListChecks, ChartLine, User, ChevronLeft, ChevronRight, LogOut } from 'lucide-react'
import { authApi } from '../api'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'
import { useEffect } from 'react'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/products', label: 'Products', Icon: Package },
   { to: '/sales', label: 'Sales', Icon: ChartLine },
  { to: '/collections', label: 'Collections', Icon: Boxes },
  { to: '/categories', label: 'Categories', Icon: Tags },
  { to: '/orders', label: 'Orders', Icon: ListChecks },
  { to: '/analytics', label: 'Analytics', Icon: ChartLine },
  { to: '/clients', label: 'Clients', Icon: User },
  { to: '/users', label: 'Users', Icon: User },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    const stored = localStorage.getItem('pc_admin_sidebar_collapsed')
    return stored === 'true'
  })

  useEffect(() => {
    localStorage.setItem('pc_admin_sidebar_collapsed', String(collapsed))
  }, [collapsed])
  const logout = () => {
    authApi.logout()
    navigate('/login')
  }

  return (
    <div className="layout">
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: 0 }}>
            <button className="icon-button" onClick={() => setCollapsed((v) => !v)} aria-label="Toggle sidebar">
              {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
            {!collapsed && <h1 style={{ margin: 0 }}>Prime Couture Admin</h1>}
          </div>
        </div>
        {user && (
          <div className={`user-block ${collapsed ? 'collapsed' : ''}`}>
            <div className="user-avatar">{user.name?.slice(0, 2).toUpperCase()}</div>
            {!collapsed && (
              <div className="user-meta">
                <div className="user-name">{user.name}</div>
                <div className="badge" style={{ background: 'rgba(255,255,255,0.1)', color: '#f8fafc' }}>
                  {user.role}
                </div>
              </div>
            )}
          </div>
        )}
        <nav>
          {navItems.map(({ to, label, Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => (isActive ? 'active' : undefined)}>
              <span className="nav-item">
                <Icon size={16} /> <span className="nav-label">{label}</span>
              </span>
            </NavLink>
          ))}
        </nav>
        <button className="icon-button logout" style={{ marginTop: '1rem' }} onClick={logout} title="Logout">
          <LogOut size={18} />
          {!collapsed && <span className="nav-label">Logout</span>}
        </button>
      </aside>
      <main className="content" style={{ marginLeft: collapsed ? 80 : 240 }}>
        {children}
      </main>
    </div>
  )
}
