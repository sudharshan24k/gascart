import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { UserPlus, Star, MapPin, Search, Filter, Building2 } from 'lucide-react';

const expertConsultants = [
    {
        id: 1,
        name: "Dr. Rajesh Kumar",
        role: "Senior Biogas Expert",
        location: "Pune, Maharashtra",
        exp: "15+ Years",
        rating: 4.9,
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200&h=200",
        tags: ["Anaerobic Digestion", "Plant Design"],
        vendor: "BioGreen Engineering"
    },
    {
        id: 2,
        name: "Sanjay Singhania",
        role: "Bio-CNG Infrastructure Lead",
        location: "Ahmedabad, Gujarat",
        exp: "10 Years",
        rating: 4.8,
        image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200&h=200",
        tags: ["Compression Systems", "Distribution"],
        vendor: "Indra Infrastructure"
    },
    {
        id: 3,
        name: "Priya Sharma",
        role: "Waste Management Specialist",
        location: "Bangalore, Karnataka",
        exp: "8 Years",
        rating: 4.9,
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200&h=200",
        tags: ["Feedstock Optimization", "Sustainability"],
        vendor: "Waste2Value Solutions"
    },
    {
        id: 4,
        name: "Anita Desai",
        role: "Renewable Energy Consultant",
        location: "New Delhi",
        exp: "12 Years",
        rating: 4.7,
        image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200&h=200",
        tags: ["Government Subsidies", "Project Finance"],
        vendor: "Green Capital Advisors"
    }
];

const Consultants: React.FC = () => {
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
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {expertConsultants.map((expert, i) => (
                        <motion.div
                            key={expert.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all group p-6"
                        >
                            <div className="relative mb-6">
                                <img
                                    src={expert.image}
                                    alt={expert.name}
                                    className="w-24 h-24 rounded-2xl object-cover"
                                />
                                <div className="absolute top-0 right-0 bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-bold">
                                    {expert.exp} Exp
                                </div>
                            </div>

                            <div className="mb-6">
                                <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors">{expert.name}</h3>
                                <div className="flex items-center gap-1 text-gray-400 text-xs mt-1">
                                    <MapPin className="w-3 h-3" /> {expert.location}
                                </div>
                                <div className="flex items-center gap-2 mt-3 p-2 bg-gray-50 rounded-xl">
                                    <Building2 className="w-4 h-4 text-primary" />
                                    <span className="text-xs font-bold text-gray-600 truncate">{expert.vendor}</span>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-8">
                                {expert.tags.map(tag => (
                                    <span key={tag} className="text-[10px] font-bold bg-secondary/5 text-secondary px-2 py-1 rounded-lg">
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            <div className="pt-6 border-t border-gray-50 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4 text-secondary fill-secondary" />
                                    <span className="font-bold text-sm">{expert.rating}</span>
                                </div>
                                <button className="flex-grow bg-gray-900 hover:bg-primary text-white py-3 rounded-xl transition-all font-bold text-sm">
                                    Add to RFQ
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Consultants;
