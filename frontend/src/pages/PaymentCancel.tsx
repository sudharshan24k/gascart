import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, RefreshCw, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';

const PaymentCancel: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen pt-32 pb-24 bg-neutral-50 flex items-center justify-center">
            <div className="container mx-auto px-4 max-w-2xl">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    className="bg-white p-8 md:p-12 rounded-[40px] border border-neutral-100 shadow-2xl text-center relative overflow-hidden"
                >
                    {/* Background Decorative Elements */}
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-50 rounded-full blur-3xl opacity-50"></div>
                    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-neutral-100 rounded-full blur-3xl opacity-50"></div>

                    <div className="relative z-10">
                        <motion.div
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner"
                        >
                            <AlertCircle className="w-12 h-12 text-amber-600" />
                        </motion.div>

                        <h1 className="text-4xl md:text-5xl font-display font-black text-neutral-900 mb-4">
                            Payment Cancelled
                        </h1>
                        <p className="text-lg text-neutral-500 font-medium mb-10 max-w-md mx-auto">
                            The payment process was interrupted or cancelled. No funds have been deducted from your account.
                        </p>

                        <div className="flex flex-col gap-4 max-w-sm mx-auto">
                            <Button
                                onClick={() => navigate('/checkout')}
                                fullWidth
                                size="lg"
                                icon={<RefreshCw className="w-5 h-5" />}
                                className="rounded-2xl py-6"
                            >
                                Re-attempt Payment
                            </Button>

                            <div className="grid grid-cols-2 gap-4">
                                <Link to="/" className="w-full">
                                    <Button
                                        variant="outline"
                                        fullWidth
                                        size="lg"
                                        icon={<Home className="w-5 h-5" />}
                                        className="rounded-2xl"
                                    >
                                        Home
                                    </Button>
                                </Link>
                                <Link to="/cart" className="w-full">
                                    <Button
                                        variant="outline"
                                        fullWidth
                                        size="lg"
                                        icon={<ArrowLeft className="w-5 h-5" />}
                                        className="rounded-2xl"
                                    >
                                        Cart
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        <p className="mt-12 text-sm text-neutral-400 font-medium">
                            Need help? Contact our support at <span className="text-neutral-900 font-bold">support@gascart.in</span>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default PaymentCancel; 
