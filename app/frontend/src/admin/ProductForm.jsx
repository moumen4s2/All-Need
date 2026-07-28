import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useNavigate, useParams } from "react-router-dom";

export default function ProductForm() {

    const navigate = useNavigate();
    const { id } = useParams();

    const [categories, setCategories] = useState([]);

    const [form, setForm] = useState({
        id: "",
        name: "",
        name_ar: "",
        category_id: "",
        price: "",
        old_price: "",
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
        loadCategories();

        if (id) {
            loadProduct();
        }
    }, [id]);

    async function loadCategories() {
        try {
            const res = await api.get("/categories");
            setCategories(res.data);
        } catch (err) {
            console.error(err);
        }
    }

    async function loadProduct() {
        try {
            const res = await api.get(`/products/${id}`);

            setForm({
                ...res.data,
                category_id: res.data.category_id ?? ""
            });

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
                        ? (value === "" ? "" : Number(value))
                        : value
        }));

    }

    async function save(e) {

        e.preventDefault();

        const data = {
            ...form,
            old_price:
                form.old_price === ""
                    ? null
                    : Number(form.old_price)
        };

        try {

            if (id) {

                await api.put(
                    `/admin/products/${id}`,
                    data
                );

            } else {

                await api.post(
                    "/admin/products",
                    data
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
                    placeholder="Product Name"
                    onChange={update}
                    className="w-full border rounded-lg p-3"
                />

                <input
                    name="name_ar"
                    value={form.name_ar}
                    placeholder="Arabic Product Name"
                    onChange={update}
                    className="w-full border rounded-lg p-3"
                />

                {/* Category */}

                <select
                    name="category_id"
                    value={form.category_id}
                    onChange={update}
                    className="w-full border rounded-lg p-3"
                >

                    <option value="">
                        Select Category
                    </option>

                    {categories.map(cat => (

                        <option
                            key={cat.id}
                            value={cat.id}
                        >
                            {cat.name}
                        </option>

                    ))}

                </select>

                <input
                    type="number"
                    name="price"
                    value={form.price}
                    placeholder="Price (AED)"
                    onChange={update}
                    className="w-full border rounded-lg p-3"
                />

                <input
                    type="number"
                    name="old_price"
                    value={form.old_price}
                    placeholder="Old Price (optional)"
                    onChange={update}
                    className="w-full border rounded-lg p-3"
                />

                {/* Image */}

                <div className="flex gap-2">

                    <input
                        name="image"
                        value={form.image}
                        placeholder="https://example.com/image.jpg"
                        onChange={update}
                        className="flex-1 border rounded-lg p-3"
                    />

                    <button
                        type="button"
                        className="border rounded-lg px-4 text-xl hover:bg-gray-100"
                        onClick={() => {
                            const url = prompt("Paste image URL");

                            if (url) {
                                setForm(prev => ({
                                    ...prev,
                                    image: url
                                }));
                            }
                        }}
                    >
                        ⋯
                    </button>

                </div>

                {form.image && (

                    <img
                        src={form.image}
                        alt=""
                        className="w-40 rounded border"
                    />

                )}

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