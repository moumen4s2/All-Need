import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";

export const CartDrawer = () => {
  const { cartOpen, setCartOpen, cart, updateQty, removeFromCart, cartSubtotal, money, productName, t, dir } = useApp();
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [appliedCode, setAppliedCode] = useState("");
  const navigate = useNavigate();

  const applyCoupon = async () => {
    try {
      const res = await api.post("/coupons/validate", { code: coupon });
      const d = res.data.type === "percent" ? cartSubtotal * res.data.value / 100 : res.data.value;
      setDiscount(d); setAppliedCode(res.data.code);
      toast.success(res.data.desc);
    } catch { toast.error("Invalid coupon code"); setDiscount(0); setAppliedCode(""); }
  };

  const shipping = cartSubtotal > 300 || cartSubtotal === 0 ? 0 : 25;
  const total = Math.max(0, cartSubtotal - discount) + shipping;

  const goCheckout = () => {
    setCartOpen(false);
    navigate("/checkout", { state: { discount, coupon: appliedCode, shipping } });
  };

  return (
    <Sheet open={cartOpen} onOpenChange={setCartOpen}>
      <SheetContent side={dir === "rtl" ? "left" : "right"} className="w-full sm:max-w-md flex flex-col p-0" data-testid="cart-drawer">
        <SheetHeader className="p-6 pb-4 border-b">
          <SheetTitle className="font-display text-2xl text-start">{t.cart.title}</SheetTitle>
        </SheetHeader>

        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center"><ShoppingBag className="w-8 h-8 text-slate-400" strokeWidth={1.5} /></div>
            <div>
              <p className="font-display text-lg font-medium">{t.cart.empty}</p>
              <p className="text-sm text-slate-500 mt-1">{t.cart.emptySub}</p>
            </div>
            <button onClick={() => { setCartOpen(false); navigate("/shop"); }} className="bg-slate-900 text-white rounded-full px-6 py-3 text-sm font-semibold hover:bg-slate-800 transition-colors">{t.cart.start}</button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-4" data-testid={`cart-item-${item.id}`}>
                  <img src={item.image} alt="" className="w-20 h-24 rounded-lg object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm leading-snug line-clamp-2">{productName(item)}</h4>
                    <p className="text-sm font-semibold mt-1">{money(item.price)}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center border rounded-full">
                        <button onClick={() => updateQty(item.id, item.quantity - 1)} className="w-7 h-7 flex items-center justify-center hover:bg-slate-100 rounded-full" data-testid={`qty-minus-${item.id}`}><Minus className="w-3.5 h-3.5" /></button>
                        <span className="w-7 text-center text-sm">{item.quantity}</span>
                        <button onClick={() => updateQty(item.id, item.quantity + 1)} className="w-7 h-7 flex items-center justify-center hover:bg-slate-100 rounded-full" data-testid={`qty-plus-${item.id}`}><Plus className="w-3.5 h-3.5" /></button>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="text-slate-400 hover:text-rose-500 transition-colors" data-testid={`remove-${item.id}`}><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t p-6 space-y-4">
              <div className="flex gap-2">
                <input value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder={t.cart.coupon} className="flex-1 bg-slate-100 rounded-full px-4 py-2.5 text-sm outline-none" data-testid="coupon-input" />
                <button onClick={applyCoupon} className="bg-slate-200 rounded-full px-5 py-2.5 text-sm font-semibold hover:bg-slate-300 transition-colors" data-testid="coupon-apply">{t.cart.apply}</button>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">{t.cart.subtotal}</span><span>{money(cartSubtotal)}</span></div>
                {discount > 0 && <div className="flex justify-between text-emerald-600"><span>{t.cart.discount}</span><span>-{money(discount)}</span></div>}
                <div className="flex justify-between"><span className="text-slate-500">{t.cart.shipping}</span><span>{shipping === 0 ? t.cart.free : money(shipping)}</span></div>
                <div className="flex justify-between font-display font-semibold text-lg pt-2 border-t"><span>{t.cart.total}</span><span data-testid="cart-total">{money(total)}</span></div>
              </div>
              <button onClick={goCheckout} className="w-full bg-slate-900 text-white rounded-full py-3.5 font-semibold hover:bg-slate-800 transition-colors" data-testid="checkout-button">{t.cart.checkout}</button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};
