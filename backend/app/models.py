from pydantic import BaseModel
from typing import List
from datetime import datetime


class Product(BaseModel):
    id: str
    name: str
    description: str
    price: float
    image_url: str
    category: str
    stock: int


class CartItem(BaseModel):
    product_id: str
    quantity: int


class Cart(BaseModel):
    items: List[CartItem]


class OrderItem(BaseModel):
    product_id: str
    product_name: str
    price: float
    quantity: int


class Order(BaseModel):
    id: str
    items: List[OrderItem]
    total: float
    status: str
    created_at: datetime
    customer_email: str


class CreateOrderRequest(BaseModel):
    items: List[CartItem]
    customer_email: str


class PaymentRequest(BaseModel):
    order_id: str
    payment_method_id: str
