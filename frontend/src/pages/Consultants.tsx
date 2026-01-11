import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { UserPlus, Star, MapPin, Award, Search, Filter } from 'lucide-react';

const expertConsultants = [
    {
        id: 1,
        name: "Dr. Rajesh Kumar",
        role: "Senior Biogas Expert",
        location: "Pune, Maharashtra",
        exp: "15+ Years",
        rating: 4.9,
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200&h=200",
        tags: ["Anaerobic Digestion", "Plant Design"]
    },
    {
        id: 2,
        name: "Sanjay Singhania",
        role: "Bio-CNG Infrastructure Lead",
        location: "Ahmedabad, Gujarat",
        exp: "10 Years",
        rating: 4.8,
        image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200&h=200",
        tags: ["Compression Systems", "Distribution"]
    },
    {
        id: 3,
        name: "Priya Sharma",
        role: "Waste Management Specialist",
        location: "Bangalore, Karnataka",
        exp: "8 Years",
        rating: 4.9,
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200&h=200",
        tags: ["Feedstock Optimization", "Sustainability"]
    },
    {
        id: 4,
        name: "Anita Desai",
        role: "Renewable Energy Consultant",
        location: "New Delhi",
        exp: "12 Years",
        rating: 4.7,
        image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200&h=200",
        tags: ["Government Subsidies", "Project Finance"]
    }
];

const Consultants: React.FC = () => {
    return (
        <div className="min-h-screen pt-24 bg-gray-50">
            {/* Hero Section */}
            <section className="bg-primary-dark text-white py-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-primary opacity-20 pattern-grid-lg"></div>
                <div className="container mx-auto px-4 relative z-10">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="max-w-2xl">
                            <h1 className="text-4xl md:text-5xl font-bold mb-6">Expert Bio-CNG Consultants</h1>
                            <p className="text-xl opacity-90 mb-8">
                                Connect with the industry's top professionals for plant design, feedstock management, and technical consultancy.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Link
                                    to="/consultant-registration"
                                    className="bg-white text-primary hover:bg-gray-100 px-8 py-3 rounded-full font-bold transition-all shadow-lg flex items-center gap-2"
                                >
                                    <UserPlus className="w-5 h-5" />
                                    Join as a Consultant
                                </Link>
                                <button className="bg-transparent border-2 border-white/30 hover:bg-white/10 text-white px-8 py-3 rounded-full font-bold transition-all">
                                    How it Works
                                </button>
                            </div>
                        </div>
                        <div className="hidden lg:block bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                                    <Award className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold">500+</div>
                                    <div className="text-sm opacity-80">Certified Experts</div>
                                </div>
                            </div>
                            <div className="text-sm opacity-80">Verified professionals across 24 states in India.</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-16 container mx-auto px-4">
                {/* Search & Filter Bar */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 mb-12">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by name, role or expertise..."
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                        />
                    </div>
                    <div className="flex gap-4">
                        <button className="flex items-center gap-2 px-6 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all text-gray-600 font-medium">
                            <MapPin className="w-4 h-4" /> Location
                        </button>
                        <button className="flex items-center gap-2 px-6 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all text-gray-600 font-medium">
                            <Filter className="w-4 h-4" /> Expertise
                        </button>
                    </div>
                </div>

                {/* Consultants Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {expertConsultants.map((consultant, i) => (
                        <motion.div
                            key={consultant.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-all group"
                        >
                            <div className="relative mb-6">
                                <img
                                    src={consultant.image}
                                    alt={consultant.name}
                                    className="w-24 h-24 rounded-2xl object-cover mx-auto"
                                />
                                <div className="absolute -bottom-2 right-1/2 translate-x-12 bg-secondary text-white text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                                    <Star className="w-3 h-3 fill-white" /> {consultant.rating}
                                </div>
                            </div>
                            <div className="text-center mb-6">
                                <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors">{consultant.name}</h3>
                                <p className="text-sm text-gray-500 font-medium mb-1">{consultant.role}</p>
                                <div className="flex items-center justify-center gap-1 text-xs text-gray-400">
                                    <MapPin className="w-3 h-3" /> {consultant.location}
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-6">
                                {consultant.tags.map(tag => (
                                    <span key={tag} className="text-[10px] font-bold bg-primary/5 text-primary px-2 py-1 rounded-md">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                            <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                                <div className="text-xs">
                                    <span className="text-gray-400">Experience:</span>
                                    <span className="ml-1 font-bold text-gray-700">{consultant.exp}</span>
                                </div>
                                <button className="text-primary font-bold text-sm hover:underline">View Profile</button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* CTA Bottom */}
                <div className="mt-20 bg-neutral-light rounded-[40px] p-8 md:p-16 text-center border border-neutral-dark/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 shrink-0"></div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">Are you a Bio-CNG professional?</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto mb-10 text-lg">
                        Gascart is the leading platform for renewable energy experts. Get paired with industrial clients and help shape the future of energy in India.
                    </p>
                    <Link
                        to="/consultant-registration"
                        className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-10 py-4 rounded-full font-bold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
                    >
                        <UserPlus className="w-5 h-5" />
                        Apply for Consultant Network
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default Consultants;
