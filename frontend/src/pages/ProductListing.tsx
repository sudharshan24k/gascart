import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Filter, ClipboardList, Building2, ShieldCheck, GitCompare, Plus, Loader2, Search, X, LayoutGrid, List } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEnquiry } from '../context/EnquiryContext';
import { api } from '../services/api';

const ProductListing: React.FC = () => {
    const [products, setProducts] = useState<any[]>([]);
    const [filterOpen, setFilterOpen] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [vendors, setVendors] = useState<any[]>([]);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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
                const uniqueVendorsMap = new Map();
                productsData.forEach((p: any) => {
                    if (p.vendor_id && p.profiles?.company_name) {
                        uniqueVendorsMap.set(p.vendor_id, p.profiles.company_name);
                    }
                });
                const uniqueVendors = Array.from(uniqueVendorsMap.entries()).map(([id, name]) => ({ id, company_name: name as string }));
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

            if (activeCategory !== 'All') {
                params.category = activeCategory;
            }
            if (activeVendor !== 'All') {
                params.vendor = activeVendor;
            }

            const searchQuery = searchParams.get('search');
            if (searchQuery) {
                params.search = searchQuery;
            }

            const { data } = await api.products.list(params);
            setProducts(data || []);

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
        <div className="min-h-screen bg-neutral-50 pt-28 pb-20">
            {/* Header Section */}
            <div className="bg-white border-b border-neutral-200 sticky top-16 z-30 shadow-sm/50 backdrop-blur-xl bg-white/80 supports-[backdrop-filter]:bg-white/80">
                <div className="container mx-auto px-4 max-w-7xl py-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-3xl font-display font-bold text-neutral-900">Marketplace</h1>
                            <p className="text-neutral-500 mt-1">Found {products.length} industrial assets available</p>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-400 hover:text-neutral-600'}`}
                            >
                                <LayoutGrid className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-400 hover:text-neutral-600'}`}
                            >
                                <List className="w-5 h-5" />
                            </button>
                            <div className="h-8 w-px bg-neutral-200 mx-2"></div>
                            <button
                                onClick={() => setFilterOpen(!filterOpen)}
                                className="lg:hidden flex items-center gap-2 bg-neutral-900 text-white px-4 py-2.5 rounded-xl font-medium shadow-lg shadow-neutral-900/10"
                            >
                                <Filter className="w-4 h-4" /> Filters
                            </button>
                            <Link
                                to="/enquiry-list"
                                className="hidden md:flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-600 transition-all transform hover:-translate-y-0.5"
                            >
                                <ClipboardList className="w-4 h-4" />
                                Enquiry List
                            </Link>
                        </div>
                    </div>

                    {/* Active Filters Pills */}
                    {(activeCategory !== 'All' || activeVendor !== 'All' || searchParams.get('search')) && (
                        <div className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t border-neutral-100">
                            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider mr-2">Active Filters:</span>

                            {searchParams.get('search') && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-100 text-neutral-700 rounded-full text-sm font-medium">
                                    Search: "{searchParams.get('search')}"
                                    <button onClick={() => {
                                        const newParams = new URLSearchParams(searchParams);
                                        newParams.delete('search');
                                        setSearchParams(newParams);
                                    }} className="hover:text-red-500"><X className="w-3.5 h-3.5" /></button>
                                </span>
                            )}

                            {activeCategory !== 'All' && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary-700 rounded-full text-sm font-medium border border-primary/20">
                                    {categories.find(c => c.id === activeCategory)?.name || activeCategory}
                                    <button onClick={() => updateFilter('category', 'All')} className="hover:text-red-500"><X className="w-3.5 h-3.5" /></button>
                                </span>
                            )}

                            {activeVendor !== 'All' && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-secondary/10 text-secondary-700 rounded-full text-sm font-medium border border-secondary/20">
                                    {vendors.find(v => v.id === activeVendor)?.company_name || activeVendor}
                                    <button onClick={() => updateFilter('vendor', 'All')} className="hover:text-red-500"><X className="w-3.5 h-3.5" /></button>
                                </span>
                            )}

                            <button
                                onClick={() => setSearchParams({})}
                                className="text-xs font-bold text-red-500 hover:text-red-600 ml-auto"
                            >
                                Clear All
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-7xl py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Filters */}
                    <aside className={`lg:w-72 flex-shrink-0 ${filterOpen ? 'fixed inset-0 z-50 bg-white p-6 lg:static lg:bg-transparent lg:p-0' : 'hidden lg:block'}`}>
                        {filterOpen && (
                            <div className="flex justify-between items-center mb-6 lg:hidden">
                                <h2 className="text-2xl font-bold font-display">Filters</h2>
                                <button onClick={() => setFilterOpen(false)} className="p-2 bg-neutral-100 rounded-full"><X className="w-6 h-6" /></button>
                            </div>
                        )}

                        <div className="space-y-8 sticky top-32">
                            {/* Categories */}
                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-neutral-100">
                                <h3 className="font-bold text-neutral-900 mb-4 flex items-center gap-2">
                                    <LayoutGrid className="w-4 h-4 text-primary" /> Categories
                                </h3>
                                <div className="space-y-1">
                                    <button
                                        onClick={() => { updateFilter('category', 'All'); setFilterOpen(false); }}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeCategory === 'All' ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-neutral-600 hover:bg-neutral-50'}`}
                                    >
                                        All Categories
                                    </button>
                                    {categories.filter(c => !c.parent_id).map(category => (
                                        <div key={category.id}>
                                            <button
                                                onClick={() => { updateFilter('category', category.id); setFilterOpen(false); }}
                                                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeCategory === category.id ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-neutral-600 hover:bg-neutral-50'}`}
                                            >
                                                {category.name}
                                            </button>
                                            {categories.filter(sub => sub.parent_id === category.id).map(sub => (
                                                <button
                                                    key={sub.id}
                                                    onClick={() => { updateFilter('category', sub.id); setFilterOpen(false); }}
                                                    className={`w-full text-left px-3 py-2 pl-6 rounded-lg text-sm transition-colors ${activeCategory === sub.id ? 'text-primary font-bold bg-primary/5' : 'text-neutral-500 hover:text-neutral-900'}`}
                                                >
                                                    • {sub.name}
                                                </button>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Vendors */}
                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-neutral-100">
                                <h3 className="font-bold text-neutral-900 mb-4 flex items-center gap-2">
                                    <Building2 className="w-4 h-4 text-primary" /> Vendors
                                </h3>
                                <div className="space-y-1 max-h-60 overflow-y-auto custom-scrollbar">
                                    <button
                                        onClick={() => { updateFilter('vendor', 'All'); setFilterOpen(false); }}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeVendor === 'All' ? 'bg-neutral-900 text-white shadow-md' : 'text-neutral-600 hover:bg-neutral-50'}`}
                                    >
                                        All Vendors
                                    </button>
                                    {vendors.map(vendor => (
                                        <button
                                            key={vendor.id}
                                            onClick={() => { updateFilter('vendor', vendor.id); setFilterOpen(false); }}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeVendor === vendor.id ? 'bg-neutral-900 text-white shadow-md' : 'text-neutral-600 hover:bg-neutral-50'}`}
                                        >
                                            {vendor.company_name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Promo Card */}
                            <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 p-6 rounded-3xl text-white relative overflow-hidden">
                                <div className="relative z-10">
                                    <ShieldCheck className="w-8 h-8 text-primary mb-3" />
                                    <h4 className="font-display font-bold text-lg mb-1">Verify First</h4>
                                    <p className="text-neutral-400 text-xs leading-relaxed mb-4">All suppliers on Gascart undergo a strict 3-step verification process.</p>
                                    <Link to="/about" className="text-xs font-bold text-primary hover:text-white transition-colors">
                                        Learn more
                                    </Link>
                                </div>
                                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/20 rounded-full blur-2xl -mr-10 -mt-10"></div>
                            </div>
                        </div>
                    </aside>

                    {/* Product Grid */}
                    <div className="flex-1">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                                <p className="text-neutral-500 font-medium animate-pulse">Loading assets...</p>
                            </div>
                        ) : products.length === 0 ? (
                            <div className="bg-white p-12 rounded-[32px] border border-neutral-100 text-center">
                                <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Search className="w-8 h-8 text-neutral-400" />
                                </div>
                                <h3 className="text-xl font-bold text-neutral-900 mb-2">No results found</h3>
                                <p className="text-neutral-500">Try adjusting your filters or search query.</p>
                                <button
                                    onClick={() => setSearchParams({})}
                                    className="mt-6 px-6 py-3 bg-neutral-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-colors"
                                >
                                    Clear All Filters
                                </button>
                            </div>
                        ) : (
                            <div className={viewMode === 'grid'
                                ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
                                : "flex flex-col gap-4"
                            }>
                                {products.map((product) => {
                                    const isInComparison = state.comparisonItems.some(i => i.id === product.id);
                                    const mainImage = Array.isArray(product.images) ? product.images[0] : product.image;
                                    const vendorName = product.profiles?.company_name || product.vendor || 'Authorized Vendor';

                                    if (viewMode === 'list') {
                                        return (
                                            <motion.div
                                                key={product.id}
                                                layout
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="bg-white p-4 rounded-3xl border border-neutral-100 hover:border-primary/30 shadow-sm hover:shadow-xl transition-all flex gap-6 items-center group"
                                            >
                                                <div className="w-24 h-24 bg-neutral-100 rounded-2xl flex-shrink-0 overflow-hidden">
                                                    <img src={mainImage} referrerPolicy="no-referrer" className="w-full h-full object-cover" alt={product.name} />
                                                </div>
                                                <div className="flex-grow">
                                                    <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">{vendorName}</div>
                                                    <h3 className="text-lg font-bold text-neutral-900 mb-1">{product.name}</h3>
                                                    <div className="text-lg font-bold text-neutral-900">₹{Number(product.price).toLocaleString()}</div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => dispatch({
                                                            type: 'ADD_ITEM',
                                                            payload: { id: product.id, name: product.name, price: Number(product.price), quantity: 1, image: mainImage, vendor: vendorName }
                                                        })}
                                                        className="px-6 py-3 bg-neutral-900 text-white rounded-xl font-bold text-sm hover:bg-primary transition-colors"
                                                    >
                                                        Add to Enquiry
                                                    </button>
                                                    <Link to={`/product/${product.id}`} className="px-6 py-3 border border-neutral-200 text-neutral-900 rounded-xl font-bold text-sm hover:bg-neutral-50 transition-colors">
                                                        Details
                                                    </Link>
                                                </div>
                                            </motion.div>
                                        );
                                    }

                                    return (
                                        <motion.div
                                            key={product.id}
                                            layout
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-white rounded-3xl border border-neutral-100 overflow-hidden hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300 group flex flex-col"
                                        >
                                            <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
                                                <img
                                                    src={mainImage}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                                />
                                                <div className="absolute top-4 left-4">
                                                    {product.purchase_model === 'rfq' && (
                                                        <span className="bg-white/90 backdrop-blur text-neutral-900 text-[10px] font-black px-3 py-1.5 rounded-lg border border-white/20 shadow-sm uppercase tracking-widest">
                                                            RFQ Only
                                                        </span>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => dispatch({
                                                        type: 'TOGGLE_COMPARISON',
                                                        payload: { id: product.id, name: product.name, image: mainImage, category: product.category }
                                                    })}
                                                    className={`absolute top-4 right-4 p-2 rounded-xl backdrop-blur-md transition-all ${isInComparison ? 'bg-primary text-white' : 'bg-white/80 text-neutral-600 hover:bg-white'}`}
                                                >
                                                    <GitCompare className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <div className="p-6 flex flex-col flex-1">
                                                <div className="flex items-center gap-2 mb-3 mt-1">
                                                    <Building2 className="w-3 h-3 text-neutral-400" />
                                                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">{vendorName}</span>
                                                </div>
                                                <Link to={`/product/${product.id}`} className="block mb-2">
                                                    <h3 className="font-bold text-lg text-neutral-900 leading-tight group-hover:text-primary transition-colors line-clamp-2">{product.name}</h3>
                                                </Link>

                                                <div className="flex items-center gap-2 mt-auto pt-6 justify-between">
                                                    <div>
                                                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Unit Price</p>
                                                        <p className="text-xl font-bold text-neutral-900 font-display">₹{Number(product.price).toLocaleString()}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => dispatch({
                                                            type: 'ADD_ITEM',
                                                            payload: { id: product.id, name: product.name, price: Number(product.price), quantity: 1, image: mainImage, vendor: vendorName }
                                                        })}
                                                        className="w-10 h-10 bg-neutral-900 rounded-xl flex items-center justify-center text-white hover:bg-primary transition-colors shadow-lg shadow-neutral-900/20 group-hover:scale-110"
                                                    >
                                                        <Plus className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Comparison Floating Bar */}
            <AnimatePresence>
                {state.comparisonItems.length > 0 && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-6 left-0 right-0 z-50 flex justify-center pointer-events-none"
                    >
                        <div className="bg-neutral-900/90 backdrop-blur-xl text-white pl-6 pr-2 py-2 rounded-full shadow-2xl flex items-center gap-6 pointer-events-auto border border-white/10 ring-1 ring-black/20">
                            <div className="flex items-center gap-3">
                                <div className="bg-primary rounded-full p-1.5">
                                    <GitCompare className="w-4 h-4 text-white" />
                                </div>
                                <span className="font-bold text-sm">{state.comparisonItems.length} items</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Link to="/compare" className="px-5 py-2.5 bg-white text-neutral-900 rounded-full text-xs font-bold hover:bg-gray-100 transition-colors">
                                    Compare Now
                                </Link>
                                <button
                                    onClick={() => {/* Clear logic would go here via context */ }}
                                    className="p-2.5 hover:bg-white/10 rounded-full transition-colors"
                                >
                                    <X className="w-4 h-4 text-neutral-400" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProductListing;
