import { useState, useEffect } from 'react';
import { Search, AlertTriangle, CheckCircle, Package, Minus, Plus, RefreshCw, Layers } from 'lucide-react';
import { fetchAdminProducts, updateProductInventory } from '../services/admin.service';

const Inventory = () => {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<'all' | 'low_stock' | 'out_of_stock'>('all');
    const [updating, setUpdating] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await fetchAdminProducts();
            setProducts(data);
        } catch (err) {
            console.error('Failed to load inventory', err);
        } finally {
            setLoading(false);
        }
    };

    const handleStockUpdate = async (id: string, adjustment: number) => {
        setUpdating(id);
        try {
            await updateProductInventory(id, adjustment);
            // Optimistic update
            setProducts(prev => prev.map(p => {
                if (p.id === id) {
                    const newStock = Math.max(0, (p.stock_quantity || 0) + adjustment);
                    return { ...p, stock_quantity: newStock };
                }
                return p;
            }));
        } catch (err) {
            console.error('Failed to update stock', err);
            alert('Failed to update stock level');
            loadData(); // Revert on error
        } finally {
            setUpdating(null);
        }
    };

    const getStockStatus = (product: any) => {
        const stock = product.stock_quantity || 0;
        const threshold = product.low_stock_threshold || 10;

        if (stock === 0) return { label: 'Out of Stock', color: 'bg-red-50 text-red-600', icon: AlertTriangle };
        if (stock <= threshold) return { label: 'Low Stock', color: 'bg-amber-50 text-amber-600', icon: AlertTriangle };
        return { label: 'In Stock', color: 'bg-green-50 text-green-600', icon: CheckCircle };
    };

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.id.toLowerCase().includes(searchQuery.toLowerCase());

        if (!matchesSearch) return false;

        const stock = p.stock_quantity || 0;
        const threshold = p.low_stock_threshold || 10;

        if (filter === 'low_stock') return stock <= threshold && stock > 0;
        if (filter === 'out_of_stock') return stock === 0;

        return true;
    });

    const stats = {
        total: products.length,
        lowStock: products.filter(p => (p.stock_quantity || 0) <= (p.low_stock_threshold || 10) && (p.stock_quantity || 0) > 0).length,
        outOfStock: products.filter(p => (p.stock_quantity || 0) === 0).length
    };

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 leading-tight">Inventory Control</h2>
                    <p className="text-gray-500 mt-1 font-medium">Manage stock levels and alerts</p>
                </div>
                <button
                    onClick={loadData}
                    className="p-3 bg-white hover:bg-gray-50 text-gray-500 hover:text-primary rounded-xl shadow-sm border border-gray-100 transition-all"
                    title="Refresh Data"
                >
                    <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 flex items-center gap-5">
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
                        <Package className="w-8 h-8 text-blue-500" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Total Assets</p>
                        <p className="text-3xl font-black text-gray-900">{stats.total}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 flex items-center gap-5">
                    <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center">
                        <AlertTriangle className="w-8 h-8 text-amber-500" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Low Stock</p>
                        <p className="text-3xl font-black text-gray-900">{stats.lowStock}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 flex items-center gap-5">
                    <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center">
                        <Layers className="w-8 h-8 text-red-500" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Out of Stock</p>
                        <p className="text-3xl font-black text-gray-900">{stats.outOfStock}</p>
                    </div>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 mb-10 flex flex-col md:flex-row gap-6">
                <div className="relative flex-grow">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search specific assets..."
                        className="w-full pl-14 pr-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-6 py-4 rounded-2xl font-bold transition-all ${filter === 'all' ? 'bg-gray-900 text-white shadow-lg' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                    >
                        All Items
                    </button>
                    <button
                        onClick={() => setFilter('low_stock')}
                        className={`px-6 py-4 rounded-2xl font-bold transition-all ${filter === 'low_stock' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                    >
                        Low Stock
                    </button>
                    <button
                        onClick={() => setFilter('out_of_stock')}
                        className={`px-6 py-4 rounded-2xl font-bold transition-all ${filter === 'out_of_stock' ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                    >
                        Empty
                    </button>
                </div>
            </div>

            {/* Inventory Table */}
            <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 text-gray-400 text-[10px] font-black uppercase tracking-widest border-b border-gray-100">
                                <th className="py-6 px-10">Asset Name</th>
                                <th className="py-6 px-10">Status</th>
                                <th className="py-6 px-10">Current Stock</th>
                                <th className="py-6 px-10 text-right">Quick Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                [1, 2, 3].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={4} className="py-10 px-10"><div className="h-6 bg-gray-100 rounded-xl w-full"></div></td>
                                    </tr>
                                ))
                            ) : filteredProducts.map((product) => {
                                const status = getStockStatus(product);
                                const StatusIcon = status.icon;

                                return (
                                    <tr key={product.id} className="hover:bg-gray-50/30 transition-colors">
                                        <td className="py-8 px-10">
                                            <div className="font-bold text-gray-900 text-lg">{product.name}</div>
                                            <div className="text-xs text-gray-400 font-medium mt-1">ID: {product.id.split('-')[0]}...</div>
                                        </td>
                                        <td className="py-8 px-10">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tight flex items-center gap-2 w-fit ${status.color}`}>
                                                <StatusIcon className="w-3 h-3" /> {status.label}
                                            </span>
                                        </td>
                                        <td className="py-8 px-10">
                                            <span className="text-2xl font-black text-gray-900">{product.stock_quantity?.toLocaleString() || 0}</span>
                                            <span className="text-xs text-gray-400 font-bold ml-1">UNITS</span>
                                        </td>
                                        <td className="py-8 px-10 text-right">
                                            <div className="flex justify-end items-center gap-3">
                                                <button
                                                    onClick={() => handleStockUpdate(product.id, -1)}
                                                    disabled={updating === product.id || (product.stock_quantity || 0) <= 0}
                                                    className="w-10 h-10 rounded-xl bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                                >
                                                    <Minus className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleStockUpdate(product.id, 1)}
                                                    disabled={updating === product.id}
                                                    className="w-10 h-10 rounded-xl bg-gray-50 hover:bg-green-50 text-gray-400 hover:text-green-500 flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                                >
                                                    <Plus className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {filteredProducts.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={4} className="py-12 text-center text-gray-400 font-medium">
                                        No assets found matching your criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Inventory;
