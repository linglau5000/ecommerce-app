import { ShoppingCart, Trash2, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Cart } from '@/types'

interface ShoppingCartDialogProps {
  cart: Cart
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onRemoveFromCart: (productId: string) => void
  onCheckout: () => void
}

export function ShoppingCartDialog({ 
  cart, 
  isOpen, 
  onOpenChange, 
  onRemoveFromCart, 
  onCheckout 
}: ShoppingCartDialogProps) {
  const cartItemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="relative">
          <ShoppingCart className="h-5 w-5 mr-2" />
          Cart
          {cartItemCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center">
              {cartItemCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Shopping Cart</DialogTitle>
          <DialogDescription>
            {cart.items.length === 0 ? 'Your cart is empty' : `${cartItemCount} items in your cart`}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {cart.items.map((item) => (
            <div key={item.product.id} className="flex items-center space-x-4 p-4 border rounded-lg">
              <img 
                src={item.product.image_url} 
                alt={item.product.name}
                className="w-16 h-16 object-cover rounded"
              />
              <div className="flex-1">
                <h4 className="font-medium">{item.product.name}</h4>
                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                <p className="font-semibold">${item.subtotal.toFixed(2)}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRemoveFromCart(item.product.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        
        {cart.items.length > 0 && (
          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold">Total: ${cart.total.toFixed(2)}</span>
            </div>
            
            <Button onClick={onCheckout} className="w-full">
              <CreditCard className="h-4 w-4 mr-2" />
              Checkout
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
