import { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function Categories() {

    const [categories, setCategories] = useState([]);

    const [form, setForm] = useState({
        name: "",
        image: ""
    });

    useEffect(() => {
        loadCategories();
    }, []);

    async function loadCategories() {
        const res = await api.get("/admin/categories");
        setCategories(res.data);
    }

    function update(e) {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    }

    async function addCategory(e) {

        e.preventDefault();

        await api.post("/admin/categories", form);

        setForm({
            name: "",
            image: ""
        });

        loadCategories();
    }

    async function removeCategory(id) {

        if (!window.confirm("Delete this category?"))
            return;

        await api.delete(`/admin/categories/${id}`);

        loadCategories();
    }

    return (

        <div>

            <h1 className="text-4xl font-bold mb-8">
                Categories
            </h1>

            <form
                onSubmit={addCategory}
                className="space-y-4 mb-8"
            >

                <input
                    name="name"
                    placeholder="Category Name"
                    value={form.name}
                    onChange={update}
                    className="border rounded-lg p-3 w-full"
                />

                <div className="flex gap-2">

                    <input
                        name="image"
                        placeholder="Category Image URL"
                        value={form.image}
                        onChange={update}
                        className="border rounded-lg p-3 flex-1"
                    />

                    <button
                        type="button"
                        className="border rounded-lg px-4 hover:bg-gray-100"
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
                        className="w-32 rounded border"
                    />
                )}

                <button
                    className="bg-pink-600 text-white px-6 py-3 rounded-lg"
                >
                    Add Category
                </button>

            </form>

            <div className="bg-white rounded-xl shadow">

                <table className="w-full">

                    <thead>

                        <tr className="border-b">

                            <th className="p-4 text-left">
                                Image
                            </th>

                            <th className="p-4 text-left">
                                Name
                            </th>

                            <th className="p-4">
                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        {categories.map(category => (

                            <tr
                                key={category.id}
                                className="border-b"
                            >

                                <td className="p-4">

                                    {category.image && (

                                        <img
                                            src={category.image}
                                            alt=""
                                            className="w-16 h-16 object-cover rounded"
                                        />

                                    )}

                                </td>

                                <td className="p-4">
                                    {category.name}
                                </td>

                                <td className="p-4 text-right">

                                    <button
                                        onClick={() => removeCategory(category.id)}
                                        className="text-red-600"
                                    >
                                        Delete
                                    </button>

                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>

        </div>

    );

}