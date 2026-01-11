import { useState } from 'react';
import { Eye } from 'lucide-react';

const AdminOrders = () => {
    // Mock Data
    const [orders] = useState([
        { id: 'ORD-001', customer: 'John Doe', date: '2023-10-24', total: 129.99, status: 'Delivered', payment: 'Paid' },
        { id: 'ORD-002', customer: 'Jane Smith', date: '2023-10-25', total: 59.90, status: 'Processing', payment: 'Paid' },
        { id: 'ORD-003', customer: 'Bob Wilson', date: '2023-10-25', total: 249.00, status: 'Pending', payment: 'Unpaid' },
    ]);

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'delivered': return 'bg-green-100 text-green-700';
            case 'processing': return 'bg-blue-100 text-blue-700';
            case 'pending': return 'bg-yellow-100 text-yellow-700';
            case 'cancelled': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-8">Orders</h2>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm">
                        <tr>
                            <th className="py-4 px-6 font-medium">Order ID</th>
                            <th className="py-4 px-6 font-medium">Customer</th>
                            <th className="py-4 px-6 font-medium">Date</th>
                            <th className="py-4 px-6 font-medium">Total</th>
                            <th className="py-4 px-6 font-medium">Payment</th>
                            <th className="py-4 px-6 font-medium">Status</th>
                            <th className="py-4 px-6 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {orders.map((order) => (
                            <tr key={order.id}>
                                <td className="py-4 px-6 font-medium">{order.id}</td>
                                <td className="py-4 px-6">{order.customer}</td>
                                <td className="py-4 px-6 text-gray-500">{order.date}</td>
                                <td className="py-4 px-6 font-medium">${order.total.toFixed(2)}</td>
                                <td className="py-4 px-6">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.payment === 'Paid' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                        {order.payment}
                                    </span>
                                </td>
                                <td className="py-4 px-6">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="py-4 px-6">
                                    <button className="text-gray-400 hover:text-primary-600">
                                        <Eye className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminOrders;
