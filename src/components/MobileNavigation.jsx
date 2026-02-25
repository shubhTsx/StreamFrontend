import { motion } from 'framer-motion'
import { Home, Search, Video, FolderOpen, HardDrive, User, LogOut } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { authEvents } from '../utils/authEvents'

function MobileNavigation() {
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

  const userType = localStorage.getItem('userType')

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('userType')
    localStorage.removeItem('token')
    setUser(null)
    authEvents.emit({ user: null, userType: null })
    navigate('/auth')
  }

  const navItems = [
    { name: 'Drive', icon: Home, path: '/' },
    { name: 'Browse', icon: Search, path: '/explore' },
    { name: 'Media', icon: Video, path: '/videos' },
    { name: 'Files', icon: FolderOpen, path: '/restaurants' },
    ...(userType === 'partner' ? [{ name: 'Manage', icon: HardDrive, path: '/partner-dashboard' }] : []),
    { name: user ? 'Account' : 'Sign in', icon: User, path: user ? '/profile' : '/auth' }
  ]

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl bg-slate-900/90 border-t border-slate-800">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                isActive
                  ? 'bg-blue-500/15 text-blue-400'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
              }`
            }
          >
            <motion.div whileTap={{ scale: 0.9 }} transition={{ type: 'spring', stiffness: 400, damping: 17 }}>
              <item.icon size={20} />
            </motion.div>
            <span className="text-[10px] font-medium">{item.name}</span>
          </NavLink>
        ))}
        {user && (
          <button
            onClick={handleLogout}
            className="flex flex-col items-center gap-1 p-2 rounded-lg transition-all text-slate-500 hover:text-red-400 hover:bg-slate-800/50"
          >
            <motion.div whileTap={{ scale: 0.9 }} transition={{ type: 'spring', stiffness: 400, damping: 17 }}>
              <LogOut size={20} />
            </motion.div>
            <span className="text-[10px] font-medium">Out</span>
          </button>
        )}
      </div>
    </div>
  )
}

export default MobileNavigation
