import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { toast } from "sonner";

export default function Profile() {
    const [admin, setAdmin] = useState(null);

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadProfile();
    }, []);

    async function loadProfile() {
        try {
            const res = await api.get("/admin/me");

            setAdmin(res.data);

            setForm({
                name: res.data.name || "",
                email: res.data.email || "",
                password: "",
            });
        } catch {
            toast.error("Failed to load profile");
        } finally {
            setLoading(false);
        }
    }

    function handleChange(e) {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    async function saveProfile(e) {
        e.preventDefault();

        setSaving(true);

        try {
            const data = {
                name: form.name,
            };

            if (admin.role === "admin") {
                data.email = form.email;

                if (form.password.trim()) {
                    data.password = form.password;
                }
            }

            const res = await api.put(
                "/admin/profile",
                data
            );

            setAdmin(res.data);

            setForm((prev) => ({
                ...prev,
                name: res.data.name || "",
                email: res.data.email || "",
                password: "",
            }));

            toast.success("Profile updated successfully");
        } catch (err) {
            toast.error(
                err?.response?.data?.detail ||
                "Failed to update profile"
            );
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                Loading...
            </div>
        );
    }

    if (!admin) {
        return null;
    }

    const isAdmin = admin.role === "admin";

    return (
        <div className="max-w-2xl">

            <div className="mb-8">
                <h1 className="text-4xl font-bold">
                    My Profile
                </h1>

                <p className="text-gray-500 mt-2">
                    Manage your account information.
                </p>
            </div>

            <div className="bg-white rounded-2xl shadow p-8">

                <div className="mb-8">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-sm font-semibold capitalize">
                        {admin.role}
                    </span>
                </div>

                <form
                    onSubmit={saveProfile}
                    className="space-y-6"
                >

                    {/* Name */}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Name
                        </label>

                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-slate-900"
                            required
                        />
                    </div>

                    {/* Admin only */}

                    {isAdmin && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email
                                </label>

                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-slate-900"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    New Password
                                </label>

                                <input
                                    type="password"
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    placeholder="Leave empty to keep current password"
                                    className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-slate-900"
                                />

                                <p className="text-xs text-gray-500 mt-2">
                                    Leave this empty if you do not want to change the password.
                                </p>
                            </div>
                        </>
                    )}

                    {!isAdmin && (
                        <div className="bg-slate-50 rounded-xl p-4 text-sm text-gray-600">
                            As a Sales user, you can only change your name.
                            Your email and password are managed by an Admin.
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-3 font-semibold disabled:opacity-60"
                    >
                        {saving
                            ? "Saving..."
                            : "Save Changes"}
                    </button>

                </form>

            </div>

        </div>
    );
}