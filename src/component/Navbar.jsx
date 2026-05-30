import { useState, useEffect, useRef, useMemo } from "react";
import { menuItems } from "../data/menuItems";
import logo from "../assets/logo.png";
import { useStore } from "../context/StoreContext";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const MAX_SUGGESTIONS = 6;

export default function Navbar() {
  const { selectFilter, searchQuery, setSearchQuery, products, cartItems } = useStore();
  const { user, userRole, logout } = useAuth();
  const navigate = useNavigate();

  const [active, setActive] = useState(null);
  const [menuStack, setMenuStack] = useState([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const [desktopDropdownOpen, setDesktopDropdownOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const desktopInputRef     = useRef(null);
  const mobileInputRef      = useRef(null);
  const desktopWrapperRef   = useRef(null);
  const userMenuRef         = useRef(null);
  const mobileAvatarRef     = useRef(null);
  const mobileDropdownRef   = useRef(null); // ← NEW: ref for the mobile dropdown panel

  // ─── Suggestions ──────────────────────────────────────────────────────────
  const suggestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    const seen = new Set();
    const results = [];
    for (const p of products) {
      if (results.length >= MAX_SUGGESTIONS) break;
      const nameMatch  = p.name.toLowerCase().includes(q);
      const brandMatch = p.brand?.toLowerCase().includes(q);
      const typeMatch  = p.type?.toLowerCase().includes(q);
      if ((nameMatch || brandMatch || typeMatch) && !seen.has(p._id)) {
        seen.add(p._id);
        const brandLabel = p.brand
          ? p.brand.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
          : null;
        const typeLabel = p.type
          ? p.type.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
          : null;
        const categoryLabel =
          brandLabel && typeLabel ? `${brandLabel} ${typeLabel}` : brandLabel ?? typeLabel ?? "";
        results.push({ ...p, categoryLabel });
      }
    }
    return results;
  }, [searchQuery, products]);

  // ─── Cart count ───────────────────────────────────────────────────────────
  const cartCount = cartItems.reduce((sum, item) => sum + item.qty, 0);

  // ─── Mobile menu handlers ─────────────────────────────────────────────────
  const handleMenuClick = (item, parentItem = null) => {
    if (item.hasDropdown) {
      setMenuStack([...menuStack, item]);
    } else if (parentItem) {
      selectFilter(parentItem.value, item.value);
      closeMenu();
    } else {
      selectFilter(item.value, null);
      closeMenu();
    }
  };

  const handleBack  = () => setMenuStack(menuStack.slice(0, -1));
  const closeMenu   = () => { setActive(null); setMenuStack([]); };

  const handleSuggestionClick = (product) => {
    setSearchQuery(product.name);
    setDesktopDropdownOpen(false);
    setMobileSearchOpen(false);
  };

  const handleLogout = async () => {
    setUserMenuOpen(false);
    await logout();
    navigate("/");
  };

  const handleNavigateOrders = () => {
    setUserMenuOpen(false);
    navigate("/orders");
  };

  const handleNavigateAdmin = () => {
    setUserMenuOpen(false);
    navigate("/admin");
  };

  // ─── Outside click closes dropdowns ───────────────────────────────────────
  // KEY FIX: we check BOTH the avatar button AND the dropdown panel.
  // If the touch/click is inside either of them, we do NOT close the menu.
  useEffect(() => {
    const handler = (e) => {
      const inDesktopWrapper = desktopWrapperRef.current?.contains(e.target);
      const inDesktopUserMenu = userMenuRef.current?.contains(e.target);
      const inMobileAvatar = mobileAvatarRef.current?.contains(e.target);
      const inMobileDropdown = mobileDropdownRef.current?.contains(e.target);

      if (!inDesktopWrapper) {
        setDesktopDropdownOpen(false);
      }
      if (!inDesktopUserMenu && !inMobileAvatar && !inMobileDropdown) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, []);

  // ─── Scroll shadow ────────────────────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ─── Auto-focus mobile search ─────────────────────────────────────────────
  useEffect(() => {
    if (mobileSearchOpen) {
      setTimeout(() => mobileInputRef.current?.focus(), 50);
    }
  }, [mobileSearchOpen]);

  const currentItems  = menuStack.length === 0 ? menuItems : menuStack[menuStack.length - 1].dropdown;
  const currentParent = menuStack.length > 0 ? menuStack[menuStack.length - 1] : null;
  const initials      = user?.email?.slice(0, 2).toUpperCase() ?? "U";

  return (
    <div className="w-full sticky top-0 z-50">

      {/* TOP BAR */}
      <div className="bg-red-600 text-white text-center py-1 text-sm font-semibold">
        PREVIEW – NOT A LIVE STORE
      </div>

      {/* ══════════════════════ MOBILE NAVBAR ══════════════════════ */}
      <div
        className={`flex items-center justify-between px-4 py-3 border-b md:hidden bg-gray-100 transition-all duration-100 ${
          isScrolled ? "mt-0" : "mt-10"
        }`}
      >
        <button onClick={() => setActive("menu")}>
          <svg width="22" height="22" viewBox="0 0 24 24">
            <path d="M4 6h16M4 12h16M4 18h16" stroke="black" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        <img src={logo} alt="logo" className="w-10" />

        <div className="flex items-center gap-3">
          <button onClick={() => setMobileSearchOpen(true)}>
            <SearchIcon />
          </button>
          <CartIcon count={cartCount} onClick={() => navigate("/cart")} />

          {/* Mobile user avatar */}
          {user ? (
            <button
              ref={mobileAvatarRef}
              onClick={() => setUserMenuOpen((o) => !o)}
              className="w-7 h-7 rounded-full bg-gray-900 text-white text-xs font-bold flex items-center justify-center"
            >
              {initials}
            </button>
          ) : (
            <Link to="/login" className="text-xs font-semibold text-gray-700">
              Login
            </Link>
          )}
        </div>
      </div>

      {/* ══════════════════════ DESKTOP NAVBAR ══════════════════════ */}
      <div
        className={`hidden md:flex items-center justify-between px-6 py-2 bg-gray-50 border border-gray-200 transition-all duration-100 ${
          isScrolled ? "mt-0" : "mt-12"
        }`}
      >
        <div className="flex items-center gap-3">
          <img src={logo} className="w-18" alt="logo" />
          <h1 className="font-bold text-lg">Texas LYNX Baseball & Softball</h1>
        </div>

        <div className="flex items-center gap-4">
          {/* Desktop search */}
          <div ref={desktopWrapperRef} className="relative w-80">
            <div className="flex items-center border border-gray-200 px-2 py-2 rounded-lg bg-white">
              <SearchIcon className="mr-2 flex-shrink-0 text-gray-400" />
              <input
                ref={desktopInputRef}
                type="text"
                placeholder="Search..."
                className="outline-none w-full text-sm"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setDesktopDropdownOpen(true); }}
                onFocus={() => setDesktopDropdownOpen(true)}
              />
              {searchQuery && (
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => { setSearchQuery(""); setDesktopDropdownOpen(false); desktopInputRef.current?.focus(); }}
                  className="ml-1 text-gray-400 hover:text-gray-600 text-xl leading-none"
                >×</button>
              )}
            </div>

            {desktopDropdownOpen && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-[999] overflow-hidden">
                {suggestions.map((product) => (
                  <button
                    key={product._id}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSuggestionClick(product)}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 text-left"
                  >
                    <img src={product.variants[0]?.images[0]} alt={product.name} className="w-8 h-8 object-cover rounded flex-shrink-0 bg-gray-100" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{product.name}</p>
                      <p className="text-xs text-gray-400 truncate">{product.categoryLabel}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <CartIcon count={cartCount} onClick={() => navigate("/cart")} />

          {/* Desktop user menu */}
          {user ? (
            <div ref={userMenuRef} className="relative">
              <button
                onClick={() => setUserMenuOpen((o) => !o)}
                className="w-9 h-9 rounded-full bg-gray-900 text-white text-sm font-bold flex items-center justify-center hover:bg-black transition-colors"
              >
                {initials}
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-xl z-[9999] overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-xs text-gray-400">Signed in as</p>
                    <p className="text-sm font-semibold text-gray-800 truncate">{user.email}</p>
                  </div>

                  {userRole === "admin" && (
                    <button
                      onClick={handleNavigateAdmin}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                      </svg>
                      Admin Panel
                    </button>
                  )}

                  <button
                    onClick={handleNavigateOrders}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/>
                      <line x1="16" y1="17" x2="8" y2="17"/>
                    </svg>
                    My Orders
                  </button>

                  <div className="border-t border-gray-100">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                        <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                      </svg>
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="text-sm font-semibold text-gray-700 hover:text-black transition-colors">
                Login
              </Link>
              <Link to="/signup" className="text-sm font-semibold bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-black transition-colors">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════ MOBILE SEARCH OVERLAY ══════════════════════ */}
      {mobileSearchOpen && (
        <div className="fixed inset-0 bg-black/30 z-[999] md:hidden">
          <div className="bg-white px-3 py-3 shadow-md">
            <div className="flex items-center gap-2">
              <div className="flex items-center flex-1 bg-gray-100 border border-gray-200 rounded-lg px-3 py-2">
                <SearchIcon className="text-gray-400 mr-2 flex-shrink-0" />
                <input
                  ref={mobileInputRef}
                  type="text"
                  placeholder="Search..."
                  className="flex-1 outline-none bg-transparent text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
                )}
              </div>
              <button
                onClick={() => { setMobileSearchOpen(false); setSearchQuery(""); }}
                className="text-sm font-medium text-gray-600"
              >
                Cancel
              </button>
            </div>

            <div className="mt-3">
              {suggestions.length > 0 ? (
                <div className="bg-white rounded-lg overflow-hidden">
                  {suggestions.map((product) => (
                    <button
                      key={product._id}
                      onClick={() => { handleSuggestionClick(product); setMobileSearchOpen(false); }}
                      className="w-full flex items-center gap-3 px-2 py-3 border-b border-gray-100 text-left hover:bg-gray-50"
                    >
                      <img src={product.variants[0]?.images[0]} alt={product.name} className="w-10 h-10 object-cover rounded-md bg-gray-100" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{product.name}</p>
                        <p className="text-xs text-gray-400 truncate">{product.categoryLabel}</p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : searchQuery ? (
                <div className="bg-white rounded-lg p-4 text-center text-sm text-gray-400">
                  No results for <span className="font-semibold text-gray-600">"{searchQuery}"</span>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════ MOBILE USER DROPDOWN ══════════════════════ */}
      {/* KEY FIX: ref attached here so outside-click handler knows not to close it */}
      {userMenuOpen && user && (
        <div
          ref={mobileDropdownRef}
          className="md:hidden fixed top-24 right-4 w-52 bg-white border border-gray-200 rounded-xl shadow-xl z-[9999] overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-xs text-gray-400">Signed in as</p>
            <p className="text-sm font-semibold text-gray-800 truncate">{user.email}</p>
          </div>

          {userRole === "admin" && (
            <button
              onClick={handleNavigateAdmin}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
              </svg>
              Admin Panel
            </button>
          )}

          <button
            onClick={handleNavigateOrders}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
            My Orders
          </button>

          <div className="border-t border-gray-100">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 text-left"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Logout
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════ MOBILE MENU DRAWER ══════════════════════ */}
      {active === "menu" && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40" onClick={closeMenu} />
          <div className="fixed top-0 left-0 w-[80%] h-full bg-white z-50 shadow-lg flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              {menuStack.length > 0 ? (
                <button onClick={handleBack} className="text-sm font-medium">← Back</button>
              ) : (
                <h2 className="font-semibold text-lg">Menu</h2>
              )}
              <button onClick={closeMenu} className="text-2xl leading-none px-1">✕</button>
            </div>

            {currentParent && (
              <div className="px-4 pt-3 pb-1 text-xs font-bold uppercase tracking-widest text-gray-400">
                {currentParent.name}
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-4">
              {currentItems.map((item, index) => (
                <div
                  key={item.value ?? index}
                  onClick={() => handleMenuClick(item, currentParent)}
                  className="flex justify-between items-center py-3 cursor-pointer border-b border-gray-100 last:border-0"
                >
                  <span className="text-sm">{item.name}</span>
                  {item.hasDropdown && <span className="text-gray-400">›</span>}
                </div>
              ))}
            </div>

            {/* Bottom login/logout */}
            <div className="border-t border-gray-200 p-4">
              {user ? (
                <button
                  onClick={handleLogout}
                  className="w-full py-2.5 text-sm font-semibold text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Logout
                </button>
              ) : (
                <div className="flex gap-2">
                  <Link
                    to="/login"
                    onClick={closeMenu}
                    className="flex-1 py-2.5 text-sm font-semibold text-center border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    onClick={closeMenu}
                    className="flex-1 py-2.5 text-sm font-semibold text-center bg-gray-900 text-white rounded-lg hover:bg-black transition-colors"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────
function SearchIcon({ className = "" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none" className={className}>
      <path d="M11.625 10.5H11.0325L10.8225 10.2975C11.5575 9.4425 12 8.3325 12 7.125C12 4.4325 9.8175 2.25 7.125 2.25C4.4325 2.25 2.25 4.4325 2.25 7.125C2.25 9.8175 4.4325 12 7.125 12C8.3325 12 9.4425 11.5575 10.2975 10.8225L10.5 11.0325V11.625L14.25 15.3675L15.3675 14.25L11.625 10.5ZM7.125 10.5C5.2575 10.5 3.75 8.9925 3.75 7.125C3.75 5.2575 5.2575 3.75 7.125 3.75C8.9925 3.75 10.5 5.2575 10.5 7.125C10.5 8.9925 8.9925 10.5 7.125 10.5Z" fill="currentColor" />
    </svg>
  );
}

function CartIcon({ count = 0, onClick }) {
  return (
    <button onClick={onClick} className="relative cursor-pointer p-1">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="18" viewBox="0 0 12 16" fill="none">
        <path d="M1.5 15C1.0875 15 0.734375 14.8531 0.440625 14.5594C0.146875 14.2656 0 13.9125 0 13.5V4.5C0 4.0875 0.146875 3.73437 0.440625 3.44062C0.734375 3.14687 1.0875 3 1.5 3H3C3 2.175 3.29375 1.46875 3.88125 0.88125C4.46875 0.29375 5.175 0 6 0C6.825 0 7.53125 0.29375 8.11875 0.88125C8.70625 1.46875 9 2.175 9 3H10.5C10.9125 3 11.2656 3.14687 11.5594 3.44062C11.8531 3.73437 12 4.0875 12 4.5V13.5C12 13.9125 11.8531 14.2656 11.5594 14.5594C11.2656 14.8531 10.9125 15 10.5 15H1.5ZM1.5 13.5H10.5V4.5H9V6C9 6.2125 8.92812 6.39062 8.78437 6.53437C8.64062 6.67812 8.4625 6.75 8.25 6.75C8.0375 6.75 7.85937 6.67812 7.71562 6.53437C7.57187 6.39062 7.5 6.2125 7.5 6V4.5H4.5V6C4.5 6.2125 4.42812 6.39062 4.28437 6.53437C4.14062 6.67812 3.9625 6.75 3.75 6.75C3.5375 6.75 3.35937 6.67812 3.21562 6.53437C3.07187 6.39062 3 6.2125 3 6V4.5H1.5V13.5ZM4.5 3H7.5C7.5 2.5875 7.35312 2.23437 7.05937 1.94062C6.76562 1.64687 6.4125 1.5 6 1.5C5.5875 1.5 5.23437 1.64687 4.94062 1.94062C4.64687 2.23437 4.5 2.5875 4.5 3Z" fill="currentColor" />
      </svg>
      {count > 0 && (
        <span className="absolute -top-1.5 -right-1.5 min-w-[17px] h-[17px] bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5 leading-none">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}
