// import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Wallet, ShieldCheck, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const Cart = () => {
    const { items, cartTotal, updateQuantity, removeFromCart, loading } = useCart();
    const { session } = useAuth();
    const navigate = useNavigate();

    // Calculate totals
    const subtotal = cartTotal;
    const tax = subtotal * 0.18; // 18% GST example
    const grandTotal = subtotal + tax;
    
    // Calculate dynamic advance
    let totalAdvance = 0;
    let commonPercentage: number | null = null;
    let isMixed = false;

    items.forEach(item => {
        const price = item.vendor_price ?? item.selected_variant?.price ?? item.product.price;
        const itemTotal = (price * item.quantity) * 1.18;
        const percentage = item.product.advance_payment_percentage ?? 50;
        totalAdvance += (itemTotal * (percentage / 100));

        if (commonPercentage === null) {
            commonPercentage = percentage;
        } else if (commonPercentage !== percentage) {
            isMixed = true;
        }
    });

    const advancePayable = totalAdvance;

    if (loading && items.length === 0) {
        return (
            <div className="min-h-screen pt-32 flex flex-col items-center justify-center bg-neutral-50">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-neutral-500 font-medium animate-pulse">Loading cart...</p>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="min-h-screen pt-32 pb-20 bg-neutral-50 flex flex-col items-center justify-center text-center px-4">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-xl mb-8 relative"
                >
                    <ShoppingBag className="w-12 h-12 text-neutral-300" />
                    <div className="absolute top-0 right-0 w-8 h-8 bg-primary rounded-full animate-ping opacity-20"></div>
                </motion.div>
                <h1 className="text-4xl font-display font-bold text-neutral-900 mb-4">Your Cart is Empty</h1>
                <p className="text-neutral-500 mb-10 max-w-md text-lg leading-relaxed">
                    Looks like you haven't added any industrial assets yet. Explore our marketplace for premium equipment.
                </p>
                <Link
                    to="/shop"
                    className="px-8 py-4 bg-neutral-900 text-white rounded-2xl font-bold flex items-center gap-3 hover:bg-black hover:scale-105 transition-all shadow-lg"
                >
                    Start Sourcing <ArrowRight className="w-5 h-5" />
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-32 pb-24 bg-neutral-50">
            <div className="container mx-auto px-4 max-w-7xl">
                <div className="flex items-end justify-between mb-10">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-display font-bold text-neutral-900 mb-2">Shopping Cart</h1>
                        <p className="text-neutral-500 font-medium max-w-xl">Review selected assets and configure quantities for procurement.</p>
                    </div>
                </div>

                <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-start">
                    {/* Cart Items List */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="bg-white rounded-[40px] shadow-sm border border-neutral-100 overflow-hidden">
                            <ul className="divide-y divide-neutral-100">
                                <AnimatePresence initial={false}>
                                    {items.map((item) => (
                                        <motion.li
                                            key={item.id}
                                            layout
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="p-8 flex flex-col sm:flex-row items-center gap-8 group"
                                        >
                                            {/* Image */}
                                            <div className="relative w-32 h-32 bg-neutral-50 rounded-2xl overflow-hidden border border-neutral-200 flex-shrink-0 group-hover:border-primary/30 transition-colors">
                                                {item.product.image_url ? (
                                                    <img
                                                        src={item.product.image_url}
                                                        alt={item.product.name}
                                                        className="w-full h-full object-cover object-center transform group-hover:scale-110 transition-transform duration-500"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-neutral-300">
                                                        <ShoppingBag className="w-8 h-8" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Details */}
                                            <div className="flex-1 flex flex-col sm:flex-row justify-between w-full min-w-0 text-center sm:text-left gap-6">
                                                <div className="flex-1 space-y-2">
                                                    <h3 className="text-xl font-bold text-neutral-900 leading-tight">
                                                        <Link to={`/product/${item.product.id}`} className="hover:text-primary transition-colors">
                                                            {item.product.name}
                                                        </Link>
                                                    </h3>
                                                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                                                        <span className="text-xs font-black text-neutral-400 uppercase tracking-widest bg-neutral-50 px-2 py-1 rounded">
                                                            SKU: {item.product.sku || 'N/A'}
                                                        </span>
                                                        {item.selected_variant && (
                                                            <span className="text-xs font-bold text-primary bg-primary/5 px-2 py-1 rounded">
                                                                Option: {item.selected_variant.name || 'Selected'}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-2xl font-bold text-neutral-900 mt-2">
                                                        ₹{((item.vendor_price ?? item.selected_variant?.price ?? item.product.price) * item.quantity).toLocaleString()}
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex flex-col items-center sm:items-end justify-between gap-4">
                                                    <div className="flex items-center gap-3 bg-neutral-50 rounded-xl p-1 border border-neutral-200">
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white text-neutral-600 shadow-sm hover:text-primary disabled:opacity-50"
                                                            disabled={item.quantity <= 1}
                                                        >
                                                            <Minus className="w-4 h-4" />
                                                        </button>
                                                        <span className="w-8 text-center font-bold text-neutral-900">{item.quantity}</span>
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white text-neutral-600 shadow-sm hover:text-primary"
                                                        >
                                                            <Plus className="w-4 h-4" />
                                                        </button>
                                                    </div>

                                                    <button
                                                        onClick={() => removeFromCart(item.id)}
                                                        className="text-sm font-bold text-neutral-400 hover:text-red-500 flex items-center gap-2 transition-colors px-3 py-1 rounded-lg hover:bg-red-50"
                                                    >
                                                        <Trash2 className="w-4 h-4" /> Remove
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.li>
                                    ))}
                                </AnimatePresence>
                            </ul>
                        </div>

                        <div className="flex items-center gap-4 p-6 bg-blue-50/50 rounded-3xl border border-blue-100 text-blue-800">
                            <div className="p-3 bg-blue-100 rounded-xl">
                                <Truck className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm">Flexible Logistics Handling</h4>
                                <p className="text-xs opacity-80">Final shipping cost will be expertly calculated post-checkout based on destination address and specific asset volumetric requirements.</p>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-4 mt-8 lg:mt-0 lg:sticky lg:top-32">
                        <div className="bg-white rounded-[40px] shadow-lg shadow-neutral-200/50 border border-neutral-100 p-8">
                            <h2 className="text-xl font-bold text-neutral-900 mb-8 font-display flex items-center gap-2">
                                <Wallet className="w-5 h-5 text-primary" /> Order Summary
                            </h2>

                            <dl className="space-y-4 mb-8">
                                <div className="flex justify-between text-neutral-600">
                                    <dt className="text-sm font-medium">Subtotal</dt>
                                    <dd className="font-bold text-neutral-900">₹{subtotal.toLocaleString()}</dd>
                                </div>
                                <div className="flex justify-between text-neutral-600">
                                    <dt className="text-sm font-medium">Tax (18% GST)</dt>
                                    <dd className="font-bold text-neutral-900">₹{tax.toLocaleString()}</dd>
                                </div>

                                <div className="border-t border-dashed border-neutral-200 my-4 pt-4">
                                    <div className="flex justify-between items-end mb-4">
                                        <dt className="text-sm font-bold text-neutral-500">Grand Total (excl. Shipping)</dt>
                                        <dd className="text-lg font-bold text-neutral-900">₹{grandTotal.toLocaleString()}</dd>
                                    </div>
                                    
                                    <div className="flex justify-between items-center p-4 bg-primary/5 rounded-2xl border border-primary/20">
                                        <div>
                                            <dt className="text-sm font-black text-primary">
                                                {isMixed ? 'Advance Payment' : `Advance (${commonPercentage ?? 50}%)`}
                                            </dt>
                                        </div>
                                        <dd className="text-2xl font-black text-primary">₹{advancePayable.toLocaleString()}</dd>
                                    </div>
                                    
                                    <p className="text-[10px] text-neutral-400 font-medium text-center mt-4">
                                        * Required to initiate order processing. Shipping is calculated post-order and billed with the remaining balance.
                                    </p>
                                </div>
                            </dl>

                            <div className="bg-neutral-50 rounded-2xl p-4 mb-8 border border-neutral-200">
                                <div className="flex items-start gap-3">
                                    <ShieldCheck className="w-5 h-5 text-green-600 mt-0.5" />
                                    <div>
                                        <p className="text-xs font-bold text-neutral-900">Secure Procurement</p>
                                        <p className="text-[10px] text-neutral-500 leading-relaxed mt-1">
                                            Your transaction is protected by 256-bit SSL encryption.
                                            Business invoicing available at checkout.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    if (!session) {
                                        navigate('/login?redirect=/checkout');
                                    } else {
                                        navigate('/checkout');
                                    }
                                }}
                                className="w-full py-5 bg-neutral-900 text-white rounded-2xl font-black text-lg shadow-xl shadow-neutral-900/20 hover:bg-black hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
                            >
                                {session ? 'Proceed to Checkout' : 'Login to Checkout'}
                                <ArrowRight className="w-5 h-5" />
                            </button>

                            <div className="mt-4 text-center">
                                <Link to="/shop" className="text-xs font-bold text-neutral-400 hover:text-neutral-900 transition-colors">
                                    Continue Shopping
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
