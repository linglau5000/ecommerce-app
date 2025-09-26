import { useState, useEffect } from 'react'
import { Package } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { ProductGrid } from '@/components/ProductGrid'
import { ShoppingCartDialog } from '@/components/ShoppingCartDialog'
import { CheckoutDialog } from '@/components/CheckoutDialog'
import { Product, Cart, CreateOrderRequest, Order } from '@/types'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function App() {
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<Cart>({ items: [], total: 0 })
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sessionId] = useState(() => Math.random().toString(36).substr(2, 9))
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [customerEmail, setCustomerEmail] = useState('')
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)

  const categories = ['all', 'Electronics', 'Home', 'Sports', 'Accessories']

  useEffect(() => {
    fetchProducts()
    fetchCart()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/products`)
      const data = await response.json()
      setProducts(data)
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Failed to load products')
    }
  }

  const fetchCart = async () => {
    try {
      const response = await fetch(`${API_URL}/cart/${sessionId}`)
      const data = await response.json()
      setCart(data)
    } catch (error) {
      console.error('Error fetching cart:', error)
    }
  }

  const addToCart = async (productId: string) => {
    try {
      const response = await fetch(`${API_URL}/cart/${sessionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: productId,
          quantity: 1
        })
      })

      if (response.ok) {
        await fetchCart()
        toast.success('Item added to cart')
      } else {
        const error = await response.json()
        toast.error(error.detail || 'Failed to add item to cart')
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
      toast.error('Failed to add item to cart')
    }
  }

  const removeFromCart = async (productId: string) => {
    try {
      const response = await fetch(`${API_URL}/cart/${sessionId}/${productId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchCart()
        toast.success('Item removed from cart')
      }
    } catch (error) {
      console.error('Error removing from cart:', error)
      toast.error('Failed to remove item from cart')
    }
  }

  const processPayment = async () => {
    if (!customerEmail) {
      toast.error('Please enter your email address')
      return
    }

    setIsProcessingPayment(true)

    try {
      const orderRequest: CreateOrderRequest = {
        items: cart.items.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
        })),
        customer_email: customerEmail,
      }

      const orderResponse = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderRequest),
      })

      if (!orderResponse.ok) {
        const error = await orderResponse.json()
        throw new Error(error.detail || 'Failed to create order')
      }

      const order: Order = await orderResponse.json()

      const paymentResponse = await fetch(`${API_URL}/payment/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order_id: order.id,
          payment_method_id: 'pm_card_visa',
        }),
      })

      if (!paymentResponse.ok) {
        const error = await paymentResponse.json()
        throw new Error(error.detail || 'Payment failed')
      }

      const paymentResult = await paymentResponse.json()

      if (paymentResult.success) {
        toast.success('Payment successful! Order placed.')
        setCart({ items: [], total: 0 })
        setIsCheckoutOpen(false)
        setIsCartOpen(false)
        setCustomerEmail('')
      } else {
        throw new Error('Payment was not successful')
      }
    } catch (error) {
      console.error('Payment error:', error)
      toast.error(error instanceof Error ? error.message : 'Payment failed')
    } finally {
      setIsProcessingPayment(false)
    }
  }

  const handleCheckout = () => {
    setIsCartOpen(false)
    setIsCheckoutOpen(true)
  }

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(product => product.category === selectedCategory)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600 mr-2" />
              <h1 className="text-2xl font-bold text-gray-900">ShopEasy</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <ShoppingCartDialog
                cart={cart}
                isOpen={isCartOpen}
                onOpenChange={setIsCartOpen}
                onRemoveFromCart={removeFromCart}
                onCheckout={handleCheckout}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Products</h2>
          
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              {categories.map((category) => (
                <TabsTrigger key={category} value={category} className="capitalize">
                  {category === 'all' ? 'All Products' : category}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {categories.map((category) => (
              <TabsContent key={category} value={category} className="mt-6">
                <ProductGrid 
                  products={filteredProducts} 
                  onAddToCart={addToCart}
                />
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </main>

      <CheckoutDialog
        cart={cart}
        isOpen={isCheckoutOpen}
        onOpenChange={setIsCheckoutOpen}
        customerEmail={customerEmail}
        onEmailChange={setCustomerEmail}
        isProcessingPayment={isProcessingPayment}
        onProcessPayment={processPayment}
      />
    </div>
  )
}

export default App
