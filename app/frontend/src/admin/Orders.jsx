import { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function Orders() {

    const [orders, setOrders] = useState([]);

    useEffect(() => {
        loadOrders();
    }, []);

    async function loadOrders() {
        const res = await api.get("/admin/orders");
        setOrders(res.data);
    }

    async function updateStatus(orderId, status) {

        await api.put(`/admin/orders/${orderId}`, {
            status,
        });

        loadOrders();
    }

    return (
        <div>

            <h1 className="text-4xl font-bold mb-8">
                Orders
            </h1>

            <div className="bg-white rounded-xl shadow overflow-x-auto">

                <table className="w-full">

                    <thead>

                        <tr className="border-b bg-gray-50">

                            <th className="p-4 text-left">Order</th>
                            <th className="p-4 text-left">Customer</th>
                            <th className="p-4 text-left">Total</th>
                            <th className="p-4 text-left">Status</th>
                            <th className="p-4 text-left">Date</th>
                            <th className="p-4 text-left">Action</th>

                        </tr>

                    </thead>

                    <tbody>

                        {orders.map(order => (

                            <tr
                                key={order.order_id}
                                className="border-b"
                            >

                                <td className="p-4">
                                    {order.order_id}
                                </td>

                                <td className="p-4">
                                    <div className="font-semibold">
                                        {order.customer_name}
                                    </div>

                                    <div className="text-sm text-gray-500">
                                        {order.email}
                                    </div>
                                </td>

                                <td className="p-4">
                                    AED {order.total}
                                </td>

                                <td className="p-4">

                                    <span className="px-3 py-1 rounded-full bg-pink-100 text-pink-700">

                                        {order.status}

                                    </span>

                                </td>

                                <td className="p-4">
                                    {new Date(order.created_at).toLocaleDateString()}
                                </td>

                                <td className="p-4">

                                    <select
                                        value={order.status}
                                        onChange={(e) =>
                                            updateStatus(
                                                order.order_id,
                                                e.target.value
                                            )
                                        }
                                        className="border rounded-lg p-2"
                                    >

                                        <option value="processing">
                                            Processing
                                        </option>

                                        <option value="shipped">
                                            Shipped
                                        </option>

                                        <option value="out_for_delivery">
                                            Out for Delivery
                                        </option>

                                        <option value="delivered">
                                            Delivered
                                        </option>

                                    </select>

                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>

        </div>
    );

}