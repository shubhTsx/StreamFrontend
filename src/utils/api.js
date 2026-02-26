import axios from 'axios'

// Prefer env if set, otherwise default to Render backend URL
const baseURL = import.meta.env.VITE_API_URL

const api = axios.create({
    baseURL,
    withCredentials: true,
    timeout: 20000,
})

export default api


