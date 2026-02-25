import { motion } from 'framer-motion'

function GlassCard({ children, className = '', variant = 'default' }) {
  const baseClass = variant === 'file'
    ? 'backdrop-blur-xl bg-slate-800/40 border border-slate-700/50 rounded-xl shadow-lg file-card'
    : 'backdrop-blur-xl bg-slate-800/30 border border-slate-700/40 rounded-xl shadow-lg'

  return (
    <motion.div
      whileHover={{ y: variant === 'file' ? -1 : -2, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`${baseClass} ${className}`}
    >
      {children}
    </motion.div>
  )
}

export default GlassCard
