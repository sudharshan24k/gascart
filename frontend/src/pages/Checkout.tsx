import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Lock, CreditCard, ChevronRight, CheckCircle2, ShieldCheck, Loader2, MapPin, Plus } from 'lucide-react';
import { api } from '../services/api';
import { motion } from 'framer-motion';

const Checkout: React.FC = () => {
    const { items, loading } = useCart();
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Shipping, 2: Payment

    // Form State
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        address_line1: '',
        city: '',
        state: '',
        zip_code: '',
        country: 'United States',
        phone: ''
    });
    const [addresses, setAddresses] = useState<any[]>([]);
    const [loadingAddresses, setLoadingAddresses] = useState(true);
    const [selectingSaved, setSelectingSaved] = useState(false);

    const [processingOrder, setProcessingOrder] = useState(false);

    // Calculate Totals
    const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const shippingCost = subtotal > 50000 ? 500 : 0; // Flat fee logic example or free
    const tax = subtotal * 0.08; // Mock tax 8%
    const total = subtotal + shippingCost + tax;
    const advancePayment = total * 0.5; // Lead Gen Commitment

    useEffect(() => {
        if (!loading && items.length === 0) {
            navigate('/cart');
        }
        fetchAddresses();
    }, [items, loading, navigate]);

    const fetchAddresses = async () => {
        try {
            const res = await api.users.addresses.list();
            if (res.status === 'success') {
                setAddresses(res.data);
                // Auto-fill with default address if exists
                const defaultAddr = res.data.find((a: any) => a.is_default);
                if (defaultAddr) {
                    applyAddress(defaultAddr);
                }
            }
        } catch (err) {
            console.error('Failed to fetch addresses', err);
        } finally {
            setLoadingAddresses(false);
        }
    };

    const applyAddress = (addr: any) => {
        setFormData({
            full_name: addr.full_name,
            email: formData.email, // Keep email if already entered
            address_line1: `${addr.address_line1}${addr.address_line2 ? ', ' + addr.address_line2 : ''}`,
            city: addr.city,
            state: addr.state,
            zip_code: addr.postal_code,
            country: addr.country,
            phone: addr.phone
        });
        setSelectingSaved(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePlaceOrder = async () => {
        setProcessingOrder(true);
        try {
            // Simulate Payment Gateway Delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Call API
            const res = await api.orders.create({
                shipping_address: formData,
                billing_address: formData, // Simplified for MVP
                payment_method: 'credit_card',
                // Backend calculates total based on cart, but we can send if verification needed
            });

            if (res.status === 'success') {
                // Determine how to clear cart. Context handles this automatically if backend deletes it?
                // Context reads from API. If backend clears cart, context.items needs refresh.
                // We reload page or trigger a fetch if context exposed it. 
                // Context doesn't expose refreshCart.
                // Let's do a window reload for now to ensure state sync as critical path MVP
                window.location.href = '/order-success';
            } else {
                alert('Order failed: ' + res.message);
            }
        } catch (err: any) {
            console.error('Checkout error:', err);
            alert('Checkout failed. Please try again.');
        } finally {
            setProcessingOrder(false);
        }
    };

    return (
        <div className="min-h-screen pt-32 pb-24 bg-gray-50">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Header */}
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-8 font-medium">
                    <Link to="/cart" className="hover:text-primary">Cart</Link>
                    <ChevronRight className="w-4 h-4" />
                    <span className="text-gray-900">Checkout</span>
                </div>

                <div className="grid lg:grid-cols-3 gap-12">
                    {/* Left Column: Form Steps */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Step 1: Shipping */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`bg-white p-8 rounded-[32px] border transition-all ${step === 1 ? 'border-primary ring-4 ring-primary/5 shadow-xl' : 'border-gray-100 opacity-60'}`}
                        >
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                                    <span className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm">1</span>
                                    Shipping Details
                                </h2>
                                <div className="flex items-center gap-3">
                                    {addresses.length > 0 && step === 1 && !selectingSaved && (
                                        <button
                                            onClick={() => setSelectingSaved(true)}
                                            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                                        >
                                            <MapPin className="w-3 h-3" /> Use Saved Address
                                        </button>
                                    )}
                                    {step > 1 && <CheckCircle2 className="w-6 h-6 text-green-500" />}
                                </div>
                            </div>

                            {step === 1 && selectingSaved ? (
                                <div className="space-y-4">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {addresses.map((addr) => (
                                            <button
                                                key={addr.id}
                                                onClick={() => applyAddress(addr)}
                                                className="text-left p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-primary hover:bg-white transition-all group"
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-full">{addr.label || 'Home'}</span>
                                                    {addr.is_default && <span className="text-[10px] font-bold text-gray-400">Default</span>}
                                                </div>
                                                <p className="font-bold text-gray-900 text-sm">{addr.full_name}</p>
                                                <p className="text-xs text-gray-500 line-clamp-1">{addr.address_line1}</p>
                                                <p className="text-xs text-gray-500">{addr.city}, {addr.state}</p>
                                            </button>
                                        ))}
                                        <Link
                                            to="/profile"
                                            className="flex flex-col items-center justify-center p-4 rounded-2xl border border-dashed border-gray-200 text-gray-400 hover:text-primary hover:border-primary hover:bg-primary/5 transition-all gap-2"
                                        >
                                            <Plus className="w-5 h-5" />
                                            <span className="text-xs font-bold">Add New Address</span>
                                        </Link>
                                    </div>
                                    <button
                                        onClick={() => setSelectingSaved(false)}
                                        className="text-xs font-bold text-gray-400 hover:text-gray-900"
                                    >
                                        ← Enter address manually
                                    </button>
                                </div>
                            ) : step === 1 && (
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Full Name</label>
                                        <input
                                            name="full_name" required
                                            value={formData.full_name} onChange={handleInputChange}
                                            className="w-full bg-gray-50 border-none rounded-xl p-4 font-bold outline-none focus:ring-2 focus:ring-primary/20"
                                            placeholder="Company or Contact Name"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Address</label>
                                        <input
                                            name="address_line1" required
                                            value={formData.address_line1} onChange={handleInputChange}
                                            className="w-full bg-gray-50 border-none rounded-xl p-4 font-bold outline-none focus:ring-2 focus:ring-primary/20"
                                            placeholder="Street Address, PO Box"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">City</label>
                                        <input
                                            name="city" required
                                            value={formData.city} onChange={handleInputChange}
                                            className="w-full bg-gray-50 border-none rounded-xl p-4 font-bold outline-none focus:ring-2 focus:ring-primary/20"
                                            placeholder="City"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">State / Province</label>
                                        <input
                                            name="state" required
                                            value={formData.state} onChange={handleInputChange}
                                            className="w-full bg-gray-50 border-none rounded-xl p-4 font-bold outline-none focus:ring-2 focus:ring-primary/20"
                                            placeholder="State"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Zip Code</label>
                                        <input
                                            name="zip_code" required
                                            value={formData.zip_code} onChange={handleInputChange}
                                            className="w-full bg-gray-50 border-none rounded-xl p-4 font-bold outline-none focus:ring-2 focus:ring-primary/20"
                                            placeholder="Zip / Postal"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Phone</label>
                                        <input
                                            name="phone" required
                                            value={formData.phone} onChange={handleInputChange}
                                            className="w-full bg-gray-50 border-none rounded-xl p-4 font-bold outline-none focus:ring-2 focus:ring-primary/20"
                                            placeholder="+1 (555) 000-0000"
                                        />
                                    </div>
                                    <div className="md:col-span-2 pt-4">
                                        <button
                                            onClick={() => setStep(2)}
                                            disabled={!formData.address_line1 || !formData.city} // Simple validation
                                            className="bg-gray-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Continue to Payment
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>

                        {/* Step 2: Payment */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className={`bg-white p-8 rounded-[32px] border transition-all ${step === 2 ? 'border-primary ring-4 ring-primary/5 shadow-xl' : 'border-gray-100 opacity-60'}`}
                        >
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                                    <span className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm">2</span>
                                    Secure Payment (50% Advance)
                                </h2>
                                <Lock className="w-5 h-5 text-gray-400" />
                            </div>

                            {step === 2 && (
                                <div className="space-y-6">
                                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center">
                                            <CreditCard className="w-6 h-6 text-primary" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900">Credit Card (Stripe Test)</h4>
                                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">Secure SSL Encrypted</p>
                                        </div>
                                        <div className="ml-auto text-green-500">
                                            <CheckCircle2 className="w-6 h-6" />
                                        </div>
                                    </div>

                                    {/* Mock Card Element */}
                                    <div className="space-y-4 opacity-50 pointer-events-none grayscale">
                                        <input className="w-full bg-gray-100 p-4 rounded-xl border border-gray-200 font-mono" value="**** **** **** 4242" readOnly />
                                        <div className="grid grid-cols-2 gap-4">
                                            <input className="w-full bg-gray-100 p-4 rounded-xl border border-gray-200" value="MM / YY" readOnly />
                                            <input className="w-full bg-gray-100 p-4 rounded-xl border border-gray-200" value="CVC" readOnly />
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-gray-100">
                                        <div className="flex items-center gap-2 mb-6">
                                            <ShieldCheck className="w-4 h-4 text-green-500" />
                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Payments processed securely by Stripe</span>
                                        </div>
                                        <button
                                            onClick={handlePlaceOrder}
                                            disabled={processingOrder}
                                            className="w-full bg-primary hover:bg-primary-dark text-white text-lg font-black py-5 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:transform-none"
                                        >
                                            {processingOrder ? (
                                                <Loader2 className="w-6 h-6 animate-spin" />
                                            ) : (
                                                <>Pay & Place Order</>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </div>

                    {/* Right Column: Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-lg sticky top-32">
                            <h3 className="font-bold text-xl text-gray-900 mb-6">Order Summary</h3>

                            <div className="space-y-4 mb-8 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                {items.map(item => (
                                    <div key={item.id} className="flex gap-4">
                                        <div className="w-16 h-16 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0">
                                            <img src={item.product?.image_url || 'https://via.placeholder.com/150'} className="w-full h-full object-cover" alt="" />
                                        </div>
                                        <div className="flex-grow">
                                            <h4 className="font-bold text-sm text-gray-900 line-clamp-1">{item.product?.name}</h4>
                                            <div className="flex justify-between mt-1">
                                                <span className="text-xs text-gray-500 font-bold">Qty: {item.quantity}</span>
                                                <span className="text-xs font-bold text-gray-900">${(item.product?.price * item.quantity).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-3 pt-6 border-t border-gray-100">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 font-medium">Subtotal</span>
                                    <span className="font-bold text-gray-900">${subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 font-medium">Shipping</span>
                                    <span className="font-bold text-gray-900">{shippingCost === 0 ? 'Free' : `$${shippingCost}`}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 font-medium">Tax (Est. 8%)</span>
                                    <span className="font-bold text-gray-900">${tax.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-dashed border-gray-200">
                                <div className="flex justify-between items-end mb-2">
                                    <span className="font-black text-gray-900 text-lg">Total</span>
                                    <span className="font-black text-gray-900 text-2xl">${total.toLocaleString()}</span>
                                </div>
                                <div className="bg-primary/10 p-4 rounded-xl flex justify-between items-center">
                                    <span className="text-xs font-black text-primary uppercase tracking-widest">Pay Today (50%)</span>
                                    <span className="text-lg font-bold text-primary">${advancePayment.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
