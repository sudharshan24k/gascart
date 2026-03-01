import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, CheckCircle, AlertCircle, Briefcase, FileText, User, Mail, Phone, Loader2 } from 'lucide-react';
import { api, supabase } from '../services/api';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const CATEGORIES = ['Technicians', 'Officers', 'Entry level management', 'Middle management'];

const Careers: React.FC = () => {
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        category: ''
    });
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (!selected) return;

        if (selected.size > MAX_FILE_SIZE) {
            setError('File size must be less than 2MB.');
            setFile(null);
            return;
        }

        // Check if it's a PDF or DOC
        if (!['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(selected.type)) {
            setError('Please upload a PDF or strictly Word document (.doc, .docx).');
            setFile(null);
            return;
        }

        setError(null);
        setFile(selected);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!file) {
            setError('Please upload your resume.');
            return;
        }

        setUploading(true);
        setError(null);

        try {
            // 1. Upload resume to Supabase
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `${formData.category.replace(/ /g, '_')}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('resumes')
                .upload(filePath, file);

            if (uploadError) throw new Error('Failed to upload resume: ' + uploadError.message);

            // Get the URL (it's not public, but we store the path so admin can download it)
            const resumeUrl = filePath;

            // 2. Submit application data to backend
            const response = await api.careers.submitApplication({
                ...formData,
                resume_url: resumeUrl
            });

            if (response.status === 'success') {
                setSubmitted(true);
            } else {
                throw new Error(response.message || 'Failed to submit application');
            }

        } catch (err: any) {
            console.error('Submission failed', err);
            setError(err.message || 'An unexpected error occurred. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen pt-32 pb-24 bg-gray-50 flex items-center justify-center px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-3xl p-10 md:p-16 max-w-lg w-full text-center shadow-sm border border-gray-100"
                >
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Application Received!</h2>
                    <p className="text-gray-600 mb-8 leading-relaxed">
                        Thank you, {formData.full_name}. We have successfully received your application for the {formData.category} position. Our team will review your profile and get back to you if there's a match.
                    </p>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-8 rounded-xl transition"
                    >
                        Return Home
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-32 pb-24 bg-gray-50">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
                        Join Our <span className="text-primary">Team</span>
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        Become part of the revolution in industrial procurement and biogas infrastructure.
                        We're looking for passionate individuals driven to make a difference.
                    </p>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="grid md:grid-cols-5 h-full">

                        {/* Sidebar Info */}
                        <div className="md:col-span-2 bg-[#0A1A2F] text-white p-10 flex flex-col justify-between">
                            <div>
                                <h3 className="text-2xl font-bold mb-6">Start your journey.</h3>
                                <p className="text-slate-300 text-sm leading-relaxed mb-8">
                                    Fill out the form with your details and upload your latest resume. Make sure your resume highlights your relevant experience.
                                </p>
                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                                            <Briefcase className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm">4 Categories</h4>
                                            <p className="text-xs text-slate-400 mt-1">Found the perfect fit for your expertise.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                                            <FileText className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm">Max 2MB Resume</h4>
                                            <p className="text-xs text-slate-400 mt-1">Keep it concise. PDF or Word doc only.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-12 pt-8 border-t border-white/10">
                                <p className="text-xs text-slate-400">
                                    Your information is kept strictly confidential and only accessible by our HR team.
                                </p>
                            </div>
                        </div>

                        {/* Submission Form */}
                        <div className="md:col-span-3 p-8 md:p-12">
                            <form onSubmit={handleSubmit} className="space-y-6">

                                {error && (
                                    <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-start gap-3 text-sm">
                                        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                        <p>{error}</p>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Personal Details</h3>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-2">
                                            <User className="w-4 h-4 text-gray-400" /> Full Name
                                        </label>
                                        <input
                                            required type="text"
                                            value={formData.full_name}
                                            onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition"
                                            placeholder="John Doe"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-2">
                                                <Mail className="w-4 h-4 text-gray-400" /> Email Address
                                            </label>
                                            <input
                                                required type="email"
                                                value={formData.email}
                                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition"
                                                placeholder="john@example.com"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-2">
                                                <Phone className="w-4 h-4 text-gray-400" /> Phone Number
                                            </label>
                                            <input
                                                required type="tel"
                                                value={formData.phone}
                                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition"
                                                placeholder="+91 XXXXX XXXXX"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4">
                                    <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Role & Experience</h3>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Job Category</label>
                                        <select
                                            required
                                            value={formData.category}
                                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition"
                                        >
                                            <option value="" disabled>Select a category...</option>
                                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Resume / CV (Max 2MB)</label>
                                        <div className={`relative border-2 border-dashed rounded-xl p-6 transition-colors ${file ? 'border-primary bg-primary/5' : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400'}`}>
                                            <input
                                                type="file"
                                                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                                onChange={handleFileChange}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            />
                                            <div className="flex flex-col items-center justify-center text-center">
                                                {file ? (
                                                    <>
                                                        <FileText className="w-8 h-8 text-primary mb-2" />
                                                        <p className="text-sm font-bold text-gray-900">{file.name}</p>
                                                        <p className="text-xs text-gray-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                                    </>
                                                ) : (
                                                    <>
                                                        <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
                                                        <p className="text-sm font-medium text-gray-700">Click to upload or drag and drop</p>
                                                        <p className="text-xs text-gray-400 mt-1">PDF or Word files up to 2MB</p>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6">
                                    <button
                                        type="submit"
                                        disabled={uploading}
                                        className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-70"
                                    >
                                        {uploading ? (
                                            <><Loader2 className="w-5 h-5 animate-spin" /> Submitting Application...</>
                                        ) : (
                                            <>Submit Application</>
                                        )}
                                    </button>
                                </div>

                            </form>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Careers;
