import React, { useEffect, useState } from 'react';
import { ClipboardCheck, Plus, TrendingUp, Activity, ShoppingCart, ClipboardList, Box } from 'lucide-react';
import { getDashboardStats } from '../services/admin.service';
import { Link, useNavigate } from 'react-router-dom';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ElementType;
    iconColor: string;
    bgColor: string;
}

const StatCard = ({ title, value, icon: Icon, iconColor, bgColor }: StatCardProps) => (
    <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-2xl ${bgColor} ${iconColor} group-hover:scale-110 transition-transform`}>
                <Icon className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-1 bg-green-50 text-green-600 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">
                <TrendingUp className="w-3 h-3" />
                Live
            </div>
        </div>
        <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{title}</p>
            <h4 className="text-3xl font-black text-gray-900 tracking-tight">{value}</h4>
        </div>
    </div>
);

const AdminDashboard = () => {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

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
                <div className="h-10 bg-gray-100 rounded-2xl w-1/4"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-gray-50 rounded-[32px]"></div>)}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">System Intelligence</h1>
                    <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.2em] mt-2 italic flex items-center gap-2">
                        <Activity className="w-3 h-3 text-primary" />
                        Live operational status as of {new Date().toLocaleTimeString()}
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="px-6 py-3 bg-white border border-gray-100 rounded-2xl font-bold text-sm text-gray-700 hover:border-primary transition-all shadow-sm">
                        Export Report
                    </button>
                    <Link to="/products" className="px-6 py-3 bg-gray-900 text-white rounded-2xl font-bold text-sm hover:bg-primary transition-all flex items-center gap-2 shadow-lg shadow-gray-200">
                        <Plus className="w-4 h-4" /> Add Asset
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Gross Revenue"
                    value={`₹${(stats?.totalRevenue || 0).toLocaleString('en-IN')}`}
                    icon={Activity}
                    iconColor="text-indigo-600"
                    bgColor="bg-indigo-50"
                />
                <StatCard
                    title="Total Orders"
                    value={stats?.counts?.orders || 0}
                    icon={ShoppingCart}
                    iconColor="text-blue-600"
                    bgColor="bg-blue-50"
                />
                <StatCard
                    title="Technical Enquiries"
                    value={stats?.counts?.rfqs || 0}
                    icon={ClipboardList}
                    iconColor="text-amber-600"
                    bgColor="bg-amber-50"
                />
                <StatCard
                    title="Active Products"
                    value={stats?.counts?.products || 0}
                    icon={Box}
                    iconColor="text-primary"
                    bgColor="bg-primary/10"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Orders */}
                <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                        <h3 className="text-xl font-bold text-gray-900">Recent Transactions</h3>
                        <Link to="/orders" className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline transition-all">Full Ledger</Link>
                    </div>
                    <div className="divide-y divide-gray-50 grow min-h-[400px]">
                        {(stats?.recentOrders || []).map((order: any) => (
                            <div key={order.id} className="p-6 flex items-center justify-between hover:bg-gray-50/50 transition-colors cursor-pointer group">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center font-black text-[10px] text-gray-400 group-hover:bg-primary/5 transition-colors">
                                        #{order.id.slice(0, 4)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">{order.profiles?.full_name || 'Customer'}</p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{new Date(order.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-gray-900">₹{order.total_amount?.toLocaleString('en-IN')}</p>
                                    <p className={`text-[10px] font-black uppercase tracking-widest ${
                                        order.status === 'completed' ? 'text-green-500' : 
                                        order.status === 'pending' ? 'text-amber-500' : 'text-gray-400'
                                    }`}>{order.status}</p>
                                </div>
                            </div>
                        ))}
                        {(stats?.recentOrders || []).length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-gray-300 py-20">
                                <Activity className="w-12 h-12 mb-4 opacity-20" />
                                <p className="font-bold uppercase text-[10px] tracking-widest opacity-40">No recent activity detected</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent RFQs */}
                <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                        <h3 className="text-xl font-bold text-gray-900">Recent Enquiries</h3>
                        <Link to="/rfqs" className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline transition-all">Launch Manager</Link>
                    </div>
                    <div className="divide-y divide-gray-50 grow min-h-[400px]">
                        {(stats?.recentRFQs || []).map((rfq: any) => (
                            <div key={rfq.id} className="p-6 flex items-center justify-between hover:bg-gray-50/50 transition-colors cursor-pointer group" onClick={() => navigate('/rfqs')}>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 group-hover:bg-amber-100 transition-colors">
                                        <ClipboardList className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 line-clamp-1">{rfq.products?.name || 'Technical Asset'}</p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">ID: {rfq.submitted_fields?.enquiry_id || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-[10px] text-gray-400 uppercase tracking-widest">{new Date(rfq.created_at).toLocaleDateString()}</p>
                                    <p className={`text-[10px] font-black uppercase tracking-widest ${
                                        rfq.status === 'new' ? 'text-amber-500' : 
                                        rfq.status === 'processing' ? 'text-blue-500' : 'text-green-500'
                                    }`}>{rfq.status}</p>
                                </div>
                            </div>
                        ))}
                        {(stats?.recentRFQs || []).length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-gray-300 py-20">
                                <ClipboardCheck className="w-12 h-12 mb-4 opacity-20" />
                                <p className="font-bold uppercase text-[10px] tracking-widest opacity-40">No pending enquiries</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
