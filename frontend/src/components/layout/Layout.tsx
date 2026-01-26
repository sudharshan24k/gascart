import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const Layout: React.FC = () => {
    return (
        <div className="min-h-screen flex flex-col font-sans text-gray-900">
            {/* Skip to Content Link for Accessibility */}
            <a href="#main-content" className="skip-to-content">
                Skip to main content
            </a>

            <Header />

            <main id="main-content" className="flex-grow page-content">
                <Outlet />
            </main>

            <Footer />
        </div>
    );
};

export default Layout; // Exporting Layout component
