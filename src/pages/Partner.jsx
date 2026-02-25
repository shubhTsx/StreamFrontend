import { Link } from 'react-router-dom'
import GlassCard from '../ui/GlassCard.jsx'
import { Share2, Upload, Shield } from 'lucide-react'

function Partner() {
  return (
    <div className="px-4 lg:px-8 py-6 space-y-6 max-w-3xl mx-auto">
      <div>
        <h2 className="text-2xl font-semibold text-slate-200">Become a Provider</h2>
        <p className="text-slate-500 mt-1">Share your collections and grow with CloudDrive</p>
      </div>

      <GlassCard className="p-8">
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0">
              <Share2 size={24} className="text-blue-400" />
            </div>
            <div>
              <h3 className="font-medium text-slate-200 mb-1">Share Your Content</h3>
              <p className="text-slate-500 text-sm">Publish your collections and reach more users.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
              <Upload size={24} className="text-emerald-400" />
            </div>
            <div>
              <h3 className="font-medium text-slate-200 mb-1">Easy Management</h3>
              <p className="text-slate-500 text-sm">Manage items and analytics from one dashboard.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
              <Shield size={24} className="text-amber-400" />
            </div>
            <div>
              <h3 className="font-medium text-slate-200 mb-1">Secure Platform</h3>
              <p className="text-slate-500 text-sm">Your content is protected with enterprise-grade security.</p>
            </div>
          </div>
          <Link
            to="/auth"
            className="inline-block px-6 py-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors"
          >
            Get Started
          </Link>
        </div>
      </GlassCard>
    </div>
  )
}

export default Partner
