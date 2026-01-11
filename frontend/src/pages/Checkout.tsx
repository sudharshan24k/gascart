import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useState } from 'react';

const Checkout = () => {
    const { state } = useCart();
    const [step] = useState(1);

    if (state.items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
                <Link to="/shop" className="text-primary-600 font-medium hover:underline">Start Shopping</Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-3xl font-display font-bold mb-8">Checkout</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div>
                    {/* Steps */}
                    <div className="flex space-x-4 mb-8">
                        <div className={`flex-1 border-b-2 pb-2 ${step >= 1 ? 'border-primary-600 text-primary-600' : 'border-gray-200 text-gray-400'}`}>
                            1. Shipping
                        </div>
                        <div className={`flex-1 border-b-2 pb-2 ${step >= 2 ? 'border-primary-600 text-primary-600' : 'border-gray-200 text-gray-400'}`}>
                            2. Payment
                        </div>
                    </div>

                    {/* Form */}
                    <form className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">First Name</label>
                                <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                                <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Address</label>
                            <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500" />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-1">
                                <label className="block text-sm font-medium text-gray-700">City</label>
                                <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500" />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-sm font-medium text-gray-700">State</label>
                                <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500" />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-sm font-medium text-gray-700">ZIP</label>
                                <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500" />
                            </div>
                        </div>

                        <div className="pt-6">
                            <button type="button" className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-800">
                                Continue to Payment
                            </button>
                        </div>
                    </form>
                </div>

                {/* Summary */}
                <div className="bg-gray-50 p-8 rounded-2xl h-fit">
                    <h3 className="text-xl font-bold mb-6">Order Summary</h3>
                    <div className="space-y-4">
                        {state.items.map(item => (
                            <div key={item.id} className="flex justify-between items-center">
                                <span className="text-gray-600">{item.name} x {item.quantity}</span>
                                <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                        <div className="border-t border-gray-200 pt-4 flex justify-between">
                            <span className="font-bold">Total</span>
                            <span className="font-bold text-primary-600">${state.total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
