import { Products } from '../types'
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json'
  }
})


export const productService = {
  createProduct: async (product: Products) => {
    const response = await api.post('/products', product)
    return response.data
  },
  updateProduct: async (id: number, product: Products) => {
    const response = await api.put(`/products/${id}`, product)
    return response.data
  },
  deleteProduct: async (id: number) => {
    const response = await api.delete(`/products/${id}`)
    return response.data
  },
  getProduct: async (id: number) => {
    const response = await api.get(`/products/${id}`)
    return response.data
  },
  getProducts: async () => {
    const response = await api.get('/products')
    return response.data
  }
}

// export default productService
