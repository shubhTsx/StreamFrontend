import { useState } from 'react'
import GlassCard from '../ui/GlassCard.jsx'
import { motion } from 'framer-motion'
import { Mail, Lock, Shield, Eye, EyeOff, Key } from 'lucide-react'
import api from '../utils/api'
import { useNavigate } from 'react-router-dom'
import { authEvents } from '../utils/authEvents'

function AdminLogin() {
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const navigate = useNavigate()

    const handleAdminLogin = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        const formData = new FormData(e.target)
        const data = Object.fromEntries(formData)

        try {
            const response = await api.post('/foodPartner/login', {
                email: data.email,
                password: data.password,
                adminCode: data.adminCode
            })

            const partnerData = response.data.foodPartner
            if (partnerData) {
                localStorage.setItem('user', JSON.stringify(partnerData))
                localStorage.setItem('userType', 'partner')
                localStorage.setItem('token', response.data.token || 'logged-in')
                authEvents.emit({ user: partnerData, userType: 'partner' })
                navigate('/partner-dashboard')
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Check your credentials and admin code.')
        } finally {
            setLoading(false)
        }
    }

    const inputClass = "w-full pl-9 pr-4 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:border-violet-500/50"

    return (
        <div className="max-w-md mx-auto px-4 py-12">
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-6"
            >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-500/25">
                    <Shield size={28} className="text-white" />
                </div>
                <h1 className="text-2xl font-bold text-slate-200 mb-1">Admin Access</h1>
                <p className="text-slate-500 text-sm">Authorized personnel only</p>
            </motion.div>

            {error && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-center text-sm"
                >{error}</motion.div>
            )}

            <GlassCard className="p-6">
                <form onSubmit={handleAdminLogin} className="space-y-4">
                    <div>
                        <label className="text-sm text-slate-500">Admin Code</label>
                        <div className="relative mt-1">
                            <Key size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                                type="password" name="adminCode" required className={inputClass}
                                placeholder="Enter admin access code"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm text-slate-500">Email</label>
                        <div className="relative mt-1">
                            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input type="email" name="email" required className={inputClass} placeholder="Enter admin email" />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm text-slate-500">Password</label>
                        <div className="relative mt-1">
                            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                                type={showPassword ? "text" : "password"} name="password" required
                                className="w-full pl-9 pr-10 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:border-violet-500/50"
                                placeholder="Enter admin password"
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-400"
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>
                    <button type="submit" disabled={loading}
                        className="w-full py-2.5 rounded-lg bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 disabled:opacity-50 text-white font-semibold text-sm transition-all shadow-lg shadow-violet-500/20"
                    >
                        {loading ? 'Authenticating...' : 'Sign In as Admin'}
                    </button>
                </form>
            </GlassCard>
        </div>
    )
}

export default AdminLogin
