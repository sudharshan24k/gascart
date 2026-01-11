import React, { useState, useEffect } from 'react'; // Refresh
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Search, Video, Lock, Lightbulb, Zap, FileText } from 'lucide-react';
import { api } from '../services/api';

const Learn: React.FC = () => {
    const [articles, setArticles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeLevel, setActiveLevel] = useState('All');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchArticles = async () => {
            const params: any = {};
            if (activeLevel !== 'All') params.level = activeLevel.toLowerCase();
            const res = await api.articles.list(params);
            if (res.status === 'success') {
                setArticles(res.data);
            }
            setLoading(false);
        };
        fetchArticles();
    }, [activeLevel]);

    const levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];

    return (
        <div className="pt-32 pb-24 min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Hero Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-20"
                >
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                        <div>
                            <h1 className="text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
                                Knowledge <span className="text-primary italic">Hub</span>
                            </h1>
                            <p className="text-xl text-gray-500 max-w-2xl leading-relaxed">
                                Master the Bio-CNG value chain with engineering guides, market analysis, and professional insights.
                            </p>
                        </div>

                        {/* Search & Filter Bar */}
                        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                            <div className="relative flex-grow min-w-[300px]">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search resources..."
                                    className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-primary/10 transition-all font-medium"
                                />
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Level Tabs */}
                <div className="flex gap-4 mb-12 overflow-x-auto pb-4 no-scrollbar">
                    {levels.map(level => (
                        <button
                            key={level}
                            onClick={() => setActiveLevel(level)}
                            className={`px-8 py-3 rounded-full font-bold transition-all border shrink-0 ${activeLevel === level
                                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                                : 'bg-white text-gray-600 border-gray-100 hover:border-primary/30'
                                }`}
                        >
                            {level}
                        </button>
                    ))}
                </div>

                {/* Articles Grid */}
                {loading ? (
                    <div className="text-center py-20 text-gray-400 font-bold">Initializing Knowledge Base...</div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {articles.map((article, i) => (
                            <motion.div
                                key={article.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                onClick={() => navigate(`/learn/${article.slug}`)}
                                className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all group cursor-pointer relative overflow-hidden"
                            >
                                <div className="flex items-center justify-between mb-8">
                                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                                        {article.video_url ? <Video className="w-6 h-6" /> : <BookOpen className="w-6 h-6" />}
                                    </div>
                                    <div className="flex gap-2">
                                        {article.is_gated && (
                                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                                                <Lock className="w-4 h-4" />
                                            </div>
                                        )}
                                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${article.level === 'beginner' ? 'bg-green-100 text-green-700' :
                                            article.level === 'intermediate' ? 'bg-orange-100 text-orange-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                            {article.level}
                                        </span>
                                    </div>
                                </div>

                                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-primary transition-colors leading-tight">
                                    {article.title}
                                </h3>

                                <p className="text-gray-500 mb-8 line-clamp-3 text-sm leading-relaxed">
                                    Explore technical details about {article.title.toLowerCase()} specifically tailored for the industrial renewable energy sector.
                                </p>

                                <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                                    <span className="text-xs font-bold text-gray-400">{new Date(article.created_at).toLocaleDateString()}</span>
                                    <div className="text-primary font-bold text-sm flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        Read Insight <BookOpen className="w-4 h-4" />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Categories Overview */}
                <div className="mt-32 grid md:grid-cols-3 gap-8">
                    {[
                        { title: "Plant Design", icon: Zap, count: 12 },
                        { title: "Policy & Funding", icon: FileText, count: 8 },
                        { title: "Feedstock Guide", icon: Lightbulb, count: 15 }
                    ].map((cat, i) => (
                        <div key={i} className="flex items-center gap-6 p-8 bg-white rounded-3xl border border-gray-100 cursor-pointer hover:border-primary/30 transition-all group">
                            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-primary/5">
                                <cat.icon className="w-8 h-8 text-gray-400 group-hover:text-primary transition-colors" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900">{cat.title}</h4>
                                <p className="text-sm text-gray-400">{cat.count} Resources</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Learn;
