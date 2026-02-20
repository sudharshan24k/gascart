import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, Download, Package, ArrowRight, Loader2, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import { api, supabase } from '../services/api';

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
            <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 pt-20">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6"></div>
                <h2 className="text-xl font-bold text-neutral-900 animate-pulse">Verifying secure transaction...</h2>
                <p className="text-neutral-500 mt-2">Please do not close this window.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-32 pb-24 bg-neutral-50 flex items-center justify-center">
            <div className="container mx-auto px-4 max-w-lg text-center">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white p-12 rounded-[40px] shadow-2xl shadow-neutral-200/50 border border-neutral-100 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-bl-full -mr-8 -mt-8"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/10 rounded-tr-full -ml-8 -mb-8"></div>

                    <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 relative z-10">
                        <div className="absolute inset-0 bg-green-500/20 rounded-full animate-pulse"></div>
                        <CheckCircle2 className="w-12 h-12 text-green-500 relative z-10" />
                    </div>

                    <h1 className="text-3xl font-display font-bold text-neutral-900 mb-4 tracking-tight">Payment Successful!</h1>
                    <p className="text-neutral-500 mb-8 font-medium leading-relaxed">
                        Transaction completed securely. Your order <span className="text-neutral-900 font-bold bg-neutral-100 px-2 py-0.5 rounded">#{orderId?.slice(-8)}</span> has been confirmed.
                    </p>

                    <div className="space-y-4 relative z-10">
                        <div className="grid grid-cols-2 gap-4">
                            <a
                                href={api.orders.getInvoiceUrl(orderId!)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex flex-col items-center justify-center gap-2 p-5 bg-neutral-50 rounded-2xl border border-neutral-100 hover:border-neutral-300 hover:bg-neutral-100 transition-all group"
                            >
                                <Download className="w-6 h-6 text-neutral-400 group-hover:text-neutral-900 transition-colors" />
                                <span className="font-bold text-xs uppercase tracking-wider text-neutral-500 group-hover:text-neutral-900">Invoice</span>
                            </a>
                            <Link
                                to={`/order-tracking/${orderId}`}
                                className="flex flex-col items-center justify-center gap-2 p-5 bg-neutral-50 rounded-2xl border border-neutral-100 hover:border-primary hover:bg-primary/5 transition-all group"
                            >
                                <Package className="w-6 h-6 text-neutral-400 group-hover:text-primary transition-colors" />
                                <span className="font-bold text-xs uppercase tracking-wider text-neutral-500 group-hover:text-primary">Track Order</span>
                            </Link>
                        </div>

                        <Link
                            to="/shop"
                            className="w-full bg-neutral-900 text-white font-black py-5 rounded-2xl shadow-xl shadow-neutral-900/20 hover:bg-black hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
                        >
                            Continue Sourcing
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default PaymentSuccess;
