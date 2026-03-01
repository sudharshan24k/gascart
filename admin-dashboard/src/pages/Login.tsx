import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/auth.service';

const AdminWarningBanner = () => (
    <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '14px',
        background: '#fffbea',
        border: '1.5px solid #f5c518',
        borderRadius: '10px',
        padding: '16px 20px',
        marginTop: '20px',
        boxShadow: '0 2px 8px rgba(245,197,24,0.10)',
    }}>
        <span style={{ fontSize: '32px', lineHeight: 1, flexShrink: 0 }}>⚠️</span>
        <div style={{ fontSize: '13.5px', color: '#3d2c00', lineHeight: '1.7' }}>
            <strong style={{ fontSize: '14px', display: 'block', marginBottom: '4px' }}>
                As you are logging in as an Admin, note that
            </strong>
            <ol style={{ margin: 0, paddingLeft: '18px' }}>
                <li>Your actions in the portal is getting logged</li>
                <li>You shall not make unauthorised changes</li>
                <li>Every product &amp; people enrolment &amp; status changes are formally approved</li>
            </ol>
        </div>
    </div>
);

const AdminWarningModal = ({ onConfirm }: { onConfirm: () => void }) => (
    <div style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.45)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    }}>
        <div style={{
            background: '#fff',
            borderRadius: '14px',
            padding: '32px 36px',
            maxWidth: '460px',
            width: '90%',
            boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
            textAlign: 'center',
        }}>
            <div style={{ fontSize: '52px', marginBottom: '12px' }}>⚠️</div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a1a', marginBottom: '8px' }}>
                Logged in successfully
            </h2>
            <p style={{ fontSize: '14px', color: '#555', marginBottom: '16px', lineHeight: 1.6 }}>
                As you are logging in as an Admin, note that
            </p>
            <ol style={{
                textAlign: 'left', fontSize: '13.5px',
                color: '#333', lineHeight: '1.9',
                paddingLeft: '20px', marginBottom: '24px',
            }}>
                <li>Your actions in the portal is getting logged</li>
                <li>You shall not make unauthorised changes</li>
                <li>Every product &amp; people enrolment &amp; status changes are formally approved</li>
            </ol>
            <button
                onClick={onConfirm}
                style={{
                    background: '#1a4731',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '7px',
                    padding: '10px 32px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    width: '100%',
                    letterSpacing: '0.3px',
                }}
            >
                I Understand, Proceed
            </button>
        </div>
    </div>
);

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    useEffect(() => {
        if (location.state?.error) {
            setError(location.state.error);
        }
    }, [location]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        try {
            // Hardcoded admin credentials check
            if (email === 'admin@admin.com' && password === 'admin') {
                console.log('Logging in with hardcoded admin credentials');
                localStorage.setItem('admin_logged_in', 'true');
                setShowSuccessModal(true);
                return;
            }

            await authService.signIn(email, password);
            setShowSuccessModal(true);
        } catch (err: any) {
            setError(err.message || 'Failed to login');
        } finally {
            setLoading(false);
        }
    };

    const handleModalConfirm = () => {
        setShowSuccessModal(false);
        navigate('/');
    };

    return (
        <>
            {showSuccessModal && <AdminWarningModal onConfirm={handleModalConfirm} />}
            <div className="min-h-[60vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div>
                        <h2 className="mt-6 text-center text-3xl font-display font-bold text-gray-900">Sign in to your account</h2>
                    </div>
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm text-center">
                                {error}
                            </div>
                        )}
                        <div className="rounded-md shadow-sm -space-y-px">
                            <div>
                                <label htmlFor="email-address" className="sr-only">Email address</label>
                                <input id="email-address" name="email" type="email" autoComplete="email" required className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm" placeholder="Email address" />
                            </div>
                            <div>
                                <label htmlFor="password" className="sr-only">Password</label>
                                <input id="password" name="password" type="password" autoComplete="current-password" required className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm" placeholder="Password" />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                            >
                                {loading ? 'Signing in...' : 'Sign in'}
                            </button>
                        </div>
                    </form>

                    <AdminWarningBanner />
                </div>
            </div>
        </>
    );
};

export default Login;
