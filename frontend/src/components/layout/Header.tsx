import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Leaf, ShoppingCart, User } from 'lucide-react';
import { clsx } from 'clsx';
// import { useCart } from '../../context/CartContext'; // Assuming this exists or will exist

const Header: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    // const { cartItems } = useCart(); // Uncomment when context is verified

    const navItems = [
        { name: 'Home', path: '/' },
        { name: 'Learn', path: '/learn' },
        { name: 'Marketplace', path: '/shop' },
        { name: 'Experts', path: '/experts' },
        { name: 'About', path: '/about' },
        { name: 'Contact', path: '/contact' },
    ];

    return (
        <nav className="bg-white shadow-lg fixed w-full z-50 transition-all duration-300">
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
                                    "text-gray-600 hover:text-primary transition-colors duration-200 font-medium relative py-1",
                                    location.pathname === item.path && "text-primary font-bold after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary"
                                )}
                            >
                                {item.name}
                            </Link>
                        ))}

                        <div className="flex items-center space-x-4 pl-4 border-l border-gray-200">
                            <Link to="/cart" className="relative text-gray-600 hover:text-primary transition-colors p-2 hover:bg-gray-100 rounded-full">
                                <ShoppingCart className="w-5 h-5" />
                                {/* <span className="absolute top-0 right-0 bg-secondary text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                        {cartItems?.length || 0}
                    </span> */}
                            </Link>
                            <Link to="/login" className="text-gray-600 hover:text-primary transition-colors p-2 hover:bg-gray-100 rounded-full">
                                <User className="w-5 h-5" />
                            </Link>
                            <Link
                                to="/contact"
                                className="bg-primary hover:bg-primary-dark text-white px-5 py-2 rounded-full transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                            >
                                Get Started
                            </Link>
                        </div>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <Link to="/cart" className="mr-4 text-gray-600 hover:text-primary relative">
                            <ShoppingCart className="w-6 h-6" />
                            {/* <span className="absolute -top-1 -right-1 bg-secondary text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">0</span> */}
                        </Link>
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-gray-600 hover:text-gray-900 focus:outline-none p-2"
                        >
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden absolute w-full bg-white shadow-xl border-t border-gray-100">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={clsx(
                                    "block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50 transition-colors",
                                    location.pathname === item.path && "text-primary bg-primary-50"
                                )}
                                onClick={() => setIsOpen(false)}
                            >
                                {item.name}
                            </Link>
                        ))}
                        <Link
                            to="/login"
                            className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50"
                            onClick={() => setIsOpen(false)}
                        >
                            Login / Account
                        </Link>
                        <Link
                            to="/contact"
                            className="block px-3 py-3 mt-4 text-center rounded-md text-base font-medium bg-primary text-white hover:bg-primary-dark shadow-md"
                            onClick={() => setIsOpen(false)}
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Header;
