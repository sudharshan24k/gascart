import React from 'react';
import { Link } from 'react-router-dom';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

const PaymentCancel: React.FC = () => {
    return (
        <div className="min-h-screen pt-32 pb-24 bg-gray-50">
            <div className="container mx-auto px-4 max-w-2xl">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white p-12 rounded-[40px] shadow-2xl border border-gray-100 text-center"
                >
                    <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-8">
                        <XCircle className="w-12 h-12 text-red-500" />
                    </div>

                    <h1 className="text-4xl font-black text-gray-900 mb-4">Payment Cancelled</h1>
                    <p className="text-gray-500 mb-12 font-medium">
                        The payment process was cancelled. No charges were made to your account.
                    </p>

                    <div className="flex flex-col gap-4">
                        <Link
                            to="/checkout"
                            className="w-full bg-primary text-white font-black py-5 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                        >
                            <RefreshCw className="w-5 h-5" />
                            Try Again
                        </Link>
                        <Link
                            to="/cart"
                            className="w-full bg-gray-50 text-gray-900 font-bold py-5 rounded-2xl border border-gray-100 hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
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
