import axios from 'axios'

const api = axios.create({
    baseURL: '',
    headers: { 'Content-Type': 'application/json' },
    timeout: 10_000,
})

api.interceptors.request.use((config) => {
    try {
        const raw = localStorage.getItem('chat_auth')
        if (raw) {
            const token = JSON.parse(raw)?.state?.token
            if (token) config.headers.Authorization = `Bearer ${token}`
        }
    } catch {
        // parse hatası
    }
    return config
})

api.interceptors.response.use(
    (res) => res,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.clear()
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

export default api