import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import GlassCard from '../ui/GlassCard.jsx'
import { motion } from 'framer-motion'
import { Search, FileVideo, Grid3X3, List, Bookmark, Play } from 'lucide-react'
import api from '../utils/api'

function Explore() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(false)
  const [viewMode, setViewMode] = useState('grid')
  const [categories, setCategories] = useState(['All'])
  const [savedIds, setSavedIds] = useState(new Set())

  useEffect(() => {
    fetchVideos()
  }, [])

  useEffect(() => {
    if (videos.length > 0) {
      const cats = [...new Set(videos.map((v) => v.category || v.foodItem?.category || 'Other').filter(Boolean))]
      cats.sort()
      setCategories(['All', ...cats])
    }
  }, [videos])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) fetchSavedIds()
  }, [])

  const fetchVideos = async () => {
    setLoading(true)
    try {
      const response = await api.get('/food/reels?limit=100')
      const data = response.data
      const reels = Array.isArray(data) ? data : (data.reels || data.videos || [])
      setVideos(reels)
    } catch (error) {
      console.error('Error fetching videos:', error)
      setVideos([])
    } finally {
      setLoading(false)
    }
  }

  const fetchSavedIds = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return
      const response = await api.get('/user/interactions', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const saved = (response.data.savedItems || []).map((s) => s._id || s.id)
      setSavedIds(new Set(saved))
    } catch (err) {
      console.error('Error fetching saved:', err)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchVideos()
      return
    }
    setLoading(true)
    try {
      const response = await api.get(
        `/food/search?query=${encodeURIComponent(searchQuery)}&type=reel`
      )
      const results = response.data.results || []
      setVideos(results.filter((r) => r.isReel !== false))
    } catch (error) {
      console.error('Error searching:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (videoId) => {
    const token = localStorage.getItem('token')
    if (!token) {
      window.location.href = '/auth'
      return
    }
    try {
      await api.post(`/user/save/${videoId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setSavedIds((prev) => {
        const next = new Set(prev)
        if (next.has(videoId)) next.delete(videoId)
        else next.add(videoId)
        return next
      })
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.message || 'Failed to save')
    }
  }


  const filteredVideos =
    selectedCategory === 'All'
      ? videos
      : videos.filter((v) => {
        const cat = v.category || v.foodItem?.category || 'Other'
        return cat === selectedCategory
      })

  const displayCategories = categories.map((cat) => ({
    id: cat,
    label: cat,
  }))

  return (
    <div className="px-4 lg:px-8 py-6 space-y-6 max-w-7xl mx-auto">
      <motion.h2
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-semibold text-slate-200"
      >
        Browse Videos
      </motion.h2>

      <GlassCard className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search
              size={20}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search videos..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-5 py-2.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Search size={18} />
            Search
          </button>
        </div>
      </GlassCard>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {displayCategories.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setSelectedCategory(id)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm transition-all ${selectedCategory === id
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'bg-slate-800/50 text-slate-400 border border-slate-700 hover:bg-slate-700/50'
                }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${viewMode === 'grid'
                ? 'bg-blue-500/20 text-blue-400'
                : 'bg-slate-800/50 text-slate-500 hover:text-slate-300'
              }`}
          >
            <Grid3X3 size={18} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${viewMode === 'list'
                ? 'bg-blue-500/20 text-blue-400'
                : 'bg-slate-800/50 text-slate-500 hover:text-slate-300'
              }`}
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-slate-600 border-t-blue-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div
          className={
            viewMode === 'grid'
              ? 'grid sm:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-2'
          }
        >
          {filteredVideos.map((video) => {
            const vid = video.id || video._id
            const thumb = video.thumbnail || video.image
            const title = video.title || video.foodname
            const desc = video.description
            const cat = video.category || video.foodItem?.category

            return (
              <motion.div
                key={vid}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <GlassCard
                  variant="file"
                  className={viewMode === 'list' ? 'p-4 flex items-center gap-4' : 'p-4'}
                >
                  <div
                    className={
                      viewMode === 'grid'
                        ? 'aspect-video rounded-lg bg-slate-800 overflow-hidden mb-4 relative group'
                        : 'w-24 h-16 rounded-lg bg-slate-800 overflow-hidden shrink-0 relative'
                    }
                  >
                    {thumb ? (
                      <img
                        src={thumb}
                        alt={title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Play size={24} className="text-slate-500" />
                      </div>
                    )}
                    <Link to="/videos" className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="p-3 rounded-full bg-white/20 hover:bg-white/30">
                        <Play size={24} className="text-white" />
                      </span>
                    </Link>
                  </div>
                  <div className={viewMode === 'grid' ? 'space-y-2' : 'flex-1 min-w-0'}>
                    <h3 className="font-medium text-slate-200 truncate">{title}</h3>
                    {viewMode === 'grid' && (
                      <p className="text-sm text-slate-500 line-clamp-2">
                        {desc}
                      </p>
                    )}
                    {cat && (
                      <div className="mt-2">
                        <span className="text-slate-500 text-sm">{cat}</span>
                      </div>
                    )}
                    <button
                      onClick={() => handleSave(vid)}
                      className={`w-full mt-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${savedIds.has(vid)
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-slate-700/50 hover:bg-slate-600/50 text-slate-200 border border-slate-600'
                        }`}
                    >
                      <Bookmark
                        size={16}
                        fill={savedIds.has(vid) ? 'currentColor' : 'none'}
                      />
                      {savedIds.has(vid) ? 'Saved' : 'Add to Collection'}
                    </button>
                  </div>
                </GlassCard>
              </motion.div>
            )
          })}
        </div>
      )}

      {filteredVideos.length === 0 && !loading && (
        <div className="text-center py-16">
          <FileVideo size={48} className="mx-auto mb-4 text-slate-600" />
          <p className="text-slate-500">No videos found. Try a different search or filter.</p>
        </div>
      )}
    </div>
  )
}

export default Explore
