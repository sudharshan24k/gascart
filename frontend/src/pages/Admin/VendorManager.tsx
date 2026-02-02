import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Mail, Phone, User } from 'lucide-react';
import { api } from '../../services/api';

const VendorManager: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'enquiries' | 'vendors'>('enquiries');
    const [enquiries, setEnquiries] = useState<any[]>([]);
    const [vendors, setVendors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        setLoading(true);
        setError('');
        try {
            if (activeTab === 'enquiries') {
                const res = await api.vendors.getEnquiries();
                setEnquiries(res.data || []);
            } else {
                const res = await api.vendors.list();
                setVendors(res.data || []);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateEnquiryStatus = async (id: string, status: string) => {
        try {
            await api.vendors.updateEnquiryStatus(id, status);
            loadData();
        } catch (err: any) {
            alert('Failed to update status: ' + err.message);
        }
    };

    const handleToggleVendorStatus = async (vendor: any) => {
        try {
            const newStatus = vendor.visibility_status === 'active' ? 'inactive' : 'active';
            await api.vendors.update(vendor.id, { visibility_status: newStatus });
            loadData();
        } catch (err: any) {
            alert('Failed to update vendor: ' + err.message);
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-6">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Vendor Management</h1>
                <p className="text-gray-500">Manage vendor applications and active partners</p>
            </header>

            <div className="flex gap-4 mb-8">
                <button
                    onClick={() => setActiveTab('enquiries')}
                    className={`px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'enquiries'
                        ? 'bg-primary text-white shadow-lg shadow-primary/20'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                >
                    Vendor Enquiries
                </button>
                <button
                    onClick={() => setActiveTab('vendors')}
                    className={`px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'vendors'
                        ? 'bg-primary text-white shadow-lg shadow-primary/20'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                >
                    Active Vendors
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : error ? (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl">{error}</div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-500 text-sm font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="p-6">Company</th>
                                    <th className="p-6">Contact</th>
                                    <th className="p-6">Status</th>
                                    <th className="p-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {activeTab === 'enquiries' ? (
                                    enquiries.map((enquiry) => (
                                        <tr key={enquiry.id} className="hover:bg-gray-50/50">
                                            <td className="p-6">
                                                <div className="font-bold text-gray-900">{enquiry.company_name}</div>
                                                <div className="text-sm text-gray-400">{enquiry.business_type}</div>
                                                <div className="text-sm text-gray-400 mt-1 max-w-xs truncate">{enquiry.message}</div>
                                            </td>
                                            <td className="p-6">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <User className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm font-medium">{enquiry.contact_person}</span>
                                                </div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Mail className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm text-gray-500">{enquiry.email}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Phone className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm text-gray-500">{enquiry.phone}</span>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${enquiry.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                    enquiry.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                        'bg-amber-100 text-amber-700'
                                                    }`}>
                                                    {enquiry.status}
                                                </span>
                                            </td>
                                            <td className="p-6 text-right">
                                                {enquiry.status === 'pending' && (
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => handleUpdateEnquiryStatus(enquiry.id, 'approved')}
                                                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors border border-green-200"
                                                            title="Approve"
                                                        >
                                                            <CheckCircle className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleUpdateEnquiryStatus(enquiry.id, 'rejected')}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
                                                            title="Reject"
                                                        >
                                                            <XCircle className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    vendors.map((vendor) => (
                                        <tr key={vendor.id} className="hover:bg-gray-50/50">
                                            <td className="p-6">
                                                <div className="font-bold text-gray-900">{vendor.company_name || 'N/A'}</div>
                                                <div className="text-xs font-mono text-gray-400 mt-1">{vendor.id}</div>
                                            </td>
                                            <td className="p-6">
                                                <div className="font-medium text-gray-900">{vendor.full_name}</div>
                                                <div className="text-sm text-gray-500">{vendor.email}</div>
                                            </td>
                                            <td className="p-6">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide cursor-pointer hover:opacity-80 transition-opacity ${vendor.visibility_status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                                    }`} onClick={() => handleToggleVendorStatus(vendor)}>
                                                    {vendor.visibility_status || 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="p-6 text-right">
                                                <button
                                                    onClick={() => handleToggleVendorStatus(vendor)}
                                                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${vendor.visibility_status === 'active'
                                                        ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                                        : 'bg-green-50 text-green-600 hover:bg-green-100'
                                                        }`}
                                                >
                                                    {vendor.visibility_status === 'active' ? 'Deactivate' : 'Activate'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                                {(activeTab === 'enquiries' && enquiries.length === 0) || (activeTab === 'vendors' && vendors.length === 0) ? (
                                    <tr>
                                        <td colSpan={4} className="p-12 text-center text-gray-500">
                                            No {activeTab} found.
                                        </td>
                                    </tr>
                                ) : null}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VendorManager;
