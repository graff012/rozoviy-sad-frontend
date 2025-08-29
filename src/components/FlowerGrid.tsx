import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { API_URL } from "../config";

interface Flower {
  id: string;
  name: string;
  smell: string;
  flowerSize: string;
  height: string;
  imgUrl?: string | null;
  categoryId: string;
  price: string;
  isLiked?: boolean;
}

interface Category {
  id: string;
  name: string;
}

interface FlowerGridProps {
  searchTerm: string;
  selectedCategoryId?: string; // empty or undefined means All
}

const FlowerGrid = ({ searchTerm, selectedCategoryId }: FlowerGridProps) => {
  // Map enum/string smell values to Russian labels for UI only
  const formatSmell = (value: string): string => {
    if (!value) return "";
    const key = value.toUpperCase().replace(/\s+/g, "_");
    const map: Record<string, string> = {
      WEAK: "Слабый",
      AVERAGE: "Средний",
      STRONG: "Сильный",
      VERY_STRONG: "Очень сильный",
      // Common fallbacks
      LOW: "Слабый",
      MEDIUM: "Средний",
      HIGH: "Сильный",
    };
    return map[key] || value; // default to original if unknown
  };

  const [flowers, setFlowers] = useState<Flower[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredFlowers, setFilteredFlowers] = useState<Flower[]>([]);
  const [addedToCart, setAddedToCart] = useState<Record<string, boolean>>({});
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const { addToCart, cartItems } = useCart();
  const [loading, setLoading] = useState(true);

  // Like icon removed

  const fetchFlowers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/flowers`, {
        headers: {
          "Content-Type": "application/json",
          ...(localStorage.getItem("token") && {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          }),
        },
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem("token");
          window.location.reload();
        }
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      const flowersData = Array.isArray(data) ? data : data?.flowers || [];

      const formattedFlowers = flowersData.map((flower: any) => ({
        ...flower,
        imgUrl: flower.imgUrl || flower.img_url || null,
        flowerSize: flower.flowerSize || flower.flower_size || "",
        categoryId: flower.categoryId || flower.category_id || "",
      }));

      setFlowers(formattedFlowers);
      setFilteredFlowers(formattedFlowers);
    } catch (err) {
      console.error("Error fetching flowers:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/categories`);
      if (res.ok) {
        const data = await res.json();
        const categoriesData = Array.isArray(data)
          ? data
          : data?.categories || [];
        setCategories(categoriesData);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchFlowers(), fetchCategories()]);
      setLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    const term = searchTerm?.toLowerCase() || "";
    const catId = selectedCategoryId || "";

    const result = flowers.filter((f) => {
      // category filter first
      if (catId && (f.categoryId || "").toString() !== catId) return false;

      if (!term) return true;
      const catName = getCategoryName(f.categoryId).toLowerCase();
      return (
        f.name.toLowerCase().includes(term) ||
        f.smell.toLowerCase().includes(term) ||
        catName.includes(term)
      );
    });

    setFilteredFlowers(result);
  }, [searchTerm, selectedCategoryId, flowers, categories]);

  const getCategoryName = (id: string): string => {
    return categories.find((c) => c.id === id)?.name || "Uncategorized";
  };

  const handleImageError = (id: string) => {
    setImageErrors((prev) => ({ ...prev, [id]: true }));
  };

  if (loading) {
    return (
      <section className="w-full py-8 px-4 bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-pulse text-xl text-gray-600">
            Loading flowers...
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="flowers-section"
      className="w-full py-8 px-4 bg-gradient-to-br from-pink-50 to-purple-50"
    >
      <div className="max-w-7xl mx-auto">
        {filteredFlowers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">No flowers found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFlowers.map((flower) => (
              <Link
                to={`/flowers/${flower.id}`}
                key={flower.id}
                className="block bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden group"
              >
                <div className="relative overflow-hidden">
                  {flower.imgUrl && !imageErrors[flower.id] ? (
                    <img
                      src={flower.imgUrl!}
                      alt={flower.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      onLoad={() => console.log("✅ Loaded:", flower.name)}
                      onError={(e) => {
                        console.error("❌ Failed:", flower.imgUrl);
                        handleImageError(flower.id);
                        e.preventDefault();
                      }}
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <svg
                          className="w-12 h-12 mx-auto mb-2 opacity-50"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <p className="text-sm">No image</p>
                      </div>
                    </div>
                  )}

                  {/* Like icon removed */}

                  <div className="absolute top-3 left-3">
                    <span className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-gray-700">
                      {getCategoryName(flower.categoryId)}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <h2 className="text-xl font-bold text-gray-800 mb-3">
                    {flower.name}
                  </h2>
                  <div className="space-y-2 mb-4 text-sm">
                    <div>
                      <span className="font-medium">Аромат:</span>{" "}
                      {formatSmell(flower.smell)}
                    </div>
                    <div>
                      <span className="font-medium">Размер цветка:</span>{" "}
                      {flower.flowerSize}
                    </div>
                    <div>
                      <span className="font-medium">Высота:</span>{" "}
                      {flower.height}
                    </div>
                  </div>
                  <div className="mb-4">
                    <p className="text-2xl font-bold text-pink-600">
                      {flower.price} so'm
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      addToCart({
                        id: flower.id,
                        name: flower.name,
                        price: flower.price,
                        imgUrl: flower.imgUrl as string,
                      });
                      setAddedToCart((prev) => ({
                        ...prev,
                        [flower.id]: true,
                      }));
                    }}
                    disabled={
                      addedToCart[flower.id] ||
                      cartItems.some((item) => item.id === flower.id)
                    }
                    className={`w-full font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg ${addedToCart[flower.id] ||
                      cartItems.some((item) => item.id === flower.id)
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                      } text-white`}
                  >
                    {addedToCart[flower.id] ||
                      cartItems.some((item) => item.id === flower.id)
                      ? "Savatga qo'shildi"
                      : "Savatga qo'shish"}
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FlowerGrid;
