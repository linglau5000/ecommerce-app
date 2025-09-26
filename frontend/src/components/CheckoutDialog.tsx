import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Cart } from '@/types'

interface CheckoutDialogProps {
  cart: Cart
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  customerEmail: string
  onEmailChange: (email: string) => void
  isProcessingPayment: boolean
  onProcessPayment: () => void
}

export function CheckoutDialog({
  cart,
  isOpen,
  onOpenChange,
  customerEmail,
  onEmailChange,
  isProcessingPayment,
  onProcessPayment
}: CheckoutDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Checkout</DialogTitle>
          <DialogDescription>
            Complete your purchase
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={customerEmail}
              onChange={(e) => onEmailChange(e.target.value)}
            />
          </div>
          
          <div className="border rounded-lg p-4 bg-gray-50">
            <h4 className="font-medium mb-2">Order Summary</h4>
            {cart.items.map((item) => (
              <div key={item.product.id} className="flex justify-between text-sm">
                <span>{item.product.name} x {item.quantity}</span>
                <span>${item.subtotal.toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t mt-2 pt-2 flex justify-between font-semibold">
              <span>Total</span>
              <span>${cart.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            onClick={onProcessPayment}
            disabled={isProcessingPayment || !customerEmail}
            className="w-full"
          >
            {isProcessingPayment ? 'Processing...' : `Pay $${cart.total.toFixed(2)}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
