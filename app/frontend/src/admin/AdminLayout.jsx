import { Outlet, NavLink } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-slate-100 flex">

      <aside className="w-64 bg-slate-900 text-white p-6">

        <h1 className="text-3xl font-bold mb-10">
          AllNeeds
        </h1>

        <nav className="flex flex-col gap-3">

          <NavLink
            to="/admin"
            end
            className="px-4 py-3 rounded-lg hover:bg-slate-700"
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/admin/products"
            className="px-4 py-3 rounded-lg hover:bg-slate-700"
          >
            Products
          </NavLink>

          <NavLink
            to="/admin/categories"
            className="px-4 py-3 rounded-lg hover:bg-slate-700"
          >
            Categories
          </NavLink>

          <NavLink
            to="/admin/orders"
            className="px-4 py-3 rounded-lg hover:bg-slate-700"
          >
            Orders
          </NavLink>

          <NavLink
            to="/admin/coupons"
            className="px-4 py-3 rounded-lg hover:bg-slate-700"
          >
            Coupons
          </NavLink>

        </nav>

      </aside>

      <main className="flex-1 p-8">

        <Outlet />

      </main>

    </div>
  );
}