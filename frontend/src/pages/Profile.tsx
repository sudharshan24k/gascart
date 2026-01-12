import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { User, Package, FileText, Smartphone, Mail, LogOut, Loader2, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Profile: React.FC = () => {
    const { session, signOut } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'rfqs'>('overview');
    const [loading, setLoading] = useState(true);

    // Data State
    const [profile, setProfile] = useState<any>(null);
    const [orders, setOrders] = useState<any[]>([]);
    const [rfqs, setRfqs] = useState<any[]>([]);

    // Form State
    const [formData, setFormData] = useState({
        full_name: '',
        phone: ''
    });
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        if (!session) {
            navigate('/login');
            return;
        }
        fetchData();
    }, [session, navigate]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Parallel Fetch
            const [profileRes, ordersRes, rfqsRes] = await Promise.all([
                api.users.getProfile(),
                api.orders.list(),
                api.rfqs.my(session?.access_token || '')
            ]);

            if (profileRes.status === 'success') {
                setProfile(profileRes.data);
                setFormData({
                    full_name: profileRes.data.full_name || '',
                    phone: profileRes.data.phone || ''
                });
            }
            if (ordersRes.status === 'success') setOrders(ordersRes.data);
            if (rfqsRes.status === 'success') setRfqs(rfqsRes.data);

        } catch (err) {
            console.error('Failed to load profile data', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setUpdating(true);
        try {
            const res = await api.users.updateProfile(formData);
            if (res.status === 'success') {
                alert('Profile updated successfully');
                setProfile(res.data);
            }
        } catch (err) {
            console.error('Update failed', err);
            alert('Failed to update profile');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-32 flex justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-32 pb-24 bg-gray-50">
            <div className="container mx-auto px-4 max-w-6xl">
                <h1 className="text-3xl font-bold text-gray-900 mb-8 font-display">My Account</h1>

                <div className="grid lg:grid-cols-4 gap-8">
                    {/* Sidebar Navigation */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sticky top-32">
                            <div className="flex items-center gap-4 p-4 mb-4 bg-gray-50 rounded-xl">
                                <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-xl">
                                    {profile?.email?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <div className="overflow-hidden">
                                    <p className="font-bold text-gray-900 truncate">{profile?.full_name || 'User'}</p>
                                    <p className="text-xs text-gray-500 truncate">{profile?.email}</p>
                                </div>
                            </div>

                            <nav className="space-y-2">
                                <button
                                    onClick={() => setActiveTab('overview')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium ${activeTab === 'overview' ? 'bg-primary text-white shadow-lg shadow-primary/25' : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                    <User className="w-5 h-5" /> Overview
                                </button>
                                <button
                                    onClick={() => setActiveTab('orders')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium ${activeTab === 'orders' ? 'bg-primary text-white shadow-lg shadow-primary/25' : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                    <Package className="w-5 h-5" /> Orders <span className="ml-auto bg-white/20 px-2 rounded-md text-xs">{orders.length}</span>
                                </button>
                                <button
                                    onClick={() => setActiveTab('rfqs')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium ${activeTab === 'rfqs' ? 'bg-primary text-white shadow-lg shadow-primary/25' : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                    <FileText className="w-5 h-5" /> RFQs <span className="ml-auto bg-white/20 px-2 rounded-md text-xs">{rfqs.length}</span>
                                </button>
                                <hr className="border-gray-100 my-2" />
                                <button
                                    onClick={signOut}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors font-medium"
                                >
                                    <LogOut className="w-5 h-5" /> Sign Out
                                </button>
                            </nav>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-3">
                        <AnimatePresence mode='wait'>
                            {activeTab === 'overview' && (
                                <motion.div
                                    key="overview"
                                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                    className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm"
                                >
                                    <h2 className="text-xl font-bold text-gray-900 mb-6">Profile Details</h2>
                                    <form onSubmit={handleUpdateProfile} className="max-w-xl space-y-6">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200 text-gray-500 cursor-not-allowed">
                                                <Mail className="w-5 h-5" />
                                                <span>{profile?.email}</span>
                                            </div>
                                            <p className="text-xs text-gray-400 mt-2 ml-1">Email cannot be changed.</p>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-900 mb-2">Full Name</label>
                                                <div className="relative">
                                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                    <input
                                                        type="text"
                                                        value={formData.full_name}
                                                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                                        className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
                                                        placeholder="Enter full name"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-900 mb-2">Phone Number</label>
                                                <div className="relative">
                                                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                    <input
                                                        type="tel"
                                                        value={formData.phone}
                                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                        className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
                                                        placeholder="+1 (555) 000-0000"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-4">
                                            <button
                                                type="submit"
                                                disabled={updating}
                                                className="flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-primary transition-all disabled:opacity-70"
                                            >
                                                {updating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                                Save Changes
                                            </button>
                                        </div>
                                    </form>
                                </motion.div>
                            )}

                            {activeTab === 'orders' && (
                                <motion.div
                                    key="orders"
                                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <h2 className="text-xl font-bold text-gray-900">Order History</h2>
                                    {orders.length === 0 ? (
                                        <div className="bg-white p-12 rounded-[32px] text-center border border-gray-100">
                                            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                            <h3 className="text-lg font-bold text-gray-900 mb-2">No orders yet</h3>
                                            <p className="text-gray-500">Your purchased items will appear here.</p>
                                        </div>
                                    ) : (
                                        orders.map((order: any) => (
                                            <div key={order.id} className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                                <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-gray-50 pb-4">
                                                    <div>
                                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Order ID</p>
                                                        <p className="font-mono text-sm font-bold text-gray-900">#{order.id.slice(0, 8)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Date</p>
                                                        <p className="text-sm font-bold text-gray-900">{new Date(order.created_at).toLocaleDateString()}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total</p>
                                                        <p className="text-sm font-bold text-gray-900">${order.total_amount?.toLocaleString()}</p>
                                                    </div>
                                                    <div>
                                                        <span className={`px-4 py-2 rounded-full text-xs font-bold capitalize ${order.status === 'delivered' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                                                            {order.status}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="space-y-3">
                                                    {order.order_items?.map((item: any) => (
                                                        <div key={item.id} className="flex items-center gap-4">
                                                            <div className="w-12 h-12 bg-gray-50 rounded-lg overflow-hidden">
                                                                <img src={item.product?.image_url || 'https://via.placeholder.com/50'} className="w-full h-full object-cover" alt="" />
                                                            </div>
                                                            <div className="flex-grow">
                                                                <p className="text-sm font-bold text-gray-900 line-clamp-1">{item.product?.name}</p>
                                                                <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                                            </div>
                                                            <p className="text-sm font-bold text-gray-900">${item.price_at_purchase?.toLocaleString()}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </motion.div>
                            )}

                            {activeTab === 'rfqs' && (
                                <motion.div
                                    key="rfqs"
                                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <h2 className="text-xl font-bold text-gray-900">RFQ History</h2>
                                    {rfqs.length === 0 ? (
                                        <div className="bg-white p-12 rounded-[32px] text-center border border-gray-100">
                                            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                            <h3 className="text-lg font-bold text-gray-900 mb-2">No RFQs submitted</h3>
                                            <p className="text-gray-500">Submit technical requests for quotes to see them here.</p>
                                        </div>
                                    ) : (
                                        rfqs.map((rfq: any) => (
                                            <div key={rfq.id} className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                                <div className="flex flex-wrap items-center justify-between gap-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center">
                                                            <FileText className="w-6 h-6" />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-bold text-gray-900">{rfq.products?.name || 'Custom Request'}</h3>
                                                            <p className="text-xs text-gray-500 font-mono">ID: {rfq.id.slice(0, 8)}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className={`block px-4 py-2 rounded-full text-xs font-bold capitalize mb-1 inline-block ${rfq.status === 'quoted' ? 'bg-green-100 text-green-600' :
                                                                rfq.status === 'new' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                                                            }`}>
                                                            {rfq.status}
                                                        </span>
                                                        <p className="text-xs text-gray-400 font-bold">{new Date(rfq.created_at).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                {/* Specs Preview could go here */}
                                            </div>
                                        ))
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
