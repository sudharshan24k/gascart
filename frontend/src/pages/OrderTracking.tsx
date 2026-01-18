import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Package, ChevronLeft, MapPin, CreditCard, Clock, CheckCircle, Truck, Info, FileText } from 'lucide-react';

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
        { key: 'pending', label: 'Order Placed', icon: <Clock className="h-5 w-5" /> },
        { key: 'processing', label: 'Processing', icon: <Info className="h-5 w-5" /> },
        { key: 'shipped', label: 'Shipped', icon: <Truck className="h-5 w-5" /> },
        { key: 'delivered', label: 'Delivered', icon: <CheckCircle className="h-5 w-5" /> },
    ];

    const currentStatus = order?.status.toLowerCase() || 'pending';
    const currentStepIndex = steps.findIndex(step => step.key === currentStatus);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-neutral-light py-12 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Order not found</h2>
                    <Link to="/my-orders" className="text-primary font-bold hover:underline">Return to My Orders</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-light py-12">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
                <Link to="/my-orders" className="inline-flex items-center text-gray-600 hover:text-primary mb-8 font-semibold transition-colors">
                    <ChevronLeft className="mr-2 h-5 w-5" /> Back to My Orders
                </Link>

                <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-neutral-dark/10">
                    {/* Header */}
                    <div className="bg-primary-dark p-8 md:p-12 text-white">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div>
                                <h1 className="text-3xl font-display font-bold mb-2">Order Tracking</h1>
                                <p className="text-primary-light opacity-90 font-mono">#{order.id.toUpperCase()}</p>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase mb-2 ${order.status === 'delivered' ? 'bg-green-500' : 'bg-primary'
                                    }`}>
                                    {order.status}
                                </span>
                                <p className="text-sm opacity-80">Placed on {new Date(order.created_at).toLocaleDateString()}</p>
                                {order.status === 'pending' && (
                                    <button
                                        onClick={handleCancelOrder}
                                        className="mt-4 text-xs font-bold text-red-300 hover:text-red-100 transition-colors uppercase tracking-widest border border-red-300/30 px-4 py-2 rounded-xl"
                                    >
                                        Cancel Order
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="mt-12 relative">
                            <div className="absolute top-1/2 left-0 w-full h-1 bg-white/20 -translate-y-1/2 hidden md:block"></div>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
                                {steps.map((step, index) => {
                                    const isCompleted = index <= currentStepIndex;
                                    const isCurrent = index === currentStepIndex;

                                    return (
                                        <div key={step.key} className="flex flex-row md:flex-col items-center gap-4 md:text-center">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg ${isCompleted ? 'bg-secondary text-white scale-110' : 'bg-white/10 text-white/50 border border-white/20'
                                                } ${isCurrent ? 'ring-4 ring-secondary/30' : ''}`}>
                                                {step.icon}
                                            </div>
                                            <div className="flex flex-col md:items-center">
                                                <span className={`text-sm font-bold ${isCompleted ? 'text-white' : 'text-white/40'}`}>
                                                    {step.label}
                                                </span>
                                                {isCurrent && <span className="text-[10px] uppercase tracking-widest text-secondary font-bold">In Progress</span>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="p-8 md:p-12">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                            {/* Left Column: Items */}
                            <div className="lg:col-span-2 space-y-8">
                                <div>
                                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                        <Package className="h-6 w-6 text-primary" /> Order Items
                                    </h3>
                                    <div className="space-y-4">
                                        {order.order_items.map((item: any) => (
                                            <div key={item.id} className="flex gap-6 p-6 bg-neutral-light rounded-[1.5rem] border border-neutral-dark/10 group hover:shadow-md transition-all">
                                                <div className="h-24 w-24 bg-white rounded-2xl flex-shrink-0 overflow-hidden shadow-sm border border-neutral-dark/10">
                                                    {item.product?.image ? (
                                                        <img src={item.product.image} alt={item.product.name} className="h-full w-full object-cover group-hover:scale-110 transition-transform" />
                                                    ) : (
                                                        <div className="h-full w-full flex items-center justify-center text-gray-300">
                                                            <Package className="h-10 w-10" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-grow">
                                                    <h4 className="text-lg font-bold text-gray-900 mb-1">{item.product?.name || 'Product'}</h4>
                                                    <p className="text-gray-500 text-sm mb-4 line-clamp-1">{item.product?.description}</p>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm font-semibold px-3 py-1 bg-white rounded-lg border border-neutral-dark/10">Qty: {item.quantity}</span>
                                                        <span className="font-bold text-primary">${item.price_at_purchase.toFixed(2)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Order Summary & Info */}
                            <div className="space-y-8">
                                <div className="bg-neutral-light p-8 rounded-[2rem] border border-neutral-dark/10">
                                    <h3 className="text-xl font-bold mb-6">Order Summary</h3>
                                    <div className="space-y-4 mb-6">
                                        <div className="flex justify-between text-gray-600">
                                            <span>Subtotal</span>
                                            <span>${order.total_amount.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-600">
                                            <span>Shipping</span>
                                            <span className="text-green-600 font-bold uppercase text-xs">Free</span>
                                        </div>
                                        <div className="pt-4 border-t border-neutral-dark/10 flex justify-between items-center">
                                            <span className="font-bold text-lg">Total</span>
                                            <span className="font-display font-bold text-2xl text-primary">${order.total_amount.toFixed(2)}</span>
                                        </div>
                                    </div>
                                    <a
                                        href={api.orders.getInvoiceUrl(order.id)}
                                        download
                                        className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white font-bold py-4 rounded-2xl hover:bg-black transition-all shadow-lg"
                                    >
                                        <FileText className="h-5 w-5" />
                                        Download Invoice
                                    </a>
                                </div>

                                <div className="space-y-6 px-4">
                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center flex-shrink-0">
                                            <MapPin className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm uppercase tracking-wider text-gray-500 mb-1">Shipping Address</h4>
                                            <p className="text-gray-900 text-sm leading-relaxed">{order.shipping_address}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 bg-secondary/10 text-secondary rounded-xl flex items-center justify-center flex-shrink-0">
                                            <CreditCard className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm uppercase tracking-wider text-gray-500 mb-1">Payment Method</h4>
                                            <p className="text-gray-900 text-sm">{order.payment_method?.toUpperCase() || 'Not Specified'}</p>
                                            <p className="text-xs text-green-600 font-bold mt-1 uppercase">{order.payment_status}</p>
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
