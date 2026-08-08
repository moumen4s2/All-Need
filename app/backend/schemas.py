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
    category_id: int
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

class CategoryCreate(BaseModel):
    name: str
    image: str | None = None


class CategoryResponse(CategoryCreate):
    id: int

    class Config:
        from_attributes = True

class AdminLogin(BaseModel):
    email: EmailStr
    password: str


class UpdateOrderStatus(BaseModel):
    status: str

class ReviewSchema(BaseModel):
    id: str = Field(
        default_factory=lambda: str(uuid.uuid4())
    )

    author: str

    rating: int

    comment: str

    date: str = Field(
        default_factory=lambda: now_utc().isoformat()
    )


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
    quantity: int = Field(
        gt=0,
        le=100
    )


class OrderCreate(BaseModel):

    items: List[OrderItemCreate] = Field(
        min_length=1
    )

    coupon: Optional[str] = None

    customer_name: str

    email: EmailStr

    phone: str

    address: str

    city: str

    emirate: str


class PaymentCreate(BaseModel):
    order_id: str


class PaymentResponse(BaseModel):
    id: int
    order_id: str
    provider: str
    provider_payment_id: Optional[str] = None
    amount: float
    currency: str
    status: str
    payment_method: Optional[str] = None
    created_at: str
    updated_at: Optional[str] = None

    class Config:
        from_attributes = True