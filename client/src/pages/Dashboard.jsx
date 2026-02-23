import React, { useState } from 'react';
import AuthService from '../services/auth.service';
import AutoDemoService from '../services/autodemo.service';
import { useNavigate } from 'react-router-dom';
import {
    Key,
    Lock,
    Cloud,
    Unlock,
    LogOut,
    ArrowRight,
    Play,
    Loader2
} from 'lucide-react';

import KeyGenPanel from '../components/KeyGenPanel';
import EncryptionPanel from '../components/EncryptionPanel';
import CloudPanel from '../components/CloudPanel';
import DecryptionPanel from '../components/DecryptionPanel';

const Dashboard = () => {

    const [activeTab, setActiveTab] = useState("key");
    const [isDemoRunning, setIsDemoRunning] = useState(false);
    const [cryptoData, setCryptoData] = useState({
        keyId: localStorage.getItem('last_key_id') || null,
        messageId: localStorage.getItem('last_message_id') || null,
        ciphertext: null
    });

    const user = AuthService.getCurrentUser();
    const navigate = useNavigate();

    const logout = () => {
        AuthService.logout();
        navigate("/login");
    };

    const runAutomatedDemo = async () => {
        setIsDemoRunning(true);
        try {
            await AutoDemoService.runFullDemo(
                (step) => setActiveTab(step),
                (step, data, keyId, messageId) => {
                    if (keyId) {
                        setCryptoData(prev => ({ ...prev, keyId }));
                        localStorage.setItem('last_key_id', keyId);
                    }
                    if (messageId) {
                        setCryptoData(prev => ({ ...prev, messageId }));
                        localStorage.setItem('last_message_id', messageId);
                    }
                }
            );
        } catch (err) {
            console.error('Demo failed:', err);
        } finally {
            setIsDemoRunning(false);
        }
    };

    return (
        <div className="min-h-screen text-white bg-[#020617]">

            {/* HEADER: Centered Heading with Absolute Profile */}
            <div className="py-20 flex flex-col items-center justify-center text-center relative">
                <div className="w-2 h-12 bg-white rounded-[4px] mb-8"></div>
                <h1 className="text-4xl font-black uppercase tracking-tighter text-white leading-none max-w-4xl">
                    Next Gen Cloud Security Using <span className="text-white/40">Pell-Based RSA with Homomorphic Encryption</span>
                </h1>

                {/* Profile Info - Absolute Top-Right */}
                <div className="absolute top-10 right-10 flex items-center gap-6">
                    <div className="text-right">
                        <div className="font-extrabold text-sm leading-tight text-white">{user?.username}</div>
                        <div className="text-white/40 text-[10px] font-black tracking-[0.1em] uppercase">{user?.role}</div>
                    </div>
                    <div className="h-6 w-px bg-white/10"></div>
                    <button
                        onClick={logout}
                        className="p-2 border border-white/10 rounded-[4px] bg-white/5 hover:bg-red-500/20 hover:border-red-500/30 text-white/60 hover:text-red-400 transition-all active:scale-90"
                        title="Sign Out"
                    >
                        <LogOut size={16} />
                    </button>
                </div>
            </div>

            {/* DEMO BUTTON */}
            <div className="flex justify-center mb-8">
                <button
                    onClick={runAutomatedDemo}
                    disabled={isDemoRunning}
                    className="btn-secondary flex items-center gap-3"
                >
                    {isDemoRunning ? <Loader2 size={20} className="animate-spin" /> : <Play size={20} />}
                    {isDemoRunning ? 'Running Demo...' : 'Start Full Security Demo'}
                </button>
            </div>

            {/* NAVIGATION: Progress Tracker with Continuous Borders */}
            <nav
                style={{ display: 'flex', flexDirection: 'row', flexWrap: 'nowrap', alignItems: 'center', justifyContent: 'center', width: '100%', gap: '0px', overflowX: 'auto', paddingBottom: '0px' }}
                className="no-scrollbar"
            >
                {[
                    { id: "key", label: "01. Key Generation", icon: <Key size={28} /> },
                    { id: "encrypt", label: "02. Encryption", icon: <Lock size={28} /> },
                    { id: "cloud", label: "03. Cloud Simulation", icon: <Cloud size={28} /> },
                    { id: "decrypt", label: "04. Decryption", icon: <Unlock size={28} /> }
                ].map((tab, idx, arr) => (
                    <React.Fragment key={tab.id}>
                        <button
                            onClick={() => !isDemoRunning && setActiveTab(tab.id)}
                            style={{
                                display: 'flex',
                                flexDirection: 'row',
                                flexWrap: 'nowrap',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '16px',
                                flexShrink: 0,
                                padding: '24px 32px',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderBottom: activeTab === tab.id ? '4px solid white' : '1px solid rgba(255, 255, 255, 0.1)',
                                background: activeTab === tab.id ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                                opacity: activeTab === tab.id ? 1 : 0.4,
                                transition: 'all 0.3s ease',
                                cursor: isDemoRunning ? 'not-allowed' : 'pointer'
                            }}
                            className={`group ${activeTab === tab.id ? "text-white" : "text-white/70 hover:opacity-100"}`}
                        >
                            <div className={`transition-transform duration-500 ${activeTab === tab.id ? "scale-105" : "opacity-70"}`}>
                                {tab.icon}
                            </div>
                            <span className="text-xl font-black tracking-tight whitespace-nowrap uppercase italic">
                                {tab.label}
                            </span>
                        </button>
                        {idx < arr.length - 1 && (
                            <div className="flex items-center px-4 text-white/10">
                                <ArrowRight size={24} strokeWidth={1} />
                            </div>
                        )}
                    </React.Fragment>
                ))}
            </nav>

            {/* MAIN CONTENT AREA */}
            <main className="max-w-[1800px] mx-auto px-10 py-12">
                <div className="bg-[#0f172a]/30 backdrop-blur-2xl rounded-[4px] p-12 border border-white/5 relative overflow-hidden">

                    <div className="relative z-10 space-y-16">
                        {activeTab === "key" &&
                            <KeyGenPanel
                                onComplete={(data) => {
                                    setCryptoData(prev => ({ ...prev, keyId: data.keyId }));
                                    localStorage.setItem("last_key_id", data.keyId);
                                }}
                                onNext={() => setActiveTab("encrypt")}
                            />
                        }

                        {activeTab === "encrypt" &&
                            <EncryptionPanel
                                keyId={cryptoData.keyId}
                                onComplete={(data) => {
                                    setCryptoData(prev => ({ ...prev, messageId: data.messageId, ciphertext: data.ciphertext }));
                                    localStorage.setItem("last_message_id", data.messageId);
                                }}
                                onNext={() => setActiveTab("cloud")}
                            />
                        }

                        {activeTab === "cloud" &&
                            <CloudPanel
                                keyId={cryptoData.keyId}
                                messageId={cryptoData.messageId}
                                ciphertext={cryptoData.ciphertext}
                                onNext={() => setActiveTab("decrypt")}
                            />
                        }

                        {activeTab === "decrypt" &&
                            <DecryptionPanel
                                keyId={cryptoData.keyId}
                                messageId={cryptoData.messageId}
                            />
                        }
                    </div>

                </div>
            </main>

        </div>
    );
};

export default Dashboard;