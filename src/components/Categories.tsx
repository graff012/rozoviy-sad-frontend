import { useEffect, useState } from "react"
import { API_URL } from "../config"

type Category = {
  id: string;
  name: string;
}

const Categories = () => {
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_URL}/categories`);
      if (res.ok) {
        const data: { categories: Category[] } = await res.json()
        setCategories(["Hammasi", ...data.categories.map((cat) => cat.name)])
      } else {
        console.error("Failed to fetch Categories", res.status)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [])

  return (
    <section className="mt-6 mb-6 md:mt-10 md:mb-10 px-4 flex justify-center">
      <div className="mycon w-full max-w-4xl">
        {loading ? (
          <div className="flex justify-center">
            <span className="text-gray-600">Loading...</span>
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4 lg:gap-x-8">
            {categories.map((cat, index) => (
              <button
                key={index}
                className="bg-amber-100 text-black border border-gray-500 
                           py-1.5 px-3 sm:py-2 sm:px-4 rounded-md text-sm sm:text-base
                           active:bg-blue-600 hover:cursor-pointer 
                           hover:-translate-y-0.5 transition-all duration-200
                           whitespace-nowrap flex-shrink-0"
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default Categories
