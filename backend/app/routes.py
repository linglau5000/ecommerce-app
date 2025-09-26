from fastapi import APIRouter, HTTPException
from typing import List
import logging

from .models import Product, CartItem, CreateOrderRequest, PaymentRequest, Order
from .database import (
    get_products,
    get_product_by_id,
    get_products_by_category,
    get_cart,
    add_to_cart,
    remove_from_cart,
    get_all_orders,
    get_order_by_id
)
from .services import OrderService, PaymentService

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/healthz")
async def healthz():
    """Health check endpoint."""
    return {"status": "ok"}


@router.get("/products", response_model=List[Product])
async def get_products_endpoint():
    """Get all products."""
    return get_products()


@router.get("/products/{product_id}", response_model=Product)
async def get_product_endpoint(product_id: str):
    """Get a specific product by ID."""
    product = get_product_by_id(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.get("/products/category/{category}", response_model=List[Product])
async def get_products_by_category_endpoint(category: str):
    """Get products filtered by category."""
    return get_products_by_category(category)


@router.post("/cart/{session_id}")
async def add_to_cart_endpoint(session_id: str, item: CartItem):
    """Add an item to the cart."""
    product = get_product_by_id(item.product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if product.stock < item.quantity:
        raise HTTPException(status_code=400, detail="Insufficient stock")
    
    add_to_cart(session_id, item)
    logger.info(f"Added {item.quantity} of product {item.product_id} to cart {session_id}")
    
    return {"message": "Item added to cart"}


@router.get("/cart/{session_id}")
async def get_cart_endpoint(session_id: str):
    """Get cart contents for a session."""
    cart_items_data = get_cart(session_id)
    if not cart_items_data:
        return {"items": [], "total": 0}
    
    cart_items = []
    total = 0
    
    for item in cart_items_data:
        product = get_product_by_id(item.product_id)
        if product:
            cart_items.append({
                "product": product,
                "quantity": item.quantity,
                "subtotal": product.price * item.quantity
            })
            total += product.price * item.quantity
    
    return {"items": cart_items, "total": total}


@router.delete("/cart/{session_id}/{product_id}")
async def remove_from_cart_endpoint(session_id: str, product_id: str):
    """Remove an item from the cart."""
    remove_from_cart(session_id, product_id)
    logger.info(f"Removed product {product_id} from cart {session_id}")
    return {"message": "Item removed from cart"}


@router.post("/orders", response_model=Order)
async def create_order_endpoint(order_request: CreateOrderRequest):
    """Create a new order."""
    return OrderService.create_order(order_request)


@router.post("/payment/process")
async def process_payment_endpoint(payment_request: PaymentRequest):
    """Process payment for an order."""
    return PaymentService.process_payment(payment_request)


@router.get("/orders/{order_id}", response_model=Order)
async def get_order_endpoint(order_id: str):
    """Get a specific order by ID."""
    order = get_order_by_id(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.get("/orders", response_model=List[Order])
async def get_orders_endpoint():
    """Get all orders."""
    return get_all_orders()
