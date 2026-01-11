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
    AlertCircle,
    Check
} from 'lucide-react';
import {
    fetchVendors,
    fetchVendorEnquiries,
    updateVendorEnquiryStatus,
    createVendor,
    updateVendor,
    deleteVendor
} from '../../services/admin.service';

const VendorManagement = () => {
    const [vendors, setVendors] = useState<any[]>([]);
    const [enquiries, setEnquiries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showEnquiries, setShowEnquiries] = useState(false);
    const [editingVendor, setEditingVendor] = useState<any>(null);
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

    const handleOpenModal = (vendor: any = null) => {
        if (vendor) {
            setEditingVendor(vendor);
            setFormData({
                email: vendor.email || '',
                full_name: vendor.full_name || '',
                company_name: vendor.company_name || '',
                certifications: vendor.certifications || [],
                visibility_status: vendor.visibility_status || 'inactive'
            });
        } else {
            setEditingVendor(null);
            setFormData({
                email: '',
                full_name: '',
                company_name: '',
                certifications: [],
                visibility_status: 'inactive'
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingVendor) {
                await updateVendor(editingVendor.id, formData);
            } else {
                await createVendor(formData);
            }
            setIsModalOpen(false);
            loadData();
        } catch (err) {
            console.error('Failed to save vendor', err);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Remove this vendor from the platform? This action cannot be undone.')) {
            try {
                await deleteVendor(id);
                loadData();
            } catch (err) {
                console.error('Failed to delete vendor', err);
            }
        }
    };

    const handleEnquiryAction = async (id: string, newStatus: string) => {
        try {
            await updateVendorEnquiryStatus(id, newStatus);
            loadData();
        } catch (err) {
            alert('Failed to update enquiry');
        }
    };

    const filteredVendors = vendors.filter(v =>
        v.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const pendingEnquiries = enquiries.filter(e => e.status === 'pending');

    return (
        <div className="max-w-7xl mx-auto pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 leading-tight">Vendor Ecosystem Control</h2>
                    <p className="text-gray-500 mt-1 font-medium">Curated industrial supplier network managed by GASCART</p>
                </div>
                <div className="flex gap-4">
                    {pendingEnquiries.length > 0 && (
                        <button
                            onClick={() => setShowEnquiries(true)}
                            className="relative bg-amber-50 border-2 border-amber-200 text-amber-700 font-black px-8 py-4 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center gap-3"
                        >
                            <FileCheck className="w-5 h-5" />
                            Review Enquiries
                            <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs font-black w-7 h-7 rounded-full flex items-center justify-center">
                                {pendingEnquiries.length}
                            </span>
                        </button>
                    )}
                    <button
                        onClick={() => handleOpenModal()}
                        className="bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-2xl flex items-center gap-3 font-black shadow-xl shadow-primary/20 transition-all transform hover:-translate-y-1"
                    >
                        <Plus className="w-5 h-5" />
                        Onboard Vendor
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {[
                    { label: 'Active Partners', count: vendors.filter(v => v.visibility_status === 'active').length, color: 'text-green-600', bg: 'bg-green-50', icon: ShieldCheck },
                    { label: 'Pending Clearance', count: pendingEnquiries.length, color: 'text-amber-600', bg: 'bg-amber-50', icon: AlertCircle },
                    { label: 'Total Onboarded', count: vendors.length, color: 'text-blue-600', bg: 'bg-blue-50', icon: Building2 }
                ].map((stat, i) => (
                    <div key={i} className={`p-8 rounded-[32px] border border-gray-100 bg-white flex items-center gap-6 shadow-sm`}>
                        <div className={`p-4 rounded-2xl ${stat.bg}`}>
                            <stat.icon className={`w-8 h-8 ${stat.color}`} />
                        </div>
                        <div>
                            <p className="text-3xl font-black text-gray-900 leading-none">{stat.count}</p>
                            <p className="text-xs font-bold text-gray-400 uppercase mt-2 tracking-widest">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Vendor List */}
            <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-8 border-b border-gray-50 flex gap-6">
                    <div className="relative flex-grow">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by company or primary contact..."
                            className="w-full pl-14 pr-6 py-5 bg-gray-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 font-bold shadow-inner"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-gray-50">
                                <th className="py-6 px-10">Entity Identification</th>
                                <th className="py-6 px-10">Primary Contact</th>
                                <th className="py-6 px-10 text-center">Visibility Control</th>
                                <th className="py-6 px-10 text-right">Operations</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredVendors.map(vendor => (
                                <tr key={vendor.id} className="hover:bg-gray-50/30 transition-colors group">
                                    <td className="py-8 px-10">
                                        <div className="flex items-center gap-5">
                                            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center shrink-0 border border-gray-100">
                                                <Building2 className="w-7 h-7 text-gray-400" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900 text-lg leading-tight">{vendor.company_name || vendor.full_name || 'Unnamed Entity'}</div>
                                                <div className="text-[10px] font-black text-primary uppercase tracking-tighter mt-1 flex items-center gap-1">
                                                    ID: {vendor.id.split('-')[0]}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-8 px-10">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2 text-sm text-gray-600 font-bold">
                                                <Mail className="w-3.5 h-3.5" /> {vendor.email}
                                            </div>
                                            <div className="text-xs text-gray-400 font-medium">{vendor.full_name}</div>
                                        </div>
                                    </td>
                                    <td className="py-8 px-10">
                                        <div className="flex justify-center">
                                            <select
                                                value={vendor.visibility_status}
                                                onChange={(e) => updateVendor(vendor.id, { ...vendor, visibility_status: e.target.value }).then(() => loadData())}
                                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tight border-none outline-none focus:ring-4 focus:ring-primary/5 cursor-pointer ${vendor.visibility_status === 'active' ? 'bg-green-50 text-green-600' :
                                                        vendor.visibility_status === 'inactive' ? 'bg-gray-50 text-gray-600' : 'bg-red-50 text-red-600'
                                                    }`}
                                            >
                                                <option value="active">Active (Public)</option>
                                                <option value="inactive">Inactive</option>
                                                <option value="hidden">Hidden</option>
                                            </select>
                                        </div>
                                    </td>
                                    <td className="py-8 px-10 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleOpenModal(vendor)}
                                                className="p-3 bg-white text-gray-400 hover:text-primary rounded-xl shadow-sm border border-gray-50 transition-all"
                                            >
                                                <Edit2 className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(vendor.id)}
                                                className="p-3 bg-white text-gray-400 hover:text-red-500 rounded-xl shadow-sm border border-gray-50 transition-all"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Vendor Form Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}>
                    <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden relative z-20" onClick={e => e.stopPropagation()}>
                        <div className="p-10 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                            <div>
                                <h3 className="text-3xl font-black text-gray-900">{editingVendor ? 'Update Vendor Profile' : 'Onboard New Vendor'}</h3>
                                <p className="text-gray-500 font-medium text-sm mt-1">Manual verification required</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-full transition-all">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-10 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="col-span-2">
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Company Name</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 font-bold"
                                        value={formData.company_name}
                                        onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Contact Person</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 font-bold"
                                        value={formData.full_name}
                                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Email</label>
                                    <input
                                        required
                                        type="email"
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 font-bold"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Visibility Status</label>
                                    <select
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 font-bold"
                                        value={formData.visibility_status}
                                        onChange={(e) => setFormData({ ...formData, visibility_status: e.target.value })}
                                    >
                                        <option value="active">Active (Public Marketplace)</option>
                                        <option value="inactive">Inactive (Not Visible)</option>
                                        <option value="hidden">Hidden (Internal Only)</option>
                                    </select>
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-primary hover:bg-primary-dark text-white font-black py-5 rounded-2xl shadow-xl hover:shadow-2xl transition-all"
                            >
                                {editingVendor ? 'Save Changes' : 'Create Vendor Profile'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Enquiry Modal */}
            {showEnquiries && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowEnquiries(false)}>
                    <div className="bg-white w-full max-w-4xl rounded-[40px] shadow-2xl overflow-hidden relative z-20 max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="p-10 border-b border-gray-50 bg-gray-50/30">
                            <h3 className="text-3xl font-black text-gray-900">Vendor Enquiry Inbox</h3>
                            <p className="text-gray-500 font-medium text-sm mt-1">{pendingEnquiries.length} pending approval</p>
                        </div>
                        <div className="p-10 overflow-y-auto space-y-6">
                            {enquiries.filter(e => e.status === 'pending').map(enquiry => (
                                <div key={enquiry.id} className="p-8 bg-gray-50 rounded-[32px] border border-gray-100">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h4 className="text-2xl font-black text-gray-900">{enquiry.company_name}</h4>
                                            <p className="text-gray-500 font-bold mt-1">{enquiry.contact_person} • {enquiry.email}</p>
                                        </div>
                                        <span className="px-4 py-1 bg-amber-100 text-amber-600 rounded-full text-xs font-black uppercase">Pending</span>
                                    </div>
                                    {enquiry.message && (
                                        <p className="text-gray-600 mb-6 bg-white p-6 rounded-2xl">{enquiry.message}</p>
                                    )}
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleEnquiryAction(enquiry.id, 'approved')}
                                            className="flex-1 bg-green-600 text-white font-black py-4 rounded-2xl hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                                        >
                                            <Check className="w-5 h-5" /> Approve & Notify
                                        </button>
                                        <button
                                            onClick={() => handleEnquiryAction(enquiry.id, 'rejected')}
                                            className="flex-1 bg-red-600 text-white font-black py-4 rounded-2xl hover:bg-red-700 transition-all"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VendorManagement;
