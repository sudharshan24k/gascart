import React, { useEffect, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Package, Home, Download, Loader2, Clock, ArrowRight, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../services/api';

const OrderSuccess: React.FC = () => {
    const location = useLocation();
    const [searchParams] = useSearchParams();

    // Get orderId from URL params (primary) or location state (fallback)
    const orderId = searchParams.get('orderId') || location.state?.orderId;
    const [downloadingInvoice, setDownloadingInvoice] = useState(false);
    const [order, setOrder] = useState<any>(null);
    const [loadingOrder, setLoadingOrder] = useState(true);

    // Fetch order details to check payment status
    useEffect(() => {
        const fetchOrder = async () => {
            if (!orderId) {
                setLoadingOrder(false);
                return;
            }

            try {
                const { data, error } = await supabase
                    .from('orders')
                    .select('payment_status, total_amount, created_at')
                    .eq('id', orderId)
                    .single();

                if (!error && data) {
                    setOrder(data);
                }
            } catch (err) {
                console.error('Failed to fetch order:', err);
            } finally {
                setLoadingOrder(false);
            }
        };

        fetchOrder();
    }, [orderId]);

    const handleDownloadInvoice = async () => {
        if (!orderId) return;

        setDownloadingInvoice(true);
        try {
            const token = (await supabase.auth.getSession()).data.session?.access_token;

            if (!token) {
                alert('Authentication failed. Please log in again.');
                setDownloadingInvoice(false);
                return;
            }

            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
            const baseUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;

            // Open invoice in new tab with authentication
            const invoiceUrl = `${baseUrl}/orders/${orderId}/invoice`;

            // Create a temporary link to trigger download with auth header
            const response = await fetch(invoiceUrl, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `invoice-${orderId.slice(0, 8)}.pdf`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } else if (response.status === 404) {
                alert('Order not found. Please contact support if this issue persists.');
            } else if (response.status === 401 || response.status === 403) {
                alert('Authentication failed. Please log in again.');
            } else {
                alert('Failed to download invoice. Please try again or contact support.');
            }
        } catch (error) {
            console.error('Invoice download error:', error);
            alert('Network error. Please check your connection and try again.');
        } finally {
            setDownloadingInvoice(false);
        }
    };

    return (
        <div className="min-h-screen pt-32 pb-24 bg-neutral-50 flex items-center justify-center">
            <div className="container mx-auto px-4 max-w-lg text-center">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white p-12 rounded-[40px] shadow-2xl shadow-neutral-200/50 border border-neutral-100 relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-primary"></div>

                    <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 relative">
                        <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-20"></div>
                        <CheckCircle2 className="w-12 h-12 text-green-500" />
                    </div>

                    <h1 className="text-3xl font-display font-bold text-neutral-900 mb-4">Order Confirmed!</h1>
                    <p className="text-neutral-500 mb-8 leading-relaxed font-medium">
                        Thank you for your business. Your industrial equipment order has been received and is being processed at our fulfillment center.
                    </p>

                    {orderId && (
                        <div className="mb-8 p-6 bg-neutral-50 rounded-2xl border border-dashed border-neutral-200">
                            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2">Order Reference</p>
                            <p className="text-2xl font-mono font-black text-neutral-900 tracking-wider">#{orderId.slice(0, 8).toUpperCase()}</p>
                        </div>
                    )}

                    <div className="space-y-4">
                        {orderId && (
                            <>
                                {loadingOrder ? (
                                    <div className="flex items-center justify-center gap-2 py-4 text-neutral-400">
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span className="font-bold">Retrieving order details...</span>
                                    </div>
                                ) : order?.payment_status === 'paid' ? (
                                    <button
                                        onClick={handleDownloadInvoice}
                                        disabled={downloadingInvoice}
                                        className="w-full bg-white text-neutral-900 border-2 border-neutral-100 font-bold py-4 rounded-2xl hover:bg-neutral-50 hover:border-neutral-200 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
                                    >
                                        <Download className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                        {downloadingInvoice ? 'Generating Invoice...' : 'Download Official Invoice'}
                                    </button>
                                ) : (
                                    <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 text-center">
                                        <Clock className="w-8 h-8 text-amber-500 mx-auto mb-3" />
                                        <p className="text-sm font-bold text-amber-800 mb-1">Payment Confirmation Pending</p>
                                        <p className="text-xs text-amber-600 font-medium">Invoice will be available once payment is verified.</p>
                                    </div>
                                )}

                                <Link
                                    to={`/order-tracking/${orderId}`}
                                    className="w-full bg-neutral-900 text-white font-bold py-5 rounded-2xl hover:bg-black transition-all flex items-center justify-center gap-3 shadow-xl shadow-neutral-900/20 hover:-translate-y-1 hover:shadow-2xl"
                                >
                                    <Package className="w-5 h-5" /> Track Order Status
                                </Link>
                            </>
                        )}

                        {!orderId && (
                            <Link
                                to="/my-orders"
                                className="w-full bg-neutral-900 text-white font-bold py-5 rounded-2xl hover:bg-black transition-all flex items-center justify-center gap-3 shadow-xl shadow-neutral-900/20"
                            >
                                <Package className="w-5 h-5" /> View My Orders
                            </Link>
                        )}

                        <Link
                            to="/shop"
                            className="w-full bg-transparent text-neutral-500 font-bold py-4 rounded-2xl hover:text-neutral-900 transition-all flex items-center justify-center gap-2"
                        >
                            <ShoppingBag className="w-5 h-5" /> Continue Sourcing
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default OrderSuccess;
