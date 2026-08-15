from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from stripe_service import get_stripe_client
from decimal import Decimal

import os
import logging
import uuid
import httpx
import stripe

from pathlib import Path
from datetime import datetime, timezone, timedelta
from schemas import now_utc
from passlib.context import CryptContext
from typing import Optional,List

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from database import Base, engine, get_db

from models import (
    User,
    UserSession,
    Admin,
    AdminSession,
    Product,
    Category,
    Review,
    Newsletter,
    ContactMessage,
    Order,
    OrderItem,
    Coupon,
    Payment,
    Order,
    SiteSettings
)

# Pydantic Schemas
from schemas import (
    ProductCreate,
    CategoryCreate,
    AdminLogin,
    UpdateOrderStatus,
    ReviewSchema,
    ReviewCreate,
    NewsletterCreate,
    ContactMessageCreate,
    CouponCheck,
    CouponCreate,
    CouponUpdate,
    CouponResponse,
    OrderItemCreate,
    OrderCreate,
    PaymentCreate,
    SiteSettingsResponse,
    SiteSettingsUpdate
)

pwd = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)
async def create_default_admin():

    async with AsyncSession(engine) as db:

        result = await db.execute(
            select(Admin).where(
                Admin.email == "admin@allneeds.ae"
            )
        )

        admin = result.scalar_one_or_none()

        if admin:
            return

        db.add(

            Admin(

                name="Administrator",

                email="admin@allneeds.ae",

                password=pwd.hash("admin123")

            )

        )

        await db.commit()

        print("Default admin created.")


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

logger = logging.getLogger(__name__)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://all-need.pages.dev",
        ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- Auth helpers ----------------
from sqlalchemy import select
from models import User, UserSession

async def get_current_user(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    token = request.cookies.get("session_token")

    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]

    if not token:
        return None

    result = await db.execute(
        select(UserSession).where(
            UserSession.session_token == token
        )
    )

    session = result.scalar_one_or_none()

    if not session:
        return None

    expires = datetime.fromisoformat(session.expires_at)

    if expires < now_utc():
        return None

    result = await db.execute(
        select(User).where(
            User.user_id == session.user_id
        )
    )

    return result.scalar_one_or_none()

@api_router.post("/admin/login")
async def admin_login(
    data: AdminLogin,
    response: Response,
    db: AsyncSession = Depends(get_db)
):

    result = await db.execute(
        select(Admin).where(
            Admin.email == data.email
        )
    )

    admin = result.scalar_one_or_none()

    if not admin:
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )

    if not pwd.verify(
        data.password,
        admin.password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )

    token = str(uuid.uuid4())

    session = AdminSession(

        admin_id=admin.id,

        session_token=token,

        created_at=now_utc().isoformat(),

        expires_at=(
            now_utc() + timedelta(days=30)
        ).isoformat()

    )
    await db.commit()

    print("TOKEN CREATED:", token)

    result = await db.execute(
        select(AdminSession).where(
            AdminSession.session_token == token
        )
    )

    print("SESSION AFTER COMMIT:", result.scalar_one_or_none())

    db.add(session)

    await db.commit()

    response.set_cookie(
    key="admin_token",
    value=token,
    httponly=True,
    secure=True,
    samesite="none",
    max_age=60 * 60 * 24 * 30,
)

    return {
        "ok": True,
        "name": admin.name
    }

async def get_current_admin(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    token = request.cookies.get("admin_token")

    if not token:
        raise HTTPException(
            status_code=401,
            detail="Unauthorized"
        )

    print("COOKIE TOKEN:", token)

    result = await db.execute(
        select(AdminSession).where(
            AdminSession.session_token == token
        )
    )

    session = result.scalar_one_or_none()

    print("SESSION FOUND:", session)

    if not session:
        raise HTTPException(
            status_code=401,
            detail="Unauthorized"
        )

    result = await db.execute(
        select(Admin).where(
            Admin.id == session.admin_id
        )
    )

    admin = result.scalar_one_or_none()

    if not admin:
        raise HTTPException(
            status_code=401,
            detail="Unauthorized"
        )

    return admin

@api_router.get("/admin/me")
async def admin_me(
    admin: Admin = Depends(get_current_admin)
):
    return {
        "name": admin.name
    }

@api_router.post("/admin/logout")
async def admin_logout(
    response: Response
):
    response.delete_cookie(
        key="admin_token",
        httponly=True,
        samesite="lax"
    )

    return {
        "success": True
    }

async def create_session(
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db)
):
    body = await request.json()
    session_id = body.get("session_id")
    if not session_id:
        raise HTTPException(status_code=400, detail="Missing session_id")
    async with httpx.AsyncClient() as hc:
        r = await hc.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": session_id},
        )
    if r.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid session")
    data = r.json()
    email = data["email"]

    result = await db.execute(
        select(User).where(User.email == email)
    )
    existing = result.scalar_one_or_none()

    if existing:
        user_id = existing.user_id
        existing.name = data["name"]
        existing.picture = data.get("picture", "")

        await db.commit()

    else:
        user_id = f"user_{uuid.uuid4().hex[:12]}"

        user = User(
            user_id=user_id,
            email=email,
            name=data["name"],
            picture=data.get("picture", ""),
            created_at=now_utc().isoformat()
        )

        db.add(user)
        await db.commit()

    session_token = data["session_token"]
    expires_at = now_utc() + timedelta(days=7)

    session = UserSession(
        user_id=user_id,
        session_token=session_token,
        expires_at=expires_at.isoformat(),
        created_at=now_utc().isoformat()
    )

    db.add(session)
    await db.commit()

    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7 * 24 * 60 * 60
    )

    result = await db.execute(
        select(User).where(User.user_id == user_id)
    )

    return result.scalar_one()

@api_router.get("/auth/me")
async def auth_me(user=Depends(get_current_user)):
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user


@api_router.post("/auth/logout")
async def logout(
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db)
):
    token = request.cookies.get("session_token")

    if token:
        result = await db.execute(
            select(UserSession).where(
                UserSession.session_token == token
            )
        )

        session = result.scalar_one_or_none()

        if session:
            await db.delete(session)
            await db.commit()

    response.delete_cookie("session_token", path="/")

    return {"ok": True}


@api_router.get("/categories")
async def get_categories(
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Category))
    categories = result.scalars().all()

    data = []

    for category in categories:

        count_result = await db.execute(
            select(func.count(Product.id)).where(
                Product.category_id == category.id
            )
        )

        data.append({
            "id": category.id,
            "name": category.name,
            "image": category.image,
            "count": count_result.scalar()
        })

    return data

@api_router.get("/products")
async def get_products(
    category_id: Optional[int] = None,
    search: Optional[str] = None,
    sort: Optional[str] = None,
    best_seller: Optional[bool] = None,
    new_arrival: Optional[bool] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    db: AsyncSession = Depends(get_db)
):

    query = select(Product)

    if category_id is not None:
        query = query.where(Product.category_id == category_id)

    if best_seller:
        query = query.where(Product.best_seller == True)

    if new_arrival:
        query = query.where(Product.new_arrival == True)

    if min_price is not None:
        query = query.where(Product.price >= min_price)

    if max_price is not None:
        query = query.where(Product.price <= max_price)

    if search:
        query = query.where(
            Product.name.ilike(f"%{search}%")
        )

    result = await db.execute(query)

    products = result.scalars().all()

    if sort == "price_asc":
        products = sorted(products, key=lambda p: p.price)

    elif sort == "price_desc":
        products = sorted(products, key=lambda p: p.price, reverse=True)

    elif sort == "rating":
        products = sorted(products, key=lambda p: p.rating, reverse=True)

    return products


@api_router.get("/products/{product_id}")
async def get_product(
    product_id: str,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Product).where(Product.id == product_id)
    )

    product = result.scalar_one_or_none()

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    return product


@api_router.post("/products/{product_id}/reviews")
async def add_review(
    product_id: str,
    review: ReviewCreate,
    db: AsyncSession = Depends(get_db)
):

    result = await db.execute(
        select(Product).where(Product.id == product_id)
    )

    product = result.scalar_one_or_none()

    if not product:
        raise HTTPException(404, "Product not found")

    new_review = Review(
        product_id=product_id,
        author=review.author,
        rating=review.rating,
        comment=review.comment,
        date=now_utc()
    )

    db.add(new_review)

    product.review_count += 1

    product.rating = round(
        ((product.rating * (product.review_count - 1)) + review.rating)
        / product.review_count,
        1
    )

    await db.commit()

    return new_review



@api_router.post("/newsletter")
async def subscribe(
    data: NewsletterCreate,
    db: AsyncSession = Depends(get_db)
):

    result = await db.execute(
        select(Newsletter).where(
            Newsletter.email == data.email
        )
    )

    existing = result.scalar_one_or_none()

    if existing is None:
        db.add(
            Newsletter(
                email=data.email,
                date=now_utc()
            )
        )

        await db.commit()

    return {
        "ok": True,
        "message": "Subscribed successfully"
    }
    return {"ok": True, "message": "Subscribed successfully"}


@api_router.post("/contact")
async def contact(
    data: ContactMessageCreate,
    db: AsyncSession = Depends(get_db)
):

    message = ContactMessage(
        name=data.name,
        email=data.email,
        subject=data.subject,
        message=data.message,
        date=now_utc()
    )

    db.add(message)

    await db.commit()

    return {
        "ok": True,
        "message": "Message received"
    }


@api_router.post("/coupons/validate")
async def validate_coupon(
    data: CouponCheck,
    db: AsyncSession = Depends(get_db)
):
    code = data.code.strip().upper()

    if data.cart_subtotal < 0:
        raise HTTPException(
            status_code=400,
            detail="Invalid cart subtotal"
        )

    result = await db.execute(
        select(Coupon).where(
            Coupon.code == code
        )
    )

    coupon = result.scalar_one_or_none()

    if not coupon:
        raise HTTPException(
            status_code=404,
            detail="Invalid coupon code"
        )

    if not coupon.is_active:
        raise HTTPException(
            status_code=400,
            detail="This coupon is inactive"
        )

    if (
        coupon.usage_limit is not None
        and coupon.used_count >= coupon.usage_limit
    ):
        raise HTTPException(
            status_code=400,
            detail="This coupon has reached its usage limit"
        )

    # Minimum order amount
    if (
        coupon.min_order_amount is not None
        and data.cart_subtotal < float(coupon.min_order_amount)
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                f"Minimum order amount for this coupon is "
                f"AED {float(coupon.min_order_amount):.2f}"
            )
        )

    # Calculate preview discount
    if coupon.discount_type == "percent":

        discount = data.cart_subtotal * (
            float(coupon.value) / 100
        )

    elif coupon.discount_type == "fixed":

        discount = float(coupon.value)

    else:

        raise HTTPException(
            status_code=400,
            detail="Invalid coupon discount type"
        )

    # Maximum discount
    if coupon.max_discount is not None:

        discount = min(
            discount,
            float(coupon.max_discount)
        )

    # Discount cannot exceed cart subtotal
    discount = min(
        discount,
        data.cart_subtotal
    )

    discount = round(
        max(discount, 0.0),
        2
    )

    return {
        "valid": True,
        "code": coupon.code,
        "discount_type": coupon.discount_type,
        "value": float(coupon.value),
        "discount": discount,
        "description": coupon.description,
        "min_order_amount": (
            float(coupon.min_order_amount)
            if coupon.min_order_amount is not None
            else None
        ),
        "max_discount": (
            float(coupon.max_discount)
            if coupon.max_discount is not None
            else None
        )
    }


@api_router.post("/orders")
async def create_order(
    order: OrderCreate,
    user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not order.items:
        raise HTTPException(
            status_code=400,
            detail="Order must contain at least one item"
        )

    subtotal = 0.0
    order_items = []

    for item in order.items:

        result = await db.execute(
            select(Product).where(
                Product.id == item.product_id
            )
        )

        product = result.scalar_one_or_none()

        if not product:
            raise HTTPException(
                status_code=404,
                detail=f"Product not found: {item.product_id}"
            )

        if not product.in_stock:
            raise HTTPException(
                status_code=400,
                detail=f"Product out of stock: {product.name}"
            )

        item_total = float(product.price) * item.quantity

        subtotal += item_total

        order_items.append({
            "product": product,
            "quantity": item.quantity,
            "price": float(product.price)
        })

    discount = 0.0
    coupon_code = None
    coupon = None

    if order.coupon:

        coupon_code = order.coupon.strip().upper()

        result = await db.execute(
            select(Coupon).where(
                Coupon.code == coupon_code
            )
        )

        coupon = result.scalar_one_or_none()

        if not coupon:
            raise HTTPException(
                status_code=400,
                detail="Invalid coupon code"
            )

        if not coupon.is_active:
            raise HTTPException(
                status_code=400,
                detail="This coupon is inactive"
            )

        if (
            coupon.usage_limit is not None
            and coupon.used_count >= coupon.usage_limit
        ):
            raise HTTPException(
                status_code=400,
                detail="This coupon has reached its usage limit"
            )

        if (
            coupon.min_order_amount is not None
            and subtotal < float(coupon.min_order_amount)
        ):
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Minimum order amount for this coupon is "
                    f"AED {float(coupon.min_order_amount):.2f}"
                )
            )

        if coupon.discount_type == "percent":

            discount = subtotal * (
                float(coupon.value) / 100
            )

        elif coupon.discount_type == "fixed":

            discount = float(coupon.value)

        else:

            raise HTTPException(
                status_code=400,
                detail="Invalid coupon discount type"
            )

        if coupon.max_discount is not None:

            discount = min(
                discount,
                float(coupon.max_discount)
            )

        discount = min(
            discount,
            subtotal
        )

        discount = round(
            max(discount, 0.0),
            2
        )

    shipping = 0.0

    total = round(
        subtotal - discount + shipping,
        2
    )

    if total < 0:
        total = 0.0

    order_id = (
        f"AN{uuid.uuid4().hex[:8].upper()}"
    )

    tracking = (
        f"ANUAE{uuid.uuid4().hex[:10].upper()}"
    )


    new_order = Order(
        order_id=order_id,
        tracking_number=tracking,

        # Order is not paid yet
        status="pending_payment",

        user_id=(
            user.user_id
            if user
            else None
        ),

        customer_name=order.customer_name,
        email=order.email,
        phone=order.phone,
        address=order.address,
        city=order.city,
        emirate=order.emirate,

        subtotal=round(subtotal, 2),
        discount=round(discount, 2),
        shipping=round(shipping, 2),
        total=round(total, 2),

        coupon=coupon_code,

        created_at=now_utc().isoformat()
    )

    db.add(new_order)


    for item_data in order_items:

        product = item_data["product"]

        db_item = OrderItem(
            order_id=order_id,

            product_id=product.id,

            # Values come from PostgreSQL
            # NOT from the frontend
            name=product.name,
            price=item_data["price"],
            quantity=item_data["quantity"],
            image=product.image
        )

        db.add(db_item)

    await db.commit()

    return {
        "order_id": order_id,
        "tracking_number": tracking,
        "status": "pending_payment",
        "subtotal": round(subtotal, 2),
        "discount": round(discount, 2),
        "shipping": round(shipping, 2),
        "total": round(total, 2),
        "currency": "AED"
    }

@api_router.get("/orders")
async def my_orders(
    user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):

    if not user:
        raise HTTPException(401, "Not authenticated")

    result = await db.execute(
        select(Order)
        .where(Order.user_id == user.user_id)
    )

    return result.scalars().all()

@api_router.get("/orders/track/{tracking_number}")
async def track_order(
    tracking_number: str,
    db: AsyncSession = Depends(get_db)
):

    result = await db.execute(
        select(Order)
        .where(
            Order.tracking_number == tracking_number.upper()
        )
    )

    order = result.scalar_one_or_none()

    if order is None:
        raise HTTPException(404, "Order not found")

    return order


@api_router.post("/payments/create")
async def create_payment(
    data: PaymentCreate,
    db: AsyncSession = Depends(get_db)
):

    result = await db.execute(
        select(Order).where(
            Order.order_id == data.order_id
        )
    )

    order = result.scalar_one_or_none()

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found"
        )


    if order.total is None or order.total <= 0:
        raise HTTPException(
            status_code=400,
            detail="Invalid order total"
        )



    if order.status == "paid":
        raise HTTPException(
            status_code=400,
            detail="Order is already paid"
        )


    result = await db.execute(
        select(Payment).where(
            Payment.order_id == order.order_id,
            Payment.status.in_([
                "pending",
                "processing",
                "requires_action"
            ])
        )
    )

    existing_payment = result.scalar_one_or_none()

    if existing_payment:
        return {
            "payment_id": existing_payment.id,
            "order_id": existing_payment.order_id,
            "amount": float(existing_payment.amount),
            "currency": existing_payment.currency,
            "status": existing_payment.status,
            "provider_payment_id": existing_payment.provider_payment_id
        }


    amount = Decimal(str(order.total)).quantize(
        Decimal("0.01")
    )

    amount_fils = int(amount * 100)


    stripe_client = get_stripe_client()


    try:

        payment_intent = stripe_client.payment_intents.create({
            "amount": amount_fils,
            "currency": "aed",
            "metadata": {
                "order_id": order.order_id
            }
        })

    except Exception as e:

        raise HTTPException(
            status_code=502,
            detail=f"Payment provider error: {str(e)}"
        )


    payment = Payment(
        order_id=order.order_id,
        provider="stripe",
        provider_payment_id=payment_intent.id,
        amount=amount,
        currency="AED",
        status="pending",
        payment_method=None,
        created_at=now_utc().isoformat()
    )

    db.add(payment)

    await db.commit()
    await db.refresh(payment)


    return {
        "payment_id": payment.id,
        "order_id": payment.order_id,
        "amount": float(payment.amount),
        "currency": payment.currency,
        "status": payment.status,
        "provider_payment_id": payment.provider_payment_id,
        "client_secret": payment_intent.client_secret
    }

@api_router.post("/payments/webhook")
async def stripe_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    payload = await request.body()

    signature = request.headers.get("stripe-signature")

    webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET")

    if not webhook_secret:
        raise HTTPException(
            status_code=500,
            detail="STRIPE_WEBHOOK_SECRET is not configured"
        )

    try:
        event = stripe.Webhook.construct_event(
            payload,
            signature,
            webhook_secret
        )

    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Invalid webhook payload"
        )

    except stripe.error.SignatureVerificationError:
        raise HTTPException(
            status_code=400,
            detail="Invalid webhook signature"
        )

    event_type = event["type"]


    if event_type == "payment_intent.succeeded":

        payment_intent = event["data"]["object"]

        payment_intent_id = payment_intent["id"]

        result = await db.execute(
            select(Payment).where(
                Payment.provider_payment_id == payment_intent_id
            )
        )

        payment = result.scalar_one_or_none()

        if payment:

            was_already_succeeded = (
                payment.status == "succeeded"
            )

            payment.status = "succeeded"
            payment.updated_at = now_utc().isoformat()

            result = await db.execute(
                select(Order).where(
                    Order.order_id == payment.order_id
                )
            )

            order = result.scalar_one_or_none()

            if order:

                order.status = "paid"

                if (
                    not was_already_succeeded
                    and order.coupon
                ):

                    coupon_code = (
                        order.coupon.strip().upper()
                    )

                    result = await db.execute(
                        select(Coupon).where(
                            Coupon.code == coupon_code
                        )
                    )

                    coupon = (
                        result.scalar_one_or_none()
                    )

                    if coupon:

                        if (
                            coupon.usage_limit is None
                            or coupon.used_count
                            < coupon.usage_limit
                        ):

                            coupon.used_count += 1

                            coupon.updated_at = (
                                now_utc().isoformat()
                            )

            await db.commit()

    elif event_type == "payment_intent.payment_failed":

        payment_intent = event["data"]["object"]

        payment_intent_id = payment_intent["id"]

        result = await db.execute(
            select(Payment).where(
                Payment.provider_payment_id == payment_intent_id
            )
        )

        payment = result.scalar_one_or_none()

        if payment:

            payment.status = "failed"

            payment.updated_at = (
                now_utc().isoformat()
            )

            await db.commit()

    elif event_type == "payment_intent.canceled":

        payment_intent = event["data"]["object"]

        payment_intent_id = payment_intent["id"]

        result = await db.execute(
            select(Payment).where(
                Payment.provider_payment_id == payment_intent_id
            )
        )

        payment = result.scalar_one_or_none()

        if payment:

            payment.status = "canceled"

            payment.updated_at = (
                now_utc().isoformat()
            )

            await db.commit()

    return {
        "received": True
    }


@api_router.get("/admin/dashboard")
async def admin_dashboard(
    admin: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    products = await db.scalar(
        select(func.count()).select_from(Product)
    )

    categories = await db.scalar(
        select(func.count()).select_from(Category)
    )

    orders = await db.scalar(
        select(func.count()).select_from(Order)
    )

    newsletter = await db.scalar(
        select(func.count()).select_from(Newsletter)
    )

    messages = await db.scalar(
        select(func.count()).select_from(ContactMessage)
    )

    latest_orders_result = await db.execute(
        select(Order)
        .order_by(Order.created_at.desc())
        .limit(5)
    )

    latest_orders = latest_orders_result.scalars().all()

    return {
        "products": products or 0,
        "orders": orders or 0,
        "categories": categories or 0,
        "newsletter": newsletter or 0,
        "messages": messages or 0,
        "latest_orders": latest_orders
    }


@api_router.get("/admin/products")
async def admin_products(
    admin: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Product)
        .order_by(Product.name)
    )

    return result.scalars().all()


@api_router.post("/admin/products")
async def create_product(
    product: ProductCreate,
    admin: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    existing = await db.execute(
        select(Product).where(Product.id == product.id)
    )

    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=400,
            detail="Product already exists"
        )

    db_product = Product(**product.model_dump())

    db.add(db_product)

    await db.commit()

    await db.refresh(db_product)

    return db_product


@api_router.put("/admin/products/{product_id}")
async def update_product(
    product_id: str,
    data: ProductCreate,
    admin: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Product).where(Product.id == product_id)
    )

    product = result.scalar_one_or_none()

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    product.name = data.name
    product.name_ar = data.name_ar
    product.category_id = data.category_id
    product.price = data.price
    product.old_price = data.old_price
    product.image = data.image
    product.description = data.description
    product.description_ar = data.description_ar
    product.best_seller = data.best_seller
    product.new_arrival = data.new_arrival
    product.in_stock = data.in_stock
    product.rating = data.rating
    product.review_count = data.review_count

    await db.commit()
    await db.refresh(product)

    return product


@api_router.delete("/admin/products/{product_id}")
async def delete_product(
    product_id: str,
    admin: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Product).where(Product.id == product_id)
    )

    product = result.scalar_one_or_none()

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    await db.delete(product)
    await db.commit()

    return {
        "success": True
    }

@api_router.get("/admin/categories")
async def admin_categories(
    admin: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Category).order_by(Category.id)
    )

    return result.scalars().all()

@api_router.post("/admin/categories")
async def create_category(
    data: CategoryCreate,
    admin: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):

    category = Category(
        name=data.name,
        image=data.image
    )

    db.add(category)

    await db.commit()
    await db.refresh(category)

    return category

@api_router.put("/admin/categories/{category_id}")
async def update_category(
    category_id: int,
    data: CategoryCreate,
    admin: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):

    result = await db.execute(
        select(Category).where(
            Category.id == category_id
        )
    )

    category = result.scalar_one_or_none()

    if not category:
        raise HTTPException(
            status_code=404,
            detail="Category not found"
        )

    category.name = data.name
    category.image = data.image

    await db.commit()
    await db.refresh(category)

    return category

@api_router.delete("/admin/categories/{category_id}")
async def delete_category(
    category_id: int,
    admin: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):

    result = await db.execute(
        select(Category).where(
            Category.id == category_id
        )
    )

    category = result.scalar_one_or_none()

    if not category:
        raise HTTPException(
            status_code=404,
            detail="Category not found"
        )

    await db.delete(category)
    await db.commit()

    return {
        "ok": True
    }

# Admin Orders

@api_router.get("/admin/orders")
async def admin_orders(
    admin: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Order)
        .order_by(Order.created_at.desc())
    )

    return result.scalars().all()


@api_router.get("/admin/orders/{order_id}")
async def admin_order(
    order_id: str,
    admin: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Order)
        .where(Order.order_id == order_id)
    )

    order = result.scalar_one_or_none()

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found"
        )

    return order


@api_router.put("/admin/orders/{order_id}")
async def update_order_status(
    order_id: str,
    body: UpdateOrderStatus,
    admin: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Order)
        .where(Order.order_id == order_id)
    )

    order = result.scalar_one_or_none()

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found"
        )

    order.status = body.status

    await db.commit()
    await db.refresh(order)

    return order


# Admin Coupons


@api_router.get(
    "/admin/coupons",
    response_model=List[CouponResponse]
)
async def admin_get_coupons(
    admin: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Coupon)
        .order_by(Coupon.id.desc())
    )

    return result.scalars().all()


@api_router.post(
    "/admin/coupons",
    response_model=CouponResponse
)
async def admin_create_coupon(
    data: CouponCreate,
    admin: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    code = data.code.strip().upper()

    # Check duplicate code
    result = await db.execute(
        select(Coupon).where(
            Coupon.code == code
        )
    )

    existing = result.scalar_one_or_none()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Coupon code already exists"
        )

    # Validate percentage
    if data.discount_type == "percent" and data.value > 100:
        raise HTTPException(
            status_code=400,
            detail="Percentage discount cannot exceed 100"
        )

    now = datetime.now(timezone.utc).isoformat()

    coupon = Coupon(
        code=code,
        discount_type=data.discount_type,
        value=data.value,
        description=data.description,
        min_order_amount=data.min_order_amount,
        max_discount=data.max_discount,
        is_active=data.is_active,
        usage_limit=data.usage_limit,
        used_count=0,
        created_at=now,
        updated_at=now
    )

    db.add(coupon)

    await db.commit()
    await db.refresh(coupon)

    return coupon


@api_router.patch(
    "/admin/coupons/{coupon_id}",
    response_model=CouponResponse
)
async def admin_update_coupon(
    coupon_id: int,
    data: CouponUpdate,
    admin: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Coupon).where(
            Coupon.id == coupon_id
        )
    )

    coupon = result.scalar_one_or_none()

    if not coupon:
        raise HTTPException(
            status_code=404,
            detail="Coupon not found"
        )

    update_data = data.model_dump(
        exclude_unset=True
    )

    if "code" in update_data:
        update_data["code"] = (
            update_data["code"]
            .strip()
            .upper()
        )

        duplicate_result = await db.execute(
            select(Coupon).where(
                Coupon.code == update_data["code"],
                Coupon.id != coupon_id
            )
        )

        duplicate = duplicate_result.scalar_one_or_none()

        if duplicate:
            raise HTTPException(
                status_code=400,
                detail="Coupon code already exists"
            )

    discount_type = update_data.get(
        "discount_type",
        coupon.discount_type
    )

    value = update_data.get(
        "value",
        coupon.value
    )

    if discount_type == "percent" and value > 100:
        raise HTTPException(
            status_code=400,
            detail="Percentage discount cannot exceed 100"
        )

    for field, value in update_data.items():
        setattr(coupon, field, value)

    coupon.updated_at = (
        datetime.now(timezone.utc).isoformat()
    )

    await db.commit()
    await db.refresh(coupon)

    return coupon


@api_router.delete(
    "/admin/coupons/{coupon_id}"
)
async def admin_delete_coupon(
    coupon_id: int,
    admin: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Coupon).where(
            Coupon.id == coupon_id
        )
    )

    coupon = result.scalar_one_or_none()

    if not coupon:
        raise HTTPException(
            status_code=404,
            detail="Coupon not found"
        )

    await db.delete(coupon)

    await db.commit()

    return {
        "success": True,
        "message": "Coupon deleted successfully"
    }

# Site Settings

@api_router.get(
    "/site-settings",
    response_model=SiteSettingsResponse
)
async def get_site_settings(
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(SiteSettings)
        .order_by(SiteSettings.id)
        .limit(1)
    )

    settings = result.scalar_one_or_none()

    if settings:
        return settings

    settings = SiteSettings(
        store_name="AllNeeds",
        description="Premium baby products, thoughtfully designed for the modern UAE family.",
        description_ar="منتجات أطفال مميزة مصممة بعناية للعائلات العصرية في الإمارات.",
        address="Dubai, United Arab Emirates",
        phone="+971 4 000 0000",
        email="hello@allneeds.ae",
        show_visa=True,
        show_mastercard=True,
        show_apple_pay=True,
        show_google_pay=True,
        copyright_text="© 2026 AllNeeds. All rights reserved."
    )

    db.add(settings)
    await db.commit()
    await db.refresh(settings)

    return settings

# Admin Site Settings

@api_router.get(
    "/admin/site-settings",
    response_model=SiteSettingsResponse
)
async def admin_get_site_settings(
    admin: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(SiteSettings)
        .order_by(SiteSettings.id)
        .limit(1)
    )

    settings = result.scalar_one_or_none()

    if settings:
        return settings

    settings = SiteSettings(
        store_name="AllNeeds",
        description="Premium baby products, thoughtfully designed for the modern UAE family.",
        description_ar="منتجات أطفال مميزة مصممة بعناية للعائلات العصرية في الإمارات.",
        address="Dubai, United Arab Emirates",
        phone="+971 4 000 0000",
        email="hello@allneeds.ae",
        show_visa=True,
        show_mastercard=True,
        show_apple_pay=True,
        show_google_pay=True,
        copyright_text="© 2026 AllNeeds. All rights reserved."
    )

    db.add(settings)
    await db.commit()
    await db.refresh(settings)

    return settings


@api_router.patch(
    "/admin/site-settings",
    response_model=SiteSettingsResponse
)
async def update_site_settings(
    data: SiteSettingsUpdate,
    admin: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(SiteSettings)
        .order_by(SiteSettings.id)
        .limit(1)
    )

    settings = result.scalar_one_or_none()

    if not settings:
        settings = SiteSettings(
            store_name="AllNeeds",
            description="Premium baby products, thoughtfully designed for the modern UAE family.",
            description_ar="منتجات أطفال مميزة مصممة بعناية للعائلات العصرية في الإمارات.",
            address="Dubai, United Arab Emirates",
            phone="+971 4 000 0000",
            email="hello@allneeds.ae",
            show_visa=True,
            show_mastercard=True,
            show_apple_pay=True,
            show_google_pay=True,
            copyright_text="© 2026 AllNeeds. All rights reserved."
        )

        db.add(settings)

    update_data = data.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(settings, field, value)

    await db.commit()

    await db.refresh(settings)

    return settings

@api_router.get("/")
async def root():
    return {"message": "AllNeeds API"}


app.include_router(api_router)

@app.on_event("startup")
async def startup():

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    await create_default_admin()
