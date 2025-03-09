import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Layout from "./components/layout/Layout"
import HomePage from "./app/pages/HomePage"
import ShopPage from "./app/pages/ShopPage"
import ProductPage from "./app/pages/ProductPage"
import CartPage from "./app/pages/CartPage"
import CheckoutPage from "./app/pages/CheckoutPage"
import AccountPage from "./app/pages/AccountPage"
import LoginPage from "./app/pages/LoginPage"
import RegisterPage from "./app/pages/RegisterPage"
import AdminDashboard from "./app/admin/Dashboard"
import NotFoundPage from "./app/pages/NotFoundPage"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="tienda" element={<ShopPage />} />
          <Route path="producto/:id" element={<ProductPage />} />
          <Route path="carrito" element={<CartPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="cuenta" element={<AccountPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="registro" element={<RegisterPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
        <Route path="/admin/*" element={<AdminDashboard />} />
      </Routes>
    </Router>
  )
}

export default App

