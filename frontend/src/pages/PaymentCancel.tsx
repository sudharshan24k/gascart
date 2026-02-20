import React from 'react';
import { Link } from 'react-router-dom';
import { XCircle, ArrowLeft, RefreshCw, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const PaymentCancel: React.FC = () => {
    return (
        <div className="min-h-screen pt-32 pb-24 bg-neutral-50 flex items-center justify-center">
            <div className="container mx-auto px-4 max-w-lg text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white p-12 rounded-[40px] shadow-2xl shadow-neutral-200/50 border border-neutral-100 relative overflow-hidden"
                >
                    <div className="absolute top-0 w-full h-2 bg-red-500 left-0"></div>

                    <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8 relative">
                        <div className="absolute inset-0 bg-red-100 rounded-full animate-ping opacity-20"></div>
                        <XCircle className="w-12 h-12 text-red-500 relative z-10" />
                    </div>

                    <h1 className="text-3xl font-display font-bold text-neutral-900 mb-4">Payment Cancelled</h1>
                    <p className="text-neutral-500 mb-8 font-medium leading-relaxed">
                        The transaction was not completed. No charges were made to your account. Your order has been saved but not finalized.
                    </p>

                    <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-left">
                        <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="text-sm font-bold text-red-800">Why did this happen?</h4>
                            <p className="text-xs text-red-600 mt-1">This could be due to a declined card, insufficient funds, or simply clicking the cancel button.</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <Link
                            to="/checkout"
                            className="w-full bg-neutral-900 text-white font-black py-5 rounded-2xl shadow-xl shadow-neutral-900/20 hover:bg-black hover:-translate-y-1 transition-all flex items-center justify-center gap-2 group"
                        >
                            <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                            Use Different Payment Method
                        </Link>
                        <Link
                            to="/cart"
                            className="w-full bg-white text-neutral-900 font-bold py-4 rounded-2xl border-2 border-neutral-100 hover:border-neutral-300 hover:bg-neutral-50 transition-all flex items-center justify-center gap-2"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Return to Cart
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default PaymentCancel;
