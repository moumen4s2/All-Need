import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function AdminLayout() {
    const navigate = useNavigate();

    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAdmin();
    }, []);

    async function loadAdmin() {
        try {
            const res = await api.get("/admin/me");
            setAdmin(res.data);
        } catch {
            setAdmin(null);
            navigate("/admin/login", { replace: true });
        } finally {
            setLoading(false);
        }
    }

    async function logout() {
        try {
            await api.post("/admin/logout");
        } catch {}

        navigate("/admin/login", { replace: true });
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen text-xl">
                Loading...
            </div>
        );
    }

    if (!admin) {
        return null;
    }

    const isAdmin = admin.role === "admin";
    const isSales = admin.role === "sales";

    return (
        <div className="min-h-screen bg-slate-100 flex">

            <aside className="w-64 bg-slate-900 text-white p-6 flex flex-col">

                <h1 className="text-3xl font-bold mb-2">
                    AllNeeds
                </h1>

                <div className="mb-8 text-sm text-slate-400">
                    <div className="text-white font-semibold">
                        {admin.name}
                    </div>

                    <div className="capitalize">
                        {admin.role}
                    </div>
                </div>

                <nav className="flex flex-col gap-3">

                    <NavLink
                        to="/admin"
                        end
                        className={({ isActive }) =>
                            `px-4 py-3 rounded-lg transition-colors ${
                                isActive
                                    ? "bg-slate-700"
                                    : "hover:bg-slate-700"
                            }`
                        }
                    >
                        Dashboard
                    </NavLink>

                    <NavLink
                        to="/admin/products"
                        className={({ isActive }) =>
                            `px-4 py-3 rounded-lg transition-colors ${
                                isActive
                                    ? "bg-slate-700"
                                    : "hover:bg-slate-700"
                            }`
                        }
                    >
                        Products
                    </NavLink>

                    <NavLink
                        to="/admin/categories"
                        className={({ isActive }) =>
                            `px-4 py-3 rounded-lg transition-colors ${
                                isActive
                                    ? "bg-slate-700"
                                    : "hover:bg-slate-700"
                            }`
                        }
                    >
                        Categories
                    </NavLink>

                    <NavLink
                        to="/admin/orders"
                        className={({ isActive }) =>
                            `px-4 py-3 rounded-lg transition-colors ${
                                isActive
                                    ? "bg-slate-700"
                                    : "hover:bg-slate-700"
                            }`
                        }
                    >
                        Orders
                    </NavLink>

                    {isAdmin && (
                        <>
                            <NavLink
                                to="/admin/coupons"
                                className={({ isActive }) =>
                                    `px-4 py-3 rounded-lg transition-colors ${
                                        isActive
                                            ? "bg-slate-700"
                                            : "hover:bg-slate-700"
                                    }`
                                }
                            >
                                Coupons
                            </NavLink>

                            <NavLink
                                to="/admin/staff"
                                className={({ isActive }) =>
                                    `px-4 py-3 rounded-lg transition-colors ${
                                        isActive
                                            ? "bg-slate-700"
                                            : "hover:bg-slate-700"
                                    }`
                                }
                            >
                                Sales Staff
                            </NavLink>

                            <NavLink
                                to="/admin/settings"
                                className={({ isActive }) =>
                                    `px-4 py-3 rounded-lg transition-colors ${
                                        isActive
                                            ? "bg-slate-700"
                                            : "hover:bg-slate-700"
                                    }`
                                }
                            >
                                Settings
                            </NavLink>
                        </>
                    )}

                    <NavLink
                        to="/admin/profile"
                        className={({ isActive }) =>
                            `px-4 py-3 rounded-lg transition-colors ${
                                isActive
                                    ? "bg-slate-700"
                                    : "hover:bg-slate-700"
                            }`
                        }
                    >
                        My Profile
                    </NavLink>

                </nav>

                <button
                    onClick={logout}
                    className="mt-auto bg-red-600 hover:bg-red-700 rounded-lg py-3 font-semibold transition-colors"
                >
                    Logout
                </button>

            </aside>

            <main className="flex-1 p-8">
                <Outlet />
            </main>

        </div>
    );
}