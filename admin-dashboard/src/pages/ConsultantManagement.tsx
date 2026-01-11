import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, User, Mail, Phone, MapPin, ExternalLink, MoreVertical, Edit2, Ban } from 'lucide-react';
import { fetchConsultants, updateConsultantStatus, deleteConsultant } from '../../services/admin.service';

const ConsultantManagement = () => {
    const [consultants, setConsultants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'all'>('pending');

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

    const handleAction = async (id: string, status: string, is_visible: boolean = false) => {
        try {
            await updateConsultantStatus(id, { status, is_visible });
            loadConsultants();
        } catch (err) {
            console.error('Action failed', err);
        }
    };

    return (
        <div className="max-w-7xl mx-auto">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900">Consultant Management</h2>
                <p className="text-gray-500 mt-1">Review and manage platform consultants</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-8 p-1 bg-gray-100 rounded-2xl w-fit">
                {[
                    { id: 'pending', label: 'Pending Requests', icon: Clock },
                    { id: 'approved', label: 'Approved', icon: CheckCircle },
                    { id: 'all', label: 'All', icon: User },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === tab.id
                                ? 'bg-white text-primary shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Consultant Grid/List */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {loading ? (
                    [1, 2, 3].map(i => <div key={i} className="h-64 bg-gray-100 animate-pulse rounded-3xl"></div>)
                ) : consultants.length === 0 ? (
                    <div className="col-span-full bg-white p-12 rounded-3xl text-center border border-gray-100">
                        <User className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900">No consultants found</h3>
                        <p className="text-gray-500">There are no {activeTab} consultant records at the moment.</p>
                    </div>
                ) : consultants.map((c) => (
                    <div key={c.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary font-bold text-2xl">
                                    {c.first_name[0]}{c.last_name[0]}
                                </div>
                                <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${c.status === 'approved' ? 'bg-green-100 text-green-700' :
                                        c.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                    {c.status}
                                </span>
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 mb-1">{c.first_name} {c.last_name}</h3>
                            <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
                                <MapPin className="w-4 h-4" /> {c.location || 'Location not specified'}
                            </div>

                            <div className="space-y-3 mb-6">
                                <div className="flex items-center gap-3 text-gray-600">
                                    <Mail className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm truncate">{c.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-600">
                                    <Phone className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm">{c.phone}</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-600">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm">{c.experience_years} Experience</span>
                                </div>
                            </div>

                            {c.bio && (
                                <p className="text-gray-500 text-sm line-clamp-2 italic mb-6">
                                    "{c.bio}"
                                </p>
                            )}

                            <div className="flex flex-wrap gap-2 mb-6">
                                {c.service_categories?.map((cat: string) => (
                                    <span key={cat} className="px-2.5 py-1 bg-gray-50 text-gray-500 border border-gray-100 rounded-lg text-xs font-medium">
                                        {cat}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="mt-auto p-4 bg-gray-50/50 border-t border-gray-100 flex gap-2">
                            {c.status === 'pending' ? (
                                <>
                                    <button
                                        onClick={() => handleAction(c.id, 'approved', true)}
                                        className="flex-grow bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-600/10"
                                    >
                                        <CheckCircle className="w-4 h-4" /> Approve
                                    </button>
                                    <button
                                        onClick={() => handleAction(c.id, 'rejected')}
                                        className="flex-grow bg-white hover:bg-red-50 text-red-600 border border-red-100 font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all"
                                    >
                                        <XCircle className="w-4 h-4" /> Reject
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button className="flex-grow bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all">
                                        <Edit2 className="w-4 h-4" /> Edit Profile
                                    </button>
                                    <button
                                        onClick={() => handleAction(c.id, c.status === 'suspended' ? 'approved' : 'suspended', c.status === 'suspended')}
                                        className={`p-2.5 rounded-xl border transition-all ${c.status === 'suspended'
                                                ? 'bg-amber-100 text-amber-700 border-amber-200'
                                                : 'bg-white text-red-400 border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-100'
                                            }`}
                                        title={c.status === 'suspended' ? 'Unsuspended' : 'Suspend'}
                                    >
                                        <Ban className="w-5 h-5" />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ConsultantManagement;
