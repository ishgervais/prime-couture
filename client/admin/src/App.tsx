import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ProductsPage from './pages/ProductsPage'
import ProductDetailPage from './pages/ProductDetailPage'
import OrdersPage from './pages/OrdersPage'
import AnalyticsPage from './pages/AnalyticsPage'
import CollectionsPage from './pages/CollectionsPage'
import CategoriesPage from './pages/CategoriesPage'
import UsersPage from './pages/UsersPage'
import SalesTablePage from './pages/SalesTablePage'
import NewSalePage from './pages/NewSalePage'
import SaleDetailPage from './pages/SaleDetailPage'
import ClientsAdminPage from './pages/ClientsAdminPage'
import ClientDetailPage from './pages/ClientDetailPage'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route
          path="/"
          element={
            <Layout>
              <Navigate to="/dashboard" replace />
            </Layout>
          }
        />
        <Route
          path="/dashboard"
          element={
            <Layout>
              <DashboardPage />
            </Layout>
          }
        />
        <Route
          path="/products"
          element={
            <Layout>
              <ProductsPage />
            </Layout>
          }
        />
        <Route
          path="/sales"
          element={
            <Layout>
              <SalesTablePage />
            </Layout>
          }
        />
        <Route
          path="/sales/new"
          element={
            <Layout>
              <NewSalePage />
            </Layout>
          }
        />
        <Route
          path="/sales/:id"
          element={
            <Layout>
              <SaleDetailPage />
            </Layout>
          }
        />
        <Route
          path="/clients"
          element={
            <Layout>
              <ClientsAdminPage />
            </Layout>
          }
        />
        <Route
          path="/clients/:id"
          element={
            <Layout>
              <ClientDetailPage />
            </Layout>
          }
        />
        <Route
          path="/products/:slug"
          element={
            <Layout>
              <ProductDetailPage />
            </Layout>
          }
        />
        <Route
          path="/collections"
          element={
            <Layout>
              <CollectionsPage />
            </Layout>
          }
        />
        <Route
          path="/categories"
          element={
            <Layout>
              <CategoriesPage />
            </Layout>
          }
        />
        <Route
          path="/orders"
          element={
            <Layout>
              <OrdersPage />
            </Layout>
          }
        />
        <Route
          path="/analytics"
          element={
            <Layout>
              <AnalyticsPage />
            </Layout>
          }
        />
        <Route
          path="/users"
          element={
            <Layout>
              <UsersPage />
            </Layout>
          }
        />
      </Route>
    </Routes>
  )
}
