import React from 'react';
import { X, User, Mail, Phone, Calendar, Briefcase, FileText, Download, Clock, AlertCircle } from 'lucide-react';

interface InquiryModalProps {
    inquiry: any;
    onClose: () => void;
    onDownloadPDF: (id: string) => void;
    getStatusStyle: (status: string) => string;
}

const InquiryModal: React.FC<InquiryModalProps> = ({ inquiry, onClose, onDownloadPDF, getStatusStyle }) => {
    if (!inquiry) return null;

    const formatDateIST = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const isUnassigned = !inquiry.consultant_id;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-neutral-900/60 backdrop-blur-sm" onClick={onClose}>
            <div 
                className="bg-white w-full max-w-5xl rounded-[32px] shadow-2xl overflow-hidden flex flex-col relative z-20 max-h-[90vh]" 
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 sm:p-8 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(inquiry.status)}`}>
                                {inquiry.status}
                            </span>
                            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest bg-white px-2 py-1 rounded-md border border-neutral-100">
                                Ref: {inquiry.reference_number || inquiry.id.slice(0, 8).toUpperCase()}
                            </span>
                        </div>
                        <h3 className="text-xl sm:text-2xl font-black text-neutral-900 leading-tight">
                            Consultation Inquiry Report
                        </h3>
                    </div>
                    <button onClick={onClose} className="p-2 bg-white hover:bg-neutral-100 border border-neutral-200 rounded-full transition-all hover:rotate-90">
                        <X className="w-6 h-6 text-neutral-500" />
                    </button>
                </div>

                <div className="flex flex-col md:flex-row overflow-hidden flex-grow">
                    {/* Left Sidebar: Stakeholders */}
                    <div className="w-full md:w-80 bg-neutral-50/30 p-6 sm:p-8 border-r border-neutral-100 overflow-y-auto">
                        <div className="space-y-8">
                            {/* Client Section */}
                            <section>
                                <h4 className="text-[10px] font-black text-neutral-400 mb-4 uppercase tracking-widest flex items-center gap-2">
                                    <User className="w-3.5 h-3.5" /> Client Information
                                </h4>
                                <div className="space-y-4 bg-white p-4 rounded-2xl border border-neutral-100/50 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center shrink-0">
                                            <span className="text-neutral-500 font-bold">{inquiry.profiles?.full_name?.charAt(0) || 'G'}</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-neutral-900 leading-tight">{inquiry.profiles?.full_name || 'Guest User'}</p>
                                            <p className="text-[10px] font-bold text-neutral-400 mt-0.5">{inquiry.profiles?.company_name || 'Individual Participant'}</p>
                                        </div>
                                    </div>
                                    <div className="pt-3 space-y-2 border-t border-neutral-50">
                                        <div className="flex items-center gap-2.5 text-xs text-neutral-600">
                                            <Mail className="w-3.5 h-3.5 text-neutral-400" />
                                            <span className="truncate">{inquiry.profiles?.email || inquiry.guest_email || 'N/A'}</span>
                                        </div>
                                        {inquiry.profiles?.phone && (
                                            <div className="flex items-center gap-2.5 text-xs text-neutral-600">
                                                <Phone className="w-3.5 h-3.5 text-neutral-400" />
                                                <span>{inquiry.profiles.phone}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </section>

                            {/* Expert Section */}
                            <section>
                                <h4 className="text-[10px] font-black text-neutral-400 mb-4 uppercase tracking-widest flex items-center gap-2">
                                    <Briefcase className="w-3.5 h-3.5" /> Assigned Expert
                                </h4>
                                {isUnassigned ? (
                                    <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100 text-center">
                                        <AlertCircle className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                                        <p className="text-xs font-bold text-orange-700">Expert Not Assigned</p>
                                        <p className="text-[10px] text-orange-600 mt-1">Pending admin assignment</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4 bg-indigo-50/30 p-4 rounded-2xl border border-indigo-100/50 shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 border border-indigo-100">
                                                <span className="text-indigo-600 font-bold">{inquiry.consultants?.first_name?.charAt(0)}</span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-neutral-900 leading-tight">{inquiry.consultants?.first_name} {inquiry.consultants?.last_name}</p>
                                                <p className="text-[10px] font-bold text-indigo-600 mt-0.5">Assigned Consultant</p>
                                            </div>
                                        </div>
                                        <div className="pt-3 space-y-2 border-t border-indigo-100/50">
                                            <div className="flex items-center gap-2.5 text-xs text-neutral-600">
                                                <Mail className="w-3.5 h-3.5 text-indigo-300" />
                                                <span className="truncate">{inquiry.consultants?.email || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </section>

                            {/* Meta Section */}
                            <section>
                                <div className="p-4 bg-neutral-900 rounded-2xl text-white shadow-xl">
                                    <span className="block text-[8px] font-black uppercase text-neutral-400 mb-2 tracking-widest">Submission Timestamp</span>
                                    <div className="flex items-center gap-2 text-xs font-bold">
                                        <Clock className="w-4 h-4 text-primary" />
                                        <span>{formatDateIST(inquiry.created_at)}</span>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>

                    {/* Main Content: Project Details */}
                    <div className="flex-grow p-6 sm:p-8 overflow-y-auto bg-white">
                        <div className="max-w-3xl space-y-8">
                            {/* Service Header */}
                            <div>
                                <h4 className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-4">Required Service</h4>
                                <div className="bg-neutral-50 p-6 rounded-3xl border border-neutral-100 group hover:border-primary/20 transition-colors">
                                    <h2 className="text-2xl font-black text-neutral-900 group-hover:text-primary transition-colors">{inquiry.service_required}</h2>
                                    {inquiry.timeline_preference && (
                                        <div className="flex items-center gap-2 mt-4 text-xs font-bold text-neutral-500 bg-white w-fit px-3 py-1.5 rounded-lg border border-neutral-100">
                                            <Calendar className="w-4 h-4 text-neutral-400" />
                                            <span>Timeline Needed: {inquiry.timeline_preference}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Project Description */}
                            <section>
                                <h4 className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-4">Project Brief / Description</h4>
                                <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-inner min-h-[150px]">
                                    <p className="text-sm sm:text-base text-neutral-700 leading-relaxed font-medium whitespace-pre-wrap italic opacity-80 decoration-neutral-100">
                                        {inquiry.project_description ? `"${inquiry.project_description}"` : 'No additional project description provided.'}
                                    </p>
                                </div>
                            </section>

                            {/* Internal Admin Notes */}
                            <section className="bg-amber-50/30 p-6 rounded-3xl border border-amber-100/50">
                                <h4 className="text-xs font-black text-amber-700 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <FileText className="w-4 h-4" /> Internal Admin Notes (Confidential)
                                </h4>
                                <div className="bg-white p-5 rounded-2xl border border-amber-100 text-sm text-neutral-600 font-medium whitespace-pre-wrap leading-relaxed min-h-[100px]">
                                    {inquiry.internal_comments || 'No internal notes recorded yet. Use the card editor to add follow-up details.'}
                                </div>
                            </section>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 sm:p-8 border-t border-neutral-100 bg-neutral-50/50 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                        System Generated Report • GASCART Platform
                    </p>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button 
                            onClick={onClose}
                            className="flex-1 sm:flex-none px-8 py-3 bg-white border border-neutral-200 text-neutral-600 font-black text-xs rounded-2xl hover:bg-neutral-100 transition-all uppercase tracking-widest active:scale-95 shadow-sm"
                        >
                            Dismiss
                        </button>
                        <button 
                            onClick={() => onDownloadPDF(inquiry.id)}
                            className="flex-1 sm:flex-none px-8 py-3 bg-primary text-white font-black text-xs rounded-2xl hover:bg-primary-dark transition-all flex items-center justify-center gap-2 uppercase tracking-widest shadow-lg shadow-primary/20 active:scale-95"
                        >
                            <Download className="w-4 h-4" />
                            Technical Report (PDF)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InquiryModal;
