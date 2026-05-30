import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { StoreProvider } from './context/StoreContext'
import { ProtectedRoute, AdminRoute } from './component/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
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
import OrderHistory from './pages/OrderHistory'

import Login from './pages/Login'
import Signup from './pages/Signup'

import AdminLayout from './pages/admin/AdminLayout'
import Dashboard from './pages/admin/Dashboard'
import Orders from './pages/admin/Orders'
import Products from './pages/admin/Products'



// ─── Store layout (main page) ───────────────────────────────cdc──────────────────
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
      <AuthProvider>
        <StoreProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<StorePage />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/thank-you" element={<ThankYou />} />

            {/* Protected — login required */}
            <Route path="/checkout" element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            } />


       <Route
  path="/orders"
  element={
    <ProtectedRoute>
      <OrderHistory />
    </ProtectedRoute>
  }
/>



 // Admin routes:
<Route path="/admin" element={
  <AdminRoute>
    <AdminLayout />
  </AdminRoute>
}>
  <Route index element={<Dashboard />} />
  <Route path="orders" element={<Orders />} />
 <Route path="products" element={<Products />} />
</Route>
          </Routes>
        </StoreProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
