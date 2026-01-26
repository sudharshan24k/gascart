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
import UserManagement from './pages/UserManagement';
import Login from './pages/Login';

const ProtectedRoute = () => {
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            const isHardcodedAdmin = localStorage.getItem('admin_logged_in') === 'true';

            if (session) {
                // If using actual Supabase session, verify status from profile
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('account_status')
                    .eq('id', session.user.id)
                    .single();

                if (profile?.account_status === 'banned') {
                    setError('Your account has been banned.');
                    await supabase.auth.signOut();
                    setIsAuthenticated(false);
                } else if (profile?.account_status === 'deactivated') {
                    setError('Your account is deactivated.');
                    await supabase.auth.signOut();
                    setIsAuthenticated(false);
                } else {
                    setIsAuthenticated(true);
                }
            } else {
                setIsAuthenticated(isHardcodedAdmin);
            }
            setLoading(false);
        };
        checkAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            const isHardcodedAdmin = localStorage.getItem('admin_logged_in') === 'true';
            if (session) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('account_status')
                    .eq('id', session.user.id)
                    .single();

                if (profile?.account_status === 'banned' || profile?.account_status === 'deactivated') {
                    await supabase.auth.signOut();
                    setIsAuthenticated(false);
                } else {
                    setIsAuthenticated(true);
                }
            } else {
                setIsAuthenticated(isHardcodedAdmin);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

    if (error) return <Navigate to="/login" state={{ error }} replace />;

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
                        <Route path="users" element={<UserManagement />} />
                    </Route>
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}

export default App;
