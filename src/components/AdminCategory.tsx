import { useState, useEffect } from "react";
import { API_URL } from "../config";

type Category = {
  id: string;
  name: string;
};

export const AdminCategory = () => {
  // State
  const [categories, setCategories] = useState<Category[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/categories`, {
        credentials: "include",
      });

      if (!res.ok) {
        console.error("Failed to fetch categories", res.status);
        setCategories([]);
        return;
      }

      const data = await res.json();
      console.log("Raw categories response:", data);

      const categoriesArray = Array.isArray(data)
        ? data
        : Array.isArray(data.categories)
          ? data.categories
          : [];

      setCategories(categoriesArray);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Add or Update
  const handleSave = async () => {
    if (!inputValue.trim()) {
      alert("Kategoriya nomini to'ldiring");
      return;
    }

    try {
      if (editingId) {
        // Update
        const res = await fetch(`${API_URL}/categories/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ name: inputValue }),
        });

        if (!res.ok) {
          const error = await res.text();
          alert(`Update failed: ${error}`);
          return;
        }

        setEditingId(null);
      } else {
        // Create — Changed URL from /create to /categories
        const res = await fetch(`${API_URL}/categories/create`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ name: inputValue }),
        });

        if (!res.ok) {
          const error = await res.text();
          alert(`Add failed: ${error}`);
          return;
        }
      }

      setInputValue("");
      await fetchCategories(); // Refresh list
    } catch (err) {
      console.error("Error saving category:", err);
      alert("Network error. Check console.");
    }
  };

  // Edit
  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setInputValue(category.name);
  };

  // Delete
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this category?")) {
      return;
    }

    try {
      const res = await fetch(`${API_URL}/categories/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        await fetchCategories();
      } else {
        console.error("Failed to delete category", res.status);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <section className="flex items-center justify-center py-8 px-4 sm:py-10">
      <div className="bg-[#fff4f7] rounded-xl shadow-lg w-full max-w-[600px] p-6 sm:p-8">
        <h2 className="text-xl sm:text-2xl font-bold mb-6 text-black text-center sm:text-left">
          Manage Categories
        </h2>

        {/* Add/Edit Form */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={
              editingId ? "Edit category name..." : "New category name..."
            }
            className="flex-1 border border-[#e7d6e0] rounded-lg py-2 px-4 bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#f2b5d4] text-sm sm:text-base"
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
          />
          <button
            onClick={handleSave}
            disabled={!inputValue.trim()}
            className="bg-[#f2b5d4] hover:bg-[#e7a3c4] disabled:bg-gray-300 disabled:cursor-not-allowed text-black font-semibold py-2 px-5 sm:px-6 rounded-lg shadow transition whitespace-nowrap text-sm sm:text-base"
          >
            {editingId ? "Update" : "+ Add"}
          </button>
        </div>

        {/* Category List */}
        <div className="bg-white rounded-lg shadow border border-[#f0e5ef] overflow-hidden">
          {/* Header - Hidden on mobile */}
          <div className="hidden sm:flex bg-[#fdf6f9] border-b border-[#f0e5ef] font-semibold text-black px-6 py-3">
            <div className="w-3/4">Name</div>
            <div className="w-1/4">Actions</div>
          </div>

          {/* Mobile-friendly List (Card Style on small screens) */}
          <div className="sm:hidden divide-y divide-[#f0e5ef]">
            {loading ? (
              <div className="px-4 py-4 text-center text-gray-500">Loading...</div>
            ) : categories.length === 0 ? (
              <div className="px-4 py-4 text-center text-gray-500">No categories found.</div>
            ) : (
              categories.map((category) => (
                <div
                  key={category.id}
                  className="p-4 hover:bg-[#fff7fa] transition"
                >
                  <div className="font-medium text-black mb-2">{category.name}</div>
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => handleEdit(category)}
                      className="text-xs bg-[#fdf6f9] hover:bg-[#ffe3f0] text-black px-3 py-1 rounded transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="text-xs bg-[#ffeef0] hover:bg-red-200 text-[#e57373] px-3 py-1 rounded transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop Table */}
          <div className="hidden sm:block divide-y divide-[#f0e5ef]">
            {loading ? (
              <div className="px-6 py-4 text-center text-gray-500">Loading...</div>
            ) : categories.length === 0 ? (
              <div className="px-6 py-4 text-center text-gray-500">No categories found.</div>
            ) : (
              categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center px-6 py-4 hover:bg-[#fff7fa] transition"
                >
                  <div className="w-3/4 text-black font-medium truncate">
                    {category.name}
                  </div>
                  <div className="w-1/4 flex gap-x-2 sm:gap-x-3">
                    <button
                      onClick={() => handleEdit(category)}
                      className="text-sm bg-[#fdf6f9] hover:bg-[#ffe3f0] text-black px-3 py-1 rounded transition"
                      title="Edit"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="text-sm bg-[#ffeef0] hover:bg-red-200 text-[#e57373] px-3 py-1 rounded transition"
                      title="Delete"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
