import { useState, useEffect } from 'react';
import {
    Search,
    AlertTriangle,
    CheckCircle,
    Package,
    RefreshCw,
    Layers,
    X,
    MapPin,
    TrendingUp,
    TrendingDown,
    Activity,
    BellRing,
    Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchAdminProducts, updateProductInventory, fetchAuditLogs } from '../services/admin.service';

const Inventory = () => {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<'all' | 'low_stock' | 'out_of_stock'>('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [updating, setUpdating] = useState<string | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [editingQuantity, setEditingQuantity] = useState<{ id: string, value: string } | null>(null);
    const [auditLogs, setAuditLogs] = useState<any[]>([]);

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

    const loadAuditLogs = async (productId: string) => {
        try {
            const data = await fetchAuditLogs({ target_type: 'product', target_id: productId, limit: 10 });
            setAuditLogs(data || []);
        } catch (err) {
            console.error('Failed to load audit logs', err);
        }
    };

    useEffect(() => {
        if (selectedProduct) {
            loadAuditLogs(selectedProduct.id);
        }
    }, [selectedProduct]);

    const handleStockUpdate = async (id: string, updates: { adjustment?: number; absolute?: number; low_stock_threshold?: number; variants?: any[]; warehouse_location?: string }) => {
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
            if (selectedProduct) loadAuditLogs(selectedProduct.id);
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

        if (startDate && new Date(p.created_at) < new Date(startDate)) return false;
        if (endDate) {
            const end = new Date(endDate);
            end.setDate(end.getDate() + 1);
            if (new Date(p.created_at) >= end) return false;
        }

        const stock = p.stock_quantity || 0;
        const threshold = p.low_stock_threshold || 10;
        if (filter === 'low_stock') return stock <= threshold && stock > 0;
        if (filter === 'out_of_stock') return stock === 0;
        return true;
    }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const handleExportCSV = () => {
        const headers = ['Asset ID', 'Name', 'Category', 'Stock Level', 'Threshold', 'Unit Price', 'Total Valuation', 'Creation Date'];
        const rows = filteredProducts.map(p => {
            const dateObj = new Date(p.created_at);
            return [
                p.id,
                `"${(p.name || '').replace(/"/g, '""')}"`,
                p.categories?.name || 'Unspecified',
                p.stock_quantity || 0,
                p.low_stock_threshold || 10,
                p.price || 0,
                (p.stock_quantity || 0) * (p.price || 0),
                dateObj.toLocaleDateString()
            ];
        });

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
        <div className="space-y-10 pb-20">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight">Inventory Intelligence</h2>
                    <p className="text-slate-500 font-medium mt-1 uppercase text-xs tracking-[0.2em]">Real-time stock governance and supply chain monitoring</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleExportCSV}
                        className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-sm text-slate-700 hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2"
                    >
                        <Layers className="w-4 h-4 text-indigo-600" />
                        <span>Export Audit</span>
                    </button>
                    <button
                        onClick={loadData}
                        className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition-all shadow-sm group"
                        title="Synchronize Database"
                    >
                        <RefreshCw className={`w-5 h-5 transition-transform duration-700 group-hover:rotate-180 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Premium Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Total Assets', value: stats.total, icon: Package, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                    { label: 'Critical Threshold', value: stats.lowStock, icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
                    { label: 'Deep Depletion', value: stats.outOfStock, icon: Layers, color: 'text-rose-600', bg: 'bg-rose-50' }
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="admin-card-interactive group border-none"
                    >
                        <div className="flex items-center gap-6">
                            <div className={`w-16 h-16 ${stat.bg} rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                                <stat.icon className={`w-8 h-8 ${stat.color}`} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                                <p className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Governance Toolbar */}
            <div className="admin-card border-none bg-slate-900/5 p-4 flex flex-col xl:flex-row gap-4 items-center">
                <div className="relative flex-grow w-full">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Scan for specific technical assets..."
                        className="w-full pl-15 pr-8 py-4 bg-white border-none rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all font-bold text-slate-900 shadow-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm w-full sm:w-auto overflow-hidden">
                        <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                        <input
                            type="date"
                            className="bg-transparent border-none text-[10px] font-black outline-none text-slate-700 w-28 uppercase tracking-widest"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                        <span className="text-slate-200 text-xs font-black">—</span>
                        <input
                            type="date"
                            className="bg-transparent border-none text-[10px] font-black outline-none text-slate-700 w-28 uppercase tracking-widest"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>

                    <div className="flex bg-slate-200/50 p-1 rounded-2xl w-full sm:w-auto">
                        {[
                            { id: 'all', label: 'All Units' },
                            { id: 'low_stock', label: 'Critical' },
                            { id: 'out_of_stock', label: 'Depleted' }
                        ].map((btn) => (
                            <button
                                key={btn.id}
                                onClick={() => setFilter(btn.id as any)}
                                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === btn.id
                                    ? 'bg-white text-slate-900 shadow-sm scale-105'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                {btn.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Inventory Ledger */}
            <div className="admin-card p-0 overflow-hidden border-none shadow-xl shadow-slate-200/50">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-900 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                                <th className="py-8 px-12">Structural Asset</th>
                                <th className="py-8 px-12 text-center">Protocol Status</th>
                                <th className="py-8 px-12 text-center">Unit Count</th>
                                <th className="py-8 px-12 text-right">Fulfillment Control</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            <AnimatePresence mode="popLayout">
                                {loading ? (
                                    [1, 2, 3, 4].map(i => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={4} className="py-12 px-12">
                                                <div className="h-8 bg-slate-50 rounded-xl w-full"></div>
                                            </td>
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
                                            className="hover:bg-slate-50/50 transition-all border-l-4 border-l-transparent hover:border-l-indigo-600 cursor-pointer group"
                                        >
                                            <td className="py-10 px-12">
                                                <div className="font-black text-slate-900 text-xl tracking-tight mb-1">{product.name}</div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest font-mono">ID: {product.id.slice(0, 8).toUpperCase()}</span>
                                                    <div className="w-1 h-1 rounded-full bg-slate-200" />
                                                    <span className="text-[10px] font-bold text-indigo-600/60 uppercase">{product.categories?.name || 'Unspecified'}</span>
                                                </div>
                                            </td>
                                            <td className="py-10 px-12">
                                                <div className="flex justify-center">
                                                    <span className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] flex items-center gap-3 border shadow-sm ${status.color}`}>
                                                        <div className={`w-2 h-2 rounded-full ${status.dot} animate-pulse`} />
                                                        {status.label}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-10 px-12" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex flex-col items-center group/qty relative">
                                                    {isEditing && editingQuantity ? (
                                                        <div className="flex items-center gap-3 animate-in zoom-in-95 duration-200">
                                                            <input
                                                                autoFocus
                                                                type="number"
                                                                className="w-24 text-center text-2xl font-black text-slate-900 bg-slate-50 border-2 border-indigo-600/20 rounded-xl py-2 outline-none focus:ring-4 focus:ring-indigo-600/5"
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
                                                            <span className="text-3xl font-black text-slate-900 tabular-nums">{product.stock_quantity?.toLocaleString() || 0}</span>
                                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 opacity-0 group-hover/qty:opacity-100 transition-opacity">Edit Protocol</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-10 px-12 text-right" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex justify-end items-center gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                                                    <button
                                                        onClick={() => handleStockUpdate(product.id, { adjustment: -1 })}
                                                        disabled={updating === product.id || (product.stock_quantity || 0) <= 0}
                                                        className="w-12 h-12 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-100 hover:shadow-lg flex items-center justify-center transition-all disabled:opacity-10 active:scale-90"
                                                    >
                                                        <TrendingDown className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleStockUpdate(product.id, { adjustment: 1 })}
                                                        disabled={updating === product.id}
                                                        className="w-12 h-12 rounded-xl bg-slate-900 text-white hover:bg-indigo-600 hover:shadow-xl shadow-indigo-600/20 flex items-center justify-center transition-all active:scale-90"
                                                    >
                                                        <TrendingUp className="w-5 h-5" />
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
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm shadow-inner"
                            onClick={() => setSelectedProduct(null)}
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="relative w-full max-w-xl bg-white shadow-2xl flex flex-col h-full border-l border-slate-200/50"
                        >
                            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/20">
                                        <Activity className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Stock Dossier</h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Ref: {selectedProduct.name}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedProduct(null)}
                                    className="w-10 h-10 flex items-center justify-center bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-xl transition-all active:scale-90"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex-grow overflow-y-auto p-10 space-y-10 custom-scrollbar">
                                <section className="grid grid-cols-2 gap-6">
                                    <div className="admin-card bg-slate-50/50 border-slate-100 flex flex-col justify-between">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Omni-Channel Stock</p>
                                            <p className="text-4xl font-black text-slate-900">{selectedProduct.stock_quantity?.toLocaleString()}</p>
                                        </div>
                                        <div className="mt-4 w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.min(100, (selectedProduct.stock_quantity / (selectedProduct.low_stock_threshold || 10)) * 50)}%` }}
                                                className={`h-full ${selectedProduct.stock_quantity <= (selectedProduct.low_stock_threshold || 10) ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                            />
                                        </div>
                                    </div>
                                    <div className="admin-card bg-indigo-50/30 border-indigo-100">
                                        <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2">Valuation Metrics</p>
                                        <p className="text-2xl font-black text-indigo-900">₹{((selectedProduct.stock_quantity || 0) * (selectedProduct.price || 0)).toLocaleString()}</p>
                                        <p className="text-[10px] font-bold text-indigo-600/40 mt-1 uppercase">Capital Liquidity</p>
                                    </div>
                                    <div className="col-span-2 admin-card bg-slate-900 border-none p-6 text-white flex justify-between items-center group/loc shadow-xl shadow-slate-900/10">
                                        <div className="flex-grow">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Physical Anchorage</p>
                                            <input
                                                type="text"
                                                className="bg-transparent text-xl font-black outline-none border-b border-transparent focus:border-indigo-500/30 transition-all w-full placeholder:text-slate-700"
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
                                        <MapPin className="w-8 h-8 text-slate-700 group-hover/loc:text-indigo-500 transition-colors ml-4" />
                                    </div>
                                </section>

                                {selectedProduct.variants?.length > 0 && (
                                    <section className="space-y-6">
                                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 px-1 border-l-4 border-indigo-600 pl-4">Variant Configuration</h4>
                                        <div className="grid grid-cols-1 gap-4">
                                            {selectedProduct.variants.map((variant: any, idx: number) => (
                                                <div key={variant.id || idx} className="admin-card p-5 flex items-center justify-between group/variant hover:border-indigo-600/20 transition-all">
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{Object.values(variant.attributes || {}).join(' / ') || 'Base Variant'}</p>
                                                        <p className="text-sm font-black text-slate-900">SKU: {variant.sku || 'N/A'}</p>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <input
                                                            type="number"
                                                            className="w-20 text-center py-2 bg-slate-50 rounded-xl font-black text-sm outline-none border-2 border-transparent focus:border-indigo-600/20"
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
                                                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Qty</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                <section className="space-y-8">
                                    <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 px-1 border-l-4 border-amber-500 pl-4">Governance Protocol</h4>

                                    <div className="space-y-6">
                                        <div className="admin-card p-6 space-y-4">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                                                        <BellRing className="w-5 h-5 text-amber-500" />
                                                    </div>
                                                    <p className="text-xs font-black text-slate-700 uppercase tracking-widest">Alert Threshold</p>
                                                </div>
                                                <span className="text-sm font-black text-amber-600 bg-amber-50 px-4 py-1 rounded-full">{selectedProduct.low_stock_threshold || 10} Units</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                value={selectedProduct.low_stock_threshold || 10}
                                                onChange={(e) => handleStockUpdate(selectedProduct.id, { low_stock_threshold: parseInt(e.target.value) })}
                                                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-amber-500"
                                            />
                                            <div className="flex justify-between text-[8px] font-black text-slate-300 uppercase tracking-[0.2em] px-1">
                                                <span>Zero Floor</span>
                                                <span>Critical</span>
                                                <span>High Buffer</span>
                                            </div>
                                        </div>

                                        <div className="admin-card bg-slate-900 border-none p-6 text-white flex justify-between items-center shadow-xl shadow-slate-900/20">
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Unit Value</p>
                                                <p className="text-2xl font-black">₹{parseFloat(selectedProduct.price || 0).toLocaleString()}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Stock Liquidity</p>
                                                <p className="text-2xl font-black text-emerald-400">₹{((selectedProduct.stock_quantity || 0) * (selectedProduct.price || 0)).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <section className="space-y-6">
                                    <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 px-1 border-l-4 border-slate-200 pl-4">System Event Log</h4>
                                    <div className="space-y-3">
                                        {auditLogs.length > 0 ? auditLogs.map((log) => (
                                            <div key={log.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100/50 hover:bg-white transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-2 h-2 rounded-full ${log.status === 'optimal' ? 'bg-emerald-500' : log.status === 'updated' ? 'bg-indigo-500' : 'bg-rose-500'}`} />
                                                    <span className="text-xs font-bold text-slate-700">{log.action.replace(/_/g, ' ')}</span>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                    <p className={`text-[9px] font-bold uppercase mt-0.5 ${log.status === 'optimal' ? 'text-emerald-600' : log.status === 'updated' ? 'text-indigo-600' : 'text-rose-600'}`}>{log.status}</p>
                                                </div>
                                            </div>
                                        )) : (
                                            <div className="p-4 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">No recent events recorded</p>
                                            </div>
                                        )}
                                    </div>
                                </section>
                            </div>

                            <div className="p-8 border-t border-slate-100 bg-white">
                                <button
                                    onClick={() => setSelectedProduct(null)}
                                    className="admin-btn-primary w-full shadow-slate-900/10 text-xs uppercase tracking-[0.2em]"
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
