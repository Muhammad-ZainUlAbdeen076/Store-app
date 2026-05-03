import { useState, useEffect } from "react";
import { products } from "../data/products";
import ProductCard from "../component/ProductCard";

export default function Store({ activeFilter }) {
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    if (activeFilter === "all") {
      setFilteredProducts(products);
    } else if (activeFilter === "bestseller") {
      setFilteredProducts(products.filter(p => p.bestseller));
    } else {
      setFilteredProducts(
        products.filter(
          p =>
            p.brand?.toLowerCase() === activeFilter ||
            p.type?.toLowerCase() === activeFilter
        )
      );
    }
  }, [activeFilter]);

  // 🔥 TITLE LOGIC
  const getTitle = () => {
    if (activeFilter === "all") return "All Products";
    if (activeFilter === "bestseller") return "Best Sellers";
    return activeFilter?.charAt(0).toUpperCase() + activeFilter.slice(1);
  };

  return (
    <div className="my-5">

      {/* 🏷️ TITLE SECTION (GRID SE PEHLE) */}
      <div className="px-4 sm:px-6 md:px-10 lg:px-15 mt-8 mb-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
          {getTitle()}
        </h2>
      </div>

      {/* 🛒 PRODUCTS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4 sm:px-6 md:px-10 lg:px-15">

        {filteredProducts.map((item) => (
          <ProductCard key={item._id} product={item} />
        ))}

      </div>

    </div>
  );
}