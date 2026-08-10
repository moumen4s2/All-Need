import { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function Settings() {

    const [form, setForm] = useState({
        store_name: "",
        logo: "",

        description: "",
        description_ar: "",

        instagram_url: "",
        facebook_url: "",
        twitter_url: "",

        address: "",
        address_ar: "",
        phone: "",
        email: "",

        about_url: "",
        faq_url: "",
        privacy_url: "",
        return_policy_url: "",
        terms_url: "",

        show_visa: true,
        show_mastercard: true,
        show_apple_pay: true,
        show_google_pay: true,

        copyright_text: ""
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    async function loadSettings() {

        try {

            const res = await api.get("/admin/site-settings");

            setForm({
                store_name: res.data.store_name ?? "",
                logo: res.data.logo ?? "",

                description: res.data.description ?? "",
                description_ar: res.data.description_ar ?? "",

                instagram_url: res.data.instagram_url ?? "",
                facebook_url: res.data.facebook_url ?? "",
                twitter_url: res.data.twitter_url ?? "",

                address: res.data.address ?? "",
                address_ar: res.data.address_ar ?? "",
                phone: res.data.phone ?? "",
                email: res.data.email ?? "",

                about_url: res.data.about_url ?? "",
                faq_url: res.data.faq_url ?? "",
                privacy_url: res.data.privacy_url ?? "",
                return_policy_url: res.data.return_policy_url ?? "",
                terms_url: res.data.terms_url ?? "",

                show_visa: res.data.show_visa ?? true,
                show_mastercard: res.data.show_mastercard ?? true,
                show_apple_pay: res.data.show_apple_pay ?? true,
                show_google_pay: res.data.show_google_pay ?? true,

                copyright_text: res.data.copyright_text ?? ""
            });

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

        const { name, value, type, checked } = e.target;

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

            await api.put(
                "/admin/site-settings",
                form
            );

            alert("Settings saved successfully.");

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

                {/* BRAND */}

                <section className="bg-white rounded-xl shadow p-6">

                    <h2 className="text-xl font-semibold mb-6">
                        Brand
                    </h2>

                    <div className="space-y-4">

                        <input
                            name="store_name"
                            value={form.store_name}
                            placeholder="Store Name"
                            onChange={update}
                            className="w-full border rounded-lg p-3"
                        />

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

                            <img
                                src={form.logo}
                                alt="Logo preview"
                                className="h-20 object-contain border rounded-lg p-2"
                            />

                        )}

                        <textarea
                            name="description"
                            value={form.description}
                            placeholder="Store Description"
                            onChange={update}
                            rows={4}
                            className="w-full border rounded-lg p-3"
                        />

                        <textarea
                            name="description_ar"
                            value={form.description_ar}
                            placeholder="Arabic Store Description"
                            onChange={update}
                            rows={4}
                            className="w-full border rounded-lg p-3"
                        />

                    </div>

                </section>


                {/* SOCIAL MEDIA */}

                <section className="bg-white rounded-xl shadow p-6">

                    <h2 className="text-xl font-semibold mb-6">
                        Social Media
                    </h2>

                    <div className="space-y-4">

                        <input
                            name="instagram_url"
                            value={form.instagram_url}
                            placeholder="Instagram URL"
                            onChange={update}
                            className="w-full border rounded-lg p-3"
                        />

                        <input
                            name="facebook_url"
                            value={form.facebook_url}
                            placeholder="Facebook URL"
                            onChange={update}
                            className="w-full border rounded-lg p-3"
                        />

                        <input
                            name="twitter_url"
                            value={form.twitter_url}
                            placeholder="Twitter / X URL"
                            onChange={update}
                            className="w-full border rounded-lg p-3"
                        />

                    </div>

                </section>


                {/* CONTACT */}

                <section className="bg-white rounded-xl shadow p-6">

                    <h2 className="text-xl font-semibold mb-6">
                        Contact Information
                    </h2>

                    <div className="space-y-4">

                        <input
                            name="address"
                            value={form.address}
                            placeholder="Address"
                            onChange={update}
                            className="w-full border rounded-lg p-3"
                        />

                        <input
                            name="address_ar"
                            value={form.address_ar}
                            placeholder="Arabic Address"
                            onChange={update}
                            className="w-full border rounded-lg p-3"
                        />

                        <input
                            name="phone"
                            value={form.phone}
                            placeholder="Phone Number"
                            onChange={update}
                            className="w-full border rounded-lg p-3"
                        />

                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            placeholder="Email"
                            onChange={update}
                            className="w-full border rounded-lg p-3"
                        />

                    </div>

                </section>


                {/* FOOTER LINKS */}

                <section className="bg-white rounded-xl shadow p-6">

                    <h2 className="text-xl font-semibold mb-6">
                        Footer Links
                    </h2>

                    <div className="space-y-4">

                        <input
                            name="about_url"
                            value={form.about_url}
                            placeholder="About URL"
                            onChange={update}
                            className="w-full border rounded-lg p-3"
                        />

                        <input
                            name="faq_url"
                            value={form.faq_url}
                            placeholder="FAQ URL"
                            onChange={update}
                            className="w-full border rounded-lg p-3"
                        />

                        <input
                            name="privacy_url"
                            value={form.privacy_url}
                            placeholder="Privacy Policy URL"
                            onChange={update}
                            className="w-full border rounded-lg p-3"
                        />

                        <input
                            name="return_policy_url"
                            value={form.return_policy_url}
                            placeholder="Return Policy URL"
                            onChange={update}
                            className="w-full border rounded-lg p-3"
                        />

                        <input
                            name="terms_url"
                            value={form.terms_url}
                            placeholder="Terms & Conditions URL"
                            onChange={update}
                            className="w-full border rounded-lg p-3"
                        />

                    </div>

                </section>


                {/* PAYMENT METHODS */}

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

                            Visa

                        </label>

                        <label className="flex items-center gap-3">

                            <input
                                type="checkbox"
                                name="show_mastercard"
                                checked={form.show_mastercard}
                                onChange={update}
                            />

                            Mastercard

                        </label>

                        <label className="flex items-center gap-3">

                            <input
                                type="checkbox"
                                name="show_apple_pay"
                                checked={form.show_apple_pay}
                                onChange={update}
                            />

                            Apple Pay

                        </label>

                        <label className="flex items-center gap-3">

                            <input
                                type="checkbox"
                                name="show_google_pay"
                                checked={form.show_google_pay}
                                onChange={update}
                            />

                            Google Pay

                        </label>

                    </div>

                </section>


                {/* COPYRIGHT */}

                <section className="bg-white rounded-xl shadow p-6">

                    <h2 className="text-xl font-semibold mb-6">
                        Copyright
                    </h2>

                    <input
                        name="copyright_text"
                        value={form.copyright_text}
                        placeholder="Copyright text"
                        onChange={update}
                        className="w-full border rounded-lg p-3"
                    />

                </section>



                <div className="flex justify-end">

                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-pink-600 hover:bg-pink-700 disabled:opacity-50 text-white px-8 py-3 rounded-lg"
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