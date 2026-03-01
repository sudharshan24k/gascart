import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { UserPlus, Star, MapPin, Search, Building2, Loader2, User, LayoutGrid, List as ListIcon, HelpCircle, X, Send, CheckCircle } from 'lucide-react';
import { api } from '../services/api';

const Consultants: React.FC = () => {
    const [consultants, setConsultants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [locationFilter, setLocationFilter] = useState('');
    const [expertiseFilter, setExpertiseFilter] = useState('');
    const [experienceFilter, setExperienceFilter] = useState(0);

    // General enquiry modal state
    const [showEnquiryModal, setShowEnquiryModal] = useState(false);
    const [enquirySubmitted, setEnquirySubmitted] = useState(false);
    const [enquirySubmitting, setEnquirySubmitting] = useState(false);
    const [enquiryForm, setEnquiryForm] = useState({
        name: '', email: '', phone: '', service_required: '', project_description: '', timeline_preference: ''
    });

    const handleEnquirySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setEnquirySubmitting(true);
        try {
            await api.consultants.submitInquiry({
                service_required: enquiryForm.service_required,
                project_description: `Name: ${enquiryForm.name}\nPhone: ${enquiryForm.phone}\n\n${enquiryForm.project_description}`,
                timeline_preference: enquiryForm.timeline_preference,
                guest_email: enquiryForm.email,
                consultant_id: null  // Admin will assign
            });
            setEnquirySubmitted(true);
        } catch (err) {
            console.error('Enquiry failed:', err);
            alert('Failed to submit. Please try again.');
        } finally {
            setEnquirySubmitting(false);
        }
    };

    const resetEnquiry = () => {
        setShowEnquiryModal(false);
        setEnquirySubmitted(false);
        setEnquiryForm({ name: '', email: '', phone: '', service_required: '', project_description: '', timeline_preference: '' });
    };

    useEffect(() => {
        loadConsultants();
    }, []);

    const loadConsultants = async () => {
        setLoading(true);
        try {
            // Only show approved consultants
            const res = await api.consultants.list({ status: 'approved' });
            if (res.status === 'success') {
                setConsultants(res.data);
            }
        } catch (err) {
            console.error('Failed to load consultants', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredConsultants = consultants.filter(c => {
        const fullName = `${c.first_name || ''} ${c.last_name || ''}`.toLowerCase();
        const search = searchTerm.toLowerCase();
        const bio = (c.bio || '').toLowerCase();
        const location = (c.location || '').toLowerCase();
        const categories = (c.service_categories || []).join(' ').toLowerCase();

        const matchesSearch = fullName.includes(search) ||
            bio.includes(search) ||
            location.includes(search) ||
            categories.includes(search);

        const matchesLocation = !locationFilter || location.includes(locationFilter.toLowerCase());
        const matchesExpertise = !expertiseFilter || categories.includes(expertiseFilter.toLowerCase());
        const matchesExperience = !experienceFilter || parseInt(c.experience_years || '0') >= experienceFilter;

        return matchesSearch && matchesLocation && matchesExpertise && matchesExperience;
    });

    const uniqueLocations = Array.from(new Set(consultants.map(c => c.location).filter(Boolean)));
    const allExpertise = Array.from(new Set(consultants.flatMap(c => c.service_categories || [])));

    return (
        <>
            <div className="min-h-screen pt-32 pb-24 bg-gray-50">
                <div className="container mx-auto px-4 max-w-7xl">
                    {/* Header Area */}
                    <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">Experts & Consultants</h1>
                            <p className="text-gray-600 max-w-xl">Consult with prominent Oil &amp; Gas professionals for plant design, audit, and technical optimization.</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowEnquiryModal(true)}
                                className="flex items-center gap-2 bg-white border-2 border-primary text-primary px-6 py-3 rounded-2xl shadow-sm hover:bg-primary hover:text-white transition-all font-bold"
                            >
                                <HelpCircle className="w-5 h-5" />
                                Get Expert Help
                            </button>
                            <Link
                                to="/consultant-registration"
                                className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-2xl shadow-md hover:shadow-lg transition-all font-bold"
                            >
                                <UserPlus className="w-5 h-5" />
                                Join Network
                            </Link>
                        </div>
                    </div>

                    {/* Filters & Search */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-6 mb-12">
                        <div className="flex flex-col lg:flex-row gap-4">
                            <div className="flex-grow relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search by expertise, name or location..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl outline-none ring-2 ring-transparent focus:ring-primary/10 transition-all font-medium"
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-4 rounded-2xl transition-all ${viewMode === 'grid' ? 'bg-primary text-white' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                                >
                                    <LayoutGrid className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-4 rounded-2xl transition-all ${viewMode === 'list' ? 'bg-primary text-white' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                                >
                                    <ListIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-50">
                            <select
                                value={locationFilter}
                                onChange={(e) => setLocationFilter(e.target.value)}
                                className="bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-bold text-gray-700 outline-none"
                            >
                                <option value="">All Locations</option>
                                {uniqueLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                            </select>

                            <select
                                value={expertiseFilter}
                                onChange={(e) => setExpertiseFilter(e.target.value)}
                                className="bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-bold text-gray-700 outline-none"
                            >
                                <option value="">All Expertise</option>
                                {allExpertise.map(exp => <option key={exp} value={exp}>{exp}</option>)}
                            </select>

                            <select
                                value={experienceFilter}
                                onChange={(e) => setExperienceFilter(parseInt(e.target.value))}
                                className="bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-bold text-gray-700 outline-none"
                            >
                                <option value="0">Any Experience</option>
                                <option value="5">5+ Years</option>
                                <option value="10">10+ Years</option>
                                <option value="15">15+ Years</option>
                            </select>

                            {(searchTerm || locationFilter || expertiseFilter || experienceFilter !== 0) && (
                                <button
                                    onClick={() => { setSearchTerm(''); setLocationFilter(''); setExpertiseFilter(''); setExperienceFilter(0); }}
                                    className="text-primary font-bold text-sm hover:underline"
                                >
                                    Clear All
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-12 h-12 text-primary animate-spin" />
                        </div>
                    ) : filteredConsultants.length > 0 ? (
                        <div className={viewMode === 'grid' ? "grid md:grid-cols-2 lg:grid-cols-4 gap-8" : "flex flex-col gap-6"}>
                            {filteredConsultants.map((expert, i) => (
                                <motion.div
                                    key={expert.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className={`bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all group p-6 flex ${viewMode === 'grid' ? 'flex-col h-full' : 'flex-row items-center gap-8'}`}
                                >
                                    <div className={`relative ${viewMode === 'grid' ? 'mb-6' : 'flex-shrink-0'}`}>
                                        {expert.profile_image_url ? (
                                            <img
                                                src={expert.profile_image_url}
                                                alt={`${expert.first_name} ${expert.last_name}`}
                                                className={`${viewMode === 'grid' ? 'w-24 h-24' : 'w-32 h-32'} rounded-2xl object-cover`}
                                            />
                                        ) : (
                                            <div className={`${viewMode === 'grid' ? 'w-24 h-24' : 'w-32 h-32'} rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400`}>
                                                <User className={viewMode === 'grid' ? 'w-12 h-12' : 'w-16 h-16'} />
                                            </div>
                                        )}
                                        <div className="absolute top-0 right-0 bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-bold">
                                            {expert.experience_years || '0'} Exp
                                        </div>
                                    </div>

                                    <div className={`flex-grow ${viewMode === 'grid' ? 'mb-6' : ''}`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors">
                                                    {expert.first_name} {expert.last_name}
                                                </h3>
                                                <div className="flex items-center gap-1 text-gray-400 text-xs mt-1">
                                                    <MapPin className="w-3 h-3" /> {expert.location || 'Remote'}
                                                </div>
                                            </div>
                                            {viewMode === 'list' && (
                                                <div className="flex items-center gap-1">
                                                    <Star className="w-4 h-4 text-secondary fill-secondary" />
                                                    <span className="font-bold text-sm">{expert.rating || 'New'}</span>
                                                </div>
                                            )}
                                        </div>

                                        {expert.company_name && (
                                            <div className="flex items-center gap-2 mt-3 p-2 bg-gray-50 rounded-xl w-fit">
                                                <Building2 className="w-4 h-4 text-primary" />
                                                <span className="text-xs font-bold text-gray-600 truncate">{expert.company_name}</span>
                                            </div>
                                        )}
                                        <p className={`text-sm text-gray-500 mt-4 ${viewMode === 'grid' ? 'line-clamp-3' : 'line-clamp-2'}`}>
                                            {expert.bio}
                                        </p>

                                        <div className="flex flex-wrap gap-2 mt-4">
                                            {(expert.service_categories || []).map((tag: string) => (
                                                <span key={tag} className="text-[10px] font-bold bg-secondary/5 text-secondary px-2 py-1 rounded-lg">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className={`${viewMode === 'grid' ? 'pt-6 border-t border-gray-50 mt-auto' : 'flex-shrink-0 min-w-[200px] flex flex-col items-center gap-4'}`}>
                                        {viewMode === 'grid' && (
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-1">
                                                    <Star className="w-4 h-4 text-secondary fill-secondary" />
                                                    <span className="font-bold text-sm">{expert.rating || 'New'}</span>
                                                </div>
                                                <Link
                                                    to={`/experts/${expert.id}`}
                                                    className="bg-gray-900 hover:bg-primary text-white px-4 py-2 rounded-xl transition-all font-bold text-sm text-center"
                                                >
                                                    View Profile
                                                </Link>
                                            </div>
                                        )}
                                        {viewMode === 'list' && (
                                            <Link
                                                to={`/experts/${expert.id}`}
                                                className="w-full bg-gray-900 hover:bg-primary text-white py-4 rounded-2xl transition-all font-bold text-center"
                                            >
                                                View Full Profile
                                            </Link>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                            <User className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No Experts Found</h3>
                            <p className="text-gray-500">We couldn't find any verified experts matching your criteria.</p>
                            <button
                                onClick={() => { setSearchTerm(''); loadConsultants(); }}
                                className="mt-6 text-primary font-bold hover:underline"
                            >
                                Clear all filters
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* General Enquiry Modal */}
            <AnimatePresence>
                {showEnquiryModal && (
                    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-gray-900/70 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
                        >
                            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">Get Expert Help</h3>
                                    <p className="text-sm text-gray-500 mt-0.5">Tell us your requirement — our team will assign the right expert.</p>
                                </div>
                                <button onClick={resetEnquiry} className="p-2 rounded-xl hover:bg-gray-100 transition">
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            {enquirySubmitted ? (
                                <div className="flex flex-col items-center text-center px-8 py-12">
                                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                        <CheckCircle className="w-8 h-8 text-primary" />
                                    </div>
                                    <h4 className="text-xl font-bold text-gray-900 mb-2">Enquiry Received!</h4>
                                    <p className="text-gray-500 text-sm max-w-xs">
                                        Our team will review your requirement and assign the right expert within 24–48 hours.
                                    </p>
                                    <button
                                        onClick={resetEnquiry}
                                        className="mt-6 bg-primary text-white font-bold px-8 py-3 rounded-2xl hover:bg-primary-dark transition"
                                    >
                                        Close
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleEnquirySubmit} className="px-8 py-6 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Your Name *</label>
                                            <input required type="text" placeholder="Full name"
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                                                value={enquiryForm.name}
                                                onChange={e => setEnquiryForm(f => ({ ...f, name: e.target.value }))}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Phone *</label>
                                            <input required type="tel" placeholder="+91 XXXXX XXXXX"
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                                                value={enquiryForm.phone}
                                                onChange={e => setEnquiryForm(f => ({ ...f, phone: e.target.value }))}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Email Address *</label>
                                        <input required type="email" placeholder="your@email.com"
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                                            value={enquiryForm.email}
                                            onChange={e => setEnquiryForm(f => ({ ...f, email: e.target.value }))}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Service Required *</label>
                                        <select required
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                                            value={enquiryForm.service_required}
                                            onChange={e => setEnquiryForm(f => ({ ...f, service_required: e.target.value }))}
                                        >
                                            <option value="">Select a service area</option>
                                            {['CNG', 'Bio-CNG', 'LPG', 'Plant Design', 'Equipment', 'Safety Audit', 'Project Finance', 'Other'].map(s => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Project Description</label>
                                        <textarea rows={3} placeholder="Briefly describe your project or need..."
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-sm resize-none"
                                            value={enquiryForm.project_description}
                                            onChange={e => setEnquiryForm(f => ({ ...f, project_description: e.target.value }))}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Timeline</label>
                                        <select
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                                            value={enquiryForm.timeline_preference}
                                            onChange={e => setEnquiryForm(f => ({ ...f, timeline_preference: e.target.value }))}
                                        >
                                            <option value="">Select timeline</option>
                                            <option>ASAP</option>
                                            <option>Within 1 month</option>
                                            <option>1–3 months</option>
                                            <option>3–6 months</option>
                                            <option>Flexible</option>
                                        </select>
                                    </div>

                                    <p className="text-xs text-gray-400 italic">An expert will be assigned by our team. You'll be contacted within 24–48 hrs.</p>

                                    <button
                                        type="submit"
                                        disabled={enquirySubmitting}
                                        className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition disabled:opacity-70"
                                    >
                                        {enquirySubmitting
                                            ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting...</>
                                            : <><Send className="w-4 h-4" /> Submit Enquiry</>}
                                    </button>
                                </form>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Consultants;
