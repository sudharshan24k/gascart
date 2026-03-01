import React from 'react';
import { Briefcase } from 'lucide-react';
import InquiryCard from './InquiryCard';

interface InquiryListProps {
    inquiries: any[];
    loading: boolean;
    handleUpdateStatus: (id: string, newStatus: string) => void;
    getStatusStyle: (status: string) => string;
    onAssignConsultant?: (inquiryId: string, consultantId: string) => Promise<void>;
}

const InquiryList: React.FC<InquiryListProps> = ({ inquiries, loading, handleUpdateStatus, getStatusStyle, onAssignConsultant }) => {
    if (loading) {
        return (
            <div className="p-8 text-center bg-white rounded-xl shadow-sm border border-neutral-200">
                <div className="animate-pulse flex flex-col items-center justify-center space-y-4">
                    <div className="w-12 h-12 bg-neutral-100 rounded-full" />
                    <div className="h-4 bg-neutral-100 rounded w-48" />
                    <div className="h-3 bg-neutral-50 rounded w-32" />
                </div>
            </div>
        );
    }

    if (inquiries.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-8 sm:p-12 text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <Briefcase className="w-6 h-6 sm:w-8 sm:h-8 text-neutral-400" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-neutral-900 mb-1">No Inquiries Found</h3>
                <p className="text-xs sm:text-sm text-neutral-500 px-4">There are no consultation requests matching your current filters.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
            <div className="divide-y divide-neutral-100">
                {inquiries.map((inq) => (
                    <InquiryCard
                        key={inq.id}
                        inq={inq}
                        handleUpdateStatus={handleUpdateStatus}
                        getStatusStyle={getStatusStyle}
                        onAssignConsultant={onAssignConsultant}
                    />
                ))}
            </div>
        </div>
    );
};

export default InquiryList;
