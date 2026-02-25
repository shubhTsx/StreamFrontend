import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import GlassCard from '../ui/GlassCard.jsx'
import { ArrowRight, Folder, Video, HardDrive, Upload } from 'lucide-react'
import { useState, useEffect } from 'react'

function Home() {
  const [userType, setUserType] = useState('user')
  const navigate = useNavigate()
  const isAdmin = userType === 'partner'

  useEffect(() => {
    setUserType(localStorage.getItem('userType') || 'user')
  }, [])

  // Admin view: storage and drive info
  if (isAdmin) {
    const storageStats = [
      { label: 'Used', value: '156 GB', percent: 15, color: 'bg-blue-500' },
      { label: 'Shared', value: '24 GB', percent: 2, color: 'bg-cyan-500' },
      { label: 'Free', value: '868 GB', percent: 83, color: 'bg-slate-600' }
    ]

    return (
      <div className="px-4 lg:px-8 py-6 space-y-8 max-w-7xl mx-auto">
        <section className="space-y-4">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">My Drive</h1>
            <p className="text-slate-400">Storage overview and upload management.</p>
          </motion.div>
        </section>

        <section>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2"
          >
            <HardDrive size={20} className="text-blue-400" />
            Storage Overview
          </motion.h2>
          <GlassCard className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center gap-6">
              <div className="flex-1">
                <div className="h-3 rounded-full bg-slate-800 overflow-hidden flex">
                  {storageStats.map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      initial={{ width: 0 }}
                      animate={{ width: `${stat.percent}%` }}
                      transition={{ duration: 0.6, delay: 0.2 + i * 0.1 }}
                      className={`h-full ${stat.color}`}
                    />
                  ))}
                </div>
                <div className="flex gap-6 mt-3 text-sm">
                  {storageStats.map((stat) => (
                    <div key={stat.label} className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${stat.color}`} />
                      <span className="text-slate-500">{stat.label}:</span>
                      <span className="text-slate-300">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Link
                to="/partner-dashboard"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-colors shrink-0"
              >
                <Upload size={16} />
                Upload Videos
              </Link>
            </div>
          </GlassCard>
        </section>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <GlassCard className="p-8 text-center">
            <h2 className="text-xl font-bold text-slate-200 mb-2">Manage your content</h2>
            <p className="text-slate-500 mb-6">Upload and manage videos from the dashboard.</p>
            <Link
              to="/partner-dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors"
            >
              <Upload size={18} />
              Go to Dashboard
            </Link>
          </GlassCard>
        </motion.section>
      </div>
    )
  }

  // User view: no storage, quick access to Media & Browse
  return (
    <div className="px-4 lg:px-8 py-6 space-y-8 max-w-7xl mx-auto">
      <section className="space-y-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">Welcome</h1>
          <p className="text-slate-400">Stream videos and build your collections.</p>
        </motion.div>
      </section>

      <section>
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-lg font-semibold text-slate-200 mb-4"
        >
          Quick Access
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link to="/videos">
            <GlassCard variant="file" className="p-6 cursor-pointer h-full">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0">
                  <Video size={28} className="text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-200 text-lg">Media</h3>
                  <p className="text-slate-500 text-sm">Stream all videos</p>
                </div>
                <ArrowRight size={20} className="text-slate-500 ml-auto" />
              </div>
            </GlassCard>
          </Link>
          <Link to="/explore">
            <GlassCard variant="file" className="p-6 cursor-pointer h-full">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-cyan-500/20 flex items-center justify-center shrink-0">
                  <Folder size={28} className="text-cyan-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-200 text-lg">Browse</h3>
                  <p className="text-slate-500 text-sm">Explore by topic</p>
                </div>
                <ArrowRight size={20} className="text-slate-500 ml-auto" />
              </div>
            </GlassCard>
          </Link>
        </div>
      </section>

      <section>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-4"
        >
          <h2 className="text-lg font-semibold text-slate-200">Collections</h2>
          <Link to="/restaurants" className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300">
            View all <ArrowRight size={14} />
          </Link>
        </motion.div>
        <GlassCard className="p-8 text-center">
          <Folder size={40} className="mx-auto mb-3 text-slate-500" />
          <h3 className="font-medium text-slate-200 mb-1">Your saved videos</h3>
          <p className="text-slate-500 text-sm mb-4">Save videos from Media to build your collection</p>
          <Link
            to="/restaurants"
            className="inline-block px-5 py-2.5 rounded-lg bg-slate-700/50 border border-slate-600 hover:bg-slate-600/50 text-slate-200 font-medium transition-colors"
          >
            My Collections
          </Link>
        </GlassCard>
      </section>
    </div>
  )
}

export default Home
