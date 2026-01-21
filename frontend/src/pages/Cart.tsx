import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Cart = () => {
    const { items, cartTotal, updateQuantity, removeFromCart, loading } = useCart();

    if (loading && items.length === 0) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
                <div className="bg-primary-50 p-6 rounded-full mb-6">
                    <ShoppingBag className="w-12 h-12 text-primary-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
                <p className="text-gray-500 mb-8 max-w-sm">
                    Looks like you haven't added anything to your cart yet. Browse our marketplace to find industrial gases and equipment.
                </p>
                <Link
                    to="/shop"
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors shadow-sm"
                >
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-8 font-display">Shopping Cart</h1>

            <div className="lg:grid lg:grid-cols-12 lg:gap-12">
                {/* Cart Items List */}
                <div className="lg:col-span-8">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <ul className="divide-y divide-gray-100">
                            {items.map((item) => (
                                <li key={item.id} className="p-6 flex flex-col sm:flex-row items-center gap-6 hover:bg-gray-50/50 transition-colors">
                                    <div className="flex-shrink-0 w-24 h-24 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                        {item.product.image_url ? (
                                            <img
                                                src={item.product.image_url}
                                                alt={item.product.name}
                                                className="w-full h-full object-cover object-center"
                                            />
                                        ) : (
                                            <div className="bg-gray-200 w-full h-full flex items-center justify-center text-gray-400">
                                                <ShoppingBag className="w-8 h-8" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 flex flex-col justify-between self-stretch min-w-0 text-center sm:text-left">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 mb-1">
                                                <Link to={`/product/${item.product.id}`} className="hover:text-primary-600 transition-colors">
                                                    {item.product.name}
                                                </Link>
                                            </h3>
                                            <p className="text-sm text-gray-500">{item.product.sku || 'SKU: Unknown'}</p>
                                        </div>
                                        <div className="mt-4 flex items-center justify-between sm:justify-start gap-6">
                                            <p className="text-lg font-bold text-gray-900">
                                                ₹{item.product.price.toFixed(2)}
                                            </p>

                                            {/* Mobile Quantity Control (visible on small screens) */}
                                            <div className="flex sm:hidden items-center border border-gray-300 rounded-lg">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                                                    disabled={item.quantity <= 1}
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                                <span className="px-2 text-sm font-medium text-gray-900">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="p-2 text-gray-500 hover:text-gray-700"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Desktop Actions */}
                                    <div className="flex flex-col items-end justify-between self-stretch gap-4">
                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors"
                                            title="Remove item"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>

                                        <div className="hidden sm:flex items-center border border-gray-300 rounded-lg bg-white">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                className="p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-50 rounded-l-lg transition-colors disabled:opacity-50"
                                                disabled={item.quantity <= 1}
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="px-4 py-1 text-sm font-bold text-gray-900 border-x border-gray-100 min-w-[3rem] text-center">
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-50 rounded-r-lg transition-colors"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-4 mt-8 lg:mt-0">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
                        <h2 className="text-lg font-bold text-gray-900 mb-6 font-display">Order Summary</h2>

                        <dl className="space-y-4 text-sm text-gray-600">
                            <div className="flex justify-between pb-4 border-b border-gray-100">
                                <dt>Subtotal ({items.reduce((acc, item) => acc + item.quantity, 0)} items)</dt>
                                <dd className="font-bold text-gray-900">₹{cartTotal.toFixed(2)}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt>Shipping</dt>
                                <dd className="text-gray-500 italic">Calculated at checkout</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt>Tax</dt>
                                <dd className="text-gray-500 italic">Calculated at checkout</dd>
                            </div>
                            <div className="pt-4 flex justify-between items-center text-base font-bold text-gray-900 border-t border-gray-100 mt-4">
                                <dt>Total</dt>
                                <dd className="text-2xl text-primary-600">₹{cartTotal.toFixed(2)}</dd>
                            </div>
                        </dl>

                        <div className="mt-8 space-y-4">
                            <Link
                                to="/checkout"
                                className="w-full flex items-center justify-center px-6 py-4 border border-transparent rounded-xl shadow-lg text-base font-bold text-white bg-primary-600 hover:bg-primary-700 hover:shadow-primary-500/25 transition-all duration-200 group"
                            >
                                Proceed to Checkout
                                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>

                            <Link
                                to="/shop"
                                className="w-full flex items-center justify-center px-6 py-3 border border-gray-200 rounded-xl text-base font-bold text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                            >
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
