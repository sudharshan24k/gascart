import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BookOpen, Video, Lock, ChevronLeft, Calendar, Tag } from 'lucide-react';
import { api } from '../services/api';

const ArticleDetail: React.FC = () => {
    const { slug } = useParams();
    const [article, setArticle] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchArticle = async () => {
            if (slug) {
                const res = await api.articles.get(slug);
                if (res.status === 'success') {
                    setArticle(res.data);
                }
                setLoading(false);
            }
        };
        fetchArticle();
    }, [slug]);

    if (loading) return <div className="pt-32 text-center text-gray-500 font-bold">Loading insights...</div>;
    if (!article) return <div className="pt-32 text-center text-red-500 font-bold">Concept not found</div>;

    return (
        <div className="pt-32 pb-24 min-h-screen bg-white">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Back Link */}
                <Link to="/learn" className="inline-flex items-center gap-2 text-primary font-bold mb-10 hover:underline">
                    <ChevronLeft className="w-5 h-5" /> Back to Knowledge Hub
                </Link>

                {/* Article Header */}
                <header className="mb-12">
                    <div className="flex items-center gap-4 mb-6">
                        <span className={`px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest ${article.level === 'beginner' ? 'bg-green-100 text-green-700' :
                            article.level === 'intermediate' ? 'bg-orange-100 text-orange-700' :
                                'bg-red-100 text-red-700'
                            }`}>
                            {article.level} Level
                        </span>
                        {article.is_gated && (
                            <span className="flex items-center gap-1 bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">
                                <Lock className="w-3 h-3" /> Gated Content
                            </span>
                        )}
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 leading-tight">
                        {article.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-8 py-6 border-y border-gray-100">
                        <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                            <Calendar className="w-4 h-4" /> {new Date(article.created_at).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                            <Tag className="w-4 h-4" /> {article.categories?.name}
                        </div>
                    </div>
                </header>

                {/* Video Section */}
                {article.video_url && (
                    <div className="mb-12 rounded-[40px] overflow-hidden shadow-2xl bg-gray-900 aspect-video flex items-center justify-center relative group">
                        <Video className="w-20 h-20 text-white/20 absolute" />
                        <iframe
                            className="w-full h-full relative z-10"
                            src={article.video_url.replace('watch?v=', 'embed/')}
                            title="Video Content"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>
                )}

                {/* Content */}
                <article className="prose prose-lg max-w-none text-gray-600 leading-relaxed mb-16">
                    {article.is_gated ? (
                        <div className="bg-gray-50 p-12 rounded-[40px] border-2 border-dashed border-gray-200 text-center">
                            <Lock className="w-12 h-12 text-gray-300 mx-auto mb-6" />
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Deep Technical Content Locked</h3>
                            <p className="mb-8">This article is part of our Premium Knowledge Hub. Please register or sign in to access deeper technical insights.</p>
                            <Link to="/login" className="bg-primary text-white px-10 py-4 rounded-full font-bold shadow-lg">Login to Read More</Link>
                        </div>
                    ) : (
                        <div dangerouslySetInnerHTML={{ __html: article.content }} />
                    )}
                </article>

                {/* Linked Products */}
                {article.linked_product_ids?.length > 0 && (
                    <div className="mt-20 pt-20 border-t border-gray-100">
                        <h2 className="text-3xl font-bold mb-10">Relevant Equipment & Systems</h2>
                        <div className="grid sm:grid-cols-2 gap-8">
                            <div className="p-8 bg-primary/5 rounded-[32px] border border-primary/10 flex items-center justify-between group cursor-pointer hover:bg-primary/10 transition-all">
                                <div>
                                    <p className="text-xs font-black text-primary uppercase mb-2">Recommended for this topic</p>
                                    <h4 className="font-bold text-gray-900">Go to Marketplace</h4>
                                </div>
                                <BookOpen className="w-8 h-8 text-primary group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ArticleDetail;
