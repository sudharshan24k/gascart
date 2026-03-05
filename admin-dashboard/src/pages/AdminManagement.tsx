import React, { useEffect, useState } from 'react';
import { ShieldCheck, Shield, AlertTriangle, Save, User as UserIcon, Plus, X, Lock, Mail, UserPlus, Trash2 } from 'lucide-react';
import { fetchAllUsers, updateUser as updateUserInfo, createAdmin, deleteAdmin as deleteAdminService } from '../services/admin.service';
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

const ROLE_PRESETS = [
    {
        id: 'super',
        label: 'Super Admin',
        desc: 'Unrestricted access',
        perms: ['super_admin']
    },
    {
        id: 'mini',
        label: 'Mini Admin',
        desc: 'Broad dashboard management',
        perms: ['manage_products', 'manage_orders', 'manage_rfqs', 'manage_vendors', 'manage_consultants', 'manage_content', 'manage_careers', 'manage_users']
    },
    {
        id: 'basic',
        label: 'Basic Admin',
        desc: 'Product management only',
        perms: ['manage_products']
    }
];

const AdminManagement: React.FC = () => {
    const { userProfile, isSuperAdmin } = useAuth();
    const [admins, setAdmins] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAdminId, setSelectedAdminId] = useState<string | null>(null);
    const [editedPermissions, setEditedPermissions] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);

    // Create Admin State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createData, setCreateData] = useState({
        email: '',
        full_name: '',
        password: '',
        role_preset: 'basic'
    });
    const [creating, setCreating] = useState(false);

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

    const applyPreset = (perms: string[]) => {
        setEditedPermissions(perms);
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

    const handleDeleteAdmin = async () => {
        if (!selectedAdminId) return;
        const admin = admins.find(a => a.id === selectedAdminId);
        if (!admin) return;

        if (!window.confirm(`Are you sure you want to PERMANENTLY delete administrator ${admin.full_name || admin.email}? This action cannot be undone.`)) {
            return;
        }

        setSaving(true);
        try {
            await deleteAdminService(selectedAdminId);
            toast.success('Administrator deleted successfully');
            setSelectedAdminId(null);
            loadAdmins();
        } catch (error: any) {
            console.error('Failed to delete admin:', error);
            toast.error(error.response?.data?.message || 'Failed to delete administrator');
        } finally {
            setSaving(false);
        }
    };

    const handleCreateAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        try {
            const preset = ROLE_PRESETS.find(p => p.id === createData.role_preset);
            await createAdmin({
                email: createData.email,
                full_name: createData.full_name,
                password: createData.password || undefined,
                permissions: preset?.perms || []
            });
            toast.success('Administrator created successfully');
            setShowCreateModal(false);
            setCreateData({ email: '', full_name: '', password: '', role_preset: 'basic' });
            loadAdmins();
        } catch (error: any) {
            console.error('Failed to create admin:', error);
            toast.error(error.response?.data?.message || 'Failed to create administrator');
        } finally {
            setCreating(false);
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
                {isSuperAdmin && (
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-white hover:text-indigo-600 border border-indigo-600 text-white rounded-xl text-sm font-bold transition-all shadow-md group"
                    >
                        <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        Add Administrator
                    </button>
                )}
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
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleDeleteAdmin}
                                        disabled={saving}
                                        className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
                                        title="Delete Administrator"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        <span className="hidden md:inline">Delete</span>
                                    </button>
                                    <div className="h-6 w-px bg-gray-200 mx-1"></div>
                                    <button
                                        onClick={() => setSelectedAdminId(null)}
                                        className="px-4 py-2 text-gray-500 hover:text-gray-700 text-sm font-bold transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSavePermissions}
                                        disabled={saving}
                                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-50 shadow-sm"
                                    >
                                        <Save className="w-4 h-4" />
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </div>

                            <div className="flex-grow overflow-y-auto p-6 bg-slate-50">
                                {/* Role Presets */}
                                <div className="mb-8">
                                    <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                                        <Lock className="w-4 h-4" /> Role Presets
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        {ROLE_PRESETS.map(preset => (
                                            <button
                                                key={preset.id}
                                                onClick={() => applyPreset(preset.perms)}
                                                className="p-3 text-left bg-white border border-gray-200 rounded-xl hover:border-indigo-500 hover:shadow-sm transition-all group"
                                            >
                                                <p className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{preset.label}</p>
                                                <p className="text-[10px] text-gray-500 mt-1">{preset.desc}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                                        <Shield className="w-4 h-4" /> Individual Permissions
                                    </h3>
                                </div>

                                {editedPermissions.includes('super_admin') && (
                                    <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-bold text-amber-900">Super Admin Access Granted</p>
                                            <p className="text-sm text-amber-700 mt-1">
                                                This user has full, unrestricted access to all areas of the dashboard. Individual selections below are bypassed.
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

            {/* Create Admin Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="relative p-6 border-b border-gray-100">
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="absolute right-6 top-6 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 mb-4">
                                <UserPlus className="w-6 h-6" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Add New Administrator</h2>
                            <p className="text-sm text-gray-500">Create a new dashboard user with specific access</p>
                        </div>

                        <form onSubmit={handleCreateAdmin} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Full Name</label>
                                <div className="relative">
                                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        required
                                        value={createData.full_name}
                                        onChange={(e) => setCreateData({ ...createData, full_name: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                        placeholder="e.g. John Doe"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="email"
                                        required
                                        value={createData.email}
                                        onChange={(e) => setCreateData({ ...createData, email: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                        placeholder="admin@example.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Temporary Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="password"
                                        required
                                        minLength={6}
                                        value={createData.password}
                                        onChange={(e) => setCreateData({ ...createData, password: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                        placeholder="Min 6 characters"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Role Preset</label>
                                <div className="grid grid-cols-1 gap-2">
                                    {ROLE_PRESETS.map(preset => (
                                        <button
                                            key={preset.id}
                                            type="button"
                                            onClick={() => setCreateData({ ...createData, role_preset: preset.id })}
                                            className={`
                                                flex items-center gap-3 p-3 border rounded-xl text-left transition-all
                                                ${createData.role_preset === preset.id
                                                    ? 'bg-indigo-50 border-indigo-600 ring-1 ring-indigo-600'
                                                    : 'bg-white border-gray-200 hover:border-gray-300'}
                                            `}
                                        >
                                            <div className={`
                                                w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0
                                                ${createData.role_preset === preset.id ? 'border-indigo-600' : 'border-gray-300'}
                                            `}>
                                                {createData.role_preset === preset.id && <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full" />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">{preset.label}</p>
                                                <p className="text-[10px] text-gray-500">{preset.desc}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {creating ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        'Create Administrator'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminManagement;
