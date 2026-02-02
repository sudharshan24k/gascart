import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, Package, AlertTriangle, TrendingUp, TrendingDown, RotateCcw } from 'lucide-react';
import { updateInventory } from '../../services/admin.service.ts';

interface ManageInventoryModalProps {
    product: any;
    onClose: () => void;
    onUpdate: () => void;
}

const ManageInventoryModal: React.FC<ManageInventoryModalProps> = ({ product, onClose, onUpdate }) => {
    const [loading, setLoading] = useState(false);
    const [currentStock, setCurrentStock] = useState(product.stock_quantity || 0);
    const [adjustment, setAdjustment] = useState(0);
    const [absoluteValue, setAbsoluteValue] = useState(product.stock_quantity || 0);
    const [lowStockThreshold, setLowStockThreshold] = useState(product.low_stock_threshold || 10);
    const [warehouseLocation, setWarehouseLocation] = useState(product.warehouse_location || '');
    const [notes, setNotes] = useState('');
    const [mode, setMode] = useState<'adjustment' | 'absolute'>('adjustment');

    useEffect(() => {
        setCurrentStock(product.stock_quantity || 0);
        setAbsoluteValue(product.stock_quantity || 0);
        setLowStockThreshold(product.low_stock_threshold || 10);
        setWarehouseLocation(product.warehouse_location || '');
    }, [product]);

    const predictedStock = mode === 'adjustment' ? currentStock + adjustment : absoluteValue;
    const stockStatus = predictedStock > lowStockThreshold ? 'healthy' : predictedStock > 0 ? 'low' : 'out';

    const handleQuickAdjust = (amount: number) => {
        setAdjustment(prev => prev + amount);
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const data: any = {
                low_stock_threshold: lowStockThreshold,
                warehouse_location: warehouseLocation,
                notes
            };

            if (mode === 'adjustment') {
                data.adjustment = adjustment;
            } else {
                data.absolute = absoluteValue;
            }

            await updateInventory(product.id, data);
            onUpdate();
            onClose();
        } catch (err) {
            console.error('Failed to update inventory:', err);
            alert('Failed to update inventory');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'healthy': return 'text-green-600 bg-green-50';
            case 'low': return 'text-yellow-600 bg-yellow-50';
            case 'out': return 'text-red-600 bg-red-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'healthy': return <TrendingUp className="w-5 h-5" />;
            case 'low': return <AlertTriangle className="w-5 h-5" />;
            case 'out': return <TrendingDown className="w-5 h-5" />;
            default: return <Package className="w-5 h-5" />;
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gradient-to-r from-primary/5 to-primary/10">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Package className="w-6 h-6 text-primary" />
                            Manage Inventory
                        </h3>
                        <p className="text-sm text-gray-500 mt-1 font-medium">{product.name}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-6">
                    {/* Current Stock Display */}
                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Current Stock</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(stockStatus)} flex items-center gap-1`}>
                                {getStatusIcon(stockStatus)}
                                {stockStatus === 'healthy' ? 'In Stock' : stockStatus === 'low' ? 'Low Stock' : 'Out of Stock'}
                            </span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-5xl font-black text-gray-900">{currentStock}</span>
                            <span className="text-lg text-gray-400 font-medium">units</span>
                        </div>
                        {predictedStock !== currentStock && (
                            <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-500">New Stock:</span>
                                <span className="text-2xl font-bold text-primary">{predictedStock}</span>
                                <span className="text-sm text-gray-400">units</span>
                                <span className={`ml-2 text-sm font-bold ${adjustment > 0 ? 'text-green-600' : adjustment < 0 ? 'text-red-600' : 'text-gray-400'}`}>
                                    {mode === 'adjustment' && adjustment !== 0 && (adjustment > 0 ? `+${adjustment}` : adjustment)}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Mode Selector */}
                    <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
                        <button
                            onClick={() => setMode('adjustment')}
                            className={`flex-1 py-2 px-4 rounded-lg font-bold text-sm transition-all ${mode === 'adjustment'
                                    ? 'bg-white text-primary shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <span className="flex items-center justify-center gap-2">
                                <RotateCcw className="w-4 h-4" />
                                Adjust Stock
                            </span>
                        </button>
                        <button
                            onClick={() => setMode('absolute')}
                            className={`flex-1 py-2 px-4 rounded-lg font-bold text-sm transition-all ${mode === 'absolute'
                                    ? 'bg-white text-primary shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Set Absolute Value
                        </button>
                    </div>

                    {/* Adjustment Controls */}
                    {mode === 'adjustment' ? (
                        <div className="space-y-4">
                            <label className="block text-sm font-bold text-gray-700">Quick Adjustments</label>
                            <div className="grid grid-cols-3 gap-3">
                                <button
                                    onClick={() => handleQuickAdjust(-100)}
                                    className="p-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold transition-all border border-red-100"
                                >
                                    <Minus className="w-4 h-4 mx-auto mb-1" />
                                    -100
                                </button>
                                <button
                                    onClick={() => handleQuickAdjust(-50)}
                                    className="p-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold transition-all border border-red-100"
                                >
                                    <Minus className="w-4 h-4 mx-auto mb-1" />
                                    -50
                                </button>
                                <button
                                    onClick={() => handleQuickAdjust(-10)}
                                    className="p-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold transition-all border border-red-100"
                                >
                                    <Minus className="w-4 h-4 mx-auto mb-1" />
                                    -10
                                </button>
                                <button
                                    onClick={() => handleQuickAdjust(10)}
                                    className="p-4 bg-green-50 hover:bg-green-100 text-green-600 rounded-xl font-bold transition-all border border-green-100"
                                >
                                    <Plus className="w-4 h-4 mx-auto mb-1" />
                                    +10
                                </button>
                                <button
                                    onClick={() => handleQuickAdjust(50)}
                                    className="p-4 bg-green-50 hover:bg-green-100 text-green-600 rounded-xl font-bold transition-all border border-green-100"
                                >
                                    <Plus className="w-4 h-4 mx-auto mb-1" />
                                    +50
                                </button>
                                <button
                                    onClick={() => handleQuickAdjust(100)}
                                    className="p-4 bg-green-50 hover:bg-green-100 text-green-600 rounded-xl font-bold transition-all border border-green-100"
                                >
                                    <Plus className="w-4 h-4 mx-auto mb-1" />
                                    +100
                                </button>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Custom Adjustment</label>
                                <input
                                    type="number"
                                    value={adjustment}
                                    onChange={(e) => setAdjustment(parseInt(e.target.value) || 0)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-center text-2xl font-bold"
                                    placeholder="0"
                                />
                                <button
                                    onClick={() => setAdjustment(0)}
                                    className="mt-2 text-xs text-gray-400 hover:text-gray-600 font-medium"
                                >
                                    Reset to 0
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Set Stock to Absolute Value</label>
                            <input
                                type="number"
                                value={absoluteValue}
                                onChange={(e) => setAbsoluteValue(parseInt(e.target.value) || 0)}
                                min="0"
                                className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-center text-3xl font-bold"
                            />
                        </div>
                    )}

                    {/* Configuration */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Low Stock Threshold</label>
                            <input
                                type="number"
                                value={lowStockThreshold}
                                onChange={(e) => setLowStockThreshold(parseInt(e.target.value) || 0)}
                                min="0"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Warehouse Location</label>
                            <select
                                value={warehouseLocation}
                                onChange={(e) => setWarehouseLocation(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                            >
                                <option value="">Select Location</option>
                                <option value="Warehouse A">Warehouse A</option>
                                <option value="Warehouse B">Warehouse B</option>
                                <option value="Warehouse C">Warehouse C</option>
                                <option value="Main Storage">Main Storage</option>
                            </select>
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Adjustment Notes (Optional)</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all resize-none"
                            placeholder="Reason for adjustment, supplier details, etc."
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-6 py-3 border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-white transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || (mode === 'adjustment' && adjustment === 0)}
                        className="flex-1 px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Updating...' : 'Update Inventory'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ManageInventoryModal;
