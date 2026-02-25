import { NavLink } from 'react-router-dom'
import { FileQuestion, Home } from 'lucide-react'

function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <FileQuestion size={64} className="text-slate-600 mb-4" />
      <div className="text-6xl font-bold text-slate-700">404</div>
      <p className="text-slate-500 mt-2">This page could not be found.</p>
      <NavLink
        to="/"
        className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-slate-700/50 border border-slate-600 hover:bg-slate-600/50 text-slate-200 font-medium transition-colors"
      >
        <Home size={18} />
        Back to My Drive
      </NavLink>
    </div>
  )
}

export default NotFound
