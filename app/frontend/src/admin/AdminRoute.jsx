import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function AdminRoute({ children }) {

    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);

    useEffect(() => {

        checkAuth();

    }, []);

    async function checkAuth() {

        try {

            await api.get("/admin/me");

            setAuthenticated(true);

        } catch {

            setAuthenticated(false);

        }

        setLoading(false);

    }

    if (loading) {

        return (
            <div className="flex items-center justify-center min-h-screen text-xl">
                Loading...
            </div>
        );

    }

    if (!authenticated) {

        return <Navigate to="/admin/login" replace />;

    }

    return children;

}