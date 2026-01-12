import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Building2, User, Mail, Phone, Briefcase, Award, MessageSquare, CheckCircle, ArrowLeft, Send } from 'lucide-react';
import { api } from '../services/api';

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

    const businessTypes = [
        'Manufacturer',
        'Distributor',
        'Wholesaler',
        'Service Provider',
        'Trading Company',
        'OEM Supplier',
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
            <div className="pt-32 pb-24 min-h-screen bg-gray-50">
                <div className="container mx-auto px-4 max-w-2xl">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white p-12 rounded-[40px] shadow-sm border border-gray-100 text-center"
                    >
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
                            <CheckCircle className="w-10 h-10 text-green-600" />
                        </div>
                        <h1 className="text-3xl font-extrabold text-gray-900 mb-4">Enquiry Submitted!</h1>
                        <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                            Thank you for your interest in partnering with Gascart. Our team will review your application and contact you within 3-5 business days.
                        </p>
                        <div className="bg-gray-50 p-6 rounded-2xl mb-8">
                            <h3 className="font-bold text-gray-900 mb-3">What happens next?</h3>
                            <ul className="text-left text-gray-600 space-y-2">
                                <li className="flex items-start gap-2">
                                    <span className="text-primary font-bold">1.</span>
                                    Our team reviews your application
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-primary font-bold">2.</span>
                                    We schedule a verification call
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-primary font-bold">3.</span>
                                    Physical audit and agreement signing
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-primary font-bold">4.</span>
                                    Onboarding to the Gascart platform
                                </li>
                            </ul>
                        </div>
                        <Link
                            to="/resources"
                            className="inline-flex items-center gap-2 text-primary font-bold hover:underline"
                        >
                            <ArrowLeft className="w-4 h-4" /> Back to Resources
                        </Link>
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="pt-32 pb-24 min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 max-w-3xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Link
                        to="/resources"
                        className="inline-flex items-center gap-2 text-gray-500 hover:text-primary font-medium mb-8 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Resources
                    </Link>

                    <header className="mb-12">
                        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
                            Become a <span className="text-primary italic">Vendor Partner</span>
                        </h1>
                        <p className="text-gray-500 text-lg">
                            Join our curated network of industrial suppliers. Complete the form below and our team will review your application.
                        </p>
                    </header>

                    <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[40px] shadow-sm border border-gray-100">
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 font-medium">
                                {error}
                            </div>
                        )}

                        <div className="grid md:grid-cols-2 gap-6 mb-8">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
                                    <Building2 className="w-4 h-4 inline mr-2" />
                                    Company Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 font-bold transition-all"
                                    value={formData.company_name}
                                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                                    placeholder="Your company name"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
                                    <User className="w-4 h-4 inline mr-2" />
                                    Contact Person *
                                </label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 font-bold transition-all"
                                    value={formData.contact_person}
                                    onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                                    placeholder="Full name"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
                                    <Phone className="w-4 h-4 inline mr-2" />
                                    Phone Number *
                                </label>
                                <input
                                    type="tel"
                                    required
                                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 font-bold transition-all"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="+91 98765 43210"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
                                    <Mail className="w-4 h-4 inline mr-2" />
                                    Email Address *
                                </label>
                                <input
                                    type="email"
                                    required
                                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 font-bold transition-all"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="business@company.com"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
                                    <Briefcase className="w-4 h-4 inline mr-2" />
                                    Business Type *
                                </label>
                                <select
                                    required
                                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 font-bold transition-all"
                                    value={formData.business_type}
                                    onChange={(e) => setFormData({ ...formData, business_type: e.target.value })}
                                >
                                    <option value="">Select type...</option>
                                    {businessTypes.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
                                    <Award className="w-4 h-4 inline mr-2" />
                                    Certifications (Optional)
                                </label>
                                <div className="flex gap-3 mb-3">
                                    <input
                                        type="text"
                                        className="flex-1 px-6 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 font-bold transition-all"
                                        value={certInput}
                                        onChange={(e) => setCertInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCertification())}
                                        placeholder="e.g., ISO 9001, CE Certified"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddCertification}
                                        className="px-6 py-4 bg-gray-100 hover:bg-gray-200 rounded-2xl font-bold text-gray-600 transition-all"
                                    >
                                        Add
                                    </button>
                                </div>
                                {formData.certifications.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {formData.certifications.map(cert => (
                                            <span
                                                key={cert}
                                                className="px-4 py-2 bg-primary/10 text-primary rounded-xl text-sm font-bold flex items-center gap-2"
                                            >
                                                {cert}
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveCertification(cert)}
                                                    className="hover:text-red-500 transition-colors"
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
                                    <MessageSquare className="w-4 h-4 inline mr-2" />
                                    Additional Information
                                </label>
                                <textarea
                                    rows={4}
                                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 font-bold transition-all resize-none"
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    placeholder="Tell us about your products, experience, and why you'd like to partner with Gascart..."
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-primary hover:bg-primary-dark text-white font-black py-5 rounded-2xl shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <>Processing...</>
                            ) : (
                                <>
                                    <Send className="w-5 h-5" />
                                    Submit Vendor Enquiry
                                </>
                            )}
                        </button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default VendorEnquiry;
