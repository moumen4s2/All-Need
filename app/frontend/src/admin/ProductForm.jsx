import { useEffect, useState } from "react";
import { api } from "../api";
import { useNavigate, useParams } from "react-router-dom";

export default function ProductForm() {

    const navigate = useNavigate();
    const { id } = useParams();

    const [form, setForm] = useState({
        id: "",
        name: "",
        name_ar: "",
        category: "",
        price: 0,
        old_price: 0,
        image: "",
        description: "",
        description_ar: "",
        best_seller: false,
        new_arrival: false,
        in_stock: true,
        rating: 5,
        review_count: 0
    });

    useEffect(() => {

        if (id) {
            loadProduct();
        }

    }, [id]);

    async function loadProduct() {

        try {

            const res = await api.get(`/products/${id}`);
            setForm(res.data);

        } catch {

            alert("Product not found");
            navigate("/admin/products");

        }

    }

    function update(e) {

        const { name, value, type, checked } = e.target;

        setForm(prev => ({
            ...prev,
            [name]:
                type === "checkbox"
                    ? checked
                    : type === "number"
                        ? Number(value)
                        : value
        }));

    }

    async function save(e) {

        e.preventDefault();

        try {

            if (id) {

                await api.put(
                    `/admin/products/${id}`,
                    form
                );

            } else {

                await api.post(
                    "/admin/products",
                    form
                );

            }

            navigate("/admin/products");

        } catch (err) {

            alert(
                err.response?.data?.detail ||
                "Something went wrong."
            );

        }

    }

    return (

        <div className="max-w-3xl">

            <h1 className="text-4xl font-bold mb-8">
                {id ? "Edit Product" : "Add Product"}
            </h1>

            <form
                onSubmit={save}
                className="space-y-5"
            >

                {!id && (

                    <input
                        name="id"
                        value={form.id}
                        placeholder="Product ID"
                        onChange={update}
                        className="w-full border rounded-lg p-3"
                    />

                )}

                <input
                    name="name"
                    value={form.name}
                    placeholder="Name"
                    onChange={update}
                    className="w-full border rounded-lg p-3"
                />

                <input
                    name="name_ar"
                    value={form.name_ar}
                    placeholder="Arabic Name"
                    onChange={update}
                    className="w-full border rounded-lg p-3"
                />

                <input
                    name="category"
                    value={form.category}
                    placeholder="Category"
                    onChange={update}
                    className="w-full border rounded-lg p-3"
                />

                <input
                    name="price"
                    type="number"
                    value={form.price}
                    onChange={update}
                    className="w-full border rounded-lg p-3"
                />

                <input
                    name="old_price"
                    type="number"
                    value={form.old_price}
                    onChange={update}
                    className="w-full border rounded-lg p-3"
                />

                <input
                    name="image"
                    value={form.image}
                    placeholder="Image URL"
                    onChange={update}
                    className="w-full border rounded-lg p-3"
                />

                <textarea
                    name="description"
                    value={form.description}
                    placeholder="Description"
                    onChange={update}
                    className="w-full border rounded-lg p-3"
                />

                <textarea
                    name="description_ar"
                    value={form.description_ar}
                    placeholder="Arabic Description"
                    onChange={update}
                    className="w-full border rounded-lg p-3"
                />

                <label className="flex gap-3">

                    <input
                        type="checkbox"
                        name="best_seller"
                        checked={form.best_seller}
                        onChange={update}
                    />

                    Best Seller

                </label>

                <label className="flex gap-3">

                    <input
                        type="checkbox"
                        name="new_arrival"
                        checked={form.new_arrival}
                        onChange={update}
                    />

                    New Arrival

                </label>

                <label className="flex gap-3">

                    <input
                        type="checkbox"
                        name="in_stock"
                        checked={form.in_stock}
                        onChange={update}
                    />

                    In Stock

                </label>

                <button
                    className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-lg"
                >
                    {id ? "Update Product" : "Save Product"}
                </button>

            </form>

        </div>

    );

}