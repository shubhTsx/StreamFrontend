import { useState, useEffect } from 'react'
import GlassCard from '../ui/GlassCard.jsx'
import { motion } from 'framer-motion'
import { Mail, Lock, User, Eye, EyeOff, LogOut, Cloud } from 'lucide-react'
import api from '../utils/api'
import { useNavigate } from 'react-router-dom'
import { authEvents } from '../utils/authEvents'

function Auth() {
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const userData = localStorage.getItem('user')
    const userType = localStorage.getItem('userType')
    if (userData && userType) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    const formData = new FormData(e.target)
    const data = Object.fromEntries(formData)

    try {
      const response = await api.post('/user/login', {
        email: data.email,
        password: data.password
      })

      setSuccess('Signed in successfully.')
      const userData = response.data.user
      if (userData) {
        localStorage.setItem('user', JSON.stringify(userData))
        localStorage.setItem('userType', 'user')
        localStorage.setItem('token', response.data.token || 'logged-in')
        setUser(userData)
        authEvents.emit({ user: userData, userType: 'user' })

        if (userData.subscriptionStatus !== 'approved') {
          setTimeout(() => navigate('/subscription'), 800)
        } else {
          setTimeout(() => navigate('/'), 800)
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Sign in failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    const formData = new FormData(e.target)
    const data = Object.fromEntries(formData)

    try {
      await api.post('/user/register', {
        name: data.name,
        email: data.email,
        password: data.password
      })
      setSuccess('Account created! Please sign in.')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('userType')
    localStorage.removeItem('token')
    setUser(null)
    authEvents.emit({ user: null, userType: null })
  }

  // Already logged in view
  if (user) {
    return (
      <div className="max-w-md mx-auto px-4 py-8">
        <GlassCard className="p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-4">
            <User size={28} className="text-white" />
          </div>
          <h2 className="text-xl font-bold text-slate-200 mb-1">{user.name}</h2>
          <p className="text-slate-500 text-sm mb-6">{user.email}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate('/profile')}
              className="px-5 py-2.5 rounded-lg bg-slate-700/50 border border-slate-600 hover:bg-slate-600/50 text-slate-200 font-medium text-sm"
            >
              Profile
            </button>
            <button
              onClick={handleLogout}
              className="px-5 py-2.5 rounded-lg bg-red-500/20 border border-red-500/30 hover:bg-red-500/30 text-red-400 font-medium text-sm flex items-center gap-2"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        </GlassCard>
      </div>
    )
  }

  const inputClass = "w-full pl-9 pr-4 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500/50"

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-4">
          <Cloud size={28} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-slate-200 mb-1">Welcome</h1>
        <p className="text-slate-500 text-sm">Sign in or create your account</p>
      </motion.div>

      {error && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-center text-sm"
        >{error}</motion.div>
      )}

      {success && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-center text-sm"
        >{success}</motion.div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Sign In */}
        <GlassCard className="p-6">
          <h2 className="text-lg font-semibold text-slate-200 mb-1 text-center">Sign In</h2>
          <p className="text-slate-500 text-sm text-center mb-5">Welcome back</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm text-slate-500">Email</label>
              <div className="relative mt-1">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type="email" name="email" required className={inputClass} placeholder="Enter your email" />
              </div>
            </div>
            <div>
              <label className="text-sm text-slate-500">Password</label>
              <div className="relative mt-1">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"} name="password" required
                  className="w-full pl-9 pr-10 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500/50"
                  placeholder="Enter your password"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-400"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-2.5 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-medium text-sm transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </GlassCard>

        {/* Create Account */}
        <GlassCard className="p-6">
          <h2 className="text-lg font-semibold text-slate-200 mb-1 text-center">Create Account</h2>
          <p className="text-slate-500 text-sm text-center mb-5">New here? Join us</p>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="text-sm text-slate-500">Full Name</label>
              <div className="relative mt-1">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type="text" name="name" required className={inputClass} placeholder="Enter your full name" />
              </div>
            </div>
            <div>
              <label className="text-sm text-slate-500">Email</label>
              <div className="relative mt-1">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type="email" name="email" required className={inputClass} placeholder="Enter your email" />
              </div>
            </div>
            <div>
              <label className="text-sm text-slate-500">Password</label>
              <div className="relative mt-1">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"} name="password" required
                  className="w-full pl-9 pr-10 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500/50"
                  placeholder="Create a password"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-400"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-2.5 rounded-lg bg-slate-700/50 border border-slate-600 hover:bg-slate-600/50 disabled:opacity-50 text-slate-200 font-medium text-sm transition-colors"
            >
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </form>
        </GlassCard>
      </div>
    </div>
  )
}

export default Auth
