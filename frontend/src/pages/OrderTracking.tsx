import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { formatDateIST } from '../utils/dateUtils';
import { Package, ChevronLeft, MapPin, CreditCard, Clock, CheckCircle, Truck, Info, FileText, Loader2, XCircle } from 'lucide-react';
// import { motion } from 'framer-motion';

const OrderTracking: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            if (!id) return;
            try {
                const response = await api.orders.get(id);
                if (response.status === 'success') {
                    setOrder(response.data);
                }
            } catch (error) {
                console.error('Failed to fetch order details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [id]);

    const handleCancelOrder = async () => {
        if (!id) return;
        if (!window.confirm('Are you sure you want to cancel this order? Stock will be reserved for others.')) return;

        try {
            const res = await api.orders.cancel(id);
            if (res.status === 'success') {
                alert('Order cancelled successfully');
                // Refresh order data
                const response = await api.orders.get(id);
                if (response.status === 'success') setOrder(response.data);
            } else {
                alert('Failed to cancel: ' + res.message);
            }
        } catch (err) {
            console.error('Cancel order error:', err);
            alert('An error occurred while cancelling the order');
        }
    };


    const steps = [
        { key: 'pending', label: 'Order Placed', icon: Clock },
        { key: 'processing', label: 'Processing', icon: Info },
        { key: 'shipped', label: 'Shipped', icon: Truck },
        { key: 'delivered', label: 'Delivered', icon: CheckCircle },
    ];

    const currentStatus = order?.status?.toLowerCase() || 'pending';
    let currentStepIndex = steps.findIndex(step => step.key === currentStatus);
    if (currentStatus === 'cancelled') currentStepIndex = -1; // Handle cancelled state separately

    if (loading) {
        return (
            <div className="min-h-screen pt-32 flex justify-center bg-neutral-50">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen pt-32 pb-24 bg-neutral-50 flex flex-col items-center justify-center text-center px-4">
                <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mb-6">
                    <Package className="w-10 h-10 text-neutral-400" />
                </div>
                <h2 className="text-2xl font-bold text-neutral-900 mb-2">Order Not Found</h2>
                <p className="text-neutral-500 mb-8">The order you are looking for does not exist or you do not have permission to view it.</p>
                <Link to="/my-orders" className="text-primary font-bold hover:underline">Return to My Orders</Link>
            </div>
        );
    }

    const renderAddress = (address: any) => {
        if (!address) return 'No address provided';
        if (typeof address === 'string') return address;

        const parts = [
            address.address_line1,
            address.address_line2,
            `${address.city}, ${address.state} ${address.zip_code || address.postal_code}`,
            address.country
        ].filter(Boolean);

        return (
            <div className="space-y-1">
                <p className="font-bold text-neutral-900">{address.full_name}</p>
                <p>{parts.join(', ')}</p>
                {address.phone && <p className="text-neutral-500 text-xs">Ph: {address.phone}</p>}
            </div>
        );
    };

    return (
        <div className="min-h-screen pt-28 pb-24 bg-neutral-50">
            <div className="container mx-auto px-4 max-w-5xl">
                <Link to="/my-orders" className="inline-flex items-center text-neutral-500 hover:text-neutral-900 mb-8 font-bold transition-colors group">
                    <ChevronLeft className="mr-2 w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Back to My Orders
                </Link>

                <div className="bg-white rounded-[40px] shadow-xl shadow-neutral-200/50 overflow-hidden border border-neutral-100">
                    {/* Header */}
                    <div className="bg-neutral-900 p-8 md:p-12 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">Order Tracking</h1>
                                <p className="text-neutral-400 font-mono text-lg">#{order.id.toUpperCase()}</p>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className={`px-6 py-2 rounded-xl text-sm font-black uppercase tracking-widest mb-2 ${order.status === 'delivered' ? 'bg-green-500 text-white' :
                                    order.status === 'cancelled' ? 'bg-red-500 text-white' :
                                        'bg-white text-neutral-900'
                                    }`}>
                                    {order.status}
                                </span>
                                <p className="text-sm text-neutral-400 font-medium">Placed on {formatDateIST(order.created_at)}</p>

                                {order.status === 'pending' && (
                                    <button
                                        onClick={handleCancelOrder}
                                        className="mt-6 text-xs font-bold text-red-400 hover:text-red-300 transition-colors uppercase tracking-widest border border-red-400/30 hover:border-red-300 px-6 py-3 rounded-xl flex items-center gap-2 group"
                                    >
                                        <XCircle className="w-4 h-4" /> Cancel Order
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Timeline */}
                        {order.status !== 'cancelled' && (
                            <div className="mt-16 mb-4 relative">
                                <div className="absolute top-1/2 left-0 w-full h-1 bg-white/10 -translate-y-1/2 hidden md:block rounded-full"></div>
                                <div className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 hidden md:block rounded-full transition-all duration-1000" style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}></div>

                                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
                                    {steps.map((step, index) => {
                                        const isCompleted = index <= currentStepIndex;
                                        const isCurrent = index === currentStepIndex;

                                        return (
                                            <div key={step.key} className="flex flex-row md:flex-col items-center gap-4 md:text-center group">
                                                <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 border-4 ${isCompleted ? 'bg-primary border-neutral-900 text-white shadow-lg shadow-primary/50' : 'bg-neutral-800 border-neutral-900 text-neutral-600'
                                                    } ${isCurrent ? 'scale-110 ring-4 ring-primary/20' : ''}`}>
                                                    <step.icon className="w-6 h-6" />
                                                </div>
                                                <div className="flex flex-col md:items-center">
                                                    <span className={`text-sm font-bold transition-colors ${isCompleted ? 'text-white' : 'text-neutral-500'}`}>
                                                        {step.label}
                                                    </span>
                                                    {isCurrent && <span className="text-[10px] uppercase tracking-widest text-primary font-black mt-1 animate-pulse">In Progress</span>}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                        {order.status === 'cancelled' && (
                            <div className="mt-12 p-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-200 flex items-center gap-4">
                                <XCircle className="w-8 h-8 text-red-500" />
                                <div>
                                    <h3 className="font-bold text-lg text-white">Order Cancelled</h3>
                                    <p className="text-sm opacity-80">This order was cancelled. If you have any questions, please contact support.</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-8 md:p-12 bg-white">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                            {/* Left Column: Items */}
                            <div className="lg:col-span-7 space-y-8">
                                <div>
                                    <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-neutral-900">
                                        <Package className="w-6 h-6 text-primary" /> Order Items
                                    </h3>
                                    <div className="space-y-4">
                                        {(order.order_items || []).map((item: any) => (
                                            <div key={item.id} className="flex gap-6 p-6 bg-neutral-50 rounded-[24px] border border-neutral-100 group hover:bg-neutral-100/50 transition-colors">
                                                <div className="h-24 w-24 bg-white rounded-2xl flex-shrink-0 overflow-hidden shadow-sm border border-neutral-200">
                                                    {(item.product?.images && item.product.images.length > 0) ? (
                                                        <img src={item.product.images[0]} alt={item.product.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                    ) : (
                                                        <div className="h-full w-full flex items-center justify-center text-neutral-300">
                                                            <Package className="h-10 w-10" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-grow">
                                                    <h4 className="text-lg font-bold text-neutral-900 mb-1">{item.product?.name || 'Product'}</h4>
                                                    <p className="text-neutral-500 text-sm mb-4 line-clamp-1">{item.product?.description}</p>
                                                    <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-neutral-100 shadow-sm">
                                                        <span className="text-xs font-black uppercase tracking-widest text-neutral-500">Qty: {item.quantity}</span>
                                                        <span className="font-bold text-neutral-900">₹{Number(item.price_at_purchase || 0).toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Order Summary & Info */}
                            <div className="lg:col-span-5 space-y-8">
                                <div className="bg-neutral-50 p-8 rounded-[32px] border border-neutral-100">
                                    <h3 className="text-xl font-bold mb-6 text-neutral-900">Order Summary</h3>
                                    <div className="space-y-4 mb-8">
                                        <div className="flex justify-between text-neutral-600 font-medium">
                                            <span>Subtotal</span>
                                            <span className="text-neutral-900 font-bold">₹{Number(order.total_amount || 0).toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-neutral-600 font-medium">
                                            <span>Shipping</span>
                                            <span className="text-green-600 font-bold uppercase text-xs bg-green-50 px-2 py-1 rounded">Free</span>
                                        </div>
                                        <div className="pt-6 border-t border-dashed border-neutral-200 flex justify-between items-end">
                                            <span className="font-bold text-xl text-neutral-900">Total</span>
                                            <span className="font-black text-3xl text-neutral-900">₹{Number(order.total_amount || 0).toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => window.open(api.orders.getInvoiceUrl(order.id), '_blank')}
                                        className="w-full flex items-center justify-center gap-2 bg-white text-neutral-900 border-2 border-neutral-100 font-bold py-4 rounded-2xl hover:bg-neutral-50 hover:border-neutral-200 transition-all shadow-sm"
                                    >
                                        <FileText className="w-5 h-5" />
                                        Download Invoice
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex gap-5 p-6 bg-white rounded-[24px] border border-neutral-100 shadow-sm">
                                        <div className="w-12 h-12 bg-neutral-50 text-neutral-400 rounded-2xl flex items-center justify-center flex-shrink-0">
                                            <MapPin className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-xs uppercase tracking-widest text-neutral-400 mb-2">Shipping Address</h4>
                                            <div className="text-neutral-900 font-medium leading-relaxed">
                                                {renderAddress(order.shipping_address)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-5 p-6 bg-white rounded-[24px] border border-neutral-100 shadow-sm">
                                        <div className="w-12 h-12 bg-neutral-50 text-neutral-400 rounded-2xl flex items-center justify-center flex-shrink-0">
                                            <CreditCard className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-xs uppercase tracking-widest text-neutral-400 mb-2">Payment Details</h4>
                                            <p className="text-neutral-900 font-bold text-sm mb-1">{order.payment_method?.toUpperCase() || 'ONLINE'}</p>
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded ${order.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {order.payment_status || 'Pending'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderTracking;
