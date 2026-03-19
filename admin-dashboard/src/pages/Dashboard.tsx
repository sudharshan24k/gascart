import React, { useEffect, useState } from 'react';
import { Package, ClipboardCheck, Clock, Plus, ArrowUpRight, TrendingUp, Users, Activity, ShoppingCart } from 'lucide-react';
import { getDashboardStats } from '../services/admin.service';
import { Link } from 'react-router-dom';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ElementType;
    color: string;
    trend?: string;
}

const StatCard = ({ title, value, icon: Icon, color, trend }: StatCardProps) => (
    <div className="admin-card-interactive group">
        <div className="flex justify-between items-start mb-6">
            <div className={`p-4 rounded-2xl ${color} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="w-6 h-6" />
            </div>
            {trend && (
                <div className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-black tracking-tight">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>{trend}</span>
                </div>
            )}
        </div>
        <div>
            <h3 className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">{title}</h3>
            <div className="flex items-baseline gap-2">
                <h4 className="text-3xl font-black text-slate-900 tracking-tight">{value}</h4>
            </div>
        </div>
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
        return (
            <div className="space-y-8 animate-pulse">
                <div className="h-10 bg-slate-200 rounded-xl w-1/4"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-40 bg-slate-200 rounded-[24px]"></div>)}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-10">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight">System Intelligence</h2>
                    <p className="text-slate-500 font-medium mt-1 uppercase text-xs tracking-[0.2em]">
                        Live operational status as of {stats?.lastUpdate ? new Date(stats.lastUpdate).toLocaleTimeString() : 'Just now'}
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-sm text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
                        Export Report
                    </button>
                    <Link to="/products" className="admin-btn-primary gap-2">
                        <Plus className="w-4 h-4" />
                        <span>Add Asset</span>
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Gross Revenue"
                    value={`₹${(stats?.totalRevenue || 0).toLocaleString()}`}
                    icon={Activity}
                    color="bg-indigo-50 text-indigo-600"
                />
                <StatCard
                    title="Active Orders"
                    value={stats?.totalOrders || 0}
                    icon={ShoppingCart}
                    color="bg-blue-50 text-blue-600"
                />
                <StatCard
                    title="Action Required"
                    value={stats?.pendingOrders || 0}
                    icon={Clock}
                    color="bg-rose-50 text-rose-600"
                />
                <StatCard
                    title="Inventory Pool"
                    value={stats?.totalProducts || 0}
                    icon={Package}
                    color="bg-amber-50 text-amber-600"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Action Hub */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="font-black text-xl text-slate-900 tracking-tight">Operational Hub</h3>
                        <Link to="/rfqs" className="text-indigo-600 font-bold text-sm hover:underline">View All Actions</Link>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <Link to="/rfqs" className="admin-card-interactive flex items-center gap-4 p-5">
                            <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white shrink-0">
                                <ClipboardCheck className="w-6 h-6" />
                            </div>
                            <div>
                                <span className="block font-black text-slate-900">RFQ Pipeline</span>
                                <span className="text-xs text-slate-500 font-medium">Manage technical quotes</span>
                            </div>
                            <ArrowUpRight className="ml-auto w-5 h-5 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                        </Link>

                        <Link to="/consultants" className="admin-card-interactive flex items-center gap-4 p-5">
                            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shrink-0">
                                <Users className="w-6 h-6" />
                            </div>
                            <div>
                                <span className="block font-black text-slate-900">Expert Network</span>
                                <span className="text-xs text-slate-500 font-medium">Review consultant profiles</span>
                            </div>
                            <ArrowUpRight className="ml-auto w-5 h-5 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                        </Link>
                    </div>

                    <div className="admin-card bg-slate-900 border-none relative overflow-hidden min-h-[200px] flex flex-col justify-center">
                        <div className="relative z-10 max-w-md">
                            <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Market Intelligence</h3>
                            <p className="text-slate-400 text-sm font-medium mb-6 leading-relaxed">
                                Use the Operational Hub to manage RFQs, track orders, and oversee your consultant network with real-time analytics.
                            </p>
                            <Link to="/orders" className="inline-block px-6 py-3 bg-white text-slate-900 rounded-xl font-bold text-sm hover:bg-slate-100 transition-all">
                                Manage Orders
                            </Link>
                        </div>
                        {/* Abstract Background Decoration */}
                        <div className="absolute top-0 right-0 w-1/2 h-full bg-indigo-600/20 blur-[100px] -mr-20 -mt-20"></div>
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl"></div>
                        <Activity className="absolute right-12 bottom-12 w-32 h-32 text-white/5 opacity-20 rotate-12" />
                    </div>
                </div>

                {/* Sidebar Context */}
                <div className="space-y-6">
                    <h3 className="font-black text-xl text-slate-900 tracking-tight">Recent Activity</h3>
                    <div className="admin-card p-0 overflow-hidden">
                        <div className="p-6 space-y-6">
                            {(stats?.recentOrders || []).length > 0 ? (
                                (stats?.recentOrders || []).map((order: any) => (
                                    <div key={order.id} className="flex gap-4 items-start group">
                                        <div className="w-2 h-2 rounded-full bg-indigo-600 mt-2 shrink-0 group-hover:scale-150 transition-transform"></div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">
                                                Order #{order.id?.slice(0, 8)} from {order.customer_name}
                                            </p>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                                                {order.created_at ? new Date(order.created_at).toLocaleString() : 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-slate-500 font-medium text-center py-4">No recent activity detected.</p>
                            )}
                        </div>
                        <Link to="/orders" className="block w-full py-4 bg-slate-50 border-t border-slate-100 text-xs font-black text-slate-500 text-center uppercase tracking-widest hover:bg-slate-100 hover:text-slate-900 transition-all">
                            View All Orders
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
