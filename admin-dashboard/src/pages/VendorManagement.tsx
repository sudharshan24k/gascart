import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    X,
    Building2,
    Mail,
    ShieldCheck,
    FileCheck,
    Check,
    ChevronRight,
    Activity,
    Users,
    Globe,
    Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    fetchVendors,
    fetchVendorEnquiries,
    updateVendorEnquiryStatus,
    createVendor,
    updateVendor,
    deleteVendor
} from '../services/admin.service';
import { formatDateIST } from '../utils/dateUtils';

const VendorManagement = () => {
    const [vendors, setVendors] = useState<any[]>([]);
    const [enquiries, setEnquiries] = useState<any[]>([]);
    const [, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDossierOpen, setIsDossierOpen] = useState(false);
    const [showEnquiries, setShowEnquiries] = useState(false);
    const [selectedVendor, setSelectedVendor] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'all' | 'active' | 'pending'>('all');
    const [formData, setFormData] = useState({
        email: '',
        full_name: '',
        company_name: '',
        certifications: [] as string[],
        visibility_status: 'inactive'
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [vendorData, enquiryData] = await Promise.all([
                fetchVendors(),
                fetchVendorEnquiries()
            ]);
            setVendors(vendorData);
            setEnquiries(enquiryData);
        } catch (err) {
            console.error('Failed to load data', err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDossier = (vendor: any = null) => {
        if (vendor) {
            setSelectedVendor(vendor);
            setFormData({
                email: vendor.email || '',
                full_name: vendor.full_name || '',
                company_name: vendor.company_name || '',
                certifications: vendor.certifications || [],
                visibility_status: vendor.visibility_status || 'inactive'
            });
        } else {
            setSelectedVendor(null);
            setFormData({
                email: '',
                full_name: '',
                company_name: '',
                certifications: [],
                visibility_status: 'inactive'
            });
        }
        setIsDossierOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (selectedVendor) {
                await updateVendor(selectedVendor.id, formData);
            } else {
                await createVendor(formData);
            }
            setIsDossierOpen(false);
            loadData();
        } catch (err) {
            console.error('Failed to save vendor', err);
        }
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (window.confirm('Remove this strategic partner from the platform? This protocol is irreversible.')) {
            try {
                await deleteVendor(id);
                loadData();
            } catch (err) {
                console.error('Failed to terminate vendor relation', err);
            }
        }
    };

    const handleEnquiryAction = async (id: string, newStatus: string) => {
        try {
            await updateVendorEnquiryStatus(id, newStatus);
            loadData();
        } catch (err) {
            alert('Failed to update enquiry status.');
        }
    };

    const filteredVendors = vendors.filter(v => {
        const matchesSearch = v.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.email?.toLowerCase().includes(searchTerm.toLowerCase());
        if (!matchesSearch) return false;

        if (activeTab === 'active') return v.visibility_status === 'active';
        return true;
    });

    const pendingEnquiries = enquiries.filter(e => e.status === 'pending');

    return (
        <div className="max-w-7xl mx-auto pb-20">
            {/* Header Ecosystem Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em]">Partner Ecosystem Live</span>
                    </div>
                    <h2 className="text-4xl font-black text-gray-900 tracking-tight">Supply Chain Governance</h2>
                    <p className="text-gray-500 mt-1 font-bold italic">Verification and orchestration of the GasCart industrial partner aggregate.</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => setShowEnquiries(true)}
                        className={`relative group px-8 py-5 rounded-[24px] font-black text-[10px] uppercase tracking-widest transition-all overflow-hidden flex items-center gap-3 ${pendingEnquiries.length > 0
                            ? 'bg-amber-50 text-amber-600 border-2 border-amber-200 hover:bg-amber-100'
                            : 'bg-white text-gray-400 border border-gray-100 hover:text-gray-700'
                            }`}
                    >
                        <FileCheck className="w-5 h-5 transition-transform group-hover:scale-110" />
                        Access Inquiries
                        {pendingEnquiries.length > 0 && (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] text-white animate-bounce">
                                {pendingEnquiries.length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => handleOpenDossier()}
                        className="bg-gray-900 text-white px-10 py-5 rounded-[24px] flex items-center gap-3 font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-gray-900/20 hover:bg-black transition-all hover:scale-105 active:scale-95 group"
                    >
                        <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
                        Integrate Partner
                    </button>
                </div>
            </div>

            {/* Premium Intelligence Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                {[
                    { label: 'Active Matrix', count: vendors.filter(v => v.visibility_status === 'active').length, icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                    { label: 'Inbound Review', count: pendingEnquiries.length, icon: Activity, color: 'text-amber-500', bg: 'bg-amber-50' },
                    { label: 'Global Directory', count: vendors.length, icon: Globe, color: 'text-blue-500', bg: 'bg-blue-50' }
                ].map((stat, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={i}
                        className="bg-white p-10 rounded-[40px] border border-gray-100 flex items-center gap-10 shadow-sm relative overflow-hidden group hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500"
                    >
                        <div className={`absolute top-0 right-0 w-32 h-32 -mr-12 -mt-12 rounded-full opacity-[0.03] ${stat.bg} group-hover:scale-150 transition-transform duration-700`} />
                        <div className={`w-24 h-24 rounded-[28px] ${stat.bg} flex items-center justify-center shadow-inner shrink-0 group-hover:scale-110 transition-transform duration-500`}>
                            <stat.icon className={`w-10 h-10 ${stat.color} drop-shadow-sm`} />
                        </div>
                        <div>
                            <p className="text-4xl font-black text-gray-900 tabular-nums leading-none tracking-tighter">{stat.count}</p>
                            <p className="text-[10px] font-black text-gray-400 uppercase mt-3 tracking-[0.2em]">{stat.label}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Governance Toolbar */}
            <div className="bg-white p-10 rounded-[48px] shadow-sm border border-gray-100 flex flex-col md:flex-row gap-10 items-center bg-gray-50/20 mb-16">
                <div className="relative flex-grow w-full">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6" />
                    <input
                        type="text"
                        placeholder="Scan aggregate for entities, emails or IDs..."
                        className="w-full pl-16 pr-8 py-5 bg-white border-none rounded-[28px] outline-none focus:ring-8 focus:ring-primary/5 transition-all font-bold text-lg shadow-inner"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex bg-gray-100 p-1.5 rounded-[24px] shadow-inner shrink-0 scale-95 md:scale-100">
                    {[
                        { id: 'all', label: 'Ecosystem All' },
                        { id: 'active', label: 'Live Active' }
                    ].map((btn) => (
                        <button
                            key={btn.id}
                            onClick={() => setActiveTab(btn.id as any)}
                            className={`px-10 py-4 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === btn.id
                                ? 'bg-white text-gray-900 shadow-xl shadow-gray-200/50 scale-105'
                                : 'text-gray-400 hover:text-gray-700'
                                }`}
                        >
                            {btn.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Vendor Ecosystem List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatePresence mode="popLayout">
                    {filteredVendors.length > 0 ? filteredVendors.map((vendor, idx) => (
                        <motion.div
                            layout
                            key={vendor.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: idx * 0.05 }}
                            onClick={() => handleOpenDossier(vendor)}
                            className="bg-white rounded-[44px] border border-gray-100 shadow-sm hover:shadow-3xl hover:shadow-gray-900/5 transition-all cursor-pointer group flex flex-col overflow-hidden relative"
                        >
                            {/* Card Decorative Element */}
                            <div className="absolute top-0 right-0 p-8">
                                <span className={`flex h-2 w-2 rounded-full ${vendor.visibility_status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'}`} />
                            </div>

                            <div className="p-10 flex-grow">
                                <div className="w-20 h-20 bg-gray-50 rounded-[28px] border-2 border-white flex items-center justify-center text-gray-300 mb-8 group-hover:scale-110 group-hover:bg-primary/5 group-hover:text-primary transition-all duration-500 shadow-sm">
                                    <Building2 className="w-10 h-10" />
                                </div>
                                <h3 className="text-2xl font-black text-gray-900 leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">
                                    {vendor.company_name || vendor.full_name || 'Unnamed Entity'}
                                </h3>
                                <div className="flex items-center gap-2 text-gray-400 text-[9px] font-black uppercase tracking-widest mb-10">
                                    <span className="px-3 py-1 bg-gray-50 rounded-lg border border-gray-100">ID: {vendor.id.slice(0, 8)}</span>
                                    <span className={`px-3 py-1 rounded-lg border lowercase ${vendor.visibility_status === 'active' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-gray-50 border-gray-100 text-gray-500'}`}>
                                        {vendor.visibility_status}
                                    </span>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 p-4 bg-gray-50/50 rounded-2xl border border-transparent group-hover:bg-white group-hover:border-gray-100 transition-all">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                            <Mail className="w-5 h-5 text-primary/40" />
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Gateway Comms</p>
                                            <p className="text-sm font-bold text-gray-700 truncate">{vendor.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 p-4 bg-gray-50/50 rounded-2xl border border-transparent group-hover:bg-white group-hover:border-gray-100 transition-all">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                            <Users className="w-5 h-5 text-primary/40" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Lead Contact</p>
                                            <p className="text-sm font-bold text-gray-700">{vendor.full_name || 'Unspecified'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 bg-gray-50/30 border-t border-gray-50 flex items-center justify-between group-hover:bg-white transition-all">
                                <div className="flex gap-2">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleOpenDossier(vendor); }}
                                        className="p-4 bg-white text-gray-400 hover:text-primary rounded-2xl border border-gray-100 shadow-sm transition-all active:scale-90"
                                    >
                                        <Edit2 className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={(e) => handleDelete(e, vendor.id)}
                                        className="p-4 bg-white text-gray-400 hover:text-red-500 rounded-2xl border border-gray-100 shadow-sm transition-all active:scale-90"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="group-hover:translate-x-2 transition-transform">
                                    <ChevronRight className="w-6 h-6 text-gray-300 group-hover:text-primary" />
                                </div>
                            </div>
                        </motion.div>
                    )) : (
                        <div className="col-span-full py-40 text-center bg-white rounded-[48px] border-2 border-dashed border-gray-100">
                            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8">
                                <Users className="w-10 h-10 text-gray-200" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-400 uppercase tracking-widest">Aggregate Depth Null</h3>
                            <p className="text-gray-400 mt-2 font-bold italic italic">No partner entities match current filtering protocol.</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {/* Strategic Partner Dossier (Side Panel) */}
            <AnimatePresence>
                {isDossierOpen && (
                    <div className="fixed inset-0 z-[200] flex justify-end">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                            onClick={() => setIsDossierOpen(false)}
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 200 }}
                            className="relative w-full max-w-2xl bg-white shadow-3xl h-full flex flex-col overflow-hidden"
                        >
                            {/* Panel Header */}
                            <div className="p-12 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                                <div className="flex items-center gap-8">
                                    <div className="w-20 h-20 rounded-[32px] bg-primary text-white flex items-center justify-center shadow-2xl shadow-primary/20">
                                        <Building2 className="w-10 h-10" />
                                    </div>
                                    <div>
                                        <h3 className="text-3xl font-black text-gray-900 tracking-tight">{selectedVendor ? 'Entity Synchronization' : 'Partner Integration'}</h3>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1">{selectedVendor ? `Profile ID: ${selectedVendor.id.slice(0, 16).toUpperCase()}` : 'New Protocol Entry'}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsDossierOpen(false)}
                                    className="w-14 h-14 flex items-center justify-center bg-gray-100 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-[20px] transition-all active:scale-90"
                                >
                                    <X className="w-7 h-7" />
                                </button>
                            </div>

                            {/* Panel Body */}
                            <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-12 custom-scrollbar space-y-12">
                                <section>
                                    <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary mb-8 flex items-center gap-2">
                                        <Building2 className="w-4 h-4" /> Structural Information
                                    </h4>
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Operating Entity Name</label>
                                            <input
                                                required
                                                type="text"
                                                className="w-full px-8 py-5 bg-gray-50 border-2 border-transparent focus:border-primary/10 rounded-[24px] outline-none focus:ring-8 focus:ring-primary/5 font-bold shadow-inner"
                                                value={formData.company_name}
                                                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </section>

                                <section>
                                    <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary mb-8 flex items-center gap-2">
                                        <Users className="w-4 h-4" /> Communication Core
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Lead Contact Person</label>
                                            <input
                                                required
                                                type="text"
                                                className="w-full px-8 py-5 bg-gray-50 border-2 border-transparent focus:border-primary/10 rounded-[24px] outline-none focus:ring-8 focus:ring-primary/5 font-bold shadow-inner"
                                                value={formData.full_name}
                                                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Official Gateway Email</label>
                                            <input
                                                required
                                                type="email"
                                                className="w-full px-8 py-5 bg-gray-50 border-2 border-transparent focus:border-primary/10 rounded-[24px] outline-none focus:ring-8 focus:ring-primary/5 font-bold shadow-inner"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </section>

                                <section>
                                    <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary mb-8 flex items-center gap-2">
                                        <Lock className="w-4 h-4" /> Platform Visibility Control
                                    </h4>
                                    <div className="grid grid-cols-1 gap-4">
                                        {[
                                            { id: 'active', label: 'Public - Active Marketplace', desc: 'Partner is live and visible to all ecosystem users.' },
                                            { id: 'inactive', label: 'Suspended - Inactive', desc: 'Partner profile exists but is temporarily restricted.' },
                                            { id: 'hidden', label: 'Deep Cloak - Hidden', desc: 'Internal use only. Not available for public procurement.' }
                                        ].map((status) => (
                                            <button
                                                key={status.id}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, visibility_status: status.id })}
                                                className={`p-6 rounded-[28px] border-2 text-left transition-all ${formData.visibility_status === status.id
                                                    ? 'bg-primary/5 border-primary shadow-xl shadow-primary/5'
                                                    : 'bg-white border-gray-100 hover:border-gray-200'
                                                    }`}
                                            >
                                                <div className="flex justify-between items-center mb-1">
                                                    <p className={`text-sm font-black uppercase tracking-widest ${formData.visibility_status === status.id ? 'text-primary' : 'text-gray-700'}`}>{status.label}</p>
                                                    {formData.visibility_status === status.id && <Check className="w-5 h-5 text-primary" />}
                                                </div>
                                                <p className="text-xs text-gray-400 font-bold italic">{status.desc}</p>
                                            </button>
                                        ))}
                                    </div>
                                </section>
                            </form>

                            {/* Panel Footer */}
                            <div className="p-12 border-t border-gray-50 bg-white grid grid-cols-1">
                                <button
                                    onClick={handleSubmit}
                                    className="w-full bg-gray-900 text-white font-black py-6 rounded-[28px] shadow-2xl shadow-gray-900/20 hover:bg-black transition-all active:scale-95 text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3"
                                >
                                    <ShieldCheck className="w-5 h-5" />
                                    Synchronize Partner Protocol
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Inbound Enquiry Prioritization Queue */}
            <AnimatePresence>
                {showEnquiries && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-8 bg-gray-900/60 backdrop-blur-lg" onClick={() => setShowEnquiries(false)}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 50 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 50 }}
                            className="bg-white w-full max-w-5xl rounded-[56px] shadow-3xl overflow-hidden relative z-20 max-h-[90vh] flex flex-col"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-12 border-b border-gray-50 bg-gray-50/30 flex justify-between items-center">
                                <div>
                                    <h3 className="text-3xl font-black text-gray-900 tracking-tight">Inbound Prioritization Queue</h3>
                                    <p className="text-gray-500 font-bold text-sm mt-1">{pendingEnquiries.length} prospective entities awaiting clearance protocol.</p>
                                </div>
                                <button onClick={() => setShowEnquiries(false)} className="w-14 h-14 flex items-center justify-center bg-white hover:bg-gray-100 rounded-[20px] shadow-sm transition-all active:scale-90">
                                    <X className="w-7 h-7 text-gray-400" />
                                </button>
                            </div>

                            <div className="p-12 overflow-y-auto space-y-8 custom-scrollbar">
                                {pendingEnquiries.length > 0 ? pendingEnquiries.map((enquiry) => (
                                    <motion.div
                                        layout
                                        key={enquiry.id}
                                        className="p-10 bg-gray-50 rounded-[40px] border border-gray-100 relative overflow-hidden group"
                                    >
                                        <div className="absolute top-0 right-0 p-8">
                                            <span className="px-4 py-2 bg-amber-500 text-white rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl shadow-amber-500/20">Awaiting clearance</span>
                                        </div>

                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-10">
                                            <div className="flex gap-8 items-center">
                                                <div className="w-20 h-20 bg-white rounded-[28px] flex items-center justify-center shadow-inner shrink-0 border border-gray-100">
                                                    <Globe className="w-10 h-10 text-gray-200" />
                                                </div>
                                                <div>
                                                    <h4 className="text-3xl font-black text-gray-900 tracking-tighter">{enquiry.company_name}</h4>
                                                    <div className="flex flex-wrap gap-4 mt-2">
                                                        <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-white px-3 py-1.5 rounded-xl border border-gray-100">
                                                            <Users className="w-3.5 h-3.5 text-primary" /> {enquiry.contact_person}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-white px-3 py-1.5 rounded-xl border border-gray-100">
                                                            <Mail className="w-3.5 h-3.5 text-primary" /> {enquiry.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Inbound Payload Date</p>
                                                <p className="text-sm font-black text-gray-900">{formatDateIST(enquiry.created_at)}</p>
                                            </div>
                                        </div>

                                        {enquiry.message && (
                                            <div className="relative mb-10">
                                                <p className="text-gray-600 font-medium leading-relaxed italic border-l-4 border-primary/20 pl-8 py-2 text-lg">
                                                    "{enquiry.message}"
                                                </p>
                                            </div>
                                        )}

                                        <div className="flex flex-col sm:flex-row gap-4">
                                            <button
                                                onClick={() => handleEnquiryAction(enquiry.id, 'approved')}
                                                className="flex-1 bg-emerald-500 text-white font-black py-5 rounded-[24px] hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/10 flex items-center justify-center gap-3 text-xs uppercase tracking-widest"
                                            >
                                                <ShieldCheck className="w-5 h-5" /> Authorize & Notify
                                            </button>
                                            <button
                                                onClick={() => handleEnquiryAction(enquiry.id, 'rejected')}
                                                className="px-10 py-5 bg-white text-gray-400 hover:text-red-500 border-2 border-transparent hover:border-red-50 rounded-[24px] font-black transition-all text-xs uppercase tracking-widest"
                                            >
                                                Abort Clearance
                                            </button>
                                        </div>
                                    </motion.div>
                                )) : (
                                    <div className="py-20 text-center">
                                        <p className="text-2xl font-black text-gray-200 uppercase tracking-widest">Inbox Protocol Clear</p>
                                        <p className="text-gray-400 font-bold mt-2">No pending entity acquisitions at this time.</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default VendorManagement;
