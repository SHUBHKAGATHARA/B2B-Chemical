'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { Beaker, Lock, Mail, ArrowRight, Loader2, FlaskConical, TestTube } from 'lucide-react';


export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const trimmedEmail = email.trim();
            const trimmedPassword = password.trim();
            
            if (!trimmedEmail || !trimmedPassword) {
                throw new Error('Email and password are required');
            }
            
            if (trimmedPassword.length < 6) {
                throw new Error('Password must be at least 6 characters');
            }

            await apiClient.login(trimmedEmail, trimmedPassword);
            
            // Wait a bit longer for the cookie to be properly set by the browser
            // This helps prevent "Session Expired" errors due to race conditions
            await new Promise(resolve => setTimeout(resolve, 300));
            
            // Use router.push with a full page reload to ensure cookies are read fresh
            window.location.href = '/dashboard';
        } catch (err: any) {
            console.error('Login failed:', err);
            // Don't show "Session expired" error during login attempt
            let errorMessage = err?.message || err?.error?.message || 'An error occurred during login. Please try again.';
            if (errorMessage.toLowerCase().includes('session expired')) {
                errorMessage = 'Login failed. Please try again.';
            }
            setError(errorMessage);
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen">
            {/* Left Side - Chemical Theme */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 relative overflow-hidden">
                {/* Floating Particles */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-20 left-20 w-32 h-32 bg-white bg-opacity-10 rounded-full animate-float"></div>
                    <div className="absolute top-40 right-32 w-24 h-24 bg-white bg-opacity-10 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
                    <div className="absolute bottom-32 left-40 w-28 h-28 bg-white bg-opacity-10 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
                    <div className="absolute bottom-20 right-20 w-20 h-20 bg-white bg-opacity-10 rounded-full animate-float" style={{ animationDelay: '1.5s' }}></div>
                </div>

                {/* Content */}
                <div className="relative z-10 flex items-center justify-center w-full px-8">
                    <div className="text-center text-white max-w-xl">
                        {/* Logo */}
                        <div className="flex justify-center mb-12 animate-slideInLeft">
                            <div className="relative w-32 h-32">
                                <Beaker className="w-full h-full drop-shadow-2xl" />
                                <div className="absolute -top-2 -right-2">
                                    <TestTube className="w-16 h-16 text-emerald-200 animate-float" />
                                </div>
                                <div className="absolute -bottom-2 -left-2">
                                    <FlaskConical className="w-16 h-16 text-emerald-200 animate-float" style={{ animationDelay: '0.5s' }} />
                                </div>
                            </div>
                        </div>

                        <h1 className="text-5xl font-bold mb-3 animate-slideInLeft">
                            B2B Chemical
                        </h1>
                        <h2 className="text-3xl font-bold mb-6 animate-slideInLeft">
                            Management System
                        </h2>
                        <p className="text-xl text-emerald-100 mb-8 animate-slideInLeft max-w-lg mx-auto">
                            Streamline your chemical distribution network with our modern, secure platform
                        </p>
                        
                        {/* Decorative tubes */}
                        <div className="flex gap-6 justify-center mt-12">
                            {[...Array(3)].map((_, i) => (
                                <div
                                    key={i}
                                    className="animate-float backdrop-blur-sm bg-white bg-opacity-15 rounded-full border border-white border-opacity-20"
                                    style={{ 
                                        width: '70px',
                                        height: `${100 + i * 30}px`,
                                        animationDelay: `${i * 0.5}s`,
                                        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-gradient-to-br from-gray-50 to-emerald-50">
                <div className="w-full max-w-md animate-slideInRight">
                    <div className="glass rounded-2xl shadow-2xl p-8 lg:p-10">
                        <div className="mb-8 text-center">
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">
                                Welcome Back
                            </h2>
                            <p className="text-gray-600">
                                Sign in to access your dashboard
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Email Field */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="email"
                                        className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
                                        placeholder="your@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="password"
                                        className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded animate-fadeIn">
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm text-red-800">{error}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-3.5 px-6 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl font-semibold shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 transition-all hover:shadow-xl ${loading ? 'opacity-60 cursor-not-allowed' : 'hover:-translate-y-0.5'}`}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Signing in...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Sign In</span>
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Footer */}
                        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                            <p className="text-xs text-gray-500 flex items-center justify-center gap-2">
                                <span>🔒</span>
                                <span>Secure chemical distribution platform</span>
                            </p>
                        </div>
                    </div>

                    {/* Demo Credentials */}
                    <div className="mt-6 p-5 bg-emerald-50 border border-emerald-200 rounded-xl">
                        <p className="font-bold text-emerald-800 mb-3 flex items-center gap-2 text-sm">
                            <span>📋</span>
                            <span>Demo Credentials</span>
                        </p>
                        <div className="space-y-2 text-sm text-emerald-700">
                            <p>
                                <strong className="font-semibold">Admin:</strong> admin@system.com / Admin@123
                            </p>
                            <p>
                                <strong className="font-semibold">Distributor:</strong> dist1@company.com / Dist@123
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
