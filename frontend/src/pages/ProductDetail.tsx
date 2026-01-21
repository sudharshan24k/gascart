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
    ChevronRight,
    X,
    CheckCircle2,
    BookOpen,
    ArrowUpRight,
    Send,
    ShoppingCart
} from 'lucide-react';
import { api } from '../services/api';
import { useEnquiry } from '../context/EnquiryContext';
import { useCart } from '../context/CartContext';

const ProductDetail: React.FC = () => {
    const { id } = useParams();
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedVariant, setSelectedVariant] = useState<any>(null); // For handling variants
    const [showRFQModal, setShowRFQModal] = useState(false);
    const [rfqSubmitted, setRfqSubmitted] = useState(false);
    const [rfqSubmitting, setRfqSubmitting] = useState(false);
    const [rfqForm, setRfqForm] = useState<Record<string, any>>({});
    const [rfqError, setRfqError] = useState<string | null>(null);
    const { state, dispatch } = useEnquiry();
    const { addToCart } = useCart();

    useEffect(() => {
        const fetchProduct = async () => {
            if (id) {
                const res = await api.products.get(id);
                if (res.status === 'success') {
                    setProduct(res.data);
                    // Default to first variant if exists and active
                    if (res.data.variants && res.data.variants.length > 0) {
                        setSelectedVariant(res.data.variants[0]);
                    }
                }
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const activePrice = selectedVariant ? selectedVariant.price : (product?.price || 0);


    if (loading) return <div className="pt-32 text-center text-gray-500 font-bold">Retrieving technical specifications...</div>;
    if (!product) return <div className="pt-32 text-center text-red-500 font-bold">Industrial asset not found</div>;

    const isInComparison = state.comparisonItems.some(i => i.id === product.id);
    const purchaseModel = product.purchase_model || 'rfq';
    const isDirectBuy = purchaseModel === 'direct';
    const isRFQ = purchaseModel === 'rfq';
    const isBoth = purchaseModel === 'both';

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

                        {/* Documentation Links */}
                        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2 text-lg">
                                <Download className="w-5 h-5 text-primary" /> Technical Documentation
                            </h3>
                            <div className="space-y-3">
                                {['ISO Quality Certificate.pdf', 'Technical Datasheet.pdf', 'Integration Manual.pdf'].map((doc, i) => (
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
                                    {product.profiles?.company_name ? `Verified Vendor: ${product.profiles.company_name}` : 'Factory Direct'}
                                </div>
                            </div>

                            <h1 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
                                {product.name}
                            </h1>

                            <div className="flex items-baseline gap-2 mb-6">
                                <span className="text-4xl font-bold text-gray-900">₹{activePrice.toLocaleString()}</span>
                                <span className="text-gray-400 font-bold text-xs uppercase tracking-widest">Net ex-works</span>
                            </div>

                            {/* Variants Selector */}
                            {product.variants && product.variants.length > 0 && (
                                <div className="mb-10 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                                    <h4 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider">Select Option</h4>
                                    <div className="flex flex-wrap gap-3">
                                        {product.variants.map((v: any, i: number) => {
                                            const isSelected = selectedVariant?.id === v.id || (!selectedVariant && i === 0);
                                            // Handle attribute object to string
                                            const label = Object.entries(v.attributes || {}).map(([key, val]) => `${key}: ${val}`).join(' | ') || `Option ${i + 1}`;
                                            return (
                                                <button
                                                    key={i}
                                                    onClick={() => setSelectedVariant(v)}
                                                    className={`px-4 py-3 rounded-xl text-sm font-bold border transition-all ${isSelected
                                                        ? 'bg-primary text-white border-primary shadow-lg shadow-primary/25'
                                                        : 'bg-white text-gray-600 border-gray-200 hover:border-primary/50'
                                                        }`}
                                                >
                                                    {label}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            <p className="text-gray-600 text-lg leading-relaxed mb-10 pb-10 border-b border-gray-50">
                                {product.description}
                            </p>

                            {/* Specifications Grid */}
                            <div className="mb-12 bg-gray-50 p-8 rounded-3xl">
                                <h3 className="font-bold text-gray-900 mb-6 text-lg">Technical Specifications</h3>
                                <div className="grid grid-cols-2 gap-y-6 gap-x-12">
                                    {/* Merge Product Attributes and Variant Attributes */}
                                    {Object.entries({ ...product.attributes, ...(selectedVariant?.attributes || {}) }).map(([key, value], i) => (
                                        <div key={i} className="flex flex-col gap-1 border-b border-gray-100 pb-2">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{key}</span>
                                            <span className="text-sm font-bold text-gray-700">{String(value)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col gap-4">
                                {(isDirectBuy || isBoth) && (
                                    <button
                                        onClick={async () => {
                                            await addToCart(product.id, 1, selectedVariant);
                                            window.location.href = '/cart';
                                        }}
                                        className="w-full bg-primary hover:bg-primary-dark text-white font-black py-5 px-8 rounded-2xl shadow-xl transition-all flex flex-col items-center justify-center transform hover:-translate-y-1"
                                    >
                                        <div className="flex items-center gap-3">
                                            <ShoppingCart className="w-6 h-6" />
                                            <span className="text-lg">Add to Cart</span>
                                        </div>
                                        <span className="text-xs opacity-80 font-medium tracking-tight">Available for Immediate Dispatch</span>
                                    </button>
                                )}

                                {(isRFQ || isBoth) && (
                                    <button
                                        onClick={() => setShowRFQModal(true)}
                                        className="w-full bg-gray-900 hover:bg-primary text-white font-black py-6 px-8 rounded-2xl shadow-2xl transition-all flex items-center justify-center gap-3 transform hover:-translate-y-1"
                                    >
                                        <Send className="w-5 h-5" />
                                        Initiate Technical RFQ
                                    </button>
                                )}

                                <button
                                    onClick={() => dispatch({
                                        type: 'ADD_ITEM',
                                        payload: { id: product.id, name: product.name, price: product.price, quantity: 1, image: product.images?.[0], vendor: product.vendor }
                                    })}
                                    className="w-full bg-white border-2 border-gray-100 hover:border-primary text-gray-700 font-bold py-5 px-8 rounded-2xl transition-all flex items-center justify-center gap-3"
                                >
                                    <ClipboardList className="w-5 h-5" />
                                    Add to Enquiry List {isRFQ || isBoth ? 'for Technical Review' : ''}
                                </button>

                                <button
                                    onClick={() => dispatch({
                                        type: 'TOGGLE_COMPARISON',
                                        payload: { id: product.id, name: product.name, image: product.images?.[0], category: product.category, attributes: product.attributes }
                                    })}
                                    className={`w-full py-5 px-8 rounded-2xl font-bold transition-all flex items-center justify-center gap-3 border-2 ${isInComparison ? 'bg-secondary/10 border-secondary text-secondary' : 'bg-white border-gray-100 text-gray-400 hover:border-secondary/30'
                                        }`}
                                >
                                    <GitCompare className="w-5 h-5" />
                                    {isInComparison ? 'Added to Compare' : 'Add to Compare Hub'}
                                </button>
                            </div>

                            <div className="mt-8 pt-8 border-t border-gray-50 flex items-center justify-center gap-8">
                                <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    <ShieldCheck className="w-4 h-4 text-green-500" /> ISO CERTIFIED
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    <Truck className="w-4 h-4 text-blue-500" /> GLOBAL LOGISTICS
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Knowledge Hub Linkage Section */}
                <div className="mt-32 pt-20 border-t border-gray-100">
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">Industrial Insights</h2>
                            <p className="text-gray-500">Professional guides and engineering content relevant to this asset.</p>
                        </div>
                        <Link to="/learn" className="text-primary font-bold flex items-center gap-1 hover:underline">
                            View All Resources <ArrowUpRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { title: `Optimizing ${product.name} for Biogas Plants`, category: "Engineering Guide", icon: BookOpen },
                            { title: `Safety Standards for ${product.categories?.name || 'Equipment'}`, category: "Compliance", icon: ShieldCheck },
                            { title: "Feedstock impact on component lifecycle", category: "Technical Insight", icon: BookOpen }
                        ].map((insight, i) => (
                            <div key={i} className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl transition-all cursor-pointer group">
                                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/5">
                                    <insight.icon className="w-6 h-6 text-gray-300 group-hover:text-primary transition-colors" />
                                </div>
                                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2 block">{insight.category}</span>
                                <h4 className="font-bold text-gray-900 leading-tight group-hover:text-primary transition-colors">{insight.title}</h4>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Dynamic RFQ Modal */}
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
                                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Technical Enquiry</h2>
                                        <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">Asset: {product.name}</p>
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
                                        <h3 className="text-2xl font-bold text-gray-900 mb-4">Enquiry Logged</h3>
                                        <p className="text-gray-500 max-w-sm mx-auto mb-10">Your technical requirements have been transmitted to the engineering desk. Response expected within 48 hours.</p>
                                        <button
                                            onClick={() => setShowRFQModal(false)}
                                            className="bg-gray-900 text-white px-10 py-4 rounded-xl font-bold"
                                        >
                                            Dismiss
                                        </button>
                                    </div>
                                ) : (
                                    <form onSubmit={async (e) => {
                                        e.preventDefault();
                                        setRfqSubmitting(true);
                                        setRfqError(null);
                                        try {
                                            const token = localStorage.getItem('supabase.auth.token'); // Assuming this is where it's stored
                                            if (!token) throw new Error('Please login to submit a technical enquiry');

                                            const res = await api.rfqs.submit(token, {
                                                product_id: product.id,
                                                submitted_fields: rfqForm
                                            });

                                            if (res.status === 'success') {
                                                setRfqSubmitted(true);
                                            } else {
                                                throw new Error(res.message || 'Submission failed');
                                            }
                                        } catch (err: any) {
                                            setRfqError(err.message);
                                        } finally {
                                            setRfqSubmitting(false);
                                        }
                                    }} className="space-y-6">
                                        {rfqError && (
                                            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold flex items-center gap-2">
                                                <X className="w-4 h-4" /> {rfqError}
                                            </div>
                                        )}
                                        <div className="grid grid-cols-2 gap-6">
                                            {(product.min_rfq_fields?.length > 0 ? product.min_rfq_fields : [
                                                { label: 'Site Location', type: 'text', placeholder: 'City, State', required: true },
                                                { label: 'Project Capacity', type: 'text', placeholder: 'e.g. 1000 m3/day', required: true },
                                                { label: 'Installation Timeline', type: 'select', options: ['Immediate', '3-6 Months', 'Planning Phase'], required: true }
                                            ]).map((field: any, i: number) => (
                                                <div key={i} className={field.type === 'textarea' ? 'col-span-2' : ''}>
                                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                                                        {field.label} {field.required && <span className="text-red-500">*</span>}
                                                    </label>
                                                    {field.type === 'select' ? (
                                                        <select
                                                            required={field.required}
                                                            className="w-full bg-gray-50 border-none rounded-xl p-4 font-bold outline-none focus:ring-2 focus:ring-primary/20"
                                                            onChange={(e) => setRfqForm({ ...rfqForm, [field.label]: e.target.value })}
                                                        >
                                                            <option value="">Select Option</option>
                                                            {field.options?.map((opt: string) => <option key={opt}>{opt}</option>)}
                                                        </select>
                                                    ) : field.type === 'textarea' ? (
                                                        <textarea
                                                            required={field.required}
                                                            className="w-full bg-gray-50 border-none rounded-xl p-4 font-medium outline-none focus:ring-2 focus:ring-primary/20 h-32"
                                                            placeholder={field.placeholder}
                                                            onChange={(e) => setRfqForm({ ...rfqForm, [field.label]: e.target.value })}
                                                        ></textarea>
                                                    ) : (
                                                        <input
                                                            required={field.required}
                                                            type={field.type}
                                                            className="w-full bg-gray-50 border-none rounded-xl p-4 font-medium outline-none focus:ring-2 focus:ring-primary/20"
                                                            placeholder={field.placeholder}
                                                            onChange={(e) => setRfqForm({ ...rfqForm, [field.label]: e.target.value })}
                                                        />
                                                    )}
                                                </div>
                                            ))}
                                            <div className="col-span-2">
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Additional Technical Composition Details</label>
                                                <textarea
                                                    className="w-full bg-gray-50 border-none rounded-xl p-4 font-medium outline-none focus:ring-2 focus:ring-primary/20 h-24"
                                                    placeholder="Describe feedstock parameters or customization needs..."
                                                    onChange={(e) => setRfqForm({ ...rfqForm, 'Additional Details': e.target.value })}
                                                ></textarea>
                                            </div>
                                        </div>
                                        <button
                                            disabled={rfqSubmitting}
                                            type="submit"
                                            className="w-full bg-primary text-white font-black py-5 rounded-2xl shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {rfqSubmitting ? (
                                                <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                                            ) : (
                                                <><Send className="w-5 h-5" /> Submit Technical RFQ</>
                                            )}
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
