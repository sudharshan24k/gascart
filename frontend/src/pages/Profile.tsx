import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { formatDateIST } from '../utils/dateUtils';
import { User, Package, FileText, Smartphone, Mail, LogOut, Loader2, Save, MapPin, Plus, Trash2, Home, Briefcase, CheckCircle } from 'lucide-react';
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
            // Parallel Fetch
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

            // Check for consultant profile
            try {
                const consultantRes = await api.consultants.getMyProfile();
                if (consultantRes.status === 'success') {
                    setConsultantProfile(consultantRes.data);
                }
            } catch (err) {
                // Silently fail if not a consultant or error
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
                                <button
                                    onClick={() => setActiveTab('addresses')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium ${activeTab === 'addresses' ? 'bg-primary text-white shadow-lg shadow-primary/25' : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                    <MapPin className="w-5 h-5" /> Addresses <span className="ml-auto bg-white/20 px-2 rounded-md text-xs">{addresses.length}</span>
                                </button>
                                {consultantProfile && (
                                    <Link
                                        to="/consultant-dashboard"
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-gray-600 hover:bg-gray-50 mt-2 border-t border-gray-50 pt-4"
                                    >
                                        <Briefcase className="w-5 h-5 text-primary" /> Consultant Dashboard
                                    </Link>
                                )}
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
                                                        <p className="text-sm font-bold text-gray-900">{formatDateIST(order.created_at)}</p>
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

                                                <div className="mt-6 pt-6 border-t border-gray-50 flex gap-4">
                                                    <Link
                                                        to={`/order-tracking/${order.id}`}
                                                        className="flex-grow text-center py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all text-sm"
                                                    >
                                                        Track Order
                                                    </Link>
                                                    <a
                                                        href={api.orders.getInvoiceUrl(order.id)}
                                                        download
                                                        className="px-6 py-3 border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-all text-sm"
                                                    >
                                                        Invoice
                                                    </a>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </motion.div>
                            )}

                            {activeTab === 'addresses' && (
                                <motion.div
                                    key="addresses"
                                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-xl font-bold text-gray-900">Saved Addresses</h2>
                                        <button
                                            onClick={openAddAddress}
                                            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 text-sm"
                                        >
                                            <Plus className="w-4 h-4" /> Add New Address
                                        </button>
                                    </div>

                                    {addresses.length === 0 ? (
                                        <div className="bg-white p-12 rounded-[32px] text-center border border-gray-100">
                                            <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                            <h3 className="text-lg font-bold text-gray-900 mb-2">No saved addresses</h3>
                                            <p className="text-gray-500">Add your shipping and billing addresses for a faster checkout.</p>
                                        </div>
                                    ) : (
                                        <div className="grid md:grid-cols-2 gap-6">
                                            {addresses.map((address) => (
                                                <div key={address.id} className={`bg-white p-6 rounded-[24px] border transition-all ${address.is_default ? 'border-primary shadow-md' : 'border-gray-100 shadow-sm hover:shadow-md'}`}>
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${address.is_default ? 'bg-primary text-white' : 'bg-gray-50 text-gray-400'}`}>
                                                                {address.label?.toLowerCase() === 'work' ? <Briefcase className="w-5 h-5" /> : <Home className="w-5 h-5" />}
                                                            </div>
                                                            <div>
                                                                <h3 className="font-bold text-gray-900 capitalize">{address.label || 'Home'}</h3>
                                                                <p className="text-[10px] font-black uppercase tracking-widest text-primary">{address.type}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <button
                                                                onClick={() => openEditAddress(address)}
                                                                className="p-2 text-gray-400 hover:text-primary transition-colors"
                                                            >
                                                                <Save className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteAddress(address.id)}
                                                                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-1 text-sm text-gray-600 font-medium">
                                                        <p className="font-bold text-gray-900">{address.full_name}</p>
                                                        <p>{address.address_line1}</p>
                                                        {address.address_line2 && <p>{address.address_line2}</p>}
                                                        <p>{address.city}, {address.state} {address.postal_code}</p>
                                                        <p>{address.country}</p>
                                                        <p className="pt-2 text-gray-500 flex items-center gap-2">
                                                            <Smartphone className="w-3.5 h-3.5" /> {address.phone}
                                                        </p>
                                                    </div>

                                                    {address.is_default && (
                                                        <div className="mt-4 pt-4 border-t border-gray-50 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary">
                                                            <CheckCircle className="w-3 h-3" /> Default Address
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Add/Edit Address Modal */}
                        {isAddingAddress && (
                            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-white rounded-[32px] w-full max-w-xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
                                >
                                    <div className="p-8 border-b border-gray-50 flex justify-between items-center">
                                        <h3 className="text-xl font-bold text-gray-900">{editingAddress ? 'Edit Address' : 'Add New Address'}</h3>
                                        <button onClick={() => setIsAddingAddress(false)} className="p-2 hover:bg-gray-50 rounded-full text-gray-400">
                                            <Plus className="w-6 h-6 rotate-45" />
                                        </button>
                                    </div>

                                    <form onSubmit={handleSaveAddress} className="flex-grow overflow-y-auto p-8 space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Label</label>
                                                <input
                                                    type="text"
                                                    value={addressFormData.label}
                                                    onChange={(e) => setAddressFormData({ ...addressFormData, label: e.target.value })}
                                                    placeholder="Home, Work, etc."
                                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none font-medium"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Type</label>
                                                <select
                                                    value={addressFormData.type}
                                                    onChange={(e) => setAddressFormData({ ...addressFormData, type: e.target.value })}
                                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none font-medium"
                                                >
                                                    <option value="shipping">Shipping</option>
                                                    <option value="billing">Billing</option>
                                                    <option value="both">Both</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Full Name</label>
                                            <input
                                                type="text"
                                                value={addressFormData.full_name}
                                                onChange={(e) => setAddressFormData({ ...addressFormData, full_name: e.target.value })}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none font-medium"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Address Line 1</label>
                                            <input
                                                type="text"
                                                value={addressFormData.address_line1}
                                                onChange={(e) => setAddressFormData({ ...addressFormData, address_line1: e.target.value })}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none font-medium"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Address Line 2 (Optional)</label>
                                            <input
                                                type="text"
                                                value={addressFormData.address_line2}
                                                onChange={(e) => setAddressFormData({ ...addressFormData, address_line2: e.target.value })}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none font-medium"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">City</label>
                                                <input
                                                    type="text"
                                                    value={addressFormData.city}
                                                    onChange={(e) => setAddressFormData({ ...addressFormData, city: e.target.value })}
                                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none font-medium"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">State</label>
                                                <input
                                                    type="text"
                                                    value={addressFormData.state}
                                                    onChange={(e) => setAddressFormData({ ...addressFormData, state: e.target.value })}
                                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none font-medium"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Postal Code</label>
                                                <input
                                                    type="text"
                                                    value={addressFormData.postal_code}
                                                    onChange={(e) => setAddressFormData({ ...addressFormData, postal_code: e.target.value })}
                                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none font-medium"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Phone</label>
                                                <input
                                                    type="tel"
                                                    value={addressFormData.phone}
                                                    onChange={(e) => setAddressFormData({ ...addressFormData, phone: e.target.value })}
                                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none font-medium"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 pt-2">
                                            <input
                                                type="checkbox"
                                                id="is_default"
                                                checked={addressFormData.is_default}
                                                onChange={(e) => setAddressFormData({ ...addressFormData, is_default: e.target.checked })}
                                                className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary/20"
                                            />
                                            <label htmlFor="is_default" className="text-sm font-bold text-gray-700 cursor-pointer">Set as default address</label>
                                        </div>

                                        <div className="pt-6">
                                            <button
                                                type="submit"
                                                disabled={updating}
                                                className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-primary transition-all disabled:opacity-70"
                                            >
                                                {updating ? 'Saving...' : editingAddress ? 'Update Address' : 'Save Address'}
                                            </button>
                                        </div>
                                    </form>
                                </motion.div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
