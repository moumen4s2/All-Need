from sqlalchemy import (
    Column,
    String,
    Float,
    Integer,
    Boolean,
    Text,
    ForeignKey,
    Numeric,
)
from database import Base
from sqlalchemy.orm import relationship


# =========================================================
# USER
# =========================================================

class User(Base):
    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        String,
        unique=True,
        index=True
    )

    email = Column(
        String,
        unique=True
    )

    name = Column(String)

    picture = Column(String)

    created_at = Column(String)


# =========================================================
# USER SESSION
# =========================================================

class UserSession(Base):
    __tablename__ = "user_sessions"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(String)

    session_token = Column(
        String,
        unique=True
    )

    expires_at = Column(String)

    created_at = Column(String)


# =========================================================
# ADMIN
# =========================================================

class Admin(Base):
    __tablename__ = "admins"

    id = Column(
        Integer,
        primary_key=True
    )

    email = Column(
        String,
        unique=True
    )

    password = Column(String)

    name = Column(String)


# =========================================================
# ADMIN SESSION
# =========================================================

class AdminSession(Base):
    __tablename__ = "admin_sessions"

    id = Column(
        Integer,
        primary_key=True
    )

    admin_id = Column(Integer)

    session_token = Column(
        String,
        unique=True
    )

    created_at = Column(String)

    expires_at = Column(String)


# =========================================================
# PRODUCT
# =========================================================

class Product(Base):
    __tablename__ = "products"

    id = Column(
        String,
        primary_key=True
    )

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

    old_price = Column(
        Float,
        nullable=True
    )

    image = Column(Text)

    description = Column(Text)

    description_ar = Column(Text)

    best_seller = Column(
        Boolean,
        default=False
    )

    new_arrival = Column(
        Boolean,
        default=False
    )

    rating = Column(
        Float,
        default=0
    )

    review_count = Column(
        Integer,
        default=0
    )

    in_stock = Column(
        Boolean,
        default=True
    )


# =========================================================
# CATEGORY
# =========================================================

class Category(Base):
    __tablename__ = "categories"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String,
        unique=True,
        nullable=False
    )

    image = Column(
        String,
        nullable=True
    )

    products = relationship(
        "Product",
        back_populates="category",
        cascade="all, delete"
    )


# =========================================================
# REVIEW
# =========================================================

class Review(Base):
    __tablename__ = "reviews"

    id = Column(
        String,
        primary_key=True
    )

    product_id = Column(
        String,
        ForeignKey("products.id")
    )

    author = Column(String)

    rating = Column(Integer)

    comment = Column(Text)

    date = Column(String)


# =========================================================
# NEWSLETTER
# =========================================================

class Newsletter(Base):
    __tablename__ = "newsletter"

    id = Column(
        Integer,
        primary_key=True
    )

    email = Column(
        String,
        unique=True
    )

    date = Column(String)


# =========================================================
# CONTACT MESSAGE
# =========================================================

class ContactMessage(Base):
    __tablename__ = "contact_messages"

    id = Column(
        Integer,
        primary_key=True
    )

    name = Column(String)

    email = Column(String)

    subject = Column(String)

    message = Column(Text)

    date = Column(String)


# =========================================================
# ORDER
# =========================================================

class Order(Base):
    __tablename__ = "orders"

    id = Column(
        Integer,
        primary_key=True
    )

    order_id = Column(
        String,
        unique=True
    )

    tracking_number = Column(
        String,
        unique=True
    )

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

    # -----------------------------------------------------
    # Payments belonging to this order
    # -----------------------------------------------------

    payments = relationship(
        "Payment",
        back_populates="order",
        cascade="all, delete-orphan"
    )


# =========================================================
# ORDER ITEM
# =========================================================

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(
        Integer,
        primary_key=True
    )

    order_id = Column(
        String,
        ForeignKey("orders.order_id")
    )

    product_id = Column(String)

    name = Column(String)

    price = Column(Float)

    quantity = Column(Integer)

    image = Column(Text)


# =========================================================
# PAYMENT
# =========================================================
#
# IMPORTANT SECURITY NOTES:
#
# We DO NOT store:
# - Card number
# - CVV
# - Expiry date
# - Card PIN
# - Stripe client secret
#
# Stripe handles sensitive card information.
#
# We only store the payment reference/status needed
# by AllNeeds to track the transaction.
# =========================================================

class Payment(Base):
    __tablename__ = "payments"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    # -----------------------------------------------------
    # Internal AllNeeds order
    # -----------------------------------------------------

    order_id = Column(
        String,
        ForeignKey("orders.order_id"),
        nullable=False,
        index=True
    )

    order = relationship(
        "Order",
        back_populates="payments"
    )

    # -----------------------------------------------------
    # Payment provider
    # -----------------------------------------------------

    provider = Column(
        String,
        nullable=False,
        default="stripe"
    )

    # -----------------------------------------------------
    # Stripe PaymentIntent ID
    #
    # Example:
    # pi_3Nxxxxxxxxxxxxxxxx
    #
    # This is NOT card information.
    # -----------------------------------------------------

    provider_payment_id = Column(
        String,
        unique=True,
        nullable=True,
        index=True
    )

    # -----------------------------------------------------
    # Amount
    #
    # Numeric is used instead of Float because this is money.
    # Example:
    # 129.50 AED
    # -----------------------------------------------------

    amount = Column(
        Numeric(
            precision=12,
            scale=2
        ),
        nullable=False
    )

    # -----------------------------------------------------
    # Currency
    #
    # For AllNeeds:
    # AED
    # -----------------------------------------------------

    currency = Column(
        String(3),
        nullable=False,
        default="AED"
    )

    # -----------------------------------------------------
    # Payment status
    #
    # Examples:
    #
    # pending
    # processing
    # requires_action
    # succeeded
    # failed
    # canceled
    #
    # The exact status will be updated from Stripe.
    # -----------------------------------------------------

    status = Column(
        String,
        nullable=False,
        default="pending",
        index=True
    )

    # -----------------------------------------------------
    # Payment method type
    #
    # Examples:
    #
    # card
    # apple_pay
    # google_pay
    #
    # This is only a method identifier.
    # No sensitive payment information is stored.
    # -----------------------------------------------------

    payment_method = Column(
        String,
        nullable=True
    )

    # -----------------------------------------------------
    # Timestamps
    # -----------------------------------------------------

    created_at = Column(
        String,
        nullable=False
    )

    updated_at = Column(
        String,
        nullable=True
    )