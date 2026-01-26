import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { UserPlus, Star, MapPin, Search, Filter, Building2, Loader2, User } from 'lucide-react';
import { api } from '../services/api';

const Consultants: React.FC = () => {
    const [consultants, setConsultants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

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

        return fullName.includes(search) ||
            bio.includes(search) ||
            location.includes(search) ||
            categories.includes(search);
    });

    return (
        <div className="min-h-screen pt-32 pb-24 bg-gray-50">
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Header Area */}
                <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">Experts & Consultants</h1>
                        <p className="text-gray-600 max-w-xl">Consult with certified Bio-CNG professionals for plant design, audit, and technical optimization.</p>
                    </div>
                    <div className="flex gap-4">
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
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col lg:flex-row gap-6 mb-12">
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
                    <div className="flex gap-4 flex-shrink-0">
                        <button className="flex items-center gap-2 px-8 py-4 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all font-bold text-gray-700">
                            <Filter className="w-5 h-5" /> Filters
                        </button>
                    </div>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-12 h-12 text-primary animate-spin" />
                    </div>
                ) : filteredConsultants.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {filteredConsultants.map((expert, i) => (
                            <motion.div
                                key={expert.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all group p-6 flex flex-col h-full"
                            >
                                <div className="relative mb-6">
                                    {expert.profile_image ? (
                                        <img
                                            src={expert.profile_image}
                                            alt={`${expert.first_name} ${expert.last_name}`}
                                            className="w-24 h-24 rounded-2xl object-cover"
                                        />
                                    ) : (
                                        <div className="w-24 h-24 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400">
                                            <User className="w-12 h-12" />
                                        </div>
                                    )}
                                    <div className="absolute top-0 right-0 bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-bold">
                                        {expert.experience_years}+ Yrs Exp
                                    </div>
                                </div>

                                <div className="mb-6 flex-grow">
                                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors">
                                        {expert.first_name} {expert.last_name}
                                    </h3>
                                    <div className="flex items-center gap-1 text-gray-400 text-xs mt-1">
                                        <MapPin className="w-3 h-3" /> {expert.location || 'Remote'}
                                    </div>
                                    {expert.company_name && (
                                        <div className="flex items-center gap-2 mt-3 p-2 bg-gray-50 rounded-xl">
                                            <Building2 className="w-4 h-4 text-primary" />
                                            <span className="text-xs font-bold text-gray-600 truncate">{expert.company_name}</span>
                                        </div>
                                    )}
                                    <p className="text-sm text-gray-500 mt-4 line-clamp-3">
                                        {expert.bio}
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-2 mb-8">
                                    {(expert.service_categories || []).slice(0, 3).map((tag: string) => (
                                        <span key={tag} className="text-[10px] font-bold bg-secondary/5 text-secondary px-2 py-1 rounded-lg">
                                            {tag}
                                        </span>
                                    ))}
                                    {(expert.service_categories || []).length > 3 && (
                                        <span className="text-[10px] font-bold bg-gray-50 text-gray-400 px-2 py-1 rounded-lg">
                                            +{(expert.service_categories || []).length - 3}
                                        </span>
                                    )}
                                </div>

                                <div className="pt-6 border-t border-gray-50 flex items-center justify-between gap-4 mt-auto">
                                    <div className="flex items-center gap-1">
                                        <Star className="w-4 h-4 text-secondary fill-secondary" />
                                        <span className="font-bold text-sm">{expert.rating || 'New'}</span>
                                    </div>
                                    <Link
                                        to={`/experts/${expert.id}`}
                                        className="flex-grow bg-gray-900 hover:bg-primary text-white py-3 rounded-xl transition-all font-bold text-sm text-center"
                                    >
                                        View Profile
                                    </Link>
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
    );
};

export default Consultants;
