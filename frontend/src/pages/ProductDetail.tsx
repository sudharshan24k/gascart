import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ClipboardList,
    GitCompare,
    ShieldCheck,
    Truck,
    Building2,
    Download,
    MessageSquare,
    ChevronRight
} from 'lucide-react';

const ProductDetail: React.FC = () => {
    const { id } = useParams();

    // Mock Data adjusted for industrial needs
    const product = {
        id: id || '1',
        name: 'Industrial Biogas Scrubber',
        price: 4500.00,
        vendor: 'BioGas Solutions Inc',
        category: 'Equipment',
        description: 'Heavy-duty industrial scrubber designed for high-efficiency removal of H2S and CO2 from raw biogas. Features robust stainless steel construction and automated control systems.',
        image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
        specifications: [
            { label: 'Material', value: 'Stainless Steel 316' },
            { label: 'Capacity', value: '1000 m3/h' },
            { label: 'Operating Pressure', value: '0.5 - 2.0 bar' },
            { label: 'Purification Efficiency', value: '98%+' },
            { label: 'Control System', value: 'PLC Automated' }
        ],
        documents: ['Technical datasheet.pdf', 'Installation Guide.pdf', 'Maintenance Manual.pdf']
    };

    return (
        <div className="min-h-screen pt-32 pb-24 bg-gray-50">
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-8 font-medium">
                    <Link to="/shop" className="hover:text-primary">Marketplace</Link>
                    <ChevronRight className="w-4 h-4" />
                    <span className="text-gray-900">{product.name}</span>
                </div>

                <div className="grid lg:grid-cols-2 gap-16 items-start">
                    {/* Left: Visuals */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        <div className="bg-white rounded-[40px] overflow-hidden shadow-xl border border-gray-100 aspect-square">
                            <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Documentation Links */}
                        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2 text-lg">
                                <Download className="w-5 h-5 text-primary" /> Technical Documentation
                            </h3>
                            <div className="space-y-3">
                                {product.documents.map((doc, i) => (
                                    <button key={i} className="flex items-center justify-between w-full p-4 bg-gray-50 hover:bg-primary/5 rounded-2xl group transition-all">
                                        <span className="text-sm font-bold text-gray-600 group-hover:text-primary">{doc}</span>
                                        <Download className="w-4 h-4 text-gray-300 group-hover:text-primary" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Right: Info & Actions */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <div className="bg-white p-10 rounded-[40px] shadow-sm border border-gray-100">
                            <div className="flex items-center gap-3 text-primary mb-6">
                                <span className="bg-primary/10 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                                    {product.category}
                                </span>
                                <div className="flex items-center gap-2 text-gray-400 text-xs font-bold">
                                    <Building2 className="w-4 h-4" />
                                    {product.vendor}
                                </div>
                            </div>

                            <h1 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
                                {product.name}
                            </h1>

                            <div className="flex items-baseline gap-2 mb-10">
                                <span className="text-4xl font-bold text-gray-900">${product.price.toLocaleString()}</span>
                                <span className="text-gray-400 font-medium font-sans">Ex-works Price</span>
                            </div>

                            <p className="text-gray-600 text-lg leading-relaxed mb-10 pb-10 border-b border-gray-50">
                                {product.description}
                            </p>

                            {/* Specifications Grid */}
                            <div className="mb-12">
                                <h3 className="font-bold text-gray-900 mb-6 text-lg">Technical Specifications</h3>
                                <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                                    {product.specifications.map((spec, i) => (
                                        <div key={i} className="flex flex-col gap-1">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{spec.label}</span>
                                            <span className="text-sm font-bold text-gray-700">{spec.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="grid sm:grid-cols-2 gap-4">
                                <button className="bg-primary hover:bg-primary-dark text-white font-bold py-5 px-8 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-3 transform hover:-translate-y-1">
                                    <ClipboardList className="w-5 h-5" />
                                    Add to RFQ List
                                </button>
                                <button className="bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold py-5 px-8 rounded-2xl transition-all flex items-center justify-center gap-3">
                                    <GitCompare className="w-5 h-5" />
                                    Add to Compare
                                </button>
                            </div>

                            <div className="mt-8 pt-8 border-t border-gray-50 flex items-center justify-center gap-8">
                                <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-tighter">
                                    <ShieldCheck className="w-4 h-4 text-green-500" /> Verified Supplier
                                </div>
                                <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-tighter">
                                    <Truck className="w-4 h-4 text-blue-500" /> Global Shipping
                                </div>
                            </div>
                        </div>

                        {/* Talk to Expert Mini-Card */}
                        <div className="mt-8 bg-neutral-dark p-8 rounded-[32px] text-white flex items-center justify-between gap-6 overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full translate-x-1/2 -translate-y-1/2"></div>
                            <div>
                                <h4 className="font-bold text-lg mb-2">Need Technical Insight?</h4>
                                <p className="text-sm opacity-80 max-w-xs">Chat with a Bio-CNG consultant specifically for this equipment.</p>
                            </div>
                            <button className="bg-white text-gray-900 w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg hover:bg-primary hover:text-white transition-all shrink-0">
                                <MessageSquare className="w-6 h-6" />
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
