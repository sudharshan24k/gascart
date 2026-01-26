import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Leaf, ClipboardList, User, GitCompare, LogOut, ShoppingCart } from 'lucide-react';
import { clsx } from 'clsx';
import { useEnquiry } from '../../context/EnquiryContext';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const Header: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const { state } = useEnquiry();
    const { user, signOut } = useAuth();
    const { items } = useCart();

    const navItems = [
        { name: 'Home', path: '/' },
        { name: 'Learn', path: '/learn' },
        { name: 'Marketplace', path: '/shop' },
        { name: 'Experts', path: '/experts' },
        { name: 'Vendor', path: '/vendor-enquiry' },
    ];

    const handleSignOut = async () => {
        await signOut();
        setIsOpen(false);
    };

    return (
        <nav className="bg-white/90 backdrop-blur-lg shadow-sm fixed top-0 w-full transition-all duration-300 border-b border-gray-100" style={{ zIndex: 'var(--z-fixed)' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20 md:h-20">
                    <div className="flex items-center">
                        <Link to="/" className="flex-shrink-0 flex items-center group">
                            <Leaf className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-300" />
                            <span className="ml-2 text-2xl font-bold text-gray-800 tracking-tight">Gascart</span>
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={clsx(
                                    "text-gray-500 hover:text-primary transition-colors duration-200 text-sm font-bold uppercase tracking-wider whitespace-nowrap",
                                    "focus-visible:outline-primary focus-visible:outline-2 focus-visible:outline-offset-2 rounded-full",
                                    location.pathname === item.path && "text-primary px-3 py-1 bg-primary/5"
                                )}
                            >
                                {item.name}
                            </Link>
                        ))}

                        {/* Search Bar - Hidden on smaller laptops, shown on XL */}
                        <div className="relative group hidden xl:block">
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                const fd = new FormData(e.currentTarget);
                                const q = fd.get('q');
                                if (q) window.location.href = `/shop?search=${q}`;
                            }}>
                                <input
                                    name="q"
                                    type="text"
                                    placeholder="Search..."
                                    aria-label="Search products"
                                    className="bg-gray-100/50 border border-transparent focus:bg-white focus:border-primary/20 rounded-xl py-2.5 pl-4 pr-10 text-sm font-bold outline-none transition-all w-32 focus:w-56"
                                />
                                <button type="submit" aria-label="Submit search" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                                </button>
                            </form>
                        </div>

                        <div className="flex items-center space-x-3 pl-6 border-l border-gray-100">
                            <Link
                                title="Compare Hub"
                                to="/compare"
                                className="relative text-gray-400 hover:text-secondary transition-all p-2.5 hover:bg-secondary/5 rounded-xl border border-transparent hover:border-secondary/10"
                            >
                                <GitCompare className="w-5 h-5" />
                                {state.comparisonItems.length > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-secondary text-white text-[10px] font-black rounded-lg px-1.5 py-0.5 border-2 border-white">
                                        {state.comparisonItems.length}
                                    </span>
                                )}
                            </Link>

                            <Link
                                title="Enquiry List"
                                to="/enquiry-list"
                                className="relative text-gray-400 hover:text-primary transition-all p-2.5 hover:bg-primary/5 rounded-xl border border-transparent hover:border-primary/10"
                            >
                                <ClipboardList className="w-5 h-5" />
                                {state.items.length > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-black rounded-lg px-1.5 py-0.5 border-2 border-white">
                                        {state.items.length}
                                    </span>
                                )}
                            </Link>

                            <Link
                                title="Shopping Cart"
                                to="/cart"
                                className="relative text-gray-400 hover:text-primary transition-all p-2.5 hover:bg-primary/5 rounded-xl border border-transparent hover:border-primary/10"
                            >
                                <ShoppingCart className="w-5 h-5" />
                                {items.length > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-black rounded-lg px-1.5 py-0.5 border-2 border-white">
                                        {items.length}
                                    </span>
                                )}
                            </Link>

                            {user ? (
                                <div className="flex items-center gap-2">
                                    <Link
                                        to="/profile"
                                        className="flex items-center gap-2 group mr-2"
                                        title="My Account"
                                    >
                                        <div className="w-8 h-8 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center font-bold text-xs group-hover:bg-primary group-hover:text-white transition-colors border border-gray-200 group-hover:border-primary">
                                            {user.email?.[0].toUpperCase()}
                                        </div>
                                        <span className="text-xs font-bold text-gray-700 hidden lg:block group-hover:text-primary transition-colors">
                                            Account
                                        </span>
                                    </Link>
                                    <button
                                        onClick={handleSignOut}
                                        className="text-gray-400 hover:text-red-500 transition-colors p-2.5 hover:bg-red-50 rounded-xl"
                                        title="Sign out"
                                    >
                                        <LogOut className="w-5 h-5" />
                                    </button>
                                </div>
                            ) : (
                                <Link to="/login" className="text-gray-400 hover:text-gray-900 transition-colors p-2.5 hover:bg-gray-50 rounded-xl">
                                    <User className="w-5 h-5" />
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Mobile menu button */}
                    <div className="lg:hidden flex items-center gap-3">
                        <Link
                            to="/cart"
                            className="text-gray-400 relative p-2 hover:text-primary transition-colors touch-target"
                            aria-label="Shopping cart"
                        >
                            <ShoppingCart className="w-6 h-6" />
                            {items.length > 0 && (
                                <span className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center border-2 border-white px-1">
                                    {items.length}
                                </span>
                            )}
                        </Link>
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-gray-600 focus:outline-none p-2 hover:bg-gray-100 rounded-lg transition-colors touch-target"
                            aria-label={isOpen ? "Close menu" : "Open menu"}
                            aria-expanded={isOpen}
                        >
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="lg:hidden absolute w-full bg-white shadow-2xl border-t border-gray-100 animate-slide-in-top max-h-[calc(100vh-5rem)] overflow-y-auto custom-scrollbar" style={{ zIndex: 'var(--z-dropdown)' }}>
                    <div className="px-4 pt-4 pb-8 space-y-2">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={clsx(
                                    "block px-4 py-4 rounded-2xl text-base font-bold text-gray-700 hover:text-primary hover:bg-primary/5 transition-colors",
                                    location.pathname === item.path && "text-primary bg-primary/5"
                                )}
                                onClick={() => setIsOpen(false)}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>
                    {user ? (
                        <div className="px-4 pb-6 border-t border-gray-100 pt-6">
                            <div className="flex items-center gap-4 mb-4 px-4">
                                <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold">
                                    {user.email?.[0].toUpperCase()}
                                </div>
                                <div className="overflow-hidden">
                                    <p className="font-bold text-sm text-gray-900 truncate">{user.email}</p>
                                    <Link to="/profile" className="text-xs text-primary font-bold hover:underline" onClick={() => setIsOpen(false)}>View Profile</Link>
                                </div>
                            </div>
                            <button
                                onClick={handleSignOut}
                                className="w-full flex items-center justify-center px-4 py-4 rounded-2xl text-base font-bold text-red-500 bg-red-50 hover:bg-red-100 transition-colors"
                            >
                                <LogOut className="w-5 h-5 mr-2" />
                                Sign Out
                            </button>
                        </div>
                    ) : (
                        <div className="px-4 pb-6 pt-2">
                            <Link
                                to="/login"
                                className="w-full flex items-center justify-center px-4 py-4 rounded-2xl text-base font-bold text-white bg-gray-900 hover:bg-gray-800 transition-colors"
                                onClick={() => setIsOpen(false)}
                            >
                                <User className="w-5 h-5 mr-2" />
                                Sign In
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Header;
