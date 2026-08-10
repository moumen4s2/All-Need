import React, { useEffect, useState } from "react";
import { api } from "../lib/api";
import { toast } from "sonner";
import {
    Plus,
    Pencil,
    Trash2,
    X,
    Check,
    Power,
} from "lucide-react";

const emptyForm = {
    code: "",
    discount_type: "percent",
    value: "",
    description: "",
    min_order_amount: "",
    max_discount: "",
    is_active: true,
    usage_limit: "",
};

export default function Coupons() {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showForm, setShowForm] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState(null);

    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);

    // =====================================================
    // LOAD COUPONS
    // =====================================================

    const loadCoupons = async () => {
        try {
            setLoading(true);

            const response = await api.get("/admin/coupons");

            setCoupons(response.data || []);
        } catch (error) {
            toast.error(
                error?.response?.data?.detail ||
                "Failed to load coupons"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCoupons();
    }, []);

    // =====================================================
    // FORM
    // =====================================================

    const updateField = (field, value) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const openCreate = () => {
        setEditingCoupon(null);
        setForm(emptyForm);
        setShowForm(true);
    };

    const openEdit = (coupon) => {
        setEditingCoupon(coupon);

        setForm({
            code: coupon.code || "",
            discount_type: coupon.discount_type || "percent",
            value: coupon.value ?? "",
            description: coupon.description || "",
            min_order_amount:
                coupon.min_order_amount ?? "",
            max_discount:
                coupon.max_discount ?? "",
            is_active:
                coupon.is_active ?? true,
            usage_limit:
                coupon.usage_limit ?? "",
        });

        setShowForm(true);
    };

    const closeForm = () => {
        if (saving) return;

        setShowForm(false);
        setEditingCoupon(null);
        setForm(emptyForm);
    };

    // =====================================================
    // SAVE
    // =====================================================

    const saveCoupon = async (e) => {
        e.preventDefault();

        if (!form.code.trim()) {
            toast.error("Coupon code is required");
            return;
        }

        if (
            form.value === "" ||
            Number(form.value) <= 0
        ) {
            toast.error("Discount value must be greater than 0");
            return;
        }

        if (
            form.discount_type === "percent" &&
            Number(form.value) > 100
        ) {
            toast.error(
                "Percentage discount cannot exceed 100%"
            );
            return;
        }

        try {
            setSaving(true);

            const payload = {
                code: form.code.trim().toUpperCase(),
                discount_type: form.discount_type,
                value: Number(form.value),

                description:
                    form.description.trim() || null,

                min_order_amount:
                    form.min_order_amount === ""
                        ? null
                        : Number(form.min_order_amount),

                max_discount:
                    form.max_discount === ""
                        ? null
                        : Number(form.max_discount),

                is_active: Boolean(form.is_active),

                usage_limit:
                    form.usage_limit === ""
                        ? null
                        : Number(form.usage_limit),
            };

            if (editingCoupon) {
                await api.patch(
                    `/admin/coupons/${editingCoupon.id}`,
                    payload
                );

                toast.success(
                    "Coupon updated successfully"
                );
            } else {
                await api.post(
                    "/admin/coupons",
                    payload
                );

                toast.success(
                    "Coupon created successfully"
                );
            }

            closeForm();

            await loadCoupons();

        } catch (error) {
            toast.error(
                error?.response?.data?.detail ||
                "Failed to save coupon"
            );
        } finally {
            setSaving(false);
        }
    };

    // =====================================================
    // DELETE
    // =====================================================

    const deleteCoupon = async (coupon) => {
        const confirmed = window.confirm(
            `Delete coupon "${coupon.code}"?`
        );

        if (!confirmed) return;

        try {
            await api.delete(
                `/admin/coupons/${coupon.id}`
            );

            toast.success(
                "Coupon deleted successfully"
            );

            await loadCoupons();

        } catch (error) {
            toast.error(
                error?.response?.data?.detail ||
                "Failed to delete coupon"
            );
        }
    };

    // =====================================================
    // TOGGLE ACTIVE
    // =====================================================

    const toggleActive = async (coupon) => {
        try {
            await api.patch(
                `/admin/coupons/${coupon.id}`,
                {
                    is_active: !coupon.is_active,
                }
            );

            toast.success(
                coupon.is_active
                    ? "Coupon disabled"
                    : "Coupon enabled"
            );

            await loadCoupons();

        } catch (error) {
            toast.error(
                error?.response?.data?.detail ||
                "Failed to update coupon"
            );
        }
    };

    // =====================================================
    // DISCOUNT DISPLAY
    // =====================================================

    const formatDiscount = (coupon) => {
        if (coupon.discount_type === "percent") {
            return `${coupon.value}%`;
        }

        return `AED ${Number(coupon.value).toFixed(2)}`;
    };

    // =====================================================
    // RENDER
    // =====================================================

    return (
        <div className="space-y-8">

            {/* HEADER */}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                <div>
                    <h1 className="text-3xl font-bold text-slate-900">
                        Coupons
                    </h1>

                    <p className="text-slate-500 mt-1">
                        Manage discount coupons for your store.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={openCreate}
                    className="inline-flex items-center justify-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-xl hover:bg-slate-800 transition"
                >
                    <Plus className="w-5 h-5" />
                    Add Coupon
                </button>

            </div>

            {/* TABLE */}

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

                {loading ? (

                    <div className="p-10 text-center text-slate-500">
                        Loading coupons...
                    </div>

                ) : coupons.length === 0 ? (

                    <div className="p-10 text-center">

                        <p className="text-slate-500 mb-4">
                            No coupons created yet.
                        </p>

                        <button
                            type="button"
                            onClick={openCreate}
                            className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg"
                        >
                            <Plus className="w-4 h-4" />
                            Create your first coupon
                        </button>

                    </div>

                ) : (

                    <div className="overflow-x-auto">

                        <table className="w-full">

                            <thead className="bg-slate-50 border-b border-slate-200">

                                <tr>

                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">
                                        Code
                                    </th>

                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">
                                        Discount
                                    </th>

                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">
                                        Min Order
                                    </th>

                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">
                                        Usage
                                    </th>

                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">
                                        Status
                                    </th>

                                    <th className="text-right px-6 py-4 text-sm font-semibold text-slate-700">
                                        Actions
                                    </th>

                                </tr>

                            </thead>

                            <tbody className="divide-y divide-slate-100">

                                {coupons.map((coupon) => (

                                    <tr
                                        key={coupon.id}
                                        className="hover:bg-slate-50"
                                    >

                                        {/* CODE */}

                                        <td className="px-6 py-5">

                                            <div className="font-bold text-slate-900">
                                                {coupon.code}
                                            </div>

                                            {coupon.description && (
                                                <div className="text-sm text-slate-500 mt-1">
                                                    {coupon.description}
                                                </div>
                                            )}

                                        </td>

                                        {/* DISCOUNT */}

                                        <td className="px-6 py-5">

                                            <span className="font-semibold text-slate-900">
                                                {formatDiscount(coupon)}
                                            </span>

                                            {coupon.max_discount !== null &&
                                                coupon.max_discount !== undefined && (
                                                    <div className="text-xs text-slate-500 mt-1">
                                                        Max: AED{" "}
                                                        {Number(
                                                            coupon.max_discount
                                                        ).toFixed(2)}
                                                    </div>
                                                )}

                                        </td>

                                        {/* MIN ORDER */}

                                        <td className="px-6 py-5 text-slate-600">

                                            {coupon.min_order_amount !== null &&
                                            coupon.min_order_amount !== undefined
                                                ? `AED ${Number(
                                                    coupon.min_order_amount
                                                ).toFixed(2)}`
                                                : "No minimum"}

                                        </td>

                                        {/* USAGE */}

                                        <td className="px-6 py-5 text-slate-600">

                                            {coupon.used_count}

                                            {" / "}

                                            {coupon.usage_limit !== null &&
                                            coupon.usage_limit !== undefined
                                                ? coupon.usage_limit
                                                : "∞"}

                                        </td>

                                        {/* STATUS */}

                                        <td className="px-6 py-5">

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    toggleActive(coupon)
                                                }
                                                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${
                                                    coupon.is_active
                                                        ? "bg-emerald-100 text-emerald-700"
                                                        : "bg-slate-100 text-slate-500"
                                                }`}
                                            >

                                                {coupon.is_active ? (
                                                    <>
                                                        <Check className="w-3.5 h-3.5" />
                                                        Active
                                                    </>
                                                ) : (
                                                    <>
                                                        <Power className="w-3.5 h-3.5" />
                                                        Inactive
                                                    </>
                                                )}

                                            </button>

                                        </td>

                                        {/* ACTIONS */}

                                        <td className="px-6 py-5">

                                            <div className="flex justify-end gap-2">

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openEdit(coupon)
                                                    }
                                                    className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                                                    title="Edit"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        deleteCoupon(coupon)
                                                    }
                                                    className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>

                                            </div>

                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>

            {/* MODAL */}

            {showForm && (

                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

                    <div
                        className="absolute inset-0 bg-black/50"
                        onClick={closeForm}
                    />

                    <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">

                        {/* MODAL HEADER */}

                        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">

                            <div>
                                <h2 className="text-xl font-bold text-slate-900">
                                    {editingCoupon
                                        ? "Edit Coupon"
                                        : "Create Coupon"}
                                </h2>

                                <p className="text-sm text-slate-500 mt-1">
                                    Configure the discount rules.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeForm}
                                className="p-2 rounded-lg hover:bg-slate-100"
                            >
                                <X className="w-5 h-5" />
                            </button>

                        </div>

                        {/* FORM */}

                        <form
                            onSubmit={saveCoupon}
                            className="p-6 space-y-5"
                        >

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                                {/* CODE */}

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Coupon Code
                                    </label>

                                    <input
                                        value={form.code}
                                        onChange={(e) =>
                                            updateField(
                                                "code",
                                                e.target.value.toUpperCase()
                                            )
                                        }
                                        placeholder="WELCOME20"
                                        className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-slate-400"
                                        required
                                    />
                                </div>

                                {/* TYPE */}

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Discount Type
                                    </label>

                                    <select
                                        value={form.discount_type}
                                        onChange={(e) =>
                                            updateField(
                                                "discount_type",
                                                e.target.value
                                            )
                                        }
                                        className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-slate-400"
                                    >
                                        <option value="percent">
                                            Percentage
                                        </option>

                                        <option value="fixed">
                                            Fixed Amount
                                        </option>
                                    </select>
                                </div>

                                {/* VALUE */}

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Discount Value
                                    </label>

                                    <div className="relative">

                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={form.value}
                                            onChange={(e) =>
                                                updateField(
                                                    "value",
                                                    e.target.value
                                                )
                                            }
                                            placeholder={
                                                form.discount_type === "percent"
                                                    ? "20"
                                                    : "50"
                                            }
                                            className="w-full border border-slate-300 rounded-xl px-4 py-3 pr-16 outline-none focus:ring-2 focus:ring-slate-400"
                                            required
                                        />

                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500">
                                            {form.discount_type === "percent"
                                                ? "%"
                                                : "AED"}
                                        </span>

                                    </div>
                                </div>

                                {/* MINIMUM */}

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Minimum Order Amount
                                    </label>

                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={form.min_order_amount}
                                        onChange={(e) =>
                                            updateField(
                                                "min_order_amount",
                                                e.target.value
                                            )
                                        }
                                        placeholder="Optional"
                                        className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-slate-400"
                                    />
                                </div>

                                {/* MAX DISCOUNT */}

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Maximum Discount
                                    </label>

                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={form.max_discount}
                                        onChange={(e) =>
                                            updateField(
                                                "max_discount",
                                                e.target.value
                                            )
                                        }
                                        placeholder="Optional"
                                        className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-slate-400"
                                    />
                                </div>

                                {/* USAGE LIMIT */}

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Usage Limit
                                    </label>

                                    <input
                                        type="number"
                                        min="1"
                                        step="1"
                                        value={form.usage_limit}
                                        onChange={(e) =>
                                            updateField(
                                                "usage_limit",
                                                e.target.value
                                            )
                                        }
                                        placeholder="Unlimited"
                                        className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-slate-400"
                                    />
                                </div>

                            </div>

                            {/* DESCRIPTION */}

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Description
                                </label>

                                <textarea
                                    value={form.description}
                                    onChange={(e) =>
                                        updateField(
                                            "description",
                                            e.target.value
                                        )
                                    }
                                    rows={3}
                                    placeholder="Optional description..."
                                    className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-slate-400 resize-none"
                                />
                            </div>

                            {/* ACTIVE */}

                            <label className="flex items-center gap-3 cursor-pointer">

                                <input
                                    type="checkbox"
                                    checked={form.is_active}
                                    onChange={(e) =>
                                        updateField(
                                            "is_active",
                                            e.target.checked
                                        )
                                    }
                                    className="w-5 h-5"
                                />

                                <span className="text-sm font-semibold text-slate-700">
                                    Coupon is active
                                </span>

                            </label>

                            {/* BUTTONS */}

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">

                                <button
                                    type="button"
                                    onClick={closeForm}
                                    disabled={saving}
                                    className="px-5 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-5 py-3 rounded-xl bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50"
                                >
                                    {saving
                                        ? "Saving..."
                                        : editingCoupon
                                            ? "Save Changes"
                                            : "Create Coupon"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
}