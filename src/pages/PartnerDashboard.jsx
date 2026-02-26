import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Edit, Trash2, Eye, Star, Clock, DollarSign, Upload, X, Video, Image, Save, Building2, Hash, MapPin, CheckCircle, XCircle, Users, RefreshCw } from 'lucide-react'
import GlassCard from '../ui/GlassCard.jsx'
import api from '../utils/api'

function PartnerDashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showAddFood, setShowAddFood] = useState(false)
  const [showAddReel, setShowAddReel] = useState(false)
  const [showRestaurantForm, setShowRestaurantForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [foodItems, setFoodItems] = useState([])
  const [partnerProfile, setPartnerProfile] = useState(null)
  const [dashboardStats, setDashboardStats] = useState(null)
  const [recentOrders, setRecentOrders] = useState([])
  const [pendingSubscriptions, setPendingSubscriptions] = useState([])
  const [allSubscriptions, setAllSubscriptions] = useState([])
  const [subLoading, setSubLoading] = useState(false)
  const [rejectReasonId, setRejectReasonId] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [newFood, setNewFood] = useState({
    foodname: '',
    description: '',
    category: '',
    ingredients: '',
    image: null,
    thumbnail: null,
    isAvailable: true
  })
  const [newReel, setNewReel] = useState({
    foodname: '',
    description: '',
    category: '',
    ingredients: '',
    video: null,
    thumbnail: null,
    hashtags: '',
    location: ''
  })
  const [restaurantData, setRestaurantData] = useState({
    name: '',
    description: '',
    cuisine: '',
    location: ''
  })
  const [restaurantImage, setRestaurantImage] = useState(null)

  // Use real data from API or fallback to mock data
  const stats = dashboardStats || {
    totalOrders: 0,
    totalRevenue: 0,
    averageRating: 0,
    totalFoods: 0
  }

  // Admin only: redirect non-partners
  useEffect(() => {
    const userType = localStorage.getItem('userType')
    const token = localStorage.getItem('token')
    if (!token || userType !== 'partner') {
      navigate('/')
      return
    }
  }, [navigate])

  // Fetch data from backend
  useEffect(() => {
    if (localStorage.getItem('userType') !== 'partner') return
    fetchFoodItems()
    fetchPartnerProfile()
    fetchDashboardStats()
    fetchSubscriptions()
  }, [])

  const fetchFoodItems = async () => {
    try {
      const response = await api.get('/food/items')
      setFoodItems(response.data.foodItems || [])
    } catch (error) {
      setFoodItems([])
    }
  }

  const fetchPartnerProfile = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await api.get('/foodPartner/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      setPartnerProfile(response.data.foodPartner)
    } catch (error) {
      // Silently handle
    }
  }

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await api.get('/analytics/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      setDashboardStats(response.data.stats)
      setRecentOrders(response.data.recentOrders || [])
    } catch (error) {
      // Silently handle
    }
  }

  const handleRestaurantRegistration = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      const formData = new FormData()
      formData.append('name', restaurantData.name)
      formData.append('description', restaurantData.description)
      formData.append('cuisine', restaurantData.cuisine)
      formData.append('location', restaurantData.location)
      if (restaurantImage) {
        formData.append('image', restaurantImage)
      }

      const response = await api.post('/foodPartner/restaurant', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      })


      alert('Channel set up successfully!')
      setShowRestaurantForm(false)
      setRestaurantData({
        name: '',
        description: '',
        cuisine: '',
        location: ''
      })
      setRestaurantImage(null)
      fetchPartnerProfile() // Refresh profile
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error setting up channel. Please try again.'
      alert(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleAddFood = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate required fields
      if (!newFood.foodname.trim()) {
        alert('Video title is required')
        setLoading(false)
        return
      }

      const formData = new FormData()
      formData.append('foodname', newFood.foodname)
      formData.append('description', newFood.description)
      formData.append('price', 0)
      formData.append('category', newFood.category)
      formData.append('ingredients', newFood.ingredients)
      formData.append('isAvailable', newFood.isAvailable)
      formData.append('mediaType', 'image')
      if (newFood.thumbnail) {
        formData.append('thumbnail', newFood.thumbnail)
      }

      const token = localStorage.getItem('token')
      const response = await api.post('/food/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      })


      alert('Video added successfully!')
      setShowAddFood(false)
      setNewFood({
        foodname: '',
        description: '',
        category: '',
        ingredients: '',
        image: null,
        thumbnail: null,
        isAvailable: true
      })
      fetchFoodItems() // Refresh the list
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error adding video. Please try again.'
      alert(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // No image upload for food; only thumbnail

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setNewFood(prev => ({ ...prev, thumbnail: file }))
    }
  }

  const handleAddReel = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate required fields
      if (!newReel.foodname.trim()) {
        alert('Video title is required')
        setLoading(false)
        return
      }

      const formData = new FormData()
      formData.append('foodname', newReel.foodname)
      formData.append('description', newReel.description)
      formData.append('price', 0)
      formData.append('category', newReel.category)
      formData.append('ingredients', newReel.ingredients)
      formData.append('hashtags', newReel.hashtags)
      formData.append('location', newReel.location)

      if (newReel.video) {
        formData.append('video', newReel.video)
      }
      if (newReel.thumbnail) {
        formData.append('thumbnail', newReel.thumbnail)
      }

      const token = localStorage.getItem('token')
      const response = await api.post('/food/reels', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      })


      setShowAddReel(false)
      setNewReel({
        foodname: '',
        description: '',
        category: '',
        ingredients: '',
        video: null,
        thumbnail: null,
        hashtags: '',
        location: ''
      })
      fetchFoodItems() // Refresh the list
    } catch (error) {
      alert('Error adding video. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteFood = async (foodId) => {
    if (window.confirm('Are you sure you want to delete this food item?')) {
      try {
        const token = localStorage.getItem('token')
        await api.delete(`/food/${foodId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        fetchFoodItems() // Refresh the list
      } catch (error) {
        alert('Error deleting video.')
      }
    }
  }

  const fetchSubscriptions = async () => {
    try {
      const token = localStorage.getItem('token')
      const [pendingRes, allRes] = await Promise.all([
        api.get('/subscription/pending', { headers: { 'Authorization': `Bearer ${token}` } }),
        api.get('/subscription/all', { headers: { 'Authorization': `Bearer ${token}` } })
      ])
      setPendingSubscriptions(pendingRes.data.subscriptions || [])
      setAllSubscriptions(allRes.data.subscriptions || [])
    } catch (error) {
    }
  }

  const handleApproveSubscription = async (subId) => {
    setSubLoading(true)
    try {
      const token = localStorage.getItem('token')
      await api.patch(`/subscription/${subId}/approve`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      fetchSubscriptions()
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to approve')
    } finally {
      setSubLoading(false)
    }
  }

  const handleRejectSubscription = async (subId) => {
    setSubLoading(true)
    try {
      const token = localStorage.getItem('token')
      await api.patch(`/subscription/${subId}/reject`, { reason: rejectReason || 'Payment could not be verified' }, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setRejectReasonId(null)
      setRejectReason('')
      fetchSubscriptions()
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to reject')
    } finally {
      setSubLoading(false)
    }
  }

  const tabs = [
    { id: 'dashboard', name: 'Overview', icon: '📊' },
    { id: 'subscriptions', name: 'Subscriptions', icon: '💳' },
    { id: 'restaurant', name: 'Collection', icon: '🏪' },
    { id: 'foods', name: 'Items', icon: '📁' },
    { id: 'reels', name: 'Media', icon: '🎬' },
    { id: 'orders', name: 'Transfers', icon: '📋' },
    { id: 'analytics', name: 'Analytics', icon: '📈' }
  ]

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* Header */}
      <div className="bg-slate-900/60 backdrop-blur-xl border-b border-slate-800 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-200">Admin Dashboard</h1>
            <p className="text-slate-500 text-sm">
              {partnerProfile?.restaurant?.isRegistered
                ? `${partnerProfile.restaurant.name}`
                : 'Set up your channel to get started'
              }
            </p>
          </div>
          <div className="flex gap-3">
            {!partnerProfile?.restaurant?.isRegistered && (
              <button
                onClick={() => setShowRestaurantForm(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-500/20 border border-blue-500/30 hover:bg-blue-500/30 text-blue-400 text-sm font-medium transition-all"
              >
                <Building2 size={18} />
                Set Up Channel
              </button>
            )}
            <button
              onClick={() => setShowAddFood(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-slate-700/50 border border-slate-600 hover:bg-slate-600/50 text-slate-200 text-sm font-medium transition-all"
            >
              <Plus size={18} />
              Add Video
            </button>
            <button
              onClick={() => setShowAddReel(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-purple-500/20 border border-purple-500/30 hover:bg-purple-500/30 text-purple-400 text-sm font-medium transition-all"
            >
              <Video size={18} />
              Add Media
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
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
              <span>{tab.icon}</span>
              <span>{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <GlassCard className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-500 text-sm">Transfers</p>
                    <p className="text-2xl font-bold">{stats.totalOrders}</p>
                  </div>
                  <div className="p-3 rounded-full bg-blue-500/20">
                    <Clock size={24} className="text-blue-400" />
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-500 text-sm">Revenue (₹399/user)</p>
                    <p className="text-2xl font-bold">₹{399 * (stats.totalOrders || 0)}</p>
                  </div>
                  <div className="p-3 rounded-full bg-green-500/20">
                    <DollarSign size={24} className="text-green-400" />
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-500 text-sm">Rating</p>
                    <p className="text-2xl font-bold">{stats.averageRating}</p>
                  </div>
                  <div className="p-3 rounded-full bg-yellow-500/20">
                    <Star size={24} className="text-yellow-400" />
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-500 text-sm">Items</p>
                    <p className="text-2xl font-bold">{foodItems.length}</p>
                  </div>
                  <div className="p-3 rounded-full bg-purple-500/20">
                    <Plus size={24} className="text-purple-400" />
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* Recent Orders */}
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold text-slate-200 mb-4">Recent Transfers</h3>
              <div className="space-y-3">
                {recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <div key={order._id} className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                      <div>
                        <p className="font-medium">{order.user?.name || 'Customer'}</p>
                        <p className="text-white/70 text-sm">
                          {order.items?.map(item => `${item.foodItem?.foodname} x${item.quantity}`).join(', ') || 'Items'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${order.totalAmount}</p>
                        <p className={`text-sm ${order.status === 'delivered' ? 'text-green-400' :
                          order.status === 'preparing' ? 'text-yellow-400' :
                            order.status === 'pending' ? 'text-orange-400' :
                              'text-blue-400'
                          }`}>{order.status}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <p>No recent transfers</p>
                  </div>
                )}
              </div>
            </GlassCard>
          </div>
        )}

        {/* Restaurant Tab */}
        {activeTab === 'restaurant' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-slate-200">Channel Info</h2>

            {partnerProfile?.restaurant?.isRegistered ? (
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-slate-200">Channel Details</h3>
                  <button className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition-all">
                    <Edit size={18} />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-slate-500 text-sm">Name</label>
                    <p className="text-lg font-medium">{partnerProfile.restaurant.name}</p>
                  </div>
                  <div>
                    <label className="text-slate-500 text-sm">Category</label>
                    <p className="text-lg font-medium">{partnerProfile.restaurant.cuisine}</p>
                  </div>
                  <div>
                    <label className="text-white/70 text-sm">Location</label>
                    <p className="text-lg font-medium">{partnerProfile.restaurant.location}</p>
                  </div>
                  <div>
                    <label className="text-white/70 text-sm">Registration Date</label>
                    <p className="text-lg font-medium">
                      {new Date(partnerProfile.restaurant.registrationDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-white/70 text-sm">Description</label>
                    <p className="text-lg font-medium">{partnerProfile.restaurant.description}</p>
                  </div>
                </div>
              </GlassCard>
            ) : (
              <GlassCard className="p-6 text-center">
                <Building2 size={48} className="mx-auto mb-4 text-slate-500" />
                <h3 className="text-lg font-semibold text-slate-200 mb-2">No Channel</h3>
                <p className="text-slate-500 text-sm mb-6">Set up a channel to start uploading videos</p>
                <button
                  onClick={() => setShowRestaurantForm(true)}
                  className="px-5 py-2.5 rounded-lg bg-blue-500/20 border border-blue-500/30 hover:bg-blue-500/30 text-blue-400 font-medium transition-all"
                >
                  Set Up Channel
                </button>
              </GlassCard>
            )}
          </div>
        )}

        {/* Foods Tab */}
        {activeTab === 'foods' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-200">Videos</h2>
              <button
                onClick={() => setShowAddFood(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600 hover:bg-slate-600/50 text-slate-200 text-sm font-medium transition-all"
              >
                <Plus size={18} />
                Add Video
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {foodItems.map((food) => (
                <GlassCard key={food.id} className="p-6">
                  <div className="aspect-video rounded-xl bg-white/5 mb-4 overflow-hidden">
                    <img src={food.image} alt={food.foodname} className="w-full h-full object-cover" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{food.foodname}</h3>
                  <p className="text-white/70 text-sm mb-2">{food.category}</p>
                  <p className="text-white/60 text-sm mb-4 line-clamp-2">{food.description}</p>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1">
                      <Star size={16} className="text-yellow-400 fill-current" />
                      <span className="text-sm">{food.rating}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${food.isAvailable ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                      {food.isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                    <span className="text-white/60 text-sm">{food.orders} views</span>
                  </div>

                  <div className="flex gap-2">
                    <button className="flex-1 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all">
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteFood(food.id)}
                      className="flex-1 p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                    <button className="flex-1 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all">
                      <Eye size={16} />
                    </button>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        )}

        {/* Reels Tab */}
        {activeTab === 'reels' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-200">Media</h2>
              <button
                onClick={() => setShowAddReel(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/20 border border-purple-500/30 hover:bg-purple-500/30 text-purple-400 text-sm font-medium transition-all"
              >
                <Video size={18} />
                Add Media
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {foodItems.filter(food => food.isReel).map((reel) => (
                <GlassCard key={reel.id} className="p-6">
                  <div className="aspect-video rounded-xl bg-white/5 mb-4 overflow-hidden">
                    <video
                      src={reel.video}
                      className="w-full h-full object-cover"
                      poster={reel.thumbnail}
                    />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{reel.foodname}</h3>
                  <p className="text-white/70 text-sm mb-2">{reel.category}</p>
                  <p className="text-white/60 text-sm mb-4 line-clamp-2">{reel.description}</p>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1">
                      <Star size={16} className="text-yellow-400 fill-current" />
                      <span className="text-sm">{reel.likes || 0}</span>
                    </div>
                  </div>

                  {reel.reelData?.hashtags && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {reel.reelData.hashtags.map((tag, index) => (
                        <span key={index} className="px-2 py-1 rounded-full text-xs bg-purple-500/20 text-purple-400">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button className="flex-1 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all">
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteFood(reel.id)}
                      className="flex-1 p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                    <button className="flex-1 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all">
                      <Eye size={16} />
                    </button>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        )}

        {/* Subscriptions Tab */}
        {activeTab === 'subscriptions' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
                <Users size={22} className="text-violet-400" />
                Subscription Requests
              </h2>
              <button
                onClick={fetchSubscriptions}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600 hover:bg-slate-600/50 text-slate-300 text-sm transition-all"
              >
                <RefreshCw size={16} />
                Refresh
              </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <GlassCard className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-500 text-sm">Pending</p>
                    <p className="text-2xl font-bold text-amber-400">{pendingSubscriptions.length}</p>
                  </div>
                  <Clock size={24} className="text-amber-400/50" />
                </div>
              </GlassCard>
              <GlassCard className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-500 text-sm">Approved</p>
                    <p className="text-2xl font-bold text-emerald-400">{allSubscriptions.filter(s => s.status === 'approved').length}</p>
                  </div>
                  <CheckCircle size={24} className="text-emerald-400/50" />
                </div>
              </GlassCard>
              <GlassCard className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-500 text-sm">Total Revenue</p>
                    <p className="text-2xl font-bold text-slate-200">₹{allSubscriptions.filter(s => s.status === 'approved').length * 399}</p>
                  </div>
                  <DollarSign size={24} className="text-green-400/50" />
                </div>
              </GlassCard>
            </div>

            {/* Pending Subscriptions */}
            <div>
              <h3 className="text-lg font-semibold text-slate-200 mb-4">Pending Approval</h3>
              {pendingSubscriptions.length === 0 ? (
                <GlassCard className="p-8 text-center">
                  <CheckCircle size={40} className="text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-500">No pending subscription requests</p>
                </GlassCard>
              ) : (
                <div className="space-y-4">
                  {pendingSubscriptions.map((sub) => (
                    <GlassCard key={sub._id} className="p-5">
                      <div className="flex flex-col lg:flex-row gap-4">
                        {/* Screenshot */}
                        <div className="w-full lg:w-48 shrink-0">
                          <a href={sub.screenshotUrl} target="_blank" rel="noopener noreferrer">
                            <img
                              src={sub.screenshotUrl}
                              alt="Payment screenshot"
                              className="w-full h-40 object-contain rounded-lg bg-slate-800/50 border border-slate-700 hover:border-violet-500/50 transition-colors cursor-pointer"
                            />
                          </a>
                        </div>

                        {/* Details */}
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-slate-200 font-semibold">{sub.user?.name || 'Unknown User'}</h4>
                              <p className="text-slate-500 text-sm">{sub.user?.email || ''}</p>
                            </div>
                            <span className="px-3 py-1 rounded-full text-xs bg-amber-500/20 text-amber-400 font-medium">Pending</span>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="p-2.5 rounded-lg bg-slate-800/50 border border-slate-700">
                              <p className="text-slate-500 text-xs">UTR Code</p>
                              <p className="text-slate-300 font-mono text-sm">{sub.utrCode}</p>
                            </div>
                            <div className="p-2.5 rounded-lg bg-slate-800/50 border border-slate-700">
                              <p className="text-slate-500 text-xs">Amount</p>
                              <p className="text-slate-300 font-semibold">₹{sub.amount}</p>
                            </div>
                          </div>

                          <p className="text-slate-600 text-xs">
                            Submitted: {new Date(sub.createdAt).toLocaleString()}
                          </p>

                          {/* Reject reason input */}
                          {rejectReasonId === sub._id && (
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="Rejection reason (optional)"
                                className="flex-1 px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:border-red-500/50"
                              />
                              <button
                                onClick={() => handleRejectSubscription(sub._id)}
                                disabled={subLoading}
                                className="px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/30 hover:bg-red-500/30 text-red-400 text-sm font-medium transition-all disabled:opacity-50"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => { setRejectReasonId(null); setRejectReason(''); }}
                                className="px-3 py-2 rounded-lg bg-slate-700/50 border border-slate-600 hover:bg-slate-600/50 text-slate-400 text-sm transition-all"
                              >
                                Cancel
                              </button>
                            </div>
                          )}

                          {/* Action buttons */}
                          {rejectReasonId !== sub._id && (
                            <div className="flex gap-3">
                              <button
                                onClick={() => handleApproveSubscription(sub._id)}
                                disabled={subLoading}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 hover:bg-emerald-500/30 text-emerald-400 text-sm font-medium transition-all disabled:opacity-50"
                              >
                                <CheckCircle size={16} />
                                Approve
                              </button>
                              <button
                                onClick={() => setRejectReasonId(sub._id)}
                                disabled={subLoading}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-red-500/20 border border-red-500/30 hover:bg-red-500/30 text-red-400 text-sm font-medium transition-all disabled:opacity-50"
                              >
                                <XCircle size={16} />
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              )}
            </div>

            {/* All Subscriptions History */}
            {allSubscriptions.filter(s => s.status !== 'pending').length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-slate-200 mb-4">History</h3>
                <GlassCard className="p-4">
                  <div className="space-y-3">
                    {allSubscriptions.filter(s => s.status !== 'pending').map((sub) => (
                      <div key={sub._id} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/30">
                        <div>
                          <p className="text-slate-200 font-medium text-sm">{sub.user?.name || 'Unknown'}</p>
                          <p className="text-slate-500 text-xs">{sub.user?.email} • UTR: {sub.utrCode}</p>
                        </div>
                        <div className="text-right">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${sub.status === 'approved'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-red-500/20 text-red-400'
                            }`}>
                            {sub.status === 'approved' ? 'Approved' : 'Rejected'}
                          </span>
                          <p className="text-slate-600 text-xs mt-1">{new Date(sub.updatedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Food Modal */}
      {showAddFood && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <GlassCard className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-slate-200">Add New Video</h2>
                <button
                  onClick={() => setShowAddFood(false)}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddFood} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm text-white/80">Video Title *</label>
                    <input
                      type="text"
                      value={newFood.foodname}
                      onChange={(e) => setNewFood(prev => ({ ...prev, foodname: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/50 focus:outline-none focus:border-white/30"
                      placeholder="Enter video title"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-white/80">Genre *</label>
                    <select
                      value={newFood.category}
                      onChange={(e) => setNewFood(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-white/30"
                      required
                    >
                      <option value="">Select genre</option>
                      <option value="Entertainment">Entertainment</option>
                      <option value="Education">Education</option>
                      <option value="Music">Music</option>
                      <option value="Gaming">Gaming</option>
                      <option value="Vlog">Vlog</option>
                      <option value="Tutorial">Tutorial</option>
                      <option value="Comedy">Comedy</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-white/80">Availability</label>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newFood.isAvailable}
                          onChange={(e) => setNewFood(prev => ({ ...prev, isAvailable: e.target.checked }))}
                          className="w-4 h-4 rounded bg-white/5 border border-white/10"
                        />
                        <span className="text-white/80">Visible to viewers</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-white/80">Description *</label>
                  <textarea
                    value={newFood.description}
                    onChange={(e) => setNewFood(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/50 focus:outline-none focus:border-white/30"
                    placeholder="Enter video description"
                    rows={3}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-white/80">Tags *</label>
                  <textarea
                    value={newFood.ingredients}
                    onChange={(e) => setNewFood(prev => ({ ...prev, ingredients: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/50 focus:outline-none focus:border-white/30"
                    placeholder="Enter tags (comma separated)"
                    rows={2}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm text-white/80">Thumbnail Image *</label>
                    <div className="flex items-center gap-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailChange}
                        className="hidden"
                        id="image-upload"
                        required
                      />
                      <label
                        htmlFor="image-upload"
                        className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
                      >
                        <Image size={20} />
                        Choose Thumbnail
                      </label>
                      {newFood.thumbnail && (
                        <span className="text-white/70 text-sm">{newFood.thumbnail.name}</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-white/80">Thumbnail Image</label>
                    <div className="flex items-center gap-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailChange}
                        className="hidden"
                        id="thumbnail-upload"
                      />
                      <label
                        htmlFor="thumbnail-upload"
                        className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
                      >
                        <Image size={20} />
                        Choose Thumbnail
                      </label>
                      {newFood.thumbnail && (
                        <span className="text-white/70 text-sm">{newFood.thumbnail.name}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setShowAddFood(false)}
                    className="flex-1 px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-3 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        Add Food Item
                      </>
                    )}
                  </button>
                </div>
              </form>
            </GlassCard>
          </motion.div>
        </div>
      )}

      {/* Restaurant Registration Modal */}
      {showRestaurantForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <GlassCard className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-slate-200">Set Up Channel</h2>
                <button
                  onClick={() => setShowRestaurantForm(false)}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleRestaurantRegistration} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm text-white/80">Channel Name *</label>
                    <input
                      type="text"
                      value={restaurantData.name}
                      onChange={(e) => setRestaurantData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/50 focus:outline-none focus:border-white/30"
                      placeholder="Enter channel name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-white/80">Content Category *</label>
                    <select
                      value={restaurantData.cuisine}
                      onChange={(e) => setRestaurantData(prev => ({ ...prev, cuisine: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-white/30"
                      required
                    >
                      <option value="">Select category</option>
                      <option value="Entertainment">Entertainment</option>
                      <option value="Education">Education</option>
                      <option value="Music">Music</option>
                      <option value="Gaming">Gaming</option>
                      <option value="Vlog">Vlog</option>
                      <option value="Tutorial">Tutorial</option>
                      <option value="Comedy">Comedy</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm text-white/80">Location *</label>
                    <input
                      type="text"
                      value={restaurantData.location}
                      onChange={(e) => setRestaurantData(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/50 focus:outline-none focus:border-white/30"
                      placeholder="Enter your website or social link"
                      required
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm text-white/80">Description *</label>
                    <textarea
                      value={restaurantData.description}
                      onChange={(e) => setRestaurantData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/50 focus:outline-none focus:border-white/30"
                      placeholder="Describe your channel and content"
                      rows={4}
                      required
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm text-white/80">Channel Image</label>
                    <div className="flex items-center gap-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setRestaurantImage(e.target.files?.[0] || null)}
                        className="hidden"
                        id="restaurant-image-upload"
                      />
                      <label
                        htmlFor="restaurant-image-upload"
                        className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
                      >
                        <Image size={20} />
                        Choose Image
                      </label>
                      {restaurantImage && (
                        <span className="text-white/70 text-sm">{restaurantImage.name}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setShowRestaurantForm(false)}
                    className="flex-1 px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-3 rounded-xl bg-blue-500/20 border border-blue-500/30 hover:bg-blue-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Registering...
                      </>
                    ) : (
                      <>
                        <Building2 size={18} />
                        Register Restaurant
                      </>
                    )}
                  </button>
                </div>
              </form>
            </GlassCard>
          </motion.div>
        </div>
      )}

      {/* Add Reel Modal */}
      {showAddReel && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <GlassCard className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-slate-200">Add Media</h2>
                <button
                  onClick={() => setShowAddReel(false)}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddReel} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm text-white/80">Food Name *</label>
                    <input
                      type="text"
                      value={newReel.foodname}
                      onChange={(e) => setNewReel(prev => ({ ...prev, foodname: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/50 focus:outline-none focus:border-white/30"
                      placeholder="Enter food name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-white/80">Category *</label>
                    <select
                      value={newReel.category}
                      onChange={(e) => setNewReel(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-white/30"
                      required
                    >
                      <option value="">Select category</option>
                      <option value="Pizza">Pizza</option>
                      <option value="Burger">Burger</option>
                      <option value="Pasta">Pasta</option>
                      <option value="Salad">Salad</option>
                      <option value="Dessert">Dessert</option>
                      <option value="Beverage">Beverage</option>
                      <option value="Appetizer">Appetizer</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-white/80">Location</label>
                    <input
                      type="text"
                      value={newReel.location}
                      onChange={(e) => setNewReel(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/50 focus:outline-none focus:border-white/30"
                      placeholder="Enter location"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-white/80">Description *</label>
                  <textarea
                    value={newReel.description}
                    onChange={(e) => setNewReel(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/50 focus:outline-none focus:border-white/30"
                    placeholder="Enter food description"
                    rows={3}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-white/80">Ingredients *</label>
                  <textarea
                    value={newReel.ingredients}
                    onChange={(e) => setNewReel(prev => ({ ...prev, ingredients: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/50 focus:outline-none focus:border-white/30"
                    placeholder="Enter ingredients (comma separated)"
                    rows={2}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-white/80">Hashtags</label>
                  <input
                    type="text"
                    value={newReel.hashtags}
                    onChange={(e) => setNewReel(prev => ({ ...prev, hashtags: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/50 focus:outline-none focus:border-white/30"
                    placeholder="Enter hashtags (comma separated)"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm text-white/80">Reel Video *</label>
                    <div className="flex items-center gap-4">
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => setNewReel(prev => ({ ...prev, video: e.target.files[0] }))}
                        className="hidden"
                        id="reel-video-upload"
                        required
                      />
                      <label
                        htmlFor="reel-video-upload"
                        className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
                      >
                        <Video size={20} />
                        Choose Video
                      </label>
                      {newReel.video && (
                        <span className="text-white/70 text-sm">{newReel.video.name}</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-white/80">Thumbnail Image</label>
                    <div className="flex items-center gap-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setNewReel(prev => ({ ...prev, thumbnail: e.target.files[0] }))}
                        className="hidden"
                        id="reel-thumbnail-upload"
                        required
                      />
                      <label
                        htmlFor="reel-thumbnail-upload"
                        className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
                      >
                        <Image size={20} />
                        Choose Thumbnail
                      </label>
                      {newReel.thumbnail && (
                        <span className="text-white/70 text-sm">{newReel.thumbnail.name}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setShowAddReel(false)}
                    className="flex-1 px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-3 rounded-xl bg-purple-500/20 border border-purple-500/30 hover:bg-purple-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Video size={18} />
                        Add Food Reel
                      </>
                    )}
                  </button>
                </div>
              </form>
            </GlassCard>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default PartnerDashboard