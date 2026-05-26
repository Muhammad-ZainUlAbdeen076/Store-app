import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import Navbar from "../component/Navbar";
import Footer from "../component/Footer";
import CartModal from "../component/CartModal";
import ProductCard from "../component/ProductCard";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, addToCart } = useStore();

  const product = products.find((p) => p._id === id);

  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedDesign, setSelectedDesign] = useState(null);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [orderTab, setOrderTab] = useState("single");
  const [qty, setQty] = useState(1);
  const [zoomStyle, setZoomStyle] = useState({});
  const [bulkQty, setBulkQty] = useState({});
  const [sizeError, setSizeError] = useState(false);
  const [bulkError, setBulkError] = useState(false);

  useEffect(() => {
    if (product) {
      setSelectedVariant(product.variants[0]);
      setSelectedSize(null);
      setSelectedDesign(product.designs?.[0] ?? null);
      setMainImageIndex(0);
      setBulkQty({});
    }
  }, [product]);

  useEffect(() => {
    setMainImageIndex(0);
  }, [selectedVariant]);

  // Auto-hide toasts
  useEffect(() => {
    if (!sizeError) return;
    const t = setTimeout(() => setSizeError(false), 2500);
    return () => clearTimeout(t);
  }, [sizeError]);

  useEffect(() => {
    if (!bulkError) return;
    const t = setTimeout(() => setBulkError(false), 2500);
    return () => clearTimeout(t);
  }, [bulkError]);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-xl font-semibold text-gray-700">Product not found</p>
        <button onClick={() => navigate("/")} className="px-5 py-2 bg-black text-white rounded-full text-sm">
          ← Back to Store
        </button>
      </div>
    );
  }

  const images = selectedVariant?.images ?? [];
  const hasSizes = product.sizes?.length > 0;
  const brandLabel = product.brand
    ? product.brand.split(" ").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ")
    : "";

  // Related products: same brand OR same type, exclude current
  const relatedProducts = products
    .filter(
      (p) =>
        p._id !== product._id &&
        (p.brand === product.brand || p.type === product.type)
    )
    .slice(0, 4);

  const prevImage = () => setMainImageIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  const nextImage = () => setMainImageIndex((i) => (i === images.length - 1 ? 0 : i + 1));

  const handleAddToCart = () => {
    // ── SINGLE ORDER ──
    if (orderTab === "single") {
      if (hasSizes && !selectedSize) {
        setSizeError(true);
        return;
      }
      addToCart({
        _id: product._id,
        name: product.name,
        brand: product.brand,
        price: product.price,
        image: images[mainImageIndex],
        size: selectedSize,
        color: selectedVariant?.color,
        design: selectedDesign,
        qty,
      });
      return;
    }

    // ── BULK ORDER ──
    // Filter sizes with qty > 0
    const bulkEntries = Object.entries(bulkQty).filter(
      ([, v]) => v && parseInt(v) > 0
    );

    if (bulkEntries.length === 0) {
      setBulkError(true);
      return;
    }

    // Add one cart item per size
    bulkEntries.forEach(([size, amount]) => {
      addToCart({
        _id: product._id,
        name: product.name,
        brand: product.brand,
        price: product.price,
        image: images[mainImageIndex],
        size,
        color: selectedVariant?.color,
        design: selectedDesign,
        qty: parseInt(amount),
      });
    });

    // Reset bulk quantities after adding
    setBulkQty({});
  };

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({ transformOrigin: `${x}% ${y}%`, transform: "scale(2)" });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ transform: "scale(1)", transformOrigin: "center" });
  };

  const totalBulkQty = Object.values(bulkQty).reduce(
    (sum, v) => sum + (parseInt(v) || 0),
    0
  );

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <CartModal />

      {/* ── Size error toast ── */}
      <Toast
        show={sizeError}
        message="Please select a size before adding to cart."
      />

      {/* ── Bulk error toast ── */}
      <Toast
        show={bulkError}
        message="Please enter quantity for at least one size."
      />

      <main className="flex-1 px-4 sm:px-6 md:px-10 lg:px-16 py-6 max-w-7xl mx-auto w-full">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-sm text-gray-500 mb-6 flex-wrap">
          <Link to="/" className="hover:text-black transition-colors">View All</Link>
          <span>/</span>
          <Link to="/" className="hover:text-black transition-colors">
            {product.bestseller ? "Best Sellers" : brandLabel}
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{product.name}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">

          {/* ── Image gallery ── */}
          <div className="flex-1 max-w-xl w-full mx-auto lg:mx-0">
            <div
              className="relative border border-gray-200 rounded-xl overflow-hidden bg-gray-50"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              {product.designs?.length > 0 && (
                <div className="absolute top-3 left-3 z-10">
                  <span
                    className="bg-gray-800 text-white text-xs font-semibold px-3 py-1.5 rounded"
                    style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%, 8% 50%)" }}
                  >
                    {product.designs.length} Designs
                  </span>
                </div>
              )}

              <img
                src={images[mainImageIndex]}
                alt={product.name}
                className="w-full object-contain aspect-square p-6 transition-transform duration-200"
                style={zoomStyle}
              />

              {images.length > 1 && (
                <>
                  <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white border border-gray-300 rounded-full p-2 shadow hover:shadow-md transition">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M14.78 20L6 12l8.78-8L17 6.02 10.44 12 17 17.98z" fill="#333" /></svg>
                  </button>
                  <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white border border-gray-300 rounded-full p-2 shadow hover:shadow-md transition">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M8.22 20L6 17.98 12.56 12 6 6.02 8.22 4l8.78 8z" fill="#333" /></svg>
                  </button>
                </>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-3 mt-3 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setMainImageIndex(i)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg border-2 overflow-hidden transition-all ${
                      mainImageIndex === i ? "border-black" : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-contain p-1 bg-white" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Product info ── */}
          <div className="flex-1 lg:max-w-lg">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">{product.name}</h1>
            <p className="text-gray-500 mt-1 text-base">{brandLabel}</p>
            <p className="text-xl font-bold text-gray-900 mt-2">${product.price.toFixed(2)}</p>

            {/* Order tabs */}
            <div className="flex border-b border-gray-200 mt-5 mb-5">
              {["single", "bulk"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => { setOrderTab(tab); setSelectedSize(null); setSizeError(false); setBulkError(false); }}
                  className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
                    orderTab === tab ? "border-black text-black" : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab === "single" ? "Single Order" : "Bulk Order"}
                </button>
              ))}
            </div>

            {/* Design */}
            {product.designs?.length > 0 && (
              <div className="mb-5">
                <p className="text-sm font-semibold text-gray-800 mb-2">Choose Your Design</p>
                <div className="grid grid-cols-2 gap-2">
                  {product.designs.map((design, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedDesign(design)}
                      className={`px-3 py-2.5 text-sm rounded border transition-all text-left ${
                        selectedDesign === design ? "border-black bg-gray-50 font-medium" : "border-gray-300 hover:border-gray-500"
                      }`}
                    >
                      {design}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color */}
            <div className="mb-5">
              <p className="text-sm font-semibold text-gray-800 mb-2">
                Color: <span className="font-normal text-gray-600">{selectedVariant?.color}</span>
              </p>
              <div className="flex gap-3">
                {product.variants.map((variant, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedVariant(variant)}
                    title={variant.color}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      selectedVariant === variant ? "border-black ring-2 ring-black ring-offset-2" : "border-gray-300 hover:border-gray-500"
                    }`}
                    style={{ backgroundColor: variant.color.toLowerCase() }}
                  />
                ))}
              </div>
            </div>

            {/* Size */}
            {hasSizes && (
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                  <p className={`text-sm font-semibold transition-colors ${
                    (sizeError && orderTab === "single") || (bulkError && orderTab === "bulk")
                      ? "text-red-600" : "text-gray-800"
                  }`}>
                    {orderTab === "single" ? "Size:" : "Sizes:"}
                    {sizeError && orderTab === "single" && (
                      <span className="ml-2 text-xs font-normal text-red-400">← please select</span>
                    )}
                    {bulkError && orderTab === "bulk" && (
                      <span className="ml-2 text-xs font-normal text-red-400">← enter at least one qty</span>
                    )}
                  </p>
                  <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-black">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="7" width="20" height="10" rx="1" />
                      <path d="M7 7V5M12 7V5M17 7V5" />
                    </svg>
                    Size Chart
                  </button>
                </div>

                {/* Single size buttons */}
                {orderTab === "single" ? (
                  <div className={`flex flex-wrap gap-2 p-2 rounded-lg transition-all ${sizeError ? "bg-red-50 ring-1 ring-red-300" : ""}`}>
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => { setSelectedSize(size); setSizeError(false); }}
                        className={`px-4 py-2 text-sm rounded border transition-all ${
                          selectedSize === size
                            ? "border-black bg-black text-white font-medium"
                            : sizeError
                            ? "border-red-300 text-gray-700 hover:border-red-500"
                            : "border-gray-300 text-gray-700 hover:border-gray-600"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                ) : (
                  /* Bulk size inputs */
                  <div className={`rounded-lg transition-all ${bulkError ? "bg-red-50 ring-1 ring-red-300 p-2" : ""}`}>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {product.sizes.map((size) => (
                        <div
                          key={size}
                          className={`flex items-center justify-between border rounded-lg px-3 py-2 transition-all ${
                            bulkError && (!bulkQty[size] || parseInt(bulkQty[size]) === 0)
                              ? "border-red-300 bg-white"
                              : parseInt(bulkQty[size]) > 0
                              ? "border-black bg-gray-50"
                              : "border-gray-300"
                          }`}
                        >
                          <span className="font-medium text-sm">{size}</span>
                          <input
                            type="number"
                            min="0"
                            value={bulkQty[size] || ""}
                            onChange={(e) => {
                              setBulkQty({ ...bulkQty, [size]: e.target.value });
                              setBulkError(false);
                            }}
                            placeholder="0"
                            className="w-14 border border-gray-300 rounded px-2 py-1 text-sm outline-none text-center"
                          />
                        </div>
                      ))}
                    </div>

                    {/* Bulk summary row */}
                    {totalBulkQty > 0 && (
                      <div className="mt-3 flex items-center justify-between text-sm text-gray-600 border-t border-gray-200 pt-3">
                        <span>Total qty: <span className="font-semibold text-gray-900">{totalBulkQty}</span></span>
                        <span>Subtotal: <span className="font-semibold text-gray-900">${(totalBulkQty * product.price).toFixed(2)}</span></span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Qty stepper (single only) + Add to Cart */}
            <div className="flex items-stretch gap-3 mt-6">
              {orderTab === "single" && (
                <div className="flex flex-col border border-gray-300 rounded-md overflow-hidden">
                  <button onClick={() => setQty((q) => q + 1)} className="px-3 py-1 hover:bg-gray-100 text-gray-600 text-lg leading-none">∧</button>
                  <span className="px-4 py-1 text-center text-sm font-medium border-y border-gray-300">{qty}</span>
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-3 py-1 hover:bg-gray-100 text-gray-600 text-lg leading-none">∨</button>
                </div>
              )}

              <button
                onClick={handleAddToCart}
                className="flex-1 bg-gray-900 hover:bg-black text-white font-semibold py-3 rounded-md text-sm transition-colors"
              >
                {orderTab === "bulk" && totalBulkQty > 0
                  ? `Add ${totalBulkQty} Items to Cart`
                  : "Add to Cart"}
              </button>
            </div>

            {/* Description */}
            {product.description && (
              <div className="mt-8 border-t border-gray-100 pt-6">
                <p className="text-md font-bold text-gray-800 mb-2">Description</p>
                <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* ══ YOU MAY ALSO LIKE ══ */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 border-t border-gray-100 pt-10">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">You May Also Like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedProducts.map((item) => (
                <ProductCard key={item._id} product={item} />
              ))}
            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}

// ── Reusable error toast ──────────────────────────────────────────────────────
function Toast({ show, message }) {
  return (
    <div
      className={`fixed top-24 left-1/2 -translate-x-1/2 z-[9999] transition-all duration-300 ${
        show ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
      }`}
    >
      <div className="flex items-center gap-2.5 bg-white border border-red-200 shadow-lg rounded-lg px-5 py-3 whitespace-nowrap">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <p className="text-sm font-semibold text-red-600">{message}</p>
      </div>
    </div>
  );
}
