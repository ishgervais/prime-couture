import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pc_admin_token')
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
    localStorage.setItem('pc_admin_token', data.accessToken)
    return data
  },
  logout() {
    localStorage.removeItem('pc_admin_token')
  },
  async me() {
    const { data } = await api.post('/auth/me')
    return data
  },
}

export interface KpiSummary {
  products: number
  orders: number
  newOrders: number
  pageviews7d: number
}

export const dashboardApi = {
  async kpis(): Promise<KpiSummary> {
    // calls to existing endpoints; adjust when backend adds dedicated summary
    const [products, orders, analytics] = await Promise.all([
      api.get('/products'),
      api.get('/orders'),
      api.get('/analytics/summary'),
    ])
    return {
      products: products.data?.length ?? 0,
      orders: orders.data?.length ?? 0,
      newOrders: orders.data?.filter((o: any) => o.status === 'NEW').length ?? 0,
      pageviews7d: analytics.data?.trend?.slice(-7).reduce((acc: number, cur: any) => acc + (cur.views ?? 0), 0) ?? 0,
    }
  },
}

export const productsApi = {
  async list() {
    const { data } = await api.get('/products')
    return data
  },
  async getBySlug(slug: string) {
    const { data } = await api.get(`/products/${slug}`)
    return data
  },
  async create(payload: any) {
    const { data } = await api.post('/products', payload)
    return data
  },
  async addImage(productId: string, payload: any) {
    const { data } = await api.post(`/products/${productId}/images`, payload)
    return data
  },
}

export const ordersApi = {
  async list() {
    const { data } = await api.get('/orders')
    return data
  },
}

export const collectionsApi = {
  async list() {
    const { data } = await api.get('/collections')
    return data
  },
  async create(payload: any) {
    const { data } = await api.post('/collections', payload)
    return data
  },
}

export const categoriesApi = {
  async list() {
    const { data } = await api.get('/categories')
    return data
  },
  async create(payload: any) {
    const { data } = await api.post('/categories', payload)
    return data
  },
}

export async function uploadToCloudinary(file: File): Promise<string> {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
  const preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
  if (!cloudName || !preset) throw new Error('Cloudinary env not set')

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', preset)

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  })
  if (!res.ok) throw new Error('Upload failed')
  const json = await res.json()
  return json.secure_url
}

export const usersApi = {
  async create(payload: any) {
    const { data } = await api.post('/auth/register', payload)
    return data
  },
}

export default api
