import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    ShoppingCart, Send, ShieldCheck, Truck, FileText,
    ChevronRight, Minus, Plus, GitCompare, Share2,
    Download, CheckCircle, AlertCircle,
    X, CheckCircle2, BookOpen, ArrowUpRight, Building2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api, supabase } from '../services/api';
import { useCart } from '../context/CartContext';
import { useEnquiry } from '../context/EnquiryContext';

const ProductDetail: React.FC = () => {
    const { id } = useParams();
    // const navigate = useNavigate();
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedVariant, setSelectedVariant] = useState<any>(null);
    const [selectedVendor, setSelectedVendor] = useState<any>(null);
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'docs'>('desc');
    const [activeImage, setActiveImage] = useState<string>('');

    // RFQ State
    const [showRFQModal, setShowRFQModal] = useState(false);
    const [rfqSubmitted, setRfqSubmitted] = useState(false);
    const [rfqSubmitting, setRfqSubmitting] = useState(false);
    const [rfqForm, setRfqForm] = useState<Record<string, any>>({});
    const [rfqError, setRfqError] = useState<string | null>(null);

    // Contexts
    const { addToCart } = useCart();
    const { state: enquiryState, dispatch: enquiryDispatch } = useEnquiry();

    useEffect(() => {
        loadProduct();
    }, [id]);

    useEffect(() => {
        if (product) {
            const productImages = Array.isArray(product.images) && product.images.length > 0
                ? product.images
                : [product.image || 'https://placehold.co/600x600?text=No+Image'];
            setActiveImage(productImages[0]);
        }
    }, [product]);

    const loadProduct = async () => {
        setLoading(true);
        try {
            if (!id) return;
            const res = await api.products.get(id);
            if (res.status === 'success') {
                setProduct(res.data);
                // Set initial selected variant if multiple exist
                if (res.data.variants && res.data.variants.length > 0) {
                    setSelectedVariant(res.data.variants[0]);
                }
            }
        } catch (err) {
            console.error('Failed to load product', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-32 flex items-center justify-center bg-neutral-50">
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-neutral-500 font-medium animate-pulse">Loading asset details...</p>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen pt-32 flex flex-col items-center justify-center bg-neutral-50">
                <h2 className="text-2xl font-bold text-neutral-900 mb-2">Asset Not Found</h2>
                <Link to="/products" className="text-primary hover:underline">Return to Marketplace</Link>
            </div>
        );
    }

    const activePrice = selectedVariant ? selectedVariant.price : (product.price || 0);
    const isRFQ = product.purchase_model === 'rfq' || !product.purchase_model; // Default to RFQ if undefined
    const isDirectBuy = product.purchase_model === 'direct_buy' || product.purchase_model === 'direct';
    const isBoth = product.purchase_model === 'both';

    const isInComparison = enquiryState.comparisonItems.some(i => i.id === product.id);

    // Handling Images
    const rawImages = Array.isArray(product.images) && product.images.length > 0
        ? product.images
        : [product.image || 'https://placehold.co/600x600?text=No+Image'];

    const getImageUrl = (url: string) => {
        if (!url) return 'https://placehold.co/600x600?text=No+Image';
        const driveMatch = url.match(/drive\.google\.com\/(?:file\/d\/|open\?id=)([a-zA-Z0-9_-]+)/);
        return driveMatch ? `https://drive.google.com/uc?id=${driveMatch[1]}` : url;
    };
    const images = rawImages.map(getImageUrl);


    return (
        <div className="min-h-screen bg-neutral-50 pt-28 pb-20">
            {/* Breadcrumb Navigation */}
            <div className="container mx-auto px-4 max-w-7xl mb-8">
                <div className="flex items-center gap-2 text-sm text-neutral-500 overflow-x-auto whitespace-nowrap pb-2">
                    <Link to="/" className="hover:text-primary transition-colors">Home</Link>
                    <ChevronRight className="w-4 h-4 text-neutral-300 flex-shrink-0" />
                    <Link to="/products" className="hover:text-primary transition-colors">Marketplace</Link>
                    <ChevronRight className="w-4 h-4 text-neutral-300 flex-shrink-0" />
                    <span className="text-neutral-900 font-medium truncate">{product.name}</span>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-7xl">
                <div className="grid lg:grid-cols-2 gap-12 xl:gap-20 items-start">

                    {/* Left Column: Visuals */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6 lg:sticky lg:top-32"
                    >
                        <div className="bg-white rounded-[40px] overflow-hidden shadow-sm border border-neutral-100 aspect-[4/3] relative group">
                            <img
                                src={getImageUrl(activeImage)}
                                alt={product.name}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute top-6 left-6 flex flex-col gap-2">
                                {isRFQ && (
                                    <span className="bg-white/90 backdrop-blur text-neutral-900 text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-widest shadow-sm border border-white/20">
                                        RFQ Only
                                    </span>
                                )}
                            </div>
                            <button className="absolute top-6 right-6 p-3 bg-white/50 backdrop-blur hover:bg-white rounded-full transition-all text-neutral-900 shadow-sm border border-white/20">
                                <Share2 className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Thumbnails */}
                        {images.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                                {images.map((img: string, idx: number) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImage(img)}
                                        className={`w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all flex-shrink-0 ${activeImage === img ? 'border-primary shadow-lg scale-105' : 'border-transparent opacity-70 hover:opacity-100'}`}
                                    >
                                        <img src={img} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Trust Badges */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white p-5 rounded-2xl border border-neutral-100 flex items-center gap-4 shadow-sm">
                                <div className="bg-green-50 p-3 rounded-xl">
                                    <ShieldCheck className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="font-bold text-neutral-900 text-sm">Verified Supplier</p>
                                    <p className="text-xs text-neutral-500">ISO 9001:2015 Certified</p>
                                </div>
                            </div>
                            <div className="bg-white p-5 rounded-2xl border border-neutral-100 flex items-center gap-4 shadow-sm">
                                <div className="bg-blue-50 p-3 rounded-xl">
                                    <Truck className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="font-bold text-neutral-900 text-sm">Pan-India Delivery</p>
                                    <p className="text-xs text-neutral-500">Logistics Support</p>
                                </div>
                            </div>
                        </div>

                        {/* Knowledge Hub Linkage Section - Moved to Sidebar for better layout balance */}
                        <div className="mt-8 pt-8 border-t border-neutral-200">
                            <div className="bg-neutral-900 text-white p-6 rounded-[32px] relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/30 transition-all duration-500"></div>
                                <h3 className="text-lg font-bold mb-2 relative z-10 flex items-center gap-2">
                                    <BookOpen className="w-5 h-5 text-primary" /> Industrial Insights
                                </h3>
                                <p className="text-white/70 text-sm mb-4 relative z-10 leading-relaxed">
                                    Learn more about {product.categories?.name || 'this equipment'} safety standards and optimization guides.
                                </p>
                                <Link to="/knowledge-hub" className="inline-flex items-center gap-2 text-primary font-bold text-sm hover:text-white transition-colors relative z-10">
                                    Explore Knowledge Hub <ArrowUpRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Column: Info & Actions */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex flex-col h-full"
                    >
                        <div className="bg-white p-8 md:p-10 rounded-[40px] shadow-sm border border-neutral-100">
                            <div className="mb-6 flex items-center justify-between">
                                <Link to="/products" className="text-xs font-bold text-primary uppercase tracking-widest hover:underline bg-primary/5 px-3 py-1 rounded-full">
                                    {product.categories?.name || product.category || 'Industrial Equipment'}
                                </Link>
                                <div className="flex items-center gap-2 text-neutral-400 text-xs font-bold uppercase tracking-wider">
                                    <Building2 className="w-4 h-4" />
                                    {product.profiles?.company_name || 'Verified Vendor'}
                                </div>
                            </div>

                            <h1 className="text-4xl md:text-5xl font-display font-bold text-neutral-900 mb-6 leading-tight">
                                {product.name}
                            </h1>

                            <div className="flex flex-col md:flex-row md:items-end gap-4 mb-8 pb-8 border-b border-neutral-100">
                                <div>
                                    <p className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-1">
                                        {isRFQ ? 'Estimated Project Cost' : 'Ex-Works Price'}
                                    </p>
                                    <div className="flex items-baseline gap-2">
                                        <p className="text-4xl font-bold text-neutral-900 font-display">
                                            ₹{Number(activePrice).toLocaleString()}
                                        </p>
                                        <span className="text-lg text-neutral-500 font-medium">
                                            {product.unit ? `/ ${product.unit}` : ''}
                                        </span>
                                    </div>
                                </div>
                                {isRFQ && <span className="text-xs font-medium text-neutral-400 bg-neutral-100 px-3 py-1 rounded-lg self-start md:self-auto md:mb-2">Excl. Taxes & Shipping</span>}
                            </div>

                            {/* Variants Selection (if any) */}
                            {product.variants && product.variants.length > 0 && (
                                <div className="mb-8">
                                    <label className="block text-xs font-black text-neutral-400 uppercase tracking-widest mb-4">Select Configuration</label>
                                    <div className="flex flex-wrap gap-3">
                                        {product.variants.map((variant: any, i: number) => {
                                            const isSelected = selectedVariant?.id === variant.id || (!selectedVariant && i === 0);
                                            const label = Object.entries(variant.attributes || {}).map(([key, val]) => `${key}: ${val}`).join(' | ') || variant.name || `Option ${i + 1}`;
                                            return (
                                                <button
                                                    key={variant.id || i}
                                                    onClick={() => setSelectedVariant(variant)}
                                                    className={`px-4 py-3 rounded-xl text-sm font-bold border-2 transition-all ${isSelected
                                                        ? 'border-neutral-900 bg-neutral-900 text-white shadow-lg'
                                                        : 'border-neutral-100 text-neutral-600 hover:border-neutral-300 bg-neutral-50'
                                                        }`}
                                                >
                                                    {label}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Vendor Selection (if multiple) */}
                            {product.vendors && product.vendors.length > 0 && (
                                <div className="mb-8 p-6 bg-gradient-to-br from-neutral-50 to-white rounded-2xl border border-neutral-200">
                                    <h4 className="font-bold text-neutral-900 text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <Building2 className="w-4 h-4 text-primary" /> Vendor Options ({product.vendor_count})
                                    </h4>
                                    <div className="space-y-3">
                                        {product.vendors.map((vendor: any) => {
                                            const isSelected = selectedVendor?.vendor_id === vendor.vendor_id;
                                            return (
                                                <button
                                                    key={vendor.vendor_id}
                                                    onClick={() => setSelectedVendor(vendor)}
                                                    className={`w-full p-4 rounded-xl text-left transition-all border-2 flex justify-between items-center ${isSelected
                                                        ? 'bg-white border-primary shadow-md'
                                                        : 'bg-white border-transparent hover:border-neutral-200'
                                                        }`}
                                                >
                                                    <div>
                                                        <div className="font-bold text-neutral-900">{vendor.profiles?.company_name || 'Vendor'}</div>
                                                        <div className={`text-xs font-bold mt-1 ${vendor.vendor_stock_quantity > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                                            {vendor.vendor_stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-bold text-lg">₹{vendor.vendor_price?.toLocaleString()}</div>
                                                        {vendor.vendor_lead_time_days && <div className="text-xs text-neutral-500">{vendor.vendor_lead_time_days} Days Lead Time</div>}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Actions Area */}
                            <div className="flex flex-col gap-4">
                                {(isDirectBuy || isBoth) && (
                                    <div className="flex gap-4">
                                        <div className="w-32 flex items-center justify-between bg-neutral-50 px-4 py-2 rounded-2xl border border-neutral-200">
                                            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 hover:text-primary"><Minus className="w-4 h-4" /></button>
                                            <span className="text-lg font-bold text-neutral-900">{quantity}</span>
                                            <button onClick={() => setQuantity(quantity + 1)} className="p-2 hover:text-primary"><Plus className="w-4 h-4" /></button>
                                        </div>
                                        <button
                                            onClick={async () => {
                                                await addToCart(product.id, quantity, selectedVariant, selectedVendor);
                                                window.location.href = '/cart';
                                            }}
                                            disabled={(selectedVendor ? (selectedVendor.vendor_stock_quantity || 0) : (product.stock_quantity || 0)) === 0}
                                            className="flex-1 py-4 bg-primary text-white rounded-2xl font-black text-lg shadow-lg shadow-primary/30 hover:bg-primary-dark transition-all flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ShoppingCart className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                            Buy Now
                                        </button>
                                    </div>
                                )}

                                {(isRFQ || isBoth) && (
                                    <button
                                        onClick={() => setShowRFQModal(true)}
                                        className="w-full py-5 bg-neutral-900 text-white rounded-2xl font-black text-lg shadow-lg shadow-neutral-900/30 hover:bg-black transition-all flex items-center justify-center gap-3 group"
                                    >
                                        <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                        Request Technical Quote
                                    </button>
                                )}

                                <div className="grid grid-cols-2 gap-4 mt-2">
                                    <button
                                        onClick={() => {
                                            enquiryDispatch({
                                                type: 'ADD_ITEM',
                                                payload: {
                                                    id: product.id,
                                                    name: product.name,
                                                    price: Number(activePrice),
                                                    quantity: 1,
                                                    image: activeImage,
                                                    vendor: product.vendor
                                                }
                                            });
                                            alert("Added to Enquiry List");
                                        }}
                                        className="py-3 bg-white border-2 border-neutral-100 text-neutral-900 rounded-xl font-bold text-sm hover:border-neutral-300 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" /> Add to List
                                    </button>
                                    <button
                                        onClick={() => {
                                            enquiryDispatch({
                                                type: 'TOGGLE_COMPARISON',
                                                payload: { id: product.id, name: product.name, image: activeImage, category: product.category || product.categories?.name, attributes: product.attributes }
                                            });
                                        }}
                                        className={`py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 border-2 ${isInComparison ? 'bg-secondary/10 border-secondary text-secondary' : 'bg-white border-neutral-100 text-neutral-900 hover:border-neutral-300'}`}
                                    >
                                        <GitCompare className="w-4 h-4" /> {isInComparison ? 'Comparing' : 'Compare'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Tabs: Description, Specs, Docs */}
                        <div className="mt-12">
                            <div className="flex border-b border-neutral-200 mb-8 overflow-x-auto">
                                {(['desc', 'specs', 'docs'] as const).map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`px-6 py-4 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${activeTab === tab
                                            ? 'border-primary text-primary'
                                            : 'border-transparent text-neutral-400 hover:text-neutral-600'
                                            }`}
                                    >
                                        {tab === 'desc' ? 'Description' : tab === 'specs' ? 'Specifications' : 'Documentation'}
                                    </button>
                                ))}
                            </div>

                            <div className="prose prose-neutral max-w-none text-neutral-600 leading-relaxed min-h-[300px]">
                                {activeTab === 'desc' && (
                                    <div className="animate-fade-in">
                                        <p className="mb-6 text-lg">{product.description}</p>
                                        <div className="bg-neutral-50 p-6 rounded-2xl border border-neutral-100">
                                            <h4 className="font-bold text-neutral-900 mb-4">Why choose this asset?</h4>
                                            <ul className="space-y-3">
                                                <li className="flex items-start gap-3">
                                                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                                                    <span>Engineered for high-yield Bio-CNG production environments.</span>
                                                </li>
                                                <li className="flex items-start gap-3">
                                                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                                                    <span>Compliant with Indian Industrial Safety Standards (IIS).</span>
                                                </li>
                                                <li className="flex items-start gap-3">
                                                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                                                    <span>Full after-sales support and spare parts availability.</span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'specs' && (
                                    <div className="animate-fade-in">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                                            {/* Dynamic Specs Rendering */}
                                            {Object.entries({ ...product.attributes, ...(selectedVariant?.attributes || {}) }).map(([key, value], i) => (
                                                <div key={i} className="flex justify-between border-b border-neutral-100 py-3">
                                                    <span className="font-medium text-neutral-900 capitalize">{key.replace(/_/g, ' ')}</span>
                                                    <span className="text-neutral-600">{String(value)}</span>
                                                </div>
                                            ))}
                                            {/* Fallback Static Specs if none */}
                                            {Object.keys({ ...product.attributes, ...(selectedVariant?.attributes || {}) }).length === 0 && (
                                                <div className="bg-yellow-50 p-4 rounded-xl text-yellow-700 text-sm font-medium flex items-center gap-2">
                                                    <AlertCircle className="w-5 h-5" /> Detailed technical specifications are available in the datasheet.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'docs' && (
                                    <div className="space-y-4 animate-fade-in">
                                        {product.documents && product.documents.map((doc: any, i: number) => (
                                            <a
                                                key={i}
                                                href={doc.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="flex items-center justify-between p-5 bg-white border border-neutral-200 rounded-2xl hover:border-primary hover:shadow-md transition-all group"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="p-3 bg-neutral-50 rounded-xl group-hover:bg-primary/10 transition-colors">
                                                        <FileText className="w-6 h-6 text-neutral-400 group-hover:text-primary" />
                                                    </div>
                                                    <div>
                                                        <span className="font-bold text-neutral-900 block group-hover:text-primary">{doc.name}</span>
                                                        <span className="text-xs text-neutral-500 uppercase tracking-wider font-bold">PDF Document</span>
                                                    </div>
                                                </div>
                                                <Download className="w-5 h-5 text-neutral-300 group-hover:text-primary" />
                                            </a>
                                        ))}
                                        {(!product.documents || product.documents.length === 0) && (
                                            <div className="flex items-center justify-between p-5 bg-neutral-50 border border-dashed border-neutral-200 rounded-2xl">
                                                <span className="text-neutral-500 font-medium">No public documentation available. Please request via RFQ.</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                    </motion.div>
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
                            className="absolute inset-0 bg-neutral-900/80 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 30 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 30 }}
                            className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl relative z-10 overflow-hidden"
                        >
                            {rfqSubmitted ? (
                                <div className="p-16 text-center flex flex-col items-center">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6"
                                    >
                                        <CheckCircle2 className="w-12 h-12" />
                                    </motion.div>
                                    <h3 className="text-3xl font-display font-bold text-neutral-900 mb-4">Enquiry Sent!</h3>
                                    <p className="text-neutral-500 max-w-sm mb-10 leading-relaxed">
                                        Your technical requirements for <span className="font-bold text-neutral-900">{product.name}</span> have been transmitted to our engineering desk.
                                    </p>
                                    <button
                                        onClick={() => setShowRFQModal(false)}
                                        className="bg-neutral-900 text-white px-10 py-4 rounded-xl font-bold hover:bg-black transition-colors"
                                    >
                                        Dismiss
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="bg-neutral-900 p-8 flex justify-between items-start relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                                        <div className="relative z-10">
                                            <h2 className="text-2xl font-bold text-white mb-1">Technical Enquiry</h2>
                                            <p className="text-white/60 text-sm font-medium">Get a formal quotation for your project.</p>
                                        </div>
                                        <button onClick={() => setShowRFQModal(false)} className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all relative z-10">
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                                        <div className="flex items-center gap-4 mb-8 p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                                            <div className="w-16 h-16 bg-white rounded-xl overflow-hidden border border-neutral-200 flex-shrink-0">
                                                <img src={activeImage} referrerPolicy="no-referrer" className="w-full h-full object-cover"></img>
                                            </div>
                                            <div>
                                                <p className="font-bold text-neutral-900 line-clamp-1">{product.name}</p>
                                                <p className="text-xs text-neutral-500 mt-1">ID: {product.sku || 'N/A'}</p>
                                            </div>
                                        </div>

                                        <form onSubmit={async (e) => {
                                            e.preventDefault();
                                            setRfqSubmitting(true);
                                            setRfqError(null);
                                            try {
                                                const { data: { session } } = await supabase.auth.getSession();
                                                const token = session?.access_token;
                                                // Allow submission even if typical login flow isn't fully set up for this demo, 
                                                // but ideally required.
                                                if (!token) throw new Error('Please login to submit a technical enquiry');

                                                const res = await api.rfqs.submit(token, {
                                                    product_id: product.id,
                                                    vendor_id: selectedVendor?.vendor_id,
                                                    submitted_fields: rfqForm
                                                });

                                                if (res.status === 'success') {
                                                    setRfqSubmitted(true);
                                                } else {
                                                    throw new Error(res.message || 'Submission failed');
                                                }
                                            } catch (err: any) {
                                                console.error(err);
                                                // Mock success for demo if backend fails or no auth
                                                // setRfqSubmitted(true); // Uncomment to force success for UI demo
                                                setRfqError(err.message);
                                            } finally {
                                                setRfqSubmitting(false);
                                            }
                                        }} className="space-y-6">
                                            {rfqError && (
                                                <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold flex items-center gap-2">
                                                    <AlertCircle className="w-4 h-4" /> {rfqError}
                                                </div>
                                            )}

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {(product.min_rfq_fields?.length > 0 ? product.min_rfq_fields : [
                                                    { label: 'Company Name', type: 'text', placeholder: 'e.g. Acme Corp', required: true },
                                                    { label: 'Contact Person', type: 'text', placeholder: 'John Doe', required: true },
                                                    { label: 'Project Location', type: 'text', placeholder: 'Site City, State', required: true },
                                                    { label: 'Expected Volume / Requirements', type: 'text', placeholder: 'Detailed Requirements', required: true },
                                                    { label: 'Timeline', type: 'select', options: ['Immediate', '1-3 Months', 'Budgeting'], required: true }
                                                ]).map((field: any, i: number) => (
                                                    <div key={i} className={field.type === 'textarea' ? 'col-span-full' : ''}>
                                                        <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2">
                                                            {field.label} {field.required && <span className="text-primary">*</span>}
                                                        </label>
                                                        {field.type === 'select' ? (
                                                            <div className="relative">
                                                                <select
                                                                    required={field.required}
                                                                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-4 font-bold outline-none focus:ring-2 focus:ring-primary/20 appearance-none"
                                                                    onChange={(e) => setRfqForm({ ...rfqForm, [field.label]: e.target.value })}
                                                                >
                                                                    <option value="">Select Option</option>
                                                                    {field.options?.map((opt: string) => <option key={opt}>{opt}</option>)}
                                                                </select>
                                                                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 rotate-90 pointer-events-none" />
                                                            </div>
                                                        ) : (
                                                            <input
                                                                required={field.required}
                                                                type={field.type}
                                                                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-4 font-medium outline-none focus:ring-2 focus:ring-primary/20 text-neutral-900 placeholder:text-neutral-400"
                                                                placeholder={field.placeholder}
                                                                onChange={(e) => setRfqForm({ ...rfqForm, [field.label]: e.target.value })}
                                                            />
                                                        )}
                                                    </div>
                                                ))}

                                                {/* Preferred Vendor Selection */}
                                                {product.vendors?.length > 0 && (
                                                    <div className="col-span-full">
                                                        <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2">
                                                            Preferred Vendor
                                                        </label>
                                                        <div className="relative">
                                                            <select
                                                                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-4 font-bold outline-none focus:ring-2 focus:ring-primary/20 appearance-none"
                                                                onChange={(e) => {
                                                                    const vId = e.target.value;
                                                                    const vendor = product.vendors.find((v: any) => v.vendor_id === vId);
                                                                    setSelectedVendor(vendor || null);
                                                                }}
                                                                value={selectedVendor?.vendor_id || ""}
                                                            >
                                                                <option value="">Any / Preferred Vendor</option>
                                                                {product.vendors.map((v: any) => (
                                                                    <option key={v.vendor_id} value={v.vendor_id}>
                                                                        {v.profiles?.company_name || 'Vendor'} (₹{v.vendor_price?.toLocaleString()})
                                                                    </option>
                                                                ))}
                                                            </select>
                                                            <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 rotate-90 pointer-events-none" />
                                                        </div>
                                                        <p className="text-[10px] text-neutral-400 mt-2 italic">Leave as "Any Vendor" to let our procurement team find the best match for you.</p>
                                                    </div>
                                                )}

                                                <div className="col-span-full">
                                                    <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2">Technical Remarks</label>
                                                    <textarea
                                                        className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-4 font-medium outline-none focus:ring-2 focus:ring-primary/20 h-32 resize-none placeholder:text-neutral-400"
                                                        placeholder="Describe specific customization needs, feedstock details, or installation constraints..."
                                                        onChange={(e) => setRfqForm({ ...rfqForm, 'Remarks': e.target.value })}
                                                    ></textarea>
                                                </div>
                                            </div>

                                            <button
                                                disabled={rfqSubmitting}
                                                type="submit"
                                                className="w-full bg-primary text-white font-black py-4 rounded-xl shadow-xl hover:shadow-2xl hover:bg-primary-dark transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                                            >
                                                {rfqSubmitting ? (
                                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                ) : (
                                                    <><Send className="w-5 h-5" /> Submit Request</>
                                                )}
                                            </button>
                                        </form>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProductDetail;
