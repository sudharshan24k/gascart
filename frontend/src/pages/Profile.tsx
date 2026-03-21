import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { formatDateIST } from '../utils/dateUtils';
import {
    User, Package, FileText, Smartphone, Mail, LogOut, Loader2, Save, MapPin,
    Plus, Trash2, Home, Briefcase, Edit2, Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Profile: React.FC = () => {
    const { session, signOut } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'rfqs' | 'addresses'>('overview');
    const [loading, setLoading] = useState(true);

    // Data State
    const [profile, setProfile] = useState<any>(null);
    const [orders, setOrders] = useState<any[]>([]);
    const [rfqs, setRfqs] = useState<any[]>([]);
    const [addresses, setAddresses] = useState<any[]>([]);
    const [consultantProfile, setConsultantProfile] = useState<any>(null);

    // Form State
    const [formData, setFormData] = useState({
        full_name: '',
        phone: ''
    });
    const [updating, setUpdating] = useState(false);
    const [isAddingAddress, setIsAddingAddress] = useState(false);
    const [editingAddress, setEditingAddress] = useState<any>(null);
    const [addressFormData, setAddressFormData] = useState({
        type: 'shipping',
        label: '',
        full_name: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'India',
        phone: '',
        is_default: false
    });

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
            const [profileRes, ordersRes, rfqsRes, addressesRes] = await Promise.all([
                api.users.getProfile(),
                api.orders.list(),
                api.rfqs.my(session?.access_token || ''),
                api.users.addresses.list()
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
            if (addressesRes.status === 'success') setAddresses(addressesRes.data);

            try {
                const consultantRes = await api.consultants.getMyProfile();
                if (consultantRes.status === 'success') {
                    setConsultantProfile(consultantRes.data);
                }
            } catch (err) {
                console.log('Not a consultant or failed to check');
            }

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

    const handleSaveAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        setUpdating(true);
        try {
            if (editingAddress) {
                const res = await api.users.addresses.update(editingAddress.id, addressFormData);
                if (res.status === 'success') {
                    setAddresses(addresses.map(a => a.id === editingAddress.id ? res.data : res.data.is_default ? { ...a, is_default: false } : a));
                    setEditingAddress(null);
                    setIsAddingAddress(false);
                }
            } else {
                const res = await api.users.addresses.add(addressFormData);
                if (res.status === 'success') {
                    setAddresses([res.data, ...addresses.map(a => res.data.is_default ? { ...a, is_default: false } : a)]);
                    setIsAddingAddress(false);
                }
            }
        } catch (err) {
            console.error('Address save failed', err);
            alert('Failed to save address');
        } finally {
            setUpdating(false);
        }
    };

    const handleDeleteAddress = async (id: string) => {
        if (!confirm('Are you sure you want to delete this address?')) return;
        try {
            const res = await api.users.addresses.delete(id);
            if (res.status === 'success') {
                setAddresses(addresses.filter(a => a.id !== id));
            }
        } catch (err) {
            console.error('Delete failed', err);
            alert('Failed to delete address');
        }
    };

    const openAddAddress = () => {
        setEditingAddress(null);
        setAddressFormData({
            type: 'shipping',
            label: '',
            full_name: profile?.full_name || '',
            address_line1: '',
            address_line2: '',
            city: '',
            state: '',
            postal_code: '',
            country: 'India',
            phone: profile?.phone || '',
            is_default: addresses.length === 0
        });
        setIsAddingAddress(true);
    };

    const openEditAddress = (address: any) => {
        setEditingAddress(address);
        setAddressFormData({ ...address });
        setIsAddingAddress(true);
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-32 flex justify-center bg-neutral-50">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-28 pb-24 bg-neutral-50">
            <div className="container mx-auto px-4 max-w-7xl">
                <div className="flex items-end justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-display font-bold text-neutral-900 mb-2">My Account</h1>
                        <p className="text-neutral-500 font-medium">Manage your profile, orders, and preferences.</p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                    {/* Sidebar Navigation */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-[32px] shadow-sm border border-neutral-100 p-6 sticky top-32">
                            <div className="flex items-center gap-4 p-4 mb-6 bg-neutral-50 rounded-2xl border border-neutral-100">
                                <div className="w-12 h-12 bg-neutral-900 text-white rounded-xl flex items-center justify-center font-bold text-xl shadow-lg shadow-neutral-900/20">
                                    {profile?.email?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <div className="overflow-hidden">
                                    <p className="font-bold text-neutral-900 truncate">{profile?.full_name || 'User'}</p>
                                    <p className="text-xs text-neutral-500 truncate font-medium">{profile?.email}</p>
                                </div>
                            </div>

                            <nav className="space-y-2">
                                {[
                                    { id: 'overview', label: 'Overview', icon: User },
                                    { id: 'orders', label: 'Orders', icon: Package, count: orders.length },
                                    { id: 'rfqs', label: 'RFQs', icon: FileText, count: rfqs.length },
                                    { id: 'addresses', label: 'Addresses', icon: MapPin, count: addresses.length },
                                ].map((item: any) => (
                                    <button
                                        key={item.id}
                                        onClick={() => setActiveTab(item.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-bold text-sm group ${activeTab === item.id
                                            ? 'bg-neutral-900 text-white shadow-lg shadow-neutral-900/20'
                                            : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900'
                                            }`}
                                    >
                                        <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-primary' : 'text-neutral-400 group-hover:text-neutral-900'}`} />
                                        {item.label}
                                        {item.count !== undefined && (
                                            <span className={`ml-auto px-2 py-0.5 rounded-md text-[10px] font-black ${activeTab === item.id ? 'bg-white/20 text-white' : 'bg-neutral-100 text-neutral-600'
                                                }`}>
                                                {item.count}
                                            </span>
                                        )}
                                    </button>
                                ))}

                                {consultantProfile && (
                                    <Link
                                        to="/consultant-dashboard"
                                        className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-bold text-sm text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900 mt-2 border-t border-neutral-100"
                                    >
                                        <Briefcase className="w-5 h-5 text-primary" /> Consultant Dashboard
                                    </Link>
                                )}

                                <div className="pt-4 mt-2 border-t border-neutral-100">
                                    <button
                                        onClick={signOut}
                                        className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-red-500 hover:bg-red-50 transition-colors font-bold text-sm"
                                    >
                                        <LogOut className="w-5 h-5" /> Sign Out
                                    </button>
                                </div>
                            </nav>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-9">
                        <AnimatePresence mode='wait'>
                            {activeTab === 'overview' && (
                                <motion.div
                                    key="overview"
                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                    className="bg-white rounded-[40px] p-8 md:p-10 border border-neutral-100 shadow-sm"
                                >
                                    <h2 className="text-2xl font-bold text-neutral-900 mb-8 flex items-center gap-3">
                                        <Settings className="w-6 h-6 text-neutral-400" /> Profile Settings
                                    </h2>

                                    <form onSubmit={handleUpdateProfile} className="max-w-2xl space-y-8">
                                        <div className="bg-neutral-50 p-6 rounded-3xl border border-neutral-100">
                                            <label className="block text-xs font-black text-neutral-400 uppercase tracking-widest mb-3">Login Email</label>
                                            <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-neutral-200">
                                                <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center">
                                                    <Mail className="w-5 h-5 text-neutral-400" />
                                                </div>
                                                <span className="font-bold text-neutral-700">{profile?.email}</span>
                                                <span className="ml-auto text-[10px] bg-neutral-100 text-neutral-500 px-2 py-1 rounded font-bold uppercase tracking-wider">ReadOnly</span>
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-8">
                                            <div>
                                                <label className="block text-xs font-black text-neutral-400 uppercase tracking-widest mb-3">Display Name</label>
                                                <div className="relative">
                                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                                                    <input
                                                        type="text"
                                                        value={formData.full_name}
                                                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                                        className="w-full pl-12 pr-4 py-4 bg-neutral-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold text-neutral-900 placeholder:text-neutral-300"
                                                        placeholder="Enter full name"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-black text-neutral-400 uppercase tracking-widest mb-3">Mobile Number</label>
                                                <div className="relative">
                                                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                                                    <input
                                                        type="tel"
                                                        value={formData.phone}
                                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                        className="w-full pl-12 pr-4 py-4 bg-neutral-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold text-neutral-900 placeholder:text-neutral-300"
                                                        placeholder="+1 (555) 000-0000"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-4 flex justify-end">
                                            <button
                                                type="submit"
                                                disabled={updating}
                                                className="flex items-center gap-3 px-8 py-4 bg-neutral-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-xl shadow-neutral-900/20 disabled:opacity-70"
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
                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                    className="space-y-6"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <h2 className="text-2xl font-bold text-neutral-900">Order History</h2>
                                    </div>

                                    {orders.length === 0 ? (
                                        <div className="bg-white p-16 rounded-[40px] text-center border border-neutral-100 flex flex-col items-center">
                                            <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mb-6">
                                                <Package className="w-8 h-8 text-neutral-300" />
                                            </div>
                                            <h3 className="text-xl font-bold text-neutral-900 mb-2">No Previous Orders</h3>
                                            <p className="text-neutral-500 max-w-xs mx-auto mb-8">Once you place an order, you can track its status and download invoices here.</p>
                                            <Link to="/shop" className="px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-lg hover:bg-primary-dark transition-all">
                                                Browse Marketplace
                                            </Link>
                                        </div>
                                    ) : (
                                        orders.map((order: any) => (
                                            <div key={order.id} className="bg-white p-8 rounded-[32px] border border-neutral-100 shadow-sm hover:shadow-lg transition-all group">
                                                <div className="flex flex-wrap items-center justify-between gap-6 mb-8 border-b border-neutral-100 pb-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 bg-neutral-900 text-white rounded-xl flex items-center justify-center font-bold">
                                                            #{order.id.slice(0, 4)}
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-1">Order ID</p>
                                                            <p className="font-mono text-sm font-bold text-neutral-900">#{order.id.slice(0, 8)}</p>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-1">Date Placed</p>
                                                        <p className="font-bold text-neutral-900">{formatDateIST(order.created_at)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-1">Total Amount</p>
                                                        <p className="font-bold text-neutral-900 text-lg">₹{order.total_amount?.toLocaleString()}</p>
                                                    </div>
                                                    <div>
                                                        <span className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest ${order.status === 'delivered' ? 'bg-green-100 text-green-600' :
                                                            order.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                                                                'bg-yellow-100 text-yellow-700'
                                                            }`}>
                                                            {order.status}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="space-y-4 mb-8">
                                                    {order.order_items?.map((item: any) => (
                                                        <div key={item.id} className="flex items-center gap-4 p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                                                            <div className="w-16 h-16 bg-white rounded-xl overflow-hidden border border-neutral-200 flex-shrink-0">
                                                                <img src={(item.product?.images && item.product.images.length > 0) ? item.product.images[0] : 'https://placehold.co/150x150?text=No+Image'} className="w-full h-full object-cover" alt="" />
                                                            </div>
                                                            <div className="flex-grow">
                                                                <p className="font-bold text-neutral-900 mb-1">{item.product?.name}</p>
                                                                <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Qty: {item.quantity} × ₹{item.price_at_purchase?.toLocaleString()}</p>
                                                            </div>
                                                            <p className="font-bold text-neutral-900">₹{(item.quantity * item.price_at_purchase)?.toLocaleString()}</p>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="flex gap-4">
                                                    <Link
                                                        to={`/order-tracking/${order.id}`}
                                                        className="flex-grow text-center py-4 bg-neutral-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-lg shadow-neutral-900/20"
                                                    >
                                                        Track Order Status
                                                    </Link>
                                                    <a
                                                        href={api.orders.getInvoiceUrl(order.id)}
                                                        download
                                                        className="px-8 py-4 border-2 border-neutral-100 text-neutral-900 rounded-xl font-bold hover:border-neutral-300 hover:bg-neutral-50 transition-all flex items-center gap-2"
                                                    >
                                                        <FileText className="w-4 h-4" /> Invoice
                                                    </a>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </motion.div>
                            )}

                            {activeTab === 'rfqs' && (
                                <motion.div
                                    key="rfqs"
                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                    className="space-y-6"
                                >
                                    <h2 className="text-2xl font-bold text-neutral-900">RFQ Requests</h2>
                                    {rfqs.length === 0 ? (
                                        <div className="bg-white p-16 rounded-[40px] text-center border border-neutral-100 flex flex-col items-center">
                                            <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mb-6">
                                                <FileText className="w-8 h-8 text-neutral-300" />
                                            </div>
                                            <h3 className="text-xl font-bold text-neutral-900 mb-2">No Technical Requests</h3>
                                            <p className="text-neutral-500 max-w-xs mx-auto mb-8">Request technical quotes for customized equipment directly from product pages.</p>
                                            <Link to="/shop" className="px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-lg hover:bg-primary-dark transition-all">
                                                Explore Equipment
                                            </Link>
                                        </div>
                                    ) : (
                                        rfqs.map((rfq: any) => (
                                            <div key={rfq.id} className="bg-white p-6 rounded-[24px] border border-neutral-100 shadow-sm flex justify-between items-center group hover:bg-neutral-50 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center text-neutral-400">
                                                        <FileText className="w-8 h-8" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-neutral-900 text-lg mb-1">{rfq.products?.name || 'Custom Request'}</h4>
                                                        <div className="flex items-center gap-3">
                                                            <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">{formatDateIST(rfq.created_at)}</p>
                                                            <span className="w-1 h-1 bg-neutral-300 rounded-full"></span>
                                                            <p className="text-xs font-bold text-primary uppercase tracking-widest">
                                                                {rfq.vendor?.company_name || 'Any Vendor'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <span className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-bold text-xs uppercase tracking-widest">
                                                    {rfq.status || 'Under Review'}
                                                </span>
                                            </div>
                                        ))
                                    )}
                                </motion.div>
                            )}

                            {activeTab === 'addresses' && (
                                <motion.div
                                    key="addresses"
                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                    className="space-y-6"
                                >
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-2xl font-bold text-neutral-900">Saved Addresses</h2>
                                        <button
                                            onClick={openAddAddress}
                                            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 text-sm"
                                        >
                                            <Plus className="w-4 h-4" /> Add New Address
                                        </button>
                                    </div>

                                    {addresses.length === 0 ? (
                                        <div className="bg-white p-16 rounded-[40px] text-center border border-neutral-100 flex flex-col items-center">
                                            <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mb-6">
                                                <MapPin className="w-8 h-8 text-neutral-300" />
                                            </div>
                                            <h3 className="text-xl font-bold text-neutral-900 mb-2">No Saved Addresses</h3>
                                            <p className="text-neutral-500 max-w-xs mx-auto">Add shipping and billing addresses to speed up your checkout process.</p>
                                        </div>
                                    ) : (
                                        <div className="grid md:grid-cols-2 gap-6">
                                            {addresses.map((address) => (
                                                <div key={address.id} className={`bg-white p-8 rounded-[32px] border transition-all relative overflow-hidden group ${address.is_default ? 'border-primary shadow-lg shadow-primary/10' : 'border-neutral-100 shadow-sm hover:shadow-md'}`}>
                                                    {address.is_default && (
                                                        <div className="absolute top-0 right-0 bg-primary/10 text-primary px-4 py-2 rounded-bl-2xl text-[10px] font-black uppercase tracking-widest">
                                                            Default
                                                        </div>
                                                    )}

                                                    <div className="flex items-center gap-4 mb-6">
                                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${address.is_default ? 'bg-primary text-white' : 'bg-neutral-50 text-neutral-400'}`}>
                                                            {address.label?.toLowerCase() === 'work' ? <Briefcase className="w-6 h-6" /> : <Home className="w-6 h-6" />}
                                                        </div>
                                                        <div>
                                                            <h3 className="font-bold text-neutral-900 text-lg capitalize">{address.label || 'Home'}</h3>
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">{address.type}</p>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-1 text-sm text-neutral-600 font-medium mb-8">
                                                        <p className="font-bold text-neutral-900 text-lg mb-2">{address.full_name}</p>
                                                        <p>{address.address_line1}</p>
                                                        {address.address_line2 && <p>{address.address_line2}</p>}
                                                        <p>{address.city}, {address.state} {address.postal_code}</p>
                                                        <p>{address.country}</p>
                                                        <p className="pt-2 text-neutral-500 flex items-center gap-2 font-bold">
                                                            <Smartphone className="w-4 h-4 text-primary" /> {address.phone}
                                                        </p>
                                                    </div>

                                                    <div className="flex gap-3">
                                                        <button
                                                            onClick={() => openEditAddress(address)}
                                                            className="flex-1 py-3 bg-neutral-50 text-neutral-900 rounded-xl font-bold hover:bg-neutral-100 transition-colors flex items-center justify-center gap-2"
                                                        >
                                                            <Edit2 className="w-4 h-4" /> Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteAddress(address.id)}
                                                            className="px-4 py-3 bg-white border border-neutral-200 text-neutral-400 rounded-xl hover:border-red-200 hover:text-red-500 hover:bg-red-50 transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Add/Edit Address Modal */}
                        <AnimatePresence>
                            {isAddingAddress && (
                                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                                    <motion.div
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                        className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm"
                                        onClick={() => setIsAddingAddress(false)}
                                    />
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                        className="bg-white rounded-[40px] w-full max-w-xl max-h-[90vh] overflow-hidden shadow-2xl relative z-10 flex flex-col"
                                    >
                                        <div className="p-8 border-b border-neutral-50 flex justify-between items-center bg-white">
                                            <h3 className="text-2xl font-bold text-neutral-900">{editingAddress ? 'Edit Address' : 'Add New Address'}</h3>
                                            <button onClick={() => setIsAddingAddress(false)} className="w-10 h-10 hover:bg-neutral-50 rounded-full flex items-center justify-center text-neutral-400 transition-colors">
                                                <Plus className="w-6 h-6 rotate-45" />
                                            </button>
                                        </div>

                                        <form onSubmit={handleSaveAddress} className="flex-grow overflow-y-auto p-8 space-y-6 custom-scrollbar bg-neutral-50/50">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2">Label</label>
                                                    <input
                                                        type="text"
                                                        value={addressFormData.label}
                                                        onChange={(e) => setAddressFormData({ ...addressFormData, label: e.target.value })}
                                                        placeholder="Home, Work, etc."
                                                        className="w-full px-4 py-4 bg-white border border-neutral-100 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-bold"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2">Type</label>
                                                    <select
                                                        value={addressFormData.type}
                                                        onChange={(e) => setAddressFormData({ ...addressFormData, type: e.target.value })}
                                                        className="w-full px-4 py-4 bg-white border border-neutral-100 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-bold appearance-none"
                                                    >
                                                        <option value="shipping">Shipping</option>
                                                        <option value="billing">Billing</option>
                                                        <option value="both">Both</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2">Full Name</label>
                                                <input
                                                    type="text"
                                                    value={addressFormData.full_name}
                                                    onChange={(e) => setAddressFormData({ ...addressFormData, full_name: e.target.value })}
                                                    className="w-full px-4 py-4 bg-white border border-neutral-100 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-bold text-lg"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2">Address Line 1</label>
                                                <input
                                                    type="text"
                                                    value={addressFormData.address_line1}
                                                    onChange={(e) => setAddressFormData({ ...addressFormData, address_line1: e.target.value })}
                                                    className="w-full px-4 py-4 bg-white border border-neutral-100 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-bold"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2">Address Line 2 (Optional)</label>
                                                <input
                                                    type="text"
                                                    value={addressFormData.address_line2}
                                                    onChange={(e) => setAddressFormData({ ...addressFormData, address_line2: e.target.value })}
                                                    className="w-full px-4 py-4 bg-white border border-neutral-100 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-bold"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2">City</label>
                                                    <input
                                                        type="text"
                                                        value={addressFormData.city}
                                                        onChange={(e) => setAddressFormData({ ...addressFormData, city: e.target.value })}
                                                        className="w-full px-4 py-4 bg-white border border-neutral-100 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-bold"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2">State</label>
                                                    <input
                                                        type="text"
                                                        value={addressFormData.state}
                                                        onChange={(e) => setAddressFormData({ ...addressFormData, state: e.target.value })}
                                                        className="w-full px-4 py-4 bg-white border border-neutral-100 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-bold"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2">Postal Code</label>
                                                    <input
                                                        type="text"
                                                        value={addressFormData.postal_code}
                                                        onChange={(e) => setAddressFormData({ ...addressFormData, postal_code: e.target.value })}
                                                        className="w-full px-4 py-4 bg-white border border-neutral-100 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-bold"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2">Phone</label>
                                                    <input
                                                        type="tel"
                                                        value={addressFormData.phone}
                                                        onChange={(e) => setAddressFormData({ ...addressFormData, phone: e.target.value })}
                                                        className="w-full px-4 py-4 bg-white border border-neutral-100 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-bold"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 pt-2 bg-white p-4 rounded-xl border border-neutral-100">
                                                <input
                                                    type="checkbox"
                                                    id="is_default"
                                                    checked={addressFormData.is_default}
                                                    onChange={(e) => setAddressFormData({ ...addressFormData, is_default: e.target.checked })}
                                                    className="w-5 h-5 rounded-lg border-neutral-300 text-primary focus:ring-primary/20"
                                                />
                                                <label htmlFor="is_default" className="text-sm font-bold text-neutral-900 cursor-pointer select-none">Set as default address for {addressFormData.type} orders</label>
                                            </div>

                                            <div className="pt-6 sticky bottom-0 bg-neutral-50/50 backdrop-blur pb-2">
                                                <button
                                                    type="submit"
                                                    disabled={updating}
                                                    className="w-full py-5 bg-neutral-900 text-white rounded-2xl font-black shadow-xl shadow-neutral-900/20 hover:bg-black transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                                                >
                                                    {updating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                                    {editingAddress ? 'Update Address' : 'Save Address'}
                                                </button>
                                            </div>
                                        </form>
                                    </motion.div>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
