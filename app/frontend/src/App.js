import React, { useEffect } from "react";
import "@/App.css";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import { AppProvider } from "@/context/AppContext";
import { Toaster } from "@/components/ui/sonner";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";

import { Home } from "@/pages/Home";
import { Shop } from "@/pages/Shop";
import { Categories as ShopCategories } from "@/pages/Categories";
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

// Admin
import AdminLayout from "./admin/AdminLayout";
import Dashboard from "./admin/Dashboard";
import Products from "./admin/Products";
import ProductForm from "./admin/ProductForm";
import Orders from "./admin/Orders";
import OrderDetails from "./admin/OrderDetails";
import Categories from "./admin/Categories";
import Settings from "./admin/Settings";
import Login from "./admin/Login";
import AdminRoute from "./admin/AdminRoute";
import Coupons from "./admin/Coupons";
import Staff from "./admin/Staff";
import Profile from "./admin/Profile";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

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

  if (location.hash?.includes("session_id=")) {
    return <AuthCallback />;
  }

  return (
    <>
      <ScrollToTop />

      <Routes>

        {/* =========================
            Website
        ========================= */}

        <Route
          path="/*"
          element={
            <Layout>

              <Routes>

                <Route
                  path="/"
                  element={<Home />}
                />

                <Route
                  path="/shop"
                  element={<Shop />}
                />

                <Route
                  path="/categories"
                  element={<ShopCategories />}
                />

                <Route
                  path="/product/:id"
                  element={<ProductDetails />}
                />

                <Route
                  path="/wishlist"
                  element={<Wishlist />}
                />

                <Route
                  path="/checkout"
                  element={<Checkout />}
                />

                <Route
                  path="/track"
                  element={<TrackOrder />}
                />

                <Route
                  path="/account"
                  element={<Account />}
                />

                <Route
                  path="/auth/callback"
                  element={<AuthCallback />}
                />

                <Route
                  path="/contact"
                  element={<Contact />}
                />

                <Route
                  path="/about"
                  element={<About />}
                />

                <Route
                  path="/faq"
                  element={<FAQ />}
                />

                <Route
                  path="/privacy"
                  element={<Policy type="privacy" />}
                />

                <Route
                  path="/returns"
                  element={<Policy type="returns" />}
                />

                <Route
                  path="/terms"
                  element={<Policy type="terms" />}
                />

              </Routes>

            </Layout>
          }
        />

        {/* =========================
            Admin Login
        ========================= */}

        <Route
          path="/admin/login"
          element={<Login />}
        />

        {/* =========================
            Protected Admin Area
        ========================= */}

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route
            path="profile"
            element={<Profile />}
          />

          {/* Dashboard
              Admin + Sales
          */}

          <Route
            index
            element={<Dashboard />}
          />

          {/* Products
              Admin + Sales
          */}

          <Route
            path="products"
            element={<Products />}
          />

          <Route
            path="products/new"
            element={<ProductForm />}
          />

          <Route
            path="products/:id"
            element={<ProductForm />}
          />

          {/* Categories
              Admin + Sales
          */}

          <Route
            path="categories"
            element={<Categories />}
          />

          {/* Orders
              Admin + Sales
          */}

          <Route
            path="orders"
            element={<Orders />}
          />

          <Route
            path="orders/:orderId"
            element={<OrderDetails />}
          />

          {/* =========================
              Admin Only
          ========================= */}

          <Route
            path="coupons"
            element={
              <AdminRoute adminOnly>
                <Coupons />
              </AdminRoute>
            }
          />

          <Route
            path="staff"
            element={
              <AdminRoute adminOnly>
                <Staff />
              </AdminRoute>
            }
          />

          <Route
            path="settings"
            element={
              <AdminRoute adminOnly>
                <Settings />
              </AdminRoute>
            }
          />

          {/* =========================
              Admin + Sales
          ========================= */}

          <Route
            path="profile"
            element={<Profile />}
          />

        </Route>

      </Routes>
    </>
  );
}

function App() {
  return (
    <div className="App">

      <AppProvider>

        <BrowserRouter>

          <AppRouter />

          <Toaster
            position="top-center"
            richColors
          />

        </BrowserRouter>

      </AppProvider>

    </div>
  );
}

export default App;