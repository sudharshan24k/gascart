import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { supabase } from '../services/api';
import InquiryFilters from '../components/consultants/InquiryFilters';
import InquiryList from '../components/consultants/InquiryList';

const ConsultantInquiries: React.FC = () => {
    const [inquiries, setInquiries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('All');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        fetchInquiries();
    }, [statusFilter]);

    const fetchInquiries = async () => {
        setLoading(true);
        try {
            const params: any = {};
            if (statusFilter !== 'All') {
                params.status = statusFilter.toLowerCase();
            }
            const res = await api.consultants.getInquiries(params);
            if (res.status === 'success') {
                setInquiries(res.data);
            }
        } catch (error) {
            console.error('Failed to fetch inquiries:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        try {
            await api.consultants.updateInquiryStatus(id, newStatus);
            fetchInquiries();
        } catch (error) {
            console.error('Failed to update status:', error);
            alert('Failed to update status');
        }
    };

    const handleAssignConsultant = async (inquiryId: string, consultantId: string) => {
        const { error } = await supabase
            .from('consultant_inquiries')
            .update({ consultant_id: consultantId, status: 'accepted' })
            .eq('id', inquiryId);
        if (error) {
            alert('Failed to assign expert: ' + error.message);
            return;
        }
        fetchInquiries();
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'accepted': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'completed': return 'bg-green-100 text-green-800 border-green-200';
            case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const filteredInquiries = (inquiries || [])
        .filter(inq => {
            if (startDate && new Date(inq.created_at) < new Date(startDate)) return false;
            if (endDate) {
                const end = new Date(endDate);
                end.setDate(end.getDate() + 1); // include the whole end day
                if (new Date(inq.created_at) >= end) return false;
            }
            return true;
        })
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const handleExportExcel = () => {
        const headers = ['ID', 'Date', 'Time', 'Status', 'Service Required', 'Timeline', 'Client Name', 'Client Email', 'Client Phone', 'Target Consultant', 'Project Notes'];

        const csvRows = [headers.join(',')];

        filteredInquiries.forEach(inq => {
            const dateObj = new Date(inq.created_at);
            const row = [
                inq.id,
                dateObj.toLocaleDateString(),
                dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                inq.status,
                `"${(inq.service_required || '').replace(/"/g, '""')}"`,
                `"${(inq.timeline_preference || '').replace(/"/g, '""')}"`,
                `"${(inq.profiles?.full_name || 'Guest User').replace(/"/g, '""')}"`,
                inq.profiles?.email || '',
                inq.profiles?.phone || '',
                `"${(inq.consultants?.first_name || '')} ${(inq.consultants?.last_name || '')}".trim()`,
                `"${(inq.project_description || '').replace(/"/g, '""')}"`
            ];
            csvRows.push(row.join(','));
        });

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `consultant_inquiries_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 pb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 font-display">Consultant Inquiries</h1>
                    <p className="text-sm text-neutral-500 mt-1">Manage platform consultation requests</p>
                </div>
            </div>

            <InquiryFilters
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                startDate={startDate}
                setStartDate={setStartDate}
                endDate={endDate}
                setEndDate={setEndDate}
                onExportExcel={handleExportExcel}
            />

            <InquiryList
                inquiries={filteredInquiries}
                loading={loading}
                handleUpdateStatus={handleUpdateStatus}
                getStatusStyle={getStatusStyle}
                onAssignConsultant={handleAssignConsultant}
            />
        </div>
    );
};

export default ConsultantInquiries;
