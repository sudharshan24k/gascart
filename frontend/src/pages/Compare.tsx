import React from 'react';
import { motion } from 'framer-motion';
import { GitCompare, ClipboardList, Send, ArrowRight } from 'lucide-react';

const Compare: React.FC = () => {
    return (
        <div className="pt-32 pb-24 min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="container mx-auto px-4 max-w-4xl text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white p-12 rounded-3xl shadow-xl border border-gray-100"
                >
                    <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-8">
                        <GitCompare className="w-10 h-10 text-secondary" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-6">Compare & RFQ Hub</h1>
                    <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                        Add products or experts to your comparison list to see technical side-by-side details and raise a combined Request for Quotation (RFQ).
                    </p>

                    <div className="grid md:grid-cols-2 gap-6 text-left mb-10">
                        <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                            <ClipboardList className="w-6 h-6 text-primary mb-3" />
                            <h3 className="font-bold text-gray-900 mb-1">Select Items</h3>
                            <p className="text-sm text-gray-500">Pick up to 4 items from the marketplace or expert list.</p>
                        </div>
                        <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                            <Send className="w-6 h-6 text-primary mb-3" />
                            <h3 className="font-bold text-gray-900 mb-1">Instant RFQ</h3>
                            <p className="text-sm text-gray-500">Submit a single query to all selected vendors at once.</p>
                        </div>
                    </div>

                    <button
                        onClick={() => window.location.href = '/shop'}
                        className="bg-primary hover:bg-primary-dark text-white font-bold py-4 px-10 rounded-full transition-all flex items-center gap-2 mx-auto"
                    >
                        Go to Marketplace <ArrowRight className="w-5 h-5" />
                    </button>
                </motion.div>
            </div>
        </div>
    );
};

export default Compare;
