import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../lib/api";

export default function OrderDetails() {

    const { orderId } = useParams();

    const [order, setOrder] = useState(null);

    const [status, setStatus] = useState("");

    useEffect(() => {

        load();

    }, []);

    async function load() {

        const res = await api.get(
            `/admin/orders/${orderId}`
        );

        setOrder(res.data);

        setStatus(res.data.status);

    }

    async function save() {

        await api.put(
            `/admin/orders/${orderId}`,
            {
                status
            }
        );

        alert("Order updated");

        load();

    }

    if (!order) {

        return <div>Loading...</div>;

    }

    return (

        <div className="space-y-8">

            <h1 className="text-4xl font-bold">

                Order {order.order_id}

            </h1>

            <div className="bg-white rounded-xl shadow p-6">

                <h2 className="text-2xl font-semibold mb-5">

                    Customer

                </h2>

                <div className="grid grid-cols-2 gap-5">

                    <div>

                        <b>Name</b>

                        <p>{order.customer_name}</p>

                    </div>

                    <div>

                        <b>Email</b>

                        <p>{order.email}</p>

                    </div>

                    <div>

                        <b>Phone</b>

                        <p>{order.phone}</p>

                    </div>

                    <div>

                        <b>Emirate</b>

                        <p>{order.emirate}</p>

                    </div>

                    <div className="col-span-2">

                        <b>Address</b>

                        <p>{order.address}</p>

                    </div>

                </div>

            </div>

            <div className="bg-white rounded-xl shadow p-6">

                <h2 className="text-2xl font-semibold mb-5">

                    Payment

                </h2>

                <p>

                    <b>Subtotal:</b> AED {order.subtotal}

                </p>

                <p>

                    <b>Discount:</b> AED {order.discount}

                </p>

                <p>

                    <b>Shipping:</b> AED {order.shipping}

                </p>

                <p className="text-xl mt-3 font-bold">

                    Total: AED {order.total}

                </p>

            </div>

            <div className="bg-white rounded-xl shadow p-6">

                <h2 className="text-2xl font-semibold mb-5">

                    Status

                </h2>

                <select

                    value={status}

                    onChange={(e) => setStatus(e.target.value)}

                    className="border rounded-lg p-3"

                >

                    <option value="processing">

                        Processing

                    </option>

                    <option value="shipped">

                        Shipped

                    </option>

                    <option value="out_for_delivery">

                        Out For Delivery

                    </option>

                    <option value="delivered">

                        Delivered

                    </option>

                </select>

                <button

                    onClick={save}

                    className="ml-5 bg-pink-600 text-white px-5 py-3 rounded-lg"

                >

                    Save

                </button>

            </div>

        </div>

    );

}