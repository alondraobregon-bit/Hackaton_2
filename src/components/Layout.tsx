import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const links = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/tropels', label: 'Tropeles' },
  { to: '/feed', label: 'Señales' },
  { to: '/sectors', label: 'Sectores' },
]

export function Layout() {
  const { operator, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <header className="border-b border-slate-700 bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="font-bold text-cyan-400">TropelCare</span>
            <nav className="flex gap-4">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `text-sm ${isActive ? 'text-cyan-300' : 'text-slate-400 hover:text-slate-200'}`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-400">{operator?.displayName}</span>
            <button
              onClick={handleLogout}
              className="text-xs bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded"
            >
              Salir
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
