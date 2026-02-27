import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, MessageCircle, Share, Bookmark, Play, Pause, Volume2, VolumeX, X, Send, Maximize, Minimize, ChevronUp } from 'lucide-react'
import GlassCard from '../ui/GlassCard.jsx'
import api from '../utils/api'

function VideoFeed() {
  const navigate = useNavigate()
  const [currentVideo, setCurrentVideo] = useState(0)
  const [likedVideos, setLikedVideos] = useState(new Set())
  const [savedVideos, setSavedVideos] = useState(new Set())
  const [comments, setComments] = useState({})
  const [isPlaying, setIsPlaying] = useState(true)
  const [isMuted, setIsMuted] = useState(true)
  const [showComments, setShowComments] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showControls, setShowControls] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [infoExpanded, setInfoExpanded] = useState(false)
  const [infoMaxExpanded, setInfoMaxExpanded] = useState(false)
  const videoRef = useRef(null)
  const controlsTimer = useRef(null)
  const infoBoxRef = useRef(null)

  // Fetch videos from backend
  useEffect(() => {
    fetchVideos()
    fetchUserInteractions()
  }, [])

  const fetchUserInteractions = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return
      const response = await api.get('/user/interactions', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const { likedItems, savedItems } = response.data
      if (likedItems) {
        setLikedVideos(new Set(likedItems.map(item => item._id)))
      }
      if (savedItems) {
        setSavedVideos(new Set(savedItems.map(item => item._id)))
      }
    } catch (error) {
      // Silently fail - user just won't see pre-populated likes
    }
  }

  const fetchVideos = async () => {
    try {
      const response = await api.get('/food/reels?limit=50')
      const data = response.data
      const reels = Array.isArray(data) ? data : (data.reels || data.videos || [])
      setVideos(reels)
    } catch (error) {
      setVideos([])
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async (videoId) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        // Redirect to login if not authenticated
        window.location.href = '/auth'
        return
      }

      const response = await api.post(`/user/like/${videoId}`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      // Update local state
      setLikedVideos(prev => {
        const newSet = new Set(prev)
        if (response.data.isLiked) {
          newSet.add(videoId)
        } else {
          newSet.delete(videoId)
        }
        return newSet
      })

      // Update video likes count
      setVideos(prev => prev.map(video =>
        video.id === videoId
          ? { ...video, likes: response.data.totalLikes }
          : video
      ))
    } catch (error) {
      // Silently handle
    }
  }

  const handleSave = async (videoId) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        // Redirect to login if not authenticated
        window.location.href = '/auth'
        return
      }

      const response = await api.post(`/user/save/${videoId}`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      // Update local state
      setSavedVideos(prev => {
        const newSet = new Set(prev)
        if (response.data.isSaved) {
          newSet.add(videoId)
        } else {
          newSet.delete(videoId)
        }
        return newSet
      })
    } catch (error) {
      // Silently handle
    }
  }

  const handleComment = async (videoId) => {
    if (newComment.trim()) {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          // Redirect to login if not authenticated
          window.location.href = '/auth'
          return
        }

        const response = await api.post(`/user/comment/${videoId}`, {
          text: newComment
        }, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        // Update local comments
        setComments(prev => ({
          ...prev,
          [videoId]: [...(prev[videoId] || []), response.data.comment]
        }))

        // Update video comments count
        setVideos(prev => prev.map(video =>
          video.id === videoId
            ? { ...video, comments: response.data.totalComments }
            : video
        ))

        setNewComment('')
      } catch (error) {
        // Silently handle
      }
    }
  }

  const fetchComments = async (videoId) => {
    try {
      const response = await api.get(`/user/comments/${videoId}`)
      setComments(prev => ({
        ...prev,
        [videoId]: response.data.comments || []
      }))
    } catch (error) {
      // Silently handle
    }
  }

  const handleShowComments = (videoId) => {
    setShowComments(!showComments)
    if (!showComments && !comments[videoId]) {
      fetchComments(videoId)
    }
  }

  const handleShare = async (videoId) => {
    try {
      // Increment share count on backend
      await api.post(`/user/share/${videoId}`)

      // Update local share count
      setVideos(prev => prev.map(video =>
        video.id === videoId
          ? { ...video, shares: (video.shares || 0) + 1 }
          : video
      ))

      // Copy link to clipboard
      const videoUrl = `${window.location.origin}/videos/${videoId}`
      await navigator.clipboard.writeText(videoUrl)
    } catch (error) {
      // Silently handle
    }
  }

  const handleScroll = (direction) => {
    if (direction === 'up' && currentVideo > 0) {
      setCurrentVideo(currentVideo - 1)
    } else if (direction === 'down' && currentVideo < videos.length - 1) {
      setCurrentVideo(currentVideo + 1)
    }
  }

  // Wheel scroll to navigate like reels
  const wheelTimeout = useRef(null)
  const onWheel = (e) => {
    // Debounce to prevent skipping multiple videos per gesture
    if (wheelTimeout.current) return
    wheelTimeout.current = setTimeout(() => {
      wheelTimeout.current = null
    }, 350)
    if (e.deltaY > 0) handleScroll('down')
    else if (e.deltaY < 0) handleScroll('up')
  }

  // Touch swipe to navigate on mobile
  const touchStartY = useRef(null)
  const onTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY
  }
  const onTouchEnd = (e) => {
    if (touchStartY.current === null) return
    const endY = e.changedTouches[0].clientY
    const diff = touchStartY.current - endY
    if (Math.abs(diff) > 40) {
      if (diff > 0) handleScroll('down')
      else handleScroll('up')
    }
    touchStartY.current = null
  }

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const [orientationLocked, setOrientationLocked] = useState(false)

  const toggleFullscreen = async () => {
    const container = document.getElementById('video-player-container')
    if (!container) return
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      await container.requestFullscreen().catch(() => { })
      // Try native orientation lock first
      try {
        if (screen.orientation?.lock) {
          await screen.orientation.lock('landscape')
          setOrientationLocked(true)
          return
        }
      } catch (e) { /* not supported, will use CSS fallback */ }
      setOrientationLocked(false)
    }
  }

  // Track fullscreen state
  useEffect(() => {
    const onFullscreenChange = () => {
      const fs = !!document.fullscreenElement
      setIsFullscreen(fs)
      if (!fs) {
        try {
          if (screen.orientation?.unlock) screen.orientation.unlock()
        } catch (e) { /* ignore */ }
        setOrientationLocked(false)
      }
    }
    document.addEventListener('fullscreenchange', onFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange)
  }, [])

  // Check if device is in portrait (needs CSS rotation in fullscreen)
  const needsCssRotation = isFullscreen && !orientationLocked && typeof window !== 'undefined' && window.innerHeight > window.innerWidth

  const fullscreenStyle = needsCssRotation ? {
    transform: 'rotate(90deg)',
    transformOrigin: 'center center',
    width: '100vh',
    height: '100vw',
    position: 'fixed',
    top: '50%',
    left: '50%',
    marginTop: 'calc(-50vw)',
    marginLeft: 'calc(-50vh)',
  } : {}

  // Auto-hide controls after 3 seconds
  const resetControlsTimer = () => {
    if (controlsTimer.current) clearTimeout(controlsTimer.current)
    setShowControls(true)
    controlsTimer.current = setTimeout(() => {
      if (isPlaying) setShowControls(false)
    }, 3000)
  }

  const handleVideoTap = (e) => {
    // Don't toggle if tapping a button
    if (e.target.closest('button')) return
    if (showControls) {
      setShowControls(false)
      if (controlsTimer.current) clearTimeout(controlsTimer.current)
    } else {
      resetControlsTimer()
    }
  }

  // Ensure video updates correctly when switching items
  useEffect(() => {
    // Reset info box state for new video
    setInfoExpanded(false)
    setInfoMaxExpanded(false)
    if (!videoRef.current || !videos[currentVideo]) return
    try {
      // Reset the media element source and playback based on isPlaying
      videoRef.current.muted = isMuted
      videoRef.current.load() // Force reload the video
      const playIfNeeded = async () => {
        if (isPlaying) {
          try {
            await videoRef.current.play()
          } catch (err) {
            // Play was prevented (autoplay policy)
          }
        } else {
          videoRef.current.pause()
        }
      }
      // Small delay to ensure video is loaded
      setTimeout(playIfNeeded, 100)
    } catch (err) {
      // Silently handle video switch errors
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentVideo])

  // Keep mute state in sync if user toggles
  useEffect(() => {
    if (!videoRef.current) return
    videoRef.current.muted = isMuted
  }, [isMuted])

  // Require login to stream videos
  if (!localStorage.getItem('token')) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <Play size={48} className="mx-auto mb-4 text-slate-500" />
          <h2 className="text-xl font-semibold text-slate-200 mb-2">Sign in to stream</h2>
          <p className="text-slate-500 mb-6">Videos are only available to signed-in users.</p>
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

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-950">
        <div className="text-slate-400">Loading media...</div>
      </div>
    )
  }

  if (videos.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center text-slate-400">
          <h2 className="text-xl font-semibold text-slate-300 mb-2">No media files</h2>
          <p className="text-slate-500">Check back later for new content.</p>
        </div>
      </div>
    )
  }

  return (
    <div id="video-player-container" className="video-feed-container overflow-hidden bg-slate-950" onWheel={onWheel} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <div className="relative h-full" style={fullscreenStyle}>
        {/* Video Container */}
        <div className="relative h-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentVideo}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: 'linear' }}
              className={`relative h-full w-full ${isFullscreen ? 'bg-black' : ''}`}
              onClick={handleVideoTap}
            >
              {/* Video Element */}
              <video
                ref={videoRef}
                key={videos[currentVideo].id}
                src={videos[currentVideo].videoUrl}
                className="absolute inset-0 w-full h-full object-cover"
                autoPlay
                muted={isMuted}
                playsInline
                loop
                controls={false}
                onLoadedMetadata={() => {
                  try {
                    if (isPlaying && videoRef.current) {
                      videoRef.current.play().catch(() => { })
                    }
                  } catch (err) { /* ignore */ }
                }}
                onCanPlay={() => {
                  if (videoRef.current && isPlaying) {
                    videoRef.current.play().catch(() => { })
                  }
                }}
              />

              {/* Tap overlay — dims only when controls visible */}
              <div className={`absolute inset-0 transition-opacity duration-300 ${showControls ? 'bg-black/30' : 'bg-transparent'}`} />

              {/* Play/Pause center button */}
              <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <button
                  onClick={(e) => { e.stopPropagation(); togglePlayPause(); resetControlsTimer() }}
                  className="p-4 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all"
                >
                  {isPlaying ? <Pause size={32} className="text-white" /> : <Play size={32} className="text-white" />}
                </button>
              </div>

              {/* Video Info — bottom */}
              <div className={`absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-white transition-all duration-300 ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>

                {videos[currentVideo].hashtags && videos[currentVideo].hashtags.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {videos[currentVideo].hashtags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 rounded-full text-xs bg-white/20 text-white">{tag}</span>
                    ))}
                  </div>
                )}

                {videos[currentVideo].location && (
                  <div className="mb-3 flex items-center gap-2 text-white/80 text-sm">
                    <span>📍</span>
                    <span>{videos[currentVideo].location}</span>
                  </div>
                )}

                {/* Expandable Info Box */}
                <div
                  ref={infoBoxRef}
                  onClick={(e) => {
                    e.stopPropagation()
                    if (!infoExpanded) {
                      setInfoExpanded(true)
                    } else if (!infoMaxExpanded) {
                      setInfoMaxExpanded(true)
                    } else {
                      setInfoExpanded(false)
                      setInfoMaxExpanded(false)
                    }
                  }}
                  className={`mb-3 p-3 rounded-xl bg-slate-800/70 backdrop-blur-sm border border-slate-700/50 cursor-pointer transition-all duration-300 ${infoMaxExpanded ? 'max-h-[60vh]' : infoExpanded ? 'max-h-[30vh]' : 'max-h-[60px]'
                    } overflow-hidden`}
                  onScroll={(e) => {
                    e.stopPropagation()
                    if (infoExpanded && !infoMaxExpanded) {
                      const el = e.target
                      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10) {
                        setInfoMaxExpanded(true)
                      }
                    }
                  }}
                  style={{ overflowY: infoExpanded ? 'auto' : 'hidden' }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-semibold text-slate-200 text-sm sm:text-base truncate">
                      {videos[currentVideo].title || videos[currentVideo].foodItem?.name || 'Untitled'}
                    </h4>
                    <ChevronUp
                      size={16}
                      className={`text-slate-400 flex-shrink-0 transition-transform duration-300 ${infoExpanded ? 'rotate-180' : 'rotate-0'}`}
                    />
                  </div>
                  <p className={`text-sm text-slate-400 mt-1 ${!infoExpanded ? 'line-clamp-1' : ''}`}>
                    {videos[currentVideo].description || ''}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleLike(videos[currentVideo].id) }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${likedVideos.has(videos[currentVideo].id) ? 'bg-red-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'}`}
                  >
                    <Heart size={20} fill={likedVideos.has(videos[currentVideo].id) ? 'currentColor' : 'none'} />
                    {videos[currentVideo].likes ?? 0}
                  </button>

                  <button
                    onClick={(e) => { e.stopPropagation(); handleShowComments(videos[currentVideo].id) }}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-all"
                  >
                    <MessageCircle size={20} />
                    {videos[currentVideo].comments + (comments[videos[currentVideo].id]?.length || 0)}
                  </button>

                  <button
                    onClick={(e) => { e.stopPropagation(); handleShare(videos[currentVideo].id) }}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-all"
                  >
                    <Share size={20} />
                    Share
                  </button>

                  <button
                    onClick={(e) => { e.stopPropagation(); handleSave(videos[currentVideo].id) }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${savedVideos.has(videos[currentVideo].id) ? 'bg-yellow-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'}`}
                  >
                    <Bookmark size={20} fill={savedVideos.has(videos[currentVideo].id) ? 'currentColor' : 'none'} />
                  </button>
                </div>
              </div>

              {/* Controls - Top Right */}
              <div className={`absolute top-4 right-4 flex items-center gap-2 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <button
                  onClick={(e) => { e.stopPropagation(); toggleFullscreen() }}
                  className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all"
                >
                  {isFullscreen ? <Minimize size={20} className="text-white" /> : <Maximize size={20} className="text-white" />}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); toggleMute() }}
                  className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all"
                >
                  {isMuted ? <VolumeX size={20} className="text-white" /> : <Volume2 size={20} className="text-white" />}
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>


      </div>

      {/* Comments Modal - Instagram Style */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowComments(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md max-h-[80vh] bg-slate-900 backdrop-blur-xl rounded-xl border border-slate-700 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-700">
                <h3 className="text-lg font-semibold text-slate-200">Comments</h3>
                <button
                  onClick={() => setShowComments(false)}
                  className="p-2 rounded-full hover:bg-white/10 transition-all"
                >
                  <X size={20} className="text-white" />
                </button>
              </div>

              {/* Comments List */}
              <div className="max-h-96 overflow-y-auto p-4 space-y-4">
                {comments[videos[currentVideo].id]?.map((comment) => (
                  <div key={comment.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-sm">
                      {comment.user.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-white text-sm">{comment.user}</span>
                        <span className="text-white/60 text-xs">{comment.timestamp}</span>
                      </div>
                      <p className="text-white/80 text-sm">{comment.text}</p>
                    </div>
                  </div>
                ))}

                {(!comments[videos[currentVideo].id] || comments[videos[currentVideo].id].length === 0) && (
                  <div className="text-center text-slate-500 py-8">
                    <MessageCircle size={32} className="mx-auto mb-2 opacity-50" />
                    <p>No comments yet</p>
                    <p className="text-sm">Be the first to comment!</p>
                  </div>
                )}
              </div>

              {/* Comment Input */}
              <div className="p-4 border-t border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-sm">
                    Y
                  </div>
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="flex-1 px-3 py-2 rounded-full bg-white/5 border border-white/10 text-white placeholder-white/50 focus:outline-none focus:border-white/30 text-sm"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleComment(videos[currentVideo].id)
                        }
                      }}
                    />
                    <button
                      onClick={() => handleComment(videos[currentVideo].id)}
                      disabled={!newComment.trim()}
                      className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all disabled:opacity-50"
                    >
                      <Send size={16} className="text-white" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default VideoFeed