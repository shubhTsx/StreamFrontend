import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom'
import RootLayout from './layout/RootLayout.jsx'
import Home from './pages/Home.jsx'
import Explore from './pages/Explore.jsx'
import Restaurants from './pages/Restaurants.jsx'
import Auth from './pages/Auth.jsx'
import PartnerDashboard from './pages/PartnerDashboard.jsx'
import VideoFeed from './pages/VideoFeed.jsx'
import Profile from './pages/Profile.jsx'
import NotFound from './pages/NotFound.jsx'
import Subscription from './pages/Subscription.jsx'
import AdminLogin from './pages/AdminLogin.jsx'

function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route index element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/restaurants" element={<Restaurants />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/partner-dashboard" element={<PartnerDashboard />} />
        <Route path="/videos" element={<VideoFeed />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/subscription" element={<Subscription />} />
        <Route path="/cp-admin" element={<AdminLogin />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App