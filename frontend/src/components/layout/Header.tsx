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
        { name: 'Resources', path: '/resources' },
        { name: 'Experts', path: '/experts' },
    ];

    const handleSignOut = async () => {
        await signOut();
        setIsOpen(false);
    };

    return (
        <nav className="bg-white/80 backdrop-blur-md shadow-sm fixed w-full z-50 transition-all duration-300 border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20">
                    <div className="flex items-center">
                        <Link to="/" className="flex-shrink-0 flex items-center group">
                            <Leaf className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-300" />
                            <span className="ml-2 text-2xl font-bold text-gray-800 tracking-tight">Gascart</span>
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={clsx(
                                    "text-gray-500 hover:text-primary transition-colors duration-200 text-sm font-bold uppercase tracking-wider",
                                    location.pathname === item.path && "text-primary px-3 py-1 bg-primary/5 rounded-full"
                                )}
                            >
                                {item.name}
                            </Link>
                        ))}

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
                                    <span className="text-xs font-bold text-gray-700 hidden lg:block">Hey, {user.email?.split('@')[0]}</span>
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
                    <div className="md:hidden flex items-center gap-4">
                        <Link to="/cart" className="text-gray-400 relative">
                            <ShoppingCart className="w-6 h-6" />
                            {items.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white">
                                    {items.length}
                                </span>
                            )}
                        </Link>
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-gray-600 focus:outline-none p-2"
                        >
                            {isOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden absolute w-full bg-white shadow-2xl border-t border-gray-100 animate-in slide-in-from-top duration-300">
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
                        <div className="pt-4 mt-4 border-t border-gray-50 flex gap-4">
                            {user ? (
                                <button
                                    onClick={handleSignOut}
                                    className="flex-1 px-4 py-4 text-center rounded-2xl text-base font-bold bg-gray-50 text-gray-700 hover:bg-red-50 hover:text-red-500"
                                >
                                    Sign Out
                                </button>
                            ) : (
                                <Link
                                    to="/login"
                                    className="flex-1 px-4 py-4 text-center rounded-2xl text-base font-bold bg-gray-50 text-gray-700"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Login
                                </Link>
                            )}
                            <Link
                                to="/contact"
                                className="flex-1 px-4 py-4 text-center rounded-2xl text-base font-bold bg-primary text-white shadow-lg"
                                onClick={() => setIsOpen(false)}
                            >
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Header;
