import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle2, Package, Home } from 'lucide-react';
import { motion } from 'framer-motion';

const OrderSuccess: React.FC = () => {
    const location = useLocation();
    const orderId = location.state?.orderId;

    return (
        <div className="min-h-screen pt-32 pb-24 bg-gray-50 flex items-center justify-center">
            <div className="container mx-auto px-4 max-w-lg text-center">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white p-12 rounded-[40px] shadow-2xl border border-gray-100"
                >
                    <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8">
                        <CheckCircle2 className="w-12 h-12" />
                    </div>

                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Confirmed!</h1>
                    <p className="text-gray-500 mb-6 leading-relaxed">
                        Thank you for your purchase. Your industrial assets are being allocated from our depot. A confirmation email has been sent.
                    </p>

                    {orderId && (
                        <div className="mb-8 p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Order Number</p>
                            <p className="text-xl font-mono font-black text-gray-900">#{orderId.slice(0, 8).toUpperCase()}</p>
                        </div>
                    )}

                    <div className="space-y-4">
                        {orderId ? (
                            <Link to={`/order-tracking/${orderId}`} className="block w-full bg-gray-900 text-white font-bold py-4 rounded-xl hover:bg-primary transition-all flex items-center justify-center gap-2">
                                <Package className="w-5 h-5" /> Track This Order
                            </Link>
                        ) : (
                            <Link to="/my-orders" className="block w-full bg-gray-900 text-white font-bold py-4 rounded-xl hover:bg-primary transition-all flex items-center justify-center gap-2">
                                <Package className="w-5 h-5" /> View My Orders
                            </Link>
                        )}
                        <Link to="/" className="block w-full bg-white border-2 border-gray-100 text-gray-900 font-bold py-4 rounded-xl hover:border-gray-900 transition-all flex items-center justify-center gap-2">
                            <Home className="w-5 h-5" /> Back to Marketplace
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default OrderSuccess;
