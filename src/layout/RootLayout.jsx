import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Cloud, Search, UserRound, FolderOpen, Video, Home, HardDrive, LogOut,
  Upload
} from 'lucide-react'
import FogBackground from '../ui/FogBackground.jsx'
import MobileHeader from '../components/MobileHeader.jsx'
import MobileNavigation from '../components/MobileNavigation.jsx'
import { useState, useEffect } from 'react'
import { authEvents } from '../utils/authEvents'

function RootLayout() {
  const [user, setUser] = useState(null)
  const [userType, setUserType] = useState('user')
  const navigate = useNavigate()
  const location = useLocation()
  const isAdmin = userType === 'partner'
  const isVideoRoute = location.pathname === '/videos'

  useEffect(() => {
    const userData = localStorage.getItem('user')
    const userTypeData = localStorage.getItem('userType')
    if (userData) {
      setUser(JSON.parse(userData))
      setUserType(userTypeData || 'user')
    }
  }, [])

  useEffect(() => {
    const handleAuthChange = (data) => {
      setUser(data.user)
      setUserType(data.userType || 'user')
    }
    const handleStorageChange = () => {
      const userData = localStorage.getItem('user')
      const userTypeData = localStorage.getItem('userType')
      if (userData) {
        setUser(JSON.parse(userData))
        setUserType(userTypeData || 'user')
      } else {
        setUser(null)
        setUserType('user')
      }
    }
    const unsubscribe = authEvents.subscribe(handleAuthChange)
    window.addEventListener('storage', handleStorageChange)
    return () => {
      unsubscribe()
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  // Subscription gating: redirect regular users without approved subscription
  useEffect(() => {
    const allowedPaths = ['/auth', '/subscription', '/cp-admin']
    if (
      user &&
      userType === 'user' &&
      !allowedPaths.includes(location.pathname)
    ) {
      const subStatus = JSON.parse(localStorage.getItem('user') || '{}').subscriptionStatus
      if (subStatus !== 'approved') {
        navigate('/subscription', { replace: true })
      }
    }
  }, [user, userType, location.pathname, navigate])

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('userType')
    localStorage.removeItem('token')
    setUser(null)
    setUserType('user')
    authEvents.emit({ user: null, userType: null })
    navigate('/auth')
  }

  const storageUsed = 156
  const storageTotal = 1024
  const storagePercent = Math.min(100, (storageUsed / storageTotal) * 100)

  const sidebarLinks = [
    { to: '/', label: isAdmin ? 'Dashboard' : 'Home', icon: Home },
    { to: '/explore', label: 'Browse', icon: Search },
    { to: '/restaurants', label: 'Collections', icon: FolderOpen },
    { to: '/videos', label: 'Media', icon: Video },
    ...(isAdmin ? [{ to: '/partner-dashboard', label: 'Manage', icon: HardDrive }] : []),
  ]

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden">
      <FogBackground />

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-64 z-40 bg-slate-900/80 backdrop-blur-xl border-r border-slate-800">
        <div className="p-5 border-b border-slate-800">
          <NavLink to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <Cloud size={22} className="text-white" />
            </div>
            <span className="font-semibold text-lg text-white">CloudDrive</span>
          </NavLink>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {sidebarLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${isActive
                  ? 'bg-blue-500/15 text-blue-400'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`
              }
            >
              <link.icon size={18} />
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Storage Bar - Admin only */}
        {isAdmin && (
          <div className="p-4 border-t border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500">Storage</span>
              <span className="text-xs text-slate-400">{storageUsed} / {storageTotal} GB</span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${storagePercent}%` }}
                transition={{ duration: 0.6 }}
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
              />
            </div>
          </div>
        )}
      </aside>

      {/* Desktop Top Bar */}
      <header className="hidden lg:block fixed top-0 left-64 right-0 z-30 bg-slate-900/60 backdrop-blur-xl border-b border-slate-800">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search videos..."
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500/50"
              />
            </div>
            {isAdmin && (
              <NavLink
                to="/partner-dashboard"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-colors"
              >
                <Upload size={16} />
                Upload
              </NavLink>
            )}
          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <NavLink to="/profile" className="p-2 rounded-lg bg-slate-800/50 border border-slate-700 hover:bg-slate-700/50 transition-colors">
                  <UserRound size={18} className="text-slate-300" />
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors"
                  title="Sign out"
                >
                  <LogOut size={18} className="text-red-400" />
                </button>
              </>
            ) : (
              <NavLink to="/auth" className="p-2 rounded-lg bg-slate-800/50 border border-slate-700 hover:bg-slate-700/50 transition-colors">
                <UserRound size={18} className="text-slate-300" />
              </NavLink>
            )}
          </div>
        </div>
      </header>

      <MobileHeader />

      <main className={isVideoRoute ? 'pt-16 pb-20 lg:pl-64 lg:pt-20 lg:pb-0 overflow-hidden' : 'pt-16 lg:pl-64 lg:pt-20 pb-20 lg:pb-8'}>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className={isVideoRoute ? 'overflow-hidden' : 'min-h-[calc(100vh-5rem)] lg:min-h-[calc(100vh-5rem)]'}
        >
          <Outlet />
        </motion.div>
      </main>

      <MobileNavigation />

      {!isVideoRoute && <footer className="hidden lg:block border-t border-slate-800 py-6">
        <div className="ml-64 px-6 flex items-center justify-between text-xs text-slate-500">
          <span>© 2025 CloudDrive</span>
          <span className="flex items-center gap-2"><Cloud size={14} /> Video streaming platform</span>
        </div>
      </footer>}
    </div>
  )
}

export default RootLayout
