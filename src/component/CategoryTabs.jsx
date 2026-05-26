import { useRef, useState, useEffect } from "react";
import { menuItems } from "../data/menuItems";
import { useStore } from "../context/StoreContext";

export default function CategoryTabs() {
  const { filter, selectFilter } = useStore();

  const scrollRef = useRef(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);

  // Derived from context — guaranteed in sync with Navbar clicks too
  const activeIndex = menuItems.findIndex((item) => item.value === filter.category);

  // ─── Scroll arrows ─────────────────────────────────────────────────────────
  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setShowLeft(el.scrollLeft > 0);
    setShowRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 5);
  };

  useEffect(() => { handleScroll(); }, []);

  const scroll = (dir) => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -250 : 250, behavior: "smooth" });
  };

  // ─── Sticky shadow ─────────────────────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ─── Close dropdown on outside click ──────────────────────────────────────
  useEffect(() => {
    if (openDropdown === null) return;
    const close = () => setOpenDropdown(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [openDropdown]);

  return (
    <div
      className={`hidden md:block sticky top-[110px] z-40 bg-white px-10 py-1 transition-all duration-300 ${
        isScrolled ? "shadow-md" : ""
      }`}
    >
      {/* LEFT ARROW */}
      {showLeft && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-0 bottom-0 z-20 bg-white px-2 flex items-center"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M15.41 16.58L10.83 12 15.41 7.41 14 6 8 12 14 18z" />
          </svg>
        </button>
      )}

      {/* SCROLL AREA */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto scroll-smooth whitespace-nowrap scrollbar-hide"
      >
        {menuItems.map((item, index) => (
          <div key={item.value ?? index} className="flex items-center">

            {/* TAB LABEL — clicking sets category, clears subCategory */}
            <span
              onClick={() => {
                selectFilter(item.value, null);
                setOpenDropdown(null);
              }}
              className={`px-4 py-4 cursor-pointer text-sm sm:text-lg transition-all ${
                activeIndex === index
                  ? "font-bold text-black border-b-2 border-black"
                  : "font-medium text-gray-600 hover:text-black"
              }`}
            >
              {item.name}
            </span>

            {/* DROPDOWN CHEVRON */}
            {item.hasDropdown && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenDropdown(openDropdown === index ? null : index);
                }}
                className="px-2"
              >
                <svg
                  className={`w-5 h-5 transition-transform ${
                    openDropdown === index ? "rotate-180" : ""
                  }`}
                  viewBox="0 0 24 24"
                >
                  <path d="M7 10l5 5 5-5z" />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>

      {/* RIGHT ARROW */}
      {showRight && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-0 bottom-0 z-20 bg-white px-2 flex items-center"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M8.59 16.58L13.17 12 8.59 7.41 10 6 16 12 10 18z" />
          </svg>
        </button>
      )}

      {/* DROPDOWN PANELS — rendered outside scroll area */}
      {menuItems.map((item, index) => {
        if (!item.hasDropdown || openDropdown !== index) return null;
        const el = scrollRef.current?.children[index];

        return (
          <div
            key={index}
            className="absolute bg-white shadow-lg border rounded-md z-[999]"
            style={{
              top: "50px",
              left: (el?.offsetLeft ?? 0) + (el?.offsetWidth ?? 0) - 120,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {item.dropdown.map((sub, i) => (
              <div
                key={sub.value ?? i}
                onClick={() => {
                  // Pass both parent and child → hierarchical filter
                  selectFilter(item.value, sub.value);
                  setOpenDropdown(null);
                }}
                className={`px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm whitespace-nowrap ${
                  filter.category === item.value && filter.subCategory === sub.value
                    ? "font-bold bg-gray-50"
                    : ""
                }`}
              >
                {sub.name}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
