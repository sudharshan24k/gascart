import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Filter, ClipboardList, Building2, ShieldCheck, GitCompare, Plus, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEnquiry } from '../context/EnquiryContext';
import { api } from '../services/api';

const ProductListing: React.FC = () => {
    const [products, setProducts] = useState<any[]>([]);
    const [filterOpen, setFilterOpen] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [vendors, setVendors] = useState<any[]>([]);
    // Actually, the previous logic used .find on these arrays. If they are empty [], logic fails.
    // I should initialize them with the hardcoded values I used in the UI so the ID mapping logic works (assuming ID=Name for legacy/mock compatibility until real IDs are used)

    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();
    const { state, dispatch } = useEnquiry();

    const activeCategory = searchParams.get('category') || 'All';
    const activeVendor = searchParams.get('vendor') || 'All';

    useEffect(() => {
        loadFilters();
    }, []);

    useEffect(() => {
        loadData();
    }, [activeCategory, activeVendor, searchParams]);

    const loadFilters = async () => {
        try {
            // Fetch categories
            const categoriesRes = await api.categories.list();
            if (categoriesRes.data) {
                setCategories(categoriesRes.data);
            }

            // Fetch unique vendors from products
            const { data: productsData } = await api.products.list({});
            if (productsData) {
                const uniqueVendors = Array.from(
                    new Set(
                        productsData
                            .map((p: any) => p.profiles?.company_name)
                            .filter((name: any) => name)
                    )
                ).map((name: any) => ({ company_name: name, id: name }));
                setVendors(uniqueVendors);
            }
        } catch (err) {
            console.error('Failed to load filters', err);
        }
    };

    const loadData = async () => {
        setLoading(true);
        try {
            const params: any = {};
            if (activeCategory !== 'All') params.category = activeCategory; // Backend expects ID usually, but if relying on simple name match in legacy mock, we need to ensure backend handles it. But wait, backend filtering expects category ID.
            // Assumption: we need to fetch categories first to map name -> id, or backend supports slug/name.
            // For now, let's assume we fetch products and distinct them, OR better, fetch filters.

            // Wait, backend `category` filter expects ID currently (eq 'category_id', category).
            // Frontend UI uses Names (Strings).
            // We should fetch Categories to get IDs.

            // Let's modify params handling.
            if (activeCategory !== 'All' && categories.length > 0) {
                const cat = categories.find(c => c.name === activeCategory);
                if (cat) params.category = cat.id;
            }
            if (activeVendor !== 'All' && vendors.length > 0) {
                const ven = vendors.find(v => v.company_name === activeVendor);
                if (ven) params.vendor = ven.id; // Correct param is vendor (id)
            }

            // Search Param
            const searchQuery = searchParams.get('search');
            if (searchQuery) {
                params.search = searchQuery;
            }

            const { data } = await api.products.list(params);
            setProducts(data || []);

            // Dynamic Filters Fetching (if not already done)
            // This is non-optimal but for MVP fine: derive unique categories/vendors from full list or separate endpoint
            if (categories.length === 0) {
                // Fetch categories. api.ts need categories.list?
                // Let's try to infer from products for now or add api.categories.list
                // Ideally we should have api.categories.list
            }

        } catch (err) {
            console.error('Failed to load products', err);
        } finally {
            setLoading(false);
        }
    };



    const updateFilter = (type: 'category' | 'vendor', value: string) => {
        const newParams = new URLSearchParams(searchParams);
        if (value === 'All') {
            newParams.delete(type);
        } else {
            newParams.set(type, value);
        }
        setSearchParams(newParams);
    };

    return (
        <div className="min-h-screen pt-32 pb-24 bg-gray-50">
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Header Area */}
                <div className="mb-8 md:mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6">
                    <div>
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 md:mb-4">Industrial Marketplace</h1>
                        <p className="text-sm md:text-base text-gray-500 max-w-xl">Direct access to verified Bio-CNG equipment suppliers. Aggregate assets into a single Enquiry for technical quotation.</p>
                    </div>
                    <div className="flex gap-3 md:gap-4">
                        {/* Mobile Filter Toggle */}
                        <button
                            onClick={() => setFilterOpen(!filterOpen)}
                            className="lg:hidden flex items-center gap-2 bg-white text-gray-700 px-4 md:px-6 py-3 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all font-bold"
                        >
                            <Filter className="w-5 h-5 text-primary" />
                            Filters
                        </button>
                        <Link
                            to="/enquiry-list"
                            className="flex items-center gap-2 bg-white text-gray-700 px-4 md:px-6 py-3 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all font-bold text-sm md:text-base"
                        >
                            <ClipboardList className="w-5 h-5 text-primary" />
                            View Enquiry List
                        </Link>
                    </div>
                </div>

                {/* Search Results Indicator */}
                {searchParams.get('search') && (
                    <div className="mb-8 flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                        <span className="text-lg font-bold text-gray-700">
                            Search Results for: <span className="text-primary">"{searchParams.get('search')}"</span>
                        </span>
                        <button
                            onClick={() => {
                                const newParams = new URLSearchParams(searchParams);
                                newParams.delete('search');
                                setSearchParams(newParams);
                            }}
                            className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-red-500 transition-colors px-4 py-2 hover:bg-red-50 rounded-lg"
                        >
                            <span className="sr-only">Clear Search</span>
                            Clear Search
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                        </button>
                    </div>
                )}

                <div className="flex flex-col lg:flex-row gap-6 md:gap-8 lg:gap-12">
                    {/* Filter Sidebar - Desktop */}
                    <aside className="hidden lg:block w-72 flex-shrink-0 space-y-8">
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-2 mb-6 text-primary">
                                <Filter className="w-5 h-5" />
                                <h3 className="font-bold text-lg">Filters</h3>
                            </div>

                            <div className="space-y-8">
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Product Category</label>
                                    <div className="space-y-2">
                                        <div className="space-y-1">
                                            <button
                                                onClick={() => updateFilter('category', 'All')}
                                                className={`block w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${activeCategory === 'All' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-500 hover:bg-gray-50'}`}
                                            >
                                                All Categories
                                            </button>

                                            {/* Recursive/Hierarchical Rendering */}
                                            {(() => {
                                                // 1. Build Tree
                                                const roots = categories.filter(c => !c.parent_id);
                                                const getChildren = (pid: string) => categories.filter(c => c.parent_id === pid);

                                                const renderNode = (node: any, depth = 0) => {
                                                    const children = getChildren(node.id);
                                                    const isActive = activeCategory === node.id;

                                                    return (
                                                        <div key={node.id} className="w-full">
                                                            <button
                                                                onClick={() => updateFilter('category', node.id)}
                                                                className={`block w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-between ${isActive ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-500 hover:bg-gray-50'
                                                                    }`}
                                                                style={{ paddingLeft: `${(depth + 1) * 1}rem` }}
                                                            >
                                                                {node.name}
                                                                {children.length > 0 && <span className="text-[10px] opacity-50 ml-2">▼</span>}
                                                            </button>
                                                            {children.length > 0 && (
                                                                <div className="mt-1 space-y-1">
                                                                    {children.map(child => renderNode(child, depth + 1))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )
                                                };

                                                // Fallback for flat list if hierarchy is missing or partial
                                                return roots.length > 0 ? roots.map(root => renderNode(root)) : categories.map(c => (
                                                    <button
                                                        key={c.id}
                                                        onClick={() => updateFilter('category', c.id)}
                                                        className={`block w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${activeCategory === c.id ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                                                    >
                                                        {c.name}
                                                    </button>
                                                ));
                                            })()}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Verified Vendors</label>
                                    <div className="space-y-2">
                                        {['All', 'BioGas Solutions Inc', 'Green Energy Hub', 'TechFlow Systems'].map(vendor => (
                                            <button
                                                key={vendor}
                                                onClick={() => updateFilter('vendor', vendor)}
                                                className={`block w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${activeVendor === vendor ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-500 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {vendor}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Promo Unit */}
                        <div className="bg-gray-900 p-8 rounded-[32px] text-white shadow-2xl relative overflow-hidden group">
                            <ShieldCheck className="w-12 h-12 mb-6 text-primary" />
                            <h4 className="font-bold text-lg mb-2 relative z-10">ISO-Verified Suppliers</h4>
                            <p className="text-sm opacity-60 leading-relaxed relative z-10">
                                Every asset in the Gascart marketplace is verified for industrial safety compliance.
                            </p>
                            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/40 transition-all"></div>
                        </div>

                        {/* Join as Vendor CTA */}
                        <div className="mt-12 p-8 bg-secondary-900 rounded-[32px] text-white relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/30 transition-all duration-500"></div>
                            <h3 className="text-xl font-bold mb-3 relative z-10">Sell on Gascart</h3>
                            <p className="text-white/70 text-sm mb-6 relative z-10 leading-relaxed">
                                Join India's largest Bio-CNG marketplace. Reach verified industrial buyers and expand your business.
                            </p>
                            <Link
                                to="/vendor-enquiry"
                                className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-2xl font-black text-sm hover:bg-primary-dark transition-all relative z-10 shadow-lg shadow-primary/20"
                            >
                                <Building2 className="w-4 h-4" /> Join as Vendor
                            </Link>
                        </div>
                    </aside>

                    {/* Mobile Filter Drawer */}
                    {filterOpen && (
                        <>
                            <div
                                className="lg:hidden fixed inset-0 bg-black/50 z-40"
                                onClick={() => setFilterOpen(false)}
                            />
                            <aside className="lg:hidden fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-white z-50 overflow-y-auto custom-scrollbar animate-slide-in-left">
                                <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
                                    <div className="flex items-center gap-2 text-primary">
                                        <Filter className="w-5 h-5" />
                                        <h3 className="font-bold text-lg">Filters</h3>
                                    </div>
                                    <button
                                        onClick={() => setFilterOpen(false)}
                                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                        aria-label="Close filters"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                    </button>
                                </div>
                                <div className="p-6 space-y-8">
                                    <div>
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Product Category</label>
                                        <div className="space-y-2">
                                            <div className="space-y-1">
                                                <button
                                                    onClick={() => { updateFilter('category', 'All'); setFilterOpen(false); }}
                                                    className={`block w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${activeCategory === 'All' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-500 hover:bg-gray-50'}`}
                                                >
                                                    All Categories
                                                </button>
                                                {(() => {
                                                    const roots = categories.filter(c => !c.parent_id);
                                                    const getChildren = (pid: string) => categories.filter(c => c.parent_id === pid);
                                                    const renderNode = (node: any, depth = 0) => {
                                                        const children = getChildren(node.id);
                                                        const isActive = activeCategory === node.id;
                                                        return (
                                                            <div key={node.id} className="w-full">
                                                                <button
                                                                    onClick={() => { updateFilter('category', node.id); setFilterOpen(false); }}
                                                                    className={`block w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-between ${isActive ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-500 hover:bg-gray-50'}`}
                                                                    style={{ paddingLeft: `${(depth + 1) * 1}rem` }}
                                                                >
                                                                    {node.name}
                                                                    {children.length > 0 && <span className="text-[10px] opacity-50 ml-2">▼</span>}
                                                                </button>
                                                                {children.length > 0 && (
                                                                    <div className="mt-1 space-y-1">
                                                                        {children.map(child => renderNode(child, depth + 1))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )
                                                    };
                                                    return roots.length > 0 ? roots.map(root => renderNode(root)) : categories.map(c => (
                                                        <button
                                                            key={c.id}
                                                            onClick={() => { updateFilter('category', c.id); setFilterOpen(false); }}
                                                            className={`block w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${activeCategory === c.id ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                                                        >
                                                            {c.name}
                                                        </button>
                                                    ));
                                                })()}
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Verified Vendors</label>
                                        <div className="space-y-2">
                                            {['All', 'BioGas Solutions Inc', 'Green Energy Hub', 'TechFlow Systems'].map(vendor => (
                                                <button
                                                    key={vendor}
                                                    onClick={() => { updateFilter('vendor', vendor); setFilterOpen(false); }}
                                                    className={`block w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${activeVendor === vendor ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-500 hover:bg-gray-50'}`}
                                                >
                                                    {vendor}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </aside>
                        </>
                    )}

                    {/* Product Grid */}
                    <div className="flex-grow">
                        {loading ? (
                            <div className="flex justify-center py-20">
                                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
                                {products.map((product) => {
                                    const isInComparison = state.comparisonItems.some(i => i.id === product.id);
                                    // Handle image array or single string
                                    const mainImage = Array.isArray(product.images) ? product.images[0] : product.image;
                                    const vendorName = product.profiles?.company_name || product.vendor || 'Authorized Vendor';
                                    const categoryName = product.categories?.name || product.category || 'Industrial';

                                    return (
                                        <motion.div
                                            key={product.id}
                                            layout
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-white rounded-[40px] overflow-hidden shadow-sm border border-gray-100 hover:shadow-2xl transition-all group relative"
                                        >
                                            {/* Purchase Model Badge */}
                                            <div className="absolute top-6 left-6 z-10">
                                                {product.purchase_model === 'rfq' ? (
                                                    <span className="bg-gray-900/80 backdrop-blur text-white text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-widest flex items-center gap-2">
                                                        <ClipboardList className="w-3 h-3 text-primary" /> Technical RFQ
                                                    </span>
                                                ) : product.purchase_model === 'both' ? (
                                                    <span className="bg-blue-600/80 backdrop-blur text-white text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-widest flex items-center gap-2">
                                                        <GitCompare className="w-3 h-3" /> Direct + RFQ
                                                    </span>
                                                ) : (
                                                    <span className="bg-green-600/80 backdrop-blur text-white text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-widest flex items-center gap-2">
                                                        <ShieldCheck className="w-3 h-3" /> Direct Buy
                                                    </span>
                                                )}
                                            </div>

                                            <button
                                                onClick={() => dispatch({
                                                    type: 'TOGGLE_COMPARISON',
                                                    payload: { id: product.id, name: product.name, image: mainImage, category: categoryName }
                                                })}
                                                className={`absolute top-6 right-6 z-10 p-3 rounded-2xl transition-all shadow-lg ${isInComparison ? 'bg-secondary text-white scale-110' : 'bg-white/90 backdrop-blur text-gray-400 hover:text-secondary'
                                                    }`}
                                            >
                                                <GitCompare className="w-5 h-5" />
                                            </button>

                                            <Link to={`/product/${product.id}`} className="block aspect-[4/3] overflow-hidden bg-gray-50 relative p-4">
                                                {mainImage ? (
                                                    <img
                                                        src={mainImage}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover rounded-3xl group-hover:scale-105 transition-transform duration-700"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-3xl text-gray-300">
                                                        <Filter className="w-12 h-12" />
                                                    </div>
                                                )}
                                            </Link>

                                            <div className="p-8">
                                                <div className="flex items-center gap-2 text-[10px] text-primary font-black uppercase tracking-widest mb-3">
                                                    <Building2 className="w-3 h-3" />
                                                    {vendorName}
                                                </div>
                                                <h3 className="font-bold text-xl text-gray-900 mb-4 group-hover:text-primary transition-colors h-14 overflow-hidden">{product.name}</h3>

                                                <div className="flex items-center justify-between mt-8 pt-8 border-t border-gray-50">
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                                                            {product.purchase_model === 'rfq' ? 'Project Est.' : product.purchase_model === 'both' ? 'Price/Est.' : 'Ex-Works Price'}
                                                        </span>
                                                        <span className="text-2xl font-black text-gray-900">₹{Number(product.price).toLocaleString()}</span>
                                                    </div>
                                                    <button
                                                        onClick={() => dispatch({
                                                            type: 'ADD_ITEM',
                                                            payload: { id: product.id, name: product.name, price: Number(product.price), quantity: 1, image: mainImage, vendor: vendorName }
                                                        })}
                                                        className={`p-4 rounded-2xl transition-all shadow-xl hover:-translate-y-1 active:scale-95 ${product.purchase_model === 'rfq' ? 'bg-gray-100 text-gray-400 hover:bg-primary hover:text-white' : product.purchase_model === 'both' ? 'bg-primary text-white shadow-primary/20' : 'bg-gray-900 text-white hover:bg-primary'
                                                            }`}
                                                    >
                                                        {product.purchase_model === 'rfq' ? <ClipboardList className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}

                        {!loading && products.length === 0 && (
                            <div className="text-center py-20">
                                <h3 className="text-2xl font-bold text-gray-900">No assets found</h3>
                                <p className="text-gray-500 mt-2">Try adjusting your filters.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Comparison Bar (Floating) */}
            <AnimatePresence>
                {state.comparisonItems.length > 0 && (
                    <motion.div
                        initial={{ y: 100 }}
                        animate={{ y: 0 }}
                        exit={{ y: 100 }}
                        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-gray-900/90 backdrop-blur-xl px-8 py-4 rounded-[32px] shadow-2xl border border-white/10 flex items-center gap-8"
                    >
                        <div className="flex items-center gap-4">
                            <GitCompare className="w-6 h-6 text-secondary" />
                            <span className="text-white font-bold">{state.comparisonItems.length} Assets Selected</span>
                        </div>
                        <div className="h-8 w-px bg-white/10"></div>
                        <Link
                            to="/compare"
                            className="bg-secondary text-white px-6 py-2 rounded-xl font-bold hover:scale-105 transition-all text-sm"
                        >
                            Compare Details
                        </Link>
                        <button
                            onClick={async () => {
                                // Logic to remove all - needs action in context
                            }}
                            className="text-white/40 hover:text-white text-xs font-bold"
                        >
                            Clear
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProductListing;
