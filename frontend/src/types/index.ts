export interface Product {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  category: string
  stock: number
}

export interface CartItem {
  product: Product
  quantity: number
  subtotal: number
}

export interface Cart {
  items: CartItem[]
  total: number
}

export interface CreateOrderRequest {
  items: { product_id: string; quantity: number }[]
  customer_email: string
}

export interface Order {
  id: string
  items: {
    product_id: string
    product_name: string
    price: number
    quantity: number
  }[]
  total: number
  status: string
  created_at: string
  customer_email: string
}
