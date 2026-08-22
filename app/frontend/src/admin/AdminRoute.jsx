import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function AdminRoute({
    children,
    adminOnly = false,
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
        } catch (error) {
            console.error("Admin authentication failed:", error);

            setAdmin(null);
        } finally {
            setLoading(false);
        }
    }

    // Check authentication
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen text-xl">
                Loading...
            </div>
        );
    }

    // Not logged in
    if (!admin) {
        return (
            <Navigate
                to="/admin/login"
                replace
            />
        );
    }

    // Admin-only pages
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