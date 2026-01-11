import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Home, ShoppingBag, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

const OrderConfirmation: React.FC = () => {
    return (
        <div className="min-h-[70vh] flex items-center justify-center bg-white">
            <div className="container mx-auto px-4 py-16 text-center max-w-2xl">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-primary/10 text-primary rounded-full mb-8">
                        <CheckCircle className="w-12 h-12" />
                    </div>

                    <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-6">
                        Order Confirmed!
                    </h1>

                    <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                        Thank you for your interest in Gascart tech. Your order <strong>#GC-90210</strong> has been successfully placed. We've sent a detailed confirmation email to your registered address.
                    </p>

                    <div className="bg-neutral-light/50 p-8 rounded-3xl border border-neutral-light mb-12 flex flex-col items-center">
                        <Mail className="w-6 h-6 text-primary mb-3" />
                        <h3 className="font-bold text-gray-900 mb-2">Next Steps</h3>
                        <p className="text-gray-600 text-sm">
                            Our technical team will review your order requirements and contact you within 24 business hours for implementation details.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link to="/" className="flex items-center justify-center px-8 py-4 bg-gray-900 text-white rounded-full font-bold hover:bg-black transition-all shadow-lg">
                            <Home className="w-5 h-5 mr-2" />
                            Return Home
                        </Link>
                        <Link to="/shop" className="flex items-center justify-center px-8 py-4 bg-primary text-white rounded-full font-bold hover:bg-primary-dark transition-all shadow-lg">
                            <ShoppingBag className="w-5 h-5 mr-2" />
                            Continue Shopping
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default OrderConfirmation;
