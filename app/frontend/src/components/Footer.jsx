import React, {
    useEffect,
    useState
} from "react";

import {
    Link
} from "react-router-dom";

import {
    useApp
} from "@/context/AppContext";

import {
    api
} from "@/lib/api";

import {
    toast
} from "sonner";

import {
    Instagram,
    Facebook,
    Twitter,
    Mail,
    Phone,
    MapPin
} from "lucide-react";


const DEFAULT_SETTINGS = {

    store_name: "AllNeeds",

    logo: "",

    description:
        "Premium baby products, thoughtfully designed for the modern UAE family.",

    description_ar: "",

    instagram_url: "",
    facebook_url: "",
    twitter_url: "",

    address:
        "Dubai, United Arab Emirates",

    address_ar: "",

    phone:
        "+971 4 000 0000",

    email:
        "hello@allneeds.ae",

    show_visa: true,
    show_mastercard: true,
    show_apple_pay: true,
    show_google_pay: true,

    copyright_text: ""
};


export const Footer = () => {

    const {
        t
    } = useApp();


    const [
        email,
        setEmail
    ] = useState("");


    const [
        settings,
        setSettings
    ] = useState(
        DEFAULT_SETTINGS
    );


    useEffect(() => {

        loadSettings();

    }, []);


    async function loadSettings() {

        try {

            const res =
                await api.get(
                    "/site-settings"
                );


            const data =
                res.data || {};


            setSettings(prev => ({

                ...prev,

                store_name:
                    data.store_name ??
                    prev.store_name,

                logo:
                    data.logo ??
                    prev.logo,

                description:
                    data.description ??
                    prev.description,

                description_ar:
                    data.description_ar ??
                    prev.description_ar,

                instagram_url:
                    data.instagram_url ??
                    prev.instagram_url,

                facebook_url:
                    data.facebook_url ??
                    prev.facebook_url,

                twitter_url:
                    data.twitter_url ??
                    prev.twitter_url,

                address:
                    data.address ??
                    prev.address,

                address_ar:
                    data.address_ar ??
                    prev.address_ar,

                phone:
                    data.phone ??
                    prev.phone,

                email:
                    data.email ??
                    prev.email,

                show_visa:
                    data.show_visa ??
                    prev.show_visa,

                show_mastercard:
                    data.show_mastercard ??
                    prev.show_mastercard,

                show_apple_pay:
                    data.show_apple_pay ??
                    prev.show_apple_pay,

                show_google_pay:
                    data.show_google_pay ??
                    prev.show_google_pay,

                copyright_text:
                    data.copyright_text ??
                    prev.copyright_text

            }));


        } catch (error) {

            console.error(
                "Failed to load site settings:",
                error
            );

        }

    }


    const subscribe = async (e) => {

        e.preventDefault();


        try {

            await api.post(
                "/newsletter",
                {
                    email
                }
            );


            toast.success(
                t.newsletter.done
            );


            setEmail("");


        } catch {

            toast.error(
                "Please enter a valid email"
            );

        }

    };


    const socialLinks = [

        {
            icon: Instagram,
            url: settings.instagram_url
        },

        {
            icon: Facebook,
            url: settings.facebook_url
        },

        {
            icon: Twitter,
            url: settings.twitter_url
        }

    ];


    return (

        <footer className="bg-slate-950 text-slate-400">


            {/* =====================================================
                MAIN FOOTER
            ====================================================== */}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">


                    {/* =================================================
                        BRAND
                    ================================================== */}

                    <div>


                        {settings.logo ? (

                            <img
                                src={settings.logo}
                                alt={
                                    settings.store_name ||
                                    "AllNeeds"
                                }
                                className="h-12 w-auto object-contain mb-4"
                            />

                        ) : (

                            <h3 className="text-2xl font-bold text-white mb-4">

                                {settings.store_name ||
                                    "AllNeeds"}

                            </h3>

                        )}


                        {settings.description && (

                            <p className="text-sm leading-6 mb-6">

                                {
                                    settings.description
                                }

                            </p>

                        )}


                        <div className="flex gap-3">


                            {socialLinks.map(
                                (
                                    {
                                        icon: Icon,
                                        url
                                    },
                                    index
                                ) => {

                                    if (!url) {
                                        return null;
                                    }


                                    return (

                                        <a
                                            key={index}
                                            href={url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                                            data-testid={`social-${index}`}
                                        >

                                            <Icon
                                                className="w-4 h-4"
                                            />

                                        </a>

                                    );

                                }
                            )}

                        </div>

                    </div>


                    {/* =================================================
                        SHOP
                        ثابت - لا يتأثر بالـ Settings
                    ================================================== */}

                    <div>

                        <h4 className="text-white font-semibold mb-4">

                            {
                                t.footer.shop
                            }

                        </h4>


                        <ul className="space-y-3 text-sm">


                            <li>

                                <Link
                                    to="/shop"
                                    className="hover:text-white transition-colors"
                                >
                                    {t.nav.shop}
                                </Link>

                            </li>


                            <li>

                                <Link
                                    to="/categories"
                                    className="hover:text-white transition-colors"
                                >
                                    {t.nav.categories}
                                </Link>

                            </li>


                            <li>

                                <Link
                                    to="/shop?best_seller=true"
                                    className="hover:text-white transition-colors"
                                >
                                    {t.sections.best}
                                </Link>

                            </li>


                            <li>

                                <Link
                                    to="/shop?new_arrival=true"
                                    className="hover:text-white transition-colors"
                                >
                                    {t.sections.new}
                                </Link>

                            </li>


                        </ul>

                    </div>


                    {/* =================================================
                        COMPANY
                        ثابت - الـ routes لا يتم تعديلها من Settings
                    ================================================== */}

                    <div>

                        <h4 className="text-white font-semibold mb-4">

                            {
                                t.footer.company
                            }

                        </h4>


                        <ul className="space-y-3 text-sm">


                            <li>

                                <Link
                                    to="/about"
                                    className="hover:text-white transition-colors"
                                >
                                    {t.nav.about}
                                </Link>

                            </li>


                            <li>

                                <Link
                                    to="/faq"
                                    className="hover:text-white transition-colors"
                                >
                                    {t.nav.faq}
                                </Link>

                            </li>


                            <li>

                                <Link
                                    to="/privacy"
                                    className="hover:text-white transition-colors"
                                >
                                    Privacy Policy
                                </Link>

                            </li>


                            <li>

                                <Link
                                    to="/returns"
                                    className="hover:text-white transition-colors"
                                >
                                    Return Policy
                                </Link>

                            </li>


                            <li>

                                <Link
                                    to="/terms"
                                    className="hover:text-white transition-colors"
                                >
                                    Terms & Conditions
                                </Link>

                            </li>


                        </ul>

                    </div>


                    {/* =================================================
                        CONTACT
                    ================================================== */}

                    <div>

                        <h4 className="text-white font-semibold mb-4">

                            {
                                t.footer.contact
                            }

                        </h4>


                        <ul className="space-y-3 text-sm text-slate-400">


                            {settings.address && (

                                <li className="flex items-start gap-2">

                                    <MapPin
                                        className="w-4 h-4 mt-0.5 shrink-0"
                                        strokeWidth={1.5}
                                    />

                                    <span>
                                        {
                                            settings.address
                                        }
                                    </span>

                                </li>

                            )}


                            {settings.phone && (

                                <li className="flex items-center gap-2">

                                    <Phone
                                        className="w-4 h-4 shrink-0"
                                        strokeWidth={1.5}
                                    />

                                    <span>
                                        {
                                            settings.phone
                                        }
                                    </span>

                                </li>

                            )}


                            {settings.email && (

                                <li className="flex items-center gap-2">

                                    <Mail
                                        className="w-4 h-4 shrink-0"
                                        strokeWidth={1.5}
                                    />

                                    <span>
                                        {
                                            settings.email
                                        }
                                    </span>

                                </li>

                            )}


                        </ul>

                    </div>

                </div>

            </div>


            {/* =====================================================
                BOTTOM
            ====================================================== */}

            <div className="border-t border-white/10">


                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-6">


                    {/* =================================================
                        NEWSLETTER
                    ================================================== */}

                    <form
                        onSubmit={subscribe}
                        className="flex w-full md:w-auto max-w-sm gap-2"
                        data-testid="footer-newsletter"
                    >

                        <input
                            value={email}
                            onChange={(e) =>
                                setEmail(
                                    e.target.value
                                )
                            }
                            type="email"
                            required
                            placeholder={
                                t.newsletter.placeholder
                            }
                            className="flex-1 bg-white/10 rounded-full py-2.5 px-4 text-sm text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-white/50"
                            data-testid="footer-newsletter-input"
                        />


                        <button
                            type="submit"
                            className="bg-white text-slate-950 rounded-full px-5 py-2.5 text-sm font-semibold hover:bg-slate-200 transition-colors"
                        >

                            {
                                t.newsletter.btn
                            }

                        </button>

                    </form>


                    {/* =================================================
                        PAYMENT METHODS
                    ================================================== */}

                    <div className="flex items-center gap-3 text-xs text-slate-400">

                        <span>
                            {t.footer.pay}:
                        </span>


                        {settings.show_visa && (

                            <span className="font-semibold text-slate-200">
                                VISA
                            </span>

                        )}


                        {settings.show_mastercard && (

                            <span className="font-semibold text-slate-200">
                                Mastercard
                            </span>

                        )}


                        {settings.show_apple_pay && (

                            <span className="font-semibold text-slate-200">
                                Apple Pay
                            </span>

                        )}


                        {settings.show_google_pay && (

                            <span className="font-semibold text-slate-200">
                                G Pay
                            </span>

                        )}

                    </div>

                </div>


                {/* =================================================
                    COPYRIGHT
                ================================================== */}

                <div className="text-center text-xs text-slate-500 pb-8">

                    {settings.copyright_text
                        ? settings.copyright_text
                        : `© ${new Date().getFullYear()} ${
                            settings.store_name ||
                            "AllNeeds"
                        }. ${
                            t.footer.rights
                        }`
                    }

                </div>

            </div>

        </footer>

    );

};