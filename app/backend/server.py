from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from stripe_service import get_stripe_client
from decimal import Decimal

import os
import logging
import uuid
import httpx

from pathlib import Path
from datetime import datetime, timezone, timedelta
from schemas import now_utc
from passlib.context import CryptContext
from typing import Optional

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
    Payment,
    Order
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
    OrderItemCreate,
    OrderCreate,
    PaymentCreate
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

# ---------------- Catalog ----------------
CATEGORIES = [
    {"slug": "swimming", "en": "Baby Swimming", "ar": "سباحة الأطفال", "image": "https://images.unsplash.com/photo-1761523763930-81932b99b459?crop=entropy&cs=srgb&fm=jpg&q=85&w=940"},
    {"slug": "feeding", "en": "Feeding", "ar": "التغذية", "image": "https://images.pexels.com/photos/20387764/pexels-photo-20387764.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"},
    {"slug": "travel", "en": "Travel", "ar": "السفر", "image": "https://images.unsplash.com/photo-1636384919179-d936e55c5cca?crop=entropy&cs=srgb&fm=jpg&q=85&w=940"},
    {"slug": "toys", "en": "Toys", "ar": "ألعاب", "image": "https://images.unsplash.com/photo-1600987608520-29713f8cc23e?crop=entropy&cs=srgb&fm=jpg&q=85&w=940"},
    {"slug": "safety", "en": "Safety", "ar": "السلامة", "image": "https://images.pexels.com/photos/7491109/pexels-photo-7491109.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"},
    {"slug": "accessories", "en": "Accessories", "ar": "إكسسوارات", "image": "https://images.pexels.com/photos/12426614/pexels-photo-12426614.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"},
]

IMG = {
    "feeding1": "https://images.pexels.com/photos/20387764/pexels-photo-20387764.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "feeding2": "https://images.pexels.com/photos/7282619/pexels-photo-7282619.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "swim1": "https://images.unsplash.com/photo-1761523763930-81932b99b459?crop=entropy&cs=srgb&fm=jpg&q=85&w=940",
    "swim2": "https://images.unsplash.com/photo-1599376871063-1b999e42afde?crop=entropy&cs=srgb&fm=jpg&q=85&w=940",
    "travel1": "https://images.unsplash.com/photo-1559135141-2bea6465fccf?crop=entropy&cs=srgb&fm=jpg&q=85&w=940",
    "travel2": "https://images.unsplash.com/photo-1636384919179-d936e55c5cca?crop=entropy&cs=srgb&fm=jpg&q=85&w=940",
    "travel3": "https://images.unsplash.com/photo-1714392512700-4cab9e51710b?crop=entropy&cs=srgb&fm=jpg&q=85&w=940",
    "toy1": "https://images.unsplash.com/photo-1622403718261-bd0e7dd01216?crop=entropy&cs=srgb&fm=jpg&q=85&w=940",
    "toy2": "https://images.unsplash.com/photo-1618842676088-c4d48a6a7c9d?crop=entropy&cs=srgb&fm=jpg&q=85&w=940",
    "toy3": "https://images.unsplash.com/photo-1600987608520-29713f8cc23e?crop=entropy&cs=srgb&fm=jpg&q=85&w=940",
    "toy4": "https://images.pexels.com/photos/6692935/pexels-photo-6692935.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "safety1": "https://images.pexels.com/photos/7491109/pexels-photo-7491109.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "safety2": "https://images.pexels.com/photos/6223621/pexels-photo-6223621.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "acc1": "https://images.pexels.com/photos/12426614/pexels-photo-12426614.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "acc2": "https://images.pexels.com/photos/7691342/pexels-photo-7691342.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
}


def p(pid, en, ar, cat, price, old, img, desc_en, desc_ar, best=False, new=False, rating=4.7, rc=42):
    return {
        "id": pid, "name": en, "name_ar": ar, "category": cat, "price": price,
        "old_price": old, "image": img, "description": desc_en, "description_ar": desc_ar,
        "best_seller": best, "new_arrival": new, "rating": rating, "review_count": rc,
        "in_stock": True,
    }


SEED_PRODUCTS = [
    p("swim-01", "Toddler Swim Float Ring", "طوق سباحة للأطفال", "swimming", 89, 120, IMG["swim1"], "Ergonomic float ring with UPF sun canopy for safe pool time.", "طوق عائم مريح مع مظلة واقية من الشمس لأوقات سباحة آمنة.", best=True, rating=4.8, rc=64),
    p("swim-02", "Baby Neck Float Premium", "عوامة رقبة للأطفال", "swimming", 65, None, IMG["swim2"], "Adjustable neck float for gentle water exercise.", "عوامة رقبة قابلة للتعديل لتمارين مائية لطيفة.", new=True, rating=4.5, rc=28),
    p("swim-03", "Swim Diaper Set (3 Pack)", "حفاضات سباحة (3 قطع)", "swimming", 55, 70, IMG["swim1"], "Reusable swim diapers with soft, secure fit.", "حفاضات سباحة قابلة لإعادة الاستخدام بمقاس مريح.", rating=4.6, rc=37),
    p("feed-01", "Anti-Colic Bottle Set", "طقم زجاجات مضاد للمغص", "feeding", 129, 159, IMG["feeding1"], "3-piece anti-colic bottles with natural-flow nipples.", "3 زجاجات مضادة للمغص بحلمات تدفق طبيعي.", best=True, rating=4.9, rc=112),
    p("feed-02", "Silicone Feeding Set", "طقم تغذية سيليكون", "feeding", 95, None, IMG["feeding2"], "Food-grade silicone bowl, spoon and bib set.", "طقم وعاء وملعقة ومريلة من السيليكون الغذائي.", new=True, rating=4.7, rc=54),
    p("feed-03", "Insulated Bottle Warmer", "سخان زجاجات معزول", "feeding", 149, 189, IMG["feeding1"], "Portable warmer keeps milk at the perfect temperature.", "سخان محمول يحافظ على الحليب بدرجة الحرارة المثالية.", rating=4.6, rc=41),
    p("feed-04", "Sippy Cup Duo", "أكواب شرب للأطفال", "feeding", 45, 60, IMG["feeding2"], "Spill-proof training cups with soft spout.", "أكواب تدريب مانعة للانسكاب بفوهة ناعمة.", rating=4.4, rc=33),
    p("travel-01", "Lightweight Travel Stroller", "عربة سفر خفيفة", "travel", 899, 1099, IMG["travel1"], "One-hand fold, cabin-approved lightweight stroller.", "عربة خفيفة قابلة للطي بيد واحدة ومعتمدة للطائرة.", best=True, rating=4.9, rc=98),
    p("travel-02", "Convertible Car Seat", "مقعد سيارة قابل للتحويل", "travel", 749, 899, IMG["travel2"], "Rear and forward facing car seat with side protection.", "مقعد سيارة قابل للتحويل مع حماية جانبية.", rating=4.8, rc=76),
    p("travel-03", "Premium Diaper Backpack", "حقيبة ظهر للحفاضات", "travel", 199, 249, IMG["travel3"], "Insulated pockets, changing mat and stroller straps.", "جيوب معزولة وحصيرة تغيير وأحزمة للعربة.", new=True, rating=4.7, rc=58),
    p("travel-04", "Baby Travel Cot", "سرير سفر للأطفال", "travel", 429, None, IMG["travel1"], "Fold-flat travel cot with breathable mesh sides.", "سرير سفر قابل للطي بجوانب شبكية قابلة للتنفس.", rating=4.5, rc=29),
    p("toy-01", "Wooden Stacking Rings", "حلقات خشبية للتكديس", "toys", 79, 99, IMG["toy1"], "Non-toxic wooden stacking toy for motor skills.", "لعبة تكديس خشبية غير سامة لتنمية المهارات الحركية.", best=True, rating=4.8, rc=87),
    p("toy-02", "Soft Activity Play Gym", "صالة ألعاب ناعمة", "toys", 159, 199, IMG["toy2"], "Padded play gym with hanging sensory toys.", "صالة لعب مبطنة مع ألعاب حسية معلقة.", rating=4.7, rc=63),
    p("toy-03", "Educational Wooden Train", "قطار خشبي تعليمي", "toys", 119, None, IMG["toy3"], "Colourful wooden train set for imaginative play.", "مجموعة قطار خشبي ملونة للعب الإبداعي.", new=True, rating=4.6, rc=44),
    p("toy-04", "Sensory Play Kitchen", "مطبخ حسي للعب", "toys", 289, 349, IMG["toy4"], "Interactive play kitchen that grows with your toddler.", "مطبخ تفاعلي ينمو مع طفلك.", rating=4.8, rc=51),
    p("safety-01", "Extra-Wide Safety Gate", "بوابة أمان عريضة", "safety", 189, 229, IMG["safety1"], "Pressure-fit safety gate for stairs and doorways.", "بوابة أمان بضغط للسلالم والمداخل.", best=True, rating=4.7, rc=72),
    p("safety-02", "Smart Baby Monitor", "جهاز مراقبة ذكي", "safety", 349, 419, IMG["safety2"], "HD video monitor with night vision and app control.", "جهاز مراقبة بفيديو عالي الدقة ورؤية ليلية وتحكم عبر التطبيق.", new=True, rating=4.8, rc=89),
    p("safety-03", "Corner Guard Set", "واقيات زوايا", "safety", 39, 55, IMG["safety1"], "Soft corner protectors for furniture edges.", "واقيات زوايا ناعمة لحواف الأثاث.", rating=4.4, rc=26),
    p("safety-04", "Cabinet Lock Kit", "طقم أقفال خزائن", "safety", 49, None, IMG["safety2"], "Adhesive child-proof locks for cabinets and drawers.", "أقفال لاصقة آمنة للأطفال للخزائن والأدراج.", rating=4.5, rc=31),
    p("acc-01", "Knitted Baby Booties", "أحذية أطفال محبوكة", "accessories", 45, 59, IMG["acc1"], "Hand-knitted soft booties in premium cotton.", "أحذية ناعمة محبوكة يدويًا من القطن الفاخر.", best=True, rating=4.6, rc=48),
    p("acc-02", "Organic Cotton Blanket", "بطانية قطن عضوي", "accessories", 89, 109, IMG["acc2"], "GOTS-certified organic muslin swaddle blanket.", "بطانية قماط من الموسلين العضوي معتمدة.", new=True, rating=4.9, rc=67),
    p("acc-03", "Silicone Teething Set", "طقم تسنين سيليكون", "accessories", 35, 45, IMG["acc1"], "BPA-free teething toys in soothing shapes.", "ألعاب تسنين خالية من BPA بأشكال مهدئة.", rating=4.5, rc=39),
    p("acc-04", "Baby Grooming Kit", "طقم عناية بالطفل", "accessories", 79, 95, IMG["acc2"], "Complete nail, brush and care kit for newborns.", "طقم كامل للأظافر والفرشاة والعناية بالمواليد.", rating=4.6, rc=34),
]

COUPONS = {
    "ALLNEEDS10": {"type": "percent", "value": 10, "desc": "10% off your order"},
    "BABY20": {"type": "percent", "value": 20, "desc": "20% off your order"},
    "WELCOME50": {"type": "fixed", "value": 50, "desc": "AED 50 off orders over AED 300"},
}





async def seed_products(db: AsyncSession):

    result = await db.execute(
        select(func.count(Product.id))
    )

    count = result.scalar()

    if count == 0:

        for item in SEED_PRODUCTS:
            product = Product(**item)
            db.add(product)

        await db.commit()

        logger.info(f"Seeded {len(SEED_PRODUCTS)} products")


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
async def validate_coupon(data: CouponCheck):
    code = data.code.strip().upper()
    if code in COUPONS:
        return {"valid": True, "code": code, **COUPONS[code]}
    raise HTTPException(status_code=404, detail="Invalid coupon code")


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

    if order.coupon:

        coupon_code = order.coupon.strip().upper()

        coupon = COUPONS.get(coupon_code)

        if coupon:

            if coupon["type"] == "percent":

                discount = subtotal * (
                    coupon["value"] / 100
                )

            elif coupon["type"] == "fixed":

                if coupon_code == "WELCOME50":

                    if subtotal >= 300:
                        discount = coupon["value"]
                    else:
                        discount = 0.0

                else:
                    discount = coupon["value"]

            discount = min(
                discount,
                subtotal
            )

        else:

            raise HTTPException(
                status_code=400,
                detail="Invalid coupon code"
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

        # IMPORTANT:
        # The order is NOT paid yet.
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

            # These values come from PostgreSQL
            # and NOT from the frontend.
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

@api_router.get("/admin/dashboard")
async def admin_dashboard(
    admin: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    products = await db.scalar(
        select(func.count()).select_from(Product)
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
        "categories": 6,
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

@api_router.get("/")
async def root():
    return {"message": "AllNeeds API"}


app.include_router(api_router)

@app.on_event("startup")
async def startup():

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    await create_default_admin()
    await seed_products(AsyncSession(engine))   