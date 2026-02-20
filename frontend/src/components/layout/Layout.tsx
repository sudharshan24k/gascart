import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const Layout: React.FC = () => {
    return (
        <div className="min-h-screen flex flex-col font-sans text-neutral-800 bg-neutral-light">
            <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-skip px-4 py-2 bg-primary text-white rounded-md">
                Skip to main content
            </a>

            <Header />

            <main id="main-content" className="flex-grow page-content relative">
                <Outlet />
            </main>

            <Footer />
        </div>
    );
};

export default Layout;
