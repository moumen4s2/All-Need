import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";

export default function Dashboard() {

    const [data, setData] = useState({
        products: 0,
        orders: 0,
        categories: 0,
        newsletter: 0,
        messages: 0,
        latest_orders: []
    });

    useEffect(() => {
        load();
    }, []);

    async function load() {

        try {

            const res = await api.get("/admin/dashboard");

            setData(res.data);

        } catch (err) {

            console.error(err);

        }

    }

    function badge(status) {

        switch (status) {

            case "Delivered":
                return "bg-green-100 text-green-700";

            case "Processing":
                return "bg-blue-100 text-blue-700";

            case "Shipped":
                return "bg-purple-100 text-purple-700";

            case "Cancelled":
                return "bg-red-100 text-red-700";

            default:
                return "bg-yellow-100 text-yellow-700";

        }

    }

    return (

        <div>

            <h1 className="text-4xl font-bold mb-8">
                Dashboard
            </h1>

            <div className="grid md:grid-cols-5 gap-6 mb-10">

                <Card
                    title="Products"
                    value={data.products}
                />

                <Card
                    title="Orders"
                    value={data.orders}
                />

                <Card
                    title="Categories"
                    value={data.categories}
                />

                <Card
                    title="Newsletter"
                    value={data.newsletter}
                />

                <Card
                    title="Messages"
                    value={data.messages}
                />

            </div>

            <div className="bg-white rounded-xl shadow">

                <div className="flex justify-between items-center p-6 border-b">

                    <h2 className="text-2xl font-bold">
                        Latest Orders
                    </h2>

                    <Link
                        to="/admin/orders"
                        className="text-pink-600 font-semibold"
                    >
                        View All
                    </Link>

                </div>

                <table className="w-full">

                    <thead>

                        <tr className="border-b">

                            <th className="p-4 text-left">
                                Order
                            </th>

                            <th className="p-4 text-left">
                                Customer
                            </th>

                            <th className="p-4 text-left">
                                Total
                            </th>

                            <th className="p-4 text-left">
                                Status
                            </th>

                            <th className="p-4 text-left">
                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        {data.latest_orders.map(order => (

                            <tr
                                key={order.order_id}
                                className="border-b"
                            >

                                <td className="p-4 font-medium">
                                    {order.order_id}
                                </td>

                                <td className="p-4">
                                    {order.customer_name}
                                </td>

                                <td className="p-4">
                                    AED {order.total}
                                </td>

                                <td className="p-4">

                                    <span
                                        className={`px-3 py-1 rounded-full text-sm ${badge(order.status)}`}
                                    >
                                        {order.status}
                                    </span>

                                </td>

                                <td className="p-4">

                                    <Link
                                        to={`/admin/orders/${order.order_id}`}
                                        className="text-pink-600 font-medium"
                                    >
                                        View
                                    </Link>

                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>

        </div>

    );

}

function Card({ title, value }) {

    return (

        <div className="bg-white rounded-xl shadow p-6">

            <p className="text-gray-500">
                {title}
            </p>

            <h2 className="text-4xl font-bold mt-3">
                {value}
            </h2>

        </div>

    );

}