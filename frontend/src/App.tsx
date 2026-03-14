import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout'; // Layout wrapper
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Technology from './pages/Technology';
import Contact from './pages/Contact';
import Consultants from './pages/Consultants';
import ExpertProfile from './pages/ExpertProfile';
import ConsultantRegistration from './pages/ConsultantRegistration';
import ConsultantDashboard from './pages/ConsultantDashboard';
import Learn from './pages/Learn'; // Re-applied import to trigger refresh
import ArticleDetail from './pages/ArticleDetail';
import VendorEnquiry from './pages/VendorEnquiry';
import Compare from './pages/Compare';
import MyOrders from './pages/MyOrders';
import OrderTracking from './pages/OrderTracking';

import EnquiryList from './pages/EnquiryList';
import SubmitRFQ from './pages/SubmitRFQ';
import ProductListing from './pages/ProductListing';
import ProductDetail from './pages/ProductDetail';
import OrderConfirmation from './pages/OrderConfirmation';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import { EnquiryProvider } from './context/EnquiryContext';
import { AuthProvider } from './context/AuthContext';
import Signup from './pages/Signup';
import { CartProvider } from './context/CartContext';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import Profile from './pages/Profile';
import AdminProducts from './pages/Admin/Products';
import VendorManager from './pages/Admin/VendorManager';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import Careers from './pages/Careers';

import { ToastProvider } from './context/ToastContext';
import ScrollToTop from './components/ScrollToTop';

function App() {
    // Default Marketplace Routes
    return (
        <AuthProvider>
            <CartProvider>
                <EnquiryProvider>
                    <ToastProvider>
                        <Router>
                            <ScrollToTop />
                            <Routes>
                                <Route path="/" element={<Layout />}>
                                    <Route index element={<Home />} />
                                    <Route path="about" element={<About />} />
                                    <Route path="services" element={<Services />} />
                                    <Route path="our-process" element={<Technology />} />
                                    <Route path="technology" element={<Navigate to="/our-process" replace />} />
                                    <Route path="learn" element={<Learn />} />
                                    <Route path="learn/:slug" element={<ArticleDetail />} />
                                    <Route path="experts" element={<Consultants />} />
                                    <Route path="experts/:id" element={<ExpertProfile />} />
                                    <Route path="consultant-registration" element={<ConsultantRegistration />} />
                                    <Route path="consultant-dashboard" element={<ConsultantDashboard />} />
                                    <Route path="vendor-enquiry" element={<VendorEnquiry />} />
                                    <Route path="contact" element={<Contact />} />
                                    <Route path="careers" element={<Careers />} />

                                    {/* Industrial Marketplace Routes */}
                                    <Route path="shop" element={<ProductListing />} />
                                    <Route path="compare" element={<Compare />} />
                                    <Route path="product" element={<Navigate to="/shop" replace />} />
                                    <Route path="product/:id" element={<ProductDetail />} />
                                    <Route path="enquiry-list" element={<EnquiryList />} />
                                    <Route path="submit-rfq" element={<SubmitRFQ />} />
                                    <Route path="cart" element={<Cart />} />
                                    <Route path="order-confirmation" element={<OrderConfirmation />} />
                                    <Route path="login" element={<Login />} />
                                    <Route path="forgot-password" element={<ForgotPassword />} />
                                    <Route path="reset-password" element={<ResetPassword />} />
                                    <Route path="signup" element={<Signup />} />
                                    <Route path="checkout" element={<Checkout />} />
                                    <Route path="order-success" element={<OrderSuccess />} />
                                    <Route path="profile" element={<Profile />} />
                                    <Route path="my-orders" element={<MyOrders />} />
                                    <Route path="order-tracking/:id" element={<OrderTracking />} />


                                    {/* Admin Routes */}
                                    <Route path="admin/products" element={<AdminProducts />} />
                                    <Route path="admin/vendors" element={<VendorManager />} />
                                    <Route path="privacy" element={<PrivacyPolicy />} />
                                    <Route path="terms" element={<TermsOfService />} />
                                </Route>
                            </Routes>
                        </Router>
                    </ToastProvider>
                </EnquiryProvider>
            </CartProvider>
        </AuthProvider>
    );
}

export default App;
