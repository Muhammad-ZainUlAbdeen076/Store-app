export const menuItems = [
  { name: "View All", value: "all", hasDropdown: false },
  { name: "Best Sellers", value: "bestseller", hasDropdown: false },
  { name: "LYNX Alternate Logo", value: "lynx", hasDropdown: false },

  {
    name: "Oakley Eyewear",
    value: "oakley",
    hasDropdown: true,
    dropdown: [
      { name: "Performance", value: "performance" },
      { name: "Lifestyle", value: "lifestyle" },
    ],
  },

  {
    name: "New Balance Footwear",
    value: "nb-footwear",
    hasDropdown: true,
    dropdown: [
      { name: "Men's", value: "men" },
      { name: "Women's", value: "women" },
    ],
  },

  {
    name: "New Balance Apparel",
    value: "nb-apparel",
    hasDropdown: true,
    dropdown: [
      { name: "Men's", value: "men" },
      { name: "Women's", value: "women" },
      { name: "Youth", value: "kids" },
    ],
  },

  { name: "G-form Protective Gear", value: "gear", hasDropdown: false },
  { name: "Lizard Skins Accessories", value: "skin accessories", hasDropdown: false },
];