import { useRef, useState, useEffect } from "react";
import { menuItems } from "../data/menuItems";




export default function CategoryTabs({ setActiveFilter }) {
  const scrollRef = useRef(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);
  const [openDropdown, setOpenDropdown] = useState(null);
 const [isScrolled, setIsScrolled] = useState(false);
  

  // 🔥 scroll check
  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;

    setShowLeft(el.scrollLeft > 0);
    setShowRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 5);
  };

  useEffect(() => {
    handleScroll();
  }, []);

  const scroll = (dir) => {
    scrollRef.current.scrollBy({
      left: dir === "left" ? -250 : 250,
      behavior: "smooth",
    });
  };




useEffect(() => {
  const handleWindowScroll = () => {
    if (window.scrollY > 50) {
      setIsScrolled(true);
    } else {
      setIsScrolled(false);
    }
  };

  window.addEventListener("scroll", handleWindowScroll);

  return () => window.removeEventListener("scroll", handleWindowScroll);
}, []);




  
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

      {/* SCROLL AREA (ONLY TABS INSIDE) */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto scroll-smooth whitespace-nowrap scrollbar-hide"
      >
        {menuItems.map((item, index) => (
         <div key={item.value || index}  className="flex items-center">

  {/* 🔹 TEXT CLICK (FILTER) */}
  <span
    onClick={() => {
      setActiveIndex(index);
      setOpenDropdown(null);
      setActiveFilter(item.value);
    }}
    className={`px-4 py-4 cursor-pointer text-sm sm:text-lg transition-all ${
      activeIndex === index
        ? "font-bold text-black border-b-2 border-black"
        : "font-medium text-gray-600 hover:text-black"
    }`}
  >
    {item.name}
  </span>

  {/* 🔹 ARROW CLICK (DROPDOWN) */}
  {item.hasDropdown && (
    <button
      onClick={(e) => {
        e.stopPropagation(); // 🔥 VERY IMPORTANT
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

      {/* 🔥 DROPDOWN (OUTSIDE SCROLL AREA - FIXED POSITION) */}
      {menuItems.map((item, index) => {
        if (!item.hasDropdown || openDropdown !== index) return null;

        const el = scrollRef.current?.children[index];

        return (
          <div
            key={index}
            className="absolute bg-white shadow-lg border rounded-md z-[999]"
            style={{
              top: "50px",
              left: (el?.offsetLeft || 0) + (el?.offsetWidth || 0) - 120,
            }}
          >
            {item.dropdown.map((sub, i) => (
              <div
  key={sub.value || i}
  onClick={() => {
    setActiveFilter(sub.value); // 🔥 IMPORTANT
    setOpenDropdown(null);
  }}
  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
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