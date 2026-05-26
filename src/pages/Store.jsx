import { useState, useRef, useEffect, useMemo } from "react";
import { useStore } from "../context/StoreContext";
import ProductCard from "../component/ProductCard";

// ─── Sort options ─────────────────────────────────────────────────────────────
const SORT_OPTIONS = [
  { value: "default",        label: "Default" },
  { value: "price-high-low", label: "Price High to Low" },
  { value: "price-low-high", label: "Price Low to High" },
  { value: "vendor-az",      label: "Vendor A-Z" },
  { value: "vendor-za",      label: "Vendor Z-A" },
  { value: "style-az",       label: "Style A-Z" },
  { value: "style-za",       label: "Style Z-A" },
  { value: "name-az",        label: "Product Name A-Z" },
  { value: "name-za",        label: "Product Name Z-A" },
];

/**
 * VIEW ALL section tree
 * ─────────────────────
 * Each top-level entry = a parent category (bold heading, no divider)
 * Each sub-entry      = a sub-section (divider line above title, like screenshot)
 *
 * If a parent has NO sub-entries → its `filter` is used directly (flat section).
 * If a parent HAS sub-entries   → each sub-entry renders separately under the parent.
 */
const SECTIONS = [
  {
    key: "bestsellers",
    title: "Best Sellers",
    filter: (p) => p.bestseller,
  },
  {
    key: "oakley",
    title: "Oakley Eyewear",
    subs: [
      { key: "oakley-perf",      title: "Performance", filter: (p) => p.brand === "oakley" && p.type === "performance" },
      { key: "oakley-life",      title: "Lifestyle",   filter: (p) => p.brand === "oakley" && p.type === "lifestyle"   },
    ],
  },
  {
    key: "nb-footwear",
    title: "New Balance Footwear",
    subs: [
      { key: "nbf-men",   title: "Men's",   filter: (p) => p.brand === "new balance" && p.type === "footwear" && (p.category === "Men"   || p.category === "Both") },
      { key: "nbf-women", title: "Women's", filter: (p) => p.brand === "new balance" && p.type === "footwear" && (p.category === "Women" || p.category === "Both") },
    ],
  },
  {
    key: "nb-apparel",
    title: "New Balance Apparel",
    subs: [
      { key: "nba-men",   title: "Men's",   filter: (p) => p.brand === "new balance" && p.type === "apparel" && (p.category === "Men"   || p.category === "Both") },
      { key: "nba-women", title: "Women's", filter: (p) => p.brand === "new balance" && p.type === "apparel" && (p.category === "Women" || p.category === "Both") },
      { key: "nba-kids",  title: "Youth",   filter: (p) => p.brand === "new balance" && p.type === "apparel" && (p.category === "Kids"  || p.category === "Both") },
    ],
  },
  {
    key: "gear",
    title: "G-Form Protective Gear",
    filter: (p) => p.brand === "g-form",
  },
  {
    key: "lizard",
    title: "Lizard Skins Accessories",
    filter: (p) => p.brand === "lizard skins",
  },
  {
    key: "lynx",
    title: "LYNX Alternate Logo",
    filter: (p) => p.brand === "lynx",
  },
];

// ─── Product grid ─────────────────────────────────────────────────────────────
function ProductGrid({ products }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-4">
      {products.map((item) => (
        <ProductCard key={item._id} product={item} />
      ))}
    </div>
  );
}

// ─── Sub-section block (divider line + title, exactly like screenshot) ─────────
function SubSection({ title, products }) {
  if (products.length === 0) return null;
  return (
    <div className="mt-8">
      {/* Divider + sub title — matches screenshot */}
      <div className="border-b border-gray-300 pb-1 mb-4">
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
      </div>
      <ProductGrid products={products} />
    </div>
  );
}

// ─── Sort button (used in both modes) ─────────────────────────────────────────
function SortButton({ sortBy, setSortBy }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-1.5 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors select-none"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="21" y1="6"  x2="3"  y2="6"  />
          <line x1="21" y1="10" x2="9"  y2="10" />
          <line x1="21" y1="14" x2="3"  y2="14" />
          <line x1="21" y1="18" x2="13" y2="18" />
        </svg>
        Sort By
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-xl z-[999] py-1 overflow-hidden">
          {SORT_OPTIONS.map((opt) => {
            const isActive = sortBy === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => { setSortBy(opt.value); setOpen(false); }}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-colors
                  ${isActive ? "font-semibold text-black" : "text-gray-700 hover:bg-gray-50"}`}
              >
                {opt.label}
                {isActive && (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main Store component ─────────────────────────────────────────────────────
export default function Store() {
  const {
    products,
    filteredProducts,
    filterTitle,
    filter,
    searchQuery,
    selectFilter,
    sortBy,
    setSortBy,
  } = useStore();

  const isViewAll = filter.category === "all" && !searchQuery.trim();

  // Build the section tree for View All, applying current sort inside each group
  const builtSections = useMemo(() => {
    if (!isViewAll) return [];

    const sortItems = (arr) => {
      const a = [...arr];
      switch (sortBy) {
        case "price-high-low": return a.sort((x, y) => y.price - x.price);
        case "price-low-high": return a.sort((x, y) => x.price - y.price);
        case "vendor-az":  return a.sort((x, y) => (x.brand ?? "").localeCompare(y.brand ?? ""));
        case "vendor-za":  return a.sort((x, y) => (y.brand ?? "").localeCompare(x.brand ?? ""));
        case "style-az":   return a.sort((x, y) => (x.type  ?? "").localeCompare(y.type  ?? ""));
        case "style-za":   return a.sort((x, y) => (y.type  ?? "").localeCompare(x.type  ?? ""));
        case "name-az":    return a.sort((x, y) => x.name.localeCompare(y.name));
        case "name-za":    return a.sort((x, y) => y.name.localeCompare(x.name));
        default: return a;
      }
    };

    return SECTIONS
      .map((sec) => {
        if (sec.subs) {
          // Parent with sub-sections
          const builtSubs = sec.subs
            .map((sub) => ({ ...sub, items: sortItems(products.filter(sub.filter)) }))
            .filter((sub) => sub.items.length > 0);
          return { ...sec, builtSubs, hasContent: builtSubs.length > 0 };
        } else {
          // Flat section
          const items = sortItems(products.filter(sec.filter));
          return { ...sec, items, hasContent: items.length > 0 };
        }
      })
      .filter((sec) => sec.hasContent);
  }, [isViewAll, products, sortBy]);

  // ══════════════════════════════════════════════════════
  // VIEW ALL — sectioned layout
  // ══════════════════════════════════════════════════════
  if (isViewAll) {
    return (
      <div className="my-5 px-4 sm:px-6 md:px-10 lg:px-15">

        {/* Page header */}
        <div className="flex items-end justify-between mt-8 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">All Products</h1>
          <SortButton sortBy={sortBy} setSortBy={setSortBy} />
        </div>

        {builtSections.map((sec) => (
          <section key={sec.key} className="mb-12">

            {/* Parent category heading (bold, larger) */}
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
              {sec.title}
            </h2>

            {sec.subs ? (
              // Has sub-sections → render each with divider+title
              sec.builtSubs.map((sub) => (
                <SubSection key={sub.key} title={sub.title} products={sub.items} />
              ))
            ) : (
              // Flat section → products directly under parent title
              <>
                <div className="border-b-2 border-gray-400 pb-1 mb-4" />
                <ProductGrid products={sec.items} />
              </>
            )}
          </section>
        ))}
      </div>
    );
  }

  // ══════════════════════════════════════════════════════
  // SINGLE CATEGORY / SEARCH — flat grid
  // ══════════════════════════════════════════════════════
  return (
    <div className="my-5">
      <div className="px-4 sm:px-6 md:px-10 lg:px-15 mt-8 mb-1">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
          {filterTitle}
        </h2>
        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
          <span className="text-sm text-gray-500">
            {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""}
          </span>
          {filteredProducts.length > 0 && <SortButton sortBy={sortBy} setSortBy={setSortBy} />}
        </div>
      </div>

      {/* Empty state */}
      {filteredProducts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center px-4">
          <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            {searchQuery ? `No results for "${searchQuery}"` : "No products found"}
          </h3>
          <p className="text-sm text-gray-400 max-w-xs">
            {searchQuery
              ? "Try a different search term or browse by category."
              : "There are no products in this category right now."}
          </p>
          <button
            onClick={() => selectFilter("all", null)}
            className="mt-6 px-5 py-2 bg-black text-white text-sm rounded-full hover:bg-gray-800 transition-colors"
          >
            View All Products
          </button>
        </div>
      )}

      {filteredProducts.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4 sm:px-6 md:px-10 lg:px-15 mt-5">
          {filteredProducts.map((item) => (
            <ProductCard key={item._id} product={item} />
          ))}
        </div>
      )}
    </div>
  );
}
