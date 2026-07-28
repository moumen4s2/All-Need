from sqlalchemy import (
    Column,
    String,
    Float,
    Integer,
    Boolean,
    Text,
    ForeignKey
)
from pydantic import BaseModel
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, unique=True, index=True)
    email = Column(String, unique=True)
    name = Column(String)
    picture = Column(String)
    created_at = Column(String)


class UserSession(Base):
    __tablename__ = "user_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String)
    session_token = Column(String, unique=True)
    expires_at = Column(String)
    created_at = Column(String)

class Admin(Base):
    __tablename__ = "admins"

    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True)
    password = Column(String)
    name = Column(String)


class AdminSession(Base):
    __tablename__ = "admin_sessions"

    id = Column(Integer, primary_key=True)

    admin_id = Column(Integer)

    session_token = Column(String, unique=True)

    created_at = Column(String)

    expires_at = Column(String)

class Product(Base):
    __tablename__ = "products"

    id = Column(String, primary_key=True)

    name = Column(String)
    name_ar = Column(String)

    category_id = Column(
        Integer,
        ForeignKey("categories.id"),
        nullable=False
    )

    category = relationship(
        "Category",
        back_populates="products"
    )

    price = Column(Float)
    old_price = Column(Float, nullable=True)

    image = Column(Text)

    description = Column(Text)
    description_ar = Column(Text)

    best_seller = Column(Boolean, default=False)
    new_arrival = Column(Boolean, default=False)

    rating = Column(Float, default=0)

    review_count = Column(Integer, default=0)

    in_stock = Column(Boolean, default=True)

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String, unique=True, nullable=False)

    image = Column(String, nullable=True)

    products = relationship(
        "Product",
        back_populates="category",
        cascade="all, delete"
    )


class Review(Base):
    __tablename__ = "reviews"

    id = Column(String, primary_key=True)

    product_id = Column(
        String,
        ForeignKey("products.id")
    )

    author = Column(String)

    rating = Column(Integer)

    comment = Column(Text)

    date = Column(String)


class Newsletter(Base):
    __tablename__ = "newsletter"

    id = Column(Integer, primary_key=True)

    email = Column(String, unique=True)

    date = Column(String)


class ContactMessage(Base):
    __tablename__ = "contact_messages"

    id = Column(Integer, primary_key=True)

    name = Column(String)

    email = Column(String)

    subject = Column(String)

    message = Column(Text)

    date = Column(String)


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True)

    order_id = Column(String, unique=True)
    tracking_number = Column(String, unique=True)

    user_id = Column(String)

    customer_name = Column(String)
    email = Column(String)
    phone = Column(String)

    address = Column(String)
    city = Column(String)
    emirate = Column(String)

    subtotal = Column(Float)
    discount = Column(Float)
    shipping = Column(Float)
    total = Column(Float)

    coupon = Column(String)

    status = Column(String)

    created_at = Column(String)


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True)

    order_id = Column(
        String,
        ForeignKey("orders.order_id")
    )

    product_id = Column(String)
    name = Column(String)
    price = Column(Float)
    quantity = Column(Integer)
    image = Column(Text)

