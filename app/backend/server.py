from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import engine, Base, get_db

import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import httpx

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

logger = logging.getLogger(__name__)

# ---------------- Models ----------------
def now_utc():
    return datetime.now(timezone.utc)


class Review(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    author: str
    rating: int
    comment: str
    date: str = Field(default_factory=lambda: now_utc().isoformat())


class ReviewCreate(BaseModel):
    author: str
    rating: int
    comment: str


class Newsletter(BaseModel):
    email: EmailStr


class ContactMessage(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str


class CouponCheck(BaseModel):
    code: str


class OrderItem(BaseModel):
    product_id: str
    name: str
    price: float
    quantity: int
    image: str


class OrderCreate(BaseModel):
    items: List[OrderItem]
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


# ---------------- Auth helpers ----------------
async def get_current_user(request: Request):
    token = request.cookies.get("session_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if not token:
        return None
    session = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if not session:
        return None
    expires_at = session["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < now_utc():
        return None
    user = await db.users.find_one({"user_id": session["user_id"]}, {"_id": 0})
    return user


@api_router.post("/auth/session")
async def create_session(request: Request, response: Response):
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
    existing = await db.users.find_one({"email": email}, {"_id": 0})
    if existing:
        user_id = existing["user_id"]
        await db.users.update_one({"user_id": user_id}, {"$set": {"name": data["name"], "picture": data.get("picture", "")}})
    else:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        await db.users.insert_one({
            "user_id": user_id, "email": email, "name": data["name"],
            "picture": data.get("picture", ""), "created_at": now_utc().isoformat(),
        })
    session_token = data["session_token"]
    expires_at = now_utc() + timedelta(days=7)
    await db.user_sessions.insert_one({
        "user_id": user_id, "session_token": session_token,
        "expires_at": expires_at.isoformat(), "created_at": now_utc().isoformat(),
    })
    response.set_cookie(key="session_token", value=session_token, httponly=True,
                        secure=True, samesite="none", path="/", max_age=7 * 24 * 60 * 60)
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    return user


@api_router.get("/auth/me")
async def auth_me(user=Depends(get_current_user)):
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user


@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    token = request.cookies.get("session_token")
    if token:
        await db.user_sessions.delete_one({"session_token": token})
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


@api_router.on_event = None  # noqa


async def seed_products():
    count = await db.products.count_documents({})
    if count == 0:
        for prod in SEED_PRODUCTS:
            doc = {**prod, "reviews": []}
            await db.products.insert_one(doc)
        logger.info(f"Seeded {len(SEED_PRODUCTS)} products")


@api_router.get("/categories")
async def get_categories():
    result = []
    for c in CATEGORIES:
        cnt = await db.products.count_documents({"category": c["slug"]})
        result.append({**c, "count": cnt})
    return result


@api_router.get("/products")
async def get_products(category: Optional[str] = None, search: Optional[str] = None,
                       sort: Optional[str] = None, best_seller: Optional[bool] = None,
                       new_arrival: Optional[bool] = None, min_price: Optional[float] = None,
                       max_price: Optional[float] = None):
    query = {}
    if category:
        query["category"] = category
    if best_seller:
        query["best_seller"] = True
    if new_arrival:
        query["new_arrival"] = True
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"name_ar": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
        ]
    price_q = {}
    if min_price is not None:
        price_q["$gte"] = min_price
    if max_price is not None:
        price_q["$lte"] = max_price
    if price_q:
        query["price"] = price_q
    products = await db.products.find(query, {"_id": 0, "reviews": 0}).to_list(200)
    if sort == "price_asc":
        products.sort(key=lambda x: x["price"])
    elif sort == "price_desc":
        products.sort(key=lambda x: x["price"], reverse=True)
    elif sort == "rating":
        products.sort(key=lambda x: x["rating"], reverse=True)
    return products


@api_router.get("/products/{product_id}")
async def get_product(product_id: str):
    prod = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")
    return prod


@api_router.post("/products/{product_id}/reviews")
async def add_review(product_id: str, review: ReviewCreate):
    prod = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")
    r = Review(**review.model_dump()).model_dump()
    await db.products.update_one({"id": product_id}, {"$push": {"reviews": r}})
    reviews = prod.get("reviews", []) + [r]
    new_count = len(reviews)
    new_rating = round(sum(x["rating"] for x in reviews) / new_count, 1)
    await db.products.update_one({"id": product_id}, {"$set": {"review_count": prod["review_count"] + 1, "rating": new_rating}})
    return r


@api_router.post("/newsletter")
async def subscribe(data: Newsletter):
    await db.newsletter.update_one({"email": data.email}, {"$set": {"email": data.email, "date": now_utc().isoformat()}}, upsert=True)
    return {"ok": True, "message": "Subscribed successfully"}


@api_router.post("/contact")
async def contact(data: ContactMessage):
    doc = data.model_dump()
    doc["date"] = now_utc().isoformat()
    await db.contact_messages.insert_one(doc)
    return {"ok": True, "message": "Message received"}


@api_router.post("/coupons/validate")
async def validate_coupon(data: CouponCheck):
    code = data.code.strip().upper()
    if code in COUPONS:
        return {"valid": True, "code": code, **COUPONS[code]}
    raise HTTPException(status_code=404, detail="Invalid coupon code")


@api_router.post("/orders")
async def create_order(order: OrderCreate, user=Depends(get_current_user)):
    order_id = f"AN{uuid.uuid4().hex[:8].upper()}"
    tracking = f"ANUAE{uuid.uuid4().hex[:10].upper()}"
    doc = order.model_dump()
    doc.update({
        "order_id": order_id, "tracking_number": tracking,
        "status": "processing", "user_id": user["user_id"] if user else None,
        "created_at": now_utc().isoformat(),
        "steps": [
            {"label": "Order Placed", "done": True},
            {"label": "Processing", "done": True},
            {"label": "Shipped", "done": False},
            {"label": "Out for Delivery", "done": False},
            {"label": "Delivered", "done": False},
        ],
    })
    await db.orders.insert_one(doc)
    return {"order_id": order_id, "tracking_number": tracking, "status": "processing"}


@api_router.get("/orders")
async def my_orders(user=Depends(get_current_user)):
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    orders = await db.orders.find({"user_id": user["user_id"]}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return orders


@api_router.get("/orders/track/{tracking_number}")
async def track_order(tracking_number: str):
    order = await db.orders.find_one({"tracking_number": tracking_number.strip().upper()}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@api_router.get("/")
async def root():
    return {"message": "AllNeeds API"}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    await seed_products()
