import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function ProductCard({ product }) {
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    setSelectedVariant(product.variants[0]);
    setCurrentImageIndex(0);
  }, [product]);

  const nextImage = (e) => {
    e.preventDefault(); // prevent Link navigation when clicking arrows
    setCurrentImageIndex((prev) =>
      prev === selectedVariant.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = (e) => {
    e.preventDefault();
    setCurrentImageIndex((prev) =>
      prev === 0 ? selectedVariant.images.length - 1 : prev - 1
    );
  };

  return (
    <div className="relative cursor-pointer group">

      {/* Clicking image area → goes to detail page */}
      <Link to={`/product/${product._id}`}>
        <div className="relative border border-gray-200 p-4 rounded-xl overflow-hidden">
          <img
            src={selectedVariant.images[currentImageIndex]}
            alt={product.name}
            className="w-full object-contain"
          />

          {selectedVariant.images.length > 1 && (
            <>
              {/* LEFT ARROW */}
              <button
                onClick={prevImage}
                className="absolute left-1 top-1/2 -translate-y-1/2 bg-white border border-gray-300 rounded-full p-1 sm:p-2"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <path d="M14.78 20L6 12l8.78-8L17 6.02 10.44 12 17 17.98z" fill="#333" />
                </svg>
              </button>

              {/* RIGHT ARROW */}
              <button
                onClick={nextImage}
                className="absolute right-1 top-1/2 -translate-y-1/2 bg-white border border-gray-300 rounded-full p-1 sm:p-2"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <path d="M8.22 20L6 17.98 12.56 12 6 6.02 8.22 4l8.78 8z" fill="#333" />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Product info */}
        <h3 className="mt-2 text-sm font-medium text-gray-900 group-hover:underline">
          {product.name}
        </h3>
        <p className="text-xs text-gray-500 capitalize">{product.brand}</p>
        <p className="font-bold text-sm mt-0.5">Starting at ${product.price}</p>
      </Link>

      {/* Color swatches — stop propagation so clicking swatch doesn't navigate */}
      <div className="flex gap-2 mt-2">
        {product.variants.map((variant, i) => (
          <button
            key={i}
            onClick={(e) => {
              e.preventDefault();
              setSelectedVariant(variant);
              setCurrentImageIndex(0);
            }}
            title={variant.color}
            className={`w-6 h-6 rounded-full border transition-all duration-200 ${
              selectedVariant === variant ? "ring-2 ring-black ring-offset-2" : ""
            }`}
            style={{ backgroundColor: variant.color.toLowerCase() }}
          />
        ))}
      </div>
    </div>
  );
}
