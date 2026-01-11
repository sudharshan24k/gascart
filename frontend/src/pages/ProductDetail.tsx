import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ClipboardList,
    GitCompare,
    ShieldCheck,
    Truck,
    Building2,
    Download,
    MessageSquare,
    ChevronRight,
    X,
    CheckCircle2
} from 'lucide-react';
import { api } from '../services/api';

const ProductDetail: React.FC = () => {
    const { id } = useParams();
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showRFQModal, setShowRFQModal] = useState(false);
    const [rfqSubmitted, setRfqSubmitted] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            if (id) {
                const res = await api.products.get(id);
                if (res.status === 'success') {
                    setProduct(res.data);
                }
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    if (loading) return <div className="pt-32 text-center text-gray-500 font-bold">Retrieving technical specifications...</div>;
    if (!product) return <div className="pt-32 text-center text-red-500 font-bold">Industrial asset not found</div>;

    const isDirectBuy = product.purchase_model === 'direct';

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
                                src={product.images?.[0] || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80'}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Documentation Links (Placeholder logic for now) */}
                        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2 text-lg">
                                <Download className="w-5 h-5 text-primary" /> Technical Documentation
                            </h3>
                            <div className="space-y-3">
                                {['Technical datasheet.pdf', 'Installation Guide.pdf'].map((doc, i) => (
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
                                    {product.categories?.name || 'Equipment'}
                                </span>
                                <div className="flex items-center gap-2 text-gray-400 text-xs font-bold">
                                    <Building2 className="w-4 h-4" />
                                    {product.vendor_id ? 'Verified Vendor' : 'Factory Direct'}
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
                                    {Object.entries(product.attributes || {}).map(([key, value], i) => (
                                        <div key={i} className="flex flex-col gap-1">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{key}</span>
                                            <span className="text-sm font-bold text-gray-700">{String(value)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col gap-4">
                                {isDirectBuy ? (
                                    <div className="space-y-4">
                                        <button className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-5 px-8 rounded-2xl shadow-lg transition-all flex flex-col items-center justify-center transform hover:-translate-y-1">
                                            <span className="text-lg">Buy Now (50% Advance)</span>
                                            <span className="text-xs opacity-80 font-medium">Pay ${(product.price * 0.5).toLocaleString()} today</span>
                                        </button>
                                        <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                            Remaining 50% processed via manual invoicing
                                        </p>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setShowRFQModal(true)}
                                        className="w-full bg-gray-900 hover:bg-primary text-white font-bold py-5 px-8 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-3 transform hover:-translate-y-1"
                                    >
                                        <ClipboardList className="w-5 h-5" />
                                        Request RFQ for Engineering Content
                                    </button>
                                )}
                                <button className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold py-5 px-8 rounded-2xl transition-all flex items-center justify-center gap-3">
                                    <GitCompare className="w-5 h-5" />
                                    Add to Compare
                                </button>
                            </div>

                            <div className="mt-8 pt-8 border-t border-gray-50 flex items-center justify-center gap-8">
                                <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-tighter">
                                    <ShieldCheck className="w-4 h-4 text-green-500" /> Verified Supplier
                                </div>
                                <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-tighter">
                                    <Truck className="w-4 h-4 text-blue-500" /> Industrial Logistics
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* RFQ Modal */}
            <AnimatePresence>
                {showRFQModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowRFQModal(false)}
                            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl relative z-10 overflow-hidden"
                        >
                            <div className="p-10">
                                <div className="flex justify-between items-start mb-8">
                                    <div>
                                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Request Technical Quote</h2>
                                        <p className="text-gray-500 font-medium font-sans">For {product.name}</p>
                                    </div>
                                    <button onClick={() => setShowRFQModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-all">
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                {rfqSubmitted ? (
                                    <div className="py-20 text-center">
                                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <CheckCircle2 className="w-10 h-10" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-900 mb-4">Request Successfully Logged</h3>
                                        <p className="text-gray-500 max-w-sm mx-auto mb-10">Our engineering team has been notified. You will receive a technical proposal within 48 business hours.</p>
                                        <button
                                            onClick={() => setShowRFQModal(false)}
                                            className="bg-gray-900 text-white px-10 py-4 rounded-2xl font-bold"
                                        >
                                            Dismiss
                                        </button>
                                    </div>
                                ) : (
                                    <form onSubmit={(e) => { e.preventDefault(); setRfqSubmitted(true); }} className="space-y-6">
                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Estimated Capacity Needed</label>
                                                <input type="text" className="w-full bg-gray-50 border-none rounded-xl p-4 outline-none ring-2 ring-transparent focus:ring-primary/10 transition-all font-medium" placeholder="e.g. 500 m3/h" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Project Timeline</label>
                                                <select className="w-full bg-gray-50 border-none rounded-xl p-4 outline-none ring-2 ring-transparent focus:ring-primary/10 transition-all font-medium">
                                                    <option>Immediate (1-3 months)</option>
                                                    <option>Planning (6+ months)</option>
                                                    <option>Budgetary Quote Only</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Site Location</label>
                                            <input type="text" className="w-full bg-gray-50 border-none rounded-xl p-4 outline-none ring-2 ring-transparent focus:ring-primary/10 transition-all font-medium" placeholder="City, State" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Additional Technical Requirements</label>
                                            <textarea className="w-full bg-gray-50 border-none rounded-xl p-4 outline-none ring-2 ring-transparent focus:ring-primary/10 transition-all font-medium h-32" placeholder="Describe any site-specific constraints or feed gas composition details..."></textarea>
                                        </div>
                                        <button type="submit" className="w-full bg-primary text-white font-bold py-5 rounded-2xl shadow-xl hover:shadow-2xl transition-all">
                                            Submit Technical Enquiry
                                        </button>
                                    </form>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProductDetail;
