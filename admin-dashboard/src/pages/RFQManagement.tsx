import React, { useEffect, useState } from 'react';
import { fetchRFQs, updateAdminRFQStatus } from '../services/admin.service';
import { ClipboardList, Download, CheckCircle2, Clock, Search, Filter, MoreVertical, FileText } from 'lucide-react';

const RFQManagement: React.FC = () => {
    const [rfqs, setRfqs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadRFQs();
    }, []);

    const loadRFQs = async () => {
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
            loadRFQs(); // Refresh
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const handleExport = () => {
        const headers = ["ID", "User", "Product", "Status", "Date", "Details"];
        const csvContent = [
            headers.join(","),
            ...rfqs.map(r => [
                r.id,
                r.profiles?.email,
                r.products?.name,
                r.status,
                new Date(r.created_at).toLocaleDateString(),
                JSON.stringify(r.submitted_fields).replace(/,/g, ";")
            ].join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `gascart_rfqs_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredRFQs = rfqs.filter(r =>
        r.products?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.profiles?.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">Technical Enquiries (RFQs)</h2>
                    <p className="text-gray-500 mt-1">Manage project-specific industrial quotes and leads.</p>
                </div>
                <button
                    onClick={handleExport}
                    className="flex items-center gap-2 bg-white text-gray-700 font-bold px-6 py-3 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all"
                >
                    <Download className="w-5 h-5 text-primary" />
                    Export to CSV
                </button>
            </div>

            <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row gap-6">
                    <div className="flex-grow relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by product or user email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-primary/10 transition-all font-medium"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-8 py-4 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all font-bold text-gray-700">
                        <Filter className="w-5 h-5" /> All Status
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Enquiry Info</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Lead Details</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Date</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredRFQs.map((rfq) => (
                                <tr key={rfq.id} className="hover:bg-gray-50/30 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-900 mb-1">{rfq.products?.name}</span>
                                            <span className="text-xs text-gray-400 font-medium">{rfq.profiles?.email}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight ${rfq.status === 'pending' ? 'bg-amber-100 text-amber-600' :
                                                rfq.status === 'processing' ? 'bg-blue-100 text-blue-600' :
                                                    rfq.status === 'replied' ? 'bg-green-100 text-green-600' :
                                                        'bg-gray-100 text-gray-600'
                                            }`}>
                                            {rfq.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="max-w-xs truncate text-xs text-gray-500 font-medium font-sans">
                                            {JSON.stringify(rfq.submitted_fields)}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-sm text-gray-400 font-bold">
                                        {new Date(rfq.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <select
                                                onChange={(e) => handleStatusUpdate(rfq.id, e.target.value)}
                                                value={rfq.status}
                                                className="text-xs font-bold border-none bg-gray-100 py-1 pl-3 pr-8 rounded-lg outline-none focus:ring-2 focus:ring-primary/20"
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="processing">Processing</option>
                                                <option value="replied">Replied</option>
                                                <option value="closed">Closed</option>
                                            </select>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredRFQs.length === 0 && !loading && (
                    <div className="py-20 text-center text-gray-400">
                        <ClipboardList className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p className="font-bold">No technical enquiries found</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RFQManagement;
