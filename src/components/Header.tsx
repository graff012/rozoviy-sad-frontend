import { Link, useNavigate } from "react-router-dom";
import { IoSearchSharp } from "react-icons/io5";
import {
  FaCartShopping,
  FaPhone,
  FaUserShield,
  FaBars,
} from "react-icons/fa6";
import { FaTimes } from "react-icons/fa";
import { useState, useEffect, useRef } from "react";
import { useCart } from "../contexts/CartContext";
import { API_URL } from "../config";

interface HeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

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

const Header = ({ searchTerm, setSearchTerm }: HeaderProps) => {
  const [inputValue, setInputValue] = useState(searchTerm);
  const [flowers, setFlowers] = useState<Flower[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<Flower[]>([]);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement | null>(null);
  const { itemCount } = useCart();

  // Fetch all flowers for autocomplete
  useEffect(() => {
    const fetchFlowers = async () => {
      try {
        console.log("Fetching flowers from API...");
        const res = await fetch(`${API_URL}/flowers`, {
          credentials: "include",
        });
        if (res.ok) {
          const response = await res.json();
          console.log("Received flowers data:", response);
          setFlowers(response.flowers || []);
        } else {
          console.error("Failed to fetch flowers:", res.status, res.statusText);
        }
      } catch (err) {
        console.error("Error fetching flowers:", err);
      }
    };
    fetchFlowers();
  }, []);

  // Filter suggestions as user types
  useEffect(() => {
    console.log("Filtering with input:", inputValue);
    console.log("Current flowers:", flowers);

    if (inputValue.trim() === "") {
      console.log("Input is empty, clearing suggestions");
      setFilteredSuggestions([]);
      setShowSuggestions(false);
    } else if (Array.isArray(flowers)) {
      console.log("Filtering", flowers.length, "flowers");
      const filtered = flowers.filter((flower) => {
        const matches = flower?.name
          ?.toLowerCase()
          .includes(inputValue.toLowerCase());
        console.log("Checking flower:", flower?.name, "matches:", matches);
        return matches;
      });
      console.log("Filtered results:", filtered);
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      console.log("Flowers is not an array:", flowers);
    }
  }, [inputValue, flowers]);

  // Hide suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSearchFocus = () => {
    if (filteredSuggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleSearch = () => {
    setSearchTerm(inputValue);
    setShowSuggestions(false);
    setShowMobileSearch(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const navigate = useNavigate();

  const handleSuggestionClick = (flower: Flower) => {
    setInputValue(flower.name);
    setSearchTerm(flower.name);
    setShowSuggestions(false);
    setShowMobileSearch(false);
    navigate(`/flowers/${flower.id}`);
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
    setShowMobileSearch(false);
  };

  const toggleMobileSearch = () => {
    setShowMobileSearch(!showMobileSearch);
    setShowMobileMenu(false);
  };

  return (
    <header className="sticky top-0 bg-[#004F44] z-50 shadow-lg">
      {/* Main header bar */}
      <div className="pt-3 pb-3 md:pt-5">
        <div className="mycon">
          {/* Desktop layout */}
          <div className="hidden md:flex justify-between items-center">
            <Link to={"/"}>
              <h1 className="title text-4xl font-semibold text-white">
                <img src='/rozoviysad-logo-two.svg' alt="Logo" />
              </h1>
            </Link>

            <div className="flex gap-x-3 items-center">
              {/* Desktop Search */}
              <div className="flex flex-col relative">
                <div className="flex justify-between gap-2 items-center border border-white rounded-lg px-3 py-1.5 bg-[#004F44] h-12">
                  <IoSearchSharp className="text-2xl text-white" />
                  <input
                    type="search"
                    placeholder="Qidirish..."
                    className="text-xl border-none w-150px appearance-none focus:outline-none text-white bg-transparent h-full px-2"
                    value={inputValue}
                    onChange={handleInputChange}
                    onFocus={handleSearchFocus}
                    onKeyDown={handleKeyDown}
                    autoComplete="off"
                  />
                  <button
                    className="px-3 h-full bg-white text-[#004F44] rounded hover:bg-gray-200 transition-colors font-medium"
                    onClick={handleSearch}
                    aria-label="Qidirish"
                  >
                    Qidirish
                  </button>
                </div>
                {showSuggestions && (
                  <div
                    ref={suggestionsRef}
                    className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-b-lg shadow-lg z-50 max-h-48 overflow-y-auto"
                  >
                    {filteredSuggestions.map((flower) => (
                      <div
                        key={flower.id}
                        className="px-4 py-2 cursor-pointer hover:bg-gray-100 text-black"
                        onClick={() => handleSuggestionClick(flower)}
                      >
                        {flower.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Desktop Navigation Icons */}
              {/* <Link */}
              {/*   to="/favorites" */}
              {/*   className="p-3 border border-white rounded-lg relative hover:cursor-pointer hover:bg-[#00695C] transition-all flex items-center justify-center group" */}
              {/*   title="Sevimli gullar" */}
              {/* > */}
              {/*   <FaHeart className="text-white group-hover:scale-110 transition-transform" /> */}
              {/* </Link> */}

              <Link
                to="/cart"
                className="p-3 border border-white rounded-lg relative hover:cursor-pointer hover:bg-[#00695C] transition-all group"
                title="Savat"
              >
                <FaCartShopping className="text-white group-hover:scale-110 transition-transform" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-pink-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Link>

              <Link
                to="/admin"
                className="p-3 border border-white rounded-lg hover:cursor-pointer hover:bg-[#00695C] transition-all group"
                title="Admin Panel"
              >
                <FaUserShield className="text-white group-hover:scale-110 transition-transform text-lg" />
              </Link>

              <a
                href="tel:+998990974203"
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/30 rounded-lg text-white font-medium transition-colors group"
              >
                <FaPhone className="group-hover:scale-110 transition-transform" />
                <span className="hidden lg:inline">+998 99 097 42 03</span>
                <span className="lg:hidden">Call</span>
              </a>
            </div>
          </div>

          {/* Mobile layout */}
          <div className="md:hidden">
            <div className="flex justify-between items-center">
              <Link to={"/"}>
                <h1 className="title text-2xl font-semibold text-white">
                  Rozoviy Sad
                </h1>
              </Link>

              <div className="flex items-center gap-2">
                {/* Mobile Search Button */}
                <button
                  onClick={toggleMobileSearch}
                  className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                  aria-label="Search"
                >
                  <IoSearchSharp className="text-xl" />
                </button>

                {/* Mobile Cart with badge */}
                <Link
                  to="/cart"
                  className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors relative"
                  title="Savat"
                >
                  <FaCartShopping className="text-xl" />
                  {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-pink-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {itemCount}
                    </span>
                  )}
                </Link>

                {/* Mobile Menu Button */}
                <button
                  onClick={toggleMobileMenu}
                  className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                  aria-label="Menu"
                >
                  {showMobileMenu ? (
                    <FaTimes className="text-xl" />
                  ) : (
                    <FaBars className="text-xl" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {showMobileSearch && (
        <div className="md:hidden bg-[#004F44] border-t border-white/20 px-4 pb-4">
          <div className="flex flex-col relative">
            <div className="flex gap-2 items-center border border-white rounded-lg px-3 py-2 bg-[#004F44]">
              <IoSearchSharp className="text-xl text-white flex-shrink-0" />
              <input
                type="search"
                placeholder="Qidirish..."
                className="text-lg border-none flex-1 appearance-none focus:outline-none text-white bg-transparent py-1"
                value={inputValue}
                onChange={handleInputChange}
                onFocus={handleSearchFocus}
                onKeyDown={handleKeyDown}
                autoComplete="off"
              />
              <button
                className="px-3 py-1 bg-white text-[#004F44] rounded hover:bg-gray-200 transition-colors font-medium text-sm flex-shrink-0"
                onClick={handleSearch}
                aria-label="Qidirish"
              >
                Qidirish
              </button>
            </div>
            {showSuggestions && (
              <div
                ref={suggestionsRef}
                className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-b-lg shadow-lg z-50 max-h-48 overflow-y-auto"
              >
                {filteredSuggestions.map((flower) => (
                  <div
                    key={flower.id}
                    className="px-4 py-3 cursor-pointer hover:bg-gray-100 text-black border-b border-gray-100 last:border-b-0"
                    onClick={() => handleSuggestionClick(flower)}
                  >
                    {flower.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="md:hidden bg-[#004F44] border-t border-white/20">
          <div className="px-4 py-3 space-y-2">
            {/* <Link */}
            {/*   to="/favorites" */}
            {/*   className="flex items-center gap-3 p-3 text-white hover:bg-white/10 rounded-lg transition-colors" */}
            {/*   onClick={() => setShowMobileMenu(false)} */}
            {/* > */}
            {/*   <FaHeart className="text-lg" /> */}
            {/*   <span>Sevimli gullar</span> */}
            {/* </Link> */}

            <Link
              to="/admin"
              className="flex items-center gap-3 p-3 text-white hover:bg-white/10 rounded-lg transition-colors"
              onClick={() => setShowMobileMenu(false)}
            >
              <FaUserShield className="text-lg" />
              <span>Admin Panel</span>
            </Link>

            <a
              href="tel:+998990974203"
              className="flex items-center gap-3 p-3 text-white hover:bg-white/10 rounded-lg transition-colors"
              onClick={() => setShowMobileMenu(false)}
            >
              <FaPhone className="text-lg" />
              <span>+998 99 097 42 03</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
