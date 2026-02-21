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
    ArrowLeftRight,
    Filter,
    RotateCcw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProductModal } from '../components/products/ProductModal';
import {
    fetchAdminProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    fetchCategories,
    fetchVendors,
    fetchProductVendors,
    assignVendorToProduct,
    removeVendorFromProduct,
    updateProductVendor
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
    const [showFilters, setShowFilters] = useState(false);
    const [showVendorModal, setShowVendorModal] = useState(false);
    const [editingVendor, setEditingVendor] = useState<any>(null);
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

    const [vendorFormData, setVendorFormData] = useState({
        vendor_id: '',
        vendor_sku: '',
        vendor_price: '',
        vendor_stock_quantity: '',
        vendor_lead_time_days: '',
        is_primary: false,
        priority: '0'
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
        try {
            const data = await fetchProductVendors(productId);
            setProductVendors(data || []);
        } catch (err) {
            console.error('Failed to load product vendors', err);
            setProductVendors([]);
        } finally {
        }
    };

    const handleOpenVendorModal = (vendor?: any) => {
        if (vendor) {
            // Editing existing vendor
            setEditingVendor(vendor);
            setVendorFormData({
                vendor_id: vendor.vendor_id,
                vendor_sku: vendor.vendor_sku || '',
                vendor_price: vendor.vendor_price?.toString() || '',
                vendor_stock_quantity: vendor.vendor_stock_quantity?.toString() || '',
                vendor_lead_time_days: vendor.vendor_lead_time_days?.toString() || '',
                is_primary: vendor.is_primary || false,
                priority: vendor.priority?.toString() || '0'
            });
        } else {
            // Adding new vendor
            setEditingVendor(null);
            setVendorFormData({
                vendor_id: '',
                vendor_sku: '',
                vendor_price: '',
                vendor_stock_quantity: '',
                vendor_lead_time_days: '',
                is_primary: false,
                priority: '0'
            });
        }
        setShowVendorModal(true);
    };

    const handleSaveVendor = async () => {
        if (!editingProduct) return;

        try {
            const vendorData = {
                vendor_sku: vendorFormData.vendor_sku || undefined,
                vendor_price: vendorFormData.vendor_price ? parseFloat(vendorFormData.vendor_price) : undefined,
                vendor_stock_quantity: vendorFormData.vendor_stock_quantity ? parseInt(vendorFormData.vendor_stock_quantity) : undefined,
                vendor_lead_time_days: vendorFormData.vendor_lead_time_days ? parseInt(vendorFormData.vendor_lead_time_days) : undefined,
                is_primary: vendorFormData.is_primary,
                priority: parseInt(vendorFormData.priority)
            };

            if (editingVendor) {
                // Update existing vendor
                await updateProductVendor(editingProduct.id, vendorFormData.vendor_id, vendorData);
            } else {
                // Assign new vendor
                await assignVendorToProduct(editingProduct.id, vendorFormData.vendor_id, vendorData);
            }

            await loadProductVendors(editingProduct.id);
            setShowVendorModal(false);
        } catch (err) {
            console.error('Failed to save vendor', err);
            alert('Failed to save vendor. ' + (err as any)?.message || 'Please try again.');
        }
    };

    const handleRemoveVendor = async (vendorId: string) => {
        if (!editingProduct) return;
        if (!window.confirm('Remove this vendor from the product?')) return;

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
                images: formData.images.map((url: string) => {
                    const match = url.match(/drive\.google\.com\/(?:file\/d\/|open\?id=)([a-zA-Z0-9_-]+)/);
                    return match ? `https://drive.google.com/uc?id=${match[1]}` : url;
                }).filter(Boolean),
                category_id: formData.category_id || null, // Convert empty string to null to prevent UUID casting errors
                price: parseFloat(formData.price) || 0,
                stock_quantity: parseInt(formData.stock_quantity) || 0,
                order_index: parseInt(formData.order_index) || 0,
                slug: formData.name.toLowerCase().trim().replace(/[-\s]+/g, '-')
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
                                                    <img src={product.images[0]} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
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
                                            {product.price_min && product.price_max && product.price_min !== product.price_max ? (
                                                <>
                                                    <span className="text-lg font-bold text-gray-900">₹{parseFloat(product.price_min).toLocaleString()} - ₹{parseFloat(product.price_max).toLocaleString()}</span>
                                                    <span className="text-[10px] text-blue-600 font-bold uppercase tracking-tight">{product.vendor_count || 0} vendors</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="text-lg font-bold text-gray-900">₹{parseFloat(product.price).toLocaleString()}</span>
                                                    {product.vendor_count > 0 && (
                                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{product.vendor_count} vendor{product.vendor_count > 1 ? 's' : ''}</span>
                                                    )}
                                                </>
                                            )}
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
            <ProductModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                formData={formData}
                setFormData={setFormData}
                categories={categories}
                editingProduct={editingProduct}
                handleSubmit={handleSubmit}
                productVendors={productVendors}
                onOpenVendorModal={handleOpenVendorModal}
                onRemoveVendor={handleRemoveVendor}
            />

            {/* Vendor Add/Edit Modal */}
            <AnimatePresence>
                {showVendorModal && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-gray-900/40 backdrop-blur-md"
                            onClick={() => setShowVendorModal(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden relative z-20 border border-white/20"
                        >
                            {/* Header */}
                            <div className="relative p-10 border-b border-gray-100 flex justify-between items-center">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-blue-500 to-emerald-500" />
                                <div>
                                    <h3 className="text-3xl font-black text-gray-900">
                                        {editingVendor ? 'Edit Vendor Details' : 'Assign Vendor'}
                                    </h3>
                                    <p className="text-gray-400 font-bold mt-1 text-sm">
                                        Configure vendor-specific pricing and availability
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowVendorModal(false)}
                                    className="p-3 bg-gray-50 hover:bg-white text-gray-400 hover:text-gray-900 rounded-2xl transition-all"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Form */}
                            <div className="p-10 space-y-6">
                                {!editingVendor && (
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">
                                            Select Vendor *
                                        </label>
                                        <select
                                            required
                                            className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-primary/10 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold"
                                            value={vendorFormData.vendor_id}
                                            onChange={(e) => setVendorFormData({ ...vendorFormData, vendor_id: e.target.value })}
                                        >
                                            <option value="">Choose a vendor</option>
                                            {vendors
                                                .filter(v => !productVendors.some(pv => pv.vendor_id === v.id))
                                                .map(v => (
                                                    <option key={v.id} value={v.id}>
                                                        {v.company_name || v.full_name}
                                                    </option>
                                                ))
                                            }
                                        </select>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">
                                            Vendor SKU
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g., COMP-5HP-V1"
                                            className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-primary/10 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold"
                                            value={vendorFormData.vendor_sku}
                                            onChange={(e) => setVendorFormData({ ...vendorFormData, vendor_sku: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">
                                            Vendor Price (₹)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-primary/10 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold"
                                            value={vendorFormData.vendor_price}
                                            onChange={(e) => setVendorFormData({ ...vendorFormData, vendor_price: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">
                                            Stock Quantity
                                        </label>
                                        <input
                                            type="number"
                                            placeholder="0"
                                            className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-primary/10 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold"
                                            value={vendorFormData.vendor_stock_quantity}
                                            onChange={(e) => setVendorFormData({ ...vendorFormData, vendor_stock_quantity: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">
                                            Lead Time (days)
                                        </label>
                                        <input
                                            type="number"
                                            placeholder="7"
                                            className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-primary/10 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold"
                                            value={vendorFormData.vendor_lead_time_days}
                                            onChange={(e) => setVendorFormData({ ...vendorFormData, vendor_lead_time_days: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">
                                            Priority
                                        </label>
                                        <input
                                            type="number"
                                            placeholder="0"
                                            className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-primary/10 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold"
                                            value={vendorFormData.priority}
                                            onChange={(e) => setVendorFormData({ ...vendorFormData, priority: e.target.value })}
                                        />
                                        <p className="text-[9px] text-gray-400 mt-2">Higher values appear first</p>
                                    </div>

                                    <div className="flex items-center">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                                                checked={vendorFormData.is_primary}
                                                onChange={(e) => setVendorFormData({ ...vendorFormData, is_primary: e.target.checked })}
                                            />
                                            <div>
                                                <span className="text-sm font-bold text-gray-900 block">Set as Primary Vendor</span>
                                                <span className="text-[9px] text-gray-400">Recommended vendor for customers</span>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-end gap-4">
                                <button
                                    type="button"
                                    onClick={() => setShowVendorModal(false)}
                                    className="px-8 py-4 text-sm font-black text-gray-400 hover:text-gray-900 uppercase tracking-widest transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveVendor}
                                    disabled={!editingVendor && !vendorFormData.vendor_id}
                                    className="px-10 py-4 bg-primary hover:bg-primary-dark text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-primary/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                >
                                    {editingVendor ? 'Update Vendor' : 'Assign Vendor'}
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
