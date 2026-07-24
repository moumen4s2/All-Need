import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { api } from "@/lib/api";
import { Package, LogIn } from "lucide-react";

export const Account = () => {
  const { t, user, login, logout, money } = useApp();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (user) api.get("/orders").then((r) => setOrders(r.data)).catch(() => {});
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center min-h-[60vh]" data-testid="account-login">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-5"><LogIn className="w-7 h-7 text-slate-500" strokeWidth={1.5} /></div>
        <h1 className="text-3xl font-bold mb-3">{t.account.title}</h1>
        <p className="text-slate-500 mb-8">{t.checkout.loginNote}</p>
        <button onClick={login} className="bg-slate-900 text-white rounded-full px-8 py-3.5 font-semibold hover:bg-slate-800 transition-colors" data-testid="account-login-btn">{t.header.signin}</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 min-h-[60vh]" data-testid="account-page">
      <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
        <div className="flex items-center gap-4">
          {user.picture && <img src={user.picture} alt="" className="w-14 h-14 rounded-full object-cover" />}
          <div><h1 className="text-2xl font-bold">{user.name}</h1><p className="text-sm text-slate-500">{user.email}</p></div>
        </div>
        <button onClick={logout} className="bg-slate-100 rounded-full px-5 py-2.5 text-sm font-semibold hover:bg-slate-200 transition-colors" data-testid="account-signout">{t.account.signout}</button>
      </div>

      <h2 className="font-display font-semibold text-xl mb-5">{t.account.orders}</h2>
      {orders.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-2xl">
          <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-slate-500">{t.account.noOrders}</p>
          <Link to="/shop" className="inline-block mt-4 bg-slate-900 text-white rounded-full px-6 py-2.5 text-sm font-semibold">{t.cart.start}</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o.order_id} className="bg-white rounded-2xl p-5 card-shadow" data-testid={`order-${o.order_id}`}>
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <div><span className="text-xs text-slate-500">#{o.order_id}</span><p className="font-medium">{o.tracking_number}</p></div>
                <span className="overline text-[10px] bg-[var(--sand)] px-3 py-1.5 rounded-full capitalize">{o.status}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex -space-x-3">{o.items.slice(0, 4).map((i, idx) => <img key={idx} src={i.image} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-white" />)}</div>
                <span className="font-semibold">{money(o.total)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
