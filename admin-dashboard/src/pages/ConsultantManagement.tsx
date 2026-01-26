import { useState, useEffect } from 'react';
import {
    CheckCircle,
    XCircle,
    Clock,
    User,
    Mail,
    Phone,
    MapPin,
    Edit2,
    Ban,
    Briefcase,
    ChevronRight,
    X,
    ExternalLink,
    ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchConsultants, updateConsultantStatus } from '../services/admin.service';
import { formatDateIST } from '../utils/dateUtils';

const ConsultantManagement = () => {
    const [consultants, setConsultants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'all'>('pending');
    const [selectedConsultant, setSelectedConsultant] = useState<any>(null);

    useEffect(() => {
        loadConsultants();
    }, [activeTab]);

    const loadConsultants = async () => {
        setLoading(true);
        try {
            const status = activeTab === 'all' ? undefined : activeTab;
            const data = await fetchConsultants({ status });
            setConsultants(data);
        } catch (err) {
            console.error('Failed to load consultants', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (e: React.MouseEvent, id: string, status: string, is_visible: boolean = false) => {
        e.stopPropagation();
        try {
            await updateConsultantStatus(id, { status, is_visible });
            if (status === 'approved') {
                alert('Consultant profile has been activated and is now live.');
            }
            loadConsultants();
            if (selectedConsultant?.id === id) {
                setSelectedConsultant(null);
            }
        } catch (err) {
            console.error('Action failed', err);
            alert('Operation failed. Please verify administrative permissions.');
        }
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
            case 'suspended': return 'bg-gray-100 text-gray-700 border-gray-200';
            default: return 'bg-blue-100 text-blue-700 border-blue-200';
        }
    };

    return (
        <div className="max-w-7xl mx-auto pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                    <h2 className="text-4xl font-black text-gray-900 tracking-tight">Executive Advisory</h2>
                    <p className="text-gray-500 mt-1 font-bold italic">Vetting and lifecycle management for platform consultants.</p>
                </div>
                <div className="flex bg-gray-100 p-1.5 rounded-[24px] shadow-inner">
                    {[
                        { id: 'pending', label: 'Review Queue', icon: Clock },
                        { id: 'approved', label: 'Active Roster', icon: CheckCircle },
                        { id: 'all', label: 'Global Directory', icon: User },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-3 px-8 py-4 rounded-[18px] text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab.id
                                ? 'bg-white text-primary shadow-xl shadow-gray-200/50 scale-105'
                                : 'text-gray-400 hover:text-gray-700'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Consultant Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading ? (
                    [1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-[420px] bg-white rounded-[40px] border border-gray-50 animate-pulse shadow-sm" />
                    ))
                ) : consultants.length === 0 ? (
                    <div className="col-span-full py-32 text-center bg-white rounded-[40px] border border-gray-100 shadow-sm">
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8">
                            <Briefcase className="w-10 h-10 text-gray-200" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-400 uppercase tracking-widest">Zero Intelligence Records</h3>
                        <p className="text-gray-400 mt-2 font-bold italic">No {activeTab} consultants match current filter protocol.</p>
                    </div>
                ) : (
                    consultants.map((c) => (
                        <motion.div
                            layout
                            key={c.id}
                            onClick={() => setSelectedConsultant(c)}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-[40px] border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-primary/5 transition-all group cursor-pointer flex flex-col relative overflow-hidden"
                        >
                            <div className="p-10 flex-grow">
                                <div className="flex justify-between items-start mb-8">
                                    <div className="w-20 h-20 bg-primary/5 rounded-[28px] border border-primary/10 flex items-center justify-center text-primary font-black text-3xl shadow-inner group-hover:scale-110 transition-transform duration-500">
                                        {c.first_name?.[0]}{c.last_name?.[0]}
                                    </div>
                                    <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${getStatusStyles(c.status)}`}>
                                        {c.status}
                                    </span>
                                </div>

                                <h3 className="text-2xl font-black text-gray-900 mb-2 truncate">{c.first_name} {c.last_name}</h3>
                                <div className="flex items-center gap-2 text-gray-400 text-[10px] font-black uppercase tracking-widest mb-8">
                                    <MapPin className="w-3.5 h-3.5 text-primary" /> {c.location || 'HQ UNDISCLOSED'}
                                </div>

                                <div className="space-y-4 mb-8">
                                    <div className="flex items-center gap-4 p-4 bg-gray-50/50 rounded-2xl border border-transparent group-hover:border-primary/5 transition-all">
                                        <Briefcase className="w-5 h-5 text-primary/40" />
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Experience Depth</span>
                                            <span className="text-sm font-black text-gray-700">{c.experience_years} Professional Years</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 p-4 bg-gray-50/50 rounded-2xl border border-transparent group-hover:border-primary/5 transition-all">
                                        <ShieldCheck className="w-5 h-5 text-primary/40" />
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Specialization</span>
                                            <span className="text-sm font-black text-gray-700 truncate">{c.service_categories?.[0] || 'General Strategy'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 bg-gray-50/30 border-t border-gray-50 flex gap-3 group-hover:bg-white transition-colors">
                                {c.status === 'pending' ? (
                                    <>
                                        <button
                                            onClick={(e) => handleAction(e, c.id, 'approved', true)}
                                            className="flex-grow bg-primary text-white text-[10px] font-black uppercase tracking-widest py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-primary-dark transition-all shadow-xl shadow-primary/20 active:scale-95"
                                        >
                                            <CheckCircle className="w-4 h-4" /> Finalize Approval
                                        </button>
                                        <button
                                            onClick={(e) => handleAction(e, c.id, 'rejected')}
                                            className="p-4 bg-white text-gray-400 hover:text-red-500 border border-gray-100 hover:border-red-100 rounded-2xl transition-all shadow-sm active:scale-95"
                                        >
                                            <XCircle className="w-5 h-5" />
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button className="flex-grow bg-white hover:bg-gray-900 hover:text-white text-gray-900 border-2 border-gray-100 hover:border-gray-900 text-[10px] font-black uppercase tracking-widest py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95">
                                            Manage Profile <ChevronRight className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={(e) => handleAction(e, c.id, c.status === 'suspended' ? 'approved' : 'suspended', c.status === 'suspended')}
                                            className={`p-4 rounded-2xl border transition-all active:scale-95 ${c.status === 'suspended'
                                                ? 'bg-amber-500 text-white border-transparent shadow-xl shadow-amber-500/20'
                                                : 'bg-white text-gray-300 hover:text-red-500 border-gray-100 hover:border-red-100 shadow-sm'
                                                }`}
                                            title={c.status === 'suspended' ? 'Reinstate' : 'Suspend Account'}
                                        >
                                            <Ban className="w-5 h-5" />
                                        </button>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Detailed Dossier Side Panel */}
            <AnimatePresence>
                {selectedConsultant && (
                    <div className="fixed inset-0 z-[100] flex justify-end">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                            onClick={() => setSelectedConsultant(null)}
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="relative w-full max-w-2xl bg-white shadow-2xl flex flex-col h-full overflow-hidden"
                        >
                            {/* Panel Header */}
                            <div className="p-10 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-2xl shadow-primary/20">
                                        {selectedConsultant.first_name?.[0]}{selectedConsultant.last_name?.[0]}
                                    </div>
                                    <div>
                                        <h3 className="text-3xl font-black text-gray-900 tracking-tight">{selectedConsultant.first_name} {selectedConsultant.last_name}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${getStatusStyles(selectedConsultant.status)}`}>
                                                {selectedConsultant.status}
                                            </span>
                                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">• Member Since {formatDateIST(selectedConsultant.created_at)}</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedConsultant(null)}
                                    className="w-12 h-12 flex items-center justify-center bg-gray-100 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-2xl transition-all active:scale-90"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Panel Body */}
                            <div className="flex-grow overflow-y-auto p-12 custom-scrollbar space-y-12">
                                <section>
                                    <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary mb-6 flex items-center gap-2">
                                        <Mail className="w-4 h-4" /> Contact Information
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 rounded-[32px] p-8 border border-gray-100">
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Digital Mail</p>
                                            <p className="font-black text-gray-900 text-sm truncate">{selectedConsultant.email}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Mobile Matrix</p>
                                            <p className="font-black text-gray-900 text-sm">{selectedConsultant.phone}</p>
                                        </div>
                                        <div className="md:col-span-2 space-y-1 pt-4 border-t border-gray-200">
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Geographic Base</p>
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-primary" />
                                                <p className="font-black text-gray-900 text-sm">{selectedConsultant.location || 'Undisclosed'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <section>
                                    <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary mb-6 flex items-center gap-2">
                                        <Edit2 className="w-4 h-4" /> Professional Bio
                                    </h4>
                                    <p className="text-gray-600 font-medium leading-relaxed italic border-l-4 border-primary/20 pl-8 text-lg">
                                        "{selectedConsultant.bio || 'No executive summary provided by the consultant.'}"
                                    </p>
                                </section>

                                <section>
                                    <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary mb-6 flex items-center gap-2">
                                        <ShieldCheck className="w-4 h-4" /> Intellectual Assets
                                    </h4>
                                    <div className="flex flex-wrap gap-3">
                                        {selectedConsultant.service_categories?.map((cat: string) => (
                                            <span key={cat} className="px-6 py-3 bg-white border-2 border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-600 hover:border-primary/20 hover:text-primary transition-all cursor-default shadow-sm lowercase">
                                                {cat}
                                            </span>
                                        )) || <p className="text-gray-400 italic">No specific service domains categorized.</p>}
                                    </div>
                                </section>
                            </div>

                            {/* Panel Footer */}
                            <div className="p-10 border-t border-gray-50 bg-white grid grid-cols-2 gap-4">
                                {selectedConsultant.status === 'pending' ? (
                                    <>
                                        <button
                                            onClick={(e) => handleAction(e, selectedConsultant.id, 'rejected')}
                                            className="px-8 py-5 border-2 border-gray-100 text-gray-400 hover:text-red-500 hover:border-red-100 rounded-[24px] text-xs font-black uppercase tracking-widest transition-all"
                                        >
                                            Decline Request
                                        </button>
                                        <button
                                            onClick={(e) => handleAction(e, selectedConsultant.id, 'approved', true)}
                                            className="px-8 py-5 bg-primary text-white rounded-[24px] text-xs font-black uppercase tracking-widest shadow-2xl shadow-primary/20 hover:bg-primary-dark transition-all scale-105"
                                        >
                                            Authorize Profile
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={(e) => handleAction(e, selectedConsultant.id, selectedConsultant.status === 'suspended' ? 'approved' : 'suspended', selectedConsultant.status === 'suspended')}
                                        className={`col-span-2 px-8 py-5 rounded-[24px] text-xs font-black uppercase tracking-widest transition-all ${selectedConsultant.status === 'suspended'
                                            ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/20 hover:bg-emerald-600'
                                            : 'bg-white border-2 border-gray-100 text-gray-400 hover:text-red-500 hover:border-red-100'
                                            }`}
                                    >
                                        {selectedConsultant.status === 'suspended' ? 'Reinstate Executive Authorization' : 'Suspend Advisory Access'}
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ConsultantManagement;
