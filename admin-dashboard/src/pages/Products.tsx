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
    Loader2,
    ArrowLeftRight,
    Filter,
    RotateCcw,
    ShieldCheck,
    Briefcase,
    FileText,
    Link as LinkIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        category: '',
        purchaseModel: '',
        visibility: '',
        stockStatus: '',
        minPrice: '',
        maxPrice: ''
    });

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
        variants: [] as any[],
        documents: [] as { name: string, url: string }[]
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
                variants: product.variants || [],
                documents: product.documents || []
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
                variants: [],
                documents: []
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

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.id.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory = !filters.category || p.category_id === filters.category;
        const matchesPurchaseModel = !filters.purchaseModel || p.purchase_model === filters.purchaseModel;
        const matchesVisibility = !filters.visibility ||
            (p.visibility_status || (p.is_active ? 'published' : 'hidden')) === filters.visibility;

        let matchesStock = true;
        if (filters.stockStatus === 'low') {
            matchesStock = p.stock_quantity > 0 && p.stock_quantity < 10;
        } else if (filters.stockStatus === 'out_of_stock') {
            matchesStock = p.stock_quantity === 0;
        }

        const matchesMinPrice = !filters.minPrice || parseFloat(p.price) >= parseFloat(filters.minPrice);
        const matchesMaxPrice = !filters.maxPrice || parseFloat(p.price) <= parseFloat(filters.maxPrice);

        return matchesSearch && matchesCategory && matchesPurchaseModel && matchesVisibility && matchesStock && matchesMinPrice && matchesMaxPrice;
    });

    const clearFilters = () => {
        setFilters({
            category: '',
            purchaseModel: '',
            visibility: '',
            stockStatus: '',
            minPrice: '',
            maxPrice: ''
        });
        setSearchQuery('');
    };

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

            {/* Advanced Filters Bar */}
            <div className="space-y-4 mb-10">
                <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6">
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
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`px-8 py-4 rounded-2xl font-bold transition-all flex items-center gap-3 ${showFilters ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-gray-50 hover:bg-gray-100 text-gray-700'}`}
                        >
                            <Filter className="w-5 h-5" />
                            <span>Filters</span>
                            {Object.values(filters).some(v => v !== '') && (
                                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                            )}
                        </button>
                        {(searchQuery || Object.values(filters).some(v => v !== '')) && (
                            <button
                                onClick={clearFilters}
                                className="px-6 py-4 bg-gray-50 hover:bg-red-50 text-red-600 rounded-2xl font-bold transition-all flex items-center gap-2"
                                title="Reset all"
                            >
                                <RotateCcw className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Expanded Filters Panel */}
                {showFilters && (
                    <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 animate-in fade-in slide-in-from-top-4 duration-300">
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Structural Category</label>
                            <select
                                className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-primary/5 transition-all font-bold text-sm"
                                value={filters.category}
                                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                            >
                                <option value="">All Categories</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Purchase Model</label>
                            <select
                                className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-primary/5 transition-all font-bold text-sm"
                                value={filters.purchaseModel}
                                onChange={(e) => setFilters({ ...filters, purchaseModel: e.target.value })}
                            >
                                <option value="">All Models</option>
                                <option value="rfq">Technical RFQ Only</option>
                                <option value="direct">Direct Buy Ready</option>
                                <option value="both">Direct + RFQ (Hybrid)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Visibility</label>
                            <select
                                className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-primary/5 transition-all font-bold text-sm"
                                value={filters.visibility}
                                onChange={(e) => setFilters({ ...filters, visibility: e.target.value })}
                            >
                                <option value="">All Visibility States</option>
                                <option value="published">Public (Live)</option>
                                <option value="hidden">Hidden (Archived)</option>
                                <option value="draft">Draft (Internal)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Inventory Status</label>
                            <select
                                className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-primary/5 transition-all font-bold text-sm"
                                value={filters.stockStatus}
                                onChange={(e) => setFilters({ ...filters, stockStatus: e.target.value })}
                            >
                                <option value="">All Stock Levels</option>
                                <option value="low">Low Stock (&lt; 10)</option>
                                <option value="out_of_stock">Out of Stock</option>
                            </select>
                        </div>
                        <div className="lg:col-span-2">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Price Range (₹)</label>
                            <div className="flex gap-4">
                                <input
                                    type="number"
                                    placeholder="Min Price"
                                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-primary/5 transition-all font-bold text-sm"
                                    value={filters.minPrice}
                                    onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                                />
                                <input
                                    type="number"
                                    placeholder="Max Price"
                                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-primary/5 transition-all font-bold text-sm"
                                    value={filters.maxPrice}
                                    onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                )}
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
                                        ) : product.purchase_model === 'both' ? (
                                            <span className="flex items-center gap-2 text-sm font-bold text-blue-600">
                                                <ArrowLeftRight className="w-4 h-4" /> Direct + RFQ
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2 text-sm font-bold text-gray-900">
                                                <CheckCircle className="w-4 h-4 text-green-500" /> Direct Buy Ready
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-8 px-10">
                                        <div className="flex flex-col">
                                            <span className="text-lg font-bold text-gray-900">₹{parseFloat(product.price).toLocaleString()}</span>
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
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-8">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-gray-900/40 backdrop-blur-md shadow-inner"
                            onClick={() => setIsModalOpen(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white w-full max-w-6xl rounded-[48px] shadow-2xl overflow-hidden flex flex-col relative z-20 max-h-[95vh] border border-white/20"
                        >
                            {/* Premium Header */}
                            <div className="relative p-12 border-b border-gray-100 flex justify-between items-center group">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-blue-500 to-emerald-500" />
                                <div className="flex items-center gap-8">
                                    <div className="w-20 h-20 rounded-[28px] bg-primary text-white flex items-center justify-center shadow-2xl shadow-primary/30 ring-8 ring-primary/5">
                                        <Package className="w-10 h-10" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-4xl font-black text-gray-900 tracking-tight">Asset Technical Profiling</h3>
                                            <ShieldCheck className="w-6 h-6 text-green-500" />
                                        </div>
                                        <p className="text-gray-400 font-bold mt-2 uppercase tracking-widest text-[11px] flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                            Marketplace visibility & model governance
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-4 bg-gray-50 hover:bg-white text-gray-400 hover:text-gray-900 rounded-[20px] shadow-sm transition-all hover:scale-110 active:scale-95 border border-transparent hover:border-gray-100"
                                >
                                    <X className="w-8 h-8" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto custom-scrollbar">
                                <div className="grid grid-cols-12 gap-0">
                                    {/* Main Content Pane */}
                                    <div className="col-span-12 lg:col-span-8 p-12 space-y-12">
                                        <div className="grid grid-cols-2 gap-10">
                                            <div className="col-span-2">
                                                <div className="flex items-center justify-between mb-4 px-1">
                                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Asset Designation</label>
                                                    <span className="text-[10px] text-primary font-bold">REQUIRED FIELD</span>
                                                </div>
                                                <div className="relative group">
                                                    <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                                                        <Package className="w-5 h-5 text-gray-300 group-focus-within:text-primary transition-colors" />
                                                    </div>
                                                    <input
                                                        required
                                                        type="text"
                                                        placeholder="e.g. Bio-CNG High-Pressure Compressor"
                                                        className="w-full pl-16 pr-6 py-6 bg-gray-50 border-2 border-transparent focus:border-primary/10 rounded-[24px] outline-none focus:ring-8 focus:ring-primary/5 transition-all text-xl font-bold shadow-inner"
                                                        value={formData.name}
                                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 px-1">Structural Category</label>
                                                <div className="relative group">
                                                    <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                                                        <Filter className="w-5 h-5 text-gray-300 group-focus-within:text-primary transition-colors" />
                                                    </div>
                                                    <select
                                                        required
                                                        className="w-full pl-16 pr-10 py-5 bg-gray-50 border-2 border-transparent focus:border-primary/10 rounded-[22px] outline-none focus:ring-8 focus:ring-primary/5 transition-all appearance-none font-bold text-gray-700 shadow-inner"
                                                        value={formData.category_id}
                                                        onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                                    >
                                                        <option value="">Select Domain</option>
                                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                                    </select>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 px-1">Base Price (INR)</label>
                                                <div className="relative group">
                                                    <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none font-bold text-gray-300 group-focus-within:text-primary transition-colors">₹</div>
                                                    <input
                                                        required
                                                        type="number"
                                                        step="0.01"
                                                        placeholder="0.00"
                                                        className="w-full pl-16 pr-6 py-5 bg-gray-50 border-2 border-transparent focus:border-primary/10 rounded-[22px] outline-none focus:ring-8 focus:ring-primary/5 transition-all font-bold text-gray-700 shadow-inner"
                                                        value={formData.price}
                                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 px-1">Technical Ecosystem Overview</label>
                                            <textarea
                                                rows={8}
                                                className="w-full px-10 py-10 bg-gray-50 border-2 border-transparent focus:border-primary/10 rounded-[40px] outline-none focus:ring-8 focus:ring-primary/5 transition-all font-medium text-lg resize-none leading-relaxed shadow-inner"
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                placeholder="Describe the asset's engineering highlights, certification scope, and operational parameters..."
                                            ></textarea>
                                        </div>

                                        <div className="grid grid-cols-2 gap-10">
                                            {/* Variants & Inventory Control */}
                                            <div className="col-span-2 space-y-6">
                                                <div className="flex items-center justify-between px-1">
                                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Product Variants</h4>
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData({
                                                            ...formData,
                                                            variants: [...(formData.variants || []), { id: crypto.randomUUID(), attributes: {}, price: parseFloat(formData.price || '0'), stock: 0 }]
                                                        })}
                                                        className="px-6 py-2 bg-primary/10 text-primary rounded-xl text-[10px] font-black uppercase hover:bg-primary hover:text-white transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                                                    >
                                                        + Add Variant
                                                    </button>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    {(formData.variants || []).map((v: any, idx: number) => (
                                                        <motion.div
                                                            key={v.id}
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm relative group overflow-hidden"
                                                        >
                                                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const variants = formData.variants.filter((_: any, i: number) => i !== idx);
                                                                        setFormData({ ...formData, variants });
                                                                    }}
                                                                    className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                                <div>
                                                                    <label className="block text-[9px] font-black text-gray-300 uppercase mb-2">Price Adjustment</label>
                                                                    <input
                                                                        type="number"
                                                                        className="w-full bg-gray-50 py-3 px-4 rounded-xl text-sm font-bold shadow-inner outline-none focus:ring-2 focus:ring-primary/10"
                                                                        value={v.price}
                                                                        onChange={(e) => {
                                                                            const variants = [...formData.variants];
                                                                            variants[idx].price = parseFloat(e.target.value);
                                                                            setFormData({ ...formData, variants });
                                                                        }}
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-[9px] font-black text-gray-300 uppercase mb-2">Stock Level</label>
                                                                    <input
                                                                        type="number"
                                                                        className="w-full bg-gray-50 py-3 px-4 rounded-xl text-sm font-bold shadow-inner outline-none focus:ring-2 focus:ring-primary/10"
                                                                        value={v.stock}
                                                                        onChange={(e) => {
                                                                            const variants = [...formData.variants];
                                                                            variants[idx].stock = parseInt(e.target.value);
                                                                            setFormData({ ...formData, variants });
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-wrap gap-2">
                                                                {Object.entries(v.attributes || {}).map(([key, val]: [string, any]) => (
                                                                    <span key={key} className="px-3 py-1 bg-primary/5 text-primary rounded-lg text-[9px] font-black uppercase flex items-center gap-2">
                                                                        {key}: {val}
                                                                        <button type="button" onClick={() => {
                                                                            const variants = [...formData.variants];
                                                                            const newAttrs = { ...variants[idx].attributes };
                                                                            delete newAttrs[key];
                                                                            variants[idx].attributes = newAttrs;
                                                                            setFormData({ ...formData, variants });
                                                                        }} className="hover:text-red-500"><X className="w-3 h-3" /></button>
                                                                    </span>
                                                                ))}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const k = prompt('Spec Head?');
                                                                        const v_attr = prompt('Value?');
                                                                        if (k && v_attr) {
                                                                            const variants = [...formData.variants];
                                                                            variants[idx].attributes = { ...variants[idx].attributes, [k]: v_attr };
                                                                            setFormData({ ...formData, variants });
                                                                        }
                                                                    }}
                                                                    className="px-3 py-1 border-2 border-dashed border-gray-100 rounded-lg text-[10px] font-bold text-gray-300 hover:border-primary/30 hover:text-primary transition-all"
                                                                >
                                                                    + Add Spec
                                                                </button>
                                                            </div>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Intelligence Controls Sidebar */}
                                    <div className="col-span-12 lg:col-span-4 bg-gray-50/50 border-l border-gray-100 p-12 space-y-12">
                                        <section className="space-y-6">
                                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Purchase Architecture</h4>
                                            <div className="space-y-3">
                                                {[
                                                    { id: 'rfq', name: 'Technical RFQ Flow', icon: ClipboardList, color: 'emerald' },
                                                    { id: 'direct', name: 'Direct Commerce', icon: CheckCircle, color: 'primary' },
                                                    { id: 'both', name: 'Hybrid: Direct + RFQ', icon: ArrowLeftRight, color: 'blue' }
                                                ].map((model) => (
                                                    <button
                                                        key={model.id}
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, purchase_model: model.id })}
                                                        className={`w-full p-6 rounded-[24px] text-xs font-black uppercase tracking-widest flex items-center gap-5 transition-all transform hover:-translate-y-1 active:scale-95 shadow-sm border ${formData.purchase_model === model.id
                                                            ? `bg-${model.color === 'primary' ? 'primary' : model.color + '-600'} text-white shadow-xl shadow-${model.color === 'primary' ? 'primary' : model.color + '-600'}/20 border-transparent`
                                                            : 'bg-white text-gray-400 border-gray-100 hover:border-primary/20 hover:text-gray-600'
                                                            }`}
                                                    >
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${formData.purchase_model === model.id ? 'bg-white/20' : 'bg-gray-50 group-hover:bg-primary/5'}`}>
                                                            <model.icon className="w-5 h-5" />
                                                        </div>
                                                        {model.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </section>

                                        {(formData.purchase_model === 'rfq' || formData.purchase_model === 'both') && (
                                            <section className="space-y-6">
                                                <div className="flex items-center justify-between px-1">
                                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">RFQ Protocol Fields</h4>
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
                                                <div className="space-y-4">
                                                    {formData.min_rfq_fields.map((field, idx) => (
                                                        <motion.div
                                                            initial={{ opacity: 0, x: 20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            key={idx}
                                                            className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm relative group"
                                                        >
                                                            <input
                                                                placeholder="Field Designation"
                                                                className="w-full text-sm font-bold mb-3 p-1 outline-none border-b-2 border-gray-50 focus:border-primary transition-colors bg-transparent"
                                                                value={field.label}
                                                                onChange={(e) => {
                                                                    const fields = [...formData.min_rfq_fields];
                                                                    fields[idx].label = e.target.value;
                                                                    setFormData({ ...formData, min_rfq_fields: fields });
                                                                }}
                                                            />
                                                            <div className="flex items-center gap-4">
                                                                <select
                                                                    className="flex-grow text-[10px] font-black uppercase p-2 bg-gray-50 rounded-lg outline-none border border-transparent focus:border-primary/20"
                                                                    value={field.type}
                                                                    onChange={(e) => {
                                                                        const fields = [...formData.min_rfq_fields];
                                                                        fields[idx].type = e.target.value;
                                                                        setFormData({ ...formData, min_rfq_fields: fields });
                                                                    }}
                                                                >
                                                                    <option value="text">STRING</option>
                                                                    <option value="number">NUMERIC</option>
                                                                    <option value="select">DROPDOWN</option>
                                                                    <option value="textarea">BLOB</option>
                                                                </select>
                                                                <label className="flex items-center gap-2 cursor-pointer py-1 px-3 bg-gray-50 rounded-lg border border-transparent hover:border-primary/10 transition-all">
                                                                    <input
                                                                        type="checkbox"
                                                                        className="w-4 h-4 rounded-md text-primary border-gray-200"
                                                                        checked={field.required}
                                                                        onChange={(e) => {
                                                                            const fields = [...formData.min_rfq_fields];
                                                                            fields[idx].required = e.target.checked;
                                                                            setFormData({ ...formData, min_rfq_fields: fields });
                                                                        }}
                                                                    />
                                                                    <span className="text-[10px] font-black text-gray-400">REQ</span>
                                                                </label>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const fields = formData.min_rfq_fields.filter((_, i) => i !== idx);
                                                                        setFormData({ ...formData, min_rfq_fields: fields });
                                                                    }}
                                                                    className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            </section>
                                        )}

                                        <section className="space-y-6">
                                            <div className="flex items-center justify-between px-1">
                                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Technical Documents</h4>
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({
                                                        ...formData,
                                                        documents: [...(formData.documents || []), { name: '', url: '' }]
                                                    })}
                                                    className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-white transition-all"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="space-y-4">
                                                {(formData.documents || []).map((doc, idx) => (
                                                    <motion.div
                                                        initial={{ opacity: 0, x: 20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        key={idx}
                                                        className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm relative group space-y-3"
                                                    >
                                                        <div className="relative">
                                                            <FileText className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                                                            <input
                                                                placeholder="Doc Title (e.g. CE Cert)"
                                                                className="w-full pl-7 text-xs font-bold p-1 outline-none border-b border-gray-50 focus:border-primary transition-colors bg-transparent"
                                                                value={doc.name}
                                                                onChange={(e) => {
                                                                    const docs = [...formData.documents];
                                                                    docs[idx].name = e.target.value;
                                                                    setFormData({ ...formData, documents: docs });
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="relative">
                                                            <LinkIcon className="absolute left-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" />
                                                            <input
                                                                placeholder="Cloud Resource URL"
                                                                className="w-full pl-7 text-[10px] text-gray-400 font-medium p-1 outline-none truncate"
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
                                                                const docs = formData.documents.filter((_, i) => i !== idx);
                                                                setFormData({ ...formData, documents: docs });
                                                            }}
                                                            className="absolute -top-2 -right-2 p-2 bg-white text-red-500 rounded-full shadow-md border border-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </section>

                                        <section className="space-y-6">
                                            <div>
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 px-1">Visibility Status</label>
                                                <div className="relative">
                                                    <select
                                                        className="w-full px-6 py-4 bg-white border border-gray-100 rounded-2xl outline-none font-bold text-sm shadow-sm appearance-none focus:ring-4 focus:ring-primary/5 transition-all"
                                                        value={formData.visibility_status}
                                                        onChange={(e) => setFormData({ ...formData, visibility_status: e.target.value })}
                                                    >
                                                        <option value="published">Domain: PUBLIC (LIVE)</option>
                                                        <option value="hidden">Domain: HIDDEN (VAULTED)</option>
                                                        <option value="draft">Domain: INTERNAL (PLANNING)</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 px-1">Marketplace Sequence</label>
                                                <input
                                                    type="number"
                                                    className="w-full px-6 py-4 bg-white border border-gray-100 rounded-2xl outline-none font-bold text-sm shadow-sm focus:ring-4 focus:ring-primary/5 transition-all"
                                                    value={formData.order_index}
                                                    onChange={(e) => setFormData({ ...formData, order_index: e.target.value })}
                                                />
                                            </div>
                                        </section>

                                        {/* Vendor Assignment - Streamlined */}
                                        {editingProduct && (
                                            <section className="space-y-6 pt-6 border-t border-gray-100">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Authorized Vendors</h4>
                                                    <span className="text-[10px] font-black text-primary px-3 py-1 bg-primary/10 rounded-full">{productVendors.length}</span>
                                                </div>
                                                <div className="flex flex-wrap gap-2 mb-4">
                                                    {productVendors.map((pv: any) => (
                                                        <span key={pv.vendor_id} className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-xs font-bold text-gray-600 flex items-center gap-2 shadow-sm">
                                                            {pv.profiles?.company_name || 'Vendor'}
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveVendor(pv.vendor_id)}
                                                                className="hover:text-red-500"
                                                            >
                                                                <X className="w-3.5 h-3.5" />
                                                            </button>
                                                        </span>
                                                    ))}
                                                </div>
                                                <select
                                                    className="w-full px-6 py-4 bg-white border-2 border-dashed border-gray-200 rounded-2xl outline-none font-bold text-[10px] uppercase tracking-widest text-gray-400 hover:border-primary/50 transition-all cursor-pointer"
                                                    value=""
                                                    onChange={(e) => e.target.value && (handleAssignVendor(e.target.value), e.target.value = '')}
                                                >
                                                    <option value="">+ Authorize New Partner</option>
                                                    {vendors.map(v => <option key={v.id} value={v.id}>{v.company_name || v.full_name}</option>)}
                                                </select>
                                            </section>
                                        )}
                                    </div>
                                </div>
                            </form>

                            {/* Sticky Premium Footer */}
                            <div className="p-10 bg-white border-t border-gray-50 flex justify-end gap-6 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-10 py-5 text-sm font-black text-gray-400 hover:text-gray-900 uppercase tracking-widest transition-all"
                                >
                                    Abort Entry
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    className="px-12 py-5 bg-primary hover:bg-primary-dark text-white rounded-[24px] text-sm font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-4"
                                >
                                    <CheckCircle className="w-5 h-5" />
                                    <span>Sync Technical Profile</span>
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminProducts;
