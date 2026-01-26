import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Users, Settings, LogOut, ClipboardCheck, BookOpen, FolderTree, Building2, ShieldCheck, Settings2, Menu, X } from 'lucide-react';
import { authService } from '../services/auth.service';

const AdminLayout = () => {
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const isActive = (path: string) => location.pathname.includes(path);

    const navItems = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Products', path: '/products', icon: Package },
        { name: 'RFQs', path: '/rfqs', icon: ClipboardCheck },
        { name: 'RFQ Engine Config', path: '/rfq-config', icon: Settings2 },
        { name: 'Knowledge Hub', path: '/learn', icon: BookOpen },
        { name: 'Taxonomy', path: '/taxonomy', icon: FolderTree },
        { name: 'Vendors', path: '/vendors', icon: Building2 },
        { name: 'Legal Vault', path: '/documents', icon: ShieldCheck },
        { name: 'Users', path: '/users', icon: Users },
        { name: 'Consultants', icon: Users, path: '/consultants' },
        { name: 'Inventory', path: '/inventory', icon: Package },
        { name: 'Orders', path: '/orders', icon: ShoppingCart },
        { name: 'Settings', path: '/settings', icon: Settings },
    ];

    const handleLogout = async () => {
        localStorage.removeItem('admin_logged_in');
        await authService.signOut();
        window.location.href = '/login';
    };

    return (
        <div className="min-h-screen bg-gray-100 flex font-sans">
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 z-50">
                <h1 className="text-xl font-display font-bold text-gray-900">Admin Dashboard</h1>
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors touch-target"
                    aria-label={sidebarOpen ? "Close menu" : "Open menu"}
                >
                    {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-40 transition-opacity"
                    onClick={() => setSidebarOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed lg:static inset-y-0 left-0 z-50
                    w-64 bg-secondary-900 text-white flex flex-col
                    transition-transform duration-300 ease-in-out
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}
            >
                <div className="p-6 border-b border-gray-800 flex items-center justify-between">
                    <h1 className="text-2xl font-display font-bold">Admin</h1>
                    {/* Close button for mobile */}
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden p-2 hover:bg-gray-800 rounded-lg transition-colors"
                        aria-label="Close sidebar"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <nav className="flex-grow p-4 space-y-2 overflow-y-auto custom-scrollbar">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setSidebarOpen(false)}
                            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive(item.path) && item.path !== '/admin' || (item.path === '/admin' && location.pathname === '/admin')
                                ? 'bg-primary-600 text-white'
                                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                }`}
                        >
                            <item.icon className="w-5 h-5 flex-shrink-0" />
                            <span className="font-medium truncate">{item.name}</span>
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-800">
                    <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 px-4 py-3 text-red-400 hover:bg-gray-800 w-full rounded-lg transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-grow overflow-y-auto min-h-screen p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8">
                <div className="max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
