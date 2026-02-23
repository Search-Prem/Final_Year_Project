import React, { useState } from 'react';
import CryptoService from '../services/crypto.service';
import { Cloud, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

const CloudPanel = ({ keyId, messageId, onComplete, onNext }) => {

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    const handleCloudProcess = async () => {
        if (!keyId || !messageId) {
            setError('Missing session keys or ciphertext');
            return;
        }

        setLoading(true);
        setError('');
        setResult(null);

        try {
            const res = await CryptoService.cloudMultiply(messageId, keyId);
            setResult(res.data);
            if (onComplete) onComplete({ ciphertext: res.data.product });
        } catch (err) {
            setError(err.response?.data?.message || 'Cloud processing failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-10">
            <h2 className="text-2xl font-black text-white tracking-tighter border-l-4 border-white pl-4 mb-6 uppercase italic">
                Step 3 – Cloud Simulation
            </h2>

            {(!keyId || !messageId) && (
                <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-[4px] text-white font-black flex items-center gap-4">
                    <AlertCircle /> Initialization Error: Data not found in cloud staging area.
                </div>
            )}

            <div className="max-w-4xl space-y-8">
                <div className="p-10 bg-[#020617] border border-white/5 rounded-[4px] relative overflow-hidden group">
                    <div className="relative z-10 flex flex-col gap-6">
                        <div className="flex items-center gap-4 text-white/40 text-sm font-black uppercase tracking-[0.3em]">
                            <ShieldCheck size={20} /> Secure Cloud Compute
                        </div>
                        <p className="text-xl text-white/70 leading-relaxed font-light font-mono">
                            Performing Multiplicative Homomorphic Encryption on the ciphertext without decryption.
                            The server will multiply the stored ciphertext by itself, simulating a blind calculation.
                        </p>
                        <button
                            onClick={handleCloudProcess}
                            disabled={loading || !keyId || !messageId}
                            className="btn-primary w-full h-16 mt-4"
                        >
                            {loading ? 'Executing Cloud Math...' : 'Execute Blind Computation'}
                        </button>
                    </div>
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Cloud size={160} />
                    </div>
                </div>
            </div>

            {error && (
                <div className="text-white flex items-center gap-4 font-black text-lg p-4 bg-red-500/10 rounded-[4px] border border-red-500/20 shadow-lg">
                    <AlertCircle size={24} /> {error}
                </div>
            )}

            {result && (
                <div className="mt-20 p-12 border border-white/10 rounded-[4px] bg-white/5 backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
                    <div className="flex items-center gap-4 text-white text-2xl font-black uppercase tracking-tight mb-16 relative z-10">
                        <CheckCircle2 size={32} /> Homomorphic Process Complete
                    </div>

                    <div className="relative z-10 space-y-0">
                        {/* 01. Computation Breakdown */}
                        <div className="relative pb-16">
                            <div className="absolute left-5 top-10 bottom-0 w-px bg-white/10 z-0"></div>
                            <div className="flex items-start gap-8 relative z-10">
                                <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center text-xs font-black shrink-0 ring-8 ring-white/5">01</div>
                                <div className="space-y-6 flex-1 pt-1">
                                    <h3 className="text-xl font-bold text-white uppercase tracking-tighter">Computation Breakdown</h3>
                                    <div className="p-6 bg-white/5 rounded-[4px] border border-white/5 group-hover:border-white/10 transition-colors font-mono">
                                        <div className="text-[10px] text-white/30 uppercase font-black mb-2 italic">Multiplicative Chain</div>
                                        <div className="text-sm text-white break-all leading-relaxed">{result.breakdown}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 02. Homomorphic Property */}
                        <div className="relative pb-16">
                            <div className="absolute left-5 top-0 bottom-0 w-px bg-white/10 z-0"></div>
                            <div className="flex items-start gap-8 relative z-10">
                                <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center text-xs font-black shrink-0 ring-8 ring-white/5">02</div>
                                <div className="space-y-6 flex-1 pt-1">
                                    <h3 className="text-xl font-bold text-white uppercase tracking-tighter">Multiplicative Homomorphic Property</h3>
                                    <div className="p-8 bg-white/5 rounded-[4px] border border-white/5 group-hover:border-white/10 transition-colors text-center font-mono">
                                        <div className="text-2xl text-white/80 flex items-center justify-center gap-4">
                                            <span>(M₁ × M₂)<sup>e</sup></span>
                                            <span>≡</span>
                                            <span>M₁<sup>e</sup> × M₂<sup>e</sup></span>
                                            <span>mod n</span>
                                        </div>
                                        <div className="mt-4 text-[10px] text-white/30 uppercase tracking-widest font-black">Homomorphism Audit Checked</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 03. Final Product */}
                        <div className="relative pb-16">
                            <div className="absolute left-5 top-0 bottom-0 w-px bg-white/10 z-0"></div>
                            <div className="flex items-start gap-8 relative z-10">
                                <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center text-xs font-black shrink-0 ring-8 ring-white/5">03</div>
                                <div className="space-y-6 flex-1 pt-1">
                                    <h3 className="text-xl font-bold text-white uppercase tracking-tighter">Homomorphic Product</h3>
                                    <div className="p-6 bg-white/5 rounded-[4px] border border-white/5 group-hover:border-white/10 transition-colors font-mono space-y-4">
                                        <div>
                                            <div className="text-[10px] text-white/30 uppercase font-black mb-1">C_Result = ∏(Cᵢ) mod n</div>
                                            <div className="text-sm text-white break-all leading-tight underline decoration-white/10 underline-offset-4">{result.product}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* PANEL FOOTER */}
                        <div className="pt-8 flex justify-between items-center border-t border-white/5 opacity-60 italic">
                            <div className="text-xs font-black uppercase tracking-[0.2em]">Execution Latency: {result.cloudExecTime}ms</div>
                            <button onClick={onNext} className="flex items-center gap-2 hover:translate-x-2 transition-transform font-black uppercase text-xs tracking-widest text-white">
                                Next Step <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CloudPanel;