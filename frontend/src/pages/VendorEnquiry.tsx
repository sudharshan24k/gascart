import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Building2, User, Mail, Phone, Briefcase, Award, MessageSquare, CheckCircle, ArrowLeft, Send, ShieldCheck, Globe, Zap, Download, FileText, Gavel, Scale, Loader2, AlertCircle } from 'lucide-react';
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

const VendorEnquiry: React.FC = () => {
    const [formData, setFormData] = useState({
        company_name: '',
        contact_person: '',
        email: '',
        phone: '',
        business_type: '',
        certifications: [] as string[],
        message: ''
    });
    const [certInput, setCertInput] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState('');

    const [documents, setDocuments] = useState<Document[]>([]);
    const [docsLoading, setDocsLoading] = useState(true);
    const [docsError, setDocsError] = useState('');

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
                    setDocuments(fallbackDocuments as Document[]);
                }
            } catch (err) {
                console.error('Failed to load documents:', err);
                setDocsError('Showing default documents.');
                setDocuments(fallbackDocuments as Document[]);
            } finally {
                setDocsLoading(false);
            }
        };

        loadDocuments();
    }, []);

    const handleDownload = (doc: Document) => {
        if (doc.file_url && doc.file_url !== '#') {
            window.open(doc.file_url, '_blank');
        } else {
            alert('This document is not yet available for download.');
        }
    };

    const getIconForCategory = (category: string) => {
        return categoryIcons[category] || FileText;
    };

    const businessTypes = [
        'Manufacturer',
        'Distributor',
        'Wholesaler',
        'Service Provider',
        'Trading Company',
        'OEM Supplier',
        'Project Developer',
        'Other'
    ];

    const handleAddCertification = () => {
        if (certInput.trim() && !formData.certifications.includes(certInput.trim())) {
            setFormData({
                ...formData,
                certifications: [...formData.certifications, certInput.trim()]
            });
            setCertInput('');
        }
    };

    const handleRemoveCertification = (cert: string) => {
        setFormData({
            ...formData,
            certifications: formData.certifications.filter(c => c !== cert)
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            await api.vendors.submitEnquiry(formData);
            setIsSubmitted(true);
        } catch (err: any) {
            setError(err.message || 'Failed to submit enquiry. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className="pt-32 pb-24 min-h-screen bg-gray-50 flex items-center">
                <div className="container mx-auto px-4 max-w-2xl">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white p-12 rounded-[40px] shadow-2xl border border-gray-100 text-center"
                    >
                        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
                            <CheckCircle className="w-12 h-12 text-green-600" />
                        </div>
                        <h1 className="text-4xl font-black text-gray-900 mb-4">Application Received!</h1>
                        <p className="text-gray-600 text-lg mb-10 leading-relaxed">
                            Thank you for your interest in joining the Gascart Ecosystem. Our verification team will review your credentials and contact you via email within <span className="text-primary font-bold">48 working hours</span>.
                        </p>
                        <div className="bg-gray-50 p-8 rounded-3xl mb-10 text-left border border-gray-100">
                            <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2 uppercase tracking-widest text-xs">
                                <Zap className="w-4 h-4 text-primary" /> Next Steps in Onboarding
                            </h3>
                            <ul className="space-y-4">
                                {[
                                    { step: '1', title: 'Credential Verification', desc: 'Our team validates your business registration and certifications.' },
                                    { step: '2', title: 'Onboarding Call', desc: 'A quick discovery call to understand your product catalog and capacity.' },
                                    { step: '3', title: 'Portal Access', desc: 'Gain access to your vendor dashboard to list products and track RFQs.' }
                                ].map((item) => (
                                    <li key={item.step} className="flex gap-4">
                                        <div className="w-8 h-8 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center font-black text-primary text-sm shrink-0">
                                            {item.step}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 leading-tight mb-1">{item.title}</p>
                                            <p className="text-xs text-gray-400 font-medium leading-relaxed">{item.desc}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                to="/shop"
                                className="bg-primary text-white font-black px-10 py-4 rounded-2xl hover:-translate-y-1 transition-all shadow-xl shadow-primary/20"
                            >
                                Browse Marketplace
                            </Link>
                            <Link
                                to="/"
                                className="bg-gray-900 text-white font-black px-10 py-4 rounded-2xl hover:-translate-y-1 transition-all"
                            >
                                Return Home
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="pt-32 pb-24 min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="grid lg:grid-cols-12 gap-16 items-start">
                    {/* Left: Info Section */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-5"
                    >
                        <Link
                            to="/shop"
                            className="inline-flex items-center gap-2 text-gray-400 hover:text-primary font-bold mb-10 transition-colors uppercase tracking-widest text-xs"
                        >
                            <ArrowLeft className="w-4 h-4" /> Back to Marketplace
                        </Link>

                        <h1 className="text-5xl font-black text-gray-900 mb-8 leading-[1.1]">
                            Scale Your <span className="text-primary italic">Industrial Reach</span> with Gascart
                        </h1>
                        <p className="text-xl text-gray-500 mb-12 leading-relaxed font-medium">
                            Join India's most trusted ecosystem for Bio-CNG, LPG, and Industrial Energy equipment.
                        </p>

                        <div className="space-y-8 mb-12">
                            {[
                                { icon: ShieldCheck, title: 'Verified Lead Network', desc: 'Secure high-intent RFQs from verified industrial buyers across multiple sectors.' },
                                { icon: Globe, title: 'Pan-India Visibility', desc: 'Expand your market reach beyond geographic boundaries with our digital platform.' },
                                { icon: Zap, title: 'Streamlined Sales', desc: 'Reduce customer acquisition costs with our automated quotation and order management.' }
                            ].map((benefit, i) => (
                                <div key={i} className="flex gap-6 group">
                                    <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                        <benefit.icon className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-900 mb-1">{benefit.title}</h3>
                                        <p className="text-gray-500 text-sm font-medium leading-relaxed">{benefit.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="bg-secondary-900 p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                            <p className="text-white/60 font-black tracking-widest text-[10px] uppercase mb-4">Partner Relations</p>
                            <h3 className="text-2xl font-bold mb-4">Need personalized assistance?</h3>
                            <p className="text-white/70 mb-8 text-sm font-medium">Our vendor success team is ready to assist you with the onboarding process or technical queries.</p>
                            <a href="mailto:partners@gascart.com" className="bg-white text-secondary-900 font-black px-8 py-3 rounded-xl inline-block hover:scale-105 transition-transform">
                                partners@gascart.com
                            </a>
                        </div>
                    </motion.div>

                    {/* Right: Registration Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-7 bg-white p-8 md:p-12 rounded-[50px] shadow-2xl shadow-gray-200/50 border border-gray-100"
                    >
                        <header className="mb-12">
                            <span className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 inline-block">Vendor Onboarding</span>
                            <h2 className="text-3xl font-black text-gray-900">Partner Registration</h2>
                        </header>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            {error && (
                                <div className="p-5 bg-red-50 border border-red-100 rounded-2xl text-red-600 font-bold text-sm flex items-center gap-3">
                                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Company Information</label>
                                <div className="relative">
                                    <Building2 className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
                                    <input
                                        type="text"
                                        required
                                        className="w-full pl-16 pr-6 py-5 bg-gray-50 border-none rounded-[20px] outline-none focus:ring-4 focus:ring-primary/10 font-bold transition-all text-gray-700 shadow-inner"
                                        value={formData.company_name}
                                        onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                                        placeholder="Full legal company name"
                                    />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Primary Contact</label>
                                    <div className="relative">
                                        <User className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
                                        <input
                                            type="text"
                                            required
                                            className="w-full pl-16 pr-6 py-5 bg-gray-50 border-none rounded-[20px] outline-none focus:ring-4 focus:ring-primary/10 font-bold transition-all text-gray-700 shadow-inner"
                                            value={formData.contact_person}
                                            onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                                            placeholder="Contact Name"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
                                        <input
                                            type="tel"
                                            required
                                            className="w-full pl-16 pr-6 py-5 bg-gray-50 border-none rounded-[20px] outline-none focus:ring-4 focus:ring-primary/10 font-bold transition-all text-gray-700 shadow-inner"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            placeholder="+91..."
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Business Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
                                        <input
                                            type="email"
                                            required
                                            className="w-full pl-16 pr-6 py-5 bg-gray-50 border-none rounded-[20px] outline-none focus:ring-4 focus:ring-primary/10 font-bold transition-all text-gray-700 shadow-inner"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="email@company.com"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Business Category</label>
                                    <div className="relative">
                                        <Briefcase className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
                                        <select
                                            required
                                            className="w-full pl-16 pr-10 py-5 bg-gray-50 border-none rounded-[20px] outline-none focus:ring-4 focus:ring-primary/10 font-bold transition-all text-gray-700 shadow-inner appearance-none"
                                            value={formData.business_type}
                                            onChange={(e) => setFormData({ ...formData, business_type: e.target.value })}
                                        >
                                            <option value="">Select industry...</option>
                                            {businessTypes.map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Certifications (Add multiple)</label>
                                <div className="flex gap-3 mb-4">
                                    <div className="relative flex-1">
                                        <Award className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
                                        <input
                                            type="text"
                                            className="w-full pl-16 pr-6 py-5 bg-gray-50 border-none rounded-[20px] outline-none focus:ring-4 focus:ring-primary/10 font-bold transition-all text-gray-700 shadow-inner"
                                            value={certInput}
                                            onChange={(e) => setCertInput(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCertification())}
                                            placeholder="e.g., ISO, CE, PESO"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleAddCertification}
                                        className="px-8 py-5 bg-gray-900 text-white rounded-[20px] font-black text-sm hover:scale-105 transition-all shadow-lg"
                                    >
                                        Add
                                    </button>
                                </div>
                                {formData.certifications.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {formData.certifications.map(cert => (
                                            <span
                                                key={cert}
                                                className="px-4 py-2 bg-primary/5 text-primary border border-primary/10 rounded-xl text-xs font-black flex items-center gap-2 group hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all cursor-pointer"
                                                onClick={() => handleRemoveCertification(cert)}
                                            >
                                                {cert}
                                                <span className="text-lg leading-none">×</span>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Company Bio & Core Products</label>
                                <div className="relative">
                                    <MessageSquare className="absolute left-6 top-6 text-gray-300 w-5 h-5" />
                                    <textarea
                                        rows={4}
                                        className="w-full pl-16 pr-6 py-6 bg-gray-50 border-none rounded-[30px] outline-none focus:ring-4 focus:ring-primary/10 font-bold transition-all text-gray-700 shadow-inner resize-none"
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        placeholder="Please provide a brief overview of your business..."
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-primary hover:bg-primary-dark text-white font-black py-6 rounded-[25px] shadow-2xl shadow-primary/30 transition-all flex items-center justify-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-1"
                            >
                                {isSubmitting ? (
                                    <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <Send className="w-6 h-6" />
                                        Submit Partner Application
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.div>
                </div>

                <div className="mt-24 pt-24 border-t border-gray-100">
                    <header className="mb-16 text-center">
                        <h2 className="text-4xl font-black text-gray-900 mb-6">Vendor <span className="text-primary italic">Resources</span></h2>
                        <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                            Access official documentation, vendor requirements, and platform governance policies.
                        </p>
                    </header>

                    {docsError && (
                        <div className="mb-8 p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-center gap-3 text-amber-700 max-w-5xl mx-auto">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <span className="font-medium text-sm">{docsError}</span>
                        </div>
                    )}

                    {docsLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        </div>
                    ) : (
                        <div className="grid gap-6 max-w-5xl mx-auto">
                            {documents.map((doc, i) => {
                                const IconComponent = getIconForCategory(doc.category);
                                return (
                                    <motion.div
                                        key={doc.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
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
                                                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{doc.category}</span>
                                                    {doc.file_size && (
                                                        <span className="text-xs text-gray-400 font-medium">{doc.file_size}</span>
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
                </div>
            </div>
        </div>
    );
};

export default VendorEnquiry;
