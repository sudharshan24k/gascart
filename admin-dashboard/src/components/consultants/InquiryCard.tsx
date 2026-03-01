import React, { useState, useEffect } from 'react';
import { Mail, Phone, User, Building2, Briefcase, Calendar, UserCheck, AlertCircle } from 'lucide-react';
import { supabase } from '../../services/api';

interface InquiryCardProps {
    inq: any;
    handleUpdateStatus: (id: string, newStatus: string) => void;
    getStatusStyle: (status: string) => string;
    onAssignConsultant?: (inquiryId: string, consultantId: string) => Promise<void>;
}

const InquiryCard: React.FC<InquiryCardProps> = ({ inq, handleUpdateStatus, getStatusStyle, onAssignConsultant }) => {
    const [consultants, setConsultants] = useState<any[]>([]);
    const [assigning, setAssigning] = useState(false);
    const [selectedConsultant, setSelectedConsultant] = useState('');

    // Only fetch consultants list if this inquiry has no assigned consultant
    useEffect(() => {
        if (!inq.consultant_id) {
            loadConsultants();
        }
    }, [inq.consultant_id]);

    const loadConsultants = async () => {
        const { data } = await supabase
            .from('consultants')
            .select('id, first_name, last_name, service_categories, location')
            .eq('status', 'approved')
            .order('first_name');
        setConsultants(data || []);
    };

    const handleAssign = async () => {
        if (!selectedConsultant || !onAssignConsultant) return;
        setAssigning(true);
        try {
            await onAssignConsultant(inq.id, selectedConsultant);
        } finally {
            setAssigning(false);
        }
    };

    const isUnassigned = !inq.consultant_id && !inq.consultants?.first_name;

    return (
        <div className="p-4 sm:p-6 hover:bg-neutral-50 transition-colors">
            {/* Header: Status, Date, and Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                <div className="w-full sm:w-auto">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold border ${getStatusStyle(inq.status)} uppercase tracking-wider`}>
                            {inq.status}
                        </span>
                        {isUnassigned && (
                            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border bg-orange-50 text-orange-700 border-orange-200 uppercase tracking-wider">
                                <AlertCircle className="w-3 h-3" /> Unassigned
                            </span>
                        )}
                        <span className="text-xs sm:text-sm text-neutral-500 font-medium whitespace-nowrap">
                            {new Date(inq.created_at).toLocaleDateString()} at {new Date(inq.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-neutral-900 leading-tight">{inq.service_required}</h3>
                    {inq.timeline_preference && (
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-neutral-500 mt-1.5">
                            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-400 shrink-0" />
                            <span className="font-semibold truncate">Timeline: {inq.timeline_preference}</span>
                        </div>
                    )}
                </div>

                {/* Status Changer Dropdown */}
                <div className="w-full sm:w-auto flex items-center shrink-0">
                    <select
                        value={inq.status}
                        onChange={(e) => handleUpdateStatus(inq.id, e.target.value)}
                        className="w-full sm:w-auto px-3 py-2 sm:py-1.5 bg-white border border-neutral-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none hover:border-neutral-300 transition-colors"
                    >
                        <option value="pending">Pending</option>
                        <option value="accepted">Accepted</option>
                        <option value="completed">Completed</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
            </div>

            {/* People Grid: Client & Consultant Data */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-6 p-4 bg-neutral-50/80 rounded-xl border border-neutral-100">
                {/* Client Info */}
                <div>
                    <h4 className="text-[10px] sm:text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2 sm:mb-3 flex items-center gap-2">
                        <User className="w-3.5 h-3.5" /> Client Entity
                    </h4>
                    <div className="space-y-2.5 bg-white p-3 sm:p-4 rounded-lg border border-neutral-100/50 shadow-sm h-full">
                        <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold text-neutral-900 border-b border-neutral-50 pb-2">
                            <div className="w-6 h-6 rounded-full bg-neutral-100 flex items-center justify-center shrink-0">
                                <span className="text-neutral-500 text-[10px]">{inq.profiles?.full_name?.charAt(0) || '?'}</span>
                            </div>
                            <span className="truncate">{inq.profiles?.full_name || 'Guest Participant'}</span>
                        </div>
                        {inq.profiles?.email && (
                            <div className="flex items-center gap-2.5 text-xs sm:text-sm text-neutral-600 group">
                                <div className="w-6 flex justify-center shrink-0"><Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-400 group-hover:text-primary transition-colors" /></div>
                                <span className="truncate">{inq.profiles.email}</span>
                            </div>
                        )}
                        {/* Guest email if no profile */}
                        {!inq.profiles?.email && inq.guest_email && (
                            <div className="flex items-center gap-2.5 text-xs sm:text-sm text-neutral-600 group">
                                <div className="w-6 flex justify-center shrink-0"><Mail className="w-3.5 h-3.5 text-neutral-400" /></div>
                                <span className="truncate">{inq.guest_email}</span>
                            </div>
                        )}
                        {inq.profiles?.phone && (
                            <div className="flex items-center gap-2.5 text-xs sm:text-sm text-neutral-600 group">
                                <div className="w-6 flex justify-center shrink-0"><Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-400 group-hover:text-primary transition-colors" /></div>
                                <span>{inq.profiles.phone}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Consultant Info OR Assign Expert */}
                <div>
                    <h4 className="text-[10px] sm:text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2 sm:mb-3 flex items-center gap-2">
                        <Briefcase className="w-3.5 h-3.5" /> {isUnassigned ? 'Assign Expert' : 'Assigned Expert'}
                    </h4>

                    {isUnassigned ? (
                        /* Admin assign UI */
                        <div className="bg-orange-50 p-3 sm:p-4 rounded-lg border border-orange-100 flex flex-col gap-3">
                            <p className="text-xs text-orange-700 font-semibold flex items-center gap-1.5">
                                <UserCheck className="w-4 h-4 shrink-0" />
                                No expert assigned — pick one below to assign.
                            </p>
                            <select
                                value={selectedConsultant}
                                onChange={e => setSelectedConsultant(e.target.value)}
                                className="w-full px-3 py-2.5 bg-white border border-orange-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-300"
                            >
                                <option value="">— Select Expert —</option>
                                {consultants.map(c => (
                                    <option key={c.id} value={c.id}>
                                        {c.first_name} {c.last_name}{c.location ? ` · ${c.location}` : ''}
                                    </option>
                                ))}
                            </select>
                            <button
                                onClick={handleAssign}
                                disabled={!selectedConsultant || assigning}
                                className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold py-2.5 rounded-lg text-sm hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {assigning
                                    ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Assigning...</>
                                    : <><UserCheck className="w-4 h-4" /> Assign Expert</>}
                            </button>
                        </div>
                    ) : (
                        /* Assigned consultant info */
                        <div className="space-y-2.5 bg-primary/5 p-3 sm:p-4 rounded-lg border border-primary/10 shadow-sm h-full">
                            <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold text-primary border-b border-primary/5 pb-2">
                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                    <span className="text-primary text-[10px]">{inq.consultants?.first_name?.charAt(0) || '?'}</span>
                                </div>
                                <span className="truncate">{inq.consultants?.first_name} {inq.consultants?.last_name}</span>
                            </div>
                            {inq.consultants?.company_name && (
                                <div className="flex items-center gap-2.5 text-xs sm:text-sm text-neutral-700">
                                    <div className="w-6 flex justify-center shrink-0"><Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary/60" /></div>
                                    <span className="truncate font-medium">{inq.consultants.company_name}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2.5 text-xs sm:text-sm text-neutral-500">
                                <div className="w-6 flex justify-center shrink-0"><Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary/40" /></div>
                                <span className="truncate">{inq.consultants?.email || 'N/A'}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Optional Project Notes Block */}
            {inq.project_description && (
                <div className="mt-4 sm:mt-5">
                    <h4 className="text-[10px] sm:text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Project Brief</h4>
                    <div className="text-xs sm:text-sm text-neutral-700 bg-white p-3 sm:p-4 border border-neutral-100 rounded-lg whitespace-pre-wrap leading-relaxed shadow-inner">
                        <span className="opacity-80">"{inq.project_description}"</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InquiryCard;
