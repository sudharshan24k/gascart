import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useEnquiry } from '../context/EnquiryContext';
import { motion } from 'framer-motion';
import { ShieldCheck, Building2, Send, FileCheck, Info } from 'lucide-react';

const SubmitRFQ = () => {
    const { state, dispatch } = useEnquiry();
    const [submitted, setSubmitted] = useState(false);
    const navigate = useNavigate();

    if (state.items.length === 0 && !submitted) {
        return (
            <div className="container mx-auto px-4 py-32 text-center max-w-2xl">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Enquiry list is empty</h2>
                <Link to="/shop" className="text-primary font-bold hover:underline">Return to Marketplace</Link>
            </div>
        );
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
        // In a real app, this would hit the `/rfqs` endpoint
        setTimeout(() => {
            dispatch({ type: 'CLEAR_ENQUIRY' });
            navigate('/order-confirmation'); // Keep this but UI will call it "Enquiry Confirmed"
        }, 1500);
    };

    return (
        <div className="min-h-screen pt-32 pb-24 bg-gray-50">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Review & Submit RFQ</h1>
                    <p className="text-gray-500 max-w-2xl mx-auto">
                        Provide your project details below. Our industrial consultants will review your enquiry and provide a formal technical proposal.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                    {/* Enquiry Form */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white p-12 rounded-[40px] shadow-xl border border-gray-100"
                    >
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <Building2 className="w-5 h-5 text-primary" /> Corporate Information
                                </h3>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="col-span-2">
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Company Name</label>
                                        <input required type="text" className="w-full bg-gray-50 border-none rounded-xl p-4 font-medium outline-none focus:ring-2 focus:ring-primary/20" placeholder="e.g. BioEnergy Solutions Pvt Ltd" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Industry Type</label>
                                        <select required className="w-full bg-gray-50 border-none rounded-xl p-4 font-bold outline-none focus:ring-2 focus:ring-primary/20">
                                            <option>Industrial Manufacturing</option>
                                            <option>Renewable Energy Developer</option>
                                            <option>Municipal Body</option>
                                            <option>Agriculture / Farming</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">GST / Tax ID (Optional)</label>
                                        <input type="text" className="w-full bg-gray-50 border-none rounded-xl p-4 font-medium outline-none focus:ring-2 focus:ring-primary/20" placeholder="Registration Number" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6 pt-6 border-t border-gray-50">
                                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <Info className="w-5 h-5 text-blue-500" /> Project Brief
                                </h3>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Site Location / Installation City</label>
                                    <input required type="text" className="w-full bg-gray-50 border-none rounded-xl p-4 font-medium outline-none focus:ring-2 focus:ring-primary/20" placeholder="City, State" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Specific Requirements or Deadlines</label>
                                    <textarea className="w-full bg-gray-50 border-none rounded-xl p-4 font-medium outline-none focus:ring-2 focus:ring-primary/20 h-32" placeholder="Tell us about your project scale, feedstock type, or any customization required..."></textarea>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-primary hover:bg-primary-dark text-white py-6 rounded-2xl font-black text-lg transition-all shadow-2xl shadow-primary/30 flex items-center justify-center gap-3 active:scale-95"
                            >
                                <Send className="w-5 h-5" /> Submit Combined Technical Enquiry
                            </button>

                            <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                By submitting, you agree to our <Link to="/resources" className="text-primary hover:underline">Industrial Terms & Conditions</Link>.
                            </p>
                        </form>
                    </motion.div>

                    {/* Summary Sidebar */}
                    <div className="space-y-8">
                        <div className="bg-gray-900 p-10 rounded-[40px] text-white shadow-2xl relative overflow-hidden">
                            <div className="relative z-10">
                                <h3 className="text-2xl font-bold mb-8">Asset Summary</h3>
                                <div className="space-y-4 mb-8">
                                    {state.items.map(item => (
                                        <div key={item.id} className="flex justify-between items-center text-sm">
                                            <span className="opacity-70">{item.name} × {item.quantity}</span>
                                            <span className="font-bold">₹{(item.price * item.quantity).toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="border-t border-white/10 pt-6 flex justify-between items-center">
                                    <span className="text-lg font-bold opacity-60">Enquiry Total</span>
                                    <span className="text-3xl font-black text-primary">₹{state.total.toLocaleString()}</span>
                                </div>
                            </div>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                        </div>

                        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
                            <h4 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-green-500" /> Platform Assurance
                            </h4>
                            <ul className="space-y-4">
                                {[
                                    "Direct Factory Pricing Support",
                                    "Industrial Warranty Safeguards",
                                    "Regulatory Compliance Audits",
                                    "Secure Technical Data Exchange"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm text-gray-500 font-medium">
                                        <FileCheck className="w-4 h-4 text-primary" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-blue-50 p-8 rounded-[32px] border border-blue-100 shadow-sm">
                            <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                                <Info className="w-5 h-5 text-blue-500" /> Need Help with your RFQ?
                            </h4>
                            <p className="text-sm text-blue-700 mb-4">
                                Our experts can help you draft a comprehensive Request for Quote to ensure you get the best technical and commercial offers.
                            </p>
                            <Link to="/services" className="text-sm font-bold text-blue-800 hover:underline">
                                Learn about RFQ Preparation →
                            </Link>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default SubmitRFQ;
