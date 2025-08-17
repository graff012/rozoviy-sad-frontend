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
    <section className="mt-10 mb-10 flex justify-center">
      <div className="mycon flex gap-x-8">
        {loading ? (
          <span>Loading...</span>
        ) : (
          categories.map((cat, index) => (
            <button
              key={index}
              className="bg-amber-100 text-black border border-gray-500 py-1 px-2 rounded-md 
                         active:bg-blue-600 hover:cursor-pointer 
                         hover:-translate-y-0.5 transition-all"
            >
              {cat}
            </button>
          ))
        )}
      </div>
    </section>
  )
}

export default Categories
