import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Search, Bell, User, Cloud } from 'lucide-react'
import GlassCard from '../ui/GlassCard.jsx'
import { useNavigate, Link } from 'react-router-dom'
import { authEvents } from '../utils/authEvents'

function MobileHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) setUser(JSON.parse(userData))
  }, [])

  useEffect(() => {
    const handleAuthChange = (data) => setUser(data.user)
    const handleStorageChange = () => {
      const userData = localStorage.getItem('user')
      setUser(userData ? JSON.parse(userData) : null)
    }
    const unsubscribe = authEvents.subscribe(handleAuthChange)
    window.addEventListener('storage', handleStorageChange)
    return () => {
      unsubscribe()
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('userType')
    localStorage.removeItem('token')
    setUser(null)
    setIsProfileOpen(false)
    authEvents.emit({ user: null, userType: null })
    navigate('/auth')
  }

  const userType = localStorage.getItem('userType')
  const menuItems = [
    { name: 'My Drive', icon: '☁️', path: '/' },
    { name: 'Browse', icon: '🔍', path: '/explore' },
    { name: 'Media', icon: '🎬', path: '/videos' },
    { name: 'Collections', icon: '📁', path: '/restaurants' },
    ...(userType === 'partner' ? [{ name: 'Manage', icon: '⚙️', path: '/partner-dashboard' }] : []),
    { name: 'Account', icon: '👤', path: '/profile' }
  ]

  const profileItems = [
    { name: 'My Files', icon: '📄' },
    { name: 'Shared', icon: '🔗' },
    { name: 'Settings', icon: '⚙️' },
    { name: 'Help', icon: '❓' },
    { name: 'Sign out', icon: '🚪' }
  ]

  return (
    <>
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-slate-900/90 border-b border-slate-800">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <Cloud size={16} className="text-white" />
            </div>
            <span className="font-semibold text-white">CloudDrive</span>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-colors">
              <Search size={18} className="text-slate-300" />
            </button>
            <button className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-colors relative">
              <Bell size={18} className="text-slate-300" />
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-blue-500 rounded-full" />
            </button>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-colors"
            >
              <User size={18} className="text-slate-300" />
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-colors"
            >
              {isMenuOpen ? <X size={18} className="text-slate-300" /> : <Menu size={18} className="text-slate-300" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => setIsMenuOpen(false)}
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-72 h-full bg-slate-900 border-r border-slate-800"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                      <Cloud size={18} className="text-white" />
                    </div>
                    <span className="font-semibold text-white">CloudDrive</span>
                  </div>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    <X size={18} className="text-slate-400" />
                  </button>
                </div>

                <nav className="space-y-1">
                  {menuItems.map((item, index) => (
                    <Link key={item.name} to={item.path} onClick={() => setIsMenuOpen(false)}>
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/60 transition-colors text-slate-200"
                      >
                        <span className="text-lg">{item.icon}</span>
                        <span>{item.name}</span>
                      </motion.div>
                    </Link>
                  ))}
                </nav>

                <div className="mt-6 pt-4 border-t border-slate-800">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30">
                    <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                      <User size={20} className="text-slate-400" />
                    </div>
                    <div>
                      <p className="text-slate-200 font-medium">{user?.name || 'Guest'}</p>
                      <p className="text-slate-500 text-sm">{user?.email || 'Not signed in'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isProfileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-14 right-4 z-50"
          >
            <GlassCard className="w-56 p-3">
              {profileItems.map((item) => (
                <button
                  key={item.name}
                  onClick={item.name === 'Sign out' ? handleLogout : undefined}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-700/30 transition-colors text-slate-200 text-left text-sm"
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.name}</span>
                </button>
              ))}
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default MobileHeader
