import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/RequirePermission';
import AdminLayout from './pages/AdminLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Orders from './pages/Orders';
import ConsultantManagement from './pages/ConsultantManagement';
import RFQManagement from './pages/RFQManagement';
import KnowledgeHubManagement from './pages/KnowledgeHubManagement';
import CategoryManagement from './pages/CategoryManagement';
import VendorManagement from './pages/VendorManagement';
import DocumentCenter from './pages/DocumentCenter';
import ConsultantInquiries from './pages/ConsultantInquiries';
import RFQConfigurator from './pages/RFQConfigurator';
import Inventory from './pages/Inventory';
import UserManagement from './pages/UserManagement';
import MediaLibrary from './pages/MediaLibrary';
import AuditLogs from './pages/AuditLogs';
import CareerApplications from './pages/CareerApplications';
import AdminManagement from './pages/AdminManagement';

// Helper component to redirect to main site login
const LoginRedirect = () => {
    React.useEffect(() => {
        window.location.href = '/login';
    }, []);
    return <div className="p-8 text-center text-neutral-500 font-bold">Redirecting to login...</div>;
};

function App() {
    const basename = import.meta.env.MODE === 'production' ? '/admin' : '/';

    return (
        <AuthProvider>
            <Router basename={basename}>
                <Routes>
                    <Route path="/login" element={<Login />} />

                    <Route element={<ProtectedRoute />}>
                        <Route path="/" element={<AdminLayout />}>
                            <Route index element={<Dashboard />} />

                            <Route element={<ProtectedRoute permission="manage_products" />}>
                                <Route path="products" element={<Products />} />
                                <Route path="taxonomy" element={<CategoryManagement />} />
                                <Route path="inventory" element={<Inventory />} />
                            </Route>

                            <Route element={<ProtectedRoute permission="manage_orders" />}>
                                <Route path="orders" element={<Orders />} />
                            </Route>

                            <Route element={<ProtectedRoute permission="manage_rfqs" />}>
                                <Route path="rfqs" element={<RFQManagement />} />
                                <Route path="rfq-config" element={<RFQConfigurator />} />
                            </Route>

                            <Route element={<ProtectedRoute permission="manage_users" />}>
                                <Route path="users" element={<UserManagement />} />
                            </Route>

                            <Route element={<ProtectedRoute permission="manage_vendors" />}>
                                <Route path="vendors" element={<VendorManagement />} />
                            </Route>

                            <Route element={<ProtectedRoute permission="manage_consultants" />}>
                                <Route path="consultants" element={<ConsultantManagement />} />
                                <Route path="consultant-inquiries" element={<ConsultantInquiries />} />
                            </Route>

                            <Route element={<ProtectedRoute permission="manage_content" />}>
                                <Route path="learn" element={<KnowledgeHubManagement />} />
                                <Route path="documents" element={<DocumentCenter />} />
                                <Route path="media" element={<MediaLibrary />} />
                            </Route>

                            <Route element={<ProtectedRoute permission="manage_careers" />}>
                                <Route path="careers" element={<CareerApplications />} />
                            </Route>

                            <Route element={<ProtectedRoute requireSuperAdmin />}>
                                <Route path="audit-logs" element={<AuditLogs />} />
                                <Route path="admin-management" element={<AdminManagement />} />
                            </Route>
                        </Route>
                    </Route>

                    {/* Catch-all route to redirect to the main website's login page */}
                    <Route path="*" element={<LoginRedirect />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
