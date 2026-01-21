import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import Resources from './pages/Resources';
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
import { EnquiryProvider } from './context/EnquiryContext';
import { AuthProvider } from './context/AuthContext';
import Signup from './pages/Signup';
import { CartProvider } from './context/CartContext';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import Profile from './pages/Profile';

function App() {
    // Default Marketplace Routes
    return (
        <AuthProvider>
            <CartProvider>
                <EnquiryProvider>
                    <Router>
                        <Routes>
                            <Route path="/" element={<Layout />}>
                                <Route index element={<Home />} />
                                <Route path="about" element={<About />} />
                                <Route path="services" element={<Services />} />
                                <Route path="technology" element={<Technology />} />
                                <Route path="learn" element={<Learn />} />
                                <Route path="learn/:slug" element={<ArticleDetail />} />
                                <Route path="experts" element={<Consultants />} />
                                <Route path="experts/:id" element={<ExpertProfile />} />
                                <Route path="consultant-registration" element={<ConsultantRegistration />} />
                                <Route path="consultant-dashboard" element={<ConsultantDashboard />} />
                                <Route path="resources" element={<Resources />} />
                                <Route path="vendor-enquiry" element={<VendorEnquiry />} />
                                <Route path="contact" element={<Contact />} />

                                {/* Industrial Marketplace Routes */}
                                <Route path="shop" element={<ProductListing />} />
                                <Route path="compare" element={<Compare />} />
                                <Route path="product/:id" element={<ProductDetail />} />
                                <Route path="enquiry-list" element={<EnquiryList />} />
                                <Route path="submit-rfq" element={<SubmitRFQ />} />
                                <Route path="cart" element={<Cart />} />
                                <Route path="order-confirmation" element={<OrderConfirmation />} />
                                <Route path="login" element={<Login />} />
                                <Route path="signup" element={<Signup />} />
                                <Route path="checkout" element={<Checkout />} />
                                <Route path="order-success" element={<OrderSuccess />} />
                                <Route path="profile" element={<Profile />} />
                                <Route path="my-orders" element={<MyOrders />} />
                                <Route path="order-tracking/:id" element={<OrderTracking />} />
                            </Route>
                        </Routes>
                    </Router>
                </EnquiryProvider>
            </CartProvider>
        </AuthProvider>
    );
}

export default App;
