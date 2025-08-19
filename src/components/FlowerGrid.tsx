import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { toggleLike } from "../services/flowerService";
import { useCart } from "../contexts/CartContext";
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

interface Category {
  id: string;
  name: string;
}

interface FlowerGridProps {
  searchTerm: string;
}

// Create base URL for static files (remove /api from API_URL)
const BASE_URL = API_URL.replace('/api', '');

const FlowerGrid = ({ searchTerm }: FlowerGridProps) => {
  const [flowers, setFlowers] = useState<Flower[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredFlowers, setFilteredFlowers] = useState<Flower[]>([]);
  const [addedToCart, setAddedToCart] = useState<Record<string, boolean>>({});
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const { addToCart, cartItems } = useCart();
  const [loading, setLoading] = useState(true);

  // Helper function to construct proper image URL
  const getImageUrl = (imgUrl: string | undefined): string => {
    if (!imgUrl) {
      return ''; // Return empty string for no image
    }

    // Remove leading slash if it exists to avoid double slashes
    const cleanPath = imgUrl.startsWith('/') ? imgUrl.slice(1) : imgUrl;

    // If imgUrl already starts with 'images/', use it as is
    // If it's just a filename, prepend 'images/'
    const imagePath = cleanPath.startsWith('images/') ? cleanPath : `images/${cleanPath}`;

    // Construct the full URL using your domain
    const fullUrl = `${BASE_URL}/${imagePath}`;

    console.log(`Image URL construction - Input: "${imgUrl}" -> Output: "${fullUrl}"`);
    return fullUrl;
  };

  // Load liked flowers from localStorage on component mount
  useEffect(() => {
    const likedFlowers = JSON.parse(localStorage.getItem('likedFlowers') || '{}');
    setFlowers(prevFlowers =>
      prevFlowers.map(flower => ({
        ...flower,
        isLiked: !!likedFlowers[flower.id]
      }))
    );
  }, []);

  const handleLikeClick = useCallback(
    async (flowerId: string) => {
      console.log('Like button clicked for flower:', flowerId);

      // Check if user is logged in
      const token = localStorage.getItem('token');
      console.log('Token from localStorage:', token ? 'exists' : 'not found');

      if (!token) {
        alert('Please log in to like flowers');
        return;
      }

      let userId: string | null = null;

      // Try to get user ID from token
      try {
        // First try to parse the token directly (might be stored as a JSON string)
        let parsedToken = token;
        try {
          parsedToken = JSON.parse(token);
        } catch (e) {
          // If it's not a JSON string, use it as is
          console.log('Token is not a JSON string, using as is');
        }

        // If parsedToken is an object with a token property, use that
        const tokenToUse = typeof parsedToken === 'object' && parsedToken !== null && 'token' in (parsedToken as any)
          ? (parsedToken as any).token
          : parsedToken;

        console.log('Using token:', typeof tokenToUse === 'string' ? tokenToUse.substring(0, 20) + '...' : tokenToUse);

        const tokenParts = String(tokenToUse).split('.');
        if (tokenParts.length !== 3) {
          throw new Error(`Invalid token format: expected 3 parts, got ${tokenParts.length}`);
        }

        const payload = JSON.parse(atob(tokenParts[1]));
        console.log('Token payload:', payload);

        userId = payload.sub || payload.userId || (payload.user && payload.user.id);
        if (!userId) {
          throw new Error('User ID not found in token payload');
        }

        console.log('Extracted user ID:', userId);
      } catch (tokenError) {
        console.error('Error extracting user ID from token:', tokenError);
        // Try to get user ID from local storage as fallback
        const userData = localStorage.getItem('user');
        if (userData) {
          try {
            const user = JSON.parse(userData);
            userId = user.id || user._id;
            console.log('Using user ID from localStorage:', userId);
          } catch (e) {
            console.error('Error parsing user data from localStorage:', e);
          }
        }

        if (!userId) {
          alert('Could not determine user ID. Please log in again.');
          return;
        }
      }

      if (!userId) {
        console.error('No user ID available');
        alert('Please log in to like flowers');
        return;
      }

      // Optimistic UI update
      setFlowers(prevFlowers => {
        const currentFlower = prevFlowers.find(f => f.id === flowerId);
        if (!currentFlower) return prevFlowers;

        const currentLikeStatus = currentFlower.isLiked || false;
        const newLikeStatus = !currentLikeStatus;

        console.log(`Updating flower ${flowerId} like status to:`, newLikeStatus);

        // Update UI state
        return prevFlowers.map(flower =>
          flower.id === flowerId
            ? { ...flower, isLiked: newLikeStatus }
            : flower
        );
      });

      // Try to update the server
      try {
        console.log(`Calling toggleLike for flower ${flowerId} with user ${userId}`);
        const response = await toggleLike(flowerId, userId);
        console.log('Like response:', response);

        if (!response.success) {
          throw new Error(response.message || 'Failed to update like status');
        }

        console.log('Like update successful, updating UI');

        // Update local state with the actual response from server
        setFlowers(prevFlowers =>
          prevFlowers.map(flower =>
            flower.id === flowerId
              ? { ...flower, isLiked: response.isLiked }
              : flower
          )
        );
      } catch (error) {
        console.error("Error updating like on server:", error);
        // Revert the optimistic update on error
        setFlowers(prevFlowers =>
          prevFlowers.map(flower =>
            flower.id === flowerId
              ? { ...flower, isLiked: !flower.isLiked }
              : flower
          )
        );
        const errorMessage = error instanceof Error ? error.message : 'Failed to update like status. Please try again.';
        alert(errorMessage);
      }
    },
    [toggleLike] // No dependencies needed as we're using state updater function
  );

  const fetchFlowers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/flowers`, {
        credentials: 'include', // This will include cookies with the request
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('token') && {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          })
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);

        // If unauthorized, clear the token and reload
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('token');
          window.location.reload();
        }

        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      console.log("Raw API response:", responseData);

      // Handle both array response and object with flowers property
      const flowersData = Array.isArray(responseData)
        ? responseData
        : (responseData?.flowers || []);

      // Map the response data to match the Flower interface
      const formattedFlowers = flowersData.map((flower: any) => {
        const formatted = {
          ...flower,
          // Handle both snake_case and camelCase field names
          imgUrl: flower.imgUrl || flower.img_url || '',
          flowerSize: flower.flowerSize || flower.flower_size || '',
          categoryId: flower.categoryId || flower.category_id || '',
          // Ensure isLiked is always a boolean
          isLiked: Boolean(flower.isLiked)
        };

        const constructedUrl = getImageUrl(formatted.imgUrl);
        console.log(`Flower ${formatted.id} (${formatted.name}):`, {
          isLiked: formatted.isLiked,
          rawImgUrl: formatted.imgUrl,
          constructedUrl: constructedUrl
        });

        return formatted;
      });

      console.log("Formatted flowers:", formattedFlowers);
      setFlowers(formattedFlowers);
      setFilteredFlowers(formattedFlowers);

      return formattedFlowers;
    } catch (error) {
      console.error("Error fetching flowers:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/categories`, {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        console.log("Raw categories response:", data);

        // Handle both array response and object with categories property
        const categoriesData = Array.isArray(data)
          ? data
          : (data?.categories || []);

        console.log("Processed categories:", categoriesData);
        setCategories(categoriesData);
      } else {
        console.error("Failed to fetch categories: ", res.status);
        setCategories([]); // Ensure categories is always an array
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchFlowers(), fetchCategories()]);
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadAll();
  }, []);

  // Filter flowers based on search
  useEffect(() => {
    if (!searchTerm) {
      setFilteredFlowers(flowers);
    } else {
      const filtered = flowers.filter((flower) => {
        const categoryName = getCategoryName(flower.categoryId);
        return (
          flower.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          flower.smell.toLowerCase().includes(searchTerm.toLowerCase()) ||
          categoryName.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
      setFilteredFlowers(filtered);
    }
  }, [searchTerm, flowers, categories]);

  const getCategoryName = (categoryId: string): string => {
    if (!categoryId || !Array.isArray(categories)) return categoryId || 'Uncategorized';
    const category = categories.find((cat) => cat && cat.id === categoryId);
    return category?.name || categoryId || 'Uncategorized';
  };

  // Handle image error with proper error tracking to prevent infinite loops
  const handleImageError = (flowerId: string, imageUrl: string) => {
    console.error(`❌ Image failed to load: Flower ID ${flowerId} - ${imageUrl}`);

    // Track that this image has failed to prevent retry loops
    setImageErrors(prev => ({
      ...prev,
      [flowerId]: true
    }));
  };

  if (loading) {
    return (
      <section className="w-full py-8 px-4 bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-pulse text-xl text-gray-600">Loading flowers...</div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section
        id="flowers-section"
        className="w-full py-8 px-4 bg-gradient-to-br from-pink-50 to-purple-50"
      >
        <div className="max-w-7xl mx-auto">
          {filteredFlowers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-gray-600">No flowers found</p>
              {searchTerm && (
                <p className="text-gray-500 mt-2">Try adjusting your search term</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFlowers.map((flower) => {
                const imageUrl = getImageUrl(flower.imgUrl);
                const hasImageError = imageErrors[flower.id];

                // Debug logs
                console.group(`Flower: ${flower.name}`);
                console.log("Flower ID:", flower.id);
                console.log("Raw imgUrl:", flower.imgUrl);
                console.log("Constructed URL:", imageUrl);
                console.log("Has image error:", hasImageError);
                console.log("BASE_URL:", BASE_URL);
                console.groupEnd();

                return (
                  <Link
                    to={`/flowers/${flower.id}`}
                    key={flower.id}
                    className="block bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden group"
                  >
                    <div className="relative overflow-hidden">
                      {/* Only render image if we have a valid URL and no previous error */}
                      {imageUrl && !hasImageError ? (
                        <img
                          src={imageUrl}
                          alt={flower.name}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                          onLoad={() => {
                            console.log(`✅ Image loaded successfully: ${flower.name} - ${imageUrl}`);
                          }}
                          onError={(e) => {
                            console.error(`❌ Image failed to load: ${flower.name} - ${imageUrl}`);
                            handleImageError(flower.id, imageUrl);
                            e.preventDefault(); // Prevent further error events
                          }}
                        />
                      ) : (
                        // Placeholder for missing or failed images
                        <div className="w-full h-48 bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                          <div className="text-center text-gray-500">
                            <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                            </svg>
                            <p className="text-sm">No image</p>
                          </div>
                        </div>
                      )}

                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleLikeClick(flower.id);
                        }}
                        aria-label={
                          flower.isLiked
                            ? "Sevimlilardan olib tashlash"
                            : "Sevimlilarga qo'shish"
                        }
                        className={`absolute top-3 right-3 p-2 rounded-full shadow-md hover:scale-110 transition-all duration-200 ${flower.isLiked
                          ? "bg-red-500 hover:bg-red-600"
                          : "bg-white/90 backdrop-blur-sm hover:bg-white"
                          }`}
                      >
                        <svg
                          className={`w-5 h-5 transition-colors duration-200 ${flower.isLiked ? "text-white" : "text-gray-400"
                            }`}
                          fill={flower.isLiked ? "currentColor" : "none"}
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 000-6.364 4.5 4.5 0 00-6.364 0L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                          />
                        </svg>
                      </button>

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
                          <span className="font-medium">Hid:</span> {flower.smell}
                        </div>
                        <div>
                          <span className="font-medium">O'lcham:</span>{" "}
                          {flower.flowerSize}
                        </div>
                        <div>
                          <span className="font-medium">Balandlik:</span>{" "}
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
                          const item = {
                            id: flower.id,
                            name: flower.name,
                            price: flower.price,
                            imgUrl: flower.imgUrl
                          };
                          addToCart(item);
                          setAddedToCart(prev => ({
                            ...prev,
                            [flower.id]: true
                          }));
                        }}
                        className={`w-full font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg ${addedToCart[flower.id] || cartItems.some(item => item.id === flower.id)
                          ? 'bg-green-600 hover:bg-green-700'
                          : 'bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800'
                          } text-white`}
                        disabled={addedToCart[flower.id] || cartItems.some(item => item.id === flower.id)}
                      >
                        {addedToCart[flower.id] || cartItems.some(item => item.id === flower.id)
                          ? "Savatga qo'shildi"
                          : "Savatga qo'shish"}
                      </button>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default FlowerGrid;
