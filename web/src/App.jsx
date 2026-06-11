import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import { useAuth } from './context/AuthContext.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';
import ShopCatalog from './pages/ShopCatalog.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import OrderConfirmation from './pages/OrderConfirmation.jsx';
import CustomDesign from './pages/CustomDesign.jsx';
import CustomDesignConfirmation from './pages/CustomDesignConfirmation.jsx';
import MyOrders from './pages/MyOrders.jsx';
import OrderDetail from './pages/OrderDetail.jsx';
import ShopDashboard from './pages/shop/ShopDashboard.jsx';
import ShopOrders from './pages/shop/ShopOrders.jsx';
import ShopProducts from './pages/shop/ShopProducts.jsx';
import AdminLayout from './pages/admin/AdminLayout.jsx';
import AdminOverview from './pages/admin/AdminOverview.jsx';
import AdminShops from './pages/admin/AdminShops.jsx';
import AdminOrders from './pages/admin/AdminOrders.jsx';
import AdminCustomDesigns from './pages/admin/AdminCustomDesigns.jsx';
import AdminPayments from './pages/admin/AdminPayments.jsx';
import AdminMaterials from './pages/admin/AdminMaterials.jsx';
import AdminColors from './pages/admin/AdminColors.jsx';
import AdminAbayaModels from './pages/admin/AdminAbayaModels.jsx';
import AdminMeasurementGuide from './pages/admin/AdminMeasurementGuide.jsx';
import AdminPaymentGateway from './pages/admin/AdminPaymentGateway.jsx';
import AdminEmailTemplates from './pages/admin/AdminEmailTemplates.jsx';
import AdminWhatsAppTemplates from './pages/admin/AdminWhatsAppTemplates.jsx';
import AdminUsers from './pages/admin/AdminUsers.jsx';

function Protected({ roles, children }) {
  const { user, profile, loading } = useAuth();
  if (loading) return <div className="container my-5">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(profile?.role)) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<ShopCatalog />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/custom-design" element={<CustomDesign />} />
        <Route path="/custom-design/confirmation/:id" element={<CustomDesignConfirmation />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/checkout"
          element={
            <Protected>
              <Checkout />
            </Protected>
          }
        />
        <Route
          path="/order-confirmation/:id"
          element={
            <Protected>
              <OrderConfirmation />
            </Protected>
          }
        />
        <Route
          path="/my-orders"
          element={
            <Protected>
              <MyOrders />
            </Protected>
          }
        />
        <Route
          path="/orders/:id"
          element={
            <Protected>
              <OrderDetail />
            </Protected>
          }
        />
        <Route
          path="/shop/dashboard"
          element={
            <Protected roles={['business', 'shop', 'admin']}>
              <ShopDashboard />
            </Protected>
          }
        />
        <Route
          path="/shop/orders"
          element={
            <Protected roles={['business', 'shop', 'admin']}>
              <ShopOrders />
            </Protected>
          }
        />
        <Route
          path="/shop/products"
          element={
            <Protected roles={['business', 'shop', 'admin']}>
              <ShopProducts />
            </Protected>
          }
        />

        <Route
          path="/admin"
          element={
            <Protected roles={['admin']}>
              <AdminLayout />
            </Protected>
          }
        >
          <Route index element={<AdminOverview />} />
          <Route path="shops" element={<AdminShops />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="custom-designs" element={<AdminCustomDesigns />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="materials" element={<AdminMaterials />} />
          <Route path="colors" element={<AdminColors />} />
          <Route path="models" element={<AdminAbayaModels />} />
          <Route path="measurement-guide" element={<AdminMeasurementGuide />} />
          <Route path="payment-gateway" element={<AdminPaymentGateway />} />
          <Route path="emails" element={<AdminEmailTemplates />} />
          <Route path="whatsapp" element={<AdminWhatsAppTemplates />} />
          <Route path="users" element={<AdminUsers />} />
        </Route>

        {/* Legacy routes redirect */}
        <Route path="/design" element={<Navigate to="/custom-design" replace />} />
        <Route path="/post" element={<Navigate to="/custom-design" replace />} />
        <Route path="/my-requests" element={<Navigate to="/my-orders" replace />} />
        <Route path="/browse" element={<Navigate to="/shop/dashboard" replace />} />
        <Route path="/my-bids" element={<Navigate to="/shop/dashboard" replace />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
