import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Filter, ClipboardList, Building2, ShieldCheck, GitCompare, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEnquiry } from '../context/EnquiryContext';

// Expanded Mock Data with Vendors
const MOCK_PRODUCTS = [
    { id: '1', name: 'Industrial Biogas Scrubber', price: 45000.00, image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80', category: 'Equipment', vendor: 'BioGas Solutions Inc', purchase_model: 'rfq' },
    { id: '2', name: 'Bio-CNG Cascade Cylinder', price: 12000.50, image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80', category: 'Storage', vendor: 'Green Energy Hub', purchase_model: 'rfq' },
    { id: '3', name: 'Methane Concentration Sensor', price: 245.00, image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=800&q=80', category: 'Monitoring', vendor: 'BioGas Solutions Inc', purchase_model: 'direct' },
    { id: '4', name: 'Pressure Regulating Valve', price: 89.00, image: 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=800&q=80', category: 'Components', vendor: 'TechFlow Systems', purchase_model: 'direct' },
];

const ProductListing: React.FC = () => {
    const [products, setProducts] = useState(MOCK_PRODUCTS);
    const [activeCategory, setActiveCategory] = useState('All');
    const [activeVendor, setActiveVendor] = useState('All');
    const { state, dispatch } = useEnquiry();

    useEffect(() => {
        let filtered = MOCK_PRODUCTS;
        if (activeCategory !== 'All') {
            filtered = filtered.filter(p => p.category === activeCategory);
        }
        if (activeVendor !== 'All') {
            filtered = filtered.filter(p => p.vendor === activeVendor);
        }
        setProducts(filtered);
    }, [activeCategory, activeVendor]);

    const categories = ['All', 'Equipment', 'Storage', 'Monitoring', 'Components'];
    const vendors = ['All', 'BioGas Solutions Inc', 'Green Energy Hub', 'TechFlow Systems'];

    return (
        <div className="min-h-screen pt-32 pb-24 bg-gray-50">
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Header Area */}
                <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">Industrial Marketplace</h1>
                        <p className="text-gray-500 max-w-xl">Direct access to verified Bio-CNG equipment suppliers. Aggregate assets into a single Enquiry for technical quotation.</p>
                    </div>
                    <div className="flex gap-4">
                        <Link
                            to="/enquiry-list"
                            className="flex items-center gap-2 bg-white text-gray-700 px-6 py-3 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all font-bold"
                        >
                            <ClipboardList className="w-5 h-5 text-primary" />
                            View Enquiry List
                        </Link>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Filter Sidebar */}
                    <aside className="w-full lg:w-72 flex-shrink-0 space-y-8">
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-2 mb-6 text-primary">
                                <Filter className="w-5 h-5" />
                                <h3 className="font-bold text-lg">Filters</h3>
                            </div>

                            <div className="space-y-8">
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Product Category</label>
                                    <div className="space-y-2">
                                        {categories.map(cat => (
                                            <button
                                                key={cat}
                                                onClick={() => setActiveCategory(cat)}
                                                className={`block w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${activeCategory === cat ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-500 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Verified Vendors</label>
                                    <div className="space-y-2">
                                        {vendors.map(vendor => (
                                            <button
                                                key={vendor}
                                                onClick={() => setActiveVendor(vendor)}
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
                    </aside>

                    {/* Product Grid */}
                    <div className="flex-grow">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                            {products.map((product) => {
                                const isInComparison = state.comparisonItems.some(i => i.id === product.id);
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
                                            ) : (
                                                <span className="bg-green-600/80 backdrop-blur text-white text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-widest flex items-center gap-2">
                                                    <ShieldCheck className="w-3 h-3" /> Direct Buy
                                                </span>
                                            )}
                                        </div>

                                        <button
                                            onClick={() => dispatch({
                                                type: 'TOGGLE_COMPARISON',
                                                payload: { id: product.id, name: product.name, image: product.image, category: product.category }
                                            })}
                                            className={`absolute top-6 right-6 z-10 p-3 rounded-2xl transition-all shadow-lg ${isInComparison ? 'bg-secondary text-white scale-110' : 'bg-white/90 backdrop-blur text-gray-400 hover:text-secondary'
                                                }`}
                                        >
                                            <GitCompare className="w-5 h-5" />
                                        </button>

                                        <Link to={`/product/${product.id}`} className="block aspect-[4/3] overflow-hidden bg-gray-50 relative p-4">
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                className="w-full h-full object-cover rounded-3xl group-hover:scale-105 transition-transform duration-700"
                                            />
                                        </Link>

                                        <div className="p-8">
                                            <div className="flex items-center gap-2 text-[10px] text-primary font-black uppercase tracking-widest mb-3">
                                                <Building2 className="w-3 h-3" />
                                                {product.vendor}
                                            </div>
                                            <h3 className="font-bold text-xl text-gray-900 mb-4 group-hover:text-primary transition-colors h-14 overflow-hidden">{product.name}</h3>

                                            <div className="flex items-center justify-between mt-8 pt-8 border-t border-gray-50">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                                                        {product.purchase_model === 'rfq' ? 'Project Est.' : 'Ex-Works Price'}
                                                    </span>
                                                    <span className="text-2xl font-black text-gray-900">${product.price.toLocaleString()}</span>
                                                </div>
                                                <button
                                                    onClick={() => dispatch({
                                                        type: 'ADD_ITEM',
                                                        payload: { id: product.id, name: product.name, price: product.price, quantity: 1, image: product.image, vendor: product.vendor }
                                                    })}
                                                    className={`p-4 rounded-2xl transition-all shadow-xl hover:-translate-y-1 active:scale-95 ${product.purchase_model === 'rfq' ? 'bg-gray-100 text-gray-400 hover:bg-primary hover:text-white' : 'bg-gray-900 text-white hover:bg-primary'
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
                                // Logic to remove all
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
