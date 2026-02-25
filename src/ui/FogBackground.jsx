import { useMemo } from 'react'
import { motion } from 'framer-motion'

function FogBlob({ delay = 0, size = 300, color = 'rgba(59, 130, 246, 0.04)' }) {
  const style = useMemo(() => ({
    width: size,
    height: size,
    background: `radial-gradient(circle at 30% 30%, ${color}, transparent 70%)`,
  }), [size, color])

  return (
    <motion.div
      className="absolute rounded-full blur-3xl"
      style={style}
      initial={{ opacity: 0.3 }}
      animate={{ opacity: 0.5, x: [0, 20, -10, 0], y: [0, -10, 15, 0] }}
      transition={{ duration: 25, delay, repeat: Infinity, ease: 'easeInOut' }}
    />
  )
}

function FogBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(1400px_800px_at_0%_0%,rgba(59,130,246,0.06),transparent_50%),radial-gradient(1000px_600px_at_100%_0%,rgba(6,182,212,0.05),transparent_50%)]" />
      <FogBlob delay={0} size={400} color="rgba(59,130,246,0.05)" />
      <FogBlob delay={8} size={350} color="rgba(6,182,212,0.04)" />
    </div>
  )
}

export default FogBackground
