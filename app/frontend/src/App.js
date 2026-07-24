import React, { useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AppProvider } from "@/context/AppContext";
import { Toaster } from "@/components/ui/sonner";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { Home } from "@/pages/Home";
import { Shop } from "@/pages/Shop";
import { Categories } from "@/pages/Categories";
import { ProductDetails } from "@/pages/ProductDetails";
import { Wishlist } from "@/pages/Wishlist";
import { Checkout } from "@/pages/Checkout";
import { TrackOrder } from "@/pages/TrackOrder";
import { Account } from "@/pages/Account";
import { Contact } from "@/pages/Contact";
import { About } from "@/pages/About";
import { FAQ } from "@/pages/FAQ";
import { Policy } from "@/pages/Policy";
import { AuthCallback } from "@/pages/AuthCallback";

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

const Layout = ({ children }) => (
  <>
    <Header />
    <main>{children}</main>
    <Footer />
    <CartDrawer />
  </>
);

function AppRouter() {
  const location = useLocation();
  if (location.hash?.includes("session_id=")) return <AuthCallback />;
  return (
    <Layout>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/track" element={<TrackOrder />} />
        <Route path="/account" element={<Account />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/privacy" element={<Policy type="privacy" />} />
        <Route path="/returns" element={<Policy type="returns" />} />
        <Route path="/terms" element={<Policy type="terms" />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <div className="App">
      <AppProvider>
        <BrowserRouter>
          <AppRouter />
          <Toaster position="top-center" richColors />
        </BrowserRouter>
      </AppProvider>
    </div>
  );
}

export default App;
