import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Filter, Search, ClipboardList, ArrowRight, Building2, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

// Expanded Mock Data with Vendors
const MOCK_PRODUCTS = [
    { id: '1', name: 'Industrial Biogas Scrubber', price: 4500.00, image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80', category: 'Equipment', vendor: 'BioGas Solutions Inc' },
    { id: '2', name: 'Bio-CNG Cascade Cylinder', price: 1200.50, image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80', category: 'Storage', vendor: 'Green Energy Hub' },
    { id: '3', name: 'Methane Concentration Sensor', price: 245.00, image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=800&q=80', category: 'Monitoring', vendor: 'BioGas Solutions Inc' },
    { id: '4', name: 'Pressure Regulating Valve', price: 89.00, image: 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=800&q=80', category: 'Components', vendor: 'TechFlow Systems' },
];

const ProductListing: React.FC = () => {
    const [products, setProducts] = useState(MOCK_PRODUCTS);
    const [activeCategory, setActiveCategory] = useState('All');
    const [activeVendor, setActiveVendor] = useState('All');

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
                        <p className="text-gray-600 max-w-xl">Browse industrial-grade Bio-CNG equipment and services. Add items to your enquiry list to receive a combined RFQ.</p>
                    </div>
                    <div className="flex gap-4">
                        <Link
                            to="/compare"
                            className="flex items-center gap-2 bg-white text-gray-700 px-6 py-3 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all font-bold"
                        >
                            <ClipboardList className="w-5 h-5 text-primary" />
                            Review Enquiry List
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
                                    <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Categories</label>
                                    <div className="space-y-2">
                                        {categories.map(cat => (
                                            <button
                                                key={cat}
                                                onClick={() => setActiveCategory(cat)}
                                                className={`block w-full text-left px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeCategory === cat ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Vendors</label>
                                    <div className="space-y-2">
                                        {vendors.map(vendor => (
                                            <button
                                                key={vendor}
                                                onClick={() => setActiveVendor(vendor)}
                                                className={`block w-full text-left px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeVendor === vendor ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-50'
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
                        <div className="bg-primary p-8 rounded-3xl text-white">
                            <ShieldCheck className="w-10 h-10 mb-4 opacity-50" />
                            <h4 className="font-bold text-lg mb-2">Verified Suppliers</h4>
                            <p className="text-sm opacity-80 leading-relaxed">
                                All products on Gascart are sourced from ISO-certified industrial vendors.
                            </p>
                        </div>
                    </aside>

                    {/* Product Grid */}
                    <div className="flex-grow">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                            {products.map((product) => (
                                <motion.div
                                    key={product.id}
                                    layout
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all group"
                                >
                                    <Link to={`/product/${product.id}`} className="block aspect-[4/3] overflow-hidden bg-gray-100 relative">
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute top-4 left-4">
                                            <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-xs font-bold text-gray-700 shadow-sm">
                                                {product.category}
                                            </span>
                                        </div>
                                    </Link>
                                    <div className="p-6">
                                        <div className="flex items-center gap-2 text-xs text-primary font-bold mb-2">
                                            <Building2 className="w-3 h-3" />
                                            {product.vendor}
                                        </div>
                                        <h3 className="font-bold text-lg text-gray-900 mb-2 truncate">{product.name}</h3>
                                        <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-50">
                                            <span className="text-xl font-bold text-gray-900">${product.price.toLocaleString()}</span>
                                            <button className="bg-gray-900 hover:bg-primary text-white p-3 rounded-xl transition-all shadow-md">
                                                <ClipboardList className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductListing;
