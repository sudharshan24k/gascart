import React, { useState, useEffect } from 'react';
import { supabase } from '../services/api';
import { listBucketFiles } from '../services/admin.service';
import { X, Search, FileText, CheckCircle2 } from 'lucide-react';

type FileItem = {
    name: string;
    displayName?: string;
    bucket: string;
    publicUrl: string;
    size?: number;
    created_at?: string;
};

type MediaLibraryModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (url: string) => void;
    bucket: string;
    title?: string;
};

export const MediaLibraryModal: React.FC<MediaLibraryModalProps> = ({
    isOpen,
    onClose,
    onSelect,
    bucket,
    title = 'Choose from Media Library'
}) => {
    const [files, setFiles] = useState<FileItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setSearchQuery('');
            loadFiles();
        }
    }, [isOpen, bucket]);

    const getPublicUrl = (bucketName: string, path: string) => {
        const { data } = supabase.storage.from(bucketName).getPublicUrl(path);
        return data.publicUrl;
    };

    const loadFiles = async () => {
        setLoading(true);
        setError(null);
        setFiles([]); // Clear immediately so it doesn't flash the previous bucket's files

        try {
            const res = await listBucketFiles(bucket);
            const data = res.data;

            const fileItems: FileItem[] = (data || [])
                .filter((f: any) => f.name !== '.emptyFolderPlaceholder')
                .map((f: any) => {
                    const displayName = f.name.includes('/') ? f.name.split('/').pop() : f.name;
                    return {
                        name: f.name,
                        displayName: displayName || f.name,
                        bucket,
                        publicUrl: getPublicUrl(bucket, f.name),
                        size: f.metadata?.size,
                        created_at: f.created_at,
                    };
                });

            setFiles(fileItems);
        } catch (err: any) {
            console.error('Failed to load media library files:', err);
            setError(err.response?.data?.message || err.message || 'Failed to load files.');
        } finally {
            setLoading(false);
        }
    };

    const isImage = (name: string) => /\.(png|jpg|jpeg|gif|webp|svg|ico|avif)$/i.test(name);

    const filteredFiles = files.filter(f =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (f.displayName && f.displayName.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 lg:p-8">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className="bg-white w-full max-w-5xl rounded-[32px] shadow-2xl overflow-hidden flex flex-col relative z-20 h-[85vh] border border-gray-100">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 shrink-0">
                    <div>
                        <h3 className="text-2xl font-black text-gray-900">{title}</h3>
                        <p className="text-sm text-gray-500 font-medium mt-1">Browse and select assets from the {bucket} bucket.</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 hover:bg-gray-200 text-gray-500 rounded-xl transition-all"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Toolbar */}
                <div className="p-6 border-b border-gray-100 shrink-0">
                    <div className="relative max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search files by name..."
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold text-sm text-gray-900"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="flex-grow p-6 overflow-y-auto bg-gray-50/30 custom-scrollbar">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <p className="text-red-500 font-bold mb-2">Error Loading Files</p>
                            <p className="text-gray-500 text-sm">{error}</p>
                            <button onClick={loadFiles} className="mt-4 px-4 py-2 bg-indigo-50 text-indigo-600 font-bold rounded-xl hover:bg-indigo-100">Try Again</button>
                        </div>
                    ) : filteredFiles.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                                <Search className="w-8 h-8 text-gray-400" />
                            </div>
                            <h4 className="text-lg font-bold text-gray-900">No files found</h4>
                            <p className="text-gray-500 mt-1">Try adjusting your search or upload new files.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {filteredFiles.map((file) => (
                                <div
                                    key={file.name}
                                    className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-indigo-500 hover:shadow-lg transition-all cursor-pointer flex flex-col"
                                    onClick={() => onSelect(file.publicUrl)}
                                >
                                    <div className="aspect-square bg-gray-50 flex items-center justify-center p-4 relative">
                                        {isImage(file.name) ? (
                                            <img
                                                src={file.publicUrl}
                                                alt={file.displayName || file.name}
                                                className="w-full h-full object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-110"
                                            />
                                        ) : (
                                            <FileText className="w-12 h-12 text-gray-300 group-hover:text-indigo-400 transition-colors" />
                                        )}
                                        <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/5 transition-colors flex items-center justify-center">
                                            <div className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all bg-white text-indigo-600 px-4 py-2 rounded-xl font-bold text-sm shadow-sm flex items-center gap-2">
                                                <CheckCircle2 className="w-4 h-4" /> Select
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-3 border-t border-gray-100 flex-grow flex items-center">
                                        <p className="text-xs font-bold text-gray-700 truncate w-full group-hover:text-indigo-600 transition-colors" title={file.name}>
                                            {file.displayName || file.name}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
