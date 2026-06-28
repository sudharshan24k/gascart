import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
    Building2, MapPin, Gauge, Activity, Plus, Search, 
    Trash2, Edit, Check, X, ShieldAlert, ArrowLeft, Send, 
    Navigation, Layers, AlertTriangle
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface ProducerRecord {
    id: string;
    producer_name: string;
    capacity: number;
    spare_capacity: number;
    location_name: string;
    latitude?: number;
    longitude?: number;
    status: 'pending' | 'approved' | 'rejected';
    admin_notes?: string;
    created_at: string;
}

const ProducerCapacities: React.FC = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const isAdmin = user?.role === 'admin';

    const [records, setRecords] = useState<ProducerRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'view' | 'submit' | 'admin'>('view');
    const [searchQuery, setSearchQuery] = useState('');
    const [adminFilter, setAdminFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

    // Form state
    const [formData, setFormData] = useState({
        producer_name: '',
        capacity: '',
        spare_capacity: '',
        location_name: '',
        latitude: '',
        longitude: ''
    });
    const [submitting, setSubmitting] = useState(false);

    // Edit state
    const [editingRecord, setEditingRecord] = useState<ProducerRecord | null>(null);
    const [editFormData, setEditFormData] = useState({
        producer_name: '',
        capacity: '',
        spare_capacity: '',
        location_name: '',
        latitude: '',
        longitude: '',
        status: 'pending' as 'pending' | 'approved' | 'rejected',
        admin_notes: ''
    });

    const loadRecords = async () => {
        setLoading(true);
        try {
            // If admin is viewing, fetch all records, otherwise approved list is returned by API
            const response = await api.producers.list(isAdmin && activeTab === 'admin' ? undefined : 'approved');
            if (response.status === 'success' && response.data) {
                setRecords(response.data);
            }
        } catch (err: any) {
            console.error('Failed to load records:', err);
            showToast('Failed to retrieve capacity records.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRecords();
    }, [isAdmin, activeTab]);

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (Number(formData.spare_capacity) > Number(formData.capacity)) {
            showToast('Spare capacity cannot exceed total capacity.', 'error');
            return;
        }

        setSubmitting(true);
        try {
            const response = await api.producers.submit(formData);
            if (response.status === 'success') {
                showToast('Capacity details submitted successfully and are pending review!', 'success');
                setFormData({
                    producer_name: '',
                    capacity: '',
                    spare_capacity: '',
                    location_name: '',
                    latitude: '',
                    longitude: ''
                });
                setActiveTab('view');
                loadRecords();
            }
        } catch (err: any) {
            showToast(err.message || 'Submission failed.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected', notes?: string) => {
        try {
            const response = await api.producers.update(id, { status, admin_notes: notes });
            if (response.status === 'success') {
                showToast(`Record status updated to ${status}.`, 'success');
                loadRecords();
            }
        } catch (err: any) {
            showToast(err.message || 'Status update failed.', 'error');
        }
    };

    const handleDeleteRecord = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this capacity record?')) return;

        try {
            const response = await api.producers.delete(id);
            if (response.status === 'success') {
                showToast('Record deleted successfully.', 'success');
                loadRecords();
            }
        } catch (err: any) {
            showToast(err.message || 'Delete operation failed.', 'error');
        }
    };

    const startEditing = (record: ProducerRecord) => {
        setEditingRecord(record);
        setEditFormData({
            producer_name: record.producer_name,
            capacity: String(record.capacity),
            spare_capacity: String(record.spare_capacity),
            location_name: record.location_name,
            latitude: record.latitude !== undefined ? String(record.latitude) : '',
            longitude: record.longitude !== undefined ? String(record.longitude) : '',
            status: record.status,
            admin_notes: record.admin_notes || ''
        });
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingRecord) return;
        if (Number(editFormData.spare_capacity) > Number(editFormData.capacity)) {
            showToast('Spare capacity cannot exceed total capacity.', 'error');
            return;
        }

        try {
            const response = await api.producers.update(editingRecord.id, editFormData);
            if (response.status === 'success') {
                showToast('Record updated successfully!', 'success');
                setEditingRecord(null);
                loadRecords();
            }
        } catch (err: any) {
            showToast(err.message || 'Update failed.', 'error');
        }
    };

    // Computations / Summary metrics
    const approvedRecords = records.filter(r => r.status === 'approved');
    const displayRecords = records.filter(r => {
        const matchesSearch = r.producer_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             r.location_name.toLowerCase().includes(searchQuery.toLowerCase());
        
        if (activeTab === 'admin') {
            const matchesStatus = adminFilter === 'all' || r.status === adminFilter;
            return matchesSearch && matchesStatus;
        }
        return matchesSearch;
    });

    const metricsSource = activeTab === 'admin' ? records : approvedRecords;
    const totalCapacity = metricsSource.reduce((sum, r) => sum + Number(r.capacity), 0);
    const totalSpare = metricsSource.reduce((sum, r) => sum + Number(r.spare_capacity), 0);
    const inUseCapacity = Math.max(0, totalCapacity - totalSpare);
    const averageSparePercent = totalCapacity > 0 ? (totalSpare / totalCapacity) * 100 : 0;

    return (
        <div className="pt-32 pb-24 min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <Link
                            to="/shop"
                            className="inline-flex items-center gap-2 text-gray-400 hover:text-primary font-bold mb-4 transition-colors uppercase tracking-widest text-xs"
                        >
                            <ArrowLeft className="w-4 h-4" /> Back to Marketplace
                        </Link>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight leading-none flex items-center gap-3">
                            Producer <span className="text-primary italic">Capacity</span> Registry
                        </h1>
                        <p className="text-gray-500 mt-2 font-medium">
                            Aggregated metrics and spare logistics optimization for Gascart Bio-CNG partners.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setActiveTab('view')}
                            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${
                                activeTab === 'view' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            Approved Registry
                        </button>
                        
                        <button
                            onClick={() => setActiveTab('submit')}
                            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                                activeTab === 'submit' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            <Plus className="w-4 h-4" /> Submit Capacity
                        </button>

                        {isAdmin && (
                            <button
                                onClick={() => setActiveTab('admin')}
                                className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                                    activeTab === 'admin' ? 'bg-secondary-900 text-white shadow-lg shadow-secondary-900/20' : 'bg-white text-secondary-900 hover:bg-gray-100 border border-secondary-100'
                                }`}
                            >
                                <ShieldAlert className="w-4 h-4" /> Admin Console
                            </button>
                        )}
                    </div>
                </div>

                {/* Dashboard / Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <motion.div 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                        className="bg-white p-6 rounded-[30px] border border-gray-100 shadow-sm flex items-center gap-5"
                    >
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                            <Building2 className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Producers Listed</p>
                            <h3 className="text-2xl font-black text-gray-900 mt-1">{metricsSource.length}</h3>
                            <p className="text-xs text-gray-400 font-medium">Approved partners</p>
                        </div>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white p-6 rounded-[30px] border border-gray-100 shadow-sm flex items-center gap-5"
                    >
                        <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center text-green-600 shrink-0">
                            <Gauge className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Capacity</p>
                            <h3 className="text-2xl font-black text-gray-900 mt-1">{totalCapacity.toLocaleString()} <span className="text-sm font-bold text-gray-400">TPD</span></h3>
                            <p className="text-xs text-gray-400 font-medium">Tons Per Day total output</p>
                        </div>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="bg-white p-6 rounded-[30px] border border-gray-100 shadow-sm flex items-center gap-5"
                    >
                        <div className="w-14 h-14 rounded-2xl bg-yellow-50 flex items-center justify-center text-yellow-600 shrink-0">
                            <Activity className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Spare Capacity</p>
                            <h3 className="text-2xl font-black text-gray-900 mt-1">{totalSpare.toLocaleString()} <span className="text-sm font-bold text-gray-400">TPD</span></h3>
                            <p className="text-xs text-gray-400 font-medium">{inUseCapacity.toLocaleString()} TPD in sales contracts</p>
                        </div>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white p-6 rounded-[30px] border border-gray-100 shadow-sm flex items-center gap-5"
                    >
                        <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                            <Layers className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Average Excess %</p>
                            <h3 className="text-2xl font-black text-gray-900 mt-1">{averageSparePercent.toFixed(1)}%</h3>
                            <p className="text-xs text-gray-400 font-medium">Available for immediate off-take</p>
                        </div>
                    </motion.div>
                </div>

                {/* Main Views Container */}
                <div className="bg-white rounded-[40px] shadow-xl shadow-gray-200/50 border border-gray-100 p-8 md:p-12">
                    
                    {/* VIEW TAB */}
                    {activeTab === 'view' && (
                        <div>
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900">Approved Spare Capacity List</h2>
                                    <p className="text-sm text-gray-400 font-medium mt-1">Search through verified excess capacities currently available for off-take.</p>
                                </div>
                                <div className="relative w-full sm:w-80">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
                                    <input 
                                        type="text"
                                        placeholder="Search by name or city..."
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl outline-none text-sm font-semibold text-gray-700 focus:ring-2 focus:ring-primary/10 transition-all"
                                    />
                                </div>
                            </div>

                            {loading ? (
                                <div className="flex justify-center items-center py-20">
                                    <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                                </div>
                            ) : displayRecords.length === 0 ? (
                                <div className="text-center py-16">
                                    <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-bold text-gray-900">No capacities found</h3>
                                    <p className="text-gray-400 mt-1 text-sm">Submit your excess capacity to be verified and listed on our dashboard.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {displayRecords.map((record) => {
                                        const usagePercent = record.capacity > 0 ? ((record.capacity - record.spare_capacity) / record.capacity) * 100 : 0;
                                        return (
                                            <motion.div 
                                                layout
                                                key={record.id}
                                                className="border border-gray-100 rounded-3xl p-6 hover:shadow-lg hover:border-primary/10 transition-all group bg-gradient-to-b from-white to-gray-50/30"
                                            >
                                                <div className="flex justify-between items-start gap-4 mb-4">
                                                    <div>
                                                        <h4 className="font-black text-gray-900 group-hover:text-primary transition-colors">{record.producer_name}</h4>
                                                        <div className="flex items-center gap-1.5 text-gray-400 text-xs mt-1 font-semibold">
                                                            <MapPin className="w-3.5 h-3.5" />
                                                            {record.location_name}
                                                        </div>
                                                    </div>
                                                    {(record.latitude && record.longitude) && (
                                                        <a 
                                                            href={`https://www.google.com/maps/search/?api=1&query=${record.latitude},${record.longitude}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-2 bg-white rounded-xl shadow-sm border border-gray-100 text-primary hover:bg-primary hover:text-white transition-colors"
                                                            title="View Location"
                                                        >
                                                            <Navigation className="w-4 h-4" />
                                                        </a>
                                                    )}
                                                </div>

                                                <div className="space-y-3 mb-5">
                                                    <div className="flex justify-between text-xs">
                                                        <span className="font-bold text-gray-400 uppercase tracking-wider">Total Output</span>
                                                        <span className="font-black text-gray-700">{record.capacity} TPD</span>
                                                    </div>
                                                    <div className="flex justify-between text-xs">
                                                        <span className="font-bold text-yellow-600 uppercase tracking-wider">Spare Capacity</span>
                                                        <span className="font-black text-yellow-600">{record.spare_capacity} TPD</span>
                                                    </div>
                                                    <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                                                        <div 
                                                            className="bg-primary h-full rounded-full"
                                                            style={{ width: `${Math.max(0, 100 - usagePercent)}%` }}
                                                        />
                                                    </div>
                                                    <div className="flex justify-between text-[10px] text-gray-400 font-bold">
                                                        <span>{usagePercent.toFixed(0)}% Utilized</span>
                                                        <span>{((record.spare_capacity/record.capacity)*100).toFixed(0)}% Spare</span>
                                                    </div>
                                                </div>

                                                {record.admin_notes && (
                                                    <div className="bg-white p-3.5 rounded-2xl border border-gray-100 text-xs text-gray-500 font-semibold italic">
                                                        Note: {record.admin_notes}
                                                    </div>
                                                )}
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* SUBMIT TAB */}
                    {activeTab === 'submit' && (
                        <div className="max-w-2xl mx-auto">
                            <div className="text-center mb-10">
                                <span className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 inline-block">Partner Enquiry</span>
                                <h2 className="text-3xl font-black text-gray-900">List Your Excess Capacity</h2>
                                <p className="text-gray-400 mt-2 font-medium">Add details of your production facility to be matched with potential buyers.</p>
                            </div>

                            <form onSubmit={handleFormSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5">Producer / Company Name</label>
                                    <div className="relative">
                                        <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
                                        <input 
                                            type="text"
                                            required
                                            placeholder="e.g. GreenGases Bio-CNG Plant"
                                            value={formData.producer_name}
                                            onChange={e => setFormData({ ...formData, producer_name: e.target.value })}
                                            className="w-full pl-14 pr-4 py-4 bg-gray-50 border-none rounded-2xl outline-none font-bold text-gray-700 focus:ring-4 focus:ring-primary/10 transition-all shadow-inner"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5">Total Capacity (TPD)</label>
                                        <div className="relative">
                                            <Gauge className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
                                            <input 
                                                type="number"
                                                required
                                                min="0"
                                                step="0.01"
                                                placeholder="e.g. 50"
                                                value={formData.capacity}
                                                onChange={e => setFormData({ ...formData, capacity: e.target.value })}
                                                className="w-full pl-14 pr-4 py-4 bg-gray-50 border-none rounded-2xl outline-none font-bold text-gray-700 focus:ring-4 focus:ring-primary/10 transition-all shadow-inner"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5">Spare / Excess Capacity (TPD)</label>
                                        <div className="relative">
                                            <Activity className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
                                            <input 
                                                type="number"
                                                required
                                                min="0"
                                                step="0.01"
                                                placeholder="e.g. 15"
                                                value={formData.spare_capacity}
                                                onChange={e => setFormData({ ...formData, spare_capacity: e.target.value })}
                                                className="w-full pl-14 pr-4 py-4 bg-gray-50 border-none rounded-2xl outline-none font-bold text-gray-700 focus:ring-4 focus:ring-primary/10 transition-all shadow-inner"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5">Location Name</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
                                        <input 
                                            type="text"
                                            required
                                            placeholder="e.g. Pune, Maharashtra"
                                            value={formData.location_name}
                                            onChange={e => setFormData({ ...formData, location_name: e.target.value })}
                                            className="w-full pl-14 pr-4 py-4 bg-gray-50 border-none rounded-2xl outline-none font-bold text-gray-700 focus:ring-4 focus:ring-primary/10 transition-all shadow-inner"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5">Latitude (Optional)</label>
                                        <input 
                                            type="number"
                                            step="0.000001"
                                            placeholder="e.g. 18.5204"
                                            value={formData.latitude}
                                            onChange={e => setFormData({ ...formData, latitude: e.target.value })}
                                            className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl outline-none font-bold text-gray-700 focus:ring-4 focus:ring-primary/10 transition-all shadow-inner"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5">Longitude (Optional)</label>
                                        <input 
                                            type="number"
                                            step="0.000001"
                                            placeholder="e.g. 73.8567"
                                            value={formData.longitude}
                                            onChange={e => setFormData({ ...formData, longitude: e.target.value })}
                                            className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl outline-none font-bold text-gray-700 focus:ring-4 focus:ring-primary/10 transition-all shadow-inner"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full bg-primary hover:bg-primary-dark text-white font-black py-5 rounded-2xl shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-8"
                                >
                                    {submitting ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5" />
                                            Submit Facility details
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* ADMIN TAB */}
                    {activeTab === 'admin' && isAdmin && (
                        <div>
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 border-b border-gray-100 pb-6">
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                                        <ShieldAlert className="text-secondary-900" /> Admin Controller Dashboard
                                    </h2>
                                    <p className="text-sm text-gray-400 font-medium">Verify, approve, update, or remove partner entries from active registries.</p>
                                </div>

                                <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                                    <div className="flex bg-gray-100 p-1 rounded-xl">
                                        {(['all', 'pending', 'approved', 'rejected'] as const).map(tab => (
                                            <button
                                                key={tab}
                                                onClick={() => setAdminFilter(tab)}
                                                className={`px-4 py-2 rounded-lg text-xs font-bold capitalize transition-colors ${
                                                    adminFilter === tab ? 'bg-white text-secondary-900 shadow-sm' : 'text-gray-500 hover:text-secondary-900'
                                                }`}
                                            >
                                                {tab}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="relative w-full md:w-60">
                                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4" />
                                        <input 
                                            type="text"
                                            placeholder="Search facilities..."
                                            value={searchQuery}
                                            onChange={e => setSearchQuery(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl outline-none text-xs font-semibold text-gray-700 focus:ring-2 focus:ring-primary/10 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            {loading ? (
                                <div className="flex justify-center items-center py-20">
                                    <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                                </div>
                            ) : displayRecords.length === 0 ? (
                                <div className="text-center py-16 text-gray-400">
                                    <AlertTriangle className="w-10 h-10 mx-auto mb-4 text-gray-300" />
                                    No records found matching filters.
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                <th className="py-4 px-4">Producer</th>
                                                <th className="py-4 px-4">Capacity (TPD)</th>
                                                <th className="py-4 px-4">Spare Capacity (TPD)</th>
                                                <th className="py-4 px-4">Location</th>
                                                <th className="py-4 px-4">Coordinates</th>
                                                <th className="py-4 px-4">Status</th>
                                                <th className="py-4 px-4 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {displayRecords.map(record => (
                                                <tr key={record.id} className="text-sm font-semibold text-gray-700 hover:bg-gray-50/50 transition-colors">
                                                    <td className="py-4 px-4">
                                                        <div className="font-bold text-gray-900">{record.producer_name}</div>
                                                        <div className="text-[10px] text-gray-400 font-medium">Submitted {new Date(record.created_at).toLocaleDateString()}</div>
                                                    </td>
                                                    <td className="py-4 px-4">{record.capacity} TPD</td>
                                                    <td className="py-4 px-4 text-yellow-600">{record.spare_capacity} TPD</td>
                                                    <td className="py-4 px-4 text-gray-500">{record.location_name}</td>
                                                    <td className="py-4 px-4 text-xs font-mono text-gray-400">
                                                        {record.latitude && record.longitude ? `${record.latitude}, ${record.longitude}` : '—'}
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                                            record.status === 'approved' ? 'bg-green-50 text-green-600' :
                                                            record.status === 'rejected' ? 'bg-red-50 text-red-600' :
                                                            'bg-yellow-50 text-yellow-600'
                                                        }`}>
                                                            {record.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-4 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            {record.status === 'pending' && (
                                                                <>
                                                                    <button
                                                                        onClick={() => handleUpdateStatus(record.id, 'approved')}
                                                                        className="p-2 bg-green-50 hover:bg-green-500 hover:text-white text-green-600 rounded-xl transition-colors"
                                                                        title="Approve"
                                                                    >
                                                                        <Check className="w-4 h-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => {
                                                                            const reason = window.prompt('Enter reason for rejection:');
                                                                            if (reason !== null) {
                                                                                handleUpdateStatus(record.id, 'rejected', reason);
                                                                            }
                                                                        }}
                                                                        className="p-2 bg-red-50 hover:bg-red-500 hover:text-white text-red-600 rounded-xl transition-colors"
                                                                        title="Reject"
                                                                    >
                                                                        <X className="w-4 h-4" />
                                                                    </button>
                                                                </>
                                                            )}
                                                            <button
                                                                onClick={() => startEditing(record)}
                                                                className="p-2 bg-gray-50 hover:bg-primary hover:text-white text-gray-500 rounded-xl transition-colors"
                                                                title="Edit"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteRecord(record.id)}
                                                                className="p-2 bg-red-50/50 hover:bg-red-600 hover:text-white text-red-500 rounded-xl transition-colors"
                                                                title="Delete"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* EDIT RECORD MODAL */}
            <AnimatePresence>
                {editingRecord && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white w-full max-w-xl rounded-[35px] border border-gray-100 shadow-2xl p-8 relative overflow-hidden"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-xl font-black text-gray-900">Modify Capacity Record</h3>
                                    <p className="text-xs text-gray-400 font-bold mt-1">Admin Edit Console</p>
                                </div>
                                <button 
                                    onClick={() => setEditingRecord(null)}
                                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleEditSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Producer Name</label>
                                    <input 
                                        type="text"
                                        required
                                        value={editFormData.producer_name}
                                        onChange={e => setEditFormData({ ...editFormData, producer_name: e.target.value })}
                                        className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-xl outline-none font-bold text-gray-700 focus:ring-2 focus:ring-primary/10 transition-all"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Capacity (TPD)</label>
                                        <input 
                                            type="number"
                                            required
                                            min="0"
                                            step="0.01"
                                            value={editFormData.capacity}
                                            onChange={e => setEditFormData({ ...editFormData, capacity: e.target.value })}
                                            className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-xl outline-none font-bold text-gray-700 focus:ring-2 focus:ring-primary/10 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Spare (TPD)</label>
                                        <input 
                                            type="number"
                                            required
                                            min="0"
                                            step="0.01"
                                            value={editFormData.spare_capacity}
                                            onChange={e => setEditFormData({ ...editFormData, spare_capacity: e.target.value })}
                                            className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-xl outline-none font-bold text-gray-700 focus:ring-2 focus:ring-primary/10 transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Location Name</label>
                                    <input 
                                        type="text"
                                        required
                                        value={editFormData.location_name}
                                        onChange={e => setEditFormData({ ...editFormData, location_name: e.target.value })}
                                        className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-xl outline-none font-bold text-gray-700 focus:ring-2 focus:ring-primary/10 transition-all"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Latitude</label>
                                        <input 
                                            type="number"
                                            step="0.000001"
                                            value={editFormData.latitude}
                                            onChange={e => setEditFormData({ ...editFormData, latitude: e.target.value })}
                                            className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-xl outline-none font-bold text-gray-700 focus:ring-2 focus:ring-primary/10 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Longitude</label>
                                        <input 
                                            type="number"
                                            step="0.000001"
                                            value={editFormData.longitude}
                                            onChange={e => setEditFormData({ ...editFormData, longitude: e.target.value })}
                                            className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-xl outline-none font-bold text-gray-700 focus:ring-2 focus:ring-primary/10 transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Registry Status</label>
                                    <select
                                        value={editFormData.status}
                                        onChange={e => setEditFormData({ ...editFormData, status: e.target.value as any })}
                                        className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-xl outline-none font-bold text-gray-700 focus:ring-2 focus:ring-primary/10 transition-all appearance-none"
                                    >
                                        <option value="pending">Pending Verification</option>
                                        <option value="approved">Approved & Listed</option>
                                        <option value="rejected">Rejected / Hidden</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Admin Comments / Rejection reason</label>
                                    <textarea
                                        rows={2}
                                        placeholder="Add comments or reasons..."
                                        value={editFormData.admin_notes}
                                        onChange={e => setEditFormData({ ...editFormData, admin_notes: e.target.value })}
                                        className="w-full px-5 py-3 bg-gray-50 border-none rounded-xl outline-none font-bold text-gray-700 focus:ring-2 focus:ring-primary/10 transition-all resize-none"
                                    />
                                </div>

                                <div className="flex gap-3 justify-end pt-4 border-t border-gray-100 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setEditingRecord(null)}
                                        className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl font-bold text-xs transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-xs transition-colors shadow-lg shadow-primary/10"
                                    >
                                        Save changes
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProducerCapacities;
