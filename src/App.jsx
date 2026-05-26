import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { StoreProvider } from './context/StoreContext'
import Navbar from './component/Navbar'
import CategoryTabs from './component/CategoryTabs'
import Hero from './component/Hero'
import StoreInfoSection from './component/StoreInfoSection'
import Store from './pages/Store'
import Footer from './component/Footer'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import ThankYou from './pages/ThankYou'

// ─── Store layout (main page) ─────────────────────────────────────────────────
function StorePage() {
  return (
    <>
      <Navbar />
      <CategoryTabs />
      <Hero />
      <StoreInfoSection />
      <Store />
      <Footer />
    </>
  )
}

// ─── App with routes ──────────────────────────────────────────────────────────
function App() {
  return (
    <BrowserRouter>
      <StoreProvider>
        <Routes>
          <Route path="/" element={<StorePage />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout/>} />
          <Route path="/thank-you" element={<ThankYou />} />
        </Routes>
      </StoreProvider>
    </BrowserRouter>
  )
}

export default App
