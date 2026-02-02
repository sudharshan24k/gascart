import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, Check, Search, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';

interface ManageProductVendorsModalProps {
    productId: string;
    productName: string;
    onClose: () => void;
}

const ManageProductVendorsModal: React.FC<ManageProductVendorsModalProps> = ({ productId, productName, onClose }) => {
    const [vendors, setVendors] = useState<any[]>([]);
    const [existingAssociations, setExistingAssociations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Form state for adding/editing
    const [selectedVendorId, setSelectedVendorId] = useState('');
    const [vendorFormData, setVendorFormData] = useState({
        vendor_sku: '',
        vendor_price: '',
        vendor_stock_quantity: '0',
        vendor_lead_time_days: '',
        is_primary: false,
        is_active: true
    });

    useEffect(() => {
        loadData();
    }, [productId]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [vendorsRes, productVendorsRes] = await Promise.all([
                api.vendors.list('active'),
                api.vendors.getProductVendors(productId)
            ]);
            setVendors(vendorsRes.data || []);
            setExistingAssociations(productVendorsRes.data || []);
        } catch (err) {
            console.error('Failed to load data', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!selectedVendorId || !vendorFormData.vendor_price) return;

        setSaving(true);
        try {
            // Check if updates existing or adds new
            const exists = existingAssociations.find(a => a.vendor_id === selectedVendorId);

            const payload = {
                product_id: productId,
                vendor_id: selectedVendorId,
                vendor_sku: vendorFormData.vendor_sku,
                vendor_price: parseFloat(vendorFormData.vendor_price),
                vendor_stock_quantity: parseInt(vendorFormData.vendor_stock_quantity),
                vendor_lead_time_days: parseInt(vendorFormData.vendor_lead_time_days) || null,
                is_primary: vendorFormData.is_primary,
                is_active: vendorFormData.is_active
            };

            if (exists) {
                await api.vendors.updateProductVendor(productId, selectedVendorId, payload);
            } else {
                await api.vendors.assignProduct(payload);
            }

            await loadData();
            // Reset form
            setSelectedVendorId('');
            setVendorFormData({
                vendor_sku: '',
                vendor_price: '',
                vendor_stock_quantity: '0',
                vendor_lead_time_days: '',
                is_primary: false,
                is_active: true
            });
        } catch (err: any) {
            alert('Failed to save: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleRemove = async (vendorId: string) => {
        if (!window.confirm('Are you sure you want to remove this vendor from the product?')) return;
        try {
            await api.vendors.removeProductVendor(productId, vendorId);
            loadData();
        } catch (err: any) {
            alert('Failed to remove: ' + err.message);
        }
    };

    const handleSelectForEdit = (association: any) => {
        setSelectedVendorId(association.vendor_id);
        setVendorFormData({
            vendor_sku: association.vendor_sku || '',
            vendor_price: association.vendor_price.toString(),
            vendor_stock_quantity: association.vendor_stock_quantity.toString(),
            vendor_lead_time_days: association.vendor_lead_time_days?.toString() || '',
            is_primary: association.is_primary,
            is_active: association.is_active
        });
    };

    const availableVendors = vendors.filter(v =>
        !existingAssociations.find(a => a.vendor_id === v.id) || v.id === selectedVendorId
    ).filter(v =>
        v.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">Manage Vendors</h3>
                        <p className="text-gray-500 text-sm">For {productName}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 grid lg:grid-cols-2 gap-8">
                    {/* Left: Input Form */}
                    <div className="space-y-6">
                        <h4 className="font-bold text-gray-900 flex items-center gap-2">
                            <Save className="w-4 h-4 text-primary" />
                            {existingAssociations.find(a => a.vendor_id === selectedVendorId) ? 'Edit Vendor Details' : 'Assign New Vendor'}
                        </h4>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Select Vendor</label>
                                <div className="relative mb-2">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Filter list..."
                                        className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <select
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                                    value={selectedVendorId}
                                    onChange={(e) => {
                                        setSelectedVendorId(e.target.value);
                                        // Reset form values if switching to a new vendor not in edit mode
                                        const existing = existingAssociations.find(a => a.vendor_id === e.target.value);
                                        if (existing) {
                                            handleSelectForEdit(existing);
                                        }
                                    }}
                                >
                                    <option value="">-- Choose a Vendor --</option>
                                    {availableVendors.map(v => (
                                        <option key={v.id} value={v.id}>
                                            {v.company_name} ({v.full_name})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Price (₹)</label>
                                    <input
                                        type="number"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                                        value={vendorFormData.vendor_price}
                                        onChange={(e) => setVendorFormData({ ...vendorFormData, vendor_price: e.target.value })}
                                        placeholder="0.00"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Stock</label>
                                    <input
                                        type="number"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                                        value={vendorFormData.vendor_stock_quantity}
                                        onChange={(e) => setVendorFormData({ ...vendorFormData, vendor_stock_quantity: e.target.value })}
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">SKU</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                                        value={vendorFormData.vendor_sku}
                                        onChange={(e) => setVendorFormData({ ...vendorFormData, vendor_sku: e.target.value })}
                                        placeholder="Optional"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Lead Time (Days)</label>
                                    <input
                                        type="number"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                                        value={vendorFormData.vendor_lead_time_days}
                                        onChange={(e) => setVendorFormData({ ...vendorFormData, vendor_lead_time_days: e.target.value })}
                                        placeholder="Days"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 pt-2">
                                <label className="flex items-center gap-3 cursor-pointer p-3 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors">
                                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${vendorFormData.is_primary ? 'bg-primary border-primary text-white' : 'border-gray-300 bg-white'}`}>
                                        {vendorFormData.is_primary && <Check className="w-3 h-3" />}
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={vendorFormData.is_primary}
                                        onChange={(e) => setVendorFormData({ ...vendorFormData, is_primary: e.target.checked })}
                                    />
                                    <span className="font-bold text-gray-700 text-sm">Primary Vendor (Default for Sales)</span>
                                </label>

                                <label className="flex items-center gap-3 cursor-pointer p-3 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors">
                                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${vendorFormData.is_active ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 bg-white'}`}>
                                        {vendorFormData.is_active && <Check className="w-3 h-3" />}
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={vendorFormData.is_active}
                                        onChange={(e) => setVendorFormData({ ...vendorFormData, is_active: e.target.checked })}
                                    />
                                    <span className="font-bold text-gray-700 text-sm">Active (Listed)</span>
                                </label>
                            </div>

                            <button
                                onClick={handleSave}
                                disabled={saving || !selectedVendorId}
                                className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving ? 'Saving...' : 'Save Vendor Mapping'}
                            </button>
                        </div>
                    </div>

                    {/* Right: Existing List */}
                    <div className="space-y-6">
                        <h4 className="font-bold text-gray-900 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-gray-400" />
                            Current Vendors ({existingAssociations.length})
                        </h4>

                        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 h-[400px] overflow-y-auto">
                            {loading ? (
                                <div className="text-center py-10 text-gray-400">Loading...</div>
                            ) : existingAssociations.length === 0 ? (
                                <div className="text-center py-10 text-gray-400">No vendors assigned yet.</div>
                            ) : (
                                <div className="space-y-3">
                                    {existingAssociations.map((assoc) => (
                                        <div
                                            key={assoc.vendor_id}
                                            className={`bg-white p-4 rounded-xl shadow-sm border border-gray-100 cursor-pointer transition-all hover:shadow-md ${selectedVendorId === assoc.vendor_id ? 'ring-2 ring-primary ring-inset' : ''
                                                }`}
                                            onClick={() => handleSelectForEdit(assoc)}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h5 className="font-bold text-gray-900">{assoc.profiles?.company_name}</h5>
                                                    <div className="text-xs text-gray-400">{assoc.profiles?.email}</div>
                                                </div>
                                                <div className="flex gap-2">
                                                    {assoc.is_primary && (
                                                        <span className="bg-primary/10 text-primary text-[10px] uppercase font-black px-2 py-1 rounded-md">Primary</span>
                                                    )}
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleRemove(assoc.vendor_id); }}
                                                        className="text-red-400 hover:text-red-600 p-1"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Price:</span>
                                                    <span className="font-bold">₹{assoc.vendor_price}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Stock:</span>
                                                    <span className="font-bold">{assoc.vendor_stock_quantity}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Listed:</span>
                                                    <span className={`font-bold ${assoc.is_active ? 'text-green-600' : 'text-red-500'}`}>
                                                        {assoc.is_active ? 'Yes' : 'No'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageProductVendorsModal;
