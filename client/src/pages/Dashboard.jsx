import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/auth.service';
import KeyGenPanel from '../components/KeyGenPanel';
import EncryptionPanel from '../components/EncryptionPanel';
import CloudPanel from '../components/CloudPanel';
import DecryptionPanel from '../components/DecryptionPanel';
import AdminLogViewer from '../components/AdminLogViewer';
import PerformanceAnalytics from '../components/PerformanceAnalytics';
import { Key, Lock, Cloud, Unlock, LogOut, LayoutDashboard, ShieldAlert, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('keygen');
    const user = AuthService.getCurrentUser();
    const navigate = useNavigate();

    const handleLogout = () => {
        AuthService.logout();
        navigate('/login');
    };

    const tabs = [
        { id: 'keygen', label: 'Key Generation', icon: Key },
        { id: 'encrypt', label: 'Encryption', icon: Lock },
        { id: 'cloud', label: 'Cloud Simulation', icon: Cloud },
        { id: 'decrypt', label: 'Decryption', icon: Unlock },
        { id: 'admin', label: 'Admin Logs', icon: ShieldAlert },
        { id: 'analytics', label: 'Performance', icon: Activity },
    ];

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-950 border-r border-white/5 flex flex-col">
                <div className="p-6 border-b border-white/5">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent flex items-center gap-2">
                        <LayoutDashboard className="w-6 h-6 text-primary" />
                        CryptoCloud
                    </h1>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === tab.id
                                    ? 'bg-primary/10 text-primary border border-primary/20'
                                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                                }`}
                        >
                            <tab.icon className="w-5 h-5" />
                            {tab.label}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/5">
                    <div className="flex items-center gap-3 px-4 py-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-sm font-bold text-slate-400">
                            {user?.username?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{user?.username}</p>
                            <p className="text-xs text-slate-500 truncate">User</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-[url('https://grainy-gradients.vercel.app/noise.svg')]">
                <div className="max-w-7xl mx-auto p-8">
                    <header className="mb-8">
                        <h2 className="text-3xl font-bold text-white mb-2">{tabs.find(t => t.id === activeTab)?.label}</h2>
                        <p className="text-slate-400">Manage your secure operations</p>
                    </header>

                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {activeTab === 'keygen' && <KeyGenPanel />}
                        {activeTab === 'encrypt' && <EncryptionPanel />}
                        {activeTab === 'cloud' && <CloudPanel />}
                        {activeTab === 'decrypt' && <DecryptionPanel />}
                        {activeTab === 'admin' && <AdminLogViewer />}
                        {activeTab === 'analytics' && <PerformanceAnalytics />}
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
