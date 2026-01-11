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
import Learn from './pages/Learn'; // Re-applied import to trigger refresh
import ArticleDetail from './pages/ArticleDetail';
import Resources from './pages/Resources';
import Compare from './pages/Compare';

import EnquiryList from './pages/EnquiryList';
import SubmitRFQ from './pages/SubmitRFQ';
import ProductListing from './pages/ProductListing';
import ProductDetail from './pages/ProductDetail';
import OrderConfirmation from './pages/OrderConfirmation';
import Login from './pages/Login';
import { EnquiryProvider } from './context/EnquiryContext';

function App() {
    // Default Marketplace Routes
    return (
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
                        <Route path="resources" element={<Resources />} />
                        <Route path="contact" element={<Contact />} />

                        {/* Industrial Marketplace Routes */}
                        <Route path="shop" element={<ProductListing />} />
                        <Route path="compare" element={<Compare />} />
                        <Route path="product/:id" element={<ProductDetail />} />
                        <Route path="enquiry-list" element={<EnquiryList />} />
                        <Route path="submit-rfq" element={<SubmitRFQ />} />
                        <Route path="order-confirmation" element={<OrderConfirmation />} />
                        <Route path="login" element={<Login />} />
                    </Route>
                </Routes>
            </Router>
        </EnquiryProvider>
    );
}

export default App;
