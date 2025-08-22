import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toggleLike } from '../services/flowerService';
import { useCart } from '../contexts/CartContext';
import { API_URL } from '../config';


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
}

const FlowerGrid = ({ searchTerm }: FlowerGridProps) => {
  const [flowers, setFlowers] = useState<Flower[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredFlowers, setFilteredFlowers] = useState<Flower[]>([]);
  const [addedToCart, setAddedToCart] = useState<Record<string, boolean>>({});
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const { addToCart, cartItems } = useCart();
  const [loading, setLoading] = useState(true);


  const handleLikeClick = useCallback(
    async (flowerId: string) => {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in to like flowers');
        return;
      }

      let userId: string | null = null;
      try {
        let parsedToken = token;
        try {
          parsedToken = JSON.parse(token);
        } catch (e) {
          // not JSON
        }

        const tokenToUse = typeof parsedToken === 'object' && parsedToken !== null && 'token' in parsedToken
          ? (parsedToken as any).token
          : parsedToken;

        const tokenParts = String(tokenToUse).split('.');
        if (tokenParts.length !== 3) throw new Error('Invalid token format');
        const payload = JSON.parse(atob(tokenParts[1]));
        userId = payload.sub || payload.userId || (payload.user?.id);
        if (!userId) throw new Error('User ID not found');
      } catch (err) {
        const userData = localStorage.getItem('user');
        console.error(err)
        if (userData) {
          try {
            const user = JSON.parse(userData);
            userId = user.id || user._id;
          } catch (err) {
            console.error(err)
          }
        }
        if (!userId) {
          alert('Please log in again.');
          return;
        }
      }

      setFlowers((prev) =>
        prev.map((f) =>
          f.id === flowerId ? { ...f, isLiked: !f.isLiked } : f
        )
      );

      try {
        const response = await toggleLike(flowerId, userId);
        setFlowers((prev) =>
          prev.map((f) =>
            f.id === flowerId ? { ...f, isLiked: response.isLiked } : f
          )
        );
      } catch (error) {
        setFlowers((prev) =>
          prev.map((f) =>
            f.id === flowerId ? { ...f, isLiked: !f.isLiked } : f
          )
        );
        alert('Failed to update like status');
      }
    },
    [toggleLike]
  );

  const fetchFlowers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/flowers`, {
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('token') && {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          })
        }
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem('token');
          window.location.reload();
        }
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      const flowersData = Array.isArray(data) ? data : data?.flowers || [];

      const formattedFlowers = flowersData.map((flower: any) => ({
        ...flower,
        imgUrl: flower.imgUrl || flower.img_url || null,
        flowerSize: flower.flowerSize || flower.flower_size || '',
        categoryId: flower.categoryId || flower.category_id || '',
        isLiked: Boolean(flower.isLiked),
      }));

      setFlowers(formattedFlowers);
      setFilteredFlowers(formattedFlowers);
    } catch (err) {
      console.error('Error fetching flowers:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/categories`);
      if (res.ok) {
        const data = await res.json();
        const categoriesData = Array.isArray(data) ? data : data?.categories || [];
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
    setFilteredFlowers(
      searchTerm
        ? flowers.filter((f) => {
          const catName = getCategoryName(f.categoryId);
          return (
            f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            f.smell.toLowerCase().includes(searchTerm.toLowerCase()) ||
            catName.toLowerCase().includes(searchTerm.toLowerCase())
          );
        })
        : flowers
    );
  }, [searchTerm, flowers, categories]);

  const getCategoryName = (id: string): string => {
    return categories.find((c) => c.id === id)?.name || 'Uncategorized';
  };

  const handleImageError = (id: string) => {
    setImageErrors((prev) => ({ ...prev, [id]: true }));
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
    <section id='flowers-section' className="w-full py-8 px-4 bg-gradient-to-br from-pink-50 to-purple-50">
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
                      onLoad={() => console.log('✅ Loaded:', flower.name)}
                      onError={(e) => {
                        console.error('❌ Failed:', flower.imgUrl);
                        handleImageError(flower.id);
                        e.preventDefault();
                      }}
                    />
                  ) : (
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
                    aria-label={flower.isLiked ? "Remove from favorites" : "Add to favorites"}
                    className={`absolute top-3 right-3 p-2 rounded-full shadow-md hover:scale-110 transition-all duration-200 ${flower.isLiked
                      ? 'bg-red-500 hover:bg-red-600'
                      : 'bg-white/90 backdrop-blur-sm hover:bg-white'
                      }`}
                  >
                    <svg
                      className={`w-5 h-5 transition-colors duration-200 ${flower.isLiked ? 'text-white' : 'text-gray-400'
                        }`}
                      fill={flower.isLiked ? 'currentColor' : 'none'}
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
                  <h2 className="text-xl font-bold text-gray-800 mb-3">{flower.name}</h2>
                  <div className="space-y-2 mb-4 text-sm">
                    <div><span className="font-medium">Аромат:</span> {flower.smell}</div>
                    <div><span className="font-medium">Размер цветка:</span> {flower.flowerSize}</div>
                    <div><span className="font-medium">Высота:</span> {flower.height}</div>
                  </div>
                  <div className="mb-4">
                    <p className="text-2xl font-bold text-pink-600">{flower.price} so'm</p>
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
                      setAddedToCart((prev) => ({ ...prev, [flower.id]: true }));
                    }}
                    disabled={addedToCart[flower.id] || cartItems.some((item) => item.id === flower.id)}
                    className={`w-full font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg ${addedToCart[flower.id] || cartItems.some((item) => item.id === flower.id)
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800'
                      } text-white`}
                  >
                    {addedToCart[flower.id] || cartItems.some((item) => item.id === flower.id)
                      ? 'Savatga qo\'shildi'
                      : 'Savatga qo\'shish'}
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
