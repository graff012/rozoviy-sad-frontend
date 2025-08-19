import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { useCart } from "../contexts/CartContext";
import { toggleLike } from "../services/flowerService";
import { FaArrowLeft, FaHeart, FaShare } from "react-icons/fa6";
import { API_URL } from "../config";

interface Flower {
  id: string;
  name: string;
  smell: string;
  flowerSize: string;
  height: string;
  imgUrl?: string;
  categoryId: string;
  price: string;
  isLiked?: boolean;
}

const FlowerDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [flower, setFlower] = useState<Flower | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const navigate = useNavigate();
  const { addToCart, cartItems } = useCart();

  // Helper function to construct proper image URL
  const getImageUrl = (imgUrl: string | undefined): string => {
    if (!imgUrl) {
      return "/images/placeholder.jpg";
    }
    // Remove leading slash if it exists to avoid double slashes
    const cleanPath = imgUrl.startsWith("/") ? imgUrl.slice(1) : imgUrl;
    return `${API_URL.replace('/api', '')}/${cleanPath}`;
  };

  // Handle like functionality with server sync
  const handleLikeClick = useCallback(async () => {
    if (!flower) return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please log in to like flowers");
      return;
    }

    // Get user ID from token
    let userId: string | null = null;
    try {
      let parsedToken = token;
      try {
        parsedToken = JSON.parse(token);
      } catch (e) {
        // If it's not a JSON string, use it as is
      }

      const tokenToUse =
        typeof parsedToken === "object" &&
          parsedToken !== null &&
          "token" in (parsedToken as any)
          ? (parsedToken as any).token
          : parsedToken;

      const tokenParts = String(tokenToUse).split(".");
      if (tokenParts.length !== 3) {
        throw new Error("Invalid token format");
      }

      const payload = JSON.parse(atob(tokenParts[1]));
      userId =
        payload.sub || payload.userId || (payload.user && payload.user.id);
    } catch (tokenError) {
      console.error("Error extracting user ID from token:", tokenError);
      alert("Please log in again");
      return;
    }

    if (!userId) {
      alert("Please log in to like flowers");
      return;
    }

    // Optimistic update
    setFlower((prev) => (prev ? { ...prev, isLiked: !prev.isLiked } : null));

    try {
      const response = await toggleLike(flower.id, userId);
      if (response.success) {
        setFlower((prev) =>
          prev ? { ...prev, isLiked: response.isLiked } : null
        );
      } else {
        throw new Error(response.message || "Failed to update like status");
      }
    } catch (error) {
      // Revert optimistic update
      setFlower((prev) => (prev ? { ...prev, isLiked: !prev.isLiked } : null));
      console.error("Error updating like:", error);
      alert("Failed to update like status");
    }
  }, [flower]);

  useEffect(() => {
    const fetchFlower = async () => {
      try {
        const response = await fetch(
          `${API_URL}/flowers/${id}`,
          {
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              ...(localStorage.getItem("token") && {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              }),
            },
          }
        );

        if (!response.ok) {
          throw new Error("Flower not found");
        }

        const data = await response.json();
        const flowerData = data.flower || data;

        // Format the flower data
        setFlower({
          ...flowerData,
          imgUrl: flowerData.imgUrl || flowerData.img_url || "",
          flowerSize: flowerData.flowerSize || flowerData.flower_size || "",
          categoryId: flowerData.categoryId || flowerData.category_id || "",
          isLiked: Boolean(flowerData.isLiked),
        });
      } catch (err) {
        setError("Failed to load flower details");
        console.error("Error fetching flower:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFlower();
  }, [id]);

  // Check if already in cart
  useEffect(() => {
    const isInCart = cartItems.some((item) => item.id === flower?.id);
    setAddedToCart(isInCart);
  }, [cartItems, flower?.id]);

  const handleAddToCart = () => {
    if (!flower) return;

    addToCart({
      id: flower.id,
      name: flower.name,
      price: flower.price,
      imgUrl: flower.imgUrl,
    });
    setAddedToCart(true);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: flower?.name,
          text: `Check out this beautiful flower: ${flower?.name}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading flower details...</p>
        </div>
      </div>
    );
  }

  if (error || !flower) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex flex-col items-center justify-center px-4">
        <div className="text-center bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
          <p className="text-red-500 mb-6 text-lg">
            {error || "Flower not found"}
          </p>
          <button
            onClick={() => navigate("/")}
            className="w-full px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors font-medium"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-sm sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <FaArrowLeft className="text-lg" />
              <span>Back</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={handleShare}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Share"
              >
                <FaShare className="text-lg" />
              </button>

              <button
                onClick={handleLikeClick}
                className={`p-2 rounded-lg transition-all duration-200 ${flower.isLiked
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "text-gray-600 hover:text-red-500 hover:bg-red-50"
                  }`}
                aria-label={flower.isLiked ? "Unlike" : "Like"}
              >
                <FaHeart className="text-lg" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="py-4 lg:py-12 px-4">
        <div className="max-w-6xl mx-auto bg-white rounded-xl lg:rounded-2xl shadow-lg overflow-hidden">
          {/* Desktop Layout */}
          <div className="hidden lg:block">
            <div className="lg:flex">
              {/* Desktop Image */}
              <div className="lg:flex-shrink-0 relative">
                {!imageLoaded && (
                  <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                    <div className="text-gray-400">Loading image...</div>
                  </div>
                )}
                <img
                  className={`h-96 w-full object-cover lg:w-96 transition-opacity duration-300 ${imageLoaded ? "opacity-100" : "opacity-0"
                    }`}
                  src={getImageUrl(flower.imgUrl)}
                  alt={flower.name}
                  onLoad={() => {
                    console.log(`✅ Image loaded successfully: ${flower.name}`);
                    setImageLoaded(true);
                  }}
                  onError={(e) => {
                    console.error(`❌ Image failed to load: ${flower.name}`);
                    const target = e.target as HTMLImageElement;
                    target.src = "/images/placeholder.jpg";
                    setImageLoaded(true);
                  }}
                />
              </div>

              {/* Desktop Content */}
              <div className="p-8 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">
                      {flower.flowerSize} • {flower.height}
                    </div>
                    <h1 className="block mt-1 text-3xl font-medium text-gray-900">
                      {flower.name}
                    </h1>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleShare}
                      className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                      aria-label="Share"
                    >
                      <FaShare className="text-lg" />
                    </button>

                    <button
                      onClick={handleLikeClick}
                      className={`p-2 rounded-lg transition-all duration-200 ${flower.isLiked
                        ? "bg-red-500 text-white hover:bg-red-600"
                        : "text-gray-600 hover:text-red-500 hover:bg-red-50"
                        }`}
                      aria-label={flower.isLiked ? "Unlike" : "Like"}
                    >
                      <FaHeart className="text-lg" />
                    </button>
                  </div>
                </div>

                <p className="mt-4 text-gray-600">
                  <span className="font-semibold">Hidi:</span> {flower.smell}
                </p>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {flower.price} so'm
                </p>

                <div className="mt-8">
                  <button
                    className={`w-full lg:w-auto px-8 py-3 text-white rounded-lg transition-all duration-200 font-medium ${addedToCart ||
                      cartItems.some((item) => item.id === flower.id)
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-pink-500 hover:bg-pink-600 hover:scale-105"
                      }`}
                    onClick={handleAddToCart}
                    disabled={
                      addedToCart ||
                      cartItems.some((item) => item.id === flower.id)
                    }
                  >
                    {addedToCart ||
                      cartItems.some((item) => item.id === flower.id)
                      ? "Savatga qo'shildi"
                      : "Savatga qo'shish"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="lg:hidden">
            {/* Mobile Image */}
            <div className="relative">
              {!imageLoaded && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                  <div className="text-gray-400">Loading image...</div>
                </div>
              )}
              <img
                className={`w-full h-64 sm:h-80 object-cover transition-opacity duration-300 ${imageLoaded ? "opacity-100" : "opacity-0"
                  }`}
                src={getImageUrl(flower.imgUrl)}
                alt={flower.name}
                onLoad={() => {
                  console.log(`✅ Image loaded successfully: ${flower.name}`);
                  setImageLoaded(true);
                }}
                onError={(e) => {
                  console.error(`❌ Image failed to load: ${flower.name}`);
                  const target = e.target as HTMLImageElement;
                  target.src = "/images/placeholder.jpg";
                  setImageLoaded(true);
                }}
              />
            </div>

            {/* Mobile Content */}
            <div className="p-6">
              <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold mb-2">
                {flower.flowerSize} • {flower.height}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                {flower.name}
              </h1>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-gray-700">
                  <span className="font-semibold">Hidi:</span> {flower.smell}
                </p>
              </div>

              <div className="mb-6">
                <p className="text-3xl font-bold text-pink-600">
                  {flower.price} so'm
                </p>
              </div>

              <button
                className={`w-full py-4 px-6 text-white rounded-xl transition-all duration-200 font-medium text-lg ${addedToCart || cartItems.some((item) => item.id === flower.id)
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 hover:scale-[1.02] active:scale-[0.98]"
                  } shadow-lg`}
                onClick={handleAddToCart}
                disabled={
                  addedToCart || cartItems.some((item) => item.id === flower.id)
                }
              >
                {addedToCart || cartItems.some((item) => item.id === flower.id)
                  ? "Savatga qo'shildi"
                  : "Savatga qo'shish"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlowerDetail;
