import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, ClipboardList, ShieldCheck, FileText, Filter, Link as LinkIcon, X, CheckCircle, Plus, Trash2, ArrowLeftRight, Edit2 } from 'lucide-react';

export const ProductModal = ({
    isOpen,
    onClose,
    formData,
    setFormData,
    categories,
    editingProduct,
    handleSubmit,
    productVendors,
    onOpenVendorModal,
    onRemoveVendor
}: any) => {
    const [activeTab, setActiveTab] = useState('basic');

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-8">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    onClick={onClose}
                />
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="bg-white w-full max-w-6xl rounded-[32px] shadow-2xl overflow-hidden flex flex-col relative z-20 h-[90vh] border border-gray-100"
                >
                    <div className="flex-shrink-0 p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-2xl bg-black text-white flex items-center justify-center shadow-lg">
                                <Package className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-3xl font-black text-gray-900 tracking-tight">
                                    {editingProduct ? 'Edit Asset Profile' : 'Onboard New Asset'}
                                </h3>
                                <p className="text-gray-500 font-medium mt-1 text-sm">
                                    Configure asset specifications, pricing, and marketplace visibility
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-3 bg-white hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-xl shadow-sm border border-gray-100 transition-all focus:outline-none"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="flex-grow flex overflow-hidden">
                        <div className="w-72 bg-gray-50/50 border-r border-gray-100 flex-shrink-0 p-6 space-y-2 overflow-y-auto">
                            {[
                                { id: 'basic', label: 'Basic Info', icon: Package },
                                { id: 'pricing', label: 'Pricing & Variants', icon: ClipboardList },
                                { id: 'technical', label: 'Technical Details', icon: ShieldCheck },
                                { id: 'media', label: 'Media & Docs', icon: FileText },
                                { id: 'settings', label: 'Visibility Setup', icon: Filter },
                                ...(editingProduct ? [{ id: 'vendors', label: 'Vendor Ecosystem', icon: LinkIcon }] : [])
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-left font-bold transition-all ${activeTab === tab.id
                                        ? 'bg-black text-white shadow-xl shadow-black/10'
                                        : 'text-gray-500 hover:bg-gray-100/80 hover:text-gray-900'
                                        }`}
                                >
                                    <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-red-500' : 'text-gray-400'}`} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <form id="product-form" onSubmit={handleSubmit} className="flex-grow p-10 overflow-y-auto bg-white custom-scrollbar w-full">
                            {activeTab === 'basic' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300 max-w-3xl">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-2">Asset Designation *</label>
                                        <input
                                            required
                                            type="text"
                                            placeholder="e.g. Bio-CNG High-Pressure Compressor"
                                            className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all text-gray-900 font-medium"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-2">Structural Category *</label>
                                        <select
                                            required
                                            className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all text-gray-900 font-medium"
                                            value={formData.category_id}
                                            onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                        >
                                            <option value="">Select Domain</option>
                                            {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-2">Purchase Architecture</label>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {[
                                                { id: 'rfq', name: 'RFQ Only', icon: ClipboardList },
                                                { id: 'direct', name: 'Direct Buy', icon: CheckCircle },
                                                { id: 'both', name: 'Hybrid: Direct + RFQ', icon: ArrowLeftRight }
                                            ].map((model) => (
                                                <div
                                                    key={model.id}
                                                    onClick={() => setFormData({ ...formData, purchase_model: model.id })}
                                                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center gap-3 text-center ${formData.purchase_model === model.id
                                                        ? 'border-red-600 bg-red-50 text-red-700'
                                                        : 'border-gray-100 bg-white hover:border-gray-300 text-gray-500 hover:text-gray-900'
                                                        }`}
                                                >
                                                    <model.icon className={`w-6 h-6 ${formData.purchase_model === model.id ? 'text-red-600' : 'text-gray-400'}`} />
                                                    <span className="font-bold text-sm">{model.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-2">Technical Overview</label>
                                        <textarea
                                            rows={6}
                                            className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all font-medium text-gray-900 resize-none"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="Describe the asset's engineering highlights, certification scope, and operational parameters..."
                                        ></textarea>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'pricing' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300 max-w-4xl">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-2">Base Price (INR) *</label>
                                        <div className="relative">
                                            <span className="absolute left-5 top-1/2 -translate-y-1/2 font-bold text-gray-400">₹</span>
                                            <input
                                                required
                                                type="number"
                                                step="0.01"
                                                placeholder="0.00"
                                                className="w-full pl-10 pr-5 py-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all text-gray-900 font-medium"
                                                value={formData.price}
                                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <label className="block text-sm font-bold text-gray-900">Product Variants</label>
                                            <button
                                                type="button"
                                                onClick={() => setFormData({
                                                    ...formData,
                                                    variants: [...(formData.variants || []), { id: crypto.randomUUID(), attributes: {}, price: parseFloat(formData.price || '0'), stock: 0 }]
                                                })}
                                                className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-black hover:text-white rounded-lg text-sm font-bold transition-all flex items-center gap-2"
                                            >
                                                <Plus className="w-4 h-4" /> Add Variant
                                            </button>
                                        </div>

                                        <div className="space-y-4">
                                            {(formData.variants || []).map((v: any, idx: number) => (
                                                <div key={v.id} className="p-6 bg-gray-50 border border-gray-200 rounded-2xl relative group">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const variants = formData.variants.filter((_: any, i: number) => i !== idx);
                                                            setFormData({ ...formData, variants });
                                                        }}
                                                        className="absolute top-4 right-4 p-2 bg-white text-gray-400 hover:text-red-600 rounded-lg shadow-sm border border-gray-100 transition-colors opacity-0 group-hover:opacity-100"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                                        <div>
                                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Price Adjustment</label>
                                                            <input
                                                                type="number"
                                                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                                                                value={v.price}
                                                                onChange={(e) => {
                                                                    const variants = [...formData.variants];
                                                                    variants[idx].price = parseFloat(e.target.value);
                                                                    setFormData({ ...formData, variants });
                                                                }}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Stock Level</label>
                                                            <input
                                                                type="number"
                                                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                                                                value={v.stock}
                                                                onChange={(e) => {
                                                                    const variants = [...formData.variants];
                                                                    variants[idx].stock = parseInt(e.target.value);
                                                                    setFormData({ ...formData, variants });
                                                                }}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-3">Specifications</label>
                                                        <div className="flex flex-wrap gap-2">
                                                            {Object.entries(v.attributes || {}).map(([key, val]: [string, any]) => (
                                                                <span key={key} className="px-3 py-1.5 bg-black text-white rounded-lg text-xs font-medium flex items-center gap-2">
                                                                    {key}: {val}
                                                                    <button type="button" onClick={() => {
                                                                        const variants = [...formData.variants];
                                                                        const newAttrs = { ...variants[idx].attributes };
                                                                        delete newAttrs[key];
                                                                        variants[idx].attributes = newAttrs;
                                                                        setFormData({ ...formData, variants });
                                                                    }} className="hover:text-red-400"><X className="w-3 h-3" /></button>
                                                                </span>
                                                            ))}
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const k = prompt('Specification Name (e.g. Size)?');
                                                                    if (!k) return;
                                                                    const v_attr = prompt('Value (e.g. Large)?');
                                                                    if (k && v_attr) {
                                                                        const variants = [...formData.variants];
                                                                        variants[idx].attributes = { ...variants[idx].attributes, [k]: v_attr };
                                                                        setFormData({ ...formData, variants });
                                                                    }
                                                                }}
                                                                className="px-4 py-1.5 border-2 border-dashed border-gray-300 rounded-lg text-xs font-bold text-gray-500 hover:border-black hover:text-black transition-all"
                                                            >
                                                                + Add Spec
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            {(!formData.variants || formData.variants.length === 0) && (
                                                <div className="p-8 text-center border-2 border-dashed border-gray-200 rounded-2xl">
                                                    <p className="text-gray-500 font-medium">No variants added yet. Use variants for different technical specs or dimensions.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'technical' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300 max-w-4xl">
                                    {(formData.purchase_model === 'rfq' || formData.purchase_model === 'both') ? (
                                        <div>
                                            <div className="flex items-center justify-between mb-4">
                                                <div>
                                                    <label className="block text-sm font-bold text-gray-900">RFQ Protocol Fields</label>
                                                    <p className="text-xs text-gray-500 mt-1">Information users must provide when requesting a quote.</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({
                                                        ...formData,
                                                        min_rfq_fields: [...formData.min_rfq_fields, { label: '', type: 'text', required: true, placeholder: '' }]
                                                    })}
                                                    className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-black hover:text-white rounded-lg text-sm font-bold transition-all flex items-center gap-2"
                                                >
                                                    <Plus className="w-4 h-4" /> Add Field
                                                </button>
                                            </div>

                                            <div className="space-y-4">
                                                {formData.min_rfq_fields.map((field: any, idx: number) => (
                                                    <div key={idx} className="flex flex-col md:flex-row gap-4 p-5 bg-gray-50 border border-gray-200 rounded-2xl items-center relative group">
                                                        <input
                                                            placeholder="Field Label (e.g. Desired Capacity)"
                                                            className="flex-grow px-4 py-3 bg-white border border-gray-200 rounded-lg outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 text-sm font-bold"
                                                            value={field.label}
                                                            onChange={(e) => {
                                                                const fields = [...formData.min_rfq_fields];
                                                                fields[idx].label = e.target.value;
                                                                setFormData({ ...formData, min_rfq_fields: fields });
                                                            }}
                                                        />
                                                        <select
                                                            className="w-40 px-4 py-3 bg-white border border-gray-200 rounded-lg outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 text-sm font-bold"
                                                            value={field.type}
                                                            onChange={(e) => {
                                                                const fields = [...formData.min_rfq_fields];
                                                                fields[idx].type = e.target.value;
                                                                setFormData({ ...formData, min_rfq_fields: fields });
                                                            }}
                                                        >
                                                            <option value="text">Short Text</option>
                                                            <option value="number">Number</option>
                                                            <option value="textarea">Long Text</option>
                                                        </select>
                                                        <label className="flex items-center gap-2 cursor-pointer bg-white px-4 py-3 border border-gray-200 rounded-lg shrink-0">
                                                            <input
                                                                type="checkbox"
                                                                className="w-4 h-4 rounded text-red-600 focus:ring-red-500 border-gray-300"
                                                                checked={field.required}
                                                                onChange={(e) => {
                                                                    const fields = [...formData.min_rfq_fields];
                                                                    fields[idx].required = e.target.checked;
                                                                    setFormData({ ...formData, min_rfq_fields: fields });
                                                                }}
                                                            />
                                                            <span className="text-xs font-bold text-gray-700">Required</span>
                                                        </label>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const fields = formData.min_rfq_fields.filter((_: any, i: number) => i !== idx);
                                                                setFormData({ ...formData, min_rfq_fields: fields });
                                                            }}
                                                            className="p-3 text-gray-400 hover:text-red-500 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-red-100"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                ))}
                                                {formData.min_rfq_fields.length === 0 && (
                                                    <div className="p-8 text-center border-2 border-dashed border-gray-200 rounded-2xl">
                                                        <p className="text-gray-500 font-medium">No RFQ fields configured. Add fields to collect specific technical requirements from buyers.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-10 text-center bg-gray-50 rounded-3xl border border-gray-200">
                                            <ShieldCheck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                            <h4 className="text-lg font-bold text-gray-900 mb-2">Technical RFQ Disabled</h4>
                                            <p className="text-gray-500 text-sm max-w-md mx-auto">This asset is configured for Direct Buy only. To customize RFQ fields, change the Purchase Architecture to Hybrid or RFQ Only in the Basic Info tab.</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'media' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300 max-w-3xl">
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-900">Technical Documents</label>
                                                <p className="text-xs text-gray-500 mt-1">Manuals, Certifications, and Specifications</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setFormData({
                                                    ...formData,
                                                    documents: [...(formData.documents || []), { name: '', url: '' }]
                                                })}
                                                className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-black hover:text-white rounded-lg text-sm font-bold transition-all flex items-center gap-2"
                                            >
                                                <Plus className="w-4 h-4" /> Add Document
                                            </button>
                                        </div>

                                        <div className="space-y-4">
                                            {(formData.documents || []).map((doc: any, idx: number) => (
                                                <div key={idx} className="flex flex-col md:flex-row gap-4 p-5 bg-gray-50 border border-gray-200 rounded-2xl items-center">
                                                    <div className="relative flex-grow">
                                                        <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                        <input
                                                            placeholder="Doc Title (e.g. CE Certification)"
                                                            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-lg outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 text-sm font-bold"
                                                            value={doc.name}
                                                            onChange={(e) => {
                                                                const docs = [...formData.documents];
                                                                docs[idx].name = e.target.value;
                                                                setFormData({ ...formData, documents: docs });
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="relative flex-grow">
                                                        <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                        <input
                                                            placeholder="Cloud URL"
                                                            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-lg outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 text-sm font-medium"
                                                            value={doc.url}
                                                            onChange={(e) => {
                                                                const docs = [...formData.documents];
                                                                docs[idx].url = e.target.value;
                                                                setFormData({ ...formData, documents: docs });
                                                            }}
                                                        />
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const docs = formData.documents.filter((_: any, i: number) => i !== idx);
                                                            setFormData({ ...formData, documents: docs });
                                                        }}
                                                        className="p-3 text-gray-400 hover:text-red-500 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-red-100 shrink-0"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            ))}
                                            {(!formData.documents || formData.documents.length === 0) && (
                                                <div className="p-8 text-center border-2 border-dashed border-gray-200 rounded-2xl">
                                                    <p className="text-gray-500 font-medium">No documents uploaded.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'settings' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300 max-w-2xl">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-2">Visibility Status</label>
                                        <select
                                            className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all text-gray-900 font-bold"
                                            value={formData.visibility_status}
                                            onChange={(e) => setFormData({ ...formData, visibility_status: e.target.value })}
                                        >
                                            <option value="published">Domain: PUBLIC (LIVE)</option>
                                            <option value="hidden">Domain: HIDDEN (VAULTED)</option>
                                            <option value="draft">Domain: INTERNAL (PLANNING)</option>
                                        </select>
                                        <p className="text-xs text-gray-500 mt-2">Public assets are visible to all users. Hidden assets are unsearchable.</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-2">Marketplace Display Order</label>
                                        <input
                                            type="number"
                                            className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all text-gray-900 font-bold"
                                            value={formData.order_index}
                                            onChange={(e) => setFormData({ ...formData, order_index: e.target.value })}
                                        />
                                        <p className="text-xs text-gray-500 mt-2">Lower numbers appear first in the categories.</p>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'vendors' && editingProduct && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300 max-w-4xl">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-900">Authorized Vendors</label>
                                            <p className="text-xs text-gray-500 mt-1">Manage vendor-specific pricing and stock for this asset.</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => onOpenVendorModal()}
                                            className="px-5 py-2.5 bg-black hover:bg-gray-800 text-white rounded-xl text-sm font-bold transition-all shadow-md flex items-center gap-2"
                                        >
                                            <Plus className="w-4 h-4" /> Add Vendor
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        {productVendors.map((pv: any) => (
                                            <div key={pv.vendor_id} className="p-6 bg-white border border-gray-200 rounded-2xl hover:border-gray-300 transition-all group shadow-sm flex items-center justify-between">
                                                <div>
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <span className="font-extrabold text-gray-900 text-lg">{pv.profiles?.company_name || 'Vendor'}</span>
                                                        {pv.is_primary && (
                                                            <span className="text-[10px] font-black bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full uppercase tracking-widest">Primary</span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-6 mt-3">
                                                        {pv.vendor_sku && (
                                                            <div className="flex flex-col"><span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">SKU</span> <span className="text-sm font-bold text-gray-700">{pv.vendor_sku}</span></div>
                                                        )}
                                                        {pv.vendor_price && (
                                                            <div className="flex flex-col"><span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Price</span> <span className="text-sm font-extrabold text-gray-900">₹{parseFloat(pv.vendor_price).toLocaleString()}</span></div>
                                                        )}
                                                        {pv.vendor_stock_quantity !== null && pv.vendor_stock_quantity !== undefined && (
                                                            <div className="flex flex-col"><span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Stock</span> <span className="text-sm font-bold text-gray-700">{pv.vendor_stock_quantity}</span></div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => onOpenVendorModal(pv)}
                                                        className="p-3 text-gray-400 hover:text-black hover:bg-gray-100 rounded-xl transition-all border border-transparent hover:border-gray-200"
                                                    >
                                                        <Edit2 className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => onRemoveVendor(pv.vendor_id)}
                                                        className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        {productVendors.length === 0 && (
                                            <div className="p-10 text-center border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50/50">
                                                <LinkIcon className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                                                <h4 className="text-base font-bold text-gray-900 mb-1">No Vendors Assigned</h4>
                                                <p className="text-gray-500 text-sm">Customers cannot buy this asset until a vendor provides stock and pricing.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </form>
                    </div>

                    <div className="flex-shrink-0 p-6 bg-white border-t border-gray-100 flex justify-end gap-4 relative z-30">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-8 py-3.5 text-sm font-bold text-gray-600 hover:text-gray-900 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all shadow-sm"
                        >
                            Cancel
                        </button>
                        <button
                            form="product-form"
                            type="submit"
                            className="px-10 py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-600/20 transition-all flex items-center gap-3 active:scale-95"
                        >
                            <CheckCircle className="w-5 h-5" />
                            <span>{editingProduct ? 'Save Changes' : 'Create Asset'}</span>
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
