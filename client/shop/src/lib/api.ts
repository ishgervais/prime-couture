import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pc_token')
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    }
  }
  return config
})

export interface AuthResponse {
  accessToken: string
  user: {
    id: string
    email: string
    name: string
    role: string
  }
}

export const authApi = {
  async login(email: string, password: string) {
    const { data } = await api.post<AuthResponse>('/auth/login', { email, password })
    localStorage.setItem('pc_token', data.accessToken)
    return data
  },
  logout() {
    localStorage.removeItem('pc_token')
  },
  async me() {
    const { data } = await api.post('/auth/me')
    return data
  },
}

export const productsApi = {
  async create(payload: any) {
    const { data } = await api.post('/products', payload)
    return data
  },
  async addImage(productId: string, payload: any) {
    const { data } = await api.post(`/products/${productId}/images`, payload)
    return data
  },
}

export default api
