import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import {
    User, Briefcase, Mail, Phone, MapPin,
    CheckCircle, Clock, AlertCircle, Loader2,
    ArrowRight, Edit2, LayoutDashboard
} from 'lucide-react';

const ConsultantDashboard: React.FC = () => {
    const { session } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);

    useEffect(() => {
        if (!session) {
            navigate('/login');
            return;
        }
        fetchConsultantProfile();
    }, [session, navigate]);

    const fetchConsultantProfile = async () => {
        try {
            const res = await api.consultants.getMyProfile();
            if (res.status === 'success') {
                setProfile(res.data);
            }
        } catch (err) {
            console.error('Failed to load consultant profile', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-32 flex justify-center items-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen pt-32 pb-24 bg-gray-50">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="bg-white rounded-[32px] p-12 text-center border border-gray-100 shadow-sm">
                        <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-6" />
                        <h1 className="text-3xl font-bold text-gray-900 mb-4 font-display">No Consultant Profile Found</h1>
                        <p className="text-gray-600 mb-8 max-w-lg mx-auto leading-relaxed">
                            It looks like you haven't registered as a consultant yet. Join our network of experts to help businesses transition to renewable energy.
                        </p>
                        <Link
                            to="/consultant-registration"
                            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold py-4 px-10 rounded-2xl transition-all shadow-lg shadow-primary/20"
                        >
                            Register as Consultant <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-600 border-green-200';
            case 'pending': return 'bg-yellow-100 text-yellow-600 border-yellow-200';
            case 'rejected': return 'bg-red-100 text-red-600 border-red-200';
            default: return 'bg-gray-100 text-gray-600 border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved': return <CheckCircle className="w-5 h-5" />;
            case 'pending': return <Clock className="w-5 h-5" />;
            case 'rejected': return <AlertCircle className="w-5 h-5" />;
            default: return null;
        }
    };

    return (
        <div className="min-h-screen pt-32 pb-24 bg-gray-50">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-widest mb-2">
                            <LayoutDashboard className="w-4 h-4" /> Consultant Dashboard
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 font-display">Welcome, {profile.first_name}</h1>
                    </div>

                    <div className={`flex items-center gap-2 px-5 py-2.5 rounded-full border font-bold text-sm capitalize ${getStatusStyles(profile.status)}`}>
                        {getStatusIcon(profile.status)}
                        Status: {profile.status}
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column: Brief Details */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">
                            <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center mb-6 mx-auto overflow-hidden">
                                {profile.profile_image_url ? (
                                    <img src={profile.profile_image_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-12 h-12 text-primary" />
                                )}
                            </div>

                            <h2 className="text-xl font-bold text-gray-900 text-center mb-1">{profile.first_name} {profile.last_name}</h2>
                            <p className="text-gray-500 text-center text-sm mb-6">{profile.experience_years} Experience</p>

                            <div className="space-y-4 pt-6 border-t border-gray-50">
                                <div className="flex items-center gap-3 text-gray-600">
                                    <Mail className="w-5 h-5 text-gray-400" />
                                    <span className="text-sm font-medium">{profile.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-600">
                                    <Phone className="w-5 h-5 text-gray-400" />
                                    <span className="text-sm font-medium">{profile.phone || 'Not provided'}</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-600">
                                    <MapPin className="w-5 h-5 text-gray-400" />
                                    <span className="text-sm font-medium">{profile.location || 'Remote'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-primary text-white rounded-[32px] p-8 shadow-lg shadow-primary/20">
                            <h3 className="font-bold text-lg mb-2">Application Notice</h3>
                            <p className="text-white/80 text-sm leading-relaxed mb-6">
                                {profile.status === 'pending'
                                    ? "Your application is currently under review by our team. You'll receive an email once it's approved."
                                    : profile.status === 'approved'
                                        ? "Your profile is now public! You can start receiving leads and project requests."
                                        : "We couldn't approve your profile at this time. Please contact support for more information."
                                }
                            </p>
                            <Link to="/contact" className="inline-flex items-center gap-2 font-bold hover:underline">
                                Contact Support <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>

                    {/* Right Column: Profile Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Expertise */}
                        <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-900">Expertise & Services</h3>
                                <button className="p-2 hover:bg-gray-50 rounded-xl text-gray-400 hover:text-primary transition-colors">
                                    <Edit2 className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                {profile.service_categories?.map((cat: string) => (
                                    <span key={cat} className="px-5 py-2.5 bg-gray-50 text-gray-700 rounded-2xl text-sm font-bold border border-gray-100">
                                        {cat}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Bio */}
                        <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-900">Professional Bio</h3>
                                <button className="p-2 hover:bg-gray-50 rounded-xl text-gray-400 hover:text-primary transition-colors">
                                    <Edit2 className="w-5 h-5" />
                                </button>
                            </div>
                            <p className="text-gray-600 leading-relaxed">
                                {profile.bio || "No biography provided yet. Add one to help potential clients understand your expertise."}
                            </p>
                        </div>

                        {/* Recent Activity / Next Steps */}
                        <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">
                            <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h3>
                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                                        <Clock className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">Application Submitted</p>
                                        <p className="text-sm text-gray-500">Your registration was received and is in the review queue.</p>
                                        <p className="text-xs text-gray-400 mt-1">{new Date(profile.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConsultantDashboard;
