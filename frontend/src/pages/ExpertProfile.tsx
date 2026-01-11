import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Award,
    MessageSquare,
    MapPin,
    Star,
    ChevronLeft,
    Building2,
    Verified,
    Calendar,
    CheckCircle2
} from 'lucide-react';

const ExpertProfile: React.FC = () => {
    const { id } = useParams();
    const [enquirySent, setEnquirySent] = useState(false);

    // Mock Data based on the experts list
    const expert = {
        name: "Dr. Rajesh Kumar",
        role: "Senior Biogas Expert",
        location: "Pune, Maharashtra",
        exp: "15+ Years",
        rating: 4.9,
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400&h=400",
        bio: "Dr. Rajesh has over 15 years of experience in anaerobic digestion and biogas plant modeling. He has successfully commissioned over 40 industrial-scale Bio-CNG plants across Southeast Asia.",
        expertise: ["Anaerobic Digestion", "Plant Design", "Safety Audits", "Methane Optimization"],
        vendor: "BioGreen Engineering",
        projects: 42,
        education: "Ph.D. in Renewable Energy Systems"
    };

    return (
        <div className="pt-32 pb-24 min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Back Link */}
                <Link to="/experts" className="inline-flex items-center gap-2 text-primary font-bold mb-10 hover:underline">
                    <ChevronLeft className="w-5 h-5" /> Back to Experts
                </Link>

                <div className="grid lg:grid-cols-3 gap-12 items-start">
                    {/* Left: Basic Info */}
                    <div className="lg:col-span-1 space-y-8">
                        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 text-center">
                            <div className="relative inline-block mb-8">
                                <img
                                    src={expert.image}
                                    alt={expert.name}
                                    className="w-48 h-48 rounded-[32px] object-cover mx-auto shadow-xl"
                                />
                                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-primary text-white px-6 py-2 rounded-full text-xs font-black shadow-lg">
                                    VERIFIED EXPERT
                                </div>
                            </div>

                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{expert.name}</h1>
                            <p className="text-gray-500 font-medium mb-6 uppercase tracking-widest text-xs">{expert.role}</p>

                            <div className="flex items-center justify-center gap-6 py-6 border-y border-gray-50 mb-8">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-gray-900">{expert.exp}</p>
                                    <p className="text-[10px] text-gray-400 font-black">EXPERIENCE</p>
                                </div>
                                <div className="w-px h-10 bg-gray-100"></div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-gray-900">{expert.projects}</p>
                                    <p className="text-[10px] text-gray-400 font-black">PROJECTS</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-sm text-gray-600 font-medium bg-gray-50 p-4 rounded-2xl">
                                    <Building2 className="w-5 h-5 text-primary" />
                                    {expert.vendor}
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-600 font-medium bg-gray-50 p-4 rounded-2xl">
                                    <MapPin className="w-5 h-5 text-blue-500" />
                                    {expert.location}
                                </div>
                            </div>
                        </div>

                        <div className="bg-secondary-900 p-8 rounded-[32px] text-white shadow-xl">
                            <h3 className="font-bold text-xl mb-6">Expertise Domains</h3>
                            <div className="flex flex-wrap gap-2">
                                {expert.expertise.map(skill => (
                                    <span key={skill} className="bg-white/10 px-4 py-2 rounded-xl text-xs font-bold">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: Bio & Consultation */}
                    <div className="lg:col-span-2 space-y-12">
                        <section className="bg-white p-12 rounded-[40px] shadow-sm border border-gray-100">
                            <h2 className="text-3xl font-bold text-gray-900 mb-8">Professional Summary</h2>
                            <p className="text-gray-600 text-lg leading-relaxed mb-10">
                                {expert.bio}
                            </p>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
                                        <Award className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-gray-400 mb-1">QUALIFICATION</p>
                                        <p className="font-bold text-gray-900">{expert.education}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center shrink-0">
                                        <Star className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-gray-400 mb-1">CLIENT RATING</p>
                                        <p className="font-bold text-gray-900">{expert.rating} / 5.0 Average</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="bg-white p-12 rounded-[40px] shadow-sm border border-gray-100">
                            <h2 className="text-3xl font-bold text-gray-900 mb-8">Request Consultation</h2>

                            {enquirySent ? (
                                <div className="py-12 text-center">
                                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <CheckCircle2 className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Request Sent to {expert.name}</h3>
                                    <p className="text-gray-500">The consultant will review your project details and contact you via the platform hub.</p>
                                </div>
                            ) : (
                                <form onSubmit={(e) => { e.preventDefault(); setEnquirySent(true); }} className="space-y-8">
                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div>
                                            <label className="block text-xs font-black text-gray-400 uppercase mb-3">Service Required</label>
                                            <select className="w-full bg-gray-50 border-none p-5 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-primary/20">
                                                <option>Pre-feasibility Study</option>
                                                <option>Detailed Design Audit</option>
                                                <option>Regulatory Compliance</option>
                                                <option>Financial Modeling</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black text-gray-400 uppercase mb-3">Timeline Preference</label>
                                            <div className="flex items-center gap-4 bg-gray-50 p-5 rounded-2xl">
                                                <Calendar className="w-5 h-5 text-gray-400" />
                                                <span className="font-bold text-gray-700">Next 14 Days</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-gray-400 uppercase mb-3">Project Description</label>
                                        <textarea
                                            className="w-full bg-gray-50 border-none p-5 rounded-2xl h-40 font-medium outline-none focus:ring-2 focus:ring-primary/20"
                                            placeholder="Tell us briefly about your project goals and location..."
                                        />
                                    </div>
                                    <button type="submit" className="bg-primary text-white font-black px-12 py-5 rounded-[20px] shadow-2xl shadow-primary/30 hover:-translate-y-1 transition-all flex items-center gap-3">
                                        <MessageSquare className="w-6 h-6" /> Start Consultation Enqiury
                                    </button>
                                </form>
                            )}
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExpertProfile;
