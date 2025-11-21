import { Route, Routes, Navigate } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import CategoryPage from '../pages/CategoryPage';
import ProductDetailPage from '../pages/ProductDetailPage';
import AboutPage from '../pages/AboutPage';
import NotFoundPage from '../pages/NotFoundPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import CustomerDashboardPage from '../pages/CustomerDashboardPage';
import AdminDashboardPage from '../pages/AdminDashboardPage';
import RoleRoute from '../auth/RoleRoute';
import ProtectedRoute from '../auth/ProtectedRoute';
import CartPage from '../pages/CartPage';
import CheckoutPage from '../pages/CheckoutPage';
import MyOrdersPage from '../pages/MyOrdersPage';
import MyOrderDetailPage from '../pages/MyOrderDetailPage';
import AdminOrdersPage from '../pages/AdminOrdersPage';
import AdminOrderDetailPage from '../pages/AdminOrderDetailPage';
import AdminCategoriesPage from '../pages/admin/AdminCategoriesPage';
import AdminProductsPage from '../pages/admin/AdminProductsPage';
import AdminUsersPage from '../pages/admin/AdminUsersPage';
import AdminShippingMethodsPage from '../pages/admin/AdminShippingMethodsPage';
import AdminRevenueDashboardPage from '../pages/admin/AdminRevenueDashboardPage';
import AdminHomePreviewPage from '../pages/admin/AdminHomePreviewPage';
import SearchResultsPage from '../pages/SearchResultsPage';
import ShippingPolicyPage from '../pages/ShippingPolicyPage';
import PrivacyPolicyPage from '../pages/PrivacyPolicyPage';
import TermsPage from '../pages/TermsPage';

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/category/:slug" element={<CategoryPage />} />
    <Route path="/product/:slug" element={<ProductDetailPage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/search" element={<SearchResultsPage />} />

    <Route element={<ProtectedRoute />}>
      <Route path="/cart" element={<CartPage />} />
    </Route>

    <Route element={<RoleRoute requiredRole="CUSTOMER" redirectTo="/login" />}>
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/customer" element={<Navigate to="/my-orders" replace />} />
      <Route path="/my-orders" element={<MyOrdersPage />} />
      <Route path="/my-orders/:orderCode" element={<MyOrderDetailPage />} />
    </Route>

    <Route element={<RoleRoute requiredRole="ADMIN" redirectTo="/" />}>
      <Route path="/admin" element={<Navigate to="/admin/orders" replace />} />
      <Route path="/admin/orders" element={<AdminOrdersPage />} />
      <Route path="/admin/orders/:orderId" element={<AdminOrderDetailPage />} />
      <Route path="/admin/categories" element={<AdminCategoriesPage />} />
      <Route path="/admin/products" element={<AdminProductsPage />} />
      <Route path="/admin/users" element={<AdminUsersPage />} />
      <Route path="/admin/shipping-methods" element={<AdminShippingMethodsPage />} />
      <Route path="/admin/dashboard/revenue" element={<AdminRevenueDashboardPage />} />
      <Route path="/admin/home-preview" element={<AdminHomePreviewPage />} />
    </Route>

    <Route path="/about" element={<AboutPage />} />
    <Route path="/shipping-policy" element={<ShippingPolicyPage />} />
    <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
    <Route path="/terms" element={<TermsPage />} />
    <Route path="*" element={<NotFoundPage />} />
  </Routes>
);

export default AppRoutes;
