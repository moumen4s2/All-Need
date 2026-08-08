from typing import List, Optional
from datetime import datetime, timezone
import uuid

from pydantic import BaseModel, Field, EmailStr


def now_utc():
    return datetime.now(timezone.utc)


# =========================================================
# PRODUCTS
# =========================================================

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


# =========================================================
# CATEGORIES
# =========================================================

class CategoryCreate(BaseModel):
    name: str
    image: str | None = None


class CategoryResponse(CategoryCreate):
    id: int

    class Config:
        from_attributes = True


# =========================================================
# ADMIN
# =========================================================

class AdminLogin(BaseModel):
    email: EmailStr
    password: str


class UpdateOrderStatus(BaseModel):
    status: str


# =========================================================
# REVIEWS
# =========================================================

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


# =========================================================
# NEWSLETTER
# =========================================================

class NewsletterCreate(BaseModel):
    email: EmailStr


# =========================================================
# CONTACT
# =========================================================

class ContactMessageCreate(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str


# =========================================================
# COUPONS
# =========================================================

class CouponCheck(BaseModel):
    code: str


# =========================================================
# ORDER ITEMS
# =========================================================
#
# IMPORTANT:
#
# The customer is NOT allowed to tell the backend:
#
# - product name
# - product price
# - image
#
# The backend will get those values directly from PostgreSQL.
#
# The customer only sends:
#
# product_id
# quantity
#
# This prevents someone from changing:
#
# "price": 899
#
# to:
#
# "price": 1
#
# =========================================================

class OrderItemCreate(BaseModel):
    product_id: str
    quantity: int = Field(
        gt=0,
        le=100
    )


# =========================================================
# ORDER CREATE
# =========================================================
#
# IMPORTANT:
#
# We intentionally DO NOT accept:
#
# subtotal
# discount
# shipping
# total
#
# from the frontend.
#
# These values will be calculated by the backend.
#
# =========================================================

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