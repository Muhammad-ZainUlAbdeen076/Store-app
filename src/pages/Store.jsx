import { useState, useEffect } from "react";
import { products } from "../data/products"; // 👈 apne path ke hisaab se
import CategoryTabs from "../component/CategoryTabs";
import ProductCard from "../component/ProductCard";
import Hero from '../component/Hero'
import StoreInfoSection from "../component/StoreInfoSection";
import Navbar from "../component/Navbar";



export default function Store() {
  
  const [filteredProducts, setFilteredProducts] = useState([]);
const [activeFilter, setActiveFilter] = useState("all");
const [type, setType] = useState(null);

  


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

  return (
    <div>
       <Navbar setActiveFilter={setActiveFilter} />
      {/* 👇 yahan se control aa raha hai */}
     <CategoryTabs setActiveFilter={setActiveFilter} />
     <Hero/>
     <StoreInfoSection/>


     
      {/* 🛒 products */}
     {/* 🛒 products */}
<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6 px-4 sm:px-6 md:px-10 lg:px-15">
  {filteredProducts.map((item) => (
    <ProductCard key={item._id + activeFilter} product={item} />
  ))}
</div>
    </div>
  );
}