import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Leaf, ClipboardList, GitCompare, LogOut, ShoppingCart, Search, ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';
import { useEnquiry } from '../../context/EnquiryContext';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

const Header: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const location = useLocation();
    const { state } = useEnquiry();
    const { user, signOut } = useAuth();
    const { items } = useCart();

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navItems = [
        { name: 'Home', path: '/' },
        { name: 'Learn', path: '/learn' },
        { name: 'Marketplace', path: '/shop' },
        { name: 'Experts', path: '/experts' },
        { name: 'Capacities', path: '/producer-capacities' },
        { name: 'Vendor', path: '/vendor-enquiry' },
        { name: 'Job Pool', path: '/careers' },
    ];

    const handleSignOut = async () => {
        await signOut();
        setIsOpen(false);
    };

    return (
        <nav
            className={clsx(
                "fixed top-0 w-full transition-all duration-300 z-50 border-b",
                isScrolled
                    ? "glass shadow-sm border-white/20 py-2"
                    : "bg-white/0 border-transparent py-4 text-gray-800"
            )}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center group">
                        <div className="bg-primary/10 p-2 rounded-xl group-hover:bg-primary/20 transition-colors">
                            <Leaf className="h-6 w-6 text-primary group-hover:scale-110 transition-transform duration-300" />
                        </div>
                        <span className="ml-3 text-2xl font-display font-bold text-gray-900 tracking-tight">
                            Gascart<span className="text-primary">.</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center space-x-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={clsx(
                                    "px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200",
                                    location.pathname === item.path
                                        ? "bg-primary text-white shadow-md shadow-primary/20"
                                        : "text-gray-600 hover:text-primary hover:bg-primary/5"
                                )}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>

                    {/* Right Side Actions */}
                    <div className="hidden lg:flex items-center space-x-2">
                        {/* Search */}
                        <div className="relative group mr-2">
                            <button className="p-2 text-gray-500 hover:text-primary hover:bg-primary/5 rounded-full transition-all">
                                <Search className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Icons Group */}
                        <div className="flex items-center space-x-1 pl-2 border-l border-gray-200">
                            <Link
                                to="/compare"
                                className="relative p-2 text-gray-500 hover:text-secondary hover:bg-secondary/5 rounded-full transition-all group"
                                title="Compare"
                            >
                                <GitCompare className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                {state.comparisonItems.length > 0 && (
                                    <span className="absolute top-0 right-0 h-4 w-4 bg-secondary text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                                        {state.comparisonItems.length}
                                    </span>
                                )}
                            </Link>

                            <Link
                                to="/enquiry-list"
                                className="relative p-2 text-gray-500 hover:text-primary hover:bg-primary/5 rounded-full transition-all group"
                                title="Enquiries"
                            >
                                <ClipboardList className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                {state.items.length > 0 && (
                                    <span className="absolute top-0 right-0 h-4 w-4 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                                        {state.items.length}
                                    </span>
                                )}
                            </Link>

                            <Link
                                to="/cart"
                                className="relative p-2 text-gray-500 hover:text-primary hover:bg-primary/5 rounded-full transition-all group"
                                title="Cart"
                            >
                                <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                {items.length > 0 && (
                                    <span className="absolute top-0 right-0 h-4 w-4 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                                        {items.length}
                                    </span>
                                )}
                            </Link>

                            {/* User Profile */}
                            {user ? (
                                <div className="ml-2 pl-2 relative group">
                                    <Link to="/profile" className="flex items-center gap-2 px-2 py-1.5 rounded-full hover:bg-gray-50 transition-all border border-transparent hover:border-gray-200">
                                        <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-dark text-white rounded-full flex items-center justify-center font-bold text-xs shadow-md">
                                            {user.email?.[0].toUpperCase()}
                                        </div>
                                        <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                                    </Link>

                                    {/* Dropdown would go here - simplified for now */}
                                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right scale-95 group-hover:scale-100 overflow-hidden">
                                        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                                            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Signed in as</p>
                                            <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
                                        </div>
                                        <div className="py-1">
                                            <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary">Your Profile</Link>
                                            <Link to="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary">Orders</Link>
                                            <button onClick={handleSignOut} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Sign out</button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <Link to="/login" className="ml-4 btn btn-primary btn-sm rounded-full shadow-lg shadow-primary/30 hover:shadow-primary/40">
                                    Sign In
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="lg:hidden flex items-center gap-4">
                        <Link to="/cart" className="relative text-gray-600">
                            <ShoppingCart className="w-6 h-6" />
                            {items.length > 0 && (
                                <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white">
                                    {items.length}
                                </span>
                            )}
                        </Link>
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="lg:hidden bg-white border-b border-gray-200 overflow-hidden"
                    >
                        <div className="px-4 py-6 space-y-4">
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    className={clsx(
                                        "block px-4 py-3 rounded-xl text-base font-medium transition-colors",
                                        location.pathname === item.path
                                            ? "bg-primary/10 text-primary"
                                            : "text-gray-600 hover:bg-gray-50"
                                    )}
                                    onClick={() => setIsOpen(false)}
                                >
                                    {item.name}
                                </Link>
                            ))}
                            <div className="border-t border-gray-100 pt-4 mt-4">
                                {user ? (
                                    <>
                                        <div className="flex items-center gap-3 px-4 mb-4">
                                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                                                {user.email?.[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{user.email}</p>
                                                <Link to="/profile" className="text-sm text-primary hover:underline">View Profile</Link>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleSignOut}
                                            className="w-full flex items-center justify-center px-4 py-3 rounded-xl text-red-600 bg-red-50 font-medium"
                                        >
                                            <LogOut className="w-5 h-5 mr-2" />
                                            Sign Out
                                        </button>
                                    </>
                                ) : (
                                    <Link
                                        to="/login"
                                        className="block w-full text-center px-4 py-3 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/30"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Sign In
                                    </Link>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Header;
