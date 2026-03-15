import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
    Lock, CreditCard, CheckCircle2, ShieldCheck,
    Loader2, MapPin, Plus, Wallet, ArrowLeft, ArrowRight
} from 'lucide-react';
import { api } from '../services/api';
import { createRazorpayPayment } from '../services/razorpay.service';
import { motion, AnimatePresence } from 'framer-motion';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const Checkout: React.FC = () => {
    const { items, loading, cartTotal } = useCart();
    const { session } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Shipping, 2: Payment

    // Form State
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        zip_code: '',
        country: 'India', // Default to India for Razorpay context usually
        phone: ''
    });
    const [addresses, setAddresses] = useState<any[]>([]);
    const [loadingAddresses, setLoadingAddresses] = useState(true);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [showNewAddressForm, setShowNewAddressForm] = useState(false);
    const [saveAddress, setSaveAddress] = useState(true); // Default to saving new addresses
    const [processingOrder, setProcessingOrder] = useState(false);

    // Validation helpers
    const isValidZip = (v: string) => /^[1-9][0-9]{5}$/.test(v.trim());
    const isValidPhone = (v: string) => /^(\+91)?[6-9][0-9]{9}$/.test(v.replace(/\s/g, ''));

    // Calculate Totals
    const subtotal = cartTotal;
    const tax = subtotal * 0.18;
    const grandTotal = subtotal + tax;
    const advancePayable = grandTotal * 0.5;

    useEffect(() => {
        if (!session) {
            navigate('/login?redirect=/checkout', { replace: true });
            return;
        }
        if (!loading && items.length === 0) {
            navigate('/cart');
            return;
        }
        fetchAddresses();
    }, [items, loading, navigate, session]);

    const fetchAddresses = async () => {
        if (!session) {
            setLoadingAddresses(false);
            return;
        }
        try {
            const res = await api.users.addresses.list();
            if (res.status === 'success') {
                setAddresses(res.data);
                const defaultAddr = res.data.find((a: any) => a.is_default);
                if (defaultAddr) {
                    applyAddress(defaultAddr);
                } else if (res.data.length > 0) {
                    // If no default, show list but don't select any automatically yet, or select first?
                    // Let's not auto-select to force user choice, or select first for convenience.
                    // For now, let's not auto-fill form, just show list.
                } else {
                    setShowNewAddressForm(true);
                }
            } else {
                setShowNewAddressForm(true);
            }
        } catch (err) {
            console.error('Failed to fetch addresses', err);
            showToast('Failed to load saved addresses.', 'error');
        } finally {
            setLoadingAddresses(false);
        }
    };

    const applyAddress = (addr: any) => {
        setSelectedAddressId(addr.id);
        setShowNewAddressForm(false);
        setFormData({
            full_name: addr.full_name || '',
            email: formData.email, // Keep current email if set, or from session
            address_line1: addr.address_line1 || '',
            address_line2: addr.address_line2 || '',
            city: addr.city || '',
            state: addr.state || '',
            zip_code: addr.postal_code || '',
            country: addr.country || 'India',
            phone: addr.phone || ''
        });
    };

    const handleNewAddressClick = () => {
        setSelectedAddressId(null);
        setShowNewAddressForm(true);
        setFormData(prev => ({
            ...prev,
            full_name: '',
            address_line1: '',
            address_line2: '',
            city: '',
            state: '',
            zip_code: '',
            phone: ''
        }));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleContinueToPayment = async () => {
        if (!formData.address_line1 || !formData.city || !formData.state || !formData.zip_code || !formData.phone) {
            showToast('Please complete all shipping details.', 'error');
            return;
        }
        if (!isValidZip(formData.zip_code)) {
            showToast('Please enter a valid 6-digit PIN code.', 'error');
            return;
        }
        if (!isValidPhone(formData.phone)) {
            showToast('Please enter a valid 10-digit mobile number.', 'error');
            return;
        }

        if (showNewAddressForm && saveAddress) {
            try {
                // Determine label if not provided
                const label = formData.full_name ? `${formData.full_name}'s Address` : 'Shipping Address';
                await api.users.addresses.add({
                    ...formData,
                    country: 'India', // Ensure country is set
                    label: label
                });
                showToast('Address saved successfully for future use.', 'success');
                // Could refresh addresses here, but since we are moving to payment, not strictly necessary 
                // unless user goes back.
                fetchAddresses(); // Keep it synced just in case
            } catch (err) {
                console.error('Failed to save address', err);
                showToast('Address could not be saved to profile, but proceeding to payment...', 'info');
            }
        }
        setStep(2);
    };

    const handlePlaceOrder = async () => {
        if (!formData.address_line1 || !formData.city || !formData.state || !formData.zip_code || !formData.phone) {
            showToast('Please complete all shipping details.', 'error');
            setStep(1);
            return;
        }

        setProcessingOrder(true);
        try {
            // 1. Create Razorpay order on backend
            const orderResponse = await api.payments.createOrder({
                items: items.map(item => ({
                    id: item.product_id,
                    name: item.product?.name || 'Product',
                    // Must match display formula exactly: vendor_price ?? variant price ?? product price
                    price: item.vendor_price ?? item.selected_variant?.price ?? item.product?.price ?? 0,
                    quantity: item.quantity,
                    image: item.product?.image_url || '',
                    selected_variant: item.selected_variant,
                    vendor_id: item.vendor_id,
                    vendor_price: item.vendor_price
                })),
                shippingDetails: formData,
                billingDetails: formData // Assuming same for simplicity
            });

            if (!orderResponse.success) throw new Error(orderResponse.error || 'Failed to create order');

            const { razorpayOrderId, amount, keyId, orderId } = orderResponse;

            // 2. Open Razorpay checkout modal
            await createRazorpayPayment({
                keyId: keyId,
                orderId: razorpayOrderId,
                amount: amount,
                currency: 'INR',
                customerName: session?.user?.user_metadata?.full_name || formData.full_name,
                customerEmail: session?.user?.email || formData.email,
                customerContact: formData.phone,
                onSuccess: async (response) => {
                    // 3. Verify payment on backend
                    try {
                        const verifyResponse = await api.payments.verifyPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            order_id: orderId
                        });

                        if (verifyResponse.success) {
                            showToast('Payment successful! Redirecting...', 'success');
                            navigate(`/order-success?orderId=${orderId}`);
                        } else {
                            if (verifyResponse.diagnostics) {
                                console.log('--- Backend Diagnostic Logs ---');
                                verifyResponse.diagnostics.forEach((log: string) => console.log(log));
                                console.log('------------------------------');
                            }
                            throw new Error(verifyResponse.error || 'Payment verification failed');
                        }
                    } catch (verifyError: any) {
                        console.error('Verification error:', verifyError);
                        showToast(verifyError.message || 'Payment verification failed. Please contact support.', 'error');
                        setProcessingOrder(false);
                    }
                },
                onFailure: (error) => {
                    console.error('Payment failed:', error);
                    showToast('Payment failed. Please try again.', 'error');
                    setProcessingOrder(false);
                },
                onDismiss: () => setProcessingOrder(false)
            });

        } catch (error: any) {
            console.error('Order creation error:', error);
            showToast(error.message || 'Failed to create order', 'error');
            setProcessingOrder(false);
        }
    };

    if (loading) return <div className="min-h-screen pt-32 flex justify-center"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;

    return (
        <div className="min-h-screen pt-28 pb-24 bg-neutral-50">
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                    <div>
                        <Link to="/cart" className="inline-flex items-center text-neutral-500 hover:text-primary mb-2 transition-colors font-medium text-sm">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Cart
                        </Link>
                        <h1 className="text-3xl md:text-4xl font-display font-bold text-neutral-900">Secure Checkout</h1>
                    </div>

                    <div className="flex items-center gap-2 text-sm font-bold text-green-600 bg-green-50 px-4 py-2 rounded-full border border-green-100">
                        <ShieldCheck className="w-5 h-5" /> SSL Encrypted Transaction
                    </div>
                </div>

                <div className="grid lg:grid-cols-12 gap-8 lg:gap-16 items-start">
                    {/* Left Column: Checkout Steps */}
                    <div className="lg:col-span-8 space-y-8">

                        {/* Step 1: Shipping */}
                        <div className={`bg-white p-8 md:p-10 rounded-[40px] border transition-all duration-300 ${step === 1 ? 'border-primary ring-4 ring-primary/5 shadow-xl' : 'border-neutral-100 md:opacity-60 grayscale-[0.5]'}`}>
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-bold text-neutral-900 flex items-center gap-4">
                                    <span className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-black ${step === 1 ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-400'}`}>1</span>
                                    Shipping Details
                                </h2>
                                {step > 1 && (
                                    <button onClick={() => setStep(1)} className="text-primary font-bold text-sm hover:underline">Edit</button>
                                )}
                            </div>

                            <AnimatePresence mode='wait'>
                                {step === 1 && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                    >
                                        <div className="grid md:grid-cols-2 gap-4 mb-8">
                                            {loadingAddresses ? (
                                                <>
                                                    <div className="h-48 bg-neutral-100 animate-pulse rounded-[24px]" />
                                                    <div className="h-48 bg-neutral-100 animate-pulse rounded-[24px]" />
                                                </>
                                            ) : (
                                                <>
                                                    {addresses.map((addr) => (
                                                        <button
                                                            key={addr.id}
                                                            onClick={() => applyAddress(addr)}
                                                            className={`text-left p-6 rounded-[24px] border-2 transition-all group relative overflow-hidden ${selectedAddressId === addr.id ? 'bg-white border-primary shadow-xl ring-2 ring-primary/10' : 'bg-neutral-50 border-transparent hover:border-primary/50 hover:bg-white hover:shadow-lg'}`}
                                                        >
                                                            <div className="flex items-center gap-2 mb-3">
                                                                <MapPin className={`w-5 h-5 ${selectedAddressId === addr.id ? 'text-primary' : 'text-neutral-400'}`} />
                                                                <span className={`font-bold ${selectedAddressId === addr.id ? 'text-neutral-900' : 'text-neutral-600'}`}>{addr.label || 'Saved Address'}</span>
                                                                {selectedAddressId === addr.id && <CheckCircle2 className="w-5 h-5 text-primary ml-auto" />}
                                                            </div>
                                                            <p className="font-medium text-neutral-900 mb-1">{addr.full_name}</p>
                                                            <p className="text-sm text-neutral-500 leading-relaxed mb-4">
                                                                {addr.address_line1}, {addr.city}, {addr.state} - {addr.postal_code}
                                                            </p>
                                                        </button>
                                                    ))}

                                                    <button
                                                        onClick={handleNewAddressClick}
                                                        className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-[24px] transition-all gap-3 min-h-[180px] ${showNewAddressForm ? 'border-primary bg-primary/5 text-primary' : 'border-neutral-200 text-neutral-400 hover:text-primary hover:border-primary hover:bg-primary/5'}`}
                                                    >
                                                        <Plus className="w-8 h-8" />
                                                        <span className="font-bold text-sm">Add New Address</span>
                                                    </button>
                                                </>
                                            )}
                                        </div>

                                        {(showNewAddressForm || addresses.length === 0) && (
                                            <div className="grid md:grid-cols-2 gap-6 bg-neutral-50 p-6 rounded-3xl border border-neutral-100 mb-6 relative overflow-hidden">
                                                <div className="md:col-span-2 flex items-center justify-between mb-2">
                                                    <span className="text-sm font-bold text-neutral-900">Enter Address Details</span>
                                                    <div className="flex items-center gap-2">
                                                        <input 
                                                            type="checkbox" 
                                                            id="saveAddress" 
                                                            checked={saveAddress} 
                                                            onChange={(e) => setSaveAddress(e.target.checked)}
                                                            className="w-4 h-4 text-primary bg-white border-neutral-300 rounded focus:ring-primary/50"
                                                        />
                                                        <label htmlFor="saveAddress" className="text-xs font-bold text-neutral-600 cursor-pointer select-none">Save this address</label>
                                                    </div>
                                                </div>
                                                <div className="md:col-span-2">
                                                    <Input
                                                        label="Full Name"
                                                        name="full_name"
                                                        required
                                                        value={formData.full_name}
                                                        onChange={handleInputChange}
                                                        placeholder="Recipient Name"
                                                    />
                                                </div>
                                                <div className="md:col-span-2">
                                                    <Input
                                                        label="Address Line 1"
                                                        name="address_line1"
                                                        required
                                                        value={formData.address_line1}
                                                        onChange={handleInputChange}
                                                        placeholder="House/Flat No, Street Name"
                                                    />
                                                </div>
                                                <div className="md:col-span-2">
                                                    <Input
                                                        label="Address Line 2 (Optional)"
                                                        name="address_line2"
                                                        value={formData.address_line2}
                                                        onChange={handleInputChange}
                                                        placeholder="Landmark, Area, etc."
                                                    />
                                                </div>
                                                <div>
                                                    <Input
                                                        label="City"
                                                        name="city"
                                                        required
                                                        value={formData.city}
                                                        onChange={handleInputChange}
                                                        placeholder="City"
                                                    />
                                                </div>
                                                <div>
                                                    <Input
                                                        label="State"
                                                        name="state"
                                                        required
                                                        value={formData.state}
                                                        onChange={handleInputChange}
                                                        placeholder="State"
                                                    />
                                                </div>
                                                <div>
                                                    <Input
                                                        label="Zip Code"
                                                        name="zip_code"
                                                        required
                                                        value={formData.zip_code}
                                                        onChange={handleInputChange}
                                                        placeholder="Pin Code"
                                                    />
                                                    {formData.zip_code && !isValidZip(formData.zip_code) && (
                                                        <p className="text-xs text-red-500 font-semibold mt-1.5 ml-1">Enter a valid 6-digit PIN code</p>
                                                    )}
                                                </div>
                                                <div>
                                                    <Input
                                                        label="Phone Number"
                                                        name="phone"
                                                        required
                                                        value={formData.phone}
                                                        onChange={handleInputChange}
                                                        placeholder="+91 00000 00000"
                                                    />
                                                    {formData.phone && !isValidPhone(formData.phone) && (
                                                        <p className="text-xs text-red-500 font-semibold mt-1.5 ml-1">Enter a valid 10-digit mobile number</p>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        <div className="pt-6 border-t border-dashed border-neutral-200">
                                            <Button
                                                onClick={handleContinueToPayment}
                                                disabled={
                                                    !formData.address_line1 || !formData.city || !formData.state ||
                                                    !formData.zip_code || !isValidZip(formData.zip_code) ||
                                                    !formData.phone || !isValidPhone(formData.phone)
                                                }
                                                size="lg"
                                                icon={<ArrowRight className="w-5 h-5" />}
                                                iconPosition="right"
                                                className="w-full md:w-auto"
                                            >
                                                Continue to Payment
                                            </Button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Step 2: Payment */}
                        <div className={`bg-white p-8 md:p-10 rounded-[40px] border transition-all duration-300 ${step === 2 ? 'border-primary ring-4 ring-primary/5 shadow-xl' : 'border-neutral-100 opacity-60 grayscale-[0.5]'}`}>
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-bold text-neutral-900 flex items-center gap-4">
                                    <span className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-black ${step === 2 ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-400'}`}>2</span>
                                    Payment Method
                                </h2>
                                <Lock className="w-5 h-5 text-neutral-400" />
                            </div>

                            <AnimatePresence>
                                {step === 2 && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="space-y-6"
                                    >
                                        <div className="p-6 bg-gradient-to-br from-neutral-50 to-white rounded-3xl border border-neutral-200 shadow-sm relative overflow-hidden group hover:border-primary/30 transition-all cursor-pointer ring-2 ring-primary/10">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-all"></div>
                                            <div className="flex items-center gap-6 relative z-10">
                                                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center border border-neutral-100">
                                                    <CreditCard className="w-8 h-8 text-primary" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-neutral-900 text-lg">Online Payment</h4>
                                                    <p className="text-sm text-neutral-500 font-medium">Credit/Debit Card, UPI, NetBanking</p>
                                                </div>
                                                <CheckCircle2 className="w-8 h-8 text-green-500" />
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-100 text-green-800 text-sm font-bold">
                                            <ShieldCheck className="w-5 h-5" />
                                            Safe & Secure Payment via Razorpay
                                        </div>

                                        <Button
                                            onClick={handlePlaceOrder}
                                            loading={processingOrder}
                                            fullWidth
                                            size="lg"
                                            className="text-lg py-6"
                                        >
                                            Pay Advance ₹{advancePayable.toLocaleString()} & Place Order
                                        </Button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                    </div>

                    {/* Right Column: Order Summary */}
                    <div className="lg:col-span-4">
                        <div className="bg-white p-8 rounded-[40px] border border-neutral-100 shadow-lg sticky top-32">
                            <div className="flex items-center gap-2 mb-6 text-neutral-900">
                                <Wallet className="w-6 h-6 text-primary" />
                                <h3 className="font-display font-bold text-xl">Order Summary</h3>
                            </div>

                            <div className="space-y-4 mb-8 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                                {items.map((item) => (
                                    <div key={item.id} className="flex gap-4 p-3 bg-neutral-50 rounded-2xl border border-transparent hover:border-neutral-200 transition-colors">
                                        <div className="w-16 h-16 bg-white rounded-xl overflow-hidden flex-shrink-0 border border-neutral-100">
                                            <img src={item.product?.image_url || 'https://placehold.co/150x150?text=No+Image'} className="w-full h-full object-cover" alt={item.product?.name} />
                                        </div>
                                        <div className="flex-grow min-w-0">
                                            <h4 className="font-bold text-sm text-neutral-900 line-clamp-2 leading-tight mb-1">{item.product?.name}</h4>
                                            <div className="flex justify-between items-end">
                                                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-wider">Qty: {item.quantity}</span>
                                                <span className="text-sm font-bold text-neutral-900">₹{((item.vendor_price ?? item.selected_variant?.price ?? item.product?.price ?? 0) * item.quantity).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-3 pt-6 border-t border-neutral-100">
                                <div className="flex justify-between text-sm">
                                    <span className="text-neutral-500 font-medium">Subtotal</span>
                                    <span className="font-bold text-neutral-900">₹{subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-neutral-500 font-medium">Tax (18%)</span>
                                    <span className="font-bold text-neutral-900">₹{tax.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-dashed border-neutral-200">
                                <div className="flex justify-between items-end mb-2">
                                    <span className="font-black text-neutral-500 text-sm">Grand Total (excl. Shipping)</span>
                                    <span className="font-black text-neutral-900 text-lg">₹{grandTotal.toLocaleString()}</span>
                                </div>
                                
                                <div className="flex justify-between items-center mt-4 p-4 bg-primary/5 rounded-2xl border border-primary/20">
                                    <div>
                                        <span className="font-black text-primary text-lg block">Advance Payable Now</span>
                                        <span className="text-xs text-primary/70 font-bold block mt-1">50% of Grand Total</span>
                                    </div>
                                    <span className="font-black text-primary text-3xl">₹{advancePayable.toLocaleString()}</span>
                                </div>
                                
                                <p className="text-xs text-neutral-400 font-medium text-center mt-4">
                                    * Shipping will be calculated based on delivery location and volumetric weight, then added to your remaining balance.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
