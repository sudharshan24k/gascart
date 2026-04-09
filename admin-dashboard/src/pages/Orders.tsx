import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Eye, Search, X, Package, FileText, Download, Users, ShoppingCart } from 'lucide-react';
import { fetchOrders, updateOrderStatus, getOrderInvoiceUrl, updateTracking, downloadOrders, exportInvoicesZIP } from '../services/admin.service';
import { formatDateIST } from '../utils/dateUtils';


const AdminOrders = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [paymentFilter, setPaymentFilter] = useState('All');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [trackingForm, setTrackingForm] = useState({ carrier: '', tracking_number: '' });

    // Stats
    const stats = {
        totalRevenue: (orders || []).filter(o => o.payment_status === 'paid').reduce((sum, o) => sum + Number(o.total_amount || 0), 0),
        pendingCount: (orders || []).filter(o => o.status === 'pending').length,
        processingCount: (orders || []).filter(o => o.status === 'processing').length,
        totalOrders: (orders || []).filter(o => o.payment_status === 'paid').length
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
            await updateOrderStatus(id, { status: newStatus });
            if (selectedOrder && selectedOrder.id === id) {
                setSelectedOrder({ ...selectedOrder, status: newStatus });
            }
            loadOrders();
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const handlePaymentUpdate = async (paymentStatus: string, paidAmount?: number, balanceDue?: number) => {
        if (!selectedOrder) return;
        try {
            const updates: any = { payment_status: paymentStatus };
            if (paidAmount !== undefined) updates.paid_amount = paidAmount;
            if (balanceDue !== undefined) updates.balance_due = balanceDue;

            const updated = await updateOrderStatus(selectedOrder.id, updates);
            setSelectedOrder(updated);
            loadOrders();
            alert('Payment status updated');
        } catch (err) {
            alert('Failed to update payment');
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
        switch (status?.toLowerCase()) {
            case 'delivered': return 'bg-green-100 text-green-700 border-green-200';
            case 'sent':
            case 'shipped': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'processing': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
            case 'advanced': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'rejected':
            case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getButtonColor = (status: string, isActive: boolean) => {
        const base = "px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all border-2 flex-grow sm:flex-grow-0 text-center outline-none ";
        if (!isActive) return base + "bg-white text-gray-400 border-gray-100 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700 shadow-sm";
        
        switch (status?.toLowerCase()) {
            case 'delivered': return base + 'bg-green-500 text-white border-green-600 shadow-lg shadow-green-500/30 scale-105';
            case 'sent':
            case 'shipped': return base + 'bg-blue-500 text-white border-blue-600 shadow-lg shadow-blue-500/30 scale-105';
            case 'processing': return base + 'bg-indigo-500 text-white border-indigo-600 shadow-lg shadow-indigo-500/30 scale-105';
            case 'advanced': return base + 'bg-purple-500 text-white border-purple-600 shadow-lg shadow-purple-500/30 scale-105';
            case 'pending': return base + 'bg-amber-500 text-white border-amber-600 shadow-lg shadow-amber-500/30 scale-105';
            case 'rejected':
            case 'cancelled': return base + 'bg-red-500 text-white border-red-600 shadow-lg shadow-red-500/30 scale-105';
            default: return base + 'bg-gray-900 text-white border-gray-900 shadow-lg scale-105';
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

    const filteredOrders = (orders || []).filter(order => {
        const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
            
        const matchesPayment = paymentFilter === 'All' || order.payment_status === paymentFilter || (!order.payment_status && paymentFilter === 'pending');
        
        let matchesDate = true;
        if (startDate) {
            matchesDate = matchesDate && new Date(order.created_at) >= new Date(startDate);
        }
        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            matchesDate = matchesDate && new Date(order.created_at) <= end;
        }

        return matchesSearch && matchesPayment && matchesDate;
    });

    return (
        <div className="max-w-7xl mx-auto pb-20">
            <Helmet>
                <title>Fulfillment &amp; Order Management | Gascart Admin Protocol</title>
                <meta name="description" content="Mission control for Gascart fulfillment. Manage commercial order cycles for CBG and CNG assets, verify payments, track logistics, and oversee the e-commerce supply chain." />
                <link rel="canonical" href="https://admin.gascart.com/orders" />
            </Helmet>
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Order Management</h1>
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
                <div className="p-8 border-b border-gray-50 flex flex-col xl:flex-row gap-6 bg-gray-50/30 xl:items-center">
                    <div className="flex-grow min-w-[300px] relative">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by Order ID, Name or Email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-16 pr-6 py-5 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 shadow-inner transition-all font-bold"
                        />
                    </div>
                    
                    <div className="flex flex-wrap md:flex-nowrap items-center gap-4">
                        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-gray-200 shadow-inner">
                            <span className="text-[10px] font-black uppercase text-gray-400">From</span>
                            <input 
                                type="date" 
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="bg-transparent border-none outline-none font-bold text-sm text-gray-700 cursor-pointer"
                            />
                        </div>
                        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-gray-200 shadow-inner">
                            <span className="text-[10px] font-black uppercase text-gray-400">To</span>
                            <input 
                                type="date" 
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="bg-transparent border-none outline-none font-bold text-sm text-gray-700 cursor-pointer"
                            />
                        </div>

                        <select
                            value={paymentFilter}
                            onChange={(e) => setPaymentFilter(e.target.value)}
                            className="px-6 py-5 bg-white rounded-2xl border border-gray-200 outline-none font-black text-gray-700 shadow-inner flex items-center gap-2 cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                            <option value="All">All Payments</option>
                            <option value="paid">Paid</option>
                            <option value="pending">Pending</option>
                            <option value="failed">Failed</option>
                        </select>

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-6 py-5 bg-white rounded-2xl border border-gray-200 outline-none font-black text-primary shadow-inner flex items-center gap-2 cursor-pointer hover:bg-primary/5 transition-colors"
                        >
                            <option value="All">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="advanced">Advanced</option>
                            <option value="processing">Processing</option>
                            <option value="sent">Sent</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="rejected">Rejected</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
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
                                        <div className="font-black text-lg text-gray-900 tracking-tight">₹{Number(order.total_amount || 0).toLocaleString()}</div>
                                        {order.payment_status === 'paid' ? (
                                            <div className="text-[10px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                Fully Paid
                                            </div>
                                        ) : order.balance_due > 0 ? (
                                            <div className="text-[10px] uppercase tracking-wide mt-1">
                                                <span className="text-emerald-600 font-bold">Paid: ₹{order.paid_amount?.toLocaleString() || '0'}</span>
                                                <span className="mx-2 text-gray-300">|</span>
                                                <span className="text-red-500 font-black">Due: ₹{order.balance_due?.toLocaleString()}</span>
                                            </div>
                                        ) : (
                                            <div className="text-[10px] font-black uppercase tracking-widest text-amber-500 flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                                Payment Pending
                                            </div>
                                        )}
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

            {/* Administrative Documentation & Linking */}
            <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 bg-white rounded-[40px] p-10 border border-gray-100 shadow-sm">
                    <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                        <FileText className="w-6 h-6 text-primary" /> Administrative Guidelines
                    </h2>
                    <div className="prose prose-neutral max-w-none text-gray-600 font-medium leading-relaxed space-y-4 text-sm">
                        <p>
                            Welcome to the Gascart Order Management Protocol. This centralized interface is designed for the high-precision oversight of the platform's commercial fulfillment cycles. As an administrator, you are responsible for maintaining the integrity of the supply chain, from the initial "Pending" state through to successful "Delivered" transitions.
                        </p>
                        <p>
                            <strong>Fulfillment Integrity:</strong> When processing orders, ensure that the "Protocol Status" accurately reflects the physical state of the goods. Orders moved to "Processing" signify that the warehouse team has initiated picking and packing. Upon dispatch, the "Shipped" status must be accompanied by a valid Logistics Carrier and Tracking Serial. This ensures automated customer notification systems maintain real-time transparency.
                        </p>
                        <p>
                            <strong>Financial Verification:</strong> Gascart operates on a hybrid payment model including advance payments and balance due protocols. Always verify the "Financial Value" column before authorizing shipment. If an order shows a significant balance due, ensure offline payment verification has been cleared by the finance department. The "Mark Balance Paid" function should only be utilized after manual confirmation of bank transfers or physical payment receipts.
                        </p>
                        <p>
                            <strong>Administrative Oversight:</strong> Utilize the "Internal Admin Notes" feature in the order dossier to record manual coordination efforts, vendor delays, or special customer requests. These notes are critical for audit trails and ensure that multiple administrators can coordinate without redundancy or miscommunication. Remember that a well-documented order lifecycle reduces support overhead and improves institutional knowledge of recurring logistics patterns.
                        </p>
                    </div>
                </div>

                <div className="bg-gray-900 rounded-[40px] p-10 text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full -mr-32 -mt-32 blur-3xl" />
                    <h2 className="text-2xl font-black mb-8 relative z-10">Quick Navigation</h2>
                    <nav className="space-y-4 relative z-10">
                        {[
                            { label: 'Asset Management', path: '/products', icon: Package, desc: 'Update inventory and product data' },
                            { label: 'Vendor Oversight', path: '/vendors', icon: Users, desc: 'Manage registered supply partners' },
                            { label: 'RFQ Protocol', path: '/rfqs', icon: FileText, desc: 'Monitor request-for-quote cycles' },
                            { label: 'User Directory', path: '/users', icon: Users, desc: 'View customer and client profiles' }
                        ].map((link, idx) => (
                            <Link 
                                key={idx}
                                to={link.path}
                                className="group flex items-center gap-5 p-5 rounded-3xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all hover:scale-[1.02] active:scale-95"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                    <link.icon className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <p className="font-black text-sm">{link.label}</p>
                                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider">{link.desc}</p>
                                </div>
                            </Link>
                        ))}
                    </nav>
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
                                                <div className="text-gray-900 font-bold text-sm leading-relaxed">
                                                    {typeof selectedOrder.shipping_address === 'object' && selectedOrder.shipping_address !== null ? (
                                                        <>
                                                            {selectedOrder.shipping_address.full_name && <div>{selectedOrder.shipping_address.full_name}</div>}
                                                            <div>{selectedOrder.shipping_address.address_line1}</div>
                                                            {selectedOrder.shipping_address.address_line2 && <div>{selectedOrder.shipping_address.address_line2}</div>}
                                                            <div>{selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} {selectedOrder.shipping_address.zip_code}</div>
                                                            {selectedOrder.shipping_address.country && <div>{selectedOrder.shipping_address.country}</div>}
                                                            {selectedOrder.shipping_address.phone && <div className="mt-1 text-gray-500">Phone: {selectedOrder.shipping_address.phone}</div>}
                                                        </>
                                                    ) : (
                                                        <p>{String(selectedOrder.shipping_address || '')}</p>
                                                    )}
                                                </div>
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
                                                        <p className="font-black text-gray-900 text-xl">₹{(Number(item.price_at_purchase || 0) * Number(item.quantity || 1)).toLocaleString()}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                </div>

                                {/* Right: Controls & Summary */}
                                <div className="space-y-8">
                                    <section className="bg-primary/5 p-8 rounded-[32px] border border-primary/10">
                                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary mb-6">Fulfillment Ops (Order State)</h4>
                                        <div className="flex flex-wrap gap-3 mb-8">
                                            {['pending', 'advanced', 'processing', 'sent', 'shipped', 'delivered', 'rejected', 'cancelled'].map((status) => (
                                                <button
                                                    key={status}
                                                    onClick={() => handleStatusUpdate(selectedOrder.id, status)}
                                                    className={getButtonColor(status, selectedOrder.status === status)}
                                                >
                                                    {status}
                                                </button>
                                            ))}
                                        </div>

                                        <div className="space-y-4 pt-6 border-t border-primary/10">
                                            <div className="flex justify-between items-end">
                                                <p className="text-[10px] font-black text-primary uppercase tracking-widest">Gross Total</p>
                                                <p className="text-4xl font-black text-gray-900 tabular-nums">₹{Number(selectedOrder.total_amount || 0).toLocaleString()}</p>
                                            </div>

                                            {selectedOrder.balance_due > 0 && (
                                                <div className="bg-white/50 rounded-xl p-4 border border-white/50">
                                                    <div className="flex justify-between text-xs mb-2">
                                                        <span className="text-gray-500 font-bold">Advance Paid:</span>
                                                        <span className="font-black text-emerald-600">₹{selectedOrder.paid_amount?.toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex justify-between text-xs mb-4">
                                                        <span className="text-gray-500 font-bold">Balance Due:</span>
                                                        <span className="font-black text-red-500">₹{selectedOrder.balance_due?.toLocaleString()}</span>
                                                    </div>
                                                    <button
                                                        onClick={() => handlePaymentUpdate('paid', selectedOrder.total_amount, 0)}
                                                        className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20"
                                                    >
                                                        Mark Balance Paid (Offline)
                                                    </button>
                                                </div>
                                            )}
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
                                                className="w-full py-4 bg-white text-gray-900 border-2 border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-primary transition-all disabled:opacity-30 disabled:hover:border-gray-200"
                                            >
                                                Update Protocol
                                            </button>
                                        </div>
                                    </section>

                                    <section className="bg-amber-50/30 p-8 rounded-[32px] border border-amber-100">
                                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-amber-600 mb-6 flex items-center gap-2">
                                            <FileText className="w-4 h-4" /> Internal Admin Notes
                                        </h4>
                                        <textarea
                                            defaultValue={selectedOrder.internal_comments || ''}
                                            onBlur={async (e) => {
                                                const newVal = e.target.value;
                                                if (newVal !== (selectedOrder.internal_comments || '')) {
                                                    try {
                                                        await updateOrderStatus(selectedOrder.id, { internal_comments: newVal });
                                                        selectedOrder.internal_comments = newVal;
                                                    } catch (err) {
                                                        alert('Failed to save notes');
                                                    }
                                                }
                                            }}
                                            placeholder="Add internal notes about coordination, status updates, or follow-ups..."
                                            className="w-full px-5 py-4 bg-white border border-amber-100 rounded-2xl text-sm focus:ring-4 focus:ring-amber-500/5 focus:border-amber-200 outline-none transition-all min-h-[120px] resize-none placeholder:text-amber-200 font-medium text-gray-700 shadow-sm"
                                        />
                                        <p className="mt-3 text-[9px] text-amber-400 font-bold italic px-1">Changes are saved automatically when you click away.</p>
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

