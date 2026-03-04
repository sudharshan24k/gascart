import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../services/api';
import { uploadFile, removeFile, renameFile, listBucketFiles } from '../services/admin.service';
import {
    Upload, Copy, Check, Trash2, Search, Image, FileText,
    Folder, RefreshCw, X, AlertCircle, Eye, ExternalLink, Edit2
} from 'lucide-react';

const BUCKETS = [
    { id: 'categories', label: 'Categories', color: 'indigo', accepts: 'image/*' },
    { id: 'articles', label: 'Articles', color: 'emerald', accepts: 'image/*' },
    { id: 'platform-documents', label: 'Documents', color: 'amber', accepts: '.pdf,image/*' },
    { id: 'avatars', label: 'Avatars', color: 'sky', accepts: 'image/*' },
    { id: 'products', label: 'Products', color: 'violet', accepts: 'image/*' },
];

const colorMap: Record<string, string> = {
    indigo: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    emerald: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-100 text-amber-700 border-amber-200',
    sky: 'bg-sky-100 text-sky-700 border-sky-200',
    violet: 'bg-violet-100 text-violet-700 border-violet-200',
};

type FileItem = {
    name: string;
    displayName?: string;
    bucket: string;
    publicUrl: string;
    size?: number;
    created_at?: string;
    metadata?: any;
};

const MediaLibrary: React.FC = () => {
    const [activeBucket, setActiveBucket] = useState(BUCKETS[0].id);
    const [files, setFiles] = useState<FileItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
    const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState<string | null>(null);
    const [isRenaming, setIsRenaming] = useState(false);
    const [newName, setNewName] = useState('');
    const [renamingLoading, setRenamingLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        loadFiles();
    }, [activeBucket]);

    const getPublicUrl = (bucket: string, path: string) => {
        const { data } = supabase.storage.from(bucket).getPublicUrl(path);
        return data.publicUrl;
    };

    const loadFiles = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await listBucketFiles(activeBucket);
            const data = res.data;

            const fileItems: FileItem[] = (data || [])
                .filter((f: any) => f.name !== '.emptyFolderPlaceholder')
                .map((f: any) => {
                    const displayName = f.name.includes('/') ? f.name.split('/').pop() : f.name;
                    return {
                        name: f.name, // Keep the full path as name for operations like delete/rename
                        displayName: displayName || f.name,
                        bucket: activeBucket,
                        publicUrl: getPublicUrl(activeBucket, f.name),
                        size: f.metadata?.size,
                        created_at: f.created_at,
                        metadata: f.metadata,
                    };
                });

            setFiles(fileItems);
        } catch (err: any) {
            console.error('Failed to load files:', err);
            setError(err.response?.data?.message || err.message || 'Failed to load files. Check if this bucket exists in Supabase.');
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = Array.from(e.target.files || []);
        if (!selected.length) return;

        setUploading(true);
        setError(null);
        let successCount = 0;

        for (const file of selected) {
            setUploadProgress(`Uploading ${file.name}...`);

            try {
                await uploadFile(activeBucket, file);
                successCount++;
            } catch (err: any) {
                setError(`Failed to upload ${file.name}: ${err.message || 'Unknown error'}`);
            }
        }

        setUploadProgress(null);
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';

        if (successCount > 0) {
            await loadFiles();
        }
    };

    const handleDelete = async (file: FileItem) => {
        if (!window.confirm(`Delete "${file.name}"? This cannot be undone.`)) return;

        try {
            await removeFile(file.bucket, file.name);
            setFiles(prev => prev.filter(f => f.name !== file.name));
            if (previewFile?.name === file.name) setPreviewFile(null);
        } catch (err: any) {
            alert('Delete failed: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleRename = async () => {
        if (!previewFile || !newName.trim()) return;

        let finalName = newName.trim();

        const parts = previewFile.name.split('.');
        const oldExt = parts.length > 1 ? parts.pop() : null;
        if (oldExt && !finalName.includes('.')) {
            finalName = `${finalName}.${oldExt}`;
        }

        if (finalName === previewFile.name) {
            setIsRenaming(false);
            return;
        }

        setRenamingLoading(true);
        try {
            await renameFile(previewFile.bucket, previewFile.name, finalName);
            await loadFiles();
            setPreviewFile(prev => prev ? { ...prev, name: finalName, publicUrl: getPublicUrl(prev.bucket, finalName) } : null);
            setIsRenaming(false);
        } catch (err: any) {
            alert('Rename failed: ' + (err.response?.data?.message || err.message));
        } finally {
            setRenamingLoading(false);
        }
    };

    const handleCopy = (url: string) => {
        navigator.clipboard.writeText(url);
        setCopiedUrl(url);
        setTimeout(() => setCopiedUrl(null), 2000);
    };

    const isImage = (name: string) =>
        /\.(png|jpg|jpeg|gif|webp|svg|ico|avif)$/i.test(name);

    const isPDF = (name: string) => /\.pdf$/i.test(name);

    const formatSize = (bytes?: number) => {
        if (!bytes) return '—';
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
    };

    const filteredFiles = files.filter(f =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const currentBucket = BUCKETS.find(b => b.id === activeBucket)!;

    return (
        <div className="max-w-7xl mx-auto pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">Media Library</h2>
                    <p className="text-gray-500 mt-1 font-medium italic">
                        Upload files and copy their public URL for use in categories, products, and articles.
                    </p>
                </div>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center gap-2 bg-indigo-600 text-white font-black px-8 py-4 rounded-2xl shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    <Upload className="w-5 h-5" />
                    {uploading ? (uploadProgress || 'Uploading...') : 'Upload Files'}
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept={currentBucket.accepts}
                    onChange={handleUpload}
                    className="hidden"
                />
            </div>

            {/* Bucket Tabs */}
            <div className="flex flex-wrap gap-3 mb-8">
                {BUCKETS.map(b => (
                    <button
                        key={b.id}
                        onClick={() => { setActiveBucket(b.id); setSearchQuery(''); }}
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm border-2 transition-all ${activeBucket === b.id
                            ? `${colorMap[b.color]} shadow-md scale-105`
                            : 'bg-white border-gray-100 text-gray-500 hover:border-gray-300'
                            }`}
                    >
                        <Folder className="w-4 h-4" />
                        {b.label}
                        {activeBucket === b.id && (
                            <span className="ml-1 bg-white/60 px-2 py-0.5 rounded-lg text-[11px]">
                                {files.length}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Search + Refresh */}
            <div className="flex gap-4 mb-6">
                <div className="relative flex-grow">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder={`Search in ${currentBucket.label}...`}
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 text-sm font-medium shadow-sm"
                    />
                </div>
                <button
                    onClick={loadFiles}
                    className="p-3.5 bg-white border border-gray-100 text-gray-400 hover:text-indigo-600 rounded-2xl transition-all shadow-sm hover:border-indigo-200"
                    title="Refresh"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-700 px-6 py-4 rounded-2xl mb-6 text-sm font-bold">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    {error}
                </div>
            )}

            {/* File Grid */}
            {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {Array.from({ length: 10 }).map((_, i) => (
                        <div key={i} className="h-40 bg-white rounded-2xl border border-gray-100 animate-pulse" />
                    ))}
                </div>
            ) : filteredFiles.length === 0 ? (
                <div className="bg-white rounded-[32px] border border-dashed border-gray-200 py-24 flex flex-col items-center text-center">
                    <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                        <Image className="w-10 h-10 text-gray-200" />
                    </div>
                    <p className="text-gray-400 font-black text-lg uppercase tracking-widest">No files yet</p>
                    <p className="text-gray-400 text-sm mt-2">
                        Click <strong>Upload Files</strong> to add images, icons, or PDFs to the <strong>{currentBucket.label}</strong> folder.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {filteredFiles.map(file => (
                        <div
                            key={file.name}
                            className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-indigo-200 transition-all overflow-hidden flex flex-col"
                        >
                            {/* Preview */}
                            <div
                                className="h-32 bg-gray-50 flex items-center justify-center overflow-hidden cursor-pointer relative"
                                onClick={() => setPreviewFile(file)}
                            >
                                {isImage(file.name) ? (
                                    <img
                                        src={file.publicUrl}
                                        alt={file.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : isPDF(file.name) ? (
                                    <div className="flex flex-col items-center gap-1">
                                        <FileText className="w-10 h-10 text-amber-400" />
                                        <span className="text-[10px] font-black text-amber-600 uppercase">PDF</span>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-1">
                                        <FileText className="w-10 h-10 text-gray-300" />
                                        <span className="text-[10px] font-black text-gray-400 uppercase">File</span>
                                    </div>
                                )}

                                {/* Hover overlay */}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-10">
                                    <button
                                        onClick={e => { e.stopPropagation(); setPreviewFile(file); }}
                                        className="p-2 bg-white rounded-xl shadow hover:bg-gray-50 transition-colors"
                                        title="Preview"
                                    >
                                        <Eye className="w-4 h-4 text-gray-800" />
                                    </button>
                                    <button
                                        onClick={e => {
                                            e.stopPropagation();
                                            setPreviewFile(file);
                                            setNewName(file.name);
                                            setIsRenaming(true);
                                        }}
                                        className="p-2 bg-indigo-500 rounded-xl shadow hover:bg-indigo-600 transition-colors"
                                        title="Rename"
                                    >
                                        <Edit2 className="w-4 h-4 text-white" />
                                    </button>
                                    <button
                                        onClick={e => { e.stopPropagation(); handleDelete(file); }}
                                        className="p-2 bg-red-500 rounded-xl shadow hover:bg-red-600 transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4 text-white" />
                                    </button>
                                </div>
                            </div>

                            {/* Info + Copy */}
                            <div className="p-3 flex flex-col gap-2">
                                <p className="text-xs font-bold text-gray-700 truncate" title={file.name}>
                                    {file.name}
                                </p>
                                <p className="text-[10px] text-gray-400 font-medium">{formatSize(file.size)}</p>
                                <button
                                    onClick={() => handleCopy(file.publicUrl)}
                                    className={`w-full flex items-center justify-center gap-1.5 px-3 py-2 text-[11px] font-black rounded-xl transition-all ${copiedUrl === file.publicUrl
                                        ? 'bg-green-100 text-green-700 border border-green-200'
                                        : 'bg-indigo-50 text-indigo-600 border border-indigo-100 hover:bg-indigo-100'
                                        }`}
                                >
                                    {copiedUrl === file.publicUrl ? (
                                        <><Check className="w-3 h-3" /> Copied!</>
                                    ) : (
                                        <><Copy className="w-3 h-3" /> Copy URL</>
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Preview Modal */}
            {previewFile && (
                <div
                    className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-gray-900/80 backdrop-blur-sm"
                    onClick={() => setPreviewFile(null)}
                >
                    <div
                        className="bg-white rounded-[32px] shadow-2xl max-w-2xl w-full overflow-hidden"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex-grow pr-4">
                                {isRenaming ? (
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={newName}
                                            onChange={(e) => setNewName(e.target.value)}
                                            className="font-black text-gray-900 text-lg border-b-2 border-indigo-500 outline-none bg-transparent w-full"
                                            autoFocus
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleRename();
                                                if (e.key === 'Escape') setIsRenaming(false);
                                            }}
                                            disabled={renamingLoading}
                                        />
                                        <button
                                            onClick={handleRename}
                                            disabled={renamingLoading}
                                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                                        >
                                            <Check className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => setIsRenaming(false)}
                                            disabled={renamingLoading}
                                            className="p-1 text-gray-400 hover:bg-gray-100 rounded"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-black text-gray-900 text-lg truncate max-w-sm" title={previewFile.name}>
                                            {previewFile.displayName || previewFile.name}
                                        </h3>
                                        <button
                                            onClick={() => {
                                                setNewName(previewFile.displayName || previewFile.name);
                                                setIsRenaming(true);
                                            }}
                                            className="p-1.5 text-indigo-500 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded transition-colors"
                                            title="Rename file"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                                <p className="text-xs text-gray-400 font-medium mt-0.5">{formatSize(previewFile.size)} · {currentBucket.label}</p>
                            </div>
                            <button onClick={() => setPreviewFile(null)} className="p-2 rounded-xl hover:bg-gray-100 transition shrink-0">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        {isImage(previewFile.name) ? (
                            <div className="bg-gray-50 flex items-center justify-center p-4 max-h-[60vh]">
                                <img
                                    src={previewFile.publicUrl}
                                    alt={previewFile.displayName || previewFile.name}
                                    className="max-h-[55vh] max-w-full object-contain rounded-2xl shadow"
                                />
                            </div>
                        ) : isPDF(previewFile.name) ? (
                            <div className="bg-gray-50 p-8 flex flex-col items-center gap-3">
                                <FileText className="w-16 h-16 text-amber-400" />
                                <p className="text-gray-500 font-medium">PDF Document</p>
                            </div>
                        ) : null}

                        <div className="p-6 flex gap-3">
                            <button
                                onClick={() => handleCopy(previewFile.publicUrl)}
                                className={`flex-grow flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-black text-sm transition-all ${copiedUrl === previewFile.publicUrl
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                    }`}
                            >
                                {copiedUrl === previewFile.publicUrl
                                    ? <><Check className="w-4 h-4" /> URL Copied!</>
                                    : <><Copy className="w-4 h-4" /> Copy URL</>}
                            </button>
                            <a
                                href={previewFile.publicUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-2xl font-black text-sm hover:bg-gray-200 transition"
                            >
                                <ExternalLink className="w-4 h-4" /> Open
                            </a>
                            <button
                                onClick={() => handleDelete(previewFile)}
                                className="px-5 py-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-100 transition"
                                title="Delete"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

                        {/* URL display */}
                        <div className="px-6 pb-6">
                            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex items-center gap-3">
                                <code className="text-xs text-gray-600 flex-grow truncate font-mono">{previewFile.publicUrl}</code>
                                <button onClick={() => handleCopy(previewFile.publicUrl)} className="shrink-0 text-indigo-500 hover:text-indigo-700">
                                    <Copy className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MediaLibrary;
