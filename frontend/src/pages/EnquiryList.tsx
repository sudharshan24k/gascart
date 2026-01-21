
import { useEnquiry } from '../context/EnquiryContext';
import { Trash2, ArrowRight, ClipboardList, PackageCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const EnquiryList = () => {
    const { state, dispatch } = useEnquiry();

    if (state.items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-32 text-center max-w-2xl">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-8">
                    <ClipboardList className="w-10 h-10 text-gray-300" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">No industrial items for enquiry</h2>
                <p className="text-gray-500 mb-10 text-lg">Browse our technical marketplace to add equipment or services to your Request for Quotation (RFQ) list.</p>
                <Link to="/shop" className="bg-primary text-white px-10 py-4 rounded-full font-bold shadow-lg hover:-translate-y-1 transition-all inline-block">
                    Explore Marketplace
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-32 pb-24 bg-gray-50">
            <div className="container mx-auto px-4 max-w-7xl">
                <div className="flex items-center gap-4 mb-12">
                    <PackageCheck className="w-10 h-10 text-primary" />
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900">Enquiry Hub</h1>
                        <p className="text-gray-500">Review technical specifications before submitting your combined RFQ.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Items List */}
                    <div className="lg:col-span-2 space-y-6">
                        {state.items.map((item) => (
                            <motion.div
                                key={item.id}
                                layout
                                className="flex gap-8 p-6 bg-white rounded-[32px] shadow-sm border border-gray-100 items-center"
                            >
                                <div className="w-32 h-32 bg-gray-50 rounded-2xl overflow-hidden flex-shrink-0 border border-gray-50">
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-grow">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1 block">
                                                {item.vendor || 'Authorized Supplier'}
                                            </span>
                                            <h3 className="font-bold text-xl text-gray-900">{item.name}</h3>
                                        </div>
                                        <button
                                            onClick={() => dispatch({ type: 'REMOVE_ITEM', payload: item.id })}
                                            className="w-10 h-10 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between mt-6">
                                        <div className="flex items-center gap-4">
                                            <label className="text-xs font-bold text-gray-400 uppercase">Quantity</label>
                                            <span className="font-bold text-gray-900 bg-gray-50 px-4 py-1 rounded-lg border border-gray-100">
                                                {item.quantity} Unit(s)
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs text-gray-400 font-bold block">ESTIMATED PRICE</span>
                                            <span className="font-black text-2xl text-gray-900">₹{(item.price * item.quantity).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Enquiry Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-10 rounded-[40px] shadow-xl border border-gray-100 sticky top-32">
                            <h3 className="text-2xl font-bold text-gray-900 mb-8 pb-6 border-b border-gray-50">Enquiry Summary</h3>

                            <div className="space-y-6 mb-10">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500 font-medium">Total Line Items</span>
                                    <span className="font-bold text-gray-900">{state.items.length} Assets</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500 font-medium">Logistics & Tax</span>
                                    <span className="text-primary font-bold text-xs uppercase tracking-widest">Calculated at RFQ</span>
                                </div>
                                <div className="pt-6 border-t border-gray-50 flex justify-between items-center">
                                    <span className="font-bold text-gray-900 text-lg">Total Budget Est.</span>
                                    <span className="font-black text-3xl text-primary">₹{state.total.toLocaleString()}</span>
                                </div>
                            </div>

                            <Link
                                to="/submit-rfq"
                                className="w-full bg-gray-900 hover:bg-primary text-white py-5 rounded-2xl font-bold transition-all flex items-center justify-center gap-3 shadow-xl group"
                            >
                                <span>Proceed to RFQ Submission</span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>

                            <p className="mt-8 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
                                Submission does not constitute a purchase. <br /> A technical consultant will contact you.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EnquiryList;
