import { useCategories } from "../api/productApi";
import { motion } from "framer-motion";

export default function CategoryFilter({ selectedCategory, onSelectCategory }) {
  const { data, isLoading } = useCategories();
  const categories = data?.categories || [];

  if (isLoading)
    return <div className="animate-pulse h-10 bg-gray-200 rounded"></div>;

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-3">Filter by Category</h3>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onSelectCategory(null)}
          className={`px-4 py-2 rounded-full transition ${
            !selectedCategory
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat._id}
            onClick={() => onSelectCategory(cat._id)}
            className={`px-4 py-2 rounded-full transition ${
              selectedCategory === cat._id
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  );
}
