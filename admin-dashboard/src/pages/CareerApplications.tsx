import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Filter, User, Mail, Phone, Clock, FileText, CheckCircle, XCircle } from 'lucide-react';
import { getCareerApplications, updateCareerApplicationStatus, getResumeSignedUrl as getProxiedResumeUrl } from '../services/admin.service';
import { toast } from 'react-hot-toast';

const CATEGORIES = ['All Categories', 'Technicians', 'Officers', 'Entry level management', 'Middle management', 'O&M - CBG', 'O&M - CNG'];
const STATUSES = ['All Statuses', 'pending', 'reviewed', 'rejected'];

const CareerApplications: React.FC = () => {
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [categoryFilter, setCategoryFilter] = useState('All Categories');
    const [statusFilter, setStatusFilter] = useState('All Statuses');

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const params: any = {};
            if (categoryFilter !== 'All Categories') params.category = categoryFilter;
            if (statusFilter !== 'All Statuses') params.status = statusFilter;

            const res = await getCareerApplications(params);
            if (res.status === 'success') {
                setApplications(res.data);
            }
        } catch (error) {
            console.error('Failed to load applications:', error);
            toast.error('Failed to load applications');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, [categoryFilter, statusFilter]);

    const handleStatusChange = async (id: string, newStatus: string, oldStatus: string) => {
        try {
            await updateCareerApplicationStatus(id, newStatus, oldStatus);
            toast.success(`Application marked as ${newStatus}`);
            fetchApplications();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const getResumeUrl = async (path: string) => {
        try {
            const res = await getProxiedResumeUrl(path);
            if (res.status === 'success' && res.data?.signedUrl) {
                window.open(res.data.signedUrl, '_blank');
            } else {
                toast.error('Could not generate resume link');
            }
        } catch (err) {
            toast.error('Error fetching resume');
        }
    };

    const StatusBadge = ({ status }: { status: string }) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            reviewed: 'bg-blue-100 text-blue-800 border-blue-200',
            rejected: 'bg-red-100 text-red-800 border-red-200'
        }[status] || 'bg-gray-100 text-gray-800 border-gray-200';

        return (
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${styles}`}>
                {status}
            </span>
        );
    };

    return (
        <div className="p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-neutral-200">
                <div className="flex gap-4">
                    <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0 border border-indigo-100 shadow-sm">
                        <Briefcase className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Career Applications</h1>
                        <p className="text-neutral-500 mt-1 max-w-xl text-sm leading-relaxed">
                            Review candidate resumes and manage hiring pipeline.
                        </p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-neutral-200 flex gap-4 items-center shadow-sm">
                <div className="relative w-64 group">
                    <Filter className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-indigo-500" />
                    <select
                        className="w-full pl-9 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>

                <div className="relative w-48 group">
                    <Filter className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-indigo-500" />
                    <select
                        className="w-full pl-9 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 capitalize"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </div>

            {/* Applications Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full py-12 text-center text-neutral-500">Loading applications...</div>
                ) : applications.length === 0 ? (
                    <div className="col-span-full py-16 bg-white rounded-2xl border border-neutral-200 border-dashed text-center">
                        <User className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-neutral-900 mb-1">No Applications Found</h3>
                        <p className="text-neutral-500 text-sm">No resumes match your current filter criteria.</p>
                    </div>
                ) : (
                    applications.map((app) => (
                        <motion.div
                            key={app.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col"
                        >
                            {/* Card Header */}
                            <div className="p-5 border-b border-neutral-100 bg-neutral-50/50 flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg font-bold text-neutral-900">{app.full_name}</h3>
                                    <p className="text-sm font-medium text-indigo-600 mt-0.5">{app.category}</p>
                                </div>
                                <StatusBadge status={app.status} />
                            </div>

                            {/* Card Body */}
                            <div className="p-5 flex-1 space-y-4">
                                <div className="space-y-2.5 text-sm">
                                    <div className="flex items-center gap-3 text-neutral-600">
                                        <Mail className="w-4 h-4 text-neutral-400 shrink-0" />
                                        <a href={`mailto:${app.email}`} className="hover:text-indigo-600 truncate">{app.email}</a>
                                    </div>
                                    <div className="flex items-center gap-3 text-neutral-600">
                                        <Phone className="w-4 h-4 text-neutral-400 shrink-0" />
                                        <span>{app.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-neutral-600">
                                        <Clock className="w-4 h-4 text-neutral-400 shrink-0" />
                                        <span>{new Date(app.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => getResumeUrl(app.resume_url)}
                                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-sm font-bold transition-colors"
                                >
                                    <FileText className="w-4 h-4" /> View Resume
                                </button>
                            </div>

                            {/* Card Footer Actions */}
                            <div className="p-3 bg-neutral-50 border-t border-neutral-100 flex gap-2">
                                {app.status !== 'reviewed' && (
                                    <button
                                        onClick={() => handleStatusChange(app.id, 'reviewed', app.status)}
                                        className="flex-1 flex items-center justify-center gap-1.5 py-2 hover:bg-white rounded-lg text-sm font-medium text-blue-600 transition-colors"
                                    >
                                        <CheckCircle className="w-4 h-4" /> Mark Reviewed
                                    </button>
                                )}
                                {app.status !== 'rejected' && (
                                    <button
                                        onClick={() => handleStatusChange(app.id, 'rejected', app.status)}
                                        className="flex-1 flex items-center justify-center gap-1.5 py-2 hover:bg-white rounded-lg text-sm font-medium text-red-600 transition-colors"
                                    >
                                        <XCircle className="w-4 h-4" /> Reject
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
};

export default CareerApplications;
