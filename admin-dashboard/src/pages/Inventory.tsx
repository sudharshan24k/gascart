import { useState, useEffect } from 'react';
import {
    Search,
    AlertTriangle,
    CheckCircle,
    Package,
    Minus,
    Plus,
    RefreshCw,
    Layers,
    ChevronRight,
    X,
    Settings2,
    TrendingUp,
    TrendingDown,
    Activity,
    BellRing
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchAdminProducts, updateProductInventory } from '../services/admin.service';

const Inventory = () => {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<'all' | 'low_stock' | 'out_of_stock'>('all');
    const [updating, setUpdating] = useState<string | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [editingQuantity, setEditingQuantity] = useState<{ id: string, value: string } | null>(null);

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

    const handleStockUpdate = async (id: string, updates: { adjustment?: number; absolute?: number; low_stock_threshold?: number }) => {
        setUpdating(id);
        try {
            const updatedProduct = await updateProductInventory(id, updates);
            setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updatedProduct } : p));
            if (selectedProduct?.id === id) {
                setSelectedProduct({ ...selectedProduct, ...updatedProduct });
            }
        } catch (err) {
            console.error('Failed to update stock', err);
            alert('Failed to synchronize stock level with master record.');
            loadData();
        } finally {
            setUpdating(null);
            setEditingQuantity(null);
        }
    };

    const getStockStatus = (product: any) => {
        const stock = product.stock_quantity || 0;
        const threshold = product.low_stock_threshold || 10;

        if (stock === 0) return { label: 'DEEP DEPLETION', color: 'bg-red-50 text-red-600', dot: 'bg-red-500', icon: AlertTriangle };
        if (stock <= threshold) return { label: 'LOW STOCK ALERT', color: 'bg-amber-50 text-amber-600', dot: 'bg-amber-500', icon: AlertTriangle };
        return { label: 'OPTIMAL LEVEL', color: 'bg-emerald-50 text-emerald-600', dot: 'bg-emerald-500', icon: CheckCircle };
    };

    const stats = {
        total: products.length,
        lowStock: products.filter(p => (p.stock_quantity || 0) <= (p.low_stock_threshold || 10) && (p.stock_quantity || 0) > 0).length,
        outOfStock: products.filter(p => (p.stock_quantity || 0) === 0).length
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

    const handleExportCSV = () => {
        const headers = ['Asset ID', 'Name', 'Category', 'Stock Level', 'Threshold', 'Unit Price', 'Total Valuation'];
        const rows = filteredProducts.map(p => [
            p.id,
            p.name,
            p.categories?.name || 'Unspecified',
            p.stock_quantity || 0,
            p.low_stock_threshold || 10,
            p.price || 0,
            (p.stock_quantity || 0) * (p.price || 0)
        ]);

        const csvContent = [headers, ...rows].map(e => e.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `inventory_audit_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="max-w-7xl mx-auto pb-20">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                    <h2 className="text-4xl font-black text-gray-900 tracking-tight">Inventory Intelligence</h2>
                    <p className="text-gray-500 mt-1 font-bold italic">Real-time stock governance and supply chain monitoring.</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={handleExportCSV}
                        className="flex items-center gap-3 px-6 py-4 bg-white hover:bg-gray-50 text-gray-900 border border-gray-100 rounded-[24px] text-[10px] font-black uppercase tracking-widest shadow-xl shadow-gray-200/50 transition-all active:scale-95"
                    >
                        <Layers className="w-4 h-4 text-primary" /> Export Audit
                    </button>
                    <button
                        onClick={loadData}
                        className="p-5 bg-white hover:bg-gray-50 text-gray-400 hover:text-primary rounded-[24px] shadow-xl shadow-gray-200/50 border border-gray-100 transition-all active:scale-90 group"
                        title="Synchronize Database"
                    >
                        <RefreshCw className={`w-6 h-6 transition-transform duration-700 group-hover:rotate-180 ${loading ? 'animate-spin text-primary' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Premium Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                {[
                    { label: 'Total Assets', value: stats.total, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Critical Threshold', value: stats.lowStock, icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
                    { label: 'Out of Stock', value: stats.outOfStock, icon: Layers, color: 'text-red-600', bg: 'bg-red-50' }
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 flex items-center gap-8 relative overflow-hidden group"
                    >
                        <div className={`absolute top-0 right-0 w-32 h-32 -mr-12 -mt-12 rounded-full opacity-5 ${stat.bg} transition-transform group-hover:scale-150 duration-700`} />
                        <div className={`w-20 h-20 ${stat.bg} rounded-[28px] flex items-center justify-center shadow-inner`}>
                            <stat.icon className={`w-10 h-10 ${stat.color}`} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                            <p className={`text-4xl font-black text-gray-900`}>{stat.value}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Governance Toolbar */}
            <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 mb-12 flex flex-col md:flex-row gap-8 items-center bg-gray-50/30">
                <div className="relative flex-grow w-full">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6" />
                    <input
                        type="text"
                        placeholder="Scan for specific technical assets..."
                        className="w-full pl-16 pr-8 py-5 bg-white border-2 border-transparent focus:border-primary/10 rounded-[28px] outline-none focus:ring-8 focus:ring-primary/5 transition-all font-bold text-lg shadow-inner"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex bg-gray-100 p-1.5 rounded-[24px] shadow-inner shrink-0 scale-95 md:scale-100">
                    {[
                        { id: 'all', label: 'All Units' },
                        { id: 'low_stock', label: 'Critical' },
                        { id: 'out_of_stock', label: 'Depleted' }
                    ].map((btn) => (
                        <button
                            key={btn.id}
                            onClick={() => setFilter(btn.id as any)}
                            className={`px-8 py-4 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all ${filter === btn.id
                                ? 'bg-white text-gray-900 shadow-xl shadow-gray-200/50 scale-105'
                                : 'text-gray-400 hover:text-gray-700'
                                }`}
                        >
                            {btn.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Inventory Ledger */}
            <div className="bg-white rounded-[48px] shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-gray-100">
                                <th className="py-8 px-12">Structural Asset</th>
                                <th className="py-8 px-12 text-center">Protocol Status</th>
                                <th className="py-8 px-12 text-center">Unit Count</th>
                                <th className="py-8 px-12 text-right">Fulfillment Control</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            <AnimatePresence mode="popLayout">
                                {loading ? (
                                    [1, 2, 3].map(i => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={4} className="py-12 px-12"><div className="h-8 bg-gray-100 rounded-[20px] w-full"></div></td>
                                        </tr>
                                    ))
                                ) : filteredProducts.map((product) => {
                                    const status = getStockStatus(product);
                                    const isEditing = editingQuantity?.id === product.id;

                                    return (
                                        <motion.tr
                                            layout
                                            key={product.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            onClick={() => setSelectedProduct(product)}
                                            className="hover:bg-gray-50/50 transition-all border-l-4 border-l-transparent hover:border-l-primary cursor-pointer group"
                                        >
                                            <td className="py-10 px-12">
                                                <div className="font-black text-gray-900 text-xl tracking-tight mb-1">{product.name}</div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest font-mono">ID: {product.id.slice(0, 8).toUpperCase()}</span>
                                                    <span className="w-1 h-1 rounded-full bg-gray-200" />
                                                    <span className="text-[10px] font-bold text-primary/60 uppercase">Dmn: {product.categories?.name || 'Unspecified'}</span>
                                                </div>
                                            </td>
                                            <td className="py-10 px-12">
                                                <div className="flex justify-center">
                                                    <span className={`px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.15em] flex items-center gap-3 border shadow-sm ${status.color}`}>
                                                        <span className={`w-2 h-2 rounded-full ${status.dot} animate-pulse`} />
                                                        {status.label}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-10 px-12" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex flex-col items-center group/qty relative">
                                                    {isEditing ? (
                                                        <div className="flex items-center gap-3 animate-in zoom-in-95 duration-200">
                                                            <input
                                                                autoFocus
                                                                type="number"
                                                                className="w-24 text-center text-2xl font-black text-gray-900 bg-gray-50 border-2 border-primary/20 rounded-xl py-2 outline-none focus:ring-4 focus:ring-primary/5"
                                                                value={editingQuantity.value}
                                                                onChange={(e) => setEditingQuantity({ ...editingQuantity, value: e.target.value })}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') {
                                                                        const val = parseInt(editingQuantity.value);
                                                                        if (!isNaN(val)) handleStockUpdate(product.id, { absolute: val });
                                                                        else setEditingQuantity(null);
                                                                    }
                                                                    if (e.key === 'Escape') setEditingQuantity(null);
                                                                }}
                                                                onBlur={() => {
                                                                    const val = parseInt(editingQuantity.value);
                                                                    if (!isNaN(val)) handleStockUpdate(product.id, { absolute: val });
                                                                    else setEditingQuantity(null);
                                                                }}
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div
                                                            onClick={() => setEditingQuantity({ id: product.id, value: (product.stock_quantity || 0).toString() })}
                                                            className="cursor-text group-hover/qty:scale-110 transition-transform duration-300 flex flex-col items-center"
                                                        >
                                                            <span className="text-3xl font-black text-gray-900 tabular-nums">{product.stock_quantity?.toLocaleString() || 0}</span>
                                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1 opacity-0 group-hover/qty:opacity-100 transition-opacity">Edit Protocol</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-10 px-12 text-right" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex justify-end items-center gap-4 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                                                    <button
                                                        onClick={() => handleStockUpdate(product.id, { adjustment: -1 })}
                                                        disabled={updating === product.id || (product.stock_quantity || 0) <= 0}
                                                        className="w-14 h-14 rounded-[20px] bg-white border border-gray-100 text-gray-400 hover:text-red-600 hover:border-red-100 hover:shadow-lg flex items-center justify-center transition-all disabled:opacity-10 active:scale-90"
                                                    >
                                                        <TrendingDown className="w-6 h-6" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleStockUpdate(product.id, { adjustment: 1 })}
                                                        disabled={updating === product.id}
                                                        className="w-14 h-14 rounded-[20px] bg-gray-900 text-white hover:bg-primary hover:shadow-xl shadow-primary/20 flex items-center justify-center transition-all active:scale-90"
                                                    >
                                                        <TrendingUp className="w-6 h-6" />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Asset Dossier Side Panel */}
            <AnimatePresence>
                {selectedProduct && (
                    <div className="fixed inset-0 z-[100] flex justify-end">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm shadow-inner"
                            onClick={() => setSelectedProduct(null)}
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="relative w-full max-w-xl bg-white shadow-3xl flex flex-col h-full border-l border-white/20"
                        >
                            <div className="p-10 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-[24px] bg-primary text-white flex items-center justify-center shadow-2xl shadow-primary/20">
                                        <Activity className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-gray-900 tracking-tight">Stock Dossier</h3>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Profile: {selectedProduct.name}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedProduct(null)}
                                    className="w-12 h-12 flex items-center justify-center bg-gray-100 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-2xl transition-all active:scale-90"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="flex-grow overflow-y-auto p-12 space-y-12 custom-scrollbar">
                                <section className="grid grid-cols-2 gap-8">
                                    <div className="bg-gray-50/50 p-8 rounded-[32px] border border-gray-100 flex flex-col justify-between">
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Omni-Channel Stock</p>
                                            <p className="text-4xl font-black text-gray-900">{selectedProduct.stock_quantity?.toLocaleString()}</p>
                                        </div>
                                        <div className="mt-4 w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.min(100, (selectedProduct.stock_quantity / (selectedProduct.low_stock_threshold || 10)) * 50)}%` }}
                                                className={`h-full ${selectedProduct.stock_quantity <= (selectedProduct.low_stock_threshold || 10) ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                            />
                                        </div>
                                    </div>
                                    <div className="bg-primary/5 p-8 rounded-[32px] border border-primary/10">
                                        <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-2">Valuation Metrics</p>
                                        <p className="text-2xl font-black text-primary">₹{((selectedProduct.stock_quantity || 0) * (selectedProduct.price || 0)).toLocaleString()}</p>
                                        <p className="text-[10px] font-bold text-primary/40 mt-1 uppercase">Total Capital Liquidity</p>
                                    </div>
                                    <div className="col-span-2 bg-gray-900 overflow-hidden p-8 rounded-[32px] text-white flex justify-between items-center group/loc shadow-xl shadow-gray-900/10">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Physical Anchorage</p>
                                            <input
                                                type="text"
                                                className="bg-transparent text-xl font-black outline-none border-b border-transparent focus:border-white/20 transition-all w-full decoration-none"
                                                placeholder="SPECIFY BAY / SHELF"
                                                value={selectedProduct.warehouse_location || ''}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setProducts(prev => prev.map(p => p.id === selectedProduct.id ? { ...p, warehouse_location: val } : p));
                                                    setSelectedProduct({ ...selectedProduct, warehouse_location: val });
                                                }}
                                                onBlur={(e) => handleStockUpdate(selectedProduct.id, { warehouse_location: e.target.value })}
                                            />
                                        </div>
                                        <MapPin className="w-8 h-8 text-white/20 group-hover/loc:text-primary transition-colors" />
                                    </div>
                                </section>

                                {selectedProduct.variants?.length > 0 && (
                                    <section className="space-y-6">
                                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 px-1 border-l-4 border-blue-500 pl-4">Variant Configuration Stock</h4>
                                        <div className="grid grid-cols-1 gap-4">
                                            {selectedProduct.variants.map((variant: any, idx: number) => (
                                                <div key={variant.id || idx} className="p-6 bg-white border border-gray-100 rounded-[28px] flex items-center justify-between group/variant hover:border-primary/20 transition-all shadow-sm">
                                                    <div>
                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Config: {Object.values(variant.attributes || {}).join(' / ') || 'Base Variant'}</p>
                                                        <p className="text-sm font-black text-gray-900">SKU: {variant.sku || 'N/A'}</p>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <input
                                                            type="number"
                                                            className="w-20 text-center py-2 bg-gray-50 rounded-xl font-black text-sm outline-none border-2 border-transparent focus:border-primary/10"
                                                            value={variant.stock || 0}
                                                            onChange={(e) => {
                                                                const newVariants = [...selectedProduct.variants];
                                                                newVariants[idx].stock = parseInt(e.target.value) || 0;
                                                                const totalStock = newVariants.reduce((sum: number, v: any) => sum + (v.stock || 0), 0);
                                                                handleStockUpdate(selectedProduct.id, {
                                                                    absolute: totalStock,
                                                                    variants: newVariants
                                                                });
                                                            }}
                                                        />
                                                        <span className="text-[9px] font-black text-gray-300 uppercase">Qty</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                <section className="space-y-8">
                                    <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 px-1 border-l-4 border-amber-500 pl-4">Governance Protocol</h4>

                                    <div className="space-y-6">
                                        <div className="p-8 bg-white border border-gray-100 rounded-[32px] space-y-4 shadow-sm">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                                                        <BellRing className="w-5 h-5 text-amber-500" />
                                                    </div>
                                                    <p className="text-xs font-black text-gray-700 uppercase tracking-widest">Critical Alert Threshold</p>
                                                </div>
                                                <span className="text-sm font-black text-amber-600 bg-amber-50 px-4 py-1 rounded-full">{selectedProduct.low_stock_threshold || 10} Units</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                value={selectedProduct.low_stock_threshold || 10}
                                                onChange={(e) => handleStockUpdate(selectedProduct.id, { low_stock_threshold: parseInt(e.target.value) })}
                                                className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-amber-500"
                                            />
                                            <div className="flex justify-between text-[8px] font-black text-gray-300 uppercase px-1">
                                                <span>Zero Floor</span>
                                                <span>Moderate</span>
                                                <span>High Buffer</span>
                                            </div>
                                        </div>

                                        <div className="p-8 bg-gray-900 rounded-[32px] text-white flex justify-between items-center shadow-2xl shadow-gray-900/20">
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Unit Valuation</p>
                                                <p className="text-2xl font-black">₹{parseFloat(selectedProduct.price || 0).toLocaleString()}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Inventory Value</p>
                                                <p className="text-2xl font-black text-emerald-400">₹{((selectedProduct.stock_quantity || 0) * (selectedProduct.price || 0)).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <section className="space-y-6">
                                    <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 px-1 border-l-4 border-gray-200 pl-4">Internal Profile Logs</h4>
                                    <div className="space-y-4">
                                        {[
                                            { event: 'Inventory Sync', date: 'Just Now', status: 'Success' },
                                            { event: 'Threshold Recalibration', date: '2h ago', status: 'Updated' }
                                        ].map((log, i) => (
                                            <div key={i} className="flex justify-between items-center p-5 bg-gray-50 rounded-2xl border border-transparent hover:border-gray-100 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                                    <span className="text-xs font-bold text-gray-700">{log.event}</span>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{log.date}</p>
                                                    <p className="text-[9px] font-bold text-emerald-500 uppercase">{log.status}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </div>

                            <div className="p-10 border-t border-gray-50 bg-white grid grid-cols-1">
                                <button
                                    onClick={() => setSelectedProduct(null)}
                                    className="w-full flex items-center justify-center gap-3 px-8 py-5 bg-gray-900 text-white rounded-[24px] font-black shadow-xl shadow-gray-900/20 hover:bg-black transition-all active:scale-95 text-xs uppercase tracking-[0.2em]"
                                >
                                    Seal Dossier Record
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Inventory;
