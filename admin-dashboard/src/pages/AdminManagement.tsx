import React, { useEffect, useState } from 'react';
import { ShieldCheck, Shield, AlertTriangle, Save, User as UserIcon } from 'lucide-react';
import { fetchAllUsers, updateUser as updateUserInfo } from '../services/admin.service';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

interface User {
    id: string;
    email: string;
    full_name: string;
    role: string;
    account_status: string;
    admin_permissions?: string[];
    created_at: string;
}

const AVAILABLE_PERMISSIONS = [
    { id: 'manage_products', label: 'Manage Products & Inventory', desc: 'Assets, Inventory, Taxonomy' },
    { id: 'manage_orders', label: 'Manage Orders', desc: 'Customer Orders' },
    { id: 'manage_rfqs', label: 'Manage RFQs', desc: 'RFQ Manager, RFQ Configurator' },
    { id: 'manage_vendors', label: 'Manage Vendors', desc: 'Vendor Ecosystem' },
    { id: 'manage_consultants', label: 'Manage Experts', desc: 'Expert Network, Inquiries' },
    { id: 'manage_content', label: 'Manage Content', desc: 'Knowledge Hub, Legal Vault, Media' },
    { id: 'manage_users', label: 'Manage Users', desc: 'User Management (Customers & Vendors)' },
    { id: 'manage_careers', label: 'Manage Careers', desc: 'Career Applications' },
    { id: 'super_admin', label: 'Super Admin Access', desc: 'Full unrestricted access & Audit Logs' },
];

const AdminManagement: React.FC = () => {
    const { userProfile } = useAuth();
    const [admins, setAdmins] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAdminId, setSelectedAdminId] = useState<string | null>(null);
    const [editedPermissions, setEditedPermissions] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadAdmins();
    }, []);

    const loadAdmins = async () => {
        try {
            const data = await fetchAllUsers({ role: 'admin' });
            setAdmins(data as User[]);
        } catch (error) {
            console.error('Failed to fetch admins:', error);
            toast.error('Failed to load administrators');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectAdmin = (admin: User) => {
        if (admin.id === userProfile?.id) {
            toast.error("You cannot edit your own permissions.");
            return;
        }
        setSelectedAdminId(admin.id);
        setEditedPermissions(admin.admin_permissions || []);
    };

    const togglePermission = (permId: string) => {
        setEditedPermissions(prev =>
            prev.includes(permId) ? prev.filter(p => p !== permId) : [...prev, permId]
        );
    };

    const handleSavePermissions = async () => {
        if (!selectedAdminId) return;
        setSaving(true);
        try {
            await updateUserInfo(selectedAdminId, { admin_permissions: editedPermissions });
            setAdmins(prev => prev.map(a => a.id === selectedAdminId ? { ...a, admin_permissions: editedPermissions } : a));
            toast.success('Admin permissions updated successfully');
            setSelectedAdminId(null);
        } catch (error) {
            console.error('Failed to update permissions:', error);
            toast.error('Failed to save permissions');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">Loading Admins...</div>;
    }

    const selectedAdmin = admins.find(a => a.id === selectedAdminId);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Admin Access Control</h1>
                    <p className="text-gray-500 text-sm">Manage dashboard permissions for administrators</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Admin List */}
                <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden h-[calc(100vh-200px)] flex flex-col">
                    <div className="p-4 border-b border-gray-100 bg-gray-50 font-bold text-gray-700 flex items-center justify-between">
                        <span>Current Administrators</span>
                        <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-xs">{admins.length}</span>
                    </div>
                    <div className="overflow-y-auto flex-grow relative">
                        {admins.map(admin => {
                            const isMe = admin.id === userProfile?.id;
                            const isSuper = admin.admin_permissions?.includes('super_admin');
                            return (
                                <div
                                    key={admin.id}
                                    onClick={() => handleSelectAdmin(admin)}
                                    className={`
                                        p-4 border-b border-gray-100 cursor-pointer transition-all duration-200
                                        ${selectedAdminId === admin.id ? 'bg-indigo-50 border-l-4 border-l-indigo-600' : 'hover:bg-gray-50 border-l-4 border-l-transparent'}
                                        ${isMe ? 'opacity-70' : ''}
                                    `}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                                            <UserIcon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 text-sm">
                                                {admin.full_name || 'No Name'} {isMe && <span className="text-indigo-600">(You)</span>}
                                            </p>
                                            <p className="text-xs text-gray-500 mb-1.5">{admin.email}</p>
                                            <div className="flex flex-wrap gap-1">
                                                {isSuper ? (
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                                                        <ShieldCheck className="w-3 h-3" /> Super Admin
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                                                        <Shield className="w-3 h-3" /> Restricted Admin
                                                    </span>
                                                )}
                                                {admin.account_status !== 'active' && (
                                                    <span className="inline-flex items-center text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                                                        {admin.account_status}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Permission Editor */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden h-[calc(100vh-200px)] flex flex-col">
                    {selectedAdmin ? (
                        <>
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">Configure Permissions</h2>
                                    <p className="text-sm text-gray-500">For {selectedAdmin.full_name || selectedAdmin.email}</p>
                                </div>
                                <button
                                    onClick={handleSavePermissions}
                                    disabled={saving}
                                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-50 shadow-sm"
                                >
                                    <Save className="w-4 h-4" />
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>

                            <div className="flex-grow overflow-y-auto p-6 bg-slate-50">
                                {editedPermissions.includes('super_admin') && (
                                    <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-bold text-amber-900">Super Admin Access Granted</p>
                                            <p className="text-sm text-amber-700 mt-1">
                                                This user has full, unrestricted access to all areas of the dashboard, including the ability to change other administrators' permissions. The individual checkbox selections below will be bypassed.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {AVAILABLE_PERMISSIONS.map(perm => {
                                        const isSelected = editedPermissions.includes(perm.id);
                                        const isSuperAdminCheck = editedPermissions.includes('super_admin') && perm.id !== 'super_admin';

                                        return (
                                            <div
                                                key={perm.id}
                                                onClick={() => !isSuperAdminCheck && togglePermission(perm.id)}
                                                className={`
                                                    p-4 rounded-xl border-2 transition-all duration-200 relative
                                                    ${isSuperAdminCheck ? 'opacity-50 bg-gray-100 border-gray-200 cursor-not-allowed' : 'cursor-pointer'}
                                                    ${isSelected && !isSuperAdminCheck ? 'bg-indigo-50 border-indigo-500 shadow-sm' :
                                                        !isSuperAdminCheck ? 'bg-white border-gray-100 hover:border-indigo-200' : ''}
                                                    ${perm.id === 'super_admin' ? 'md:col-span-2 mt-4 bg-slate-900 text-white border-slate-900 hover:border-slate-800' : ''}
                                                `}
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div className={`
                                                        w-6 h-6 rounded flex items-center justify-center shrink-0 mt-0.5 transition-colors
                                                        ${isSelected
                                                            ? (perm.id === 'super_admin' ? 'bg-white text-slate-900' : 'bg-indigo-600 text-white')
                                                            : 'bg-gray-100 border border-gray-300'}
                                                    `}>
                                                        {isSelected && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                                    </div>
                                                    <div>
                                                        <p className={`font-bold text-sm ${perm.id === 'super_admin' ? (isSelected ? 'text-white' : 'text-slate-200') : 'text-gray-900'}`}>
                                                            {perm.label}
                                                        </p>
                                                        <p className={`text-xs mt-1 leading-relaxed ${perm.id === 'super_admin' ? (isSelected ? 'text-slate-300' : 'text-slate-400') : 'text-gray-500'}`}>
                                                            {perm.desc}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-grow flex flex-col items-center justify-center text-slate-400 p-8 text-center bg-slate-50">
                            <ShieldCheck className="w-16 h-16 mb-4 opacity-20" />
                            <h3 className="text-lg font-bold text-slate-600 mb-2">Configure Administrator Access</h3>
                            <p className="max-w-md text-sm leading-relaxed">
                                Select an administrator from the list to view and modify their modular access permissions across the dashboard.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminManagement;
