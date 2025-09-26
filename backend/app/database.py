import uuid
from typing import List, Dict, Any
from .models import Product, Order, CartItem

products_db: List[Product] = []
orders_db: List[Order] = []
cart_db: Dict[str, List[CartItem]] = {}


def init_sample_data():
    """Initialize the database with sample product data."""
    sample_products = [
        {
            "id": str(uuid.uuid4()),
            "name": "Wireless Headphones",
            "description": "High-quality wireless headphones with noise cancellation",
            "price": 199.99,
            "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
            "category": "Electronics",
            "stock": 50
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Smart Watch",
            "description": "Feature-rich smartwatch with health tracking",
            "price": 299.99,
            "image_url": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
            "category": "Electronics",
            "stock": 30
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Coffee Maker",
            "description": "Premium coffee maker for the perfect brew",
            "price": 149.99,
            "image_url": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400",
            "category": "Home",
            "stock": 25
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Running Shoes",
            "description": "Comfortable running shoes for all terrains",
            "price": 129.99,
            "image_url": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
            "category": "Sports",
            "stock": 40
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Laptop Backpack",
            "description": "Durable laptop backpack with multiple compartments",
            "price": 79.99,
            "image_url": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400",
            "category": "Accessories",
            "stock": 60
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Bluetooth Speaker",
            "description": "Portable Bluetooth speaker with excellent sound quality",
            "price": 89.99,
            "image_url": "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400",
            "category": "Electronics",
            "stock": 35
        }
    ]
    
    global products_db
    products_db.clear()
    for product_data in sample_products:
        products_db.append(Product(**product_data))


def get_products() -> List[Product]:
    """Get all products from the database."""
    return products_db


def get_product_by_id(product_id: str) -> Product | None:
    """Get a product by its ID."""
    return next((p for p in products_db if p.id == product_id), None)


def get_products_by_category(category: str) -> List[Product]:
    """Get products filtered by category."""
    return [p for p in products_db if p.category.lower() == category.lower()]


def get_cart(session_id: str) -> List[CartItem]:
    """Get cart items for a session."""
    return cart_db.get(session_id, [])


def add_to_cart(session_id: str, item: CartItem) -> None:
    """Add an item to the cart."""
    if session_id not in cart_db:
        cart_db[session_id] = []
    
    existing_item = next((i for i in cart_db[session_id] if i.product_id == item.product_id), None)
    if existing_item:
        existing_item.quantity += item.quantity
    else:
        cart_db[session_id].append(item)


def remove_from_cart(session_id: str, product_id: str) -> None:
    """Remove an item from the cart."""
    if session_id in cart_db:
        cart_db[session_id] = [item for item in cart_db[session_id] if item.product_id != product_id]


def create_order(order: Order) -> None:
    """Add an order to the database."""
    orders_db.append(order)


def get_order_by_id(order_id: str) -> Order | None:
    """Get an order by its ID."""
    return next((o for o in orders_db if o.id == order_id), None)


def get_all_orders() -> List[Order]:
    """Get all orders from the database."""
    return orders_db


def update_product_stock(product_id: str, quantity_sold: int) -> None:
    """Update product stock after a sale."""
    product = get_product_by_id(product_id)
    if product:
        product.stock -= quantity_sold
