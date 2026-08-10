import { useEffect, useState } from "react";
import { api } from "../lib/api";

const DEFAULT_SETTINGS = {
    store_name: "AllNeeds",
    logo: "",
    description: "",
    description_ar: "",

    instagram_url: "",
    facebook_url: "",
    twitter_url: "",

    address: "Dubai, United Arab Emirates",
    address_ar: "",
    phone: "+971 4 000 0000",
    email: "hello@allneeds.ae",

    show_visa: true,
    show_mastercard: true,
    show_apple_pay: true,
    show_google_pay: true,

    copyright_text: ""
};

export default function Settings() {
    const [form, setForm] = useState(DEFAULT_SETTINGS);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    async function loadSettings() {
        try {
            const res = await api.get("/admin/site-settings");

            const data = res.data || {};

            setForm(prev => ({
                ...prev,

                store_name:
                    data.store_name ?? prev.store_name,

                logo:
                    data.logo ?? prev.logo,

                description:
                    data.description ?? prev.description,

                description_ar:
                    data.description_ar ?? prev.description_ar,

                instagram_url:
                    data.instagram_url ?? prev.instagram_url,

                facebook_url:
                    data.facebook_url ?? prev.facebook_url,

                twitter_url:
                    data.twitter_url ?? prev.twitter_url,

                address:
                    data.address ?? prev.address,

                address_ar:
                    data.address_ar ?? prev.address_ar,

                phone:
                    data.phone ?? prev.phone,

                email:
                    data.email ?? prev.email,

                show_visa:
                    data.show_visa ?? prev.show_visa,

                show_mastercard:
                    data.show_mastercard ?? prev.show_mastercard,

                show_apple_pay:
                    data.show_apple_pay ?? prev.show_apple_pay,

                show_google_pay:
                    data.show_google_pay ?? prev.show_google_pay,

                copyright_text:
                    data.copyright_text ?? prev.copyright_text
            }));

        } catch (err) {
            console.error(err);

            alert(
                err.response?.data?.detail ||
                "Failed to load settings."
            );
        } finally {
            setLoading(false);
        }
    }

    function update(e) {
        const {
            name,
            value,
            type,
            checked
        } = e.target;

        setForm(prev => ({
            ...prev,

            [name]:
                type === "checkbox"
                    ? checked
                    : value
        }));
    }

    async function save(e) {
        e.preventDefault();

        setSaving(true);

        try {
            /*
             * IMPORTANT:
             *
             * We send the complete current form.
             * Since form was first populated from the
             * existing database values, changing one
             * field will not erase the others.
             */

            await api.patch(
                "/admin/site-settings",
                form
            );

            alert(
                "Settings saved successfully."
            );

        } catch (err) {
            console.error(err);

            alert(
                err.response?.data?.detail ||
                "Failed to save settings."
            );
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="p-6">
                Loading settings...
            </div>
        );
    }

    return (
        <div className="max-w-4xl">

            <div className="mb-8">
                <h1 className="text-4xl font-bold">
                    Settings
                </h1>

                <p className="text-gray-500 mt-2">
                    Manage your store information and footer.
                </p>
            </div>

            <form
                onSubmit={save}
                className="space-y-8"
            >

                {/* =====================================================
                    BRAND
                ====================================================== */}

                <section className="bg-white rounded-xl shadow p-6">

                    <h2 className="text-xl font-semibold mb-6">
                        Brand
                    </h2>

                    <div className="space-y-4">

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Store Name
                            </label>

                            <input
                                name="store_name"
                                value={form.store_name}
                                placeholder="Store Name"
                                onChange={update}
                                className="w-full border rounded-lg p-3"
                            />
                        </div>


                        <div>

                            <label className="block text-sm font-medium mb-2">
                                Logo URL
                            </label>

                            <input
                                name="logo"
                                value={form.logo}
                                placeholder="Logo URL"
                                onChange={update}
                                className="w-full border rounded-lg p-3"
                            />

                        </div>


                        {form.logo && (
                            <div>

                                <p className="text-sm text-gray-500 mb-2">
                                    Logo Preview
                                </p>

                                <div className="border rounded-lg p-4 bg-gray-50">

                                    <img
                                        src={form.logo}
                                        alt="Logo preview"
                                        className="h-20 w-auto object-contain"
                                        onError={(e) => {
                                            e.currentTarget.style.display =
                                                "none";
                                        }}
                                    />

                                </div>

                            </div>
                        )}


                        <div>

                            <label className="block text-sm font-medium mb-2">
                                Store Description
                            </label>

                            <textarea
                                name="description"
                                value={form.description}
                                placeholder="Store Description"
                                onChange={update}
                                rows={4}
                                className="w-full border rounded-lg p-3"
                            />

                        </div>


                        <div>

                            <label className="block text-sm font-medium mb-2">
                                Arabic Store Description
                            </label>

                            <textarea
                                name="description_ar"
                                value={form.description_ar}
                                placeholder="Arabic Store Description"
                                onChange={update}
                                rows={4}
                                dir="rtl"
                                className="w-full border rounded-lg p-3"
                            />

                        </div>

                    </div>

                </section>


                {/* =====================================================
                    SOCIAL MEDIA
                ====================================================== */}

                <section className="bg-white rounded-xl shadow p-6">

                    <h2 className="text-xl font-semibold mb-6">
                        Social Media
                    </h2>

                    <div className="space-y-4">

                        <div>

                            <label className="block text-sm font-medium mb-2">
                                Instagram URL
                            </label>

                            <input
                                name="instagram_url"
                                value={form.instagram_url}
                                placeholder="https://instagram.com/..."
                                onChange={update}
                                className="w-full border rounded-lg p-3"
                            />

                        </div>


                        <div>

                            <label className="block text-sm font-medium mb-2">
                                Facebook URL
                            </label>

                            <input
                                name="facebook_url"
                                value={form.facebook_url}
                                placeholder="https://facebook.com/..."
                                onChange={update}
                                className="w-full border rounded-lg p-3"
                            />

                        </div>


                        <div>

                            <label className="block text-sm font-medium mb-2">
                                Twitter / X URL
                            </label>

                            <input
                                name="twitter_url"
                                value={form.twitter_url}
                                placeholder="https://x.com/..."
                                onChange={update}
                                className="w-full border rounded-lg p-3"
                            />

                        </div>

                    </div>

                </section>


                {/* =====================================================
                    CONTACT
                ====================================================== */}

                <section className="bg-white rounded-xl shadow p-6">

                    <h2 className="text-xl font-semibold mb-6">
                        Contact Information
                    </h2>

                    <div className="space-y-4">

                        <div>

                            <label className="block text-sm font-medium mb-2">
                                Address
                            </label>

                            <input
                                name="address"
                                value={form.address}
                                placeholder="Address"
                                onChange={update}
                                className="w-full border rounded-lg p-3"
                            />

                        </div>


                        <div>

                            <label className="block text-sm font-medium mb-2">
                                Arabic Address
                            </label>

                            <input
                                name="address_ar"
                                value={form.address_ar}
                                placeholder="Arabic Address"
                                onChange={update}
                                dir="rtl"
                                className="w-full border rounded-lg p-3"
                            />

                        </div>


                        <div>

                            <label className="block text-sm font-medium mb-2">
                                Phone Number
                            </label>

                            <input
                                name="phone"
                                value={form.phone}
                                placeholder="+971 ..."
                                onChange={update}
                                className="w-full border rounded-lg p-3"
                            />

                        </div>


                        <div>

                            <label className="block text-sm font-medium mb-2">
                                Email
                            </label>

                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                placeholder="Email"
                                onChange={update}
                                className="w-full border rounded-lg p-3"
                            />

                        </div>

                    </div>

                </section>


                {/* =====================================================
                    PAYMENT METHODS
                ====================================================== */}

                <section className="bg-white rounded-xl shadow p-6">

                    <h2 className="text-xl font-semibold mb-6">
                        Payment Methods
                    </h2>

                    <div className="space-y-4">

                        <label className="flex items-center gap-3">

                            <input
                                type="checkbox"
                                name="show_visa"
                                checked={form.show_visa}
                                onChange={update}
                            />

                            <span>Visa</span>

                        </label>


                        <label className="flex items-center gap-3">

                            <input
                                type="checkbox"
                                name="show_mastercard"
                                checked={form.show_mastercard}
                                onChange={update}
                            />

                            <span>Mastercard</span>

                        </label>


                        <label className="flex items-center gap-3">

                            <input
                                type="checkbox"
                                name="show_apple_pay"
                                checked={form.show_apple_pay}
                                onChange={update}
                            />

                            <span>Apple Pay</span>

                        </label>


                        <label className="flex items-center gap-3">

                            <input
                                type="checkbox"
                                name="show_google_pay"
                                checked={form.show_google_pay}
                                onChange={update}
                            />

                            <span>Google Pay</span>

                        </label>

                    </div>

                </section>


                {/* =====================================================
                    COPYRIGHT
                ====================================================== */}

                <section className="bg-white rounded-xl shadow p-6">

                    <h2 className="text-xl font-semibold mb-6">
                        Copyright
                    </h2>

                    <input
                        name="copyright_text"
                        value={form.copyright_text}
                        placeholder="Leave empty to use automatic copyright"
                        onChange={update}
                        className="w-full border rounded-lg p-3"
                    />

                    <p className="text-sm text-gray-500 mt-2">
                        If empty, the website will automatically show the
                        current year and store name.
                    </p>

                </section>


                {/* =====================================================
                    SAVE
                ====================================================== */}

                <div className="flex justify-end">

                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-pink-600 hover:bg-pink-700 disabled:opacity-50 text-white px-8 py-3 rounded-lg font-semibold"
                    >

                        {saving
                            ? "Saving..."
                            : "Save Settings"
                        }

                    </button>

                </div>

            </form>

        </div>
    );
}