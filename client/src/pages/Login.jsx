import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthService from '../services/auth.service';
import { Lock, User, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            await AuthService.login(username, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-900 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-[40%] -left-[20%] w-[70%] h-[70%] rounded-full bg-primary/20 blur-[120px]" />
                <div className="absolute top-[40%] -right-[20%] w-[70%] h-[70%] rounded-full bg-secondary/20 blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 w-full max-w-md p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl"
            >
                <div className="flex justify-center mb-6">
                    <div className="p-3 bg-gradient-to-tr from-primary to-secondary rounded-full shadow-lg shadow-primary/25">
                        <Lock className="w-8 h-8 text-white" />
                    </div>
                </div>

                <h2 className="text-3xl font-bold text-center text-white mb-2">Welcome Back</h2>
                <p className="text-slate-400 text-center mb-8">Sign in to your secure cloud vault</p>

                {error && (
                    <div className="p-3 mb-4 text-sm text-red-200 bg-red-500/20 border border-red-500/50 rounded-lg">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Username</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-white placeholder-slate-500 transition-all"
                                placeholder="Enter username"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-white placeholder-slate-500 transition-all"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 px-4 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-semibold rounded-xl shadow-lg shadow-primary/25 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
                    >
                        Sign In <ArrowRight className="w-4 h-4" />
                    </button>
                </form>

                <p className="mt-6 text-center text-slate-400">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-primary hover:text-primary/80 font-medium transition-colors">
                        Register
                    </Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Login;
