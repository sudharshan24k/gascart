import React, { useState, useEffect } from 'react';
import { ShieldAlert, Search, Filter, RefreshCw, Activity, User, FileText, Database, Server, Calendar, Mail } from 'lucide-react';
import { getAuditLogs, fetchAllUsers } from '../services/admin.service';

const AuditLogs: React.FC = () => {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [admins, setAdmins] = useState<any[]>([]);

    // Filters
    const [search, setSearch] = useState('');
    const [action, setAction] = useState('');
    const [entityType, setEntityType] = useState('');
    const [actorEmail, setActorEmail] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        loadAdmins();
    }, []);

    const loadAdmins = async () => {
        try {
            const data = await fetchAllUsers({ role: 'admin' });
            setAdmins(data as any[]);
        } catch (error) {
            console.error('Failed to load admins for filter:', error);
        }
    };

    const [error, setError] = useState<string | null>(null);

    const fetchLogs = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getAuditLogs({
                search,
                action,
                entity_type: entityType,
                actor_email: actorEmail,
                start_date: startDate,
                end_date: endDate
            });
            if (res.status === 'success') {
                setLogs(res.data);
                setTotal(res.total);
            } else {
                setError(res.message || 'Failed to load logs');
            }
        } catch (err: any) {
            console.error('Failed to load audit logs:', err);
            setError(err.response?.data?.message || 'Connection error while loading audit logs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [action, entityType, actorEmail, startDate, endDate]);

    // Handle search input separately so it doesn't fetch on every keystroke
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchLogs();
    };

    const clearFilters = () => {
        setSearch('');
        setAction('');
        setEntityType('');
        setActorEmail('');
        setStartDate('');
        setEndDate('');
    };

    const getActionBadge = (actionStr: string) => {
        const colors: Record<string, string> = {
            CREATE: 'bg-green-100 text-green-700',
            UPDATE: 'bg-blue-100 text-blue-700',
            DELETE: 'bg-red-100 text-red-700',
            LOGIN: 'bg-purple-100 text-purple-700',
            LOGOUT: 'bg-neutral-100 text-neutral-600',
            STATUS_CHANGE: 'bg-orange-100 text-orange-700',
            EXPORT: 'bg-teal-100 text-teal-700'
        };
        const color = colors[actionStr] || 'bg-gray-100 text-gray-700';
        return `px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider ${color}`;
    };

    const getEntityIcon = (type: string) => {
        const t = type?.toLowerCase() || '';
        if (t === 'user' || t === 'consultant') return <User className="w-4 h-4 text-neutral-400" />;
        if (t === 'product' || t === 'inventory') return <Database className="w-4 h-4 text-neutral-400" />;
        if (t === 'document' || t === 'article') return <FileText className="w-4 h-4 text-neutral-400" />;
        return <Server className="w-4 h-4 text-neutral-400" />;
    };

    return (
        <div className="p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-neutral-200">
                <div className="flex gap-4">
                    <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center shrink-0 border border-rose-100 shadow-sm">
                        <Activity className="w-6 h-6 text-rose-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">System Audit Logs</h1>
                        <p className="text-neutral-500 mt-1 max-w-xl text-sm leading-relaxed">
                            A complete trail of administrative and systemic actions. {total > 0 && <span className="font-semibold text-rose-600 inline-block bg-rose-50 px-2 py-0.5 rounded ml-1">{total} events recorded</span>}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={clearFilters}
                        className="px-4 py-2 text-neutral-500 hover:text-neutral-800 text-sm font-bold transition-colors"
                    >
                        Clear Filters
                    </button>
                    <button
                        onClick={fetchLogs}
                        className="flex items-center gap-2 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg text-sm font-bold transition-colors"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-2xl border border-neutral-200 space-y-4 shadow-sm">
                <div className="flex flex-col lg:flex-row gap-4">
                    <form onSubmit={handleSearch} className="flex-grow relative group">
                        <Search className="w-4 h-4 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-rose-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search logs by description or ID..."
                            className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 transition-all font-medium"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </form>

                    <div className="relative w-full lg:w-64 group">
                        <Mail className="w-4 h-4 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-rose-500 transition-colors" />
                        <select
                            className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 cursor-pointer appearance-none"
                            value={actorEmail}
                            onChange={(e) => setActorEmail(e.target.value)}
                        >
                            <option value="">All Administrators</option>
                            {admins.map(admin => (
                                <option key={admin.id} value={admin.email}>{admin.full_name || admin.email}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="relative group">
                        <Filter className="w-4 h-4 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-rose-500 transition-colors" />
                        <select
                            className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 cursor-pointer appearance-none"
                            value={action}
                            onChange={(e) => setAction(e.target.value)}
                        >
                            <option value="">All Actions</option>
                            <option value="CREATE">CREATE</option>
                            <option value="UPDATE">UPDATE</option>
                            <option value="DELETE">DELETE</option>
                            <option value="STATUS_CHANGE">STATUS CHANGE</option>
                            <option value="LOGIN">LOGIN</option>
                            <option value="LOGOUT">LOGOUT</option>
                            <option value="EXPORT">EXPORT</option>
                        </select>
                    </div>

                    <div className="relative group">
                        <Filter className="w-4 h-4 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-rose-500 transition-colors" />
                        <select
                            className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 cursor-pointer appearance-none"
                            value={entityType}
                            onChange={(e) => setEntityType(e.target.value)}
                        >
                            <option value="">All Entities</option>
                            <option value="user">User</option>
                            <option value="product">Product</option>
                            <option value="consultant">Consultant</option>
                            <option value="order">Order</option>
                            <option value="system">System</option>
                        </select>
                    </div>

                    <div className="relative group">
                        <Calendar className="w-4 h-4 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-rose-500 transition-colors" />
                        <input
                            type="date"
                            className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 transition-all"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            title="Start Date"
                        />
                    </div>

                    <div className="relative group">
                        <Calendar className="w-4 h-4 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-rose-500 transition-colors" />
                        <input
                            type="date"
                            className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 transition-all"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            title="End Date"
                        />
                    </div>
                </div>
            </div>

            {/* Logs Table */}
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-neutral-50/80 border-b border-neutral-200 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                                <th className="p-4 pl-6 w-48">Timestamp</th>
                                <th className="p-4 w-48">Actor</th>
                                <th className="p-4 w-32">Action</th>
                                <th className="p-4 min-w-[300px]">Description</th>
                                <th className="p-4 w-48">Entity</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100 text-sm">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="p-12 text-center text-neutral-500">
                                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-3 text-neutral-300" />
                                        Loading logs...
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan={5} className="p-16 text-center text-rose-500 bg-rose-50/30">
                                        <ShieldAlert className="w-12 h-12 text-rose-300 mx-auto mb-4" />
                                        <p className="text-base font-bold text-rose-900 mb-1">Error Loading Logs</p>
                                        <p className="text-sm">{error}</p>
                                        <button
                                            onClick={fetchLogs}
                                            className="mt-4 px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 transition-colors"
                                        >
                                            Try Again
                                        </button>
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-16 text-center text-neutral-500 bg-neutral-50/50">
                                        <ShieldAlert className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                                        <p className="text-base font-bold text-neutral-900 mb-1">No Logs Found</p>
                                        <p className="text-sm">No audit logs match your current filters.</p>
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-neutral-50/80 transition-colors group">
                                        <td className="p-4 pl-6 align-top">
                                            <div className="font-mono text-xs text-neutral-500 whitespace-nowrap">
                                                {new Date(log.created_at).toLocaleString('en-GB', {
                                                    day: '2-digit', month: 'short', year: 'numeric',
                                                    hour: '2-digit', minute: '2-digit', second: '2-digit'
                                                })}
                                            </div>
                                            {(log.ip_address) && (
                                                <div className="text-[10px] text-neutral-400 mt-1 font-mono">
                                                    {log.ip_address}
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4 align-top">
                                            <div className="font-bold text-neutral-900 truncate max-w-[180px]" title={log.actor_email || 'System'}>
                                                {log.actor_email || 'System / Guest'}
                                            </div>
                                            {log.actor_role && (
                                                <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-1">
                                                    {log.actor_role}
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4 align-top">
                                            <span className={getActionBadge(log.action)}>{log.action}</span>
                                        </td>
                                        <td className="p-4 align-top">
                                            <p className="text-neutral-700 leading-relaxed max-w-[500px] break-words">
                                                {log.description}
                                            </p>
                                        </td>
                                        <td className="p-4 align-top">
                                            {log.entity_type ? (
                                                <div className="flex items-center gap-2 text-neutral-600 bg-neutral-50 px-3 py-1.5 rounded-lg border border-neutral-100 inline-flex">
                                                    {getEntityIcon(log.entity_type)}
                                                    <div>
                                                        <div className="text-xs font-bold uppercase tracking-wider">{log.entity_type}</div>
                                                        {log.entity_label && <div className="text-[10px] text-neutral-500 truncate max-w-[120px]" title={log.entity_label}>{log.entity_label}</div>}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-neutral-400 text-xs">-</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AuditLogs;
