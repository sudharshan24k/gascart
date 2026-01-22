import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Users, Settings, LogOut, ClipboardCheck, BookOpen, FolderTree, Building2, ShieldCheck, Settings2 } from 'lucide-react';
import { authService } from '../services/auth.service';

const AdminLayout = () => {
    const location = useLocation();
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
        { name: 'Consultants', icon: Users, path: '/consultants' },
        { name: 'Inventory', path: '/inventory', icon: Package },
        { name: 'Orders', path: '/orders', icon: ShoppingCart },
        { name: 'Settings', path: '/settings', icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-gray-100 flex font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-secondary-900 text-white flex flex-col flex-shrink-0">
                <div className="p-6 border-b border-gray-800">
                    <h1 className="text-2xl font-display font-bold">Admin</h1>
                </div>

                <nav className="flex-grow p-4 space-y-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive(item.path) && item.path !== '/admin' || (item.path === '/admin' && location.pathname === '/admin')
                                ? 'bg-primary-600 text-white'
                                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                }`}
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium">{item.name}</span>
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-800">
                    <button
                        onClick={async () => {
                            localStorage.removeItem('admin_logged_in');
                            await authService.signOut();
                            window.location.href = '/login';
                        }}
                        className="flex items-center space-x-3 px-4 py-3 text-red-400 hover:bg-gray-800 w-full rounded-lg transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-grow overflow-y-auto h-screen p-8">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
