import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoFlowerOutline } from "react-icons/io5";
import { BiCategory } from "react-icons/bi";
import { MdBorderColor } from "react-icons/md";
import { AdminCategory } from "./AdminCategory";
import { AdminOrders } from "./AdminOrders";
import { API_URL } from "../config";

type Category = {
  id: string;
  name: string;
};

type Flower = {
  id: string;
  name: string;
  smell: string;
  flowerSize: string;
  height: string;
  imgUrl?: string;
  categoryId: string;
  price: string;
};

// Create base URL for static files (remove /api from API_URL)
const BASE_URL = API_URL.replace('/api', '');
console.log(BASE_URL)

export const AdminPanel = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<
    "flowers" | "categories" | "orders"
  >("flowers");
  const [formData, setFormData] = useState<
    Omit<Flower, "id"> & { imageFile: File | null }
  >({
    name: "",
    smell: "",
    flowerSize: "",
    height: "",
    imageFile: null,
    categoryId: "",
    price: "",
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [flowers, setFlowers] = useState<Flower[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [flowerIdToDelete, setFlowerIdToDelete] = useState<string | null>(null);

  // Helper function to construct image URL
  const getImageUrl = (imgUrl: string) => {
    if (!imgUrl) return '';

    // If imgUrl already starts with 'images/', use it as is
    // If it's just a filename, prepend 'images/'
    const imagePath = imgUrl.startsWith('images/') ? imgUrl : `images/${imgUrl}`;

    // Construct full URL
    return `${BASE_URL}/${imagePath}`;
  };

  // Log active tab changes
  useEffect(() => {
    console.log('Active tab changed to:', activeTab);
  }, [activeTab]);

  // Handle Escape key for modal close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showConfirmDialog) {
        cancelDelete();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [showConfirmDialog]);

  // Authentication check - Always require fresh login for admin access
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Always clear existing auth and force login for admin panel access
        console.log("Admin panel access - requiring fresh login");
        setIsAuthenticated(false);

        // Clear any existing auth state to force fresh login
        await fetch(`${API_URL}/auth/logout`, {
          method: "POST",
          credentials: "include",
        });

        document.cookie =
          "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        navigate("/admin-login", {
          replace: true,
          state: { message: "Please login to access admin panel" },
        });
      } catch (error) {
        console.error("Auth cleanup failed:", error);
        setIsAuthenticated(false);
        navigate("/admin-login", { replace: true });
      }
    };

    // Only run auth check if we don't have a fresh login flag
    const hasRecentLogin =
      sessionStorage.getItem("adminLoginSuccess") === "true";

    if (!hasRecentLogin) {
      checkAuth();
    } else {
      // User has fresh login, verify their authentication
      verifyAuthentication();
    }
  }, [navigate]);

  const verifyAuthentication = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/check`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.authenticated === true) {
          setIsAuthenticated(true);
          // Clear the login success flag after successful verification
          sessionStorage.removeItem("adminLoginSuccess");
        } else {
          setIsAuthenticated(false);
          navigate("/admin-login", { replace: true });
        }
      } else {
        setIsAuthenticated(false);
        navigate("/admin-login", { replace: true });
      }
    } catch (error) {
      console.error("Auth verification failed:", error);
      setIsAuthenticated(false);
      navigate("/admin-login", { replace: true });
    }
  };

  // Load initial data only after authentication is confirmed
  useEffect(() => {
    if (isAuthenticated === true) {
      fetchCategories();
      fetchFlowers();
    }
  }, [isAuthenticated]);

  // Enhanced API call function with better error handling
  const makeAuthenticatedRequest = async (
    url: string,
    options: RequestInit = {}
  ) => {
    try {
      console.log(`Making request to: ${url}`, { options });
      const response = await fetch(url, {
        ...options,
        credentials: "include",
        headers: {
          ...options.headers,
          // Don't set Content-Type for FormData, let browser handle it
        },
      });

      console.log(`Response status for ${url}:`, response.status);

      if (response.status === 401 || response.status === 403) {
        console.log(
          "Authentication failed during request - redirecting to login"
        );
        setIsAuthenticated(false);
        document.cookie =
          "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        navigate("/admin-login", { replace: true });
        throw new Error("Authentication failed");
      }

      return response;
    } catch (error) {
      console.error(`Request failed for ${url}:`, error);
      throw error;
    }
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      console.log('Fetching categories...');
      const res = await makeAuthenticatedRequest(
        `${API_URL}/categories`
      );

      if (res.ok) {
        const data = await res.json();
        console.log('Categories response data:', data);
        // Handle both array response and object with categories property
        let categoriesArray = [];
        if (Array.isArray(data)) {
          categoriesArray = data;
        } else if (data && data.categories && Array.isArray(data.categories)) {
          categoriesArray = data.categories;
        }
        console.log('Processed categories array:', categoriesArray);
        setCategories(categoriesArray);
        // Set default category if none is selected and categories exist
        if (categoriesArray.length > 0 && !formData.categoryId) {
          setFormData((prevValue) => ({
            ...prevValue,
            categoryId: categoriesArray[0].id,
          }));
        }
      } else {
        const errorText = await res.text();
        console.error("Failed to fetch categories:", {
          status: res.status,
          statusText: res.statusText,
          error: errorText
        });
        setCategories([]);
        alert(`Failed to load categories: ${res.status} ${res.statusText}`);
      }
    } catch (err) {
      if (err instanceof Error && err.message !== "Authentication failed") {
        console.error("Error fetching categories:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchFlowers = async () => {
    try {
      console.log('Fetching flowers...');
      const res = await makeAuthenticatedRequest(
        `${API_URL}/flowers`
      );

      if (res.ok) {
        const data = await res.json();
        console.log('Flowers response data:', data);
        // Handle both array response and object with flowers property
        let flowersArray = [];
        if (Array.isArray(data)) {
          flowersArray = data;
        } else if (data && data.flowers && Array.isArray(data.flowers)) {
          flowersArray = data.flowers;
        }
        console.log('Processed flowers array:', flowersArray);
        setFlowers(flowersArray);
      } else {
        const errorText = await res.text();
        console.error("Failed to fetch flowers:", {
          status: res.status,
          statusText: res.statusText,
          error: errorText
        });
        setFlowers([]);
        alert(`Failed to load flowers: ${res.status} ${res.statusText}`);
      }
    } catch (err) {
      if (err instanceof Error && err.message !== "Authentication failed") {
        console.error("Error fetching flowers:", err);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear auth state and redirect regardless of logout API success
      setIsAuthenticated(false);
      document.cookie =
        "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      navigate("/", { replace: true });
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, imageFile: file }));
  };

  const handleSave = async () => {
    // Validate required fields
    if (!formData.name.trim() || !formData.price || !formData.categoryId) {
      alert("Please fill in all required fields (Name, Price, Category)");
      return;
    }

    // Validate price
    const priceValue = parseFloat(formData.price);
    if (isNaN(priceValue) || priceValue <= 0) {
      alert("Please enter a valid price greater than 0");
      return;
    }

    try {
      setLoading(true);

      if (editingId) {
        await handleUpdate();
      } else {
        const formDataToSend = new FormData();

        // Make sure all field names match your DTO exactly
        formDataToSend.append("name", formData.name.trim());
        formDataToSend.append("smell", formData.smell || "");
        formDataToSend.append("flowerSize", formData.flowerSize || ""); // Keep consistent
        formDataToSend.append("height", formData.height || "");
        formDataToSend.append("categoryId", formData.categoryId);
        formDataToSend.append("price", formData.price);

        if (formData.imageFile) {
          formDataToSend.append("image", formData.imageFile);
        }

        // Debug: Log what we're sending
        console.log("FormData contents:");
        for (const [key, value] of formDataToSend.entries()) {
          console.log(key, value);
        }

        const res = await fetch(`${API_URL}/flowers/create`, {
          method: "POST",
          credentials: 'include',
          body: formDataToSend,
        });

        if (res.ok) {
          console.log("Flower created successfully");
          await fetchFlowers();
          // Reset form
          setFormData({
            name: "",
            smell: "",
            flowerSize: "",
            height: "",
            imageFile: null,
            categoryId: categories.length > 0 ? categories[0].id : "",
            price: "",
          });
          // Reset file input
          const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
          if (fileInput) {
            fileInput.value = "";
          }
          alert("Flower added successfully!");
        } else {
          const errorText = await res.text();
          console.error("Failed to add flower:", res.status, errorText);

          // Try to parse error as JSON for better debugging
          try {
            const errorJson = JSON.parse(errorText);
            console.error("Parsed error:", errorJson);
            alert(`Failed to add flower: ${errorJson.message || errorText}`);
          } catch {
            alert(`Failed to add flower: ${res.status}. ${errorText}`);
          }
        }
      }
    } catch (error) {
      if (error instanceof Error && error.message !== "Authentication failed") {
        console.error("Error saving flower:", error);
        alert("An error occurred while saving the flower. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingId) return;

    const formDataToSend = new FormData();

    formDataToSend.append("name", formData.name);
    formDataToSend.append("price", formData.price);
    formDataToSend.append("category_id", formData.categoryId);
    formDataToSend.append("smell", formData.smell);
    formDataToSend.append("height", formData.height);
    formDataToSend.append("flowerSize", formData.flowerSize);
    if (formData.imageFile) {
      formDataToSend.append("image", formData.imageFile);
    }

    const res = await makeAuthenticatedRequest(
      `${API_URL}/flowers/${editingId}`,
      {
        method: "PUT",
        body: formDataToSend,
      }
    );

    if (res.ok) {
      const updated = await res.json();
      setFlowers(flowers.map((f) => (f.id === editingId ? updated : f)));
      setEditingId(null);
      setFormData({
        name: "",
        smell: "",
        flowerSize: "",
        height: "",
        imageFile: null,
        categoryId: categories.length > 0 ? categories[0].id : "",
        price: "",
      });
      // Reset file input
      const fileInput = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      if (fileInput) {
        fileInput.value = "";
      }
      alert("Flower updated successfully!");
    } else {
      const errorText = await res.text();
      console.error("Failed to update flower:", res.status, errorText);
      alert(`Failed to update flower: ${res.status}. Please try again.`);
    }
  };

  const handleEditClick = (flower: Flower) => {
    setFormData({
      name: flower.name,
      smell: flower.smell,
      flowerSize: flower.flowerSize,
      height: flower.height,
      imageFile: null,
      categoryId: flower.categoryId,
      price: flower.price,
    });
    setEditingId(flower.id);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      name: "",
      smell: "",
      flowerSize: "",
      height: "",
      imageFile: null,
      categoryId: categories.length > 0 ? categories[0].id : "",
      price: "",
    });
    // Reset file input
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleDelete = (id: string) => {
    setFlowerIdToDelete(id);
    setShowConfirmDialog(true);
  };

  const confirmDelete = async () => {
    if (!flowerIdToDelete) return;

    try {
      const res = await makeAuthenticatedRequest(
        `${API_URL}/flowers/${flowerIdToDelete}`,
        {
          method: "DELETE",
        }
      );

      if (res.ok) {
        setFlowers(flowers.filter((f) => f.id !== flowerIdToDelete));
        alert("Flower deleted successfully!");
      } else {
        const errorText = await res.text();
        console.error("Failed to delete flower:", res.status, errorText);
        alert(`Failed to delete flower: ${res.status}. Please try again.`);
      }
    } catch (error) {
      if (error instanceof Error && error.message !== "Authentication failed") {
        console.error("Error deleting flower:", error);
        alert("An error occurred while deleting the flower. Please try again.");
      }
    } finally {
      setShowConfirmDialog(false);
      setFlowerIdToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowConfirmDialog(false);
    setFlowerIdToDelete(null);
  };

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f6fa]">
        <div className="text-center">
          <div className="animate-pulse text-xl text-gray-600">
            Checking authentication...
          </div>
        </div>
      </div>
    );
  }

  // If not authenticated, don't render anything (redirect will happen)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <section className="min-h-screen flex items-center justify-center bg-[#f8f6fa] py-10 px-4 sm:px-6">
      <div className="flex rounded-xl shadow-lg bg-[#fff4f7] w-full max-w-[1000px] flex-col lg:flex-row">
        {/* Sidebar */}
        <aside className="w-full lg:w-1/3 min-w-[200px] bg-[#fdf6f9] rounded-t-xl lg:rounded-l-xl lg:rounded-tr-none p-6 sm:p-8 border-b lg:border-b-0 lg:border-r border-[#f0e5ef]">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold font-[Chillax] text-black">Admin Panel</h1>
            <button
              onClick={handleLogout}
              className="text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Logout
            </button>
          </div>
          <nav className="flex flex-col gap-y-3 sm:gap-y-4">
            {[
              { name: "Flowers", icon: IoFlowerOutline, tab: "flowers" },
              { name: "Categories", icon: BiCategory, tab: "categories" },
              { name: "Orders", icon: MdBorderColor, tab: "orders" },
            ].map((item) => (
              <button
                key={item.tab}
                className={`flex items-center gap-x-3 text-base sm:text-lg font-medium text-black hover:bg-[#ffe3f0] px-4 py-2.5 rounded transition ${activeTab === item.tab ? "bg-[#ffe3f0]" : ""
                  }`}
                onClick={() => setActiveTab(item.tab as any)}
              >
                <item.icon className="text-xl sm:text-2xl" /> {item.name}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 sm:p-8 lg:p-10 flex flex-col gap-y-6">
          {activeTab === "flowers" && (
            <>
              <h2 className="text-xl sm:text-2xl font-semibold mb-2 font-[Chillax] text-black">
                Welcome back, Admin!
              </h2>

              {loading && (
                <div className="text-center py-4">
                  <div className="text-gray-600">Loading...</div>
                </div>
              )}

              {/* Add/Edit Form */}
              <div className="bg-white p-5 sm:p-6 rounded-lg shadow border border-[#f0e5ef]">
                <h3 className="text-lg font-semibold mb-4 text-black">
                  {editingId ? "Edit Flower" : "Add New Flower"}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Red Rose"
                      className="w-full border border-[#e7d6e0] rounded py-2 px-3 bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#f2b5d4]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      Smell *
                    </label>
                    <select
                      value={formData.smell}
                      onChange={(e) =>
                        setFormData({ ...formData, smell: e.target.value })
                      }
                      className="w-full border border-[#e7d6e0] rounded py-2 px-3 bg-white text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#f2b5d4]"
                    >
                      <option value="">Select Smell Strength</option>
                      <option value="WEAK">weak</option>
                      <option value="AVERAGE">average</option>
                      <option value="STRONG">strong</option>
                      <option value="VERY_STRONG">very strong</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      Size
                    </label>
                    <input
                      type="text"
                      name="flowerSize"
                      value={formData.flowerSize}
                      onChange={handleChange}
                      placeholder="e.g. Medium"
                      className="w-full border border-[#e7d6e0] rounded py-2 px-3 bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#f2b5d4]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      Height
                    </label>
                    <input
                      type="text"
                      name="height"
                      value={formData.height}
                      onChange={handleChange}
                      placeholder="e.g. 60 cm"
                      className="w-full border border-[#e7d6e0] rounded py-2 px-3 bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#f2b5d4]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      Gul rasmi
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="w-full border border-[#e7d6e0] rounded py-2 px-3 bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#f2b5d4]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      Category * ({categories.length} available)
                    </label>
                    <select
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleChange}
                      className="w-full border border-[#e7d6e0] rounded py-2 px-3 bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#f2b5d4]"
                      required
                    >
                      <option value="">Select a category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    {categories.length === 0 && (
                      <div className="text-sm text-red-500 mt-1">
                        No categories available. Please add categories first.
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      Price *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="10.00"
                      className="w-full border border-[#e7d6e0] rounded py-2 px-3 bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#f2b5d4]"
                      required
                    />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleSave}
                    disabled={
                      loading ||
                      !formData.name.trim() ||
                      !formData.price ||
                      !formData.categoryId
                    }
                    className="bg-[#f2b5d4] hover:bg-[#e7a3c4] disabled:bg-gray-300 disabled:cursor-not-allowed text-black font-semibold py-2 px-6 rounded shadow transition text-center"
                  >
                    {loading
                      ? "Saving..."
                      : editingId
                        ? "Update Flower"
                        : "+ Add Flower"}
                  </button>
                  {editingId && (
                    <button
                      onClick={handleCancelEdit}
                      className="bg-gray-200 hover:bg-gray-300 text-black font-semibold py-2 px-6 rounded shadow transition text-center"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              {/* Flower List */}
              <div className="bg-white rounded-lg shadow border border-[#f0e5ef] overflow-hidden">
                {/* Header - Hidden on small screens, shown as labels inside rows */}
                <div className="hidden sm:flex bg-[#fdf6f9] border-b border-[#f0e5ef] font-semibold text-black px-6 py-3">
                  <div className="w-1/4">Flower</div>
                  <div className="w-1/4">Size / Smell</div>
                  <div className="w-1/4">Height</div>
                  <div className="w-1/4">Actions</div>
                </div>

                {/* Mobile-first scrollable wrapper for small screens */}
                <div className="sm:hidden">
                  {flowers.length === 0 ? (
                    <div className="px-4 py-4 text-center text-gray-500">No flowers added yet.</div>
                  ) : (
                    flowers.map((flower) => {
                      const imageUrl = flower.imgUrl ? getImageUrl(flower.imgUrl) : '';
                      console.log('Mobile - Flower:', flower.name, 'imgUrl:', flower.imgUrl, 'Final URL:', imageUrl);

                      return (
                        <div
                          key={flower.id}
                          className="border-b border-[#f0e5ef] p-4 hover:bg-[#fff7fa] transition"
                        >
                          <div className="flex items-center gap-x-3 mb-2">
                            {flower.imgUrl && (
                              <img
                                src={imageUrl}
                                alt={flower.name}
                                className="w-12 h-12 object-cover rounded-md"
                                onLoad={() => console.log('✅ Image loaded successfully:', imageUrl)}
                                onError={(e) => {
                                  console.error('❌ Image failed to load:', imageUrl);
                                  console.error('Error event:', e);
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            )}
                            <div>
                              <div className="font-medium text-black">{flower.name}</div>
                              <div className="text-sm text-gray-600">${flower.price}</div>
                            </div>
                          </div>
                          <div className="text-sm text-black mb-1">
                            <strong>Size:</strong> {flower.flowerSize || "–"}
                          </div>
                          <div className="text-sm text-black mb-1">
                            <strong>Smell:</strong> {flower.smell || "–"}
                          </div>
                          <div className="text-sm text-black mb-2">
                            <strong>Height:</strong> {flower.height || "–"}
                          </div>
                          <div className="flex gap-x-2">
                            <button
                              onClick={() => handleEditClick(flower)}
                              className="text-xs sm:text-sm bg-[#fdf6f9] hover:bg-[#ffe3f0] text-black px-3 py-1 rounded transition"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(flower.id)}
                              className="text-xs sm:text-sm bg-[#ffeef0] hover:bg-red-200 text-[#e57373] px-3 py-1 rounded transition"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>

                {/* Desktop Table */}
                <div className="hidden sm:block divide-y divide-[#f0e5ef]">
                  {flowers.length === 0 ? (
                    <div className="px-6 py-4 text-center text-gray-500">
                      No flowers added yet.
                    </div>
                  ) : (
                    flowers.map((flower) => {
                      const imageUrl = flower.imgUrl ? getImageUrl(flower.imgUrl) : '';
                      console.log('Desktop - Flower:', flower.name, 'imgUrl:', flower.imgUrl, 'Final URL:', imageUrl);

                      return (
                        <div
                          key={flower.id}
                          className="flex items-center px-6 py-4 hover:bg-[#fff7fa] transition"
                        >
                          <div className="w-1/4 flex items-center gap-x-3 text-black">
                            {flower.imgUrl && (
                              <img
                                src={imageUrl}
                                alt={flower.name}
                                className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-md"
                                onLoad={() => console.log('✅ Desktop image loaded successfully:', imageUrl)}
                                onError={(e) => {
                                  console.error('❌ Desktop image failed to load:', imageUrl);
                                  console.error('Error event:', e);
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            )}
                            <div>
                              <div className="font-medium">{flower.name}</div>
                              <div className="text-sm text-gray-600">${flower.price}</div>
                            </div>
                          </div>
                          <div className="w-1/4 text-black">
                            <div>{flower.flowerSize || "–"}</div>
                            <div className="text-sm text-gray-600">{flower.smell || "–"}</div>
                          </div>
                          <div className="w-1/4 text-black">{flower.height || "–"}</div>
                          <div className="w-1/4 flex gap-x-2">
                            <button
                              onClick={() => handleEditClick(flower)}
                              className="text-sm bg-[#fdf6f9] hover:bg-[#ffe3f0] text-black px-3 py-1 rounded transition"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(flower.id)}
                              className="text-sm bg-[#ffeef0] hover:bg-red-200 text-[#e57373] px-3 py-1 rounded transition"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </>
          )}

          {activeTab === "categories" && <AdminCategory />}
          {activeTab === "orders" && <AdminOrders />}

          {/* Confirm Dialog */}
          {showConfirmDialog && (
            <div
              className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={cancelDelete}
            >
              <div
                className="bg-white rounded-lg shadow-xl p-5 sm:p-6 w-full max-w-xs sm:max-w-sm transform transition-all duration-200 scale-100"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Confirm Deletion</h3>
                <p className="text-gray-600 mb-5 text-sm">
                  Are you sure you want to delete this flower? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-x-2">
                  <button
                    onClick={cancelDelete}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-1.5 px-4 rounded transition text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="bg-red-500 hover:bg-red-600 text-white font-medium py-1.5 px-4 rounded transition text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </section>
  );
};
