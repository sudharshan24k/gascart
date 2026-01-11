import { Link } from 'react-router-dom';
import { ShoppingCart, User, Menu } from 'lucide-react';

const Header = () => {
    return (
        <header className="bg-white shadow-sm sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="text-2xl font-display font-bold text-primary-600">
                    Gascart
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center space-x-8">
                    <Link to="/" className="text-gray-600 hover:text-primary-600 font-medium">Home</Link>
                    <Link to="/shop" className="text-gray-600 hover:text-primary-600 font-medium">Shop</Link>
                    <Link to="/about" className="text-gray-600 hover:text-primary-600 font-medium">Our Story</Link>
                </nav>

                {/* Icons */}
                <div className="flex items-center space-x-6">
                    <Link to="/cart" className="relative text-gray-600 hover:text-primary-600">
                        <ShoppingCart className="w-6 h-6" />
                        <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                            0
                        </span>
                    </Link>
                    <Link to="/login" className="text-gray-600 hover:text-primary-600">
                        <User className="w-6 h-6" />
                    </Link>
                    <button className="md:hidden text-gray-600">
                        <Menu className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
