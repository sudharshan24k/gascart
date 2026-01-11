import React, { useState } from 'react';
import {
    FileText,
    Upload,
    Download,
    Trash2,
    ShieldAlert,
    FilePlus,
    Search,
    Clock,
    Gavel
} from 'lucide-react';

const DocumentCenter = () => {
    // Mock documents - in real app, these would come from a storage bucket/db
    const [docs, setDocs] = useState([
        { id: 1, name: 'Standard Vendor Agreement 2024', category: 'Legal', date: '2024-01-15', size: '2.4 MB', status: 'Active' },
        { id: 2, name: 'Privacy & Policy Framework', category: 'Privacy', date: '2023-12-10', size: '1.1 MB', status: 'Active' },
        { id: 3, name: 'Industrial Safety Standards - Draft', category: 'Technical', date: '2024-01-05', size: '4.5 MB', status: 'Draft' },
    ]);

    const [searchTerm, setSearchTerm] = useState('');

    const filteredDocs = docs.filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 leading-tight">Document Repository</h2>
                    <p className="text-gray-500 mt-1 font-medium italic font-sans">Centralized governance for industrial agreements and platform policies</p>
                </div>
                <button className="bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-2xl flex items-center gap-3 font-black shadow-xl shadow-primary/20 transition-all transform hover:-translate-y-1">
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
                                <p className="text-4xl font-black text-gray-900 leading-none">8.2 GB</p>
                                <p className="text-xs font-bold text-primary mt-2 flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> Tier 1 Storage (Premium)
                                </p>
                            </div>
                            <div className="w-full bg-gray-50 h-2 rounded-full overflow-hidden">
                                <div className="bg-primary h-full w-1/3 rounded-full"></div>
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
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-50/50 text-gray-400 text-[10px] font-black uppercase tracking-widest border-b border-gray-100">
                                        <th className="py-6 px-10">Document Name</th>
                                        <th className="py-6 px-10">Classification</th>
                                        <th className="py-6 px-10">Metadata</th>
                                        <th className="py-6 px-10 text-right">Goverance</th>
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
                                                    <div className="font-bold text-gray-900 text-lg leading-tight">{doc.name}</div>
                                                </div>
                                            </td>
                                            <td className="py-8 px-10">
                                                <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-lg text-[10px] font-black uppercase tracking-tighter">
                                                    {doc.category}
                                                </span>
                                            </td>
                                            <td className="py-8 px-10">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-xs font-bold text-gray-700">{doc.date}</span>
                                                    <span className="text-[10px] text-gray-400 font-medium">Size: {doc.size}</span>
                                                </div>
                                            </td>
                                            <td className="py-8 px-10 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button className="p-3 bg-white text-gray-400 hover:text-red-500 rounded-xl shadow-sm border border-gray-50">
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                    <button className="p-3 bg-gray-900 text-white hover:bg-primary rounded-xl shadow-lg transition-all">
                                                        <Download className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DocumentCenter;
