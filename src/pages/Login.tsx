import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [teamCode, setTeamCode] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login({ teamCode, email, password })
      navigate('/dashboard')
    } catch {
      setError('Credenciales inválidas o error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-slate-800 p-8 rounded-lg w-full max-w-sm border border-slate-700">
        <h1 className="text-2xl font-bold text-cyan-400 mb-6 text-center">TropelCare</h1>
        {error && (
          <div className="bg-red-900/50 text-red-300 text-sm px-4 py-2 rounded mb-4">{error}</div>
        )}
        <div className="space-y-4">
          <div>
            <label className="text-sm text-slate-400 block mb-1">Team Code</label>
            <input
              value={teamCode}
              onChange={(e) => setTeamCode(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
              required
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 block mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
              required
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 block mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-800 text-white py-2 rounded text-sm font-medium"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </div>
      </form>
    </div>
  )
}
