import { useState, useEffect } from "react";

export default function ProductCard({ product }) {
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // 🔥 variant change → image reset
  useEffect(() => {
    setSelectedVariant(product.variants[0]);
    setCurrentImageIndex(0);
  }, [product]);

  // 🔥 image change functions
  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === selectedVariant.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? selectedVariant.images.length - 1 : prev - 1
    );
  };

  return (
    <div className="  relative ">

      {/* 🔥 IMAGE SLIDER */}
      <div className="relative border border-gray-200 p-4 rounded-xl">
        <img
          src={selectedVariant.images[currentImageIndex]}
          className="w-full  S"
        />

        {/* LEFT */}
        <button
          onClick={prevImage}
          className="absolute left-1 top-1/2 -translate-y-1/2 bg-white border border-gray-300 rounded-full  p-1 sm:p-2 text-center"
        ><svg data-v-d2e02080="" width="13" height="13" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="custom-icon"><g data-v-d2e02080="" clip-path="url(#clip0_135_1714)"><path data-v-d2e02080="" d="M14.7801 20L6 12L14.7801 4L17 6.02264L10.4398 12L17 17.9774L14.7801 20Z" fill="#333333"></path></g><defs data-v-d2e02080=""><clipPath data-v-d2e02080="" id="clip0_135_1714"><rect data-v-d2e02080="" width="24" height="24" fill="white" transform="matrix(-1 0 0 1 24 0)"></rect></clipPath></defs></svg>
        </button>

        {/* RIGHT */}
        <button
          onClick={nextImage}
          className="absolute right-1 top-1/2 -translate-y-1/2 bg-white border border-gray-300 rounded-full p-1 sm:p-2 text-center"
        ><svg data-v-508052de="" width="13" height="13" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="custom-icon"><g data-v-508052de="" clip-path="url(#clip0_135_1725)"><path data-v-508052de="" d="M8.21988 20L6 17.9773L12.5602 12L6 6.02263L8.21988 3.99999L17 12L8.21988 20Z" fill="#333333"></path></g><defs data-v-508052de=""><clipPath data-v-508052de="" id="clip0_135_1725"><rect data-v-508052de="" width="24" height="24" fill="white"></rect></clipPath></defs></svg>
        </button>
      </div>

      {/* PRODUCT INFO */}
      <h3 className="mt-2">{product.name}</h3>
      <p className="font-bold">Starting at ${product.price}</p>

      {/* 🔥 COLOR VARIANTS */}
      <div className="flex gap-2 mt-3">
        {product.variants.map((variant, i) => (
          <button
            key={i}
            onClick={() => {
              setSelectedVariant(variant);
              setCurrentImageIndex(0); // reset slider
            }}
            className="w-6 h-6 rounded-full border"
            style={{ backgroundColor: variant.color.toLowerCase() }}
          />
        ))}
      </div>
    </div>
  );
}