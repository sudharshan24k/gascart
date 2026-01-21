import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Phone, Briefcase, FileText, CheckCircle, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const ConsultantRegistration: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        experience_years: '',
        bio: '',
        location: '',
        service_categories: [] as string[]
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.consultants.register({
                ...formData,
                user_id: user?.id
            });
            setSubmitted(true);
        } catch (err) {
            console.error('Registration failed', err);
            alert('Failed to register. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCategoryToggle = (category: string) => {
        setFormData(prev => ({
            ...prev,
            service_categories: prev.service_categories.includes(category)
                ? prev.service_categories.filter(c => c !== category)
                : [...prev.service_categories, category]
        }));
    };

    if (submitted) {
        return (
            <div className="min-h-screen pt-32 pb-24 flex items-center justify-center bg-gray-50">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full bg-white p-12 rounded-3xl shadow-xl text-center border border-gray-100"
                >
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-primary" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Registration Received!</h2>
                    <p className="text-gray-600 mb-8 leading-relaxed">
                        Thank you for your interest in joining Gascart as a consultant. Our team will review your profile and get back to you within 2-3 business days.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => navigate('/experts')}
                            className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-8 rounded-full transition-all"
                        >
                            View Consultants
                        </button>
                        {user && (
                            <button
                                onClick={() => navigate('/consultant-dashboard')}
                                className="bg-gray-900 hover:bg-black text-white font-bold py-3 px-8 rounded-full transition-all"
                            >
                                Go to Dashboard
                            </button>
                        )}
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-32 pb-24 bg-gray-50">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="grid md:grid-cols-2 gap-12 items-start">
                    {/* Left Column: Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                            Join Our Network of <span className="text-primary">Bio-CNG Experts</span>
                        </h1>
                        <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                            Gascart is expanding its reach across India. We are looking for experienced consultants to help businesses transition to renewable energy.
                        </p>

                        <div className="space-y-6">
                            {[
                                { title: 'Exclusive Projects', desc: 'Get access to high-value Bio-CNG plant setups and industrial conversions.' },
                                { title: 'Technical Support', desc: 'Collaborate with our in-house engineering team on complex system designs.' },
                                { title: 'Premium Comission', desc: 'Earn industry-leading commissions for project consultancy and equipment sales.' }
                            ].map((benefit, i) => (
                                <div key={i} className="flex items-start gap-4">
                                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mt-1 flex-shrink-0">
                                        <CheckCircle className="w-4 h-4 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{benefit.title}</h3>
                                        <p className="text-gray-600">{benefit.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-12 p-8 bg-primary/10 rounded-3xl border border-primary/20">
                            <h3 className="text-xl font-bold text-primary mb-2">Need Help First?</h3>
                            <p className="text-primary/80 mb-4 text-sm">Our consultant relations team is here to answer your questions before you register.</p>
                            <a href="mailto:partners@gascart.com" className="font-bold text-primary hover:underline">partners@gascart.com</a>
                        </div>
                    </motion.div>

                    {/* Right Column: Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-gray-100"
                    >
                        <h2 className="text-2xl font-bold text-gray-900 mb-8">Consultant Registration</h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">First Name</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                                        value={formData.first_name}
                                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Last Name</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                                        value={formData.last_name}
                                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                    <Mail className="w-4 h-4" /> Email Address
                                </label>
                                <input
                                    required
                                    type="email"
                                    placeholder="john@example.com"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                        <Phone className="w-4 h-4" /> Phone Number
                                    </label>
                                    <input
                                        required
                                        type="tel"
                                        placeholder="+91..."
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                        <MapPin className="w-4 h-4" /> Location
                                    </label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="City, State"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                    <Briefcase className="w-4 h-4" /> Industry Experience (Years)
                                </label>
                                <select
                                    required
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all appearance-none"
                                    value={formData.experience_years}
                                    onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
                                >
                                    <option value="">Select experience</option>
                                    <option value="1-3">1-3 Years</option>
                                    <option value="3-7">3-7 Years</option>
                                    <option value="7+">7+ Years</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Service Categories</label>
                                <div className="flex flex-wrap gap-2">
                                    {['CNG', 'Bio-CNG', 'LPG', 'Equipment', 'Services'].map(cat => (
                                        <button
                                            key={cat}
                                            type="button"
                                            onClick={() => handleCategoryToggle(cat)}
                                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${formData.service_categories.includes(cat)
                                                ? 'bg-primary text-white'
                                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                                }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                    <FileText className="w-4 h-4" /> Brief Profile / Bio
                                </label>
                                <textarea
                                    placeholder="Tell us about your background..."
                                    rows={4}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all resize-none"
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                            >
                                {submitting ? (
                                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <UserPlus className="w-5 h-5" />
                                        Register My Profile
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default ConsultantRegistration;
