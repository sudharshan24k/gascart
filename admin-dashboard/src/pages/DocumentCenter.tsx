import React, { useState, useEffect } from 'react';
import {
    FileText,
    Download,
    Trash2,
    FilePlus,
    Search,
    Clock,
    Gavel,
    X,
    Edit2,
    Loader2,
    Eye,
    EyeOff
} from 'lucide-react';
import {
    fetchDocuments,
    createDocument,
    updateDocument,
    deleteDocument
} from '../services/admin.service';

interface Document {
    id: string;
    title: string;
    category: string;
    file_url: string;
    file_size?: string;
    version?: string;
    is_public: boolean;
    status: string;
    created_at: string;
}

const DocumentCenter = () => {
    const [docs, setDocs] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDoc, setEditingDoc] = useState<Document | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        category: 'Legal',
        file_url: '',
        file_size: '',
        version: '1.0',
        is_public: true,
        status: 'active'
    });

    const categories = ['Legal', 'Policy', 'Privacy', 'Technical', 'Agreement', 'Other'];

    useEffect(() => {
        loadDocuments();
    }, []);

    const loadDocuments = async () => {
        setLoading(true);
        try {
            const data = await fetchDocuments();
            setDocs(data || []);
        } catch (err) {
            console.error('Failed to load documents', err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (doc: Document | null = null) => {
        if (doc) {
            setEditingDoc(doc);
            setFormData({
                title: doc.title,
                category: doc.category,
                file_url: doc.file_url,
                file_size: doc.file_size || '',
                version: doc.version || '1.0',
                is_public: doc.is_public,
                status: doc.status
            });
        } else {
            setEditingDoc(null);
            setFormData({
                title: '',
                category: 'Legal',
                file_url: '',
                file_size: '',
                version: '1.0',
                is_public: true,
                status: 'active'
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingDoc) {
                await updateDocument(editingDoc.id, formData);
            } else {
                await createDocument(formData);
            }
            setIsModalOpen(false);
            loadDocuments();
        } catch (err) {
            console.error('Failed to save document', err);
            alert('Failed to save document. Please try again.');
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
            try {
                await deleteDocument(id);
                loadDocuments();
            } catch (err) {
                console.error('Failed to delete document', err);
                alert('Failed to delete document. Please try again.');
            }
        }
    };

    const handleDownload = (doc: Document) => {
        if (doc.file_url) {
            window.open(doc.file_url, '_blank');
        }
    };

    const filteredDocs = docs.filter(d => d.title.toLowerCase().includes(searchTerm.toLowerCase()));

    const totalSize = docs.reduce((acc, doc) => {
        if (doc.file_size) {
            const match = doc.file_size.match(/(\d+\.?\d*)\s*(KB|MB|GB)/i);
            if (match) {
                const value = parseFloat(match[1]);
                const unit = match[2].toUpperCase();
                if (unit === 'KB') return acc + value / 1024;
                if (unit === 'GB') return acc + value * 1024;
                return acc + value;
            }
        }
        return acc;
    }, 0);

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 leading-tight">Document Repository</h2>
                    <p className="text-gray-500 mt-1 font-medium italic font-sans">Centralized governance for industrial agreements and platform policies</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-2xl flex items-center gap-3 font-black shadow-xl shadow-primary/20 transition-all transform hover:-translate-y-1"
                >
                    <FilePlus className="w-5 h-5" />
                    <span>Upload Governing Document</span>
                </button>
            </div>

            <div className="grid lg:grid-cols-4 gap-8">
                {/* Statistics */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm relative overflow-hidden">
                        <div className="relative z-10">
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Storage Utilization</h4>
                            <div className="mb-6">
                                <p className="text-4xl font-black text-gray-900 leading-none">{totalSize.toFixed(1)} MB</p>
                                <p className="text-xs font-bold text-primary mt-2 flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> {docs.length} Documents
                                </p>
                            </div>
                            <div className="w-full bg-gray-50 h-2 rounded-full overflow-hidden">
                                <div className="bg-primary h-full rounded-full" style={{ width: `${Math.min((totalSize / 100) * 100, 100)}%` }}></div>
                            </div>
                        </div>
                        <FileText className="absolute -bottom-4 -right-4 w-24 h-24 text-gray-50 opacity-50" />
                    </div>

                    <div className="bg-secondary-900 p-8 rounded-[32px] text-white shadow-xl">
                        <Gavel className="w-10 h-10 text-primary mb-6" />
                        <h4 className="font-bold text-xl mb-4 leading-tight">Legal Integrity</h4>
                        <p className="text-secondary-300 text-sm leading-relaxed">
                            Documents uploaded here are instantly available globally for prospective Vendors and Experts. Ensure version control is maintained.
                        </p>
                    </div>
                </div>

                {/* List */}
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-8 border-b border-gray-50 flex gap-6">
                            <div className="relative flex-grow">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Filter by document designation..."
                                    className="w-full pl-14 pr-6 py-4 bg-gray-50 border-none rounded-2xl outline-none font-bold"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            {loading ? (
                                <div className="flex items-center justify-center py-20">
                                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                </div>
                            ) : filteredDocs.length === 0 ? (
                                <div className="text-center py-20 text-gray-400">
                                    <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                    <p className="font-bold">No documents found</p>
                                    <p className="text-sm mt-2">Upload your first document to get started</p>
                                </div>
                            ) : (
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-gray-50/50 text-gray-400 text-[10px] font-black uppercase tracking-widest border-b border-gray-100">
                                            <th className="py-6 px-10">Document Name</th>
                                            <th className="py-6 px-10">Classification</th>
                                            <th className="py-6 px-10">Metadata</th>
                                            <th className="py-6 px-10 text-right">Governance</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {filteredDocs.map(doc => (
                                            <tr key={doc.id} className="hover:bg-gray-50/30 transition-colors group">
                                                <td className="py-8 px-10">
                                                    <div className="flex items-center gap-5">
                                                        <div className="w-12 h-12 bg-white border border-gray-100 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                                                            <FileText className="w-6 h-6 text-primary" />
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-gray-900 text-lg leading-tight">{doc.title}</div>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                {doc.is_public ? (
                                                                    <span className="text-[10px] font-black text-green-600 uppercase flex items-center gap-1">
                                                                        <Eye className="w-3 h-3" /> Public
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-[10px] font-black text-gray-400 uppercase flex items-center gap-1">
                                                                        <EyeOff className="w-3 h-3" /> Private
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-8 px-10">
                                                    <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-lg text-[10px] font-black uppercase tracking-tighter">
                                                        {doc.category}
                                                    </span>
                                                </td>
                                                <td className="py-8 px-10">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-xs font-bold text-gray-700">v{doc.version || '1.0'}</span>
                                                        {doc.file_size && (
                                                            <span className="text-[10px] text-gray-400 font-medium">Size: {doc.file_size}</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-8 px-10 text-right">
                                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => handleOpenModal(doc)}
                                                            className="p-3 bg-white text-gray-400 hover:text-primary rounded-xl shadow-sm border border-gray-50"
                                                        >
                                                            <Edit2 className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(doc.id)}
                                                            className="p-3 bg-white text-gray-400 hover:text-red-500 rounded-xl shadow-sm border border-gray-50"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDownload(doc)}
                                                            className="p-3 bg-gray-900 text-white hover:bg-primary rounded-xl shadow-lg transition-all"
                                                        >
                                                            <Download className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}>
                    <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden relative z-20" onClick={e => e.stopPropagation()}>
                        <div className="p-10 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                            <div>
                                <h3 className="text-3xl font-black text-gray-900">{editingDoc ? 'Edit Document' : 'Upload New Document'}</h3>
                                <p className="text-gray-500 font-medium text-sm mt-1">Document will be available for download</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-full transition-all">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-10 space-y-6">
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Document Title *</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 font-bold"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g., Standard Vendor Agreement 2024"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Category *</label>
                                    <select
                                        required
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 font-bold"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Version</label>
                                    <input
                                        type="text"
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 font-bold"
                                        value={formData.version}
                                        onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                                        placeholder="1.0"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">File URL *</label>
                                <input
                                    required
                                    type="url"
                                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 font-bold"
                                    value={formData.file_url}
                                    onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                                    placeholder="https://storage.example.com/document.pdf"
                                />
                                <p className="text-xs text-gray-400 mt-2">Upload to your storage bucket and paste the public URL here</p>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">File Size</label>
                                    <input
                                        type="text"
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 font-bold"
                                        value={formData.file_size}
                                        onChange={(e) => setFormData({ ...formData, file_size: e.target.value })}
                                        placeholder="e.g., 2.4 MB"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Status</label>
                                    <select
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 font-bold"
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    >
                                        <option value="active">Active</option>
                                        <option value="draft">Draft</option>
                                        <option value="archived">Archived</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                                <input
                                    type="checkbox"
                                    id="is_public"
                                    checked={formData.is_public}
                                    onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                                    className="w-5 h-5 rounded text-primary"
                                />
                                <label htmlFor="is_public" className="flex-1">
                                    <span className="font-bold text-gray-900">Make publicly accessible</span>
                                    <p className="text-xs text-gray-500 mt-1">Document will be visible on the Resources page for all users</p>
                                </label>
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-primary hover:bg-primary-dark text-white font-black py-5 rounded-2xl shadow-xl hover:shadow-2xl transition-all"
                            >
                                {editingDoc ? 'Save Changes' : 'Upload Document'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocumentCenter;
