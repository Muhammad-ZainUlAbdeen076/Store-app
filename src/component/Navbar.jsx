import { useState } from "react";
import { useEffect } from "react";
import { menuItems } from "../data/menuItems";






export default function Navbar({ setActiveFilter }) {
  const [active, setActive] = useState(null);
  const [menuStack, setMenuStack] = useState([]);
const [isScrolled, setIsScrolled] = useState(false);


 


const handleMenuClick = (item) => {
  if (item.hasDropdown) {
    setMenuStack([...menuStack, item]);
  } else {
    handleCategoryClick(item.value); // 🔥 FILTER TRIGGER
  }
};

const handleCategoryClick = (value) => {
   setActiveFilter(value);   // 🔥 main filtering yahan se hogi
  setActive(null);      // menu close
  setMenuStack([]);     // reset stack
};

const handleBack = () => {
  setMenuStack(menuStack.slice(0, -1));
};




  useEffect(() => {
  const handleScroll = () => {
    if (window.scrollY > 50) {
      setIsScrolled(true);
    } else {
      setIsScrolled(false);
    }
  };

  window.addEventListener("scroll", handleScroll);

  return () => window.removeEventListener("scroll", handleScroll);
}, []);



  return (
    <div className="w-full sticky top-0 z-50 ">

      {/* TOP BAR */}
      <div className="bg-red-600 text-white text-center py-1 text-sm font-semibold">
        PREVIEW – NOT A LIVE STORE
      </div>

      {/* ================= MOBILE NAVBAR ================= */}
      <div className={`flex items-center justify-between px-4 py-3 border-b md:hidden bg-gray-100 transition-all duration-100 ${
    isScrolled ? "mt-0" : "mt-10"
  }`}>

        {/* LEFT: HAMBURGER */}
        <button onClick={() => setActive("menu")}>
          <svg width="22" height="22" viewBox="0 0 24 24">
            <path d="M4 6h16M4 12h16M4 18h16" stroke="black" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>

        {/* CENTER: LOGO */}
        <img src="/src/assets/logo.png" alt="logo" className="w-10" />

        {/* RIGHT */}
        <div className="flex items-center gap-4">

          {/* SEARCH */}
          <button onClick={() => setActive("search")}>
                <svg
  xmlns="http://www.w3.org/2000/svg"
  width="18"
  height="15"
  viewBox="0 0 18 18"
  fill="none"
  className="mr-2"
>
  <path
    d="M11.625 10.5H11.0325L10.8225 10.2975C11.5575 9.4425 12 8.3325 12 7.125C12 4.4325 9.8175 2.25 7.125 2.25C4.4325 2.25 2.25 4.4325 2.25 7.125C2.25 9.8175 4.4325 12 7.125 12C8.3325 12 9.4425 11.5575 10.2975 10.8225L10.5 11.0325V11.625L14.25 15.3675L15.3675 14.25L11.625 10.5ZM7.125 10.5C5.2575 10.5 3.75 8.9925 3.75 7.125C3.75 5.2575 5.2575 3.75 7.125 3.75C8.9925 3.75 10.5 5.2575 10.5 7.125C10.5 8.9925 8.9925 10.5 7.125 10.5Z"
    fill="currentColor"
  />
</svg>
          </button>

          {/* CART */}
           <svg
  xmlns="http://www.w3.org/2000/svg"
  width="16"
  height="18"
  viewBox="0 0 12 16"
  fill="none"
  className="cursor-pointer"
>
  <path
    d="M1.5 15C1.0875 15 0.734375 14.8531 0.440625 14.5594C0.146875 14.2656 0 13.9125 0 13.5V4.5C0 4.0875 0.146875 3.73437 0.440625 3.44062C0.734375 3.14687 1.0875 3 1.5 3H3C3 2.175 3.29375 1.46875 3.88125 0.88125C4.46875 0.29375 5.175 0 6 0C6.825 0 7.53125 0.29375 8.11875 0.88125C8.70625 1.46875 9 2.175 9 3H10.5C10.9125 3 11.2656 3.14687 11.5594 3.44062C11.8531 3.73437 12 4.0875 12 4.5V13.5C12 13.9125 11.8531 14.2656 11.5594 14.5594C11.2656 14.8531 10.9125 15 10.5 15H1.5ZM1.5 13.5H10.5V4.5H9V6C9 6.2125 8.92812 6.39062 8.78437 6.53437C8.64062 6.67812 8.4625 6.75 8.25 6.75C8.0375 6.75 7.85937 6.67812 7.71562 6.53437C7.57187 6.39062 7.5 6.2125 7.5 6V4.5H4.5V6C4.5 6.2125 4.42812 6.39062 4.28437 6.53437C4.14062 6.67812 3.9625 6.75 3.75 6.75C3.5375 6.75 3.35937 6.67812 3.21562 6.53437C3.07187 6.39062 3 6.2125 3 6V4.5H1.5V13.5ZM4.5 3H7.5C7.5 2.5875 7.35312 2.23437 7.05937 1.94062C6.76562 1.64687 6.4125 1.5 6 1.5C5.5875 1.5 5.23437 1.64687 4.94062 1.94062C4.64687 2.23437 4.5 2.5875 4.5 3Z"
    fill="currentColor"
  />
</svg>

        </div>
      </div>

      {/* ================= DESKTOP HEADER ================= */}
      <div
  className={`hidden md:flex items-center justify-between px-6 py-2 bg-gray-50 border border-gray-200 transition-all duration-100 ${
    isScrolled ? "mt-0" : "mt-12"
  }`}
>

  {/* LOGO */}
  <div className="flex items-center gap-3">
    <img src="/src/assets/logo.png" className="w-18" />
    <h1 className="font-bold text-lg">
      Texas LYNX Baseball & Softball
    </h1>
  </div>

  {/* RIGHT SIDE (SEARCH + CART) */}
  <div className="flex items-center gap-4">

    {/* SEARCH */}
    <div className="flex items-center border border-gray-200 px-2 py-2 rounded-lg w-80">
          <svg
  xmlns="http://www.w3.org/2000/svg"
  width="18"
  height="18"
  viewBox="0 0 18 18"
  fill="none"
  className="mr-2"
>
  <path
    d="M11.625 10.5H11.0325L10.8225 10.2975C11.5575 9.4425 12 8.3325 12 7.125C12 4.4325 9.8175 2.25 7.125 2.25C4.4325 2.25 2.25 4.4325 2.25 7.125C2.25 9.8175 4.4325 12 7.125 12C8.3325 12 9.4425 11.5575 10.2975 10.8225L10.5 11.0325V11.625L14.25 15.3675L15.3675 14.25L11.625 10.5ZM7.125 10.5C5.2575 10.5 3.75 8.9925 3.75 7.125C3.75 5.2575 5.2575 3.75 7.125 3.75C8.9925 3.75 10.5 5.2575 10.5 7.125C10.5 8.9925 8.9925 10.5 7.125 10.5Z"
    fill="currentColor"
  />
</svg>

      <input
        type="text"
        placeholder="Search..."
        className="outline-none w-full"
      />
    </div>

    {/* CART */}
    <div>
      <svg
  xmlns="http://www.w3.org/2000/svg"
  width="16"
  height="18"
  viewBox="0 0 12 16"
  fill="none"
  className="cursor-pointer"
>
  <path
    d="M1.5 15C1.0875 15 0.734375 14.8531 0.440625 14.5594C0.146875 14.2656 0 13.9125 0 13.5V4.5C0 4.0875 0.146875 3.73437 0.440625 3.44062C0.734375 3.14687 1.0875 3 1.5 3H3C3 2.175 3.29375 1.46875 3.88125 0.88125C4.46875 0.29375 5.175 0 6 0C6.825 0 7.53125 0.29375 8.11875 0.88125C8.70625 1.46875 9 2.175 9 3H10.5C10.9125 3 11.2656 3.14687 11.5594 3.44062C11.8531 3.73437 12 4.0875 12 4.5V13.5C12 13.9125 11.8531 14.2656 11.5594 14.5594C11.2656 14.8531 10.9125 15 10.5 15H1.5ZM1.5 13.5H10.5V4.5H9V6C9 6.2125 8.92812 6.39062 8.78437 6.53437C8.64062 6.67812 8.4625 6.75 8.25 6.75C8.0375 6.75 7.85937 6.67812 7.71562 6.53437C7.57187 6.39062 7.5 6.2125 7.5 6V4.5H4.5V6C4.5 6.2125 4.42812 6.39062 4.28437 6.53437C4.14062 6.67812 3.9625 6.75 3.75 6.75C3.5375 6.75 3.35937 6.67812 3.21562 6.53437C3.07187 6.39062 3 6.2125 3 6V4.5H1.5V13.5ZM4.5 3H7.5C7.5 2.5875 7.35312 2.23437 7.05937 1.94062C6.76562 1.64687 6.4125 1.5 6 1.5C5.5875 1.5 5.23437 1.64687 4.94062 1.94062C4.64687 2.23437 4.5 2.5875 4.5 3Z"
    fill="currentColor"
  />
</svg>
    </div>

  </div>
</div>

    {active === "menu" && (
  <div className="fixed top-0 left-0 w-[80%] h-full bg-white z-50 shadow-lg">

    {/* HEADER */}
    <div className="flex items-center justify-between p-4 border-b">
      
      {menuStack.length > 0 ? (
        <button onClick={handleBack}>← Back</button>
      ) : (
        <h2 className="font-semibold text-lg">Menu</h2>
      )}

      <button
  onClick={() => {
    setActive(null);
    setMenuStack([]);
  }}
  style={{ fontSize: "24px" }}
>
  ✕
</button>
    </div>

    {/* MENU LIST */}
    <div  className="p-4 flow-circular-regular ">
      {(menuStack.length === 0
        ? menuItems
        : menuStack[menuStack.length - 1].dropdown
      ).map((item, index) => (
        
        <div
          key={index}
         onClick={() => handleMenuClick(item)}
          className="flex justify-between items-center py-3  cursor-pointer"
        >
          <span>{typeof item === "string" ? item : item.name}</span>

          {/* ARROW */}
         {item.hasDropdown && <span>›</span>}
        </div>
      ))}
    </div>

  </div>
)}

    </div>
  );
}