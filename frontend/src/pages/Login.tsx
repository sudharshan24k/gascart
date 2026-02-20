import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { Leaf, Mail, Lock, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        try {
            await authService.signIn(email, password);
            navigate('/');
        } catch (err: any) {
            setError(err.message || 'Failed to login');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex text-neutral-800 font-sans">
            {/* Left Side - Image/Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-neutral-900 overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')] bg-cover bg-center opacity-40"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent"></div>

                <div className="relative z-10 w-full flex flex-col justify-between p-16 text-white">
                    <div>
                        <Link to="/" className="inline-flex items-center gap-3 group">
                            <div className="bg-success-500/20 backdrop-blur-md p-2 rounded-xl group-hover:scale-110 transition-transform">
                                <Leaf className="h-6 w-6 text-success-400" />
                            </div>
                            <span className="text-2xl font-bold tracking-tight font-display">Gascart</span>
                        </Link>
                    </div>

                    <div>
                        <blockquote className="space-y-6">
                            <div className="text-2xl font-display font-medium leading-relaxed">
                                "Gascart has revolutionized how we source bio-energy equipment. The efficiency and quality of their marketplace is unmatched."
                            </div>
                            <footer className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-neutral-700 flex items-center justify-center font-bold text-neutral-300">
                                    JD
                                </div>
                                <div>
                                    <div className="font-bold">John Doe</div>
                                    <div className="text-neutral-400 text-sm">Plant Manager, EcoFuel Inc.</div>
                                </div>
                            </footer>
                        </blockquote>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 bg-white relative">
                <div className="mx-auto w-full max-w-sm lg:w-96">
                    <div className="lg:hidden mb-10">
                        <Link to="/" className="inline-flex items-center gap-2">
                            <Leaf className="h-8 w-8 text-primary" />
                            <span className="text-2xl font-bold font-display text-neutral-900">Gascart</span>
                        </Link>
                    </div>

                    <div className="mb-10">
                        <h2 className="text-3xl font-bold font-display text-neutral-900 mb-2">Welcome Back</h2>
                        <p className="text-neutral-500">
                            Don't have an account?{' '}
                            <Link to="/signup" className="font-medium text-primary hover:text-primary-600 transition-colors">
                                Create a free account
                            </Link>
                        </p>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-sm font-medium flex items-center"
                            >
                                <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {error}
                            </motion.div>
                        )}

                        <div className="space-y-5">
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
                                        placeholder="name@company.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label htmlFor="password" className="block text-sm font-semibold text-neutral-700">Password</label>
                                    <Link to="/forgot-password" className="text-sm font-medium text-primary hover:text-primary-600 transition-colors">
                                        Forgot password?
                                    </Link>
                                </div>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete="current-password"
                                        required
                                        className="appearance-none block w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl leading-5 bg-neutral-50 text-neutral-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 font-medium sm:text-sm"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded cursor-pointer"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-neutral-600 cursor-pointer select-none">
                                Remember me for 30 days
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-primary/20 text-sm font-bold text-white bg-primary hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70 disabled:cursor-not-allowed transition-all transform active:scale-[0.98]"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin h-5 w-5" />
                            ) : (
                                <>
                                    Sign In <ArrowRight className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-gray-100">
                        <p className="text-xs text-center text-neutral-400">
                            By signing in, you agree to our <Link to="/terms" className="underline hover:text-neutral-600">Terms of Service</Link> and <Link to="/privacy" className="underline hover:text-neutral-600">Privacy Policy</Link>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
