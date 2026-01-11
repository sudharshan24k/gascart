import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    X,
    FolderTree,
    Code,
    Type,
    Image as ImageIcon
} from 'lucide-react';
import { fetchCategories, addCategory, updateCategory, deleteCategory } from '../../services/admin.service';

const CategoryManagement = () => {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<any>(null);

    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        image_url: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const data = await fetchCategories();
            setCategories(data);
        } catch (err) {
            console.error('Failed to load categories', err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (category: any = null) => {
        if (category) {
            setEditingCategory(category);
            setFormData({
                name: category.name,
                slug: category.slug,
                description: category.description || '',
                image_url: category.image_url || ''
            });
        } else {
            setEditingCategory(null);
            setFormData({
                name: '',
                slug: '',
                description: '',
                image_url: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                slug: formData.slug || formData.name.toLowerCase().replace(/ /g, '-')
            };

            if (editingCategory) {
                await updateCategory(editingCategory.id, payload);
            } else {
                await addCategory(payload);
            }
            setIsModalOpen(false);
            loadData();
        } catch (err) {
            console.error('Failed to save category', err);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this category? This might affect products linked to it.')) {
            try {
                await deleteCategory(id);
                loadData();
            } catch (err) {
                console.error('Failed to delete category', err);
            }
        }
    };

    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 leading-tight">Taxonomy & Categories</h2>
                    <p className="text-gray-500 mt-1 font-medium font-sans">Manage the organizational structure of the marketplace and learning hub</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-gray-900 border border-gray-800 text-white px-8 py-4 rounded-2xl flex items-center gap-3 font-bold shadow-2xl transition-all transform hover:-translate-y-1"
                >
                    <Plus className="w-5 h-5 text-primary" />
                    <span>Create Category</span>
                </button>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left: Stats & Info */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-primary/5 p-8 rounded-[32px] border border-primary/10">
                        <FolderTree className="w-10 h-10 text-primary mb-6" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Structure Hierarchy</h3>
                        <p className="text-gray-600 text-sm leading-relaxed mb-6">
                            Categories organize both Marketplace assets and Knowledge Hub content.
                            Ensure slugs are SEO-friendly as they dictate the URL patterns.
                        </p>
                        <div className="flex items-center gap-4 py-4 border-t border-primary/10">
                            <div>
                                <p className="text-2xl font-black text-primary">{categories.length}</p>
                                <p className="text-[10px] text-gray-400 font-black uppercase">Active Domains</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Grid of Categories */}
                <div className="lg:col-span-2">
                    <div className="relative mb-8">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Filter domains..."
                            className="w-full pl-14 pr-6 py-5 bg-white border border-gray-100 rounded-[20px] shadow-sm outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                        {loading ? ([1, 2, 3, 4].map(i => <div key={i} className="h-40 bg-gray-100 rounded-[28px] animate-pulse"></div>)) : (
                            filteredCategories.map(cat => (
                                <div key={cat.id} className="bg-white p-6 rounded-[28px] border border-gray-100 shadow-sm hover:shadow-md transition-all group relative">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center shrink-0">
                                            {cat.image_url ? <img src={cat.image_url} alt="" className="w-8 h-8 object-contain" /> : <FolderTree className="w-6 h-6 text-gray-300" />}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 leading-tight">{cat.name}</h4>
                                            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{cat.slug}</p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed h-8">
                                        {cat.description || 'No descriptive technical breakdown provided.'}
                                    </p>

                                    <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleOpenModal(cat)} className="p-2 hover:bg-gray-50 text-gray-400 hover:text-primary rounded-lg">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(cat.id)} className="p-2 hover:bg-gray-50 text-gray-400 hover:text-red-500 rounded-lg">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <div className="bg-white w-full max-w-lg rounded-[36px] shadow-2xl relative z-10 overflow-hidden">
                        <div className="p-10 border-b border-gray-50 bg-gray-50/50">
                            <h3 className="text-2xl font-bold text-gray-900">Manage Taxonomy Domain</h3>
                        </div>
                        <form onSubmit={handleSubmit} className="p-10 space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Category Display Name</label>
                                <div className="relative">
                                    <Type className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4" />
                                    <input
                                        required
                                        type="text"
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-primary/20 font-bold"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. Purification Systems"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">SEO Slug (Auto-generated if empty)</label>
                                <div className="relative">
                                    <Code className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4" />
                                    <input
                                        type="text"
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-primary/20 font-bold font-mono text-sm"
                                        value={formData.slug}
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                        placeholder="purification-systems"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Visual Icon/Image URL</label>
                                <div className="relative">
                                    <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4" />
                                    <input
                                        type="text"
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                                        value={formData.image_url}
                                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                        placeholder="https://gascart.com/assets/..."
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Description</label>
                                <textarea
                                    className="w-full p-4 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-primary/20 font-medium h-24 resize-none"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Brief technical scope of this domain..."
                                />
                            </div>
                            <button type="submit" className="w-full bg-primary text-white font-black py-5 rounded-2xl shadow-xl shadow-primary/20 transform hover:-translate-y-1 transition-all uppercase tracking-widest text-xs">
                                Commit Domain Updates
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoryManagement;
