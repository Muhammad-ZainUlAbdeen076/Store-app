import { useState } from "react";
import './App.css'
import CategoryTabs from './component/CategoryTabs'
import Hero from './component/Hero'
import StoreInfoSection from "./component/StoreInfoSection";
import Navbar from "./component/Navbar";
import Store from './pages/Store'

function App() {
  const [activeFilter, setActiveFilter] = useState("all");


  return (
    <>
      <Navbar setActiveFilter={setActiveFilter} />
      <CategoryTabs setActiveFilter={setActiveFilter} />
      <Hero/>
      <StoreInfoSection/>

      {/* 🔥 FIX HERE */}
      <Store activeFilter={activeFilter} />
    </>
  )
}

export default App