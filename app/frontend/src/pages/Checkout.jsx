import React, { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { CheckCircle2, Copy } from "lucide-react";

const EMIRATES = ["Abu Dhabi", "Dubai", "Sharjah", "Ajman", "Umm Al Quwain", "Ras Al Khaimah", "Fujairah"];

export const Checkout = () => {
  const { t, cart, cartSubtotal, money, clearCart, user, productName } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const { discount = 0, coupon = "", shipping: shipFromCart } = location.state || {};
  const shipping = shipFromCart ?? (cartSubtotal > 300 || cartSubtotal === 0 ? 0 : 25);
  const total = Math.max(0, cartSubtotal - discount) + shipping;

  const [form, setForm] = useState({
    customer_name: user?.name || "", email: user?.email || "", phone: "",
    address: "", city: "", emirate: "Dubai",
  });
  const [placed, setPlaced] = useState(null);
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const placeOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const items = cart.map((i) => ({ product_id: i.id, name: i.name, price: i.price, quantity: i.quantity, image: i.image }));
      const res = await api.post("/orders", { items, subtotal: cartSubtotal, discount, shipping, total, coupon: coupon || null, ...form });
      setPlaced(res.data);
      clearCart();
    } catch { toast.error("Something went wrong. Please try again."); }
    setLoading(false);
  };

  if (placed) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center min-h-[60vh]" data-testid="order-success">
        <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-6"><CheckCircle2 className="w-10 h-10 text-emerald-500" strokeWidth={1.5} /></div>
        <h1 className="text-3xl font-bold mb-2">{t.checkout.success}</h1>
        <p className="text-slate-500 mb-8">{t.checkout.successSub}</p>
        <div className="bg-slate-50 rounded-2xl p-6 mb-8">
          <p className="text-sm text-slate-500 mb-1">{t.checkout.tracking}</p>
          <div className="flex items-center justify-center gap-2">
            <span className="font-display font-bold text-xl" data-testid="tracking-number">{placed.tracking_number}</span>
            <button onClick={() => { navigator.clipboard.writeText(placed.tracking_number); toast.success("Copied!"); }} className="text-slate-400 hover:text-slate-900"><Copy className="w-4 h-4" /></button>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/track" className="bg-slate-900 text-white rounded-full px-6 py-3 font-semibold hover:bg-slate-800 transition-colors">{t.header.track}</Link>
          <Link to="/shop" className="bg-slate-100 rounded-full px-6 py-3 font-semibold hover:bg-slate-200 transition-colors">{t.checkout.continue}</Link>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return <div className="max-w-xl mx-auto px-4 py-24 text-center min-h-[50vh]"><p className="text-slate-500 mb-6">{t.cart.empty}</p><Link to="/shop" className="bg-slate-900 text-white rounded-full px-6 py-3 font-semibold">{t.cart.start}</Link></div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16" data-testid="checkout-page">
      <h1 className="text-4xl font-bold mb-10">{t.checkout.title}</h1>
      <div className="grid lg:grid-cols-[1fr_400px] gap-10">
        <form onSubmit={placeOrder} className="space-y-8" data-testid="checkout-form">
          {!user && <p className="text-sm bg-[var(--sky-soft)] rounded-xl px-4 py-3">{t.checkout.loginNote}</p>}
          <div>
            <h3 className="font-display font-semibold text-lg mb-4">{t.checkout.contact}</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label={t.checkout.name} value={form.customer_name} onChange={set("customer_name")} testid="co-name" required />
              <Input label={t.checkout.email} type="email" value={form.email} onChange={set("email")} testid="co-email" required />
              <Input label={t.checkout.phone} value={form.phone} onChange={set("phone")} testid="co-phone" required />
            </div>
          </div>
          <div>
            <h3 className="font-display font-semibold text-lg mb-4">{t.checkout.shipping}</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2"><Input label={t.checkout.address} value={form.address} onChange={set("address")} testid="co-address" required /></div>
              <Input label={t.checkout.city} value={form.city} onChange={set("city")} testid="co-city" required />
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">{t.checkout.emirate}</label>
                <select value={form.emirate} onChange={set("emirate")} className="w-full bg-slate-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-900" data-testid="co-emirate">
                  {EMIRATES.map((e) => <option key={e}>{e}</option>)}
                </select>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap text-sm text-slate-500">
            <span>{t.footer.pay}:</span><span className="font-semibold text-slate-800">VISA</span><span className="font-semibold text-slate-800">Mastercard</span><span className="font-semibold text-slate-800"> Pay</span><span className="font-semibold text-slate-800">G Pay</span>
          </div>
          <button type="submit" disabled={loading} className="w-full lg:w-auto bg-slate-900 text-white rounded-full px-10 py-4 font-semibold hover:bg-slate-800 transition-colors disabled:opacity-60" data-testid="place-order-btn">{loading ? t.common.loading : t.checkout.place}</button>
        </form>

        <div className="bg-slate-50 rounded-2xl p-6 h-fit lg:sticky lg:top-24">
          <h3 className="font-display font-semibold text-lg mb-5">{t.checkout.summary}</h3>
          <div className="space-y-4 mb-5 max-h-64 overflow-y-auto">
            {cart.map((i) => (
              <div key={i.id} className="flex gap-3 items-center">
                <img src={i.image} alt="" className="w-14 h-16 rounded-lg object-cover" />
                <div className="flex-1 min-w-0"><p className="text-sm font-medium line-clamp-1">{productName(i)}</p><p className="text-xs text-slate-500">x{i.quantity}</p></div>
                <span className="text-sm font-semibold">{money(i.price * i.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="space-y-2 text-sm border-t pt-4">
            <div className="flex justify-between"><span className="text-slate-500">{t.cart.subtotal}</span><span>{money(cartSubtotal)}</span></div>
            {discount > 0 && <div className="flex justify-between text-emerald-600"><span>{t.cart.discount}</span><span>-{money(discount)}</span></div>}
            <div className="flex justify-between"><span className="text-slate-500">{t.cart.shipping}</span><span>{shipping === 0 ? t.cart.free : money(shipping)}</span></div>
            <div className="flex justify-between font-display font-bold text-lg pt-2 border-t"><span>{t.cart.total}</span><span data-testid="checkout-total">{money(total)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Input = ({ label, testid, ...props }) => (
  <div>
    <label className="text-sm font-medium text-slate-700 mb-1.5 block">{label}</label>
    <input {...props} data-testid={testid} className="w-full bg-slate-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-900" />
  </div>
);
