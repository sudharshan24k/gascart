import React, { useEffect, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Package, Home, Download, Loader2, Clock } from 'lucide-react';
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
                        {orderId && (
                            <>
                                {loadingOrder ? (
                                    <div className="flex items-center justify-center gap-2 py-4 text-gray-400">
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span className="font-bold">Loading order details...</span>
                                    </div>
                                ) : order?.payment_status === 'paid' ? (
                                    <button
                                        onClick={handleDownloadInvoice}
                                        disabled={downloadingInvoice}
                                        className="block w-full bg-primary text-white font-bold py-4 rounded-xl hover:bg-primary-dark transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Download className="w-5 h-5" />
                                        {downloadingInvoice ? 'Downloading...' : 'Download Invoice'}
                                    </button>
                                ) : (
                                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                                        <Clock className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                                        <p className="text-sm font-bold text-amber-700">Invoice will be available once payment is confirmed</p>
                                        <p className="text-xs text-amber-600 mt-1">This usually takes a few moments</p>
                                    </div>
                                )}
                                <Link to={`/order-tracking/${orderId}`} className="block w-full bg-gray-900 text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition-all flex items-center justify-center gap-2">
                                    <Package className="w-5 h-5" /> Track This Order
                                </Link>
                            </>
                        )}
                        {!orderId && (
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
