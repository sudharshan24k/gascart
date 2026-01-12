import { useState, useEffect } from 'react';
import { Eye, Search } from 'lucide-react';
import { fetchOrders, updateOrderStatus } from '../services/admin.service';

const AdminOrders = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

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
            loadOrders();
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'delivered': return 'bg-green-100 text-green-700';
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
                                        <div className="text-xs text-gray-400 font-bold">{new Date(order.created_at).toLocaleDateString()}</div>
                                    </td>
                                    <td className="py-8 px-10">
                                        <div className="font-bold text-gray-900">{order.profiles?.full_name || 'Guest'}</div>
                                        <div className="text-xs text-gray-400 font-medium">{order.profiles?.email}</div>
                                    </td>
                                    <td className="py-8 px-10">
                                        <div className="font-black text-lg text-gray-900">${order.total_amount}</div>
                                        <div className={`text-[10px] font-black uppercase tracking-widest ${order.payment_status === 'paid' ? 'text-green-500' : 'text-amber-500'}`}>
                                            {order.payment_status}
                                        </div>
                                    </td>
                                    <td className="py-8 px-10">
                                        <div className="flex items-center gap-3">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.1em] ${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </span>
                                            {order.status === 'pending' && (
                                                <button
                                                    onClick={() => handleStatusUpdate(order.id, 'processing')}
                                                    className="text-[10px] font-bold text-primary hover:underline"
                                                >
                                                    Process
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-8 px-10 text-right">
                                        <button className="text-gray-400 hover:text-primary transition-colors p-2 hover:bg-white rounded-xl">
                                            <Eye className="w-5 h-5" />
                                        </button>
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
        </div>
    );
};

export default AdminOrders;

