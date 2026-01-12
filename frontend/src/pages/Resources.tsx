import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Download, ShieldCheck, FileText, Gavel, Scale, Info, Building2, Loader2, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

interface Document {
    id: string;
    title: string;
    category: string;
    file_url: string;
    file_size?: string;
    version?: string;
    is_public: boolean;
    status: string;
    created_at: string;
}

const categoryIcons: Record<string, React.ElementType> = {
    'Legal': ShieldCheck,
    'Policy': FileText,
    'Privacy': Scale,
    'Technical': Gavel,
};

const Resources: React.FC = () => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Fallback documents shown when API returns empty or fails
    const fallbackDocuments = [
        { id: '1', title: "Standard Vendor Agreement", category: "Legal", file_url: "#", file_size: "2.4 MB" },
        { id: '2', title: "General Terms & Conditions", category: "Policy", file_url: "#", file_size: "1.1 MB" },
        { id: '3', title: "Privacy & Data Protection Policy", category: "Privacy", file_url: "#", file_size: "0.8 MB" },
        { id: '4', title: "Industrial Safety Standards", category: "Technical", file_url: "#", file_size: "4.5 MB" },
    ];

    useEffect(() => {
        const loadDocuments = async () => {
            try {
                const response = await api.documents.list();
                if (response.data && response.data.length > 0) {
                    setDocuments(response.data);
                } else {
                    // Use fallback documents if API returns empty
                    setDocuments(fallbackDocuments as Document[]);
                }
            } catch (err) {
                console.error('Failed to load documents:', err);
                setError('Unable to load documents from server. Showing default documents.');
                setDocuments(fallbackDocuments as Document[]);
            } finally {
                setLoading(false);
            }
        };

        loadDocuments();
    }, []);

    const handleDownload = (doc: Document) => {
        if (doc.file_url && doc.file_url !== '#') {
            window.open(doc.file_url, '_blank');
        } else {
            alert('This document is not yet available for download. Please contact us for more information.');
        }
    };

    const getIconForCategory = (category: string) => {
        return categoryIcons[category] || FileText;
    };

    return (
        <div className="pt-32 pb-24 min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 max-w-5xl">
                <header className="mb-16 text-center">
                    <h1 className="text-5xl font-extrabold text-gray-900 mb-6">Resources & <span className="text-primary italic">Legal</span></h1>
                    <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                        Access official documentation, vendor requirements, and platform governance policies.
                    </p>
                </header>

                {error && (
                    <div className="mb-8 p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-center gap-3 text-amber-700">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <span className="font-medium">{error}</span>
                    </div>
                )}

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {documents.map((doc, i) => {
                            const IconComponent = getIconForCategory(doc.category);
                            return (
                                <motion.div
                                    key={doc.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition-all"
                                >
                                    <div className="flex items-center gap-6">
                                        <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-primary/5">
                                            <IconComponent className="w-6 h-6 text-gray-400 group-hover:text-primary transition-colors" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-lg">{doc.title}</h3>
                                            <div className="flex items-center gap-4 mt-1">
                                                <span className="text-xs font-black text-primary uppercase tracking-widest">{doc.category}</span>
                                                {doc.file_size && (
                                                    <span className="text-xs text-gray-400 font-medium">{doc.file_size}</span>
                                                )}
                                                {doc.version && (
                                                    <span className="text-xs text-gray-400 font-medium">v{doc.version}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDownload(doc)}
                                        className="bg-gray-50 hover:bg-primary hover:text-white p-4 rounded-xl transition-all"
                                    >
                                        <Download className="w-5 h-5" />
                                    </button>
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                <div className="mt-20 bg-primary/5 p-10 rounded-[40px] border border-primary/10 relative overflow-hidden">
                    <div className="flex flex-col md:flex-row items-center gap-10">
                        <div className="w-20 h-20 bg-primary text-white rounded-3xl flex items-center justify-center shrink-0">
                            <Building2 className="w-10 h-10" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Vendor Onboarding Process</h2>
                            <p className="text-gray-600 leading-relaxed mb-6">
                                Listing on Gascart involves a physical audit and agreement signing. We do not support automated onboarding to maintain the highest quality of industrial suppliers.
                            </p>
                            <Link
                                to="/vendor-enquiry"
                                className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-primary/20"
                            >
                                <Info className="w-4 h-4" />
                                Apply for Vendor Status
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Resources;
