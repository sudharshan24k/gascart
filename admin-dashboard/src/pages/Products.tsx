import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    X,
    CheckCircle,
    Package,
    ClipboardList,
    ArrowUpDown,
    Building2,
    Loader2
} from 'lucide-react';
import {
    fetchAdminProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    fetchCategories,
    fetchVendors,
    fetchProductVendors,
    assignVendorToProduct,
    removeVendorFromProduct
} from '../services/admin.service';

const AdminProducts = () => {
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [vendors, setVendors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [productVendors, setProductVendors] = useState<any[]>([]);
    const [vendorsLoading, setVendorsLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        category_id: '',
        price: '',
        stock_quantity: '',
        description: '',
        visibility_status: 'published',
        purchase_model: 'rfq',
        order_index: '0',
        images: [] as string[],
        attributes: {} as any,
        min_rfq_fields: [] as any[],
        variants: [] as any[]
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [pData, cData, vData] = await Promise.all([
                fetchAdminProducts(),
                fetchCategories(),
                fetchVendors()
            ]);
            setProducts(pData);
            setCategories(cData);
            setVendors(vData || []);
        } catch (err) {
            console.error('Failed to load products', err);
        } finally {
            setLoading(false);
        }
    };

    const loadProductVendors = async (productId: string) => {
        setVendorsLoading(true);
        try {
            const data = await fetchProductVendors(productId);
            setProductVendors(data || []);
        } catch (err) {
            console.error('Failed to load product vendors', err);
            setProductVendors([]);
        } finally {
            setVendorsLoading(false);
        }
    };

    const handleAssignVendor = async (vendorId: string) => {
        if (!editingProduct) return;
        try {
            await assignVendorToProduct(editingProduct.id, vendorId);
            await loadProductVendors(editingProduct.id);
        } catch (err) {
            console.error('Failed to assign vendor', err);
            alert('Failed to assign vendor. It may already be assigned.');
        }
    };

    const handleRemoveVendor = async (vendorId: string) => {
        if (!editingProduct) return;
        try {
            await removeVendorFromProduct(editingProduct.id, vendorId);
            await loadProductVendors(editingProduct.id);
        } catch (err) {
            console.error('Failed to remove vendor', err);
        }
    };

    const handleOpenModal = async (product: any = null) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                name: product.name,
                category_id: product.category_id || '',
                price: product.price.toString(),
                stock_quantity: (product.stock_quantity || 0).toString(),
                description: product.description || '',
                visibility_status: product.visibility_status || 'published',
                purchase_model: product.purchase_model || 'rfq',
                order_index: (product.order_index || 0).toString(),
                images: product.images || [],
                attributes: product.attributes || {},
                min_rfq_fields: product.min_rfq_fields || [],
                variants: product.variants || []
            });
            loadProductVendors(product.id);
        } else {
            setEditingProduct(null);
            setProductVendors([]);
            setFormData({
                name: '',
                category_id: '',
                price: '',
                stock_quantity: '0',
                description: '',
                visibility_status: 'published',
                purchase_model: 'rfq',
                order_index: '0',
                images: [],
                attributes: {},
                min_rfq_fields: [],
                variants: []
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                price: parseFloat(formData.price),
                stock_quantity: parseInt(formData.stock_quantity),
                order_index: parseInt(formData.order_index),
                slug: formData.name.toLowerCase().replace(/ /g, '-')
            };

            if (editingProduct) {
                await updateProduct(editingProduct.id, payload);
            } else {
                await addProduct(payload);
            }
            setIsModalOpen(false);
            loadData();
        } catch (err) {
            console.error('Failed to save product', err);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this industrial asset? This action is permanent.')) {
            try {
                await deleteProduct(id);
                loadData();
            } catch (err) {
                console.error('Failed to delete product', err);
            }
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 leading-tight">Industrial Inventory</h2>
                    <p className="text-gray-500 mt-1 font-medium">Control marketplace visibility, technical specs, and purchase models</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-2xl flex items-center gap-3 font-black shadow-xl shadow-primary/20 transition-all transform hover:-translate-y-1"
                >
                    <Plus className="w-5 h-5" />
                    <span>Onboard Asset</span>
                </button>
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 mb-10 flex flex-col md:flex-row gap-6">
                <div className="relative flex-grow">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search assets by name or ID..."
                        className="w-full pl-14 pr-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-4">
                    <button className="px-6 py-4 bg-gray-50 hover:bg-gray-100 rounded-2xl font-bold text-gray-700 transition-all flex items-center gap-2">
                        <ArrowUpDown className="w-4 h-4" /> Sort Order
                    </button>
                </div>
            </div>

            {/* Product Table */}
            <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 text-gray-400 text-[10px] font-black uppercase tracking-widest border-b border-gray-100">
                                <th className="py-6 px-10">Asset Details</th>
                                <th className="py-6 px-10">Purchase Model</th>
                                <th className="py-6 px-10">Financials</th>
                                <th className="py-6 px-10">Visibility</th>
                                <th className="py-6 px-10 text-right">Operations</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                [1, 2, 3].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="py-10 px-10"><div className="h-6 bg-gray-100 rounded-xl w-full"></div></td>
                                    </tr>
                                ))
                            ) : filteredProducts.map((product) => (
                                <tr key={product.id} className="hover:bg-gray-50/30 transition-colors group">
                                    <td className="py-8 px-10">
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center shrink-0 border border-gray-100 overflow-hidden group-hover:bg-white transition-colors">
                                                {product.images?.[0] ? (
                                                    <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <Package className="w-8 h-8 text-gray-300" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900 text-lg mb-1">{product.name}</div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[10px] font-black bg-gray-100 text-gray-500 px-2 py-0.5 rounded uppercase tracking-tighter">
                                                        {product.categories?.name || 'Uncategorized'}
                                                    </span>
                                                    <span className="text-[10px] font-medium text-gray-400">Order: {product.order_index}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-8 px-10">
                                        {product.purchase_model === 'rfq' ? (
                                            <span className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                                <ClipboardList className="w-4 h-4 text-primary" /> Technical RFQ Only
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2 text-sm font-bold text-gray-900">
                                                <CheckCircle className="w-4 h-4 text-green-500" /> Direct Buy Ready
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-8 px-10">
                                        <div className="flex flex-col">
                                            <span className="text-lg font-bold text-gray-900">${parseFloat(product.price).toLocaleString()}</span>
                                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Stock: {product.stock_quantity} units</span>
                                        </div>
                                    </td>
                                    <td className="py-8 px-10">
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tight ${product.visibility_status === 'published' ? 'bg-green-50 text-green-600' :
                                            product.visibility_status === 'draft' ? 'bg-amber-50 text-amber-600' : 'bg-gray-100 text-gray-500'
                                            }`}>
                                            {product.visibility_status || (product.is_active ? 'published' : 'hidden')}
                                        </span>
                                    </td>
                                    <td className="py-8 px-10 text-right">
                                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleOpenModal(product)}
                                                className="p-3 text-gray-400 hover:text-primary hover:bg-white rounded-xl shadow-sm transition-all"
                                            >
                                                <Edit2 className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product.id)}
                                                className="p-3 text-gray-400 hover:text-red-500 hover:bg-white rounded-xl shadow-sm transition-all"
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

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 lg:p-12">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm shadow-inner" onClick={() => setIsModalOpen(false)} />
                    <div className="bg-white w-full max-w-5xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col relative z-20 max-h-[90vh]">
                        <div className="p-10 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h3 className="text-3xl font-bold text-gray-900 leading-tight">Asset Technical Profiling</h3>
                                <p className="text-gray-500 font-medium">Compliance with Section 7.1 visibility and model controls</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-white rounded-2xl shadow-sm transition-all">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-12 overflow-y-auto space-y-12">
                            <div className="grid grid-cols-3 gap-10">
                                {/* Basic Info */}
                                <div className="col-span-3 lg:col-span-2 space-y-8">
                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="col-span-2">
                                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Asset Designation (Name)</label>
                                            <input
                                                required
                                                type="text"
                                                className="w-full px-6 py-5 bg-gray-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 transition-all text-lg font-bold"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Structural Category</label>
                                            <select
                                                required
                                                className="w-full px-6 py-5 bg-gray-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold"
                                                value={formData.category_id}
                                                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                            >
                                                <option value="">Select Domain</option>
                                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Ex-Works Price ($)</label>
                                            <input
                                                required
                                                type="number"
                                                step="0.01"
                                                className="w-full px-6 py-5 bg-gray-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold"
                                                value={formData.price}
                                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Technical Overview & Description</label>
                                        <textarea
                                            rows={6}
                                            className="w-full px-8 py-8 bg-gray-50 border-none rounded-[32px] outline-none focus:ring-4 focus:ring-primary/5 transition-all font-medium text-lg resize-none leading-relaxed"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="Detailed engineering specifications..."
                                        ></textarea>
                                    </div>
                                </div>

                                {/* Controls */}
                                <div className="col-span-3 lg:col-span-1 space-y-8">
                                    <div className="bg-gray-50 p-8 rounded-[32px] border border-gray-100 space-y-8">
                                        <div>
                                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Purchase Architecture</label>
                                            <div className="grid gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, purchase_model: 'rfq' })}
                                                    className={`w-full p-4 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-3 transition-all ${formData.purchase_model === 'rfq' ? 'bg-primary text-white shadow-lg' : 'bg-white text-gray-400 border border-gray-100'}`}
                                                >
                                                    <ClipboardList className="w-4 h-4" /> RFQ Enquiry Flow
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, purchase_model: 'direct' })}
                                                    className={`w-full p-4 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-3 transition-all ${formData.purchase_model === 'direct' ? 'bg-green-600 text-white shadow-lg' : 'bg-white text-gray-400 border border-gray-100'}`}
                                                >
                                                    <CheckCircle className="w-4 h-4" /> Direct Commerce
                                                </button>
                                            </div>
                                        </div>

                                        {formData.purchase_model === 'rfq' && (
                                            <div className="pt-4 border-t border-gray-100">
                                                <div className="flex justify-between items-center mb-4">
                                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">RFQ Fields</label>
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData({
                                                            ...formData,
                                                            min_rfq_fields: [...formData.min_rfq_fields, { label: '', type: 'text', required: true, placeholder: '' }]
                                                        })}
                                                        className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-white transition-all"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                                                    {formData.min_rfq_fields.map((field, idx) => (
                                                        <div key={idx} className="p-4 bg-white rounded-xl border border-gray-100 relative group">
                                                            <input
                                                                placeholder="Field Label"
                                                                className="w-full text-xs font-bold mb-2 outline-none border-b border-gray-100 focus:border-primary"
                                                                value={field.label}
                                                                onChange={(e) => {
                                                                    const fields = [...formData.min_rfq_fields];
                                                                    fields[idx].label = e.target.value;
                                                                    setFormData({ ...formData, min_rfq_fields: fields });
                                                                }}
                                                            />
                                                            <div className="flex gap-2">
                                                                <select
                                                                    className="text-[10px] font-bold bg-gray-50 rounded p-1 flex-grow outline-none"
                                                                    value={field.type}
                                                                    onChange={(e) => {
                                                                        const fields = [...formData.min_rfq_fields];
                                                                        fields[idx].type = e.target.value;
                                                                        setFormData({ ...formData, min_rfq_fields: fields });
                                                                    }}
                                                                >
                                                                    <option value="text">Text</option>
                                                                    <option value="number">Number</option>
                                                                    <option value="select">Select</option>
                                                                    <option value="textarea">Textarea</option>
                                                                </select>
                                                                <label className="flex items-center gap-1 cursor-pointer">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={field.required}
                                                                        onChange={(e) => {
                                                                            const fields = [...formData.min_rfq_fields];
                                                                            fields[idx].required = e.target.checked;
                                                                            setFormData({ ...formData, min_rfq_fields: fields });
                                                                        }}
                                                                        className="w-3 h-3 rounded text-primary"
                                                                    />
                                                                    <span className="text-[10px] font-black text-gray-400 uppercase">Req</span>
                                                                </label>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const fields = formData.min_rfq_fields.filter((_, i) => i !== idx);
                                                                    setFormData({ ...formData, min_rfq_fields: fields });
                                                                }}
                                                                className="absolute -top-2 -right-2 p-1 bg-white text-red-500 rounded-full shadow-sm border border-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                <Trash2 className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div>
                                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Visibility Status</label>
                                            <select
                                                className="w-full px-6 py-4 bg-white border border-gray-100 rounded-xl outline-none font-bold"
                                                value={formData.visibility_status}
                                                onChange={(e) => setFormData({ ...formData, visibility_status: e.target.value })}
                                            >
                                                <option value="published">Public (Live)</option>
                                                <option value="hidden">Hidden (Archived)</option>
                                                <option value="draft">Draft (internal Only)</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Display Order Index</label>
                                            <input
                                                type="number"
                                                className="w-full px-6 py-4 bg-white border border-gray-100 rounded-xl outline-none font-bold"
                                                value={formData.order_index}
                                                onChange={(e) => setFormData({ ...formData, order_index: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    {/* Variants Management Section */}
                                    <div className="bg-white p-8 rounded-[32px] border border-gray-100 space-y-6">
                                        <div className="flex justify-between items-center">
                                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">Product Variants</label>
                                            <button
                                                type="button"
                                                onClick={() => setFormData({
                                                    ...formData,
                                                    variants: [...(formData.variants || []), { id: crypto.randomUUID(), attributes: {}, price: parseFloat(formData.price || '0'), stock: 0 }]
                                                })}
                                                className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-white transition-all"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                                            {(formData.variants || []).map((v: any, idx: number) => (
                                                <div key={v.id} className="p-6 bg-gray-50 rounded-2xl border border-gray-100 relative group space-y-4">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Variant Price ($)</label>
                                                            <input
                                                                type="number"
                                                                className="w-full px-4 py-2 bg-white rounded-lg text-sm font-bold"
                                                                value={v.price}
                                                                onChange={(e) => {
                                                                    const variants = [...formData.variants];
                                                                    variants[idx].price = parseFloat(e.target.value);
                                                                    setFormData({ ...formData, variants });
                                                                }}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Stock</label>
                                                            <input
                                                                type="number"
                                                                className="w-full px-4 py-2 bg-white rounded-lg text-sm font-bold"
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
                                                        <div className="flex justify-between items-center mb-2">
                                                            <label className="block text-[10px] font-black text-gray-400 uppercase">Attributes (e.g. Power: 20kW)</label>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const variants = [...formData.variants];
                                                                    const attrKey = prompt('Attribute Name (e.g. Size, Power, Material)');
                                                                    if (attrKey) {
                                                                        const attrVal = prompt(`Value for ${attrKey}`);
                                                                        variants[idx].attributes = { ...variants[idx].attributes, [attrKey]: attrVal };
                                                                        setFormData({ ...formData, variants });
                                                                    }
                                                                }}
                                                                className="text-[10px] font-bold text-primary hover:underline"
                                                            >
                                                                + Add Attribute
                                                            </button>
                                                        </div>
                                                        <div className="flex flex-wrap gap-2">
                                                            {Object.entries(v.attributes || {}).map(([key, val]: [string, any]) => (
                                                                <span key={key} className="px-3 py-1 bg-white border border-gray-100 rounded-lg text-[10px] font-bold flex items-center gap-2">
                                                                    {key}: {val}
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            const variants = [...formData.variants];
                                                                            const newAttrs = { ...variants[idx].attributes };
                                                                            delete newAttrs[key];
                                                                            variants[idx].attributes = newAttrs;
                                                                            setFormData({ ...formData, variants });
                                                                        }}
                                                                        className="text-gray-300 hover:text-red-500"
                                                                    >
                                                                        <X className="w-3 h-3" />
                                                                    </button>
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const variants = formData.variants.filter((_: any, i: number) => i !== idx);
                                                            setFormData({ ...formData, variants });
                                                        }}
                                                        className="absolute -top-2 -right-2 p-1.5 bg-white text-red-500 rounded-full shadow-md border border-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Vendor Assignment Section - Only show when editing */}
                            {editingProduct && (
                                <div className="bg-gray-50 p-8 rounded-[32px] border border-gray-100">
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                                <Building2 className="w-5 h-5 text-primary" />
                                                Assigned Vendors
                                            </h4>
                                            <p className="text-xs text-gray-500 mt-1">Multiple vendors can supply this product</p>
                                        </div>
                                        <span className="text-xs font-black text-primary bg-primary/10 px-3 py-1 rounded-full">
                                            {productVendors.length} Vendors
                                        </span>
                                    </div>

                                    {vendorsLoading ? (
                                        <div className="flex items-center justify-center py-8">
                                            <Loader2 className="w-6 h-6 text-primary animate-spin" />
                                        </div>
                                    ) : (
                                        <>
                                            {/* Current Vendors */}
                                            {productVendors.length > 0 && (
                                                <div className="mb-6">
                                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Current Vendors</label>
                                                    <div className="flex flex-wrap gap-2">
                                                        {productVendors.map((pv: any) => (
                                                            <span
                                                                key={pv.vendor_id}
                                                                className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-sm font-bold text-gray-700 flex items-center gap-2 group"
                                                            >
                                                                <Building2 className="w-4 h-4 text-gray-400" />
                                                                {pv.profiles?.company_name || pv.profiles?.full_name || 'Unknown Vendor'}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRemoveVendor(pv.vendor_id)}
                                                                    className="text-gray-300 hover:text-red-500 transition-colors"
                                                                >
                                                                    <X className="w-4 h-4" />
                                                                </button>
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Add Vendor */}
                                            <div>
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Add Vendor</label>
                                                <select
                                                    className="w-full px-6 py-4 bg-white border border-gray-100 rounded-xl outline-none font-bold"
                                                    value=""
                                                    onChange={(e) => {
                                                        if (e.target.value) {
                                                            handleAssignVendor(e.target.value);
                                                            e.target.value = '';
                                                        }
                                                    }}
                                                >
                                                    <option value="">Select a vendor to add...</option>
                                                    {vendors
                                                        .filter(v => v.visibility_status === 'active')
                                                        .filter(v => !productVendors.some((pv: any) => pv.vendor_id === v.id))
                                                        .map(v => (
                                                            <option key={v.id} value={v.id}>
                                                                {v.company_name || v.full_name || v.email}
                                                            </option>
                                                        ))
                                                    }
                                                </select>
                                                {vendors.filter(v => v.visibility_status === 'active').length === 0 && (
                                                    <p className="text-xs text-gray-400 mt-2">No active vendors available. Onboard vendors first.</p>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="w-full bg-primary hover:bg-primary-dark text-white font-black py-6 rounded-[24px] shadow-2xl shadow-primary/30 transform hover:-translate-y-1 transition-all text-xl"
                            >
                                {editingProduct ? 'Commit Engineering Updates' : 'Launch New Asset'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminProducts;
