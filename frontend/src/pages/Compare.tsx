import React from 'react';
import { motion } from 'framer-motion';
import { GitCompare, ClipboardList, ArrowRight, X, ShieldCheck } from 'lucide-react';
import { useEnquiry } from '../context/EnquiryContext';
import { Link } from 'react-router-dom';

const Compare: React.FC = () => {
    const { state, dispatch } = useEnquiry();
    const items = state.comparisonItems;

    if (items.length === 0) {
        return (
            <div className="pt-32 pb-24 min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="container mx-auto px-4 max-w-4xl text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white p-16 rounded-[48px] shadow-2xl border border-gray-100"
                    >
                        <div className="w-24 h-24 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-10">
                            <GitCompare className="w-12 h-12 text-secondary" />
                        </div>
                        <h1 className="text-4xl font-black text-gray-900 mb-6 uppercase tracking-tight">Technical Comparison Hub</h1>
                        <p className="text-xl text-gray-500 mb-12 leading-relaxed max-w-2xl mx-auto font-medium">
                            Select up to 4 industrial assets to compare technical parameters side-by-side and initiate a collective enquiry.
                        </p>
                        <Link
                            to="/shop"
                            className="bg-primary hover:bg-primary-dark text-white font-black py-5 px-12 rounded-2xl shadow-xl shadow-primary/20 transition-all flex items-center gap-3 mx-auto w-fit"
                        >
                            Browse Marketplace <ArrowRight className="w-5 h-5" />
                        </Link>
                    </motion.div>
                </div>
            </div>
        );
    }

    // Get unique attribute keys from all items
    const allAttributes = Array.from(new Set(items.flatMap(item => Object.keys(item.attributes || {}))));

    return (
        <div className="pt-32 pb-24 min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 max-w-7xl">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                    <div>
                        <div className="flex items-center gap-3 text-secondary mb-4">
                            <GitCompare className="w-8 h-8" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Engineering Analysis</span>
                        </div>
                        <h1 className="text-5xl font-black text-gray-900">Compare Assets</h1>
                    </div>
                    <button
                        onClick={() => {
                            // Bulk Add to Enquiry logic
                            items.forEach(i => dispatch({ type: 'ADD_ITEM', payload: { ...i, price: 0, quantity: 1, vendor: 'Various' } }));
                        }}
                        className="bg-gray-900 text-white px-10 py-5 rounded-2xl font-black shadow-2xl flex items-center gap-3 hover:bg-primary transition-all active:scale-95"
                    >
                        <ClipboardList className="w-5 h-5" /> Add Selected to Enquiry
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Items Header Grid */}
                    {items.map((item) => (
                        <motion.div
                            key={item.id}
                            layout
                            className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 relative group"
                        >
                            <button
                                onClick={() => dispatch({ type: 'REMOVE_COMPARISON', payload: item.id })}
                                className="absolute top-4 right-4 z-10 p-2 bg-gray-50 text-gray-300 hover:text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                            >
                                <X className="w-4 h-4" />
                            </button>
                            <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden mb-6">
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                            <span className="text-[10px] font-black text-primary uppercase tracking-widest block mb-2">{item.category}</span>
                            <h3 className="font-bold text-gray-900 leading-tight h-12 overflow-hidden">{item.name}</h3>
                        </motion.div>
                    ))}

                    {/* Fill remaining slots up to 4 */}
                    {[...Array(Math.max(0, 4 - items.length))].map((_, i) => (
                        <div key={i} className="hidden lg:flex flex-col items-center justify-center bg-gray-100/50 border-2 border-dashed border-gray-200 rounded-[32px] p-8 text-center opacity-40">
                            <Link to="/shop" className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4 text-gray-300">
                                <ArrowRight className="w-6 h-6" />
                            </Link>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Add Slot</span>
                        </div>
                    ))}
                </div>

                {/* Technical Parameters Table */}
                <div className="mt-16 bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-8 border-b border-gray-50 bg-gray-50/50">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-green-500" /> Technical Capability Mapping
                        </h3>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <tbody>
                                {allAttributes.map((attr) => (
                                    <tr key={attr} className="border-b border-gray-50 hover:bg-gray-50/30 transition-colors">
                                        <td className="p-8 bg-gray-50/30 w-1/4">
                                            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{attr}</span>
                                        </td>
                                        {items.map(item => (
                                            <td key={item.id} className="p-8 font-bold text-gray-700 text-sm border-l border-gray-50">
                                                {item.attributes?.[attr] || "—"}
                                            </td>
                                        ))}
                                        {/* Empty cells for visual balance */}
                                        {[...Array(Math.max(0, 4 - items.length))].map((_, i) => (
                                            <td key={i} className="p-8 border-l border-gray-50 opacity-20">—</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="mt-16 flex justify-center">
                    <Link to="/shop" className="text-gray-400 font-bold hover:text-primary transition-colors flex items-center gap-2">
                        <ArrowRight className="w-5 h-5 rotate-180" /> Continue Browsing Marketplace
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Compare;
