import React from 'react';
import { Calendar, Download } from 'lucide-react';

interface InquiryFiltersProps {
    statusFilter: string;
    setStatusFilter: (status: string) => void;
    startDate: string;
    setStartDate: (date: string) => void;
    endDate: string;
    setEndDate: (date: string) => void;
    onExportExcel: () => void;
}

const InquiryFilters: React.FC<InquiryFiltersProps> = ({
    statusFilter,
    setStatusFilter,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    onExportExcel
}) => {
    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-neutral-200 flex flex-col lg:flex-row justify-between gap-4 items-start lg:items-center">
            {/* Status Tabs with Horizontal Scroll for Mobile */}
            <div className="flex gap-2 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 scrollbar-hide shrink-0">
                {['All', 'Pending', 'Accepted', 'Completed', 'Rejected'].map(status => (
                    <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${statusFilter === status
                            ? 'bg-neutral-900 text-white'
                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                            }`}
                    >
                        {status}
                    </button>
                ))}
            </div>

            {/* Date Filters and Export */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 items-stretch sm:items-center w-full lg:w-auto">
                <div className="flex items-center gap-2 bg-neutral-50 px-3 py-2 sm:py-1.5 rounded-lg border border-neutral-200 flex-1 sm:flex-initial justify-between sm:justify-start">
                    <Calendar className="w-4 h-4 text-neutral-400 shrink-0" />
                    <input
                        type="date"
                        className="bg-transparent border-none text-xs sm:text-sm outline-none text-neutral-700 w-28 sm:w-32"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                    <span className="text-neutral-400 text-xs">to</span>
                    <input
                        type="date"
                        className="bg-transparent border-none text-xs sm:text-sm outline-none text-neutral-700 w-28 sm:w-32"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                </div>

                <button
                    onClick={onExportExcel}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 rounded-lg text-sm font-bold transition-colors shadow-sm w-full sm:w-auto mt-2 sm:mt-0"
                >
                    <Download className="w-4 h-4" />
                    Export
                </button>
            </div>
        </div>
    );
};

export default InquiryFilters;
