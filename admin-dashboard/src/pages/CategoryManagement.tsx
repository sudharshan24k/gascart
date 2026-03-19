import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    FolderTree,
    Code,
    Type,
    Upload,
    AlertTriangle,
    ArchiveX,
    RefreshCcw,
    Skull,
    Image as ImageIcon
} from 'lucide-react';
import {
    fetchCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    permanentlyDeleteCategory,
    uploadFile
} from '../services/admin.service';
import { MediaLibraryModal } from '../components/MediaLibraryModal';

// ─── Soft Delete Warning Popup ───────────────────────────────────────────────
const SoftDeleteModal = ({
    category,
    allCategories,
    onConfirm,
    onCancel
}: {
    category: any;
    allCategories: any[];
    onConfirm: () => void;
    onCancel: () => void;
}) => {
    const otherCategories = (allCategories || []).filter(c => c.id !== category.id && c.status === 'active');

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onCancel} />
            <div className="bg-white w-full max-w-lg rounded-[28px] shadow-2xl relative z-10 overflow-hidden">
                {/* Header */}
                <div className="bg-amber-50 border-b border-amber-100 px-8 py-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-gray-900">Mark Category as Deleted?</h3>
                        <p className="text-sm text-amber-700 font-medium mt-0.5">This is a soft delete — data is preserved</p>
                    </div>
                </div>

                {/* Body */}
                <div className="px-8 py-6 space-y-5">
                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                        <p className="text-sm font-black text-gray-700 mb-1">Category being deleted:</p>
                        <p className="text-base font-black text-gray-900">{category.name}</p>
                        <p className="text-xs text-gray-400 font-mono mt-0.5">{category.slug}</p>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-amber-800 font-medium leading-relaxed">
                                Products linked to this category will still reference it. Before confirming,
                                consider reassigning those products to another category.
                            </p>
                        </div>

                        {otherCategories.length > 0 && (
                            <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl">
                                <p className="text-xs font-black text-blue-800 mb-2">Available categories to reassign to:</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {otherCategories.slice(0, 8).map(c => (
                                        <span key={c.id} className="px-2.5 py-1 bg-white border border-blue-200 rounded-lg text-xs font-bold text-blue-700">
                                            {c.name}
                                        </span>
                                    ))}
                                    {otherCategories.length > 8 && (
                                        <span className="px-2.5 py-1 bg-white border border-blue-200 rounded-lg text-xs font-bold text-blue-400">
                                            +{otherCategories.length - 8} more
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                        <p className="text-[11px] text-gray-400 font-medium px-1">
                            ℹ️ This category will be moved to the <strong>Deleted</strong> tab. You can permanently remove it from there.
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="px-8 pb-8 flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-3.5 border border-gray-200 rounded-2xl font-bold text-sm text-gray-600 hover:bg-gray-50 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 py-3.5 bg-amber-500 hover:bg-amber-600 rounded-2xl font-black text-sm text-white transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
                    >
                        <ArchiveX className="w-4 h-4" />
                        Mark as Deleted
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Permanent Delete Warning Popup ──────────────────────────────────────────
const PermanentDeleteModal = ({
    category,
    onConfirm,
    onCancel
}: {
    category: any;
    onConfirm: () => void;
    onCancel: () => void;
}) => {
    const [confirmed, setConfirmed] = useState(false);

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-gray-900/70 backdrop-blur-sm" onClick={onCancel} />
            <div className="bg-white w-full max-w-md rounded-[28px] shadow-2xl relative z-10 overflow-hidden border-2 border-red-100">
                {/* Header */}
                <div className="bg-red-600 px-8 py-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                        <Skull className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-white">Permanent Delete</h3>
                        <p className="text-sm text-red-200 font-medium mt-0.5">This action cannot be undone</p>
                    </div>
                </div>

                {/* Body */}
                <div className="px-8 py-6 space-y-5">
                    <div className="bg-red-50 rounded-2xl p-4 border border-red-100">
                        <p className="text-xs font-black text-red-600 uppercase tracking-widest mb-1">Deleting forever:</p>
                        <p className="text-base font-black text-gray-900">{category.name}</p>
                    </div>

                    <div className="p-4 bg-red-50 border border-red-200 rounded-2xl space-y-1.5">
                        <p className="text-xs font-black text-red-700">⚠️ Warning — this will:</p>
                        <ul className="text-xs text-red-700 font-medium space-y-1 pl-4 list-disc">
                            <li>Permanently remove the category record from the database</li>
                            <li>Leave products orphaned (no category assignment)</li>
                            <li>This <strong>cannot be reversed</strong></li>
                        </ul>
                    </div>

                    <label className="flex items-center gap-3 cursor-pointer p-3 bg-gray-50 rounded-xl border border-gray-200 hover:bg-red-50 hover:border-red-200 transition-all">
                        <input
                            type="checkbox"
                            className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
                            checked={confirmed}
                            onChange={e => setConfirmed(e.target.checked)}
                        />
                        <span className="text-sm font-bold text-gray-800">
                            I understand this is permanent and cannot be undone
                        </span>
                    </label>
                </div>

                {/* Actions */}
                <div className="px-8 pb-8 flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-3.5 border border-gray-200 rounded-2xl font-bold text-sm text-gray-600 hover:bg-gray-50 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={!confirmed}
                        className="flex-1 py-3.5 bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-2xl font-black text-sm text-white transition-all shadow-lg shadow-red-500/20 flex items-center justify-center gap-2"
                    >
                        <Skull className="w-4 h-4" />
                        Permanently Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const CategoryManagement = () => {
    const [categories, setCategories] = useState<any[]>([]);
    const [deletedCategories, setDeletedCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [imageFilter, setImageFilter] = useState('all');
    const [parentFilter, setParentFilter] = useState('all');
    const [sortBy, setSortBy] = useState('name_asc');
    const [activeTab, setActiveTab] = useState<'active' | 'deleted'>('active');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<any>(null);
    const [uploading, setUploading] = useState(false);
    const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);

    const [softDeleteTarget, setSoftDeleteTarget] = useState<any>(null);
    const [permanentDeleteTarget, setPermanentDeleteTarget] = useState<any>(null);

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
            setLoading(true);
            const [active, deleted] = await Promise.all([
                fetchCategories('active'),
                fetchCategories('deleted')
            ]);
            setCategories(active || []);
            setDeletedCategories(deleted || []);
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
            setFormData({ name: '', slug: '', description: '', image_url: '' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const sanitizedSlug = (formData.slug || formData.name)
                .toLowerCase().trim()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');

            const payload = {
                ...formData,
                slug: sanitizedSlug,
                image_url: formData.image_url || null,
                description: formData.description || null
            };

            if (editingCategory) {
                await updateCategory(editingCategory.id, payload);
            } else {
                await addCategory(payload);
            }
            setIsModalOpen(false);
            loadData();
        } catch (err: any) {
            console.error('Failed to save category', err);
            alert('Failed to save category. ' + (err.response?.data?.message || err.message || 'It might be a duplicate slug.'));
        }
    };

    // Soft delete — just marks as deleted
    const handleSoftDelete = async () => {
        if (!softDeleteTarget) return;
        try {
            await deleteCategory(softDeleteTarget.id);
            setSoftDeleteTarget(null);
            loadData();
        } catch (err) {
            console.error('Failed to soft-delete category', err);
            alert('Failed to mark category as deleted.');
        }
    };

    // Hard delete — permanently removes
    const handlePermanentDelete = async () => {
        if (!permanentDeleteTarget) return;
        try {
            await permanentlyDeleteCategory(permanentDeleteTarget.id);
            setPermanentDeleteTarget(null);
            loadData();
        } catch (err) {
            console.error('Failed to permanently delete category', err);
            alert('Failed to permanently delete category.');
        }
    };

    // Restore a deleted category back to active
    const handleRestore = async (cat: any) => {
        try {
            await updateCategory(cat.id, { status: 'active' });
            loadData();
        } catch (err) {
            console.error('Failed to restore category', err);
        }
    };

    const applyFilters = (list: any[]) => (list || []).filter(c => {
        const query = searchTerm.toLowerCase();
        const matchesSearch = c.name.toLowerCase().includes(query) ||
            (c.slug && c.slug.toLowerCase().includes(query)) ||
            (c.description && c.description.toLowerCase().includes(query));

        const matchesImage = imageFilter === 'all' ||
            (imageFilter === 'with_image' && c.image_url) ||
            (imageFilter === 'without_image' && !c.image_url);

        const matchesParent = parentFilter === 'all' ||
            (parentFilter === 'top_level' && !c.parent_id) ||
            (parentFilter === 'sub_category' && c.parent_id);

        return matchesSearch && matchesImage && matchesParent;
    }).sort((a, b) => {
        switch (sortBy) {
            case 'name_asc': return a.name.localeCompare(b.name);
            case 'name_desc': return b.name.localeCompare(a.name);
            case 'newest': return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            case 'oldest': return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
            default: return 0;
        }
    });

    const filteredActive = applyFilters(categories);
    const filteredDeleted = applyFilters(deletedCategories);

    return (
        <div className="max-w-7xl mx-auto">
            {/* Modals */}
            {softDeleteTarget && (
                <SoftDeleteModal
                    category={softDeleteTarget}
                    allCategories={categories}
                    onConfirm={handleSoftDelete}
                    onCancel={() => setSoftDeleteTarget(null)}
                />
            )}
            {permanentDeleteTarget && (
                <PermanentDeleteModal
                    category={permanentDeleteTarget}
                    onConfirm={handlePermanentDelete}
                    onCancel={() => setPermanentDeleteTarget(null)}
                />
            )}

            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 leading-tight">Taxonomy &amp; Categories</h2>
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

            {/* Tabs */}
            <div className="flex gap-2 mb-8">
                <button
                    onClick={() => setActiveTab('active')}
                    className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'active'
                        ? 'bg-gray-900 text-white shadow-xl'
                        : 'bg-white border border-gray-100 text-gray-500 hover:border-gray-300'}`}
                >
                    <FolderTree className="w-4 h-4" />
                    Active
                    <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-black ${activeTab === 'active' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                        {categories.length}
                    </span>
                </button>
                <button
                    onClick={() => setActiveTab('deleted')}
                    className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'deleted'
                        ? 'bg-red-600 text-white shadow-xl shadow-red-500/20'
                        : 'bg-white border border-gray-100 text-gray-500 hover:border-red-200 hover:text-red-500'}`}
                >
                    <ArchiveX className="w-4 h-4" />
                    Deleted
                    {deletedCategories.length > 0 && (
                        <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-black ${activeTab === 'deleted' ? 'bg-white/20 text-white' : 'bg-red-100 text-red-500'}`}>
                            {deletedCategories.length}
                        </span>
                    )}
                </button>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left: Stats */}
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
                            {deletedCategories.length > 0 && (
                                <div className="ml-6">
                                    <p className="text-2xl font-black text-red-400">{deletedCategories.length}</p>
                                    <p className="text-[10px] text-gray-400 font-black uppercase">Deleted</p>
                                </div>
                            )}
                        </div>
                        {activeTab === 'deleted' && (
                            <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl">
                                <p className="text-xs text-red-700 font-medium leading-relaxed">
                                    <strong>Deleted categories</strong> are hidden from the marketplace but preserved in the database.
                                    Permanently delete only when you're sure products have been reassigned.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Category Grid */}
                <div className="lg:col-span-2">
                    {/* Filters */}
                    <div className="flex flex-wrap gap-4 mb-8">
                        <div className="relative flex-grow min-w-[300px]">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Filter domains by name, slug, or description..."
                                className="w-full pl-14 pr-6 py-4 bg-white border border-gray-100 rounded-[20px] shadow-sm outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <select value={parentFilter} onChange={(e) => setParentFilter(e.target.value)} className="px-4 py-4 bg-white border border-gray-100 rounded-[20px] shadow-sm outline-none font-bold text-gray-700 text-sm flex-grow sm:flex-grow-0">
                                <option value="all">All Levels</option>
                                <option value="top_level">Top Level</option>
                                <option value="sub_category">Sub-categories</option>
                            </select>
                            <select value={imageFilter} onChange={(e) => setImageFilter(e.target.value)} className="px-4 py-4 bg-white border border-gray-100 rounded-[20px] shadow-sm outline-none font-bold text-gray-700 text-sm flex-grow sm:flex-grow-0">
                                <option value="all">All Assets</option>
                                <option value="with_image">With Image</option>
                                <option value="without_image">No Image</option>
                            </select>
                            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-4 py-4 bg-white border border-gray-100 rounded-[20px] shadow-sm outline-none font-bold text-gray-700 text-sm flex-grow sm:flex-grow-0">
                                <option value="name_asc">Name A-Z</option>
                                <option value="name_desc">Name Z-A</option>
                                <option value="newest">Newest</option>
                                <option value="oldest">Oldest</option>
                            </select>
                        </div>
                    </div>

                    {/* Active Categories */}
                    {activeTab === 'active' && (
                        <div className="grid sm:grid-cols-2 gap-4">
                            {loading ? ([1, 2, 3, 4].map(i => <div key={i} className="h-40 bg-gray-100 rounded-[28px] animate-pulse" />)) : (
                                filteredActive.length === 0
                                    ? <div className="col-span-2 py-16 text-center text-gray-400 font-medium">No active categories found.</div>
                                    : filteredActive.map(cat => (
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
                                                <button onClick={() => setSoftDeleteTarget(cat)} className="p-2 hover:bg-amber-50 text-gray-400 hover:text-amber-500 rounded-lg" title="Mark as deleted">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                            )}
                        </div>
                    )}

                    {/* Deleted Categories */}
                    {activeTab === 'deleted' && (
                        <div className="grid sm:grid-cols-2 gap-4">
                            {loading ? ([1, 2].map(i => <div key={i} className="h-40 bg-gray-100 rounded-[28px] animate-pulse" />)) : (
                                filteredDeleted.length === 0
                                    ? (
                                        <div className="col-span-2 py-16 text-center">
                                            <ArchiveX className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                                            <p className="text-gray-400 font-medium">No deleted categories.</p>
                                        </div>
                                    )
                                    : filteredDeleted.map(cat => (
                                        <div key={cat.id} className="bg-white p-6 rounded-[28px] border-2 border-red-100 shadow-sm hover:shadow-md transition-all group relative opacity-80 hover:opacity-100">
                                            <div className="absolute top-3 right-3">
                                                <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[9px] font-black uppercase tracking-widest rounded-full">Deleted</span>
                                            </div>
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center shrink-0">
                                                    {cat.image_url ? <img src={cat.image_url} alt="" className="w-8 h-8 object-contain grayscale" /> : <FolderTree className="w-6 h-6 text-red-200" />}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-500 line-through leading-tight">{cat.name}</h4>
                                                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{cat.slug}</p>
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed h-8">
                                                {cat.description || 'No description.'}
                                            </p>
                                            <div className="mt-4 flex gap-2">
                                                <button
                                                    onClick={() => handleRestore(cat)}
                                                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-gray-50 hover:bg-green-50 hover:text-green-700 text-gray-500 rounded-xl text-xs font-bold transition-all border border-gray-100 hover:border-green-200"
                                                >
                                                    <RefreshCcw className="w-3.5 h-3.5" /> Restore
                                                </button>
                                                <button
                                                    onClick={() => setPermanentDeleteTarget(cat)}
                                                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-red-50 hover:bg-red-600 hover:text-white text-red-500 rounded-xl text-xs font-bold transition-all border border-red-100"
                                                >
                                                    <Skull className="w-3.5 h-3.5" /> Permanently Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Create / Edit Modal */}
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
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Visual Icon/Image</label>
                                <div className="flex items-center gap-4">
                                    {formData.image_url && (
                                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 border border-gray-100 flex-shrink-0">
                                            <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    <div className="flex-grow flex flex-col sm:flex-row gap-3">
                                        <label className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-primary/30 transition-all ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                                            <Upload className={`w-4 h-4 ${uploading ? 'animate-bounce' : 'text-gray-400'}`} />
                                            <span className="text-sm font-bold text-gray-500">{uploading ? 'Uploading...' : 'Upload New'}</span>
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={async (e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        try {
                                                            setUploading(true);
                                                            const data = await uploadFile('categories', file);
                                                            setFormData({ ...formData, image_url: data.url });
                                                        } catch (err) {
                                                            alert('Failed to upload image');
                                                        } finally {
                                                            setUploading(false);
                                                        }
                                                    }
                                                }}
                                            />
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => setIsMediaModalOpen(true)}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl transition-all border border-indigo-100 font-bold text-sm"
                                        >
                                            <ImageIcon className="w-4 h-4" />
                                            Choose from Library
                                        </button>
                                    </div>
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

            <MediaLibraryModal
                isOpen={isMediaModalOpen}
                onClose={() => setIsMediaModalOpen(false)}
                bucket="categories"
                title="Select Taxonomy Icon"
                onSelect={(url) => {
                    setFormData({ ...formData, image_url: url });
                    setIsMediaModalOpen(false);
                }}
            />
        </div>
    );
};

export default CategoryManagement;
