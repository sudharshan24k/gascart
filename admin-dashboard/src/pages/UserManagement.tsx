import React, { useEffect, useState } from 'react';
import { supabase } from '../services/api';
import { Search, ShoppingBag, ChevronRight, FileText, X } from 'lucide-react';
import { formatDateIST } from '../utils/dateUtils';
import {
    fetchAllUsers,
    fetchUserOrders as fetchOrdersForUser,
    updateUser as updateUserInfo,
    exportUsersCSV as exportUsers,
    getOrderInvoiceUrl
} from '../services/admin.service';

interface User {
    id: string;
    email: string;
    full_name: string;
    role: string;
    created_at: string;
    account_status: string;
}

interface Order {
    id: string;
    total_amount: number;
    status: string;
    payment_status: string;
    created_at: string;
    order_items: any[];
}

const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [userOrders, setUserOrders] = useState<Order[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const data = await fetchAllUsers();
            setUsers(data);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleUserSelection = (userId: string) => {
        const newSelection = new Set(selectedUserIds);
        if (newSelection.has(userId)) {
            newSelection.delete(userId);
        } else {
            newSelection.add(userId);
        }
        setSelectedUserIds(newSelection);
    };

    const toggleAllSelection = () => {
        if (selectedUserIds.size === filteredUsers.length) {
            setSelectedUserIds(new Set());
        } else {
            setSelectedUserIds(new Set(filteredUsers.map(u => u.id)));
        }
    };

    const handleBulkExportCSV = async () => {
        try {
            const blob = await exportUsers(Array.from(selectedUserIds));
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `users-export-${new Date().getTime()}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Bulk export failed:', error);
            alert('Failed to export users');
        }
    };

    const loadUserOrders = async (userId: string) => {
        setLoadingOrders(true);
        try {
            const data = await fetchOrdersForUser(userId);
            setUserOrders(data);
        } catch (error) {
            console.error('Failed to fetch user orders:', error);
        } finally {
            setLoadingOrders(false);
        }
    };

    const handleUserClick = (user: User) => {
        setSelectedUser(user);
        loadUserOrders(user.id);
    };

    const handleDownloadInvoice = async (orderId: string) => {
        try {
            const url = getOrderInvoiceUrl(orderId);
            // Since we need auth for this, and it's a GET that returns a PDF, 
            // the simple URL won't have the Bearer token. 
            // If the backend allows it, we could pass token as query param, but better to fetch with axios.
            // Let's use fetch with auth just like before but simplified.
            const { data: { session } } = await supabase.auth.getSession();
            const token = localStorage.getItem('admin_logged_in') === 'true' ? 'development-token' : session?.access_token;

            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to download');

            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = `invoice-${orderId.slice(-8)}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(blobUrl);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Invoice download failed:', error);
            alert('Failed to download invoice');
        }
    };

    const handleUpdateUser = async (userId: string, updates: { role?: string, account_status?: string }) => {
        try {
            await updateUserInfo(userId, updates);
            setUsers(prevUsers => prevUsers.map(u => u.id === userId ? { ...u, ...updates } : u));
            if (selectedUser?.id === userId) {
                setSelectedUser(prev => prev ? { ...prev, ...updates } : null);
            }
        } catch (error) {
            console.error('Failed to update user:', error);
            alert('Failed to update user. Please try again.');
        }
    };

    const filteredUsers = users.filter(user =>
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">Loading Users...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                    <p className="text-gray-500 text-sm">Manage and view user order history</p>
                </div>
                <div className="flex items-center gap-3">
                    {selectedUserIds.size > 0 && (
                        <button
                            onClick={handleBulkExportCSV}
                            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-md"
                        >
                            <FileText className="h-4 w-4" />
                            Export CSV ({selectedUserIds.size})
                        </button>
                    )}
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 w-10">
                                    <input
                                        type="checkbox"
                                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                        checked={selectedUserIds.size === filteredUsers.length && filteredUsers.length > 0}
                                        onChange={toggleAllSelection}
                                    />
                                </th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Joined At</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredUsers.map((user) => (
                                <tr
                                    key={user.id}
                                    onClick={() => handleUserClick(user)}
                                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                                >
                                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                        <input
                                            type="checkbox"
                                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                            checked={selectedUserIds.has(user.id)}
                                            onChange={() => toggleUserSelection(user.id)}
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold">
                                                {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">{user.full_name || 'No Name'}</p>
                                                <p className="text-sm text-gray-500">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase w-fit ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                                user.role === 'vendor' ? 'bg-orange-100 text-orange-700' :
                                                    'bg-blue-100 text-blue-700'
                                                }`}>
                                                {user.role}
                                            </span>
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase w-fit ${user.account_status === 'banned' ? 'bg-red-100 text-red-700' :
                                                user.account_status === 'deactivated' ? 'bg-gray-100 text-gray-700' :
                                                    'bg-green-100 text-green-700'
                                                }`}>
                                                {user.account_status || 'active'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {formatDateIST(user.created_at)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleUserClick(user);
                                            }}
                                            className="text-primary-600 hover:text-primary-700 font-bold text-sm flex items-center gap-1"
                                        >
                                            View History <ChevronRight className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Order History Slide-over/Modal */}
            {selectedUser && (
                <div className="fixed inset-0 z-50 overflow-hidden">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedUser(null)} />
                    <div className="absolute inset-y-0 right-0 max-w-2xl w-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Order History</h2>
                                <p className="text-sm text-gray-500">{selectedUser.full_name} ({selectedUser.email})</p>
                            </div>
                            <button onClick={() => setSelectedUser(null)} className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                                <X className="h-6 w-6 text-gray-500" />
                            </button>
                        </div>

                        <div className="flex-grow overflow-y-auto p-6 space-y-8 custom-scrollbar">
                            {/* Account Controls */}
                            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Account Controls</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">User Role</label>
                                        <select
                                            value={selectedUser.role}
                                            onChange={(e) => handleUpdateUser(selectedUser.id, { role: e.target.value })}
                                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm font-bold focus:ring-2 focus:ring-primary-500 outline-none"
                                        >
                                            <option value="customer">Customer</option>
                                            <option value="vendor">Vendor</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Account Status</label>
                                        <select
                                            value={selectedUser.account_status || 'active'}
                                            onChange={(e) => handleUpdateUser(selectedUser.id, { account_status: e.target.value })}
                                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm font-bold focus:ring-2 focus:ring-primary-500 outline-none"
                                        >
                                            <option value="active">Active</option>
                                            <option value="deactivated">Deactivated</option>
                                            <option value="banned">Banned</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Order History</h3>
                                {loadingOrders ? (
                                    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                                        <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full mb-4"></div>
                                        <p>Loading order history...</p>
                                    </div>
                                ) : userOrders.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                                        <ShoppingBag className="h-12 w-12 mb-4 opacity-20" />
                                        <p>No orders found for this user.</p>
                                    </div>
                                ) : (
                                    userOrders.map((order) => (
                                        <div key={order.id} className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md transition-shadow">
                                            <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                                                <div>
                                                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Order Date</p>
                                                    <p className="font-bold text-gray-900">{formatDateIST(order.created_at)}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Status</p>
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${order.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="space-y-3 mb-6">
                                                {order.order_items.map((item: any) => (
                                                    <div key={item.id} className="flex justify-between text-sm">
                                                        <span className="text-gray-600">{item.product?.name} x {item.quantity}</span>
                                                        <span className="font-medium">₹{(item.price_at_purchase * item.quantity).toFixed(2)}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900">Total: ₹{order.total_amount.toFixed(2)}</p>
                                                    <p className="text-[10px] text-gray-400">ID: {order.id.slice(0, 8).toUpperCase()}</p>
                                                </div>
                                                <button
                                                    onClick={() => handleDownloadInvoice(order.id)}
                                                    className="flex items-center gap-2 bg-primary-50 text-primary-600 hover:bg-primary-100 px-4 py-2 rounded-xl text-sm font-bold transition-all"
                                                >
                                                    <FileText className="h-4 w-4" />
                                                    Invoice
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
