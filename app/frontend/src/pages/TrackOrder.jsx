import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { api } from "@/lib/api";
import { Package, Truck, CheckCircle2, Circle } from "lucide-react";

export const TrackOrder = () => {
  const { t, money } = useApp();
  const [num, setNum] = useState("");
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");

  const track = async (e) => {
    e.preventDefault();
    setError(""); setOrder(null);
    try { const res = await api.get(`/orders/track/${num}`); setOrder(res.data); }
    catch { setError(t.track.notFound); }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 min-h-[60vh]" data-testid="track-page">
      <div className="text-center mb-10">
        <div className="w-16 h-16 rounded-full bg-[var(--sky-soft)] flex items-center justify-center mx-auto mb-4"><Truck className="w-7 h-7 text-slate-800" strokeWidth={1.5} /></div>
        <h1 className="text-4xl font-bold">{t.track.title}</h1>
      </div>

      <form onSubmit={track} className="flex gap-2 mb-8">
        <input value={num} onChange={(e) => setNum(e.target.value)} placeholder={t.track.placeholder} className="flex-1 bg-slate-100 rounded-full px-5 py-3.5 outline-none focus:ring-2 focus:ring-slate-900" data-testid="track-input" required />
        <button type="submit" className="bg-slate-900 text-white rounded-full px-7 py-3.5 font-semibold hover:bg-slate-800 transition-colors" data-testid="track-submit">{t.track.btn}</button>
      </form>

      {error && <p className="text-center text-rose-500" data-testid="track-error">{error}</p>}

      {order && (
        <div className="bg-white rounded-2xl p-6 card-shadow" data-testid="track-result">
          <div className="flex items-center justify-between mb-6 pb-6 border-b">
            <div><p className="text-xs text-slate-500">{t.checkout.tracking}</p><p className="font-display font-bold">{order.tracking_number}</p></div>
            <span className="overline text-[10px] bg-[var(--sand)] px-3 py-1.5 rounded-full capitalize">{order.status}</span>
          </div>
          <div className="space-y-5">
            {order.steps.map((s, i) => (
              <div key={i} className="flex items-center gap-4">
                {s.done ? <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" /> : <Circle className="w-6 h-6 text-slate-300 shrink-0" />}
                <span className={`font-medium ${s.done ? "text-slate-900" : "text-slate-400"}`}>{s.label}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-6 border-t">
            <p className="text-xs text-slate-500 mb-3">{t.track.items}</p>
            {order.items.map((i, idx) => (
              <div key={idx} className="flex justify-between text-sm py-1"><span>{i.name} x{i.quantity}</span><span className="font-medium">{money(i.price * i.quantity)}</span></div>
            ))}
            <div className="flex justify-between font-semibold pt-3 mt-2 border-t"><span>{t.cart.total}</span><span>{money(order.total)}</span></div>
          </div>
        </div>
      )}
    </div>
  );
};
