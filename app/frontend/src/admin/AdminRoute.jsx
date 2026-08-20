import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function AdminRoute({
    children,
    adminOnly = false
}) {
    const [loading, setLoading] = useState(true);
    const [admin, setAdmin] = useState(null);

    useEffect(() => {
        checkAuth();
    }, []);

    async function checkAuth() {
        try {
            const res = await api.get("/admin/me");
            setAdmin(res.data);
        } catch {
            setAdmin(null);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen text-xl">
                Loading...
            </div>
        );
    }

    if (!admin) {
        return (
            <Navigate
                to="/admin/login"
                replace
            />
        );
    }

    if (
        adminOnly &&
        admin.role !== "admin"
    ) {
        return (
            <Navigate
                to="/admin"
                replace
            />
        );
    }

    return children;
}