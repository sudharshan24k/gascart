import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Package, ShoppingCart, Users, LogOut,
    ClipboardCheck, BookOpen, FolderTree, Building2, ShieldCheck,
    Settings2, Menu, X, Search, Bell, ChevronRight, User,
    Database, MessageSquare, ImageIcon, Activity, FileText, PanelLeftClose, PanelLeftOpen
} from 'lucide-react';
import { authService } from '../services/auth.service';
import { supabase } from '../services/api';
import { useAuth } from '../context/AuthContext';

const AdminLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [userProfile, setUserProfile] = useState<any>(null);
    const { permissions, isSuperAdmin } = useAuth();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll);

        const fetchProfile = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                const { data } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();
                setUserProfile(data);
            }
        };
        fetchProfile();

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const isActive = (path: string) => {
        if (path === '/' && location.pathname === '/') return true;
        if (path !== '/' && location.pathname.startsWith(path)) return true;
        return false;
    };

    const navigationGroups = [
        {
            title: 'Core Operations',
            items: [
                { name: 'Insights', path: '/', icon: LayoutDashboard },
                { name: 'Assets', path: '/products', icon: Package, permission: 'manage_products' },
                { name: 'Inventory', path: '/inventory', icon: Database, permission: 'manage_products' },
                { name: 'Orders', path: '/orders', icon: ShoppingCart, permission: 'manage_orders' },
            ]
        },
        {
            title: 'Marketplace Engine',
            items: [
                { name: 'RFQ Manager', path: '/rfqs', icon: ClipboardCheck, permission: 'manage_rfqs' },
                { name: 'RFQ Configurator', path: '/rfq-config', icon: Settings2, permission: 'manage_rfqs' },
                { name: 'Vendor Ecosystem', path: '/vendors', icon: Building2, permission: 'manage_vendors' },
            ]
        },
        {
            title: 'Content & Knowledge',
            items: [
                { name: 'Knowledge Hub', path: '/learn', icon: BookOpen, permission: 'manage_content' },
                { name: 'Media Library', path: '/media', icon: ImageIcon, permission: 'manage_content' },
                { name: 'Taxonomy', path: '/taxonomy', icon: FolderTree, permission: 'manage_products' },
                { name: 'Legal Vault', path: '/documents', icon: ShieldCheck, permission: 'manage_content' },
            ]
        },
        {
            title: 'Users & Experts',
            items: [
                { name: 'User Management', path: '/users', icon: Users, permission: 'manage_users' },
                { name: 'Expert Network', path: '/consultants', icon: User, permission: 'manage_consultants' },
                { name: 'Expert Inquiries', path: '/consultant-inquiries', icon: MessageSquare, permission: 'manage_consultants' },
                { name: 'Career Resumes', path: '/careers', icon: FileText, permission: 'manage_careers' },
                { name: 'Admin Control', path: '/admin-management', icon: ShieldCheck, requireSuperAdmin: true },
                { name: 'Audit Logs', path: '/audit-logs', icon: Activity, requireSuperAdmin: true },
            ]
        }
    ];

    const canView = (item: any) => {
        if (isSuperAdmin) return true;
        if (item.requireSuperAdmin) return false;
        if (!item.permission) return true;
        return (permissions || []).includes(item.permission);
    };

    const visibleGroups = navigationGroups.map(group => ({
        ...group,
        items: group.items.filter(canView)
    })).filter(group => group.items.length > 0);

    const handleLogout = async () => {
        // Log logout before clearing session
        try {
            const { data: { session } } = await supabase.auth.getSession();

            const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/audit/log-auth`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`
                },
                body: JSON.stringify({
                    action: 'LOGOUT',
                    description: `User logged out from Admin Dashboard`,
                    metadata: {}
                })
            });

            if (!response.ok) {
                console.error('[Audit] Failed to log logout. Status:', response.status);
            }
        } catch (logErr) {
            console.warn('[Audit] Failed to log logout:', logErr);
        }

        await authService.signOut();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
            {/* Sidebar */}
            <aside
                className={`
                    fixed inset-y-0 left-0 z-[60]
                    bg-[#0F172A] text-slate-300 flex flex-col
                    transition-all duration-300 ease-in-out border-r border-slate-800
                    ${sidebarCollapsed ? 'w-[72px]' : 'w-[280px]'}
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}
            >
                {/* Logo */}
                <div className={`flex items-center gap-3 border-b border-slate-800/50 h-[72px] ${sidebarCollapsed ? 'justify-center px-0' : 'px-6'}`}>
                    <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20 flex-shrink-0">
                        <ShieldCheck className="w-5 h-5 text-white" />
                    </div>
                    {!sidebarCollapsed && (
                        <div className="overflow-hidden">
                            <h1 className="text-xl font-black text-white tracking-tight whitespace-nowrap">GASCART</h1>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Admin Control</p>
                        </div>
                    )}
                </div>

                <nav className="flex-grow py-4 overflow-y-auto custom-scrollbar">
                    {visibleGroups.map((group) => (
                        <div key={group.title} className={`mb-6 ${sidebarCollapsed ? 'px-2' : 'px-4'}`}>
                            {!sidebarCollapsed && (
                                <h3 className="px-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3">
                                    {group.title}
                                </h3>
                            )}
                            {sidebarCollapsed && <div className="h-px bg-slate-800/60 mb-3 mx-1" />}
                            <div className="space-y-1">
                                {group.items.map((item: any) => (
                                    <div key={item.path} className="relative group/tip">
                                        <Link
                                            to={item.path}
                                            onClick={() => setSidebarOpen(false)}
                                            className={`
                                                flex items-center transition-all duration-200 group rounded-xl
                                                ${sidebarCollapsed ? 'justify-center px-0 py-3' : 'justify-between px-3 py-2.5'}
                                                ${isActive(item.path)
                                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                                                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100'
                                                }
                                            `}
                                        >
                                            <div className={`flex items-center ${sidebarCollapsed ? '' : 'gap-3'}`}>
                                                <item.icon className={`w-5 h-5 flex-shrink-0 transition-colors ${isActive(item.path) ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`} />
                                                {!sidebarCollapsed && <span className="text-sm font-bold whitespace-nowrap">{item.name}</span>}
                                            </div>
                                            {!sidebarCollapsed && isActive(item.path) && <ChevronRight className="w-4 h-4 text-white/50" />}
                                        </Link>
                                        {/* Tooltip when collapsed */}
                                        {sidebarCollapsed && (
                                            <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 z-[100]
                                                opacity-0 group-hover/tip:opacity-100 transition-opacity duration-150">
                                                <div className="bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap border border-slate-700">
                                                    {item.name}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </nav>

                <div className={`border-t border-slate-800/50 ${sidebarCollapsed ? 'px-2 py-3' : 'px-4 py-3'}`}>
                    {/* Collapse toggle */}
                    <button
                        onClick={() => setSidebarCollapsed(c => !c)}
                        title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                        className={`hidden lg:flex items-center gap-3 w-full rounded-xl transition-all duration-200 font-bold text-sm
                            text-slate-500 hover:text-slate-200 hover:bg-slate-800/60 mb-2
                            ${sidebarCollapsed ? 'justify-center px-0 py-3' : 'px-3 py-2.5'}`}
                    >
                        {sidebarCollapsed
                            ? <PanelLeftOpen className="w-5 h-5 flex-shrink-0" />
                            : <>
                                <PanelLeftClose className="w-5 h-5 flex-shrink-0" />
                                <span>Collapse</span>
                              </>
                        }
                    </button>
                    <div className="relative group/tip">
                        <button
                            onClick={handleLogout}
                            className={`flex items-center gap-3 text-slate-400 hover:text-red-400 hover:bg-red-400/5 w-full rounded-xl transition-all font-bold text-sm
                                ${sidebarCollapsed ? 'justify-center px-0 py-3' : 'px-3 py-2.5'}`}
                        >
                            <LogOut className="w-5 h-5 flex-shrink-0" />
                            {!sidebarCollapsed && <span>Logout System</span>}
                        </button>
                        {sidebarCollapsed && (
                            <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 z-[100]
                                opacity-0 group-hover/tip:opacity-100 transition-opacity duration-150">
                                <div className="bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap border border-slate-700">
                                    Logout
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className={`flex-grow flex flex-col min-h-screen transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-[72px]' : 'lg:pl-[280px]'}`}>
                {/* Top Header */}
                <header
                    className={`
                        sticky top-0 z-50 h-[72px] flex items-center justify-between px-8 transition-all duration-300
                        ${scrolled ? 'bg-white/80 backdrop-blur-xl shadow-sm' : 'bg-transparent'}
                    `}
                >
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                        >
                            <Menu className="w-6 h-6" />
                        </button>

                        <div className="hidden md:flex items-center gap-2 text-sm font-medium text-slate-400">
                            <span className="hover:text-slate-600 cursor-pointer">Admin</span>
                            <ChevronRight className="w-4 h-4" />
                            <span className="text-slate-900 font-bold capitalize">
                                {location.pathname === '/' ? 'Dashboard' : location.pathname.substring(1).replace('-', ' ')}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Search Bar */}
                        <div className="hidden lg:flex items-center relative group">
                            <Search className="absolute left-4 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Command + K to search..."
                                className="pl-11 pr-4 py-2.5 bg-slate-100 border-transparent border focus:bg-white focus:border-indigo-500/30 rounded-xl text-sm font-medium outline-none transition-all w-64"
                            />
                        </div>

                        {/* Notifications */}
                        <button className="relative p-2.5 text-slate-400 hover:text-slate-900 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-200">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-600 rounded-full border-2 border-white"></span>
                        </button>

                        <div className="h-8 w-px bg-slate-200 mx-2"></div>

                        {/* User Profile */}
                        <div className="flex items-center gap-3 pl-2">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold text-slate-900 truncate max-w-[120px]">
                                    {userProfile?.full_name || 'System Admin'}
                                </p>
                                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                                    {userProfile?.role || 'Administrator'}
                                </p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shadow-inner">
                                {userProfile?.avatar_url ? (
                                    <img src={userProfile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-5 h-5 text-slate-400" />
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-grow p-8 animate-in fade-in duration-500">
                    <Outlet />
                </main>

                {/* Floating Mobile Sidebar Close Button */}
                {sidebarOpen && (
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="fixed top-6 right-6 z-[70] p-3 bg-white shadow-2xl rounded-2xl lg:hidden animate-in fade-in zoom-in duration-200"
                    >
                        <X className="w-6 h-6 text-slate-900" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default AdminLayout;
