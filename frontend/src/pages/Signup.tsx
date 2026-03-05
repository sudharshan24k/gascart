import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { Leaf, User, Mail, Lock, Phone, ArrowRight, Loader2, Building2, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

const Signup = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [submittedEmail, setSubmittedEmail] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        const confirmPassword = formData.get('confirm_password') as string;
        const fullName = formData.get('full_name') as string;
        const phone = formData.get('phone') as string;
        const companyName = formData.get('company_name') as string;
        const businessDetails = formData.get('business_details') as string;

        // Indian Phone Regex: Starts with optional +91, then 6-9, then 9 digits
        const phoneRegex = /^(\+91[\-\s]?)?[6789]\d{9}$/;
        if (!phoneRegex.test(phone)) {
            setError('Please enter a valid Indian phone number (e.g., +91 9876543210)');
            setLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            await authService.signUp(email, password, {
                full_name: fullName,
                phone: phone,
                company_name: companyName,
                business_details: businessDetails
            });
            setSubmittedEmail(email);
            setSuccess(true);
        } catch (err: any) {
            setError(err.message || 'Failed to create account');
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4 relative overflow-hidden">
                {/* Background decorative elements */}
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')] bg-cover bg-center opacity-10"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-50 via-white/80 to-neutral-50"></div>

                {/* Modal Overlay */}
                <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 md:p-10 text-center relative border border-gray-100"
                    >
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Mail className="w-10 h-10 text-primary animate-pulse" />
                        </div>
                        <h2 className="text-3xl font-bold text-neutral-900 mb-3 font-display">Check Your Email</h2>
                        <p className="text-neutral-600 mb-2 leading-relaxed">
                            We've sent a verification link to:
                        </p>
                        <p className="font-semibold text-neutral-900 mb-8 bg-neutral-50 py-3 px-4 rounded-xl border border-neutral-100 break-all w-fit mx-auto">
                            {submittedEmail}
                        </p>
                        <p className="text-sm text-neutral-500 mb-8">
                            Please click the link in the email to verify your account and login. Sometimes it can end up in the spam folder!
                        </p>
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full bg-primary hover:bg-primary-600 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 transform active:scale-[0.98]"
                        >
                            Go to Login
                            <ArrowRight className="w-4 h-4 ml-1" />
                        </button>
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex text-neutral-800 font-sans">
            {/* Left Side - Image/Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-neutral-900 overflow-hidden order-1 lg:order-1">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')] bg-cover bg-center opacity-40"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent"></div>

                <div className="relative z-10 w-full flex flex-col justify-between p-16 text-white h-full">
                    <div>
                        <Link to="/" className="inline-flex items-center gap-3">
                            <div className="bg-white/10 backdrop-blur-md p-2 rounded-xl">
                                <Leaf className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-2xl font-bold tracking-tight font-display">Gascart</span>
                        </Link>
                    </div>

                    <div className="max-w-md">
                        <h2 className="text-4xl font-display font-bold mb-6">Join the Future of Sustainable Energy</h2>
                        <p className="text-lg text-neutral-300 leading-relaxed mb-8">
                            Create an account to access our marketplace, track orders, and get personalized recommendations for your bio-energy plant.
                        </p>
                        <div className="flex gap-4">
                            <div className="flex -space-x-3 overflow-hidden">
                                {[1, 2, 3, 4].map((i) => (
                                    <img key={i} className="inline-block h-10 w-10 rounded-full ring-2 ring-neutral-900" src={`https://randomuser.me/api/portraits/men/${i + 20}.jpg`} alt="" />
                                ))}
                            </div>
                            <div className="flex flex-col justify-center">
                                <span className="text-white font-bold">2,000+</span>
                                <span className="text-xs text-neutral-400">Industry Partners</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 bg-white relative order-2 lg:order-2 overflow-y-auto">
                <div className="mx-auto w-full max-w-lg">
                    <div className="lg:hidden mb-10">
                        <Link to="/" className="inline-flex items-center gap-2">
                            <Leaf className="h-8 w-8 text-primary" />
                            <span className="text-2xl font-bold font-display text-neutral-900">Gascart</span>
                        </Link>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-3xl font-bold font-display text-neutral-900 mb-2">Create an Account</h2>
                        <p className="text-neutral-500">
                            Already have an account?{' '}
                            <Link to="/login" className="font-medium text-primary hover:text-primary-600 transition-colors">
                                Sign in instead
                            </Link>
                        </p>
                    </div>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-sm font-medium flex items-center"
                            >
                                <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {error}
                            </motion.div>
                        )}

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <div>
                                <label htmlFor="full_name" className="block text-sm font-semibold text-neutral-700 mb-2">Full Name</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary">
                                        <User className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="full_name"
                                        name="full_name"
                                        type="text"
                                        required
                                        className="appearance-none block w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl leading-5 bg-neutral-50 text-neutral-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 font-medium sm:text-sm"
                                        placeholder="John Doe"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="phone" className="block text-sm font-semibold text-neutral-700 mb-2">Phone Number</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary">
                                        <Phone className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        autoComplete="tel"
                                        required
                                        className="appearance-none block w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl leading-5 bg-neutral-50 text-neutral-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 font-medium sm:text-sm"
                                        placeholder="+91 98765 43210"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-neutral-700 mb-2">Email Address</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="appearance-none block w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl leading-5 bg-neutral-50 text-neutral-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 font-medium sm:text-sm"
                                    placeholder="john@company.com"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <div>
                                <label htmlFor="company_name" className="block text-sm font-semibold text-neutral-700 mb-2">Company Name <span className="text-neutral-400 font-normal">(opt)</span></label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary">
                                        <Building2 className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="company_name"
                                        name="company_name"
                                        type="text"
                                        className="appearance-none block w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl leading-5 bg-neutral-50 text-neutral-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 font-medium sm:text-sm"
                                        placeholder="Business Name"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="business_details" className="block text-sm font-semibold text-neutral-700 mb-2">GST / Business Type <span className="text-neutral-400 font-normal">(opt)</span></label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary">
                                        <FileText className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="business_details"
                                        name="business_details"
                                        type="text"
                                        className="appearance-none block w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl leading-5 bg-neutral-50 text-neutral-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 font-medium sm:text-sm"
                                        placeholder="GST No."
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <div>
                                <label htmlFor="password" className="block text-sm font-semibold text-neutral-700 mb-2">Password</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        required
                                        className="appearance-none block w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl leading-5 bg-neutral-50 text-neutral-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 font-medium sm:text-sm"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="confirm_password" className="block text-sm font-semibold text-neutral-700 mb-2">Confirm Password</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="confirm_password"
                                        name="confirm_password"
                                        type="password"
                                        required
                                        className="appearance-none block w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl leading-5 bg-neutral-50 text-neutral-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 font-medium sm:text-sm"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-primary/20 text-sm font-bold text-white bg-primary hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70 disabled:cursor-not-allowed transition-all transform active:scale-[0.98]"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                                        Creating Account...
                                    </>
                                ) : (
                                    <>
                                        Create Account <ArrowRight className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </button>
                        </div>

                        <p className="text-xs text-center text-neutral-400 pt-4">
                            By creating an account, you agree to our <Link to="/terms" className="underline hover:text-neutral-600">Terms of Service</Link> and <Link to="/privacy" className="underline hover:text-neutral-600">Privacy Policy</Link>.
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Signup;
