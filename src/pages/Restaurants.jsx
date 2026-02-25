import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import GlassCard from '../ui/GlassCard.jsx'
import { FolderOpen, Bookmark, Play } from 'lucide-react'
import api from '../utils/api'

function Restaurants() {
  const [savedVideos, setSavedVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [savedIds, setSavedIds] = useState(new Set())
  const navigate = useNavigate()

  useEffect(() => {
    fetchSavedVideos()
  }, [])

  const fetchSavedVideos = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/auth')
      return
    }
    setLoading(true)
    try {
      const response = await api.get('/user/interactions', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const saved = response.data.savedItems || []
      setSavedVideos(saved.filter((s) => s.isReel !== false || s.video))
      setSavedIds(new Set(saved.map((s) => s._id || s.id)))
    } catch (error) {
      console.error('Error fetching collections:', error)
      setSavedVideos([])
    } finally {
      setLoading(false)
    }
  }

  const handleUnsave = async (videoId) => {
    const token = localStorage.getItem('token')
    if (!token) return
    try {
      await api.post(`/user/save/${videoId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setSavedVideos((prev) => prev.filter((v) => (v._id || v.id) !== videoId))
      setSavedIds((prev) => {
        const next = new Set(prev)
        next.delete(videoId)
        return next
      })
    } catch (err) {
      console.error(err)
    }
  }

  if (!localStorage.getItem('token')) {
    return (
      <div className="px-4 lg:px-8 py-6">
        <div className="max-w-md mx-auto text-center py-16">
          <Bookmark size={48} className="mx-auto mb-4 text-slate-500" />
          <h2 className="text-xl font-semibold text-slate-200 mb-2">Sign in required</h2>
          <p className="text-slate-500 mb-6">Sign in to view your saved video collections.</p>
          <button
            onClick={() => navigate('/auth')}
            className="px-6 py-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium"
          >
            Sign in
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 lg:px-8 py-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-semibold text-slate-200">Collections</h2>
        <p className="text-slate-500 mt-1">Your saved videos</p>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-slate-600 border-t-blue-500 rounded-full animate-spin" />
        </div>
      )}

      {!loading && savedVideos.length === 0 && (
        <GlassCard className="p-16 text-center">
          <FolderOpen size={48} className="mx-auto mb-4 text-slate-600" />
          <p className="text-slate-500 mb-4">No saved videos yet.</p>
          <p className="text-slate-600 text-sm mb-6">
            Save videos from Media or Browse to add them here.
          </p>
          <button
            onClick={() => navigate('/videos')}
            className="px-5 py-2.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium"
          >
            Browse Media
          </button>
        </GlassCard>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {!loading &&
          savedVideos.map((video) => {
            const vid = video._id || video.id
            const thumb = video.thumbnail || video.image
            const title = video.foodname || video.title
            const cat = video.category

            return (
              <GlassCard key={vid} variant="file" className="p-5 group">
                <div
                  className="aspect-video rounded-lg bg-slate-800 overflow-hidden mb-4 cursor-pointer"
                  onClick={() => navigate('/videos')}
                >
                  {thumb ? (
                    <img
                      src={thumb}
                      alt={title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Play size={32} className="text-slate-500" />
                    </div>
                  )}
                </div>
                <h3 className="font-medium text-slate-200 truncate">{title}</h3>
                {cat && (
                  <p className="text-sm text-slate-500 mb-3">{cat}</p>
                )}
                <button
                  onClick={() => handleUnsave(vid)}
                  className="w-full py-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 text-sm font-medium flex items-center justify-center gap-2"
                >
                  <Bookmark size={16} fill="currentColor" />
                  Remove from Collection
                </button>
              </GlassCard>
            )
          })}
      </div>
    </div>
  )
}

export default Restaurants
