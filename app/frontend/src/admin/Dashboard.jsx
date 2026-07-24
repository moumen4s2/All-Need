import React from "react";

export default function Dashboard() {

  return (

    <div>

      <h1 className="text-4xl font-bold mb-8">
        Dashboard
      </h1>

      <div className="grid grid-cols-4 gap-6">

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-gray-500">
            Products
          </h2>

          <p className="text-3xl font-bold mt-3">
            --
          </p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-gray-500">
            Orders
          </h2>

          <p className="text-3xl font-bold mt-3">
            --
          </p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-gray-500">
            Categories
          </h2>

          <p className="text-3xl font-bold mt-3">
            --
          </p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-gray-500">
            Coupons
          </h2>

          <p className="text-3xl font-bold mt-3">
            --
          </p>
        </div>

      </div>

    </div>

  );

}