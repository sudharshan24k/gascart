import React, { useState, useEffect } from 'react'; // Refresh
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { BookOpen, Search, Video, Lock, Lightbulb, FileText, Download, File, FileCode, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

const Learn: React.FC = () => {
    const [articles, setArticles] = useState<any[]>([]);
    const [documents, setDocuments] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [docsLoading, setDocsLoading] = useState(true);
    const [activeLevel, setActiveLevel] = useState('All');
    const [docCategory, setDocCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchArticles = async () => {
            setLoading(true);
            const params: any = {};
            if (activeLevel !== 'All') params.level = activeLevel.toLowerCase();
            if (activeCategory !== 'All') params.category = activeCategory;
            if (searchQuery) params.search = searchQuery;

            const res = await api.articles.list(params);
            if (res.status === 'success') {
                setArticles(res.data);
            }
            setLoading(false);
        };

        const timer = setTimeout(() => {
            fetchArticles();
        }, 300);

        return () => clearTimeout(timer);
    }, [activeLevel, activeCategory, searchQuery]);

    useEffect(() => {
        const fetchCats = async () => {
            const res = await api.categories.list();
            if (res.status === 'success') {
                setCategories(res.data);
            }
        };
        fetchCats();
    }, []);

    useEffect(() => {
        const fetchDocuments = async () => {
            setDocsLoading(true);
            const params: any = {};
            if (docCategory !== 'All') params.category = docCategory;
            try {
                const res = await api.documents.list(params);
                if (res.status === 'success') {
                    setDocuments(res.data);
                }
            } catch (error) {
                console.error("Failed to fetch documents", error);
            }
            setDocsLoading(false);
        };
        fetchDocuments();
    }, [docCategory]);

    const levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];
    const docCategories = ['All', 'Legal', 'Policy', 'Privacy', 'Technical', 'Agreement', 'Other'];

    const getDocIcon = (category: string) => {
        switch (category) {
            case 'Technical': return <FileCode className="w-5 h-5" />;
            case 'Legal':
            case 'Agreement': return <FileText className="w-5 h-5" />;
            case 'Policy':
            case 'Privacy': return <CheckCircle2 className="w-5 h-5" />;
            default: return <File className="w-5 h-5" />;
        }
    };

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
                                Master the CNG value chain — covering both Bio-CNG and conventional CNG — with engineering guides, market analysis, and professional insights.
                            </p>
                        </div>

                        {/* Search & Filter Bar */}
                        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                            <div className="relative flex-grow min-w-[300px]">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search resources..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-primary/10 transition-all font-medium"
                                />
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* How It Works CTA Banner */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="mb-14"
                >
                    <Link
                        to="/our-process"
                        className="group flex flex-col sm:flex-row items-center justify-between gap-6 w-full bg-gradient-to-r from-primary to-green-500 hover:from-primary/90 hover:to-green-400 rounded-3xl px-8 py-6 shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all duration-300"
                    >
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
                                <Lightbulb className="w-7 h-7 text-white" />
                            </div>
                            <div className="text-left">
                                <p className="text-white/80 text-xs font-black uppercase tracking-widest mb-1">Explore GasCart</p>
                                <h3 className="text-white text-xl font-extrabold leading-tight">How It Works — Our Process</h3>
                                <p className="text-white/75 text-sm mt-1">From knowledge to installation — see every step of your sourcing journey.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 bg-white/20 hover:bg-white/30 transition-colors rounded-2xl px-6 py-3 shrink-0 group-hover:translate-x-1 duration-300">
                            <span className="text-white font-extrabold text-sm whitespace-nowrap">Our Process</span>
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                        </div>
                    </Link>
                </motion.div>

                {/* Level Tabs */}
                <div className="flex gap-4 mb-2 overflow-x-auto pb-4 no-scrollbar">
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

                {/* Category Tags */}
                <div className="flex gap-3 mb-12 overflow-x-auto pb-4 no-scrollbar">
                    <button
                        onClick={() => setActiveCategory('All')}
                        className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeCategory === 'All'
                            ? 'bg-neutral-900 text-white'
                            : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
                            }`}
                    >
                        All Domains
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeCategory === cat.id
                                ? 'bg-neutral-900 text-white'
                                : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
                                }`}
                        >
                            {cat.name}
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
                                    <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-white transition-colors overflow-hidden">
                                        {article.image_url ? (
                                            <img src={article.image_url} alt={article.title} className="w-full h-full object-cover" />
                                        ) : article.video_url ? (
                                            <Video className="w-10 h-10 text-primary" />
                                        ) : (
                                            <BookOpen className="w-10 h-10 text-blue-500" />
                                        )}
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
                {categories.length > 0 && (
                    <div className="mt-32 grid md:grid-cols-3 gap-8">
                        {categories.slice(0, 3).map((cat) => (
                            <div
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className="flex items-center gap-6 p-8 bg-white rounded-3xl border border-gray-100 cursor-pointer hover:border-primary/30 transition-all group"
                            >
                                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-primary/5">
                                    <Lightbulb className="w-8 h-8 text-gray-400 group-hover:text-primary transition-colors" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900">{cat.name}</h4>
                                    <p className="text-sm text-gray-400">Available Resources</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Document Center Section */}
                <div className="mt-40 mb-20">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
                            Platform <span className="text-primary italic">Documents</span>
                        </h2>
                        <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                            Access legal agreements, technical APIs, and compliance policies in our centralized document repository.
                        </p>
                    </div>

                    {/* Document Category Tabs */}
                    <div className="flex gap-4 mb-10 overflow-x-auto pb-4 justify-center no-scrollbar">
                        {docCategories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setDocCategory(cat)}
                                className={`px-6 py-2 rounded-full font-bold transition-all border shrink-0 text-sm ${docCategory === cat
                                    ? 'bg-gray-900 text-white border-gray-900'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-900 hover:text-gray-900'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Documents List */}
                    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                        {docsLoading ? (
                            <div className="text-center py-20 text-gray-400 font-bold flex justify-center items-center gap-3">
                                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                Loading documents...
                            </div>
                        ) : documents.length === 0 ? (
                            <div className="text-center py-20 bg-gray-50 border-t border-gray-100 flex flex-col items-center">
                                <FileText className="w-12 h-12 text-gray-300 mb-4" />
                                <p className="text-gray-500 font-medium font-sans">No public documents found in this category.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {documents.map((doc, idx) => (
                                    <motion.div
                                        key={doc.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="p-6 hover:bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors group"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-gray-100 text-gray-500 flex items-center justify-center shrink-0 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                                {getDocIcon(doc.category)}
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                                                    {doc.title}
                                                    <span className="px-2 py-0.5 rounded-md text-[10px] uppercase font-bold bg-gray-100 text-gray-500 tracking-wider">
                                                        v{doc.version}
                                                    </span>
                                                </h4>
                                                <div className="flex items-center gap-3 text-sm text-gray-500 font-medium">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${doc.category === 'Legal' || doc.category === 'Agreement' ? 'bg-indigo-50 text-indigo-600' :
                                                        doc.category === 'Technical' ? 'bg-cyan-50 text-cyan-600' :
                                                            'bg-gray-100 text-gray-600'
                                                        }`}>
                                                        {doc.category}
                                                    </span>
                                                    <span>•</span>
                                                    <span>{doc.file_size || 'PDF Document'}</span>
                                                    <span>•</span>
                                                    <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <a
                                            href={doc.file_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl text-sm flex items-center gap-2 hover:bg-gray-50 hover:border-gray-300 transition-colors shrink-0"
                                        >
                                            <Download className="w-4 h-4" /> Download
                                        </a>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Learn;
