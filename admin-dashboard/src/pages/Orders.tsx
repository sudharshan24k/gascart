import { useState, useEffect } from 'react';
import { Eye, Search, X, Package, FileText, Download, Users, ShoppingCart } from 'lucide-react';
import { fetchOrders, updateOrderStatus, getOrderInvoiceUrl, updateTracking, downloadOrders, exportInvoicesZIP } from '../services/admin.service';
import { formatDateIST } from '../utils/dateUtils';
import { supabase } from '../services/api';


const AdminOrders = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [trackingForm, setTrackingForm] = useState({ carrier: '', tracking_number: '' });

    // Stats
    const stats = {
        totalRevenue: orders.reduce((sum, o) => sum + (o.total_amount || 0), 0),
        pendingCount: orders.filter(o => o.status === 'pending').length,
        processingCount: orders.filter(o => o.status === 'processing').length,
        totalOrders: orders.length
    };

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
    const handleExport = async () => {
        try {
            const data = await downloadOrders();
            const url = window.URL.createObjectURL(new Blob([data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `gascart_orders_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error('Export failed', err);
            alert('Export failed');
        }
    };


    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'delivered': return 'bg-green-100 text-green-700 border-green-200';
            case 'shipped': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'processing': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
            case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getInitials = (name: string) => {
        return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '??';
    };

    const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set());

    const toggleOrderSelection = (orderId: string) => {
        const newSelection = new Set(selectedOrderIds);
        if (newSelection.has(orderId)) {
            newSelection.delete(orderId);
        } else {
            newSelection.add(orderId);
        }
        setSelectedOrderIds(newSelection);
    };

    const toggleAllSelection = () => {
        if (selectedOrderIds.size === filteredOrders.length) {
            setSelectedOrderIds(new Set());
        } else {
            setSelectedOrderIds(new Set(filteredOrders.map(o => o.id)));
        }
    };

    const handleBulkInvoiceZIP = async () => {
        try {
            const data = await exportInvoicesZIP(Array.from(selectedOrderIds));
            const url = window.URL.createObjectURL(new Blob([data]));
            const a = document.createElement('a');
            a.href = url;
            a.download = `invoices-bulk-${new Date().getTime()}.zip`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Bulk ZIP export failed:', error);
            alert('Failed to export invoices');
        }
    };

    const filteredOrders = orders.filter(order =>
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                <div>
                    <h2 className="text-4xl font-black text-gray-900 tracking-tight">Order Management</h2>
                    <p className="text-gray-500 mt-1 font-bold italic">Process direct purchases and monitor fulfillment cycles.</p>
                </div>
                <div className="flex gap-4">
                    {selectedOrderIds.size > 0 && (
                        <button
                            onClick={handleBulkInvoiceZIP}
                            className="px-8 py-4 bg-primary text-white shadow-xl shadow-primary/20 rounded-2xl font-black hover:bg-primary-dark transition-all flex items-center gap-2 active:scale-95"
                        >
                            <FileText className="w-5 h-5" /> Export Invoices ZIP ({selectedOrderIds.size})
                        </button>
                    )}
                    <button
                        onClick={handleExport}
                        className="px-8 py-4 bg-white text-gray-900 border-2 border-gray-100 shadow-xl shadow-gray-200/50 rounded-2xl font-black hover:border-primary transition-all flex items-center gap-2 active:scale-95"
                    >
                        <Download className="w-5 h-5 text-primary" /> Export Dataset
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                {[
                    { label: 'Gross Volume', value: `₹${stats.totalRevenue.toLocaleString()}`, color: 'bg-emerald-50 text-emerald-600' },
                    { label: 'Pending Queue', value: stats.pendingCount, color: 'bg-amber-50 text-amber-600' },
                    { label: 'Active Processing', value: stats.processingCount, color: 'bg-indigo-50 text-indigo-600' },
                    { label: 'Total Fulfillments', value: stats.totalOrders, color: 'bg-gray-50 text-gray-600' }
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 relative overflow-hidden group">
                        <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-10 ${stat.color.split(' ')[0]} transition-transform group-hover:scale-150 duration-500`} />
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">{stat.label}</p>
                        <p className={`text-3xl font-black ${stat.color.split(' ')[1]}`}>{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden flex flex-col min-h-[600px]">
                {/* Filters & Search */}
                <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row gap-6 bg-gray-50/30">
                    <div className="flex-grow relative">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by Order ID, Name or Email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-16 pr-6 py-5 bg-white border-none rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 shadow-inner transition-all font-bold"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-8 py-5 bg-white rounded-2xl border-none outline-none font-black text-gray-700 shadow-inner flex items-center gap-2 cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                        <option value="All">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>

                {/* Table */}
                <div className="overflow-x-auto flex-grow">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-white border-b border-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">
                            <tr>
                                <th className="py-6 px-10 w-10">
                                    <input
                                        type="checkbox"
                                        className="rounded border-gray-300 text-primary focus:ring-primary"
                                        checked={selectedOrderIds.size === filteredOrders.length && filteredOrders.length > 0}
                                        onChange={toggleAllSelection}
                                    />
                                </th>
                                <th className="py-6 px-10">Order Reference</th>
                                <th className="py-6 px-10">Customer Identity</th>
                                <th className="py-6 px-10 text-center">Protocol Status</th>
                                <th className="py-6 px-10">Financial Value</th>
                                <th className="py-6 px-10 text-right">Operations</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="py-12 px-10"><div className="h-4 bg-gray-100 rounded-full w-full"></div></td>
                                    </tr>
                                ))
                            ) : filteredOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50/50 transition-all group border-l-4 border-l-transparent hover:border-l-primary cursor-pointer">
                                    <td className="py-8 px-10" onClick={(e) => e.stopPropagation()}>
                                        <input
                                            type="checkbox"
                                            className="rounded border-gray-300 text-primary focus:ring-primary"
                                            checked={selectedOrderIds.has(order.id)}
                                            onChange={() => toggleOrderSelection(order.id)}
                                        />
                                    </td>
                                    <td className="py-8 px-10" onClick={() => setSelectedOrder(order)}>
                                        <div className="font-black text-gray-900 text-sm font-mono mb-1">#{order.id.slice(0, 8).toUpperCase()}</div>
                                        <div className="text-[10px] text-gray-400 font-black uppercase tracking-wider">{formatDateIST(order.created_at)}</div>
                                    </td>
                                    <td className="py-8 px-10">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black text-xs shadow-sm">
                                                {getInitials(order.profiles?.full_name)}
                                            </div>
                                            <div>
                                                <div className="font-black text-gray-900 text-sm">{order.profiles?.full_name || 'Guest User'}</div>
                                                <div className="text-[10px] text-gray-400 font-bold lowercase">{order.profiles?.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-8 px-10">
                                        <div className="flex justify-center flex-col items-center gap-2">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] border ${getStatusColor(order.status)} shadow-sm`}>
                                                {order.status}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-8 px-10">
                                        <div className="font-black text-lg text-gray-900 tracking-tight">₹{order.total_amount.toLocaleString()}</div>
                                        <div className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-1 ${order.payment_status === 'paid' ? 'text-emerald-500' : 'text-amber-500'}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${order.payment_status === 'paid' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                            {order.payment_status}
                                        </div>
                                    </td>
                                    <td className="py-8 px-10 text-right">
                                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <a
                                                href={getOrderInvoiceUrl(order.id)}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="w-10 h-10 flex items-center justify-center bg-white text-gray-400 hover:text-primary border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all"
                                                title="Download Invoice"
                                            >
                                                <FileText className="w-5 h-5" />
                                            </a>
                                            <button
                                                onClick={() => setSelectedOrder(order)}
                                                className="w-10 h-10 flex items-center justify-center bg-gray-900 text-white rounded-xl shadow-lg hover:bg-primary transition-all active:scale-95"
                                                title="View Full Details"
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
                        <div className="py-32 text-center text-gray-400 flex flex-col items-center">
                            <Package className="w-20 h-20 mb-6 opacity-5" />
                            <p className="font-black text-xl uppercase tracking-widest opacity-20">No matching orders found</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Order Details Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setSelectedOrder(null)}>
                    <div className="bg-white rounded-[48px] w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="p-10 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 rounded-[24px] bg-primary text-white flex items-center justify-center shadow-2xl shadow-primary/20">
                                    <ShoppingCart className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-3xl font-black text-gray-900 tracking-tight">Order #{(selectedOrder.id || '').slice(0, 8).toUpperCase()}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${getStatusColor(selectedOrder.status)}`}>
                                            {selectedOrder.status}
                                        </span>
                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">• {formatDateIST(selectedOrder.created_at)}</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="w-12 h-12 flex items-center justify-center bg-gray-100 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-2xl transition-all active:scale-90"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex-grow overflow-y-auto p-12">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                                {/* Left: Customer & Items */}
                                <div className="lg:col-span-2 space-y-10">
                                    <section>
                                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary mb-6 flex items-center gap-2">
                                            <Users className="w-4 h-4" /> Customer Dossier
                                        </h4>
                                        <div className="bg-gray-50 p-8 rounded-[32px] border border-gray-100 grid md:grid-cols-2 gap-8">
                                            <div>
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Account Holder</p>
                                                <p className="font-black text-gray-900 text-xl">{selectedOrder.profiles?.full_name || 'Guest User'}</p>
                                                <p className="text-gray-500 font-bold text-sm mt-1">{selectedOrder.profiles?.email}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Shipping Destination</p>
                                                <p className="text-gray-900 font-bold text-sm leading-relaxed">{selectedOrder.shipping_address}</p>
                                            </div>
                                        </div>
                                    </section>

                                    <section>
                                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary mb-6 flex items-center gap-2">
                                            <Package className="w-4 h-4" /> Manifest Details
                                        </h4>
                                        <div className="space-y-4">
                                            {selectedOrder.order_items?.map((item: any) => (
                                                <div key={item.id} className="flex items-center gap-6 p-6 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                                    <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center overflow-hidden border border-gray-100">
                                                        {item.product?.images?.[0] ? (
                                                            <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <Package className="w-10 h-10 text-gray-200" />
                                                        )}
                                                    </div>
                                                    <div className="flex-grow">
                                                        <p className="font-black text-gray-900 text-lg">{item.product?.name || 'Loading Asset...'}</p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-xs font-black text-primary bg-primary/5 px-2 py-0.5 rounded">QTY: {item.quantity}</span>
                                                            <span className="text-xs text-gray-400 font-bold italic">₹{item.price_at_purchase?.toLocaleString()}/unit</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-black text-gray-900 text-xl">₹{(item.price_at_purchase * item.quantity).toLocaleString()}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                </div>

                                {/* Right: Controls & Summary */}
                                <div className="space-y-8">
                                    <section className="bg-primary/5 p-8 rounded-[32px] border border-primary/10">
                                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary mb-6">Fulfillment Ops</h4>
                                        <div className="grid grid-cols-2 gap-3 mb-8">
                                            {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                                                <button
                                                    key={status}
                                                    onClick={() => handleStatusUpdate(selectedOrder.id, status)}
                                                    className={`px-4 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${selectedOrder.status === status
                                                        ? getStatusColor(status) + ' ring-2 ring-inset ring-current'
                                                        : 'bg-white text-gray-400 hover:bg-gray-100 border border-gray-100'
                                                        }`}
                                                >
                                                    {status}
                                                </button>
                                            ))}
                                        </div>

                                        <div className="space-y-4 pt-6 border-t border-primary/10">
                                            <div className="flex justify-between items-end">
                                                <p className="text-[10px] font-black text-primary uppercase tracking-widest">Gross Total</p>
                                                <p className="text-4xl font-black text-gray-900 tabular-nums">₹{selectedOrder.total_amount.toLocaleString()}</p>
                                            </div>
                                            <a
                                                href={getOrderInvoiceUrl(selectedOrder.id)}
                                                target="_blank"
                                                className="w-full flex items-center justify-center gap-3 px-8 py-5 bg-gray-900 text-white rounded-[24px] font-black shadow-xl shadow-gray-900/20 hover:bg-black transition-all active:scale-95 text-xs uppercase tracking-[0.1em]"
                                            >
                                                <Download className="w-5 h-5" /> Generate Invoice
                                            </a>
                                        </div>
                                    </section>

                                    <section className="bg-gray-50 p-8 rounded-[32px] border border-gray-100">
                                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 mb-6 flex items-center gap-2">
                                            <ShoppingCart className="w-4 h-4" /> Logistics Tracking
                                        </h4>
                                        <div className="space-y-5">
                                            <div>
                                                <label className="block text-[9px] font-black uppercase text-gray-400 mb-2 ml-1">Logistics Carrier</label>
                                                <input
                                                    type="text"
                                                    value={trackingForm.carrier}
                                                    onChange={(e) => setTrackingForm({ ...trackingForm, carrier: e.target.value })}
                                                    placeholder="DHL, FedEx, etc."
                                                    className="w-full bg-white border-none rounded-2xl px-5 py-4 text-sm font-bold shadow-inner outline-none focus:ring-4 focus:ring-primary/5 transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[9px] font-black uppercase text-gray-400 mb-2 ml-1">Tracking Serial</label>
                                                <input
                                                    type="text"
                                                    value={trackingForm.tracking_number}
                                                    onChange={(e) => setTrackingForm({ ...trackingForm, tracking_number: e.target.value })}
                                                    placeholder="AWB / Reference ID"
                                                    className="w-full bg-white border-none rounded-2xl px-5 py-4 text-sm font-bold shadow-inner outline-none focus:ring-4 focus:ring-primary/5 transition-all"
                                                />
                                            </div>
                                            <button
                                                onClick={handleTrackingUpdate}
                                                disabled={!trackingForm.carrier || !trackingForm.tracking_number}
                                                className="w-full py-4 bg-white text-gray-900 border-2 border-gray-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-primary transition-all disabled:opacity-30 disabled:hover:border-gray-200"
                                            >
                                                Update Protocol
                                            </button>
                                        </div>
                                    </section>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminOrders;

