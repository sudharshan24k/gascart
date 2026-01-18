import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Package, ChevronRight, FileText, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const MyOrders: React.FC = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await api.orders.list();
                if (response.status === 'success') {
                    setOrders(response.data);
                }
            } catch (error) {
                console.error('Failed to fetch orders:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'processing': return 'bg-blue-100 text-blue-800';
            case 'shipped': return 'bg-purple-100 text-purple-800';
            case 'delivered': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-light py-12">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-display font-bold text-gray-900">My Orders</h1>
                    <div className="bg-white p-2 px-4 rounded-full shadow-sm border border-neutral-dark/10 flex items-center gap-2">
                        <Package className="h-5 w-5 text-primary" />
                        <span className="font-semibold">{orders.length} Orders</span>
                    </div>
                </div>

                {orders.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center shadow-lg border border-neutral-dark/10">
                        <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-xl font-bold mb-2">No orders found</h2>
                        <p className="text-gray-600 mb-8">You haven't placed any orders yet.</p>
                        <Link to="/shop" className="inline-block bg-primary text-white font-bold px-8 py-3 rounded-full hover:bg-primary-dark transition-all">
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order, index) => (
                            <motion.div
                                key={order.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-shadow border border-neutral-dark/10"
                            >
                                <div className="p-6 sm:p-8">
                                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-6 border-b border-neutral-light">
                                        <div>
                                            <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">Order Date</p>
                                            <p className="font-bold">{new Date(order.created_at).toLocaleDateString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">Order #</p>
                                            <p className="font-mono text-sm">{order.id.slice(0, 8).toUpperCase()}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">Status</p>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">Total</p>
                                            <p className="font-bold text-primary">${order.total_amount.toFixed(2)}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4 mb-8">
                                        {order.order_items.slice(0, 2).map((item: any) => (
                                            <div key={item.id} className="flex items-center gap-4">
                                                <div className="h-16 w-16 bg-neutral-light rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden border border-neutral-dark/10">
                                                    {item.product?.image ? (
                                                        <img src={item.product.image} alt={item.product.name} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <Package className="h-8 w-8 text-gray-300" />
                                                    )}
                                                </div>
                                                <div className="flex-grow">
                                                    <h4 className="font-bold text-gray-900">{item.product?.name || 'Product'}</h4>
                                                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                                </div>
                                            </div>
                                        ))}
                                        {order.order_items.length > 2 && (
                                            <p className="text-sm text-gray-500 pl-20">+ {order.order_items.length - 2} more items</p>
                                        )}
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <Link
                                            to={`/order-tracking/${order.id}`}
                                            className="flex-grow flex items-center justify-center gap-2 bg-neutral-light hover:bg-neutral-dark/20 text-gray-900 font-bold px-6 py-3 rounded-2xl transition-all border border-neutral-dark/10"
                                        >
                                            <Clock className="h-5 w-5" />
                                            Track Order
                                        </Link>
                                        <a
                                            href={api.orders.getInvoiceUrl(order.id)}
                                            download
                                            className="flex-grow flex items-center justify-center gap-2 bg-white hover:bg-neutral-light text-primary font-bold px-6 py-3 rounded-2xl transition-all border border-primary/20"
                                        >
                                            <FileText className="h-5 w-5" />
                                            Invoice PDF
                                        </a>
                                        <Link
                                            to={`/order-tracking/${order.id}`}
                                            className="w-full sm:w-auto flex items-center justify-center bg-gray-900 hover:bg-black text-white p-3 rounded-2xl transition-all"
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
