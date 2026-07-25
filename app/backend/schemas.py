from typing import List, Optional
from datetime import datetime, timezone
import uuid

from pydantic import BaseModel, Field, EmailStr


def now_utc():
    return datetime.now(timezone.utc)


class ProductCreate(BaseModel):
    id: str
    name: str
    name_ar: str
    category: str
    price: float
    old_price: Optional[float] = None
    image: str
    description: str
    description_ar: str
    best_seller: bool = False
    new_arrival: bool = False
    rating: float = 5
    review_count: int = 0
    in_stock: bool = True


class AdminLogin(BaseModel):
    email: EmailStr
    password: str


class UpdateOrderStatus(BaseModel):
    status: str


class ReviewSchema(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    author: str
    rating: int
    comment: str
    date: str = Field(default_factory=lambda: now_utc().isoformat())


class ReviewCreate(BaseModel):
    author: str
    rating: int
    comment: str


class NewsletterCreate(BaseModel):
    email: EmailStr


class ContactMessageCreate(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str


class CouponCheck(BaseModel):
    code: str


class OrderItemCreate(BaseModel):
    product_id: str
    name: str
    price: float
    quantity: int
    image: str


class OrderCreate(BaseModel):
    items: List[OrderItemCreate]
    subtotal: float
    discount: float = 0
    shipping: float = 0
    total: float
    coupon: Optional[str] = None
    customer_name: str
    email: EmailStr
    phone: str
    address: str
    city: str
    emirate: str