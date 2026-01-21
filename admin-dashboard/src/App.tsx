import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from './services/api';
import AdminLayout from './pages/AdminLayout';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Orders from './pages/Orders';
import ConsultantManagement from './pages/ConsultantManagement';
import RFQManagement from './pages/RFQManagement';
import KnowledgeHubManagement from './pages/KnowledgeHubManagement';
import CategoryManagement from './pages/CategoryManagement';
import VendorManagement from './pages/VendorManagement';
import DocumentCenter from './pages/DocumentCenter';
import RFQConfigurator from './pages/RFQConfigurator';
import Inventory from './pages/Inventory';
import Login from './pages/Login';

const ProtectedRoute = () => {
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            const isHardcodedAdmin = localStorage.getItem('admin_logged_in') === 'true';
            setIsAuthenticated(!!session || isHardcodedAdmin);
            setLoading(false);
        };
        checkAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            const isHardcodedAdmin = localStorage.getItem('admin_logged_in') === 'true';
            setIsAuthenticated(!!session || isHardcodedAdmin);
        });

        return () => subscription.unsubscribe();
    }, []);

    if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

    if (!isAuthenticated) return <Navigate to="/login" replace />;

    return <Outlet />;
};

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route element={<ProtectedRoute />}>
                    <Route path="/" element={<AdminLayout />}>
                        <Route index element={<Dashboard />} />
                        <Route path="products" element={<Products />} />
                        <Route path="rfqs" element={<RFQManagement />} />
                        <Route path="learn" element={<KnowledgeHubManagement />} />
                        <Route path="taxonomy" element={<CategoryManagement />} />
                        <Route path="rfq-config" element={<RFQConfigurator />} />
                        <Route path="vendors" element={<VendorManagement />} />
                        <Route path="documents" element={<DocumentCenter />} />
                        <Route path="consultants" element={<ConsultantManagement />} />
                        <Route path="inventory" element={<Inventory />} />
                        <Route path="orders" element={<Orders />} />
                    </Route>
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}

export default App;
