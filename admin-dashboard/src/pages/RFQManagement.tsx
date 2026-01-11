import React, { useEffect, useState } from 'react';
import { fetchRFQs, updateAdminRFQStatus } from '../services/admin.service';
import { ClipboardList, Download, Search, Filter, Mail, Eye } from 'lucide-react';
import axios from 'axios';

const RFQManagement: React.FC = () => {
    const [rfqs, setRfqs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedRFQ, setSelectedRFQ] = useState<any>(null);

    useEffect(() => {
        loadRFQs();
    }, []);

    const loadRFQs = async () => {
        setLoading(true);
        try {
            const data = await fetchRFQs();
            setRfqs(data);
        } catch (err) {
            console.error('Failed to load RFQs', err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        try {
            await updateAdminRFQStatus(id, newStatus);
            loadRFQs();
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const handleExport = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';
            const token = localStorage.getItem('supabase.auth.token');
            const response = await axios.get(`${API_URL}/rfqs/export`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `gascart_rfqs_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            alert('Export failed');
        }
    };

    const filteredRFQs = rfqs.filter(r => {
        const matchesSearch =
            r.products?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.profiles?.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="max-w-7xl mx-auto pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">Technical Enquiries (RFQs)</h2>
                    <p className="text-gray-500 mt-1 font-medium italic">Manage engineering-led leads and project requisitions.</p>
                </div>
                <button
                    onClick={handleExport}
                    className="flex items-center gap-2 bg-white text-gray-900 font-black px-8 py-4 rounded-2xl border-2 border-gray-100 shadow-xl shadow-gray-200/50 hover:border-primary transition-all active:scale-95"
                >
                    <Download className="w-5 h-5 text-primary" />
                    Export Requisitions
                </button>
            </div>

            <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden min-h-[600px] flex flex-col">
                <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row gap-6 bg-gray-50/30">
                    <div className="flex-grow relative">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by asset or user email..."
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
                        <option value="all">Global Visibility</option>
                        <option value="new">New Lead</option>
                        <option value="processing">In Progress</option>
                        <option value="closed">Closed</option>
                    </select>
                </div>

                <div className="overflow-x-auto flex-grow">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-gray-50">
                                <th className="px-10 py-6">Requisition Asset</th>
                                <th className="px-10 py-6 text-center">Protocol Status</th>
                                <th className="px-10 py-6">Technical Payload</th>
                                <th className="px-10 py-6">Timestamp</th>
                                <th className="px-10 py-6 text-right">Operations</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredRFQs.map((rfq) => (
                                <tr key={rfq.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-10 py-8">
                                        <div className="flex flex-col">
                                            <span className="font-black text-gray-900 text-lg group-hover:text-primary transition-colors">{rfq.products?.name}</span>
                                            <span className="text-xs text-gray-400 font-bold mt-1 flex items-center gap-1">
                                                <Mail className="w-3 h-3 text-primary/40" /> {rfq.profiles?.email}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex justify-center">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.1em] border ${rfq.status === 'new' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                rfq.status === 'processing' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                    rfq.status === 'closed' ? 'bg-gray-50 text-gray-400 border-gray-100' :
                                                        'bg-green-50 text-green-600 border-green-100'
                                                }`}>
                                                {rfq.status}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <button
                                            onClick={() => setSelectedRFQ(rfq)}
                                            className="group/btn flex items-center gap-2 text-xs font-black text-gray-400 hover:text-primary transition-colors"
                                        >
                                            <Eye className="w-4 h-4" /> View Technical Specs
                                        </button>
                                    </td>
                                    <td className="px-10 py-8 text-sm text-gray-400 font-black font-mono">
                                        {new Date(rfq.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-10 py-8 text-right">
                                        <select
                                            onChange={(e) => handleStatusUpdate(rfq.id, e.target.value)}
                                            value={rfq.status}
                                            className="text-xs font-black border-2 border-gray-50 bg-gray-50/50 py-2 pl-4 pr-10 rounded-xl outline-none focus:border-primary/20 transition-all appearance-none cursor-pointer"
                                        >
                                            <option value="new">New</option>
                                            <option value="processing">In Progress</option>
                                            <option value="closed">Closed</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredRFQs.length === 0 && !loading && (
                        <div className="py-32 text-center text-gray-400 flex flex-col items-center">
                            <ClipboardList className="w-20 h-20 mb-6 opacity-5" />
                            <p className="font-black text-xl uppercase tracking-widest opacity-20">No active enquiries</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Technical Spec Modal */}
            {selectedRFQ && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-900/60 backdrop-blur-sm shadow-inner" onClick={() => setSelectedRFQ(null)}>
                    <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col relative z-20" onClick={e => e.stopPropagation()}>
                        <div className="p-10 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                            <div>
                                <h3 className="text-3xl font-black text-gray-900 leading-tight">Technical Spec Report</h3>
                                <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest mt-2">{selectedRFQ.products?.name}</p>
                            </div>
                        </div>
                        <div className="p-12 overflow-y-auto max-h-[70vh]">
                            <div className="grid grid-cols-2 gap-8">
                                {Object.entries(selectedRFQ.submitted_fields || {}).map(([key, value]: [string, any]) => (
                                    <div key={key} className="space-y-1">
                                        <label className="text-[10px] font-black text-primary uppercase tracking-widest">{key}</label>
                                        <p className="text-lg font-bold text-gray-700 bg-gray-50 p-4 rounded-2xl">{value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="p-8 border-t border-gray-50 bg-gray-50/10 flex justify-end">
                            <button
                                onClick={() => setSelectedRFQ(null)}
                                className="bg-gray-900 text-white font-black px-10 py-4 rounded-2xl hover:bg-primary transition-all"
                            >
                                Dismiss Report
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RFQManagement;
