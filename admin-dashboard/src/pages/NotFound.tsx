import { Link } from 'react-router-dom';
import { Home, ArrowLeft, AlertTriangle, ShoppingBag, Package } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const NotFound = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <Helmet>
                <title>404 - Route Not Found | Gascart Admin</title>
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>

            <div className="max-w-2xl w-full text-center">
                {/* Visual Element */}
                <div className="relative mb-12 flex justify-center">
                    <div className="w-64 h-64 bg-primary/5 rounded-full absolute -top-10 left-1/2 -translate-x-1/2 blur-3xl animate-pulse" />
                    <div className="relative">
                        <div className="w-32 h-32 bg-white rounded-[40px] shadow-2xl flex items-center justify-center border border-gray-100 transform -rotate-12 transition-transform hover:rotate-0 duration-500">
                            <AlertTriangle className="w-16 h-16 text-primary" />
                        </div>
                        <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-gray-900 rounded-3xl shadow-xl flex items-center justify-center transform rotate-12">
                            <span className="text-white font-black text-xl">404</span>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <h1 className="text-6xl font-black text-gray-900 tracking-tight mb-4">Route Not Found</h1>
                <p className="text-xl text-gray-500 font-bold mb-12 max-w-lg mx-auto leading-relaxed">
                    The requested internal protocol is not recognized. Mission Control cannot find the page you are looking for.
                </p>

                {/* Navigation Hub */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto mb-12">
                    <Link
                        to="/"
                        className="flex items-center justify-center gap-3 px-8 py-5 bg-gray-900 text-white rounded-3xl font-black shadow-xl shadow-gray-900/20 hover:bg-black transition-all active:scale-95 text-sm uppercase tracking-widest"
                    >
                        <Home className="w-5 h-5" /> Dashboard
                    </Link>
                    <Link
                        to="/orders"
                        className="flex items-center justify-center gap-3 px-8 py-5 bg-white text-gray-900 border-2 border-gray-100 rounded-3xl font-black shadow-lg shadow-gray-200/50 hover:border-primary transition-all active:scale-95 text-sm uppercase tracking-widest"
                    >
                        <ShoppingBag className="w-5 h-5 text-primary" /> Recent Orders
                    </Link>
                </div>

                <div className="flex flex-col items-center gap-6">
                    <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-full border border-amber-100">
                        <Package className="w-4 h-4 text-amber-600" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600">Administrative Safeguard Active</span>
                    </div>
                    
                    <button
                        onClick={() => window.history.back()}
                        className="flex items-center gap-2 text-gray-400 hover:text-primary font-black uppercase text-[10px] tracking-widest transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Go Back to Previous State
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
