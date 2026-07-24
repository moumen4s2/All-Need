import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";

export default function Products() {

    const [products, setProducts] = useState([]);

    useEffect(() => {
        loadProducts();
    }, []);

    async function loadProducts() {

        try {

            const res = await api.get("/admin/products");
            setProducts(res.data);

        } catch {

            alert("Failed to load products.");

        }

    }

    async function remove(id) {

        if (!window.confirm("Delete this product?"))
            return;

        try {

            await api.delete(`/admin/products/${id}`);

            loadProducts();

        } catch (err) {

            alert(
                err.response?.data?.detail ||
                "Delete failed."
            );

        }

    }

    return (

        <div>

            <div className="flex justify-between items-center mb-8">

                <h1 className="text-4xl font-bold">
                    Products
                </h1>

                <Link
                    to="/admin/products/new"
                    className="bg-pink-600 hover:bg-pink-700 text-white px-5 py-3 rounded-lg"
                >
                    Add Product
                </Link>

            </div>

            <table className="w-full bg-white rounded-xl shadow">

                <thead>

                    <tr className="border-b">

                        <th className="p-4">Image</th>
                        <th className="p-4">Name</th>
                        <th className="p-4">Category</th>
                        <th className="p-4">Price</th>
                        <th className="p-4">Stock</th>
                        <th className="p-4">Actions</th>

                    </tr>

                </thead>

                <tbody>

                    {products.map(product => (

                        <tr
                            key={product.id}
                            className="border-b"
                        >

                            <td className="p-4">

                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-20 h-20 object-cover rounded-lg"
                                />

                            </td>

                            <td className="p-4">

                                <Link
                                    to={`/admin/products/${product.id}`}
                                    className="font-semibold text-pink-600 hover:underline"
                                >
                                    {product.name}
                                </Link>

                            </td>

                            <td className="p-4">
                                {product.category}
                            </td>

                            <td className="p-4">
                                AED {product.price}
                            </td>

                            <td className="p-4">

                                {product.in_stock
                                    ? "✅ In Stock"
                                    : "❌ Out of Stock"}

                            </td>

                            <td className="p-4">

                                <div className="flex gap-4">

                                    <Link
                                        to={`/admin/products/${product.id}`}
                                        className="text-blue-600 hover:underline"
                                    >
                                        Edit
                                    </Link>

                                    <button
                                        onClick={() => remove(product.id)}
                                        className="text-red-600 hover:underline"
                                    >
                                        Delete
                                    </button>

                                </div>

                            </td>

                        </tr>

                    ))}

                </tbody>

            </table>

        </div>

    );

}