import React, { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  CheckCircle2,
  Copy,
  Tag,
  X,
  Loader2,
} from "lucide-react";

const EMIRATES = [
  "Abu Dhabi",
  "Dubai",
  "Sharjah",
  "Ajman",
  "Umm Al Quwain",
  "Ras Al Khaimah",
  "Fujairah",
];

export const Checkout = () => {
  const {
    t,
    cart,
    cartSubtotal,
    money,
    clearCart,
    user,
    productName,
  } = useApp();

  const location = useLocation();

  /*
   * Shipping is only displayed here as an estimate.
   * The backend remains responsible for the final order total.
   */
  const shipping =
    location.state?.shipping ??
    (cartSubtotal > 300 || cartSubtotal === 0 ? 0 : 25);

  // =========================================================
  // COUPON STATE
  // =========================================================

  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const [discount, setDiscount] = useState(0);

  // =========================================================
  // ORDER STATE
  // =========================================================

  const [form, setForm] = useState({
    customer_name: user?.name || "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    emirate: "Dubai",
  });

  const [placed, setPlaced] = useState(null);
  const [loading, setLoading] = useState(false);

  // =========================================================
  // FORM HELPERS
  // =========================================================

  const set = (key) => (e) => {
    setForm((prev) => ({
      ...prev,
      [key]: e.target.value,
    }));
  };

  // =========================================================
  // COUPON VALIDATION
  // =========================================================

const applyCoupon = async () => {
  const code = couponInput.trim().toUpperCase();

  if (!code) {
    toast.error("Please enter a coupon code.");
    return;
  }

  try {
    setCouponLoading(true);

    const response = await api.post("/coupons/validate", {
      code,
      cart_subtotal: cartSubtotal,
    });

    const coupon = response.data;

    if (!coupon?.valid) {
      throw new Error("Invalid coupon");
    }

    setAppliedCoupon(coupon);
    setDiscount(Number(coupon.discount || 0));

    toast.success(
      `Coupon ${coupon.code} applied successfully.`
    );

  } catch (error) {
    setAppliedCoupon(null);
    setDiscount(0);

    toast.error(
      error?.response?.data?.detail ||
      "Invalid or unavailable coupon."
    );
  } finally {
    setCouponLoading(false);
  }
};

  // =========================================================
  // REMOVE COUPON
  // =========================================================

  const removeCoupon = () => {
    setCouponInput("");
    setAppliedCoupon(null);
    setDiscount(0);

    toast.success("Coupon removed.");
  };

  // =========================================================
  // DISPLAY TOTAL
  // =========================================================

  const previewTotal = Math.max(
    0,
    cartSubtotal - discount,
  ) + shipping;

  // =========================================================
  // PLACE ORDER
  // =========================================================

  const placeOrder = async (e) => {
    e.preventDefault();

    if (!cart.length) {
      toast.error("Your cart is empty.");
      return;
    }

    setLoading(true);

    try {
      /*
       * IMPORTANT:
       *
       * Do NOT send:
       *
       * - product name
       * - product price
       * - product image
       * - subtotal
       * - discount
       * - total
       * - shipping
       *
       * The backend calculates all financial values.
       */

      const items = cart.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
      }));

      const payload = {
        items,

        coupon: appliedCoupon
          ? appliedCoupon.code
          : null,

        ...form,
      };

      const response = await api.post(
        "/orders",
        payload,
      );

      /*
       * IMPORTANT:
       *
       * The backend response is the authoritative
       * calculation for:
       *
       * subtotal
       * discount
       * shipping
       * total
       */

      setPlaced(response.data);

      clearCart();

    } catch (error) {

      toast.error(
        error?.response?.data?.detail ||
        "Something went wrong. Please try again.",
      );

    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // ORDER SUCCESS
  // =========================================================

  if (placed) {
    return (
      <div
        className="max-w-xl mx-auto px-4 py-20 text-center min-h-[60vh]"
        data-testid="order-success"
      >

        <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2
            className="w-10 h-10 text-emerald-500"
            strokeWidth={1.5}
          />
        </div>

        <h1 className="text-3xl font-bold mb-2">
          {t.checkout.success}
        </h1>

        <p className="text-slate-500 mb-8">
          {t.checkout.successSub}
        </p>

        <div className="bg-slate-50 rounded-2xl p-6 mb-8">

          <p className="text-sm text-slate-500 mb-1">
            {t.checkout.tracking}
          </p>

          <div className="flex items-center justify-center gap-2">

            <span
              className="font-display font-bold text-xl"
              data-testid="tracking-number"
            >
              {placed.tracking_number}
            </span>

            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(
                  placed.tracking_number,
                );

                toast.success("Copied!");
              }}
              className="text-slate-400 hover:text-slate-900"
            >
              <Copy className="w-4 h-4" />
            </button>

          </div>

        </div>

        {/* ORDER TOTAL */}

        <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-8 text-left">

          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-500">
              Subtotal
            </span>

            <span>
              {money(placed.subtotal)}
            </span>
          </div>

          {Number(placed.discount) > 0 && (
            <div className="flex justify-between text-sm mb-2 text-emerald-600">

              <span>
                Discount
              </span>

              <span>
                -{money(placed.discount)}
              </span>

            </div>
          )}

          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-500">
              Shipping
            </span>

            <span>
              {Number(placed.shipping) === 0
                ? t.cart.free
                : money(placed.shipping)}
            </span>
          </div>

          <div className="border-t pt-3 mt-3 flex justify-between font-bold text-lg">

            <span>
              Total
            </span>

            <span>
              {money(placed.total)}
            </span>

          </div>

        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">

          <Link
            to="/track"
            className="bg-slate-900 text-white rounded-full px-6 py-3 font-semibold hover:bg-slate-800 transition-colors"
          >
            {t.header.track}
          </Link>

          <Link
            to="/shop"
            className="bg-slate-100 rounded-full px-6 py-3 font-semibold hover:bg-slate-200 transition-colors"
          >
            {t.checkout.continue}
          </Link>

        </div>

      </div>
    );
  }

  // =========================================================
  // EMPTY CART
  // =========================================================

  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center min-h-[50vh]">

        <p className="text-slate-500 mb-6">
          {t.cart.empty}
        </p>

        <Link
          to="/shop"
          className="bg-slate-900 text-white rounded-full px-6 py-3 font-semibold"
        >
          {t.cart.start}
        </Link>

      </div>
    );
  }

  // =========================================================
  // CHECKOUT
  // =========================================================

  return (
    <div
      className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16"
      data-testid="checkout-page"
    >

      <h1 className="text-4xl font-bold mb-10">
        {t.checkout.title}
      </h1>

      <div className="grid lg:grid-cols-[1fr_400px] gap-10">

        {/* ================================================= */}
        {/* LEFT SIDE */}
        {/* ================================================= */}

        <form
          onSubmit={placeOrder}
          className="space-y-8"
          data-testid="checkout-form"
        >

          {!user && (
            <p className="text-sm bg-[var(--sky-soft)] rounded-xl px-4 py-3">
              {t.checkout.loginNote}
            </p>
          )}

          {/* CONTACT */}

          <div>

            <h3 className="font-display font-semibold text-lg mb-4">
              {t.checkout.contact}
            </h3>

            <div className="grid sm:grid-cols-2 gap-4">

              <Input
                label={t.checkout.name}
                value={form.customer_name}
                onChange={set("customer_name")}
                testid="co-name"
                required
              />

              <Input
                label={t.checkout.email}
                type="email"
                value={form.email}
                onChange={set("email")}
                testid="co-email"
                required
              />

              <Input
                label={t.checkout.phone}
                value={form.phone}
                onChange={set("phone")}
                testid="co-phone"
                required
              />

            </div>

          </div>

          {/* SHIPPING */}

          <div>

            <h3 className="font-display font-semibold text-lg mb-4">
              {t.checkout.shipping}
            </h3>

            <div className="grid sm:grid-cols-2 gap-4">

              <div className="sm:col-span-2">

                <Input
                  label={t.checkout.address}
                  value={form.address}
                  onChange={set("address")}
                  testid="co-address"
                  required
                />

              </div>

              <Input
                label={t.checkout.city}
                value={form.city}
                onChange={set("city")}
                testid="co-city"
                required
              />

              <div>

                <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                  {t.checkout.emirate}
                </label>

                <select
                  value={form.emirate}
                  onChange={set("emirate")}
                  className="w-full bg-slate-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-900"
                  data-testid="co-emirate"
                >

                  {EMIRATES.map((emirate) => (
                    <option
                      key={emirate}
                      value={emirate}
                    >
                      {emirate}
                    </option>
                  ))}

                </select>

              </div>

            </div>

          </div>

          {/* ================================================= */}
          {/* COUPON */}
          {/* ================================================= */}

          <div>

            <h3 className="font-display font-semibold text-lg mb-4">
              Discount Coupon
            </h3>

            {!appliedCoupon ? (

              <div className="flex gap-2">

                <div className="relative flex-1">

                  <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                  <input
                    value={couponInput}
                    onChange={(e) =>
                      setCouponInput(
                        e.target.value.toUpperCase(),
                      )
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        applyCoupon();
                      }
                    }}
                    placeholder="Enter coupon code"
                    className="w-full bg-slate-100 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-900"
                  />

                </div>

                <button
                  type="button"
                  onClick={applyCoupon}
                  disabled={
                    couponLoading ||
                    !couponInput.trim()
                  }
                  className="px-5 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition disabled:opacity-50"
                >

                  {couponLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Apply"
                  )}

                </button>

              </div>

            ) : (

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">

                <div className="flex items-center justify-between gap-4">

                  <div className="flex items-center gap-3">

                    <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center">

                      <Tag className="w-4 h-4 text-emerald-600" />

                    </div>

                    <div>

                      <p className="font-bold text-emerald-800">
                        {appliedCoupon.code}
                      </p>

                      <p className="text-sm text-emerald-600">
                        {appliedCoupon.discount_type ===
                        "percent"
                          ? `${appliedCoupon.value}% discount`
                          : `AED ${Number(
                              appliedCoupon.value,
                            ).toFixed(2)} discount`}
                      </p>

                    </div>

                  </div>

                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="text-slate-400 hover:text-red-500"
                    title="Remove coupon"
                  >
                    <X className="w-5 h-5" />
                  </button>

                </div>

              </div>

            )}

          </div>

          {/* PAYMENT METHODS */}

          <div className="flex items-center gap-3 flex-wrap text-sm text-slate-500">

            <span>
              {t.footer.pay}:
            </span>

            <span className="font-semibold text-slate-800">
              VISA
            </span>

            <span className="font-semibold text-slate-800">
              Mastercard
            </span>

            <span className="font-semibold text-slate-800">
              Pay
            </span>

            <span className="font-semibold text-slate-800">
              G Pay
            </span>

          </div>

          {/* PLACE ORDER */}

          <button
            type="submit"
            disabled={loading}
            className="w-full lg:w-auto bg-slate-900 text-white rounded-full px-10 py-4 font-semibold hover:bg-slate-800 transition-colors disabled:opacity-60"
            data-testid="place-order-btn"
          >

            {loading
              ? t.common.loading
              : t.checkout.place}

          </button>

        </form>

        {/* ================================================= */}
        {/* ORDER SUMMARY */}
        {/* ================================================= */}

        <div className="bg-slate-50 rounded-2xl p-6 h-fit lg:sticky lg:top-24">

          <h3 className="font-display font-semibold text-lg mb-5">
            {t.checkout.summary}
          </h3>

          {/* PRODUCTS */}

          <div className="space-y-4 mb-5 max-h-64 overflow-y-auto">

            {cart.map((item) => (

              <div
                key={item.id}
                className="flex gap-3 items-center"
              >

                <img
                  src={item.image}
                  alt=""
                  className="w-14 h-16 rounded-lg object-cover"
                />

                <div className="flex-1 min-w-0">

                  <p className="text-sm font-medium line-clamp-1">
                    {productName(item)}
                  </p>

                  <p className="text-xs text-slate-500">
                    x{item.quantity}
                  </p>

                </div>

                <span className="text-sm font-semibold">
                  {money(
                    item.price *
                    item.quantity,
                  )}
                </span>

              </div>

            ))}

          </div>

          {/* TOTALS */}

          <div className="space-y-2 text-sm border-t pt-4">

            <div className="flex justify-between">

              <span className="text-slate-500">
                {t.cart.subtotal}
              </span>

              <span>
                {money(cartSubtotal)}
              </span>

            </div>

            {discount > 0 && (

              <div className="flex justify-between text-emerald-600">

                <span>
                  {t.cart.discount}
                </span>

                <span>
                  -{money(discount)}
                </span>

              </div>

            )}

            <div className="flex justify-between">

              <span className="text-slate-500">
                {t.cart.shipping}
              </span>

              <span>
                {shipping === 0
                  ? t.cart.free
                  : money(shipping)}
              </span>

            </div>

            <div className="flex justify-between font-display font-bold text-lg pt-2 border-t">

              <span>
                {t.cart.total}
              </span>

              <span data-testid="checkout-total">
                {money(previewTotal)}
              </span>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

// =========================================================
// INPUT COMPONENT
// =========================================================

const Input = ({
  label,
  testid,
  ...props
}) => (
  <div>

    <label className="text-sm font-medium text-slate-700 mb-1.5 block">
      {label}
    </label>

    <input
      {...props}
      data-testid={testid}
      className="w-full bg-slate-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-900"
    />

  </div>
);