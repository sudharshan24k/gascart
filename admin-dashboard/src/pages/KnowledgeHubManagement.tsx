import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    X,
    BookOpen,
    Video,
    Lock,
    Unlock,
    Eye,
    Tag,
    ChevronRight,
    Search as SearchIcon
} from 'lucide-react';
import { fetchAdminArticles, addArticle, updateArticle, deleteArticle, fetchCategories } from '../../services/admin.service';

const KnowledgeHubManagement = () => {
    const [articles, setArticles] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingArticle, setEditingArticle] = useState<any>(null);

    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        content: '',
        video_url: '',
        level: 'beginner',
        is_gated: false,
        category_id: '',
        tags: [] as string[],
        linked_product_ids: [] as string[]
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [articlesData, categoriesData] = await Promise.all([
                fetchAdminArticles(),
                fetchCategories()
            ]);
            setArticles(articlesData);
            setCategories(categoriesData);
        } catch (err) {
            console.error('Failed to load knowledge hub data', err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (article: any = null) => {
        if (article) {
            setEditingArticle(article);
            setFormData({
                title: article.title,
                slug: article.slug,
                content: article.content || '',
                video_url: article.video_url || '',
                level: article.level || 'beginner',
                is_gated: article.is_gated || false,
                category_id: article.category_id || '',
                tags: article.tags || [],
                linked_product_ids: article.linked_product_ids || []
            });
        } else {
            setEditingArticle(null);
            setFormData({
                title: '',
                slug: '',
                content: '',
                video_url: '',
                level: 'beginner',
                is_gated: false,
                category_id: '',
                tags: [],
                linked_product_ids: []
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                slug: formData.slug || formData.title.toLowerCase().replace(/ /g, '-')
            };

            if (editingArticle) {
                await updateArticle(editingArticle.id, payload);
            } else {
                await addArticle(payload);
            }
            setIsModalOpen(false);
            loadData();
        } catch (err) {
            console.error('Failed to save article', err);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this article?')) {
            try {
                await deleteArticle(id);
                loadData();
            } catch (err) {
                console.error('Failed to delete article', err);
            }
        }
    };

    const filteredArticles = articles.filter(a =>
        a.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 leading-tight">Knowledge Hub Control</h2>
                    <p className="text-gray-500 mt-1">Manage industrial educational content and engineering resources</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-2xl flex items-center gap-3 font-bold shadow-xl shadow-primary/20 transition-all transform hover:-translate-y-1"
                >
                    <Plus className="w-5 h-5" />
                    <span>Create New Article</span>
                </button>
            </div>

            {/* Search */}
            <div className="relative mb-10">
                <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6" />
                <input
                    type="text"
                    placeholder="Search by title..."
                    className="w-full pl-16 pr-8 py-5 bg-white border-none rounded-[24px] shadow-sm focus:ring-4 focus:ring-primary/5 outline-none transition-all font-medium text-lg"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Content Table */}
            <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 text-gray-400 text-[10px] font-black uppercase tracking-widest border-b border-gray-100">
                                <th className="py-6 px-10">Content Info</th>
                                <th className="py-6 px-10">Classification</th>
                                <th className="py-6 px-10">Status & Level</th>
                                <th className="py-6 px-10 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                [1, 2, 3].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={4} className="py-12 px-10"><div className="h-6 bg-gray-100 rounded-xl w-full"></div></td>
                                    </tr>
                                ))
                            ) : filteredArticles.map((article) => (
                                <tr key={article.id} className="hover:bg-gray-50/30 transition-colors group">
                                    <td className="py-8 px-10">
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-white transition-colors">
                                                {article.video_url ? <Video className="w-8 h-8 text-primary" /> : <BookOpen className="w-8 h-8 text-blue-500" />}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900 text-lg mb-1">{article.title}</div>
                                                <div className="text-xs text-gray-400 font-medium font-sans flex items-center gap-2">
                                                    <Tag className="w-3 h-3" /> {article.categories?.name || 'Uncategorized'}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-8 px-10">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs font-bold text-gray-500 uppercase tracking-tighter">Skill Level</span>
                                            <span className={`text-sm font-black uppercase ${article.level === 'advanced' ? 'text-red-500' :
                                                    article.level === 'intermediate' ? 'text-amber-500' : 'text-green-500'
                                                }`}>
                                                {article.level}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-8 px-10">
                                        <div className="flex items-center gap-6">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-xs font-bold text-gray-500 uppercase tracking-tighter">Visibility</span>
                                                <div className="flex items-center gap-2">
                                                    {article.is_gated ? (
                                                        <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-black uppercase tracking-tight">
                                                            <Lock className="w-3 h-3" /> Gated Lead
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-lg text-[10px] font-black uppercase tracking-tight">
                                                            <Unlock className="w-3 h-3" /> Free Access
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-8 px-10 text-right">
                                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleOpenModal(article)}
                                                className="p-3 text-gray-400 hover:text-primary hover:bg-white rounded-xl shadow-sm transition-all"
                                            >
                                                <Edit2 className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(article.id)}
                                                className="p-3 text-gray-400 hover:text-red-500 hover:bg-white rounded-xl shadow-sm transition-all"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {!loading && filteredArticles.length === 0 && (
                    <div className="py-32 text-center text-gray-400">
                        <BookOpen className="w-20 h-20 mx-auto mb-6 opacity-10" />
                        <p className="text-xl font-bold">No educational assets found</p>
                    </div>
                )}
            </div>

            {/* CRUD Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <div className="bg-white w-full max-w-4xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col relative z-20 max-h-[90vh]">
                        <div className="p-10 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h3 className="text-3xl font-bold text-gray-900 leading-tight">
                                    {editingArticle ? 'Update Technical Asset' : 'Publish New Content'}
                                </h3>
                                <p className="text-gray-500 font-medium">Configure all parameters for Section 6.1 compliance</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-white rounded-2xl shadow-sm transition-all">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-12 overflow-y-auto space-y-10">
                            <div className="grid grid-cols-2 gap-10">
                                <div className="col-span-2">
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Article Title</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full px-6 py-5 bg-gray-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 transition-all text-lg font-bold"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="e.g. Industrial Biogas Purification Techniques"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Skill Level Classification</label>
                                    <select
                                        className="w-full px-6 py-5 bg-gray-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold"
                                        value={formData.level}
                                        onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                                    >
                                        <option value="beginner">Beginner (Foundational)</option>
                                        <option value="intermediate">Intermediate (Practitioner)</option>
                                        <option value="advanced">Advanced (Industrial Expert)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Structural Category</label>
                                    <select
                                        required
                                        className="w-full px-6 py-5 bg-gray-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold"
                                        value={formData.category_id}
                                        onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                    >
                                        <option value="">Select Domain Category</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Content Video URL (YouTube/Vimeo)</label>
                                    <div className="relative">
                                        <Video className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type="text"
                                            className="w-full pl-16 pr-6 py-5 bg-gray-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 transition-all font-medium"
                                            value={formData.video_url}
                                            onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                                            placeholder="https://youtube.com/..."
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    <label className="flex items-center gap-4 cursor-pointer group mt-6">
                                        <div className={`w-14 h-7 rounded-full transition-all relative ${formData.is_gated ? 'bg-amber-500' : 'bg-gray-200'}`}>
                                            <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-sm ${formData.is_gated ? 'left-8' : 'left-1'}`}></div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={formData.is_gated}
                                            onChange={(e) => setFormData({ ...formData, is_gated: e.target.checked })}
                                        />
                                        <div>
                                            <span className="block font-black text-gray-900 text-sm uppercase tracking-tighter">Gated Lead Magnet</span>
                                            <span className="text-[10px] text-gray-400 font-bold">Require login to access full technical content</span>
                                        </div>
                                    </label>
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Detailed Technical Narrative</label>
                                    <textarea
                                        rows={10}
                                        className="w-full px-8 py-8 bg-gray-50 border-none rounded-[32px] outline-none focus:ring-4 focus:ring-primary/5 transition-all font-medium text-lg resize-none leading-relaxed"
                                        value={formData.content}
                                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                        placeholder="Engineered content with technical depth..."
                                    ></textarea>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-primary hover:bg-primary-dark text-white font-black py-6 rounded-[24px] shadow-2xl shadow-primary/30 transform hover:-translate-y-1 transition-all text-xl"
                            >
                                {editingArticle ? 'Commit Technical Updates' : 'Publish to Knowledge Hub'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default KnowledgeHubManagement;
