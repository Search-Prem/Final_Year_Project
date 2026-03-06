import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthService from '../services/auth.service';
import { Lock, User, ArrowRight, Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        if (password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await AuthService.login(username, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid username or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-[#020617] px-6 py-12 relative overflow-hidden text-white">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse-soft" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse-soft" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative z-10 w-full max-w-[440px]"
            >
                {/* Logo Area */}
                <div className="flex flex-col items-center mb-10">
                    <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-600/20 mb-4 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                        <ShieldCheck className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-extrabold text-white tracking-tight">Next Gen Cloud Security using Pell-Based RSA with Homomorphic Encryption</h1>
                </div>

                <div className="glass rounded-[2rem] p-10 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />

                    <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
                    <p className="text-white/80 text-sm mb-8">Secure access to your homomorphic vault</p>

                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="p-4 mb-6 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl flex items-start gap-3"
                            >
                                <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleLogin} className="space-y-6">
                        {/* Username Field */}
                        <div className="space-y-2 group">
                            <label className="text-xs font-bold text-white uppercase tracking-widest px-1 group-focus-within:text-indigo-400 transition-colors">
                                Identity Handle
                            </label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-slate-950/50 border border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-white placeholder-slate-600 transition-all"
                                    placeholder="Enter your username"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2 group">
                            <label className="text-xs font-bold text-white uppercase tracking-widest px-1 group-focus-within:text-indigo-400 transition-colors">
                                Access Secret
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-12 py-4 bg-slate-950/50 border border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-white placeholder-slate-600 transition-all font-mono"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-all"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full relative group overflow-hidden py-4 bg-indigo-600 rounded-2xl font-bold text-white shadow-2xl shadow-indigo-600/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Authenticating Vault...</span>
                                </>
                            ) : (
                                <>
                                    <span>Establish Connection</span>
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-10 pt-8 border-t border-slate-800 text-center">
                        <p className="text-white text-sm">
                            New to Pell-RSA?{' '}
                            <Link to="/register" className="text-white hover:text-indigo-400 font-bold underline-offset-4 hover:underline transition-all">
                                Create Identity
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Footer Security Note */}
                <div className="mt-8 flex items-center justify-center gap-2 text-[10px] text-white uppercase tracking-widest">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    AES-256 Wrapped Transport Protocol Enabled
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
