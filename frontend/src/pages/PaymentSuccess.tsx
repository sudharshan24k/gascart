import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, Download, Package, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../services/api';

const PaymentSuccess: React.FC = () => {
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const orderId = searchParams.get('order_id');
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

    useEffect(() => {
        if (sessionId) {
            checkStatus();
        }
    }, [sessionId]);

    const checkStatus = async () => {
        try {
            const res = await api.payments.getSessionStatus(sessionId!);
            if (res.payment_status === 'paid') {
                setStatus('success');
            } else {
                setStatus('error');
            }
        } catch (err) {
            console.error('Error checking payment status:', err);
            setStatus('error');
        }
    };

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900">Confirming your payment...</h2>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-32 pb-24 bg-gray-50">
            <div className="container mx-auto px-4 max-w-2xl">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white p-12 rounded-[40px] shadow-2xl border border-gray-100 text-center"
                >
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
                        <CheckCircle2 className="w-12 h-12 text-green-500" />
                    </div>

                    <h1 className="text-4xl font-black text-gray-900 mb-4">Payment Successful!</h1>
                    <p className="text-gray-500 mb-8 font-medium">
                        Thank you for your purchase. Your order <span className="text-gray-900 font-bold">#{orderId?.slice(-8)}</span> has been placed and is being processed.
                    </p>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <a
                            href={api.orders.getInvoiceUrl(orderId!)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-primary hover:bg-primary/5 transition-all group"
                        >
                            <Download className="w-5 h-5 text-primary" />
                            <span className="font-bold text-gray-900">Download Invoice</span>
                        </a>
                        <Link
                            to="/profile/orders"
                            className="flex items-center justify-center gap-2 p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-primary hover:bg-primary/5 transition-all"
                        >
                            <Package className="w-5 h-5 text-primary" />
                            <span className="font-bold text-gray-900">Track Order</span>
                        </Link>
                    </div>

                    <div className="space-y-4">
                        <Link
                            to="/products"
                            className="w-full bg-gray-900 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-primary transition-all flex items-center justify-center gap-2"
                        >
                            Continue Shopping
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default PaymentSuccess;
