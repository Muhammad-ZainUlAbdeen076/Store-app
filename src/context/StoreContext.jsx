import { createContext, useContext, useState, useMemo, useEffect } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../firebase/config";

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  // ─── Products from Firestore ───────────────────────────────────────────────
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const snap = await getDocs(query(collection(db, "products"), orderBy("createdAt", "desc")));
        setProducts(snap.docs.map((d) => ({ _id: d.id, ...d.data() })));
      } catch (err) {
        console.error("Products fetch error:", err);
      } finally {
        setProductsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const [filter, setFilter] = useState({ category: "all", subCategory: null });
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("default");

  // ─── Cart ──────────────────────────────────────────────────────────────────
  const [cartItems, setCartItems] = useState([]);
  const [cartModal, setCartModal] = useState(null);

  const addToCart = (product) => {
    const itemWithId = { ...product, cartId: Date.now() + Math.random() };
    setCartItems((prev) => [...prev, itemWithId]);
    setCartModal({ item: itemWithId });
  };

  const removeFromCart = (cartId) => {
    setCartItems((prev) => prev.filter((i) => i.cartId !== cartId));
  };

  const updateCartQty = (cartId, qty) => {
    if (qty < 1) return;
    setCartItems((prev) =>
      prev.map((i) => (i.cartId === cartId ? { ...i, qty } : i))
    );
  };

  const closeCartModal = () => setCartModal(null);

  const cartTotal = useMemo(
    () => cartItems.reduce((sum, i) => sum + i.price * i.qty, 0),
    [cartItems]
  );

  // ─── Filter / sort ─────────────────────────────────────────────────────────
  const selectFilter = (parentValue, childValue = null) => {
    setFilter({ category: parentValue, subCategory: childValue });
    setSearchQuery("");
  };

  const baseFiltered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      return products.filter((p) => {
        const haystack = [p.name, p.brand, p.type, p.category, p.subCategory]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(q);
      });
    }

    const { category, subCategory } = filter;
    if (category === "all") return products;
    if (category === "bestseller") return products.filter((p) => p.bestseller);
    if (category === "lynx") return products.filter((p) => p.brand === "lynx");

    if (category === "oakley") {
      const base = products.filter((p) => p.brand === "oakley");
      return subCategory ? base.filter((p) => p.type === subCategory) : base;
    }

    if (category === "nb-footwear") {
      const base = products.filter(
        (p) => p.brand === "new balance" && p.type === "footwear"
      );
      if (!subCategory) return base;
      const cat = subCategory === "men" ? "Men" : "Women";
      return base.filter((p) => p.category === cat || p.category === "Both");
    }

    if (category === "nb-apparel") {
      const base = products.filter(
        (p) => p.brand === "new balance" && p.type === "apparel"
      );
      if (!subCategory) return base;
      if (subCategory === "men")
        return base.filter((p) => p.category === "Men" || p.category === "Both");
      if (subCategory === "women")
        return base.filter((p) => p.category === "Women" || p.category === "Both");
      if (subCategory === "kids")
        return base.filter((p) => p.category === "Kids" || p.category === "Both");
      return base;
    }

    if (category === "gear") return products.filter((p) => p.brand === "g-form");
    if (category === "skin accessories")
      return products.filter((p) => p.brand === "lizard skins");

    return products.filter(
      (p) => p.brand === category || p.type === category
    );
  }, [filter, searchQuery, products]);

  const filteredProducts = useMemo(() => {
    const arr = [...baseFiltered];
    switch (sortBy) {
      case "price-high-low": return arr.sort((a, b) => b.price - a.price);
      case "price-low-high": return arr.sort((a, b) => a.price - b.price);
      case "vendor-az":  return arr.sort((a, b) => (a.brand ?? "").localeCompare(b.brand ?? ""));
      case "vendor-za":  return arr.sort((a, b) => (b.brand ?? "").localeCompare(a.brand ?? ""));
      case "style-az":   return arr.sort((a, b) => (a.type ?? "").localeCompare(b.type ?? ""));
      case "style-za":   return arr.sort((a, b) => (b.type ?? "").localeCompare(a.type ?? ""));
      case "name-az":    return arr.sort((a, b) => a.name.localeCompare(b.name));
      case "name-za":    return arr.sort((a, b) => b.name.localeCompare(a.name));
      default: return arr;
    }
  }, [baseFiltered, sortBy]);

  const filterTitle = useMemo(() => {
    const q = searchQuery.trim();
    if (q) return `Search Results for "${q}"`;
    const { category, subCategory } = filter;
    if (category === "all") return "All Products";
    if (category === "bestseller") return "Best Sellers";
    if (category === "lynx") return "LYNX Alternate Logo";
    const parentLabels = {
      oakley: "Oakley Eyewear",
      "nb-footwear": "New Balance Footwear",
      "nb-apparel": "New Balance Apparel",
      gear: "G-Form Protective Gear",
      "skin accessories": "Lizard Skins Accessories",
    };
    const subLabels = {
      performance: "Performance", lifestyle: "Lifestyle",
      men: "Men's", women: "Women's", kids: "Youth",
    };
    const parent = parentLabels[category] ?? category;
    return subCategory && subLabels[subCategory]
      ? `${parent} — ${subLabels[subCategory]}`
      : parent;
  }, [filter, searchQuery]);

  return (
    <StoreContext.Provider
      value={{
        products,
        productsLoading,
        filter,
        searchQuery,
        filteredProducts,
        filterTitle,
        selectFilter,
        setSearchQuery,
        sortBy,
        setSortBy,
        cartItems,
        cartTotal,
        addToCart,
        removeFromCart,
        updateCartQty,
        cartModal,
        closeCartModal,
        setCartItems,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}