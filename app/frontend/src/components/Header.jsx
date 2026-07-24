import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { Search, Heart, ShoppingBag, User, Menu, X, Globe, Package } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export const Header = () => {
  const { t, lang, setLang, wishlist, cartCount, setCartOpen, user, login, logout, dir } = useApp();
  const [query, setQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const submitSearch = (e) => {
    e.preventDefault();
    navigate(`/shop?search=${encodeURIComponent(query)}`);
    setMobileOpen(false);
  };

  const navLinks = [
    { to: "/", label: t.nav.home }, { to: "/shop", label: t.nav.shop },
    { to: "/categories", label: t.nav.categories }, { to: "/about", label: t.nav.about },
    { to: "/contact", label: t.nav.contact }, { to: "/faq", label: t.nav.faq },
  ];

  return (
    <header className="sticky top-0 z-50 glass border-b border-black/5" data-testid="site-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20 gap-4">
          <Link to="/" className="flex items-center gap-2 shrink-0" data-testid="logo-link">
            <div className="w-9 h-9 rounded-full bg-slate-900 flex items-center justify-center text-white font-display font-bold text-lg">A</div>
            <span className="font-display font-bold text-xl md:text-2xl tracking-tight">AllNeeds</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((l) => (
              <Link key={l.to} to={l.to} className="text-sm font-medium text-slate-700 hover:text-slate-950 transition-colors" data-testid={`nav-${l.to}`}>
                {l.label}
              </Link>
            ))}
          </nav>

          <form onSubmit={submitSearch} className="hidden md:flex items-center flex-1 max-w-xs">
            <div className="relative w-full">
              <Search className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-slate-400" strokeWidth={1.5} />
              <input
                value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder={t.header.search}
                className="w-full bg-slate-100 rounded-full py-2.5 ps-10 pe-4 text-sm outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                data-testid="search-input"
              />
            </div>
          </form>

          <div className="flex items-center gap-1 sm:gap-2">
            <button onClick={() => setLang(lang === "en" ? "ar" : "en")} className="flex items-center gap-1.5 text-sm font-medium px-2.5 py-2 rounded-full hover:bg-slate-100 transition-colors" data-testid="lang-toggle">
              <Globe className="w-4 h-4" strokeWidth={1.5} />
              <span>{lang === "en" ? "عربي" : "EN"}</span>
            </button>

            <Link to="/wishlist" className="relative p-2.5 rounded-full hover:bg-slate-100 transition-colors" data-testid="wishlist-link">
              <Heart className="w-5 h-5" strokeWidth={1.5} />
              {wishlist.length > 0 && <span className="absolute top-0 end-0 bg-slate-900 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{wishlist.length}</span>}
            </Link>

            <button onClick={() => setCartOpen(true)} className="relative p-2.5 rounded-full hover:bg-slate-100 transition-colors" data-testid="cart-button">
              <ShoppingBag className="w-5 h-5" strokeWidth={1.5} />
              {cartCount > 0 && <span className="absolute top-0 end-0 bg-slate-900 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center" data-testid="cart-count">{cartCount}</span>}
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2.5 rounded-full hover:bg-slate-100 transition-colors" data-testid="account-button">
                  {user?.picture ? <img src={user.picture} alt="" className="w-6 h-6 rounded-full object-cover" /> : <User className="w-5 h-5" strokeWidth={1.5} />}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={dir === "rtl" ? "start" : "end"} className="w-52">
                {user ? (
                  <>
                    <div className="px-2 py-2 text-sm font-medium truncate">{user.name}</div>
                    <DropdownMenuItem onClick={() => navigate("/account")} data-testid="menu-orders"><Package className="w-4 h-4 me-2" />{t.header.myorders}</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/track")}><Search className="w-4 h-4 me-2" />{t.header.track}</DropdownMenuItem>
                    <DropdownMenuItem onClick={logout} data-testid="menu-signout">{t.header.signout}</DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem onClick={login} data-testid="menu-signin">{t.header.signin}</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/track")}>{t.header.track}</DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <button className="lg:hidden p-2.5 rounded-full hover:bg-slate-100 transition-colors" data-testid="mobile-menu-button"><Menu className="w-5 h-5" strokeWidth={1.5} /></button>
              </SheetTrigger>
              <SheetContent side={dir === "rtl" ? "left" : "right"} className="w-72">
                <form onSubmit={submitSearch} className="mt-8 mb-6 relative">
                  <Search className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-slate-400" strokeWidth={1.5} />
                  <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t.header.search} className="w-full bg-slate-100 rounded-full py-2.5 ps-10 pe-4 text-sm outline-none" data-testid="mobile-search-input" />
                </form>
                <nav className="flex flex-col gap-1">
                  {navLinks.map((l) => (
                    <Link key={l.to} to={l.to} onClick={() => setMobileOpen(false)} className="py-3 px-3 rounded-xl text-base font-medium hover:bg-slate-100 transition-colors">{l.label}</Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};
