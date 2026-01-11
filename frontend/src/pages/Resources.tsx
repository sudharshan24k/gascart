import React from 'react';
import { motion } from 'framer-motion';
import { Download, ShieldCheck, FileText, Gavel, Scale, Info } from 'lucide-react';

const Resources: React.FC = () => {
    const documents = [
        { title: "Standard Vendor Agreement", size: "2.4 MB", icon: ShieldCheck, category: "Legal" },
        { title: "General Terms & Conditions", size: "1.1 MB", icon: FileText, category: "Policy" },
        { title: "Privacy & Data Protection Policy", size: "0.8 MB", icon: Scale, category: "Privacy" },
        { title: "Industrial Safety Standards", size: "4.5 MB", icon: Gavel, category: "Technical" },
    ];

    return (
        <div className="pt-32 pb-24 min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 max-w-5xl">
                <header className="mb-16 text-center">
                    <h1 className="text-5xl font-extrabold text-gray-900 mb-6">Resources & <span className="text-primary italic">Legal</span></h1>
                    <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                        Access official documentation, vendor requirements, and platform governance policies.
                    </p>
                </header>

                <div className="grid gap-6">
                    {documents.map((doc, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition-all"
                        >
                            <div className="flex items-center gap-6">
                                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-primary/5">
                                    <doc.icon className="w-6 h-6 text-gray-400 group-hover:text-primary transition-colors" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg">{doc.title}</h3>
                                    <div className="flex items-center gap-4 mt-1">
                                        <span className="text-xs font-black text-primary uppercase tracking-widest">{doc.category}</span>
                                        <span className="text-xs text-gray-400 font-medium">{doc.size}</span>
                                    </div>
                                </div>
                            </div>
                            <button className="bg-gray-50 hover:bg-primary hover:text-white p-4 rounded-xl transition-all">
                                <Download className="w-5 h-5" />
                            </button>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-20 bg-primary/5 p-10 rounded-[40px] border border-primary/10 relative overflow-hidden">
                    <div className="flex flex-col md:flex-row items-center gap-10">
                        <div className="w-20 h-20 bg-primary text-white rounded-3xl flex items-center justify-center shrink-0">
                            <Info className="w-10 h-10" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Vendor Onboarding Process</h2>
                            <p className="text-gray-600 leading-relaxed mb-6">
                                Listing on Gascart involves a physical audit and agreement signing. We do not support automated onboarding to maintain the highest quality of industrial suppliers.
                            </p>
                            <button className="text-primary font-bold flex items-center gap-2 hover:underline">
                                Apply for Vendor Status <Download className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Resources;
