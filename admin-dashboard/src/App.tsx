import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
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
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}

export default App;
