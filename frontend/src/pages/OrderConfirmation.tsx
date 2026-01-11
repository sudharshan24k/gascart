import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Home, ClipboardList, Mail, Settings2 } from 'lucide-react';
import { motion } from 'framer-motion';

const OrderConfirmation: React.FC = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-32 pb-24">
            <div className="container mx-auto px-4 text-center max-w-2xl">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white p-12 rounded-[48px] shadow-2xl border border-gray-100"
                >
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-primary/10 text-primary rounded-full mb-8">
                        <CheckCircle className="w-12 h-12" />
                    </div>

                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 uppercase tracking-tight">
                        Enquiry Logged
                    </h1>

                    <p className="text-xl text-gray-500 mb-10 leading-relaxed font-medium">
                        Your technical enquiry <strong>#ENQ-{(Math.floor(Math.random() * 90000) + 10000)}</strong> has been successfully recorded in our industrial database.
                    </p>

                    <div className="bg-gray-50 p-8 rounded-[32px] border border-gray-100 mb-12 flex flex-col items-center">
                        <Settings2 className="w-8 h-8 text-primary mb-4" />
                        <h3 className="font-bold text-gray-900 mb-2">Engineering Workflow</h3>
                        <p className="text-gray-500 text-sm font-medium">
                            Our technical consultants will review your technical parameters and site requirements. You will receive a formalized Request for Quotation (RFQ) response within 24-48 business hours.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link to="/" className="flex items-center justify-center px-10 py-5 bg-gray-900 text-white rounded-2xl font-black hover:bg-black transition-all shadow-xl">
                            <Home className="w-5 h-5 mr-3" />
                            Return Home
                        </Link>
                        <Link to="/shop" className="flex items-center justify-center px-10 py-5 bg-primary text-white rounded-2xl font-black hover:bg-primary-dark transition-all shadow-xl shadow-primary/20">
                            <ClipboardList className="w-5 h-5 mr-3" />
                            Browse Marketplace
                        </Link>
                    </div>
                </motion.div>

                <div className="mt-12 flex items-center justify-center gap-8 opacity-40 grayscale">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/e/e4/ISO_9001_Logo.png" alt="ISO" className="h-12" />
                    <Mail className="w-8 h-8" />
                    <div className="text-left">
                        <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">Direct Support</span>
                        <span className="block text-sm font-bold text-gray-900">engineering@gascart.in</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderConfirmation;
