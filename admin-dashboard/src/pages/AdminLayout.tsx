import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Package, ShoppingCart, Users, LogOut,
    ClipboardCheck, BookOpen, FolderTree, Building2, ShieldCheck,
    Settings2, Menu, X, Search, Bell, ChevronRight, User,
    Database, MessageSquare
} from 'lucide-react';
import { authService } from '../services/auth.service';
import { supabase } from '../services/api';

const AdminLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [userProfile, setUserProfile] = useState<any>(null);

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
                { name: 'Assets', path: '/products', icon: Package },
                { name: 'Inventory', path: '/inventory', icon: Database },
                { name: 'Orders', path: '/orders', icon: ShoppingCart },
            ]
        },
        {
            title: 'Marketplace Engine',
            items: [
                { name: 'RFQ Manager', path: '/rfqs', icon: ClipboardCheck },
                { name: 'RFQ Configurator', path: '/rfq-config', icon: Settings2 },
                { name: 'Vendor Ecosystem', path: '/vendors', icon: Building2 },
            ]
        },
        {
            title: 'Content & Knowledge',
            items: [
                { name: 'Knowledge Hub', path: '/learn', icon: BookOpen },
                { name: 'Taxonomy', path: '/taxonomy', icon: FolderTree },
                { name: 'Legal Vault', path: '/documents', icon: ShieldCheck },
            ]
        },
        {
            title: 'Users & Experts',
            items: [
                { name: 'User Management', path: '/users', icon: Users },
                { name: 'Expert Network', path: '/consultants', icon: User },
                { name: 'Expert Inquiries', path: '/consultant-inquiries', icon: MessageSquare },
            ]
        }
    ];

    const handleLogout = async () => {
        localStorage.removeItem('admin_logged_in');
        await authService.signOut();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
            {/* Sidebar */}
            <aside
                className={`
                    fixed inset-y-0 left-0 z-[60]
                    w-[280px] bg-[#0F172A] text-slate-300 flex flex-col
                    transition-all duration-300 ease-in-out border-r border-slate-800
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}
            >
                <div className="p-8 flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
                        <ShieldCheck className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-white tracking-tight">GASCART</h1>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Admin Control</p>
                    </div>
                </div>

                <nav className="flex-grow p-4 space-y-8 overflow-y-auto custom-scrollbar">
                    {navigationGroups.map((group) => (
                        <div key={group.title}>
                            <h3 className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4">
                                {group.title}
                            </h3>
                            <div className="space-y-1">
                                {group.items.map((item) => (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setSidebarOpen(false)}
                                        className={`
                                            flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group
                                            ${isActive(item.path)
                                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                                                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100'
                                            }
                                        `}
                                    >
                                        <div className="flex items-center gap-3">
                                            <item.icon className={`w-5 h-5 transition-colors ${isActive(item.path) ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`} />
                                            <span className="text-sm font-bold">{item.name}</span>
                                        </div>
                                        {isActive(item.path) && <ChevronRight className="w-4 h-4 text-white/50" />}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-800/50">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-400/5 w-full rounded-xl transition-all font-bold text-sm"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>Logout System</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-grow flex flex-col min-h-screen lg:pl-[280px]">
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
