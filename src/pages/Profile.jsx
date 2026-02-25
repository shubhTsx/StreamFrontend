import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { User, Settings, Heart, Bookmark, Camera, LogOut, Loader2 } from 'lucide-react'
import GlassCard from '../ui/GlassCard.jsx'
import { useNavigate } from 'react-router-dom'
import { authEvents } from '../utils/authEvents'
import api from '../utils/api'

function Profile() {
  const [activeTab, setActiveTab] = useState('profile')
  const [user, setUser] = useState(null)
  const [userType, setUserType] = useState('user')
  const [uploadingPic, setUploadingPic] = useState(false)
  const [likedItems, setLikedItems] = useState([])
  const [savedItems, setSavedItems] = useState([])
  const [loadingInteractions, setLoadingInteractions] = useState(false)
  const fileInputRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const userData = localStorage.getItem('user')
    const userTypeData = localStorage.getItem('userType')
    if (userData) {
      setUser(JSON.parse(userData))
      setUserType(userTypeData || 'user')
    } else {
      navigate('/auth')
    }
  }, [navigate])

  useEffect(() => {
    if (user) fetchInteractions()
  }, [user])

  const fetchInteractions = async () => {
    setLoadingInteractions(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) return
      const res = await api.get('/user/interactions', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setLikedItems(res.data.likedItems || [])
      setSavedItems(res.data.savedItems || [])
    } catch (err) {
      // silently handle
    } finally {
      setLoadingInteractions(false)
    }
  }

  const handleProfilePicChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploadingPic(true)
    try {
      const token = localStorage.getItem('token')
      const formData = new FormData()
      formData.append('profilePicture', file)

      const res = await api.post('/user/profile-picture', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      })

      const updatedUser = res.data.user
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
      authEvents.emit({ user: updatedUser, userType })
    } catch (err) {
      console.error('Profile picture upload failed:', err)
      alert('Failed to upload profile picture. Please try again.')
    } finally {
      setUploadingPic(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('userType')
    localStorage.removeItem('token')
    authEvents.emit({ user: null, userType: null })
    navigate('/auth')
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-slate-400">Loading...</div>
      </div>
    )
  }

  const tabs = userType === 'partner' ? [
    { id: 'profile', name: 'Account', icon: User },
    { id: 'settings', name: 'Settings', icon: Settings }
  ] : [
    { id: 'profile', name: 'Account', icon: User },
    { id: 'liked', name: 'Liked', icon: Heart },
    { id: 'saved', name: 'Saved', icon: Bookmark },
    { id: 'settings', name: 'Settings', icon: Settings }
  ]

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'
  }

  return (
    <div className="px-4 lg:px-8 py-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="relative h-44 bg-gradient-to-br from-blue-500/10 via-violet-500/10 to-cyan-500/10 rounded-xl mb-6 overflow-hidden border border-slate-800">
        <div className="absolute inset-0 bg-slate-900/20" />
        <div className="relative h-full flex items-end p-6">
          <div className="flex items-end gap-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-slate-700 overflow-hidden shadow-lg">
                {user.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-cyan-500 text-white text-xl font-bold">
                    {getInitials(user.name)}
                  </div>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPic}
                className="absolute bottom-0 right-0 p-1.5 rounded-full bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors disabled:opacity-50"
              >
                {uploadingPic ? (
                  <Loader2 size={14} className="text-slate-400 animate-spin" />
                ) : (
                  <Camera size={14} className="text-slate-400" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleProfilePicChange}
                className="hidden"
              />
            </div>
            <div className="mb-1">
              <h1 className="text-2xl font-bold text-slate-200">{user.name}</h1>
              <p className="text-slate-500 text-sm">{user.email}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                <span className="flex items-center gap-1"><Heart size={14} /> {likedItems.length} liked</span>
                <span className="flex items-center gap-1"><Bookmark size={14} /> {savedItems.length} saved</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-all ${activeTab === tab.id
              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
              : 'bg-slate-800/50 text-slate-500 border border-slate-700 hover:bg-slate-700/50'
              }`}
          >
            <tab.icon size={18} />
            {tab.name}
          </button>
        ))}
      </div>

      {/* Account Tab */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-slate-200 mb-4">Account Info</h3>
            <div className="space-y-4">
              <div>
                <label className="text-slate-500 text-sm">Name</label>
                <div className="mt-1 px-3 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-200 text-sm">
                  {user.name}
                </div>
              </div>
              <div>
                <label className="text-slate-500 text-sm">Email</label>
                <div className="mt-1 px-3 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-200 text-sm">
                  {user.email}
                </div>
              </div>
              <div>
                <label className="text-slate-500 text-sm">Account Type</label>
                <div className="mt-1 px-3 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700 text-sm">
                  <span className={`px-2.5 py-1 rounded-md text-xs ${userType === 'partner' ? 'bg-violet-500/20 text-violet-400' : 'bg-blue-500/20 text-blue-400'
                    }`}>
                    {userType === 'partner' ? 'Admin' : 'Member'}
                  </span>
                </div>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-slate-200 mb-4">Activity</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800/30">
                <span className="text-slate-400 flex items-center gap-2"><Heart size={16} className="text-red-400" /> Liked items</span>
                <span className="font-semibold text-slate-200">{likedItems.length}</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800/30">
                <span className="text-slate-400 flex items-center gap-2"><Bookmark size={16} className="text-yellow-400" /> Saved items</span>
                <span className="font-semibold text-slate-200">{savedItems.length}</span>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Liked Tab */}
      {activeTab === 'liked' && userType === 'user' && (
        <div>
          {loadingInteractions ? (
            <div className="text-center py-12 text-slate-500">Loading...</div>
          ) : likedItems.length === 0 ? (
            <GlassCard className="p-12 text-center">
              <Heart size={40} className="mx-auto mb-3 text-slate-600" />
              <p className="text-slate-500">No liked items yet</p>
              <p className="text-slate-600 text-sm mt-1">Like videos to see them here</p>
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {likedItems.map((item) => (
                <GlassCard key={item._id} className="p-4">
                  {item.thumbnail && (
                    <div className="aspect-video rounded-lg bg-slate-800 mb-3 overflow-hidden">
                      <img src={item.thumbnail} alt={item.foodname || item.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <h4 className="font-medium text-slate-200 text-sm">{item.foodname || item.title}</h4>
                  {item.description && <p className="text-slate-500 text-xs mt-1 line-clamp-2">{item.description}</p>}
                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><Heart size={12} className="text-red-400" /> {item.likes ?? 0}</span>
                    {item.category && <span className="px-2 py-0.5 bg-slate-800/50 rounded text-slate-400">{item.category}</span>}
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Saved Tab */}
      {activeTab === 'saved' && userType === 'user' && (
        <div>
          {loadingInteractions ? (
            <div className="text-center py-12 text-slate-500">Loading...</div>
          ) : savedItems.length === 0 ? (
            <GlassCard className="p-12 text-center">
              <Bookmark size={40} className="mx-auto mb-3 text-slate-600" />
              <p className="text-slate-500">No saved items yet</p>
              <p className="text-slate-600 text-sm mt-1">Save videos to find them later</p>
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedItems.map((item) => (
                <GlassCard key={item._id} className="p-4">
                  {item.thumbnail && (
                    <div className="aspect-video rounded-lg bg-slate-800 mb-3 overflow-hidden">
                      <img src={item.thumbnail} alt={item.foodname || item.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <h4 className="font-medium text-slate-200 text-sm">{item.foodname || item.title}</h4>
                  {item.description && <p className="text-slate-500 text-xs mt-1 line-clamp-2">{item.description}</p>}
                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><Heart size={12} /> {item.likes ?? 0}</span>
                    {item.category && <span className="px-2 py-0.5 bg-slate-800/50 rounded text-slate-400">{item.category}</span>}
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-slate-200 mb-4">Notifications</h3>
            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <span className="text-slate-300">New content alerts</span>
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded bg-slate-800 border-slate-600" />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-slate-300">Subscription updates</span>
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded bg-slate-800 border-slate-600" />
              </label>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-slate-200 mb-4">Account</h3>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 p-4 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 transition-colors"
            >
              <LogOut size={20} />
              Sign out
            </button>
          </GlassCard>
        </div>
      )}
    </div>
  )
}

export default Profile
