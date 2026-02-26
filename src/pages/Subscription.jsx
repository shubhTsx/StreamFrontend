import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Upload, CreditCard, Clock, CheckCircle, XCircle, AlertCircle, QrCode, Hash, RefreshCw } from 'lucide-react'
import GlassCard from '../ui/GlassCard.jsx'
import api from '../utils/api'
import { useNavigate } from 'react-router-dom'

function Subscription() {
    const [status, setStatus] = useState('loading') // loading, none, pending, approved, rejected
    const [subscription, setSubscription] = useState(null)
    const [utrCode, setUtrCode] = useState('')
    const [screenshot, setScreenshot] = useState(null)
    const [screenshotPreview, setScreenshotPreview] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const navigate = useNavigate()

    useEffect(() => {
        const userType = localStorage.getItem('userType')
        const token = localStorage.getItem('token')
        if (!token) {
            navigate('/auth')
            return
        }
        if (userType === 'partner') {
            navigate('/partner-dashboard')
            return
        }
        fetchSubscriptionStatus()
    }, [navigate])

    const fetchSubscriptionStatus = async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await api.get('/subscription/status', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const { subscriptionStatus, subscription: sub } = response.data
            setStatus(subscriptionStatus || 'none')
            setSubscription(sub)

            if (subscriptionStatus === 'approved') {
                localStorage.setItem('user', JSON.stringify({
                    ...JSON.parse(localStorage.getItem('user') || '{}'),
                    subscriptionStatus: 'approved'
                }))
            }
        } catch (err) {
            setStatus('none')
        }
    }

    const handleScreenshotChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setScreenshot(file)
            const reader = new FileReader()
            reader.onloadend = () => setScreenshotPreview(reader.result)
            reader.readAsDataURL(file)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!utrCode.trim()) {
            setError('Please enter the UTR code')
            return
        }
        if (!screenshot) {
            setError('Please upload the payment screenshot')
            return
        }

        setLoading(true)
        setError('')
        setSuccess('')

        try {
            const token = localStorage.getItem('token')
            const formData = new FormData()
            formData.append('utrCode', utrCode.trim())
            formData.append('screenshot', screenshot)

            const response = await api.post('/subscription/submit', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            })

            setSuccess(response.data.message)
            setStatus('pending')

            // Update localStorage
            const userData = JSON.parse(localStorage.getItem('user') || '{}')
            userData.subscriptionStatus = 'pending'
            localStorage.setItem('user', JSON.stringify(userData))

            fetchSubscriptionStatus()
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleResubmit = () => {
        setStatus('none')
        setUtrCode('')
        setScreenshot(null)
        setScreenshotPreview(null)
        setError('')
        setSuccess('')
    }

    if (status === 'loading') {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                    <RefreshCw size={32} className="text-blue-400" />
                </motion.div>
            </div>
        )
    }

    // Approved — redirect to home
    if (status === 'approved') {
        return (
            <div className="max-w-lg mx-auto px-4 py-12">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                >
                    <GlassCard className="p-8 text-center">
                        <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                            <CheckCircle size={40} className="text-emerald-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-200 mb-2">Subscription Active!</h2>
                        <p className="text-slate-400 mb-6">Your payment has been verified. Enjoy full access to all content.</p>
                        <button
                            onClick={() => navigate('/')}
                            className="px-6 py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold transition-all"
                        >
                            Go to Home
                        </button>
                    </GlassCard>
                </motion.div>
            </div>
        )
    }

    // Pending status
    if (status === 'pending') {
        return (
            <div className="max-w-lg mx-auto px-4 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <GlassCard className="p-8 text-center">
                        <div className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-6">
                            <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                <Clock size={40} className="text-amber-400" />
                            </motion.div>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-200 mb-2">Payment Under Review</h2>
                        <p className="text-slate-400 mb-4">
                            Your payment screenshot and UTR code have been submitted. Our team will verify and approve your subscription shortly.
                        </p>

                        {subscription && (
                            <div className="mt-6 space-y-3">
                                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                                    <span className="text-slate-500 text-sm">UTR Code</span>
                                    <span className="text-slate-300 font-mono text-sm">{subscription.utrCode}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                                    <span className="text-slate-500 text-sm">Amount</span>
                                    <span className="text-slate-300 font-semibold">₹{subscription.amount}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                                    <span className="text-slate-500 text-sm">Status</span>
                                    <span className="px-3 py-1 rounded-full text-xs bg-amber-500/20 text-amber-400 font-medium">Pending</span>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                                    <span className="text-slate-500 text-sm">Submitted</span>
                                    <span className="text-slate-300 text-sm">{new Date(subscription.createdAt).toLocaleString()}</span>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={fetchSubscriptionStatus}
                            className="mt-6 flex items-center gap-2 mx-auto px-5 py-2.5 rounded-lg bg-slate-700/50 border border-slate-600 hover:bg-slate-600/50 text-slate-300 text-sm transition-all"
                        >
                            <RefreshCw size={16} />
                            Check Status
                        </button>
                    </GlassCard>
                </motion.div>
            </div>
        )
    }

    // Rejected status
    if (status === 'rejected') {
        return (
            <div className="max-w-lg mx-auto px-4 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <GlassCard className="p-8 text-center">
                        <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
                            <XCircle size={40} className="text-red-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-200 mb-2">Payment Rejected</h2>
                        <p className="text-slate-400 mb-4">
                            Your payment could not be verified. Please try again with a valid payment.
                        </p>

                        {subscription?.rejectedReason && (
                            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                                <p className="text-red-400 text-sm">
                                    <strong>Reason:</strong> {subscription.rejectedReason}
                                </p>
                            </div>
                        )}

                        <button
                            onClick={handleResubmit}
                            className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold transition-all"
                        >
                            Try Again
                        </button>
                    </GlassCard>
                </motion.div>
            </div>
        )
    }

    // Default: none — show subscription purchase form
    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
            >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-500/25">
                    <CreditCard size={32} className="text-white" />
                </div>
                <h1 className="text-3xl font-bold text-slate-200 mb-2">Get Premium Access</h1>
                <p className="text-slate-400">Unlock all content with a one-time payment</p>
            </motion.div>

            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-center text-sm flex items-center justify-center gap-2"
                >
                    <AlertCircle size={16} />
                    {error}
                </motion.div>
            )}

            {success && (
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-center text-sm flex items-center justify-center gap-2"
                >
                    <CheckCircle size={16} />
                    {success}
                </motion.div>
            )}

            <div className="grid gap-6 lg:grid-cols-2">
                {/* QR Code / Payment Info */}
                <motion.div
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <GlassCard className="p-6 h-full">
                        <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
                            <QrCode size={20} className="text-violet-400" />
                            Step 1: Make Payment
                        </h2>

                        {/* Price Card */}
                        <div className="mb-6 p-5 rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20">
                            <div className="text-center">
                                <p className="text-slate-400 text-sm mb-1">One-Time Payment</p>
                                <p className="text-4xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">₹399</p>
                                <p className="text-slate-500 text-xs mt-1">Lifetime Access</p>
                            </div>
                        </div>

                        {/* QR Code Placeholder */}
                        <div className="aspect-square max-w-[240px] mx-auto rounded-2xl bg-white p-4 mb-4">
                            <div className="w-full h-full rounded-lg bg-slate-100 flex items-center justify-center">
                                <div className="text-center">
                                    <QrCode size={80} className="text-slate-800 mx-auto mb-2" />
                                    <p className="text-slate-600 text-xs font-medium">Scan to Pay</p>
                                    <p className="text-slate-500 text-[10px] mt-1">UPI QR Code</p>
                                </div>
                            </div>
                        </div>

                        <p className="text-slate-500 text-xs text-center">
                            Scan the QR code above using any UPI app (GPay, PhonePe, Paytm, etc.)
                        </p>
                    </GlassCard>
                </motion.div>

                {/* Upload Form */}
                <motion.div
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <GlassCard className="p-6 h-full">
                        <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
                            <Upload size={20} className="text-cyan-400" />
                            Step 2: Submit Proof
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* UTR Code Input */}
                            <div>
                                <label className="text-sm text-slate-400 mb-1.5 block">UTR / Transaction Reference Number</label>
                                <div className="relative">
                                    <Hash size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                    <input
                                        type="text"
                                        required
                                        value={utrCode}
                                        onChange={(e) => setUtrCode(e.target.value)}
                                        className="w-full pl-9 pr-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:border-violet-500/50 transition-colors"
                                        placeholder="Enter 12-digit UTR code"
                                    />
                                </div>
                                <p className="text-slate-600 text-xs mt-1.5">Found in your UPI app's transaction details</p>
                            </div>

                            {/* Screenshot Upload */}
                            <div>
                                <label className="text-sm text-slate-400 mb-1.5 block">Payment Screenshot</label>
                                {screenshotPreview ? (
                                    <div className="relative rounded-lg overflow-hidden border border-slate-700 mb-2">
                                        <img
                                            src={screenshotPreview}
                                            alt="Payment screenshot"
                                            className="w-full max-h-48 object-contain bg-slate-800/50"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setScreenshot(null)
                                                setScreenshotPreview(null)
                                            }}
                                            className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/80 hover:bg-red-500/80 text-slate-300 transition-colors"
                                        >
                                            <XCircle size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center w-full h-36 rounded-lg bg-slate-800/30 border-2 border-dashed border-slate-700 hover:border-violet-500/50 cursor-pointer transition-colors">
                                        <Upload size={28} className="text-slate-500 mb-2" />
                                        <span className="text-slate-400 text-sm">Click to upload screenshot</span>
                                        <span className="text-slate-600 text-xs mt-1">PNG, JPG up to 5MB</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleScreenshotChange}
                                            className="hidden"
                                            required
                                        />
                                    </label>
                                )}
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading || !utrCode.trim() || !screenshot}
                                className="w-full py-3.5 rounded-lg bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all shadow-lg shadow-violet-500/20"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                                            <RefreshCw size={16} />
                                        </motion.div>
                                        Submitting...
                                    </span>
                                ) : (
                                    'Submit for Verification'
                                )}
                            </button>
                        </form>

                        <div className="mt-5 p-4 rounded-lg bg-slate-800/30 border border-slate-700/50">
                            <h3 className="text-slate-300 text-sm font-medium mb-2">How it works:</h3>
                            <ol className="text-slate-500 text-xs space-y-1.5 list-decimal list-inside">
                                <li>Scan the QR code and pay ₹399</li>
                                <li>Note the UTR/reference number from transaction</li>
                                <li>Take a screenshot of payment confirmation</li>
                                <li>Enter UTR and upload screenshot above</li>
                                <li>Wait for approval (usually within 24 hours)</li>
                            </ol>
                        </div>
                    </GlassCard>
                </motion.div>
            </div>
        </div>
    )
}

export default Subscription
