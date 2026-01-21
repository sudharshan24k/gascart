import { useState, useEffect } from 'react';
import { Eye, Search, X, Package, FileText, Download } from 'lucide-react';
import { fetchOrders, updateOrderStatus, getOrderInvoiceUrl, updateTracking, getExportOrdersUrl } from '../services/admin.service';
import { formatDateIST } from '../utils/dateUtils';


const AdminOrders = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [trackingForm, setTrackingForm] = useState({ carrier: '', tracking_number: '' });

    useEffect(() => {
        if (selectedOrder) {
            setTrackingForm({
                carrier: selectedOrder.carrier || '',
                tracking_number: selectedOrder.tracking_number || ''
            });
        }
    }, [selectedOrder]);

    useEffect(() => {
        loadOrders();
    }, [statusFilter]);

    const loadOrders = async () => {
        setLoading(true);
        try {
            const data = await fetchOrders(statusFilter !== 'All' ? { status: statusFilter } : undefined);
            setOrders(data);
        } catch (err) {
            console.error('Failed to load orders', err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        try {
            await updateOrderStatus(id, newStatus);
            if (selectedOrder && selectedOrder.id === id) {
                setSelectedOrder({ ...selectedOrder, status: newStatus });
            }
            loadOrders();
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const handleTrackingUpdate = async () => {
        if (!selectedOrder) return;
        try {
            const updated = await updateTracking(selectedOrder.id, trackingForm.carrier, trackingForm.tracking_number);
            setSelectedOrder(updated);
            loadOrders();
            alert('Tracking updated and status set to Shipped');
        } catch (err) {
            alert('Failed to update tracking');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'delivered': return 'bg-green-100 text-green-700';
            case 'shipped': return 'bg-purple-100 text-purple-700';
            case 'processing': return 'bg-blue-100 text-blue-700';
            case 'pending': return 'bg-yellow-100 text-yellow-700';
            case 'cancelled': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const filteredOrders = orders.filter(order =>
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 leading-tight">Order Management</h2>
                    <p className="text-gray-500 mt-1 font-medium font-sans">Track and fulfill direct purchase orders</p>
                </div>
                <a
                    href={getExportOrdersUrl()}
                    target="_blank"
                    className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all flex items-center gap-2 shadow-lg hover:shadow-xl active:scale-95"
                >
                    <Download className="w-5 h-5" /> Export Orders
                </a>
            </div>

            <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden flex flex-col min-h-[600px]">
                {/* Filters */}
                <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row gap-6 bg-gray-50/30">
                    <div className="flex-grow relative">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search orders..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-16 pr-6 py-5 bg-white border-none rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 shadow-inner transition-all font-bold"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-8 py-5 bg-white rounded-2xl border-none outline-none font-black text-gray-700 shadow-inner flex items-center gap-2"
                    >
                        <option value="All">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-white border-b border-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">
                            <tr>
                                <th className="py-6 px-10">Order Info</th>
                                <th className="py-6 px-10">Customer</th>
                                <th className="py-6 px-10">Financials</th>
                                <th className="py-6 px-10">Fulfillment</th>
                                <th className="py-6 px-10 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                [1, 2, 3].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="py-12 px-10"><div className="h-6 bg-gray-100 rounded-xl w-full"></div></td>
                                    </tr>
                                ))
                            ) : filteredOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="py-8 px-10">
                                        <div className="font-bold text-gray-900 text-sm font-mono mb-1">#{order.id.slice(0, 8)}...</div>
                                        <div className="text-xs text-gray-400 font-bold">{formatDateIST(order.created_at)}</div>
                                    </td>
                                    <td className="py-8 px-10">
                                        <div className="font-bold text-gray-900">{order.profiles?.full_name || 'Guest'}</div>
                                        <div className="text-xs text-gray-400 font-medium">{order.profiles?.email}</div>
                                    </td>
                                    <td className="py-8 px-10">
                                        <div className="font-black text-lg text-gray-900">₹{order.total_amount}</div>
                                        <div className={`text-[10px] font-black uppercase tracking-widest ${order.payment_status === 'paid' ? 'text-green-500' : 'text-amber-500'}`}>
                                            {order.payment_status}
                                        </div>
                                    </td>
                                    <td className="py-8 px-10">
                                        <div className="flex items-center gap-3">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.1em] ${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-8 px-10 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <a
                                                href={getOrderInvoiceUrl(order.id)}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-gray-400 hover:text-primary transition-colors p-2 hover:bg-white rounded-xl"
                                                title="View Invoice"
                                            >
                                                <FileText className="w-5 h-5" />
                                            </a>
                                            <button
                                                onClick={() => setSelectedOrder(order)}
                                                className="text-gray-400 hover:text-primary transition-colors p-2 hover:bg-white rounded-xl"
                                                title="View Details"
                                            >
                                                <Eye className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {!loading && filteredOrders.length === 0 && (
                        <div className="py-32 text-center text-gray-400">
                            <p className="font-black text-xl uppercase tracking-widest opacity-20">No orders found</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Order Details Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-[40px] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
                        <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h3 className="text-2xl font-black text-gray-900">Order Details</h3>
                                <p className="text-sm font-mono text-gray-400 mt-1">#{selectedOrder.id}</p>
                            </div>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="p-3 hover:bg-white rounded-full transition-colors text-gray-400 hover:text-gray-900"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex-grow overflow-y-auto p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
                                <div>
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-4">Customer Info</h4>
                                    <div className="space-y-4">
                                        <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                                            <p className="font-bold text-gray-900 text-lg">{selectedOrder.profiles?.full_name || 'Guest'}</p>
                                            <p className="text-gray-500 font-medium">{selectedOrder.profiles?.email}</p>
                                            <p className="mt-4 text-sm text-gray-400 font-medium leading-relaxed">
                                                {selectedOrder.shipping_address}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-4">Fulfillment Status</h4>
                                    <div className="space-y-4">
                                        <div className="flex flex-wrap gap-2">
                                            {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                                                <button
                                                    key={status}
                                                    onClick={() => handleStatusUpdate(selectedOrder.id, status)}
                                                    className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedOrder.status === status
                                                        ? getStatusColor(status) + ' ring-2 ring-current ring-offset-2'
                                                        : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                                                        }`}
                                                >
                                                    {status}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10 flex items-center justify-between mt-4">
                                            <div>
                                                <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Total Amount</p>
                                                <p className="text-3xl font-black text-gray-900">₹{selectedOrder.total_amount}</p>
                                            </div>
                                            <a
                                                href={getOrderInvoiceUrl(selectedOrder.id)}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="flex items-center gap-2 px-6 py-4 bg-white text-primary rounded-2xl font-bold shadow-sm hover:shadow-md transition-all text-sm"
                                            >
                                                <Download className="w-4 h-4" /> Invoice
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-4">Set Tracking (Optional)</h4>
                                <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 space-y-4">
                                    <div>
                                        <label className="block text-[8px] font-black uppercase text-gray-400 mb-1">Carrier</label>
                                        <input
                                            type="text"
                                            value={trackingForm.carrier}
                                            onChange={(e) => setTrackingForm({ ...trackingForm, carrier: e.target.value })}
                                            placeholder="e.g. FedEx, BlueDart"
                                            className="w-full bg-white border-none rounded-xl p-3 text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-primary/20"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[8px] font-black uppercase text-gray-400 mb-1">Tracking Number</label>
                                        <input
                                            type="text"
                                            value={trackingForm.tracking_number}
                                            onChange={(e) => setTrackingForm({ ...trackingForm, tracking_number: e.target.value })}
                                            placeholder="Enter tracking ID"
                                            className="w-full bg-white border-none rounded-xl p-3 text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-primary/20"
                                        />
                                    </div>
                                    <button
                                        onClick={handleTrackingUpdate}
                                        disabled={!trackingForm.carrier || !trackingForm.tracking_number}
                                        className="w-full py-3 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all disabled:opacity-50"
                                    >
                                        Update Tracking
                                    </button>
                                </div>
                            </div>
                        </div>

                        <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-6">Order Items</h4>
                        <div className="space-y-4">
                            {selectedOrder.order_items?.map((item: any) => (
                                <div key={item.id} className="flex items-center gap-6 p-6 bg-gray-50 rounded-3xl border border-gray-100">
                                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-primary border border-gray-100 flex-shrink-0 shadow-sm">
                                        <Package className="w-8 h-8" />
                                    </div>
                                    <div className="flex-grow">
                                        <p className="font-bold text-gray-900">{item.product?.name || 'Loading Product...'}</p>
                                        <p className="text-xs text-gray-400 font-bold">Quantity: {item.quantity}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-gray-900 text-lg">₹{item.price_at_purchase * item.quantity}</p>
                                        <p className="text-[10px] text-gray-400 font-black tracking-widest">₹{item.price_at_purchase}/unit</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminOrders;

