import React, { useEffect, useState } from 'react';
import { Package, Users, ClipboardCheck, Clock, Plus, LayoutGrid } from 'lucide-react';
import { getDashboardStats } from '../services/admin.service';
import { Link } from 'react-router-dom';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ElementType;
    color: string;
}

const StatCard = ({ title, value, icon: Icon, color }: StatCardProps) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl ${color}`}>
                <Icon className="w-6 h-6" />
            </div>
        </div>
        <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
        <h4 className="text-2xl font-bold text-gray-900">{value}</h4>
    </div>
);

const AdminDashboard = () => {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await getDashboardStats();
                setStats(data);
            } catch (err) {
                console.error('Failed to fetch stats', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>)}
            </div>
        </div>;
    }

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">Dashboard Overview</h2>
                    <p className="text-gray-500 mt-1">Status as of {stats?.lastUpdate ? new Date(stats.lastUpdate).toLocaleString() : 'Just now'}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <StatCard
                    title="Total Products"
                    value={stats?.totalProducts || 0}
                    icon={Package}
                    color="bg-blue-50 text-blue-600"
                />
                <StatCard
                    title="Active Products"
                    value={stats?.activeProducts || 0}
                    icon={LayoutGrid}
                    color="bg-green-50 text-green-600"
                />
                <StatCard
                    title="Pending Consultants"
                    value={stats?.pendingConsultants || 0}
                    icon={Clock}
                    color="bg-amber-50 text-amber-600"
                />
                <StatCard
                    title="Approved Consultants"
                    value={stats?.approvedConsultants || 0}
                    icon={Users}
                    color="bg-purple-50 text-purple-600"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Quick Actions */}
                <div className="lg:col-span-1 space-y-6">
                    <h3 className="font-bold text-xl text-gray-900">Quick Actions</h3>
                    <div className="grid gap-4">
                        <Link to="/admin/products?action=add" className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 hover:border-primary/50 hover:shadow-md transition-all group">
                            <div className="p-3 bg-primary/10 rounded-xl text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                <Plus className="w-5 h-5" />
                            </div>
                            <span className="font-bold text-gray-700">Add Product</span>
                        </Link>
                        <Link to="/admin/consultants?status=pending" className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 hover:border-primary/50 hover:shadow-md transition-all group">
                            <div className="p-3 bg-primary/10 rounded-xl text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                <ClipboardCheck className="w-5 h-5" />
                            </div>
                            <span className="font-bold text-gray-700">Review Consultants</span>
                        </Link>
                    </div>
                </div>

                {/* System Update Info (Placeholder for now) */}
                <div className="lg:col-span-2 bg-gradient-to-br from-secondary-900 to-secondary-800 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
                    <div className="relative z-10">
                        <h3 className="text-2xl font-bold mb-4">Marketplace Management</h3>
                        <p className="text-secondary-300 mb-8 max-w-md">
                            Manage your vendors, products, and consultants all in one place. Keep track of approvals and system updates efficiently.
                        </p>
                        <button className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-bold transition-all">
                            View Activity Log
                        </button>
                    </div>
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -ml-16 -mb-16"></div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
