import React, { useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { fetchRFQs, updateAdminRFQStatus, downloadRFQs, downloadRFQsPDF } from '../services/admin.service';
import { ClipboardList, Download, Search, Mail, Eye, User, Building2, X, Layers, Component, Calendar, FileText, ChevronDown } from 'lucide-react';
import { formatDateIST } from '../utils/dateUtils';

const RFQManagement: React.FC = () => {
    const [rfqs, setRfqs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedRFQ, setSelectedRFQ] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'itemized' | 'project'>('itemized');
    const [exportDropdown, setExportDropdown] = useState(false);
    const [exporting, setExporting] = useState(false);

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

    const handleBulkStatusUpdate = async (enquiryId: string, newStatus: string) => {
        const itemsToUpdate = rfqs.filter(r => r.submitted_fields?.enquiry_id === enquiryId);
        try {
            setLoading(true);
            await Promise.all(itemsToUpdate.map(item => updateAdminRFQStatus(item.id, newStatus)));
            await loadRFQs();
        } catch (err) {
            alert('Failed to update bulk status');
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async (format: 'csv' | 'pdf' = 'csv') => {
        setExporting(true);
        setExportDropdown(false);
        try {
            const data = format === 'csv' ? await downloadRFQs() : await downloadRFQsPDF();
            const blob = new Blob([data], { type: format === 'csv' ? 'text/csv' : 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const extension = format === 'csv' ? 'csv' : 'pdf';
            const filename = format === 'csv' ? `gascart_rfqs_${new Date().toISOString().split('T')[0]}.${extension}` : `gascart_technical_report_${new Date().toISOString().split('T')[0]}.${extension}`;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Export failed', err);
            alert('Export failed. Please check if there are any technical enquiries to export.');
        } finally {
            setExporting(false);
        }
    };

    const filteredRFQs = useMemo(() => {
        return (rfqs || []).filter(r => {
            const term = searchTerm.toLowerCase().replace(/^#/, '');
            const matchesSearch = term === '' || 
                r.products?.name?.toLowerCase().includes(term) ||
                r.profiles?.email?.toLowerCase().includes(term) ||
                r.profiles?.full_name?.toLowerCase().includes(term) ||
                r.profiles?.company_name?.toLowerCase().includes(term) ||
                r.submitted_fields?.enquiry_id?.toLowerCase().includes(term);
            const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
            return matchesStatus && matchesSearch;
        });
    }, [rfqs, searchTerm, statusFilter]);

    const projectEnquiries = useMemo(() => {
        const groups: Record<string, any> = {};
        rfqs.forEach(rfq => {
            const eid = rfq.submitted_fields?.enquiry_id;
            if (eid) {
                if (!groups[eid]) {
                    groups[eid] = {
                        enquiry_id: eid,
                        items: [],
                        product_names: [], // Store unique product names
                        user: rfq.profiles,
                        created_at: rfq.created_at,
                        status: rfq.status,
                        company: rfq.profiles?.company_name || rfq.submitted_fields?.company_name || 'N/A'
                    };
                }
                groups[eid].items.push(rfq);
                if (rfq.products?.name && !groups[eid].product_names.includes(rfq.products.name)) {
                    groups[eid].product_names.push(rfq.products.name);
                }
            }
        });
        
        return Object.values(groups)
            .filter((g: any) => {
                const term = searchTerm.toLowerCase().replace(/^#/, '');
                const matchesSearch = term === '' || 
                    g.enquiry_id.toLowerCase().includes(term) ||
                    g.user?.email?.toLowerCase().includes(term) ||
                    g.user?.full_name?.toLowerCase().includes(term) ||
                    g.company?.toLowerCase().includes(term);
                const matchesStatus = statusFilter === 'all' || g.status === statusFilter;
                return matchesStatus && matchesSearch;
            })
            .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }, [rfqs, searchTerm, statusFilter]);

    if (loading && rfqs.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">Technical Enquiries (RFQs)</h2>
                    <p className="text-gray-500 mt-1 font-medium italic">Manage engineering-led leads and project requisitions.</p>
                </div>
                <div className="relative">
                    <div className="flex items-center shadow-xl shadow-gray-200/50 rounded-2xl overflow-hidden border-2 border-gray-100 group">
                        <button
                            onClick={() => handleExport('csv')}
                            disabled={exporting}
                            className="flex items-center gap-2 bg-white text-gray-900 font-extrabold px-6 py-4 hover:bg-gray-50 transition-all border-r border-gray-100 disabled:opacity-50"
                        >
                            {exporting ? (
                                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <Download className="w-5 h-5 text-primary" />
                            )}
                            Export CSV
                        </button>
                        <button 
                            onClick={() => setExportDropdown(!exportDropdown)}
                            className="bg-white px-3 py-4 hover:bg-gray-50 transition-all text-gray-400 hover:text-primary"
                        >
                            <ChevronDown className={`w-5 h-5 transition-transform ${exportDropdown ? 'rotate-180' : ''}`} />
                        </button>
                    </div>

                    {exportDropdown && (
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 py-3 z-[110] animate-in fade-in slide-in-from-top-2">
                             <button
                                onClick={() => handleExport('pdf')}
                                className="w-full flex items-center gap-3 px-6 py-3 text-sm font-bold text-gray-700 hover:bg-primary/5 hover:text-primary transition-all text-left"
                            >
                                <FileText className="w-4 h-4" />
                                Download Full Report (PDF)
                            </button>
                            <div className="my-2 border-t border-gray-50"></div>
                            <p className="px-6 py-2 text-[10px] uppercase font-black text-gray-300 tracking-widest">Advanced Options</p>
                            <button
                                onClick={() => handleExport('csv')}
                                className="w-full flex items-center gap-3 px-6 py-3 text-sm font-bold text-gray-700 hover:bg-primary/5 hover:text-primary transition-all text-left"
                            >
                                <Download className="w-4 h-4" />
                                Export Raw Data (CSV)
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-4 mb-8 p-1.5 bg-gray-100/50 rounded-2xl w-fit">
                <button
                    onClick={() => setActiveTab('itemized')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'itemized' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <Component className="w-4 h-4" />
                    Itemized Requests
                </button>
                <button
                    onClick={() => setActiveTab('project')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'project' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <Layers className="w-4 h-4" />
                    Project Enquiries (Bulk)
                    {projectEnquiries.length > 0 && (
                        <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full ml-1">
                            {projectEnquiries.length}
                        </span>
                    )}
                </button>
            </div>

            <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden min-h-[600px] flex flex-col">
                <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row gap-6 bg-gray-50/30">
                    <div className="flex-grow relative">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by ID, asset or customer..."
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
                        <option value="completed">Completed</option>
                        <option value="rejected">Rejected</option>
                        <option value="closed">Closed (Legacy)</option>
                    </select>
                </div>

                <div className="overflow-x-auto flex-grow">
                    {activeTab === 'itemized' ? (
                        <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-gray-50">
                                <th className="px-10 py-6">Requisition Asset</th>
                                <th className="px-10 py-6">Enquiry ID</th>
                                <th className="px-10 py-6 text-center">Protocol Status</th>
                                <th className="px-10 py-6">Preferred Vendor</th>
                                <th className="px-10 py-6">Technical Payload</th>
                                <th className="px-10 py-6">Timestamp</th>
                                <th className="px-10 py-6 text-right"
                                    style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', color: '#a78bfa', borderRadius: '0 12px 0 0' }}
                                >
                                    ⚙️ Operations
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredRFQs.map((rfq) => (
                                <tr key={rfq.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-10 py-8">
                                        <div className="flex flex-col">
                                            <span className="font-black text-gray-900 text-lg group-hover:text-primary transition-colors">{rfq.products?.name || 'Unknown Product'}</span>
                                            <div className="mt-2 space-y-1">
                                                <span className="text-xs text-gray-600 font-bold flex items-center gap-1">
                                                    <User className="w-3 h-3 text-primary/40" /> {rfq.profiles?.full_name || 'Guest User'}
                                                </span>
                                                <span className="text-xs text-gray-400 font-bold flex items-center gap-1">
                                                    <Mail className="w-3 h-3 text-primary/40" /> {rfq.profiles?.email || 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <span className="font-mono font-black text-xs text-primary bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/20">
                                            {rfq.submitted_fields?.enquiry_id || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex justify-center">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.1em] border ${rfq.status === 'new' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                rfq.status === 'processing' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                    rfq.status === 'completed' ? 'bg-green-50 text-green-600 border-green-100' :
                                                        rfq.status === 'rejected' ? 'bg-red-50 text-red-600 border-red-100' :
                                                            'bg-gray-50 text-gray-400 border-gray-100'
                                                }`}>
                                                {rfq.status}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                            <Building2 className="w-4 h-4 text-gray-300" />
                                            {rfq.vendor?.company_name || 'Any Vendor'}
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
                                        {formatDateIST(rfq.created_at)}
                                    </td>
                                    <td className="px-6 py-8 text-right"
                                        style={{
                                            background: rfq.status === 'new' ? 'rgba(251,191,36,0.06)' :
                                                rfq.status === 'processing' ? 'rgba(59,130,246,0.06)' :
                                                    rfq.status === 'completed' ? 'rgba(16,185,129,0.06)' :
                                                        rfq.status === 'rejected' ? 'rgba(239,68,68,0.06)' :
                                                            'rgba(100,116,139,0.06)'
                                        }}
                                    >
                                        <div className="flex flex-col items-end gap-1">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Change Status</span>
                                            <select
                                                onChange={(e) => handleStatusUpdate(rfq.id, e.target.value)}
                                                value={rfq.status}
                                                className={`text-xs font-black py-2.5 pl-4 pr-8 rounded-xl outline-none transition-all appearance-none cursor-pointer border-2 ${rfq.status === 'new' ? 'bg-amber-50 border-amber-200 text-amber-700 focus:border-amber-400' :
                                                        rfq.status === 'processing' ? 'bg-blue-50 border-blue-200 text-blue-700 focus:border-blue-400' :
                                                            rfq.status === 'completed' ? 'bg-green-50 border-green-200 text-green-700 focus:border-green-400' :
                                                                rfq.status === 'rejected' ? 'bg-red-50 border-red-200 text-red-700 focus:border-red-400' :
                                                                    'bg-gray-50 border-gray-200 text-gray-500 focus:border-gray-400'
                                                    }`}
                                            >
                                                <option value="new">🟡 New</option>
                                                <option value="processing">In Progress</option>
                                                <option value="completed">Completed</option>
                                                <option value="rejected">Rejected</option>
                                                <option value="closed">Closed (Legacy)</option>
                                            </select>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-gray-50">
                                    <th className="px-10 py-6">Project / Enquiry ID</th>
                                    <th className="px-10 py-6">Customer Details</th>
                                    <th className="px-10 py-6 text-center">Items</th>
                                    <th className="px-10 py-6 text-center">Current Status</th>
                                    <th className="px-10 py-6">Timestamp</th>
                                    <th className="px-10 py-6 text-right"
                                        style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', color: '#a78bfa', borderRadius: '0 12px 0 0' }}
                                    >
                                        ⚙️ Operations
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {projectEnquiries.map((group) => (
                                    <tr key={group.enquiry_id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-10 py-8">
                                            <div className="flex flex-col">
                                                <span className="font-mono font-black text-lg text-primary bg-primary/5 px-4 py-2 rounded-2xl border-2 border-primary/10 w-fit">
                                                    #{group.enquiry_id}
                                                </span>
                                                <span className="mt-2 text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1">
                                                    <Layers className="w-3 h-3" /> Bulk Project Requisition
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex flex-col">
                                                <span className="font-black text-gray-900 group-hover:text-primary transition-colors">{group.company}</span>
                                                <div className="mt-1 flex items-center gap-2 text-xs font-bold text-gray-500">
                                                    <User className="w-3 h-3 text-primary/40" /> {group.user?.full_name || 'Guest'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex flex-col">
                                                <div className="flex flex-wrap gap-1.5 mb-2">
                                                    {group.product_names.slice(0, 2).map((name: string, idx: number) => (
                                                        <span key={idx} className="bg-gray-100 text-gray-700 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-gray-200 line-clamp-1 max-w-[150px]">
                                                            {name}
                                                        </span>
                                                    ))}
                                                    {group.product_names.length > 2 && (
                                                        <span className="bg-primary/5 text-primary text-[10px] font-black px-2.5 py-1 rounded-lg border border-primary/10">
                                                            + {group.product_names.length - 2} more
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-[10px] font-black uppercase text-gray-400 tracking-tighter">
                                                    Total {group.items.length} {group.items.length === 1 ? 'Product' : 'Products'} Requisitioned
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex justify-center">
                                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.1em] border ${group.status === 'new' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                    group.status === 'processing' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                        group.status === 'completed' ? 'bg-green-50 text-green-600 border-green-100' :
                                                            'bg-gray-50 text-gray-400 border-gray-100'
                                                    }`}>
                                                    {group.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 text-sm text-gray-400 font-black font-mono">
                                            {formatDateIST(group.created_at)}
                                        </td>
                                        <td className="px-6 py-8 text-right bg-primary/5">
                                            <div className="flex flex-col items-end gap-3">
                                                <button
                                                    onClick={() => setSelectedRFQ({ ...group.items[0], _isBulk: true, _bulkItems: group.items, _enquiryId: group.enquiry_id })}
                                                    className="flex items-center gap-2 bg-white text-primary font-black px-6 py-3 rounded-xl border-2 border-primary/20 shadow-sm hover:border-primary transition-all active:scale-95 text-xs"
                                                >
                                                    <Eye className="w-4 h-4" /> View Full Enquiry
                                                </button>
                                                <div className="flex flex-col items-end gap-1">
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Sync All Status</span>
                                                    <select
                                                        onChange={(e) => handleBulkStatusUpdate(group.enquiry_id, e.target.value)}
                                                        value={group.status}
                                                        className="text-[10px] font-black py-2 pl-3 pr-6 rounded-lg outline-none border border-gray-200 bg-white"
                                                    >
                                                        <option value="new">🟡 New</option>
                                                        <option value="processing">In Progress</option>
                                                        <option value="completed">Completed</option>
                                                        <option value="rejected">Rejected</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {((activeTab === 'itemized' && filteredRFQs.length === 0) || (activeTab === 'project' && projectEnquiries.length === 0)) && (
                        <div className="py-32 text-center text-gray-400 flex flex-col items-center">
                            <ClipboardList className="w-20 h-20 mb-6 opacity-5" />
                            <p className="font-black text-xl uppercase tracking-widest opacity-20">No active {activeTab === 'itemized' ? 'requests' : 'project enquiries'} found</p>
                        </div>
                    )}
                </div>
            </div>

            {selectedRFQ && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-900/60 backdrop-blur-sm shadow-inner" onClick={() => setSelectedRFQ(null)}>
                    <div className="bg-white w-full max-w-4xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col relative z-20 max-h-[90vh]" onClick={e => e.stopPropagation()} id="printable-report">
                        <div className="p-10 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                            <div>
                                <h3 className="text-3xl font-black text-gray-900 leading-tight">
                                    {selectedRFQ._isBulk ? 'Bulk Project Requisition Report' : 'Technical Spec Report'}
                                </h3>
                                <div className="flex items-center gap-3 mt-2">
                                    {!selectedRFQ._isBulk && <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Asset: {selectedRFQ.products?.name}</p>}
                                    {selectedRFQ._isBulk && <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Items: {selectedRFQ._bulkItems.length} Products</p>}
                                    <span className="w-1.5 h-1.5 bg-gray-300 rounded-full"></span>
                                    <p className="text-primary font-black uppercase text-[10px] tracking-widest">Enquiry ID: {selectedRFQ._enquiryId || selectedRFQ.submitted_fields?.enquiry_id || 'N/A'}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedRFQ(null)} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors no-print">
                                <X className="w-6 h-6 text-gray-500" />
                            </button>
                        </div>
                        
                        <div className="flex flex-col md:flex-row overflow-hidden flex-grow">
                            {/* Left Side: Contact Info */}
                            <div className="w-full md:w-80 bg-blue-50/30 p-8 border-r border-gray-100 overflow-y-auto print:bg-white">
                                <h4 className="text-xs font-black text-blue-900 mb-6 uppercase tracking-widest border-b border-blue-100 pb-2 flex items-center gap-2">
                                    <User className="w-4 h-4" /> Submitter Details
                                </h4>
                                <div className="space-y-6">
                                    <div><span className="block text-[9px] uppercase text-blue-400 mb-1 font-bold">Name</span><span className="font-bold text-blue-900">{selectedRFQ.profiles?.full_name || 'Guest User'}</span></div>
                                    <div><span className="block text-[9px] uppercase text-blue-400 mb-1 font-bold">Email</span><span className="font-bold text-blue-900 text-sm break-all">{selectedRFQ.profiles?.email || 'N/A'}</span></div>
                                    <div><span className="block text-[9px] uppercase text-blue-400 mb-1 font-bold">Phone</span><span className="font-bold text-blue-900">{selectedRFQ.profiles?.phone || 'Not Provided'}</span></div>
                                    <div><span className="block text-[9px] uppercase text-blue-400 mb-1 font-bold">Company</span><span className="font-bold text-blue-900">{selectedRFQ.profiles?.company_name || selectedRFQ.submitted_fields?.company_name || 'Not Provided'}</span></div>
                                    {!selectedRFQ._isBulk && <div><span className="block text-[9px] uppercase text-blue-400 mb-1 font-bold">Preferred Vendor</span><span className="font-bold text-blue-900">{selectedRFQ.vendor?.company_name || 'Any Vendor'}</span></div>}
                                    
                                    <div className="pt-6 border-t border-blue-100">
                                        <div className="bg-white p-4 rounded-2xl border border-blue-100">
                                            <span className="block text-[9px] uppercase text-blue-400 mb-2 font-bold">Submission Meta</span>
                                            <div className="flex items-center gap-2 text-blue-900 font-bold mb-1">
                                                <Calendar className="w-3 h-3" />
                                                <span className="text-[10px]">{formatDateIST(selectedRFQ.created_at)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Side: Technical Specs */}
                            <div className="flex-grow p-8 overflow-y-auto bg-white">
                                {selectedRFQ._isBulk ? (
                                    <div className="space-y-12">
                                        <h4 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                                            <Layers className="w-6 h-6 text-primary" />
                                            Enquired Products
                                        </h4>
                                        {selectedRFQ._bulkItems.map((item: any, idx: number) => (
                                            <div key={item.id} className="bg-gray-50/50 rounded-[32px] p-8 border border-gray-100 relative group hover:bg-white hover:shadow-xl hover:shadow-gray-200/50 transition-all">
                                                <span className="absolute -top-4 -left-4 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-black text-xs shadow-lg">
                                                    {idx + 1}
                                                </span>
                                                <div className="flex justify-between items-start mb-8">
                                                    <div>
                                                        <h5 className="text-2xl font-black text-gray-900 group-hover:text-primary transition-colors">{item.products?.name}</h5>
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <span className="px-3 py-1 bg-primary/5 text-primary text-[10px] font-black rounded-lg border border-primary/10">Quantity: {item.submitted_fields?.item_quantity || 1}</span>
                                                            <span className="px-3 py-1 bg-gray-100 text-gray-500 text-[10px] font-black rounded-lg border border-gray-200">Price Ref: ₹{Number(item.submitted_fields?.item_price || 0).toLocaleString()}</span>
                                                        </div>
                                                    </div>
                                                    <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm no-print">
                                                        <span className="block text-[8px] uppercase text-gray-400 font-black mb-1">Status</span>
                                                        <span className="text-[10px] font-black uppercase text-primary tracking-widest">{item.status}</span>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {Object.entries(item.submitted_fields || {}).map(([key, value]: [string, any]) => {
                                                        if (['enquiry_id', 'item_quantity', 'item_price', 'company_name', 'Company Name', 'Contact Person', 'Project Location'].includes(key)) return null;
                                                        return (
                                                            <div key={key} className="space-y-1 bg-white p-4 rounded-2xl border border-gray-100/50">
                                                                <label className="text-[8px] font-black text-primary uppercase tracking-widest">{key}</label>
                                                                <p className="text-sm font-bold text-gray-700">{String(value)}</p>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {Object.entries(selectedRFQ.submitted_fields || {}).map(([key, value]: [string, any]) => (
                                            <div key={key} className="space-y-1 bg-gray-50 p-6 rounded-3xl border border-gray-100">
                                                <label className="text-[10px] font-black text-primary uppercase tracking-widest">{key}</label>
                                                <p className="text-lg font-bold text-gray-700">{String(value)}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-8 border-t border-gray-50 bg-gray-50/10 flex justify-between items-center no-print">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                Report Generated on {new Date().toLocaleDateString()}
                            </p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => window.print()}
                                    className="bg-primary text-white font-black px-8 py-4 rounded-2xl hover:bg-primary-dark transition-all shadow-lg hover:shadow-primary/20 flex items-center gap-2"
                                >
                                    <FileText className="w-5 h-5" />
                                    Download PDF
                                </button>
                                <button
                                    onClick={() => setSelectedRFQ(null)}
                                    className="bg-gray-900 text-white font-black px-10 py-4 rounded-2xl hover:bg-primary transition-all shadow-lg hover:shadow-primary/20 active:scale-95"
                                >
                                    Dismiss Report
                                </button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default RFQManagement;
