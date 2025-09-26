import uuid
import logging
from typing import Dict, Any
from datetime import datetime
from fastapi import HTTPException

from .models import Order, OrderItem, CreateOrderRequest, PaymentRequest
from .database import (
    get_product_by_id, 
    create_order, 
    get_order_by_id, 
    update_product_stock
)
from .config import settings

logger = logging.getLogger(__name__)


class OrderService:
    @staticmethod
    def create_order(order_request: CreateOrderRequest) -> Order:
        """Create a new order from cart items."""
        order_items = []
        total = 0
        
        for item in order_request.items:
            product = get_product_by_id(item.product_id)
            if not product:
                raise HTTPException(
                    status_code=404, 
                    detail=f"Product {item.product_id} not found"
                )
            
            if product.stock < item.quantity:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Insufficient stock for {product.name}"
                )
            
            order_item = OrderItem(
                product_id=item.product_id,
                product_name=product.name,
                price=product.price,
                quantity=item.quantity
            )
            order_items.append(order_item)
            total += product.price * item.quantity
            
            update_product_stock(item.product_id, item.quantity)
        
        order = Order(
            id=str(uuid.uuid4()),
            items=order_items,
            total=total,
            status="pending",
            created_at=datetime.now(),
            customer_email=order_request.customer_email
        )
        
        create_order(order)
        logger.info(f"Created order {order.id} for {order.customer_email}")
        return order


class PaymentService:
    @staticmethod
    def process_payment(payment_request: PaymentRequest) -> Dict[str, Any]:
        """Process payment for an order."""
        order = get_order_by_id(payment_request.order_id)
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        try:
            payment_intent = {
                "id": f"pi_{uuid.uuid4().hex[:24]}",
                "amount": int(order.total * 100),
                "currency": "usd",
                "status": "succeeded"
            }
            
            order.status = "paid"
            
            logger.info(f"Payment processed for order {order.id}")
            
            return {
                "success": True,
                "payment_intent_id": payment_intent["id"],
                "order_id": order.id,
                "amount": order.total
            }
        
        except Exception as e:
            logger.error(f"Payment failed for order {payment_request.order_id}: {str(e)}")
            raise HTTPException(status_code=400, detail=f"Payment failed: {str(e)}")
