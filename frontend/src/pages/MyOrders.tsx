import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDateIST } from '../utils/dateUtils';
import { api, supabase } from '../services/api';
import { Package, ChevronRight, FileText, Clock, ShoppingBag, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const MyOrders: React.FC = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('all'); // all, 30, 90, 180
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        fetchOrders();
    }, [statusFilter, dateFilter, debouncedSearch]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const params: any = {};
            if (statusFilter !== 'all') params.status = statusFilter;
            if (dateFilter !== 'all') params.days = dateFilter;
            if (debouncedSearch) params.search = debouncedSearch;

            const response = await api.orders.list(params);
            if (response.status === 'success') {
                setOrders(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'shipped': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
            case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-neutral-100 text-neutral-800 border-neutral-200';
        }
    };

    const handleDownloadInvoice = async (orderId: string) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                alert('You must be logged in to download invoices.');
                return;
            }

            const response = await fetch(api.orders.getInvoiceUrl(orderId), {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                }
            });

            if (!response.ok) throw new Error('Failed to download invoice');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `invoice-${orderId.slice(-8)}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Invoice download failed:', error);
            alert('Failed to download invoice. Please try again.');
        }
    };

    const tabs = [
        { id: 'all', label: 'All Orders' },
        { id: 'processing', label: 'Processing' },
        { id: 'shipped', label: 'Shipped' },
        { id: 'delivered', label: 'Delivered' },
        { id: 'cancelled', label: 'Cancelled' }
    ];

    return (
        <div className="min-h-screen pt-28 pb-24 bg-neutral-50">
            <div className="container mx-auto px-4 max-w-5xl">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-4xl font-display font-bold text-neutral-900 mb-2">My Orders</h1>
                        <p className="text-neutral-500 font-medium">Track past purchases and download invoices.</p>
                    </div>
                </div>

                {/* Filters & Search */}
                <div className="bg-white p-4 rounded-[24px] shadow-sm border border-neutral-100 mb-8 flex flex-col lg:flex-row items-center gap-4">
                    <div className="flex overflow-x-auto pb-2 lg:pb-0 w-full lg:w-auto gap-2 no-scrollbar">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setStatusFilter(tab.id)}
                                className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${statusFilter === tab.id
                                    ? 'bg-neutral-900 text-white shadow-md'
                                    : 'bg-neutral-50 text-neutral-500 hover:bg-neutral-100'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="w-px h-8 bg-neutral-200 hidden lg:block"></div>

                    <div className="flex items-center gap-2 w-full lg:w-auto">
                        <select
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="bg-neutral-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-neutral-700 focus:ring-2 focus:ring-neutral-200 cursor-pointer outline-none"
                        >
                            <option value="all">All Time</option>
                            <option value="30">Last 30 Days</option>
                            <option value="90">Last 3 Months</option>
                            <option value="180">Last 6 Months</option>
                        </select>
                    </div>

                    <div className="flex-grow w-full lg:w-auto relative">
                        <input
                            type="text"
                            placeholder="Search by Order ID or Product..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-neutral-50 border-none rounded-xl pl-4 pr-10 py-3 text-sm font-medium focus:ring-2 focus:ring-neutral-200 outline-none transition-all placeholder:text-neutral-400"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-10 h-10 animate-spin text-neutral-300 mb-4" />
                        <p className="text-neutral-400 font-bold animate-pulse">Loading orders...</p>
                    </div>
                ) : orders.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-[40px] p-16 text-center shadow-lg shadow-neutral-200/50 border border-neutral-100 flex flex-col items-center"
                    >
                        <div className="w-24 h-24 bg-neutral-50 rounded-full flex items-center justify-center mb-8 relative">
                            <ShoppingBag className="w-10 h-10 text-neutral-300" />
                            {debouncedSearch || statusFilter !== 'all' ? (
                                <div className="absolute top-0 right-0 w-6 h-6 bg-red-400 rounded-full flex items-center justify-center text-white text-xs font-bold">0</div>
                            ) : (
                                <div className="absolute top-0 right-0 w-6 h-6 bg-primary rounded-full animate-ping opacity-20"></div>
                            )}
                        </div>
                        <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                            {debouncedSearch || statusFilter !== 'all' ? 'No orders found' : 'No orders yet'}
                        </h2>
                        <p className="text-neutral-500 max-w-md mx-auto mb-10 text-lg">
                            {debouncedSearch || statusFilter !== 'all'
                                ? 'Try adjusting your filters or search query.'
                                : 'Your order history is currently empty. Browse our catalog to find industrial equipment for your needs.'}
                        </p>
                        <Link to="/shop" className="inline-flex items-center gap-2 bg-neutral-900 text-white font-bold px-8 py-4 rounded-2xl hover:bg-black transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1">
                            {debouncedSearch || statusFilter !== 'all' ? 'Clear Filters' : 'Start Sourcing'} <ArrowRight className="w-5 h-5" />
                        </Link>
                    </motion.div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order, index) => (
                            <motion.div
                                key={order.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-white rounded-[32px] overflow-hidden shadow-sm hover:shadow-lg transition-all border border-neutral-100 group"
                            >
                                <div className="p-8">
                                    <div className="flex flex-wrap items-center justify-between gap-6 mb-8 border-b border-neutral-50 pb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-neutral-900 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-md shadow-neutral-900/20">
                                                #{order.id.slice(0, 4)}
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Order Date</p>
                                                <p className="font-bold text-neutral-900">{formatDateIST(order.created_at)}</p>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-8">
                                            <div>
                                                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Total Amount</p>
                                                <p className="font-bold text-neutral-900 text-lg">₹{Number(order.total_amount || 0).toFixed(2)}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Status</p>
                                                <span className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest border ${getStatusColor(order.status)}`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4 mb-8">
                                        {(order.order_items || []).slice(0, 2).map((item: any) => (
                                            <div key={item.id} className="flex items-center gap-5 p-4 bg-neutral-50 rounded-2xl border border-neutral-100 transition-colors group-hover:bg-neutral-50/80">
                                                <div className="h-20 w-20 bg-white rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden border border-neutral-200">
                                                    {item.product?.image ? (
                                                        <img src={item.product.image} alt={item.product.name} className="h-full w-full object-cover transition-transform group-hover:scale-105 duration-500" />
                                                    ) : (
                                                        <Package className="h-8 w-8 text-neutral-300" />
                                                    )}
                                                </div>
                                                <div className="flex-grow min-w-0">
                                                    <h4 className="font-bold text-neutral-900 text-lg mb-1 truncate">{item.product?.name || 'Product'}</h4>
                                                    <p className="text-sm text-neutral-500 font-medium">Qty: {item.quantity} × <span className="text-neutral-900">₹{item.price_at_purchase?.toLocaleString()}</span></p>
                                                </div>
                                                <div className="hidden sm:block text-right">
                                                    <p className="font-bold text-neutral-900 text-lg">₹{(item.quantity * item.price_at_purchase)?.toLocaleString()}</p>
                                                </div>
                                            </div>
                                        ))}
                                        {(order.order_items || []).length > 2 && (
                                            <div className="pl-4">
                                                <p className="text-sm font-bold text-neutral-400">+ {(order.order_items || []).length - 2} more items in this order</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-dashed border-neutral-200">
                                        <Link
                                            to={`/order-tracking/${order.id}`}
                                            className="flex-grow flex items-center justify-center gap-2 bg-neutral-900 text-white font-bold px-6 py-4 rounded-xl hover:bg-black transition-all shadow-lg shadow-neutral-900/20"
                                        >
                                            <Clock className="h-5 w-5" />
                                            Track Order Status
                                        </Link>
                                        <button
                                            onClick={() => handleDownloadInvoice(order.id)}
                                            className="flex-grow sm:flex-grow-0 flex items-center justify-center gap-2 bg-white text-neutral-900 border-2 border-neutral-100 font-bold px-6 py-4 rounded-xl hover:border-neutral-300 hover:bg-neutral-50 transition-all"
                                        >
                                            <FileText className="h-5 w-5" />
                                            Invoice
                                        </button>
                                        <Link
                                            to={`/order-tracking/${order.id}`}
                                            className="hidden sm:flex items-center justify-center bg-neutral-50 text-neutral-400 w-14 rounded-xl hover:bg-primary hover:text-white transition-all ml-auto"
                                        >
                                            <ChevronRight className="h-6 w-6" />
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyOrders;
