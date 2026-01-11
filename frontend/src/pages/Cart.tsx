import { useCart } from '../context/CartContext';
import { Trash2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Cart = () => {
    const { state, dispatch } = useCart();

    if (state.items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
                <p className="text-gray-600 mb-8">Looks like you haven't added anything yet.</p>
                <Link to="/shop" className="text-primary-600 font-medium hover:underline">Start Shopping</Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-3xl font-display font-bold mb-8">Your Cart</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-6">
                    {state.items.map((item) => (
                        <div key={item.id} className="flex gap-6 p-4 bg-white rounded-xl shadow-sm">
                            <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-grow flex flex-col justify-between">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-semibold text-lg">{item.name}</h3>
                                    <button
                                        onClick={() => dispatch({ type: 'REMOVE_ITEM', payload: item.id })}
                                        className="text-gray-400 hover:text-red-500"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="flex justify-between items-end">
                                    <div className="text-gray-600">Qty: {item.quantity}</div>
                                    <div className="font-bold">${(item.price * item.quantity).toFixed(2)}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="lg:col-span-1">
                    <div className="bg-gray-50 p-6 rounded-2xl sticky top-24">
                        <h3 className="text-xl font-bold mb-6">Order Summary</h3>
                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="font-medium">${state.total.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Shipping</span>
                                <span className="text-green-600 font-medium">Free</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Tax</span>
                                <span className="font-medium">$0.00</span>
                            </div>
                            <div className="border-t border-gray-200 pt-4 flex justify-between">
                                <span className="font-bold text-lg">Total</span>
                                <span className="font-bold text-lg text-primary-600">${state.total.toFixed(2)}</span>
                            </div>
                        </div>
                        <Link to="/checkout" className="w-full bg-primary hover:bg-primary-dark text-white py-4 rounded-xl font-bold transition-colors flex items-center justify-center space-x-2 shadow-lg">
                            <span>Proceed to Checkout</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
