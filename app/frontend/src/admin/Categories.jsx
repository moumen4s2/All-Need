import { useEffect, useState } from "react";
import { api } from "../api";

export default function Categories() {

    const [categories, setCategories] = useState([]);
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");

    useEffect(() => {
        loadCategories();
    }, []);

    async function loadCategories() {

        const res = await api.get("/admin/categories");
        setCategories(res.data);

    }

    async function addCategory(e) {

        e.preventDefault();

        await api.post("/admin/categories", {
            name,
            slug
        });

        setName("");
        setSlug("");

        loadCategories();

    }

    async function removeCategory(slug) {

        if (!window.confirm("Delete this category?"))
            return;

        await api.delete(`/admin/categories/${slug}`);

        loadCategories();

    }

    return (

        <div>

            <h1 className="text-4xl font-bold mb-8">
                Categories
            </h1>

            <form
                onSubmit={addCategory}
                className="flex gap-4 mb-8"
            >

                <input
                    placeholder="Category Name"
                    value={name}
                    onChange={(e)=>setName(e.target.value)}
                    className="border rounded-lg p-3 flex-1"
                />

                <input
                    placeholder="Slug"
                    value={slug}
                    onChange={(e)=>setSlug(e.target.value)}
                    className="border rounded-lg p-3 flex-1"
                />

                <button
                    className="bg-pink-600 text-white px-6 rounded-lg"
                >
                    Add
                </button>

            </form>

            <div className="bg-white rounded-xl shadow">

                <table className="w-full">

                    <thead>

                        <tr className="border-b">

                            <th className="p-4 text-left">
                                Name
                            </th>

                            <th className="p-4 text-left">
                                Slug
                            </th>

                            <th className="p-4">
                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        {categories.map(category=>(

                            <tr
                                key={category.slug}
                                className="border-b"
                            >

                                <td className="p-4">
                                    {category.en}
                                </td>

                                <td className="p-4">
                                    {category.slug}
                                </td>

                                <td className="p-4 text-right">

                                    <button
                                        onClick={()=>removeCategory(category.slug)}
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