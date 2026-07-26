import { useState } from "react";
import { api } from "../lib/api";
import { useNavigate } from "react-router-dom";

export default function Login() {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function login(e) {

        e.preventDefault();

        setLoading(true);
        setError("");

        try {

            await api.post("/admin/login", {
                email,
                password
            });

            navigate("/admin");

        } catch (err) {

            setError(
                err.response?.data?.detail ||
                "Invalid email or password"
            );

        }

        setLoading(false);

    }

    return (

        <div className="min-h-screen bg-slate-100 flex items-center justify-center">

            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-10">

                <h1 className="text-4xl font-bold text-center mb-2">
                    AllNeeds
                </h1>

                <p className="text-center text-gray-500 mb-8">
                    Admin Dashboard
                </p>

                <form
                    onSubmit={login}
                    className="space-y-5"
                >

                    <input
                        type="text"
                        placeholder="Email"
                        value={email}
                        onChange={(e)=>setEmail(e.target.value)}
                        className="w-full border rounded-lg p-3"
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e)=>setPassword(e.target.value)}
                        className="w-full border rounded-lg p-3"
                    />

                    {error && (

                        <div className="text-red-600 text-sm">
                            {error}
                        </div>

                    )}

                    <button
                        disabled={loading}
                        className="w-full bg-pink-600 hover:bg-pink-700 text-white rounded-lg p-3 font-semibold"
                    >
                        {loading ? "Signing in..." : "Login"}
                    </button>

                </form>

            </div>

        </div>

    );

}