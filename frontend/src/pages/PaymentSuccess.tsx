import React, { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, ShoppingBag, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';

const PaymentSuccess: React.FC = () => {
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get('orderId');

    useEffect(() => {
        // Scroll to top on mount
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen pt-32 pb-24 bg-neutral-50 flex items-center justify-center">
            <div className="container mx-auto px-4 max-w-2xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white p-8 md:p-12 rounded-[40px] border border-neutral-100 shadow-2xl text-center relative overflow-hidden"
                >
                    {/* Background Decorative Elements */}
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-green-50 rounded-full blur-3xl opacity-50"></div>
                    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl opacity-50"></div>

                    <div className="relative z-10">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
                            className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner"
                        >
                            <CheckCircle2 className="w-12 h-12 text-green-600" />
                        </motion.div>

                        <h1 className="text-4xl md:text-5xl font-display font-black text-neutral-900 mb-4">
                            Payment Successful!
                        </h1>
                        <p className="text-lg text-neutral-500 font-medium mb-10 max-w-md mx-auto">
                            Thank you for your order. We've received your payment and our team is already getting everything ready for you.
                        </p>

                        {orderId && (
                            <div className="bg-neutral-50 rounded-3xl p-6 mb-10 border border-neutral-100 inline-block">
                                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Order Number</p>
                                <p className="text-2xl font-mono font-bold text-neutral-900">#{orderId.slice(0, 8).toUpperCase()}</p>
                            </div>
                        )}

                        <div className="grid sm:grid-cols-2 gap-4">
                            <Link to="/my-orders" className="w-full">
                                <Button
                                    variant="outline"
                                    fullWidth
                                    size="lg"
                                    icon={<Package className="w-5 h-5" />}
                                    className="rounded-2xl py-6"
                                >
                                    View My Orders
                                </Button>
                            </Link>
                            <Link to="/shop" className="w-full">
                                <Button
                                    fullWidth
                                    size="lg"
                                    icon={<ShoppingBag className="w-5 h-5" />}
                                    iconPosition="right"
                                    className="rounded-2xl py-6"
                                >
                                    Continue Shopping
                                </Button>
                            </Link>
                        </div>

                        <p className="mt-12 text-sm text-neutral-400 font-medium italic">
                            A confirmation email has been sent to your registered address.
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default PaymentSuccess;
