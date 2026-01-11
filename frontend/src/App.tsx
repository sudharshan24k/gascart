import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout'; // Layout wrapper
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Technology from './pages/Technology';
import Contact from './pages/Contact';
import Consultants from './pages/Consultants';
import ConsultantRegistration from './pages/ConsultantRegistration';

import CheckoutPage from './pages/Checkout';

import ProductListing from './pages/ProductListing';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import OrderConfirmation from './pages/OrderConfirmation';
import Login from './pages/Login';
import { CartProvider } from './context/CartContext';

function App() {
    // Default Marketplace Routes
    return (
        <CartProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<Layout />}>
                        <Route index element={<Home />} />
                        <Route path="about" element={<About />} />
                        <Route path="services" element={<Services />} />
                        <Route path="technology" element={<Technology />} />
                        <Route path="consultants" element={<Consultants />} />
                        <Route path="consultant-registration" element={<ConsultantRegistration />} />
                        <Route path="contact" element={<Contact />} />

                        {/* E-commerce Routes */}
                        <Route path="shop" element={<ProductListing />} />
                        <Route path="product/:id" element={<ProductDetail />} />
                        <Route path="cart" element={<Cart />} />
                        <Route path="checkout" element={<CheckoutPage />} />
                        <Route path="order-confirmation" element={<OrderConfirmation />} />
                        <Route path="login" element={<Login />} />
                    </Route>
                </Routes>
            </Router>
        </CartProvider>
    );
}

export default App;
