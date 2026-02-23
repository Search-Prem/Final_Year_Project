import React, { useState } from 'react';
import CryptoService from '../services/crypto.service';
import { CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

const KeyGenPanel = ({ onComplete, onNext }) => {

    const [p, setP] = useState('');
    const [q, setQ] = useState('');
    const [D, setD] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    const loadDemoValues = () => {
        setP('61');
        setQ('53');
        setD('2');
    };

    const handleGenerate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setResult(null);

        try {
            const res = await CryptoService.generateKeys(Number(p), Number(q), Number(D));
            setResult(res.data.results);
            if (onComplete) onComplete({ keyId: res.data.keyId });
        } catch (err) {
            setError(err.response?.data?.message || 'Key generation failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-10">
            <h2 className="text-2xl font-black text-white tracking-tighter border-l-4 border-white pl-4 mb-6 uppercase italic">
                Step 1 – Key Generation
            </h2>

            <form onSubmit={handleGenerate} className="space-y-8 max-w-2xl">
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-3">
                        <label className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] italic">Enter prime p</label>
                        <input
                            type="number"
                            value={p}
                            onChange={e => setP(e.target.value)}
                            placeholder="e.g. 61"
                            className="bg-transparent border border-white/10 rounded-[4px] px-6 py-4 text-xl w-full focus:ring-2 focus:ring-white/20 transition-all text-white"
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-3">
                        <label className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] italic">Enter prime q</label>
                        <input
                            type="number"
                            value={q}
                            onChange={e => setQ(e.target.value)}
                            placeholder="e.g. 53"
                            className="bg-transparent border border-white/10 rounded-[4px] px-6 py-4 text-xl w-full focus:ring-2 focus:ring-white/20 transition-all text-white"
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-3">
                        <label className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] italic">Enter D for Pell Eq.</label>
                        <input
                            type="number"
                            value={D}
                            onChange={e => setD(e.target.value)}
                            placeholder="e.g. 2"
                            className="bg-transparent border border-white/10 rounded-[4px] px-6 py-4 text-xl w-full focus:ring-2 focus:ring-white/20 transition-all text-white"
                            required
                        />
                    </div>
                </div>

                <div className="flex gap-4">
                    <button type="submit" disabled={loading} className="btn-primary flex-1">
                        {loading ? 'Generating...' : 'Generate Secure Keys'}
                    </button>
                    <button type="button" onClick={loadDemoValues} className="btn-secondary">
                        Load Demo Values
                    </button>
                </div>
            </form>

            {error && (
                <div className="text-white flex items-center gap-4 font-black text-lg p-4 bg-red-500/10 rounded-[4px] border border-red-500/20 shadow-lg">
                    <AlertCircle size={24} /> {error}
                </div>
            )}

            {result && (
                <div className="mt-20 p-12 border border-white/10 rounded-[4px] bg-white/5 backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
                    <div className="flex items-center gap-4 text-white text-2xl font-black uppercase tracking-tight mb-16 relative z-10">
                        <CheckCircle2 size={32} /> Keys Generated Successfully
                    </div>

                    <div className="relative z-10 space-y-0">
                        {/* 01. Primes & Modulus */}
                        <div className="relative pb-16">
                            <div className="absolute left-5 top-10 bottom-0 w-px bg-white/10 z-0"></div>
                            <div className="flex items-start gap-8 relative z-10">
                                <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center text-xs font-black shrink-0 ring-8 ring-white/5">01</div>
                                <div className="space-y-6 flex-1 pt-1">
                                    <h3 className="text-xl font-bold text-white uppercase tracking-tighter">Prime Factorization & Modulus</h3>
                                    <div className="grid grid-cols-3 gap-4 font-mono">
                                        <div className="p-6 bg-white/5 border border-white/5 rounded-[4px]">
                                            <div className="text-[10px] text-white/30 uppercase font-black mb-2">Prime p</div>
                                            <div className="text-2xl font-black text-white">{p}</div>
                                        </div>
                                        <div className="p-6 bg-white/5 border border-white/5 rounded-[4px]">
                                            <div className="text-[10px] text-white/30 uppercase font-black mb-2">Prime q</div>
                                            <div className="text-2xl font-black text-white">{q}</div>
                                        </div>
                                        <div className="p-6 bg-white/5 border border-white/5 rounded-[4px]">
                                            <div className="text-[10px] text-white/30 uppercase font-black mb-2">n = p × q</div>
                                            <div className="text-2xl font-black text-white">{result.n}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 02. Pell Equation */}
                        <div className="relative pb-16">
                            <div className="absolute left-5 top-0 bottom-0 w-px bg-white/10 z-0"></div>
                            <div className="flex items-start gap-8 relative z-10">
                                <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center text-xs font-black shrink-0 ring-8 ring-white/5">02</div>
                                <div className="space-y-6 flex-1 pt-1">
                                    <h3 className="text-xl font-bold text-white uppercase tracking-tighter">Pell Equation Solution</h3>
                                    <div className="p-8 bg-white/5 rounded-[4px] border border-white/5 group-hover:border-white/10 transition-colors text-center font-mono">
                                        <div className="text-2xl text-white/80">
                                            x² − {D}y² = 1
                                        </div>
                                        <div className="mt-4 text-sm text-white/40">
                                            Solution: x = {result.fundamentalSolution?.x}, y = {result.fundamentalSolution?.y}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 03. Euler's Totient */}
                        <div className="relative pb-16">
                            <div className="absolute left-5 top-0 bottom-0 w-px bg-white/10 z-0"></div>
                            <div className="flex items-start gap-8 relative z-10">
                                <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center text-xs font-black shrink-0 ring-8 ring-white/5">03</div>
                                <div className="space-y-6 flex-1 pt-1">
                                    <h3 className="text-xl font-bold text-white uppercase tracking-tighter">Euler's Totient & Key Derivation</h3>
                                    <div className="grid grid-cols-2 gap-4 font-mono">
                                        <div className="p-6 bg-white/5 border border-white/5 rounded-[4px]">
                                            <div className="text-[10px] text-white/30 uppercase font-black mb-2">φ(n) = (p-1)(q-1)</div>
                                            <div className="text-2xl font-black text-white">{result.phi}</div>
                                        </div>
                                        <div className="p-6 bg-white/5 border border-white/5 rounded-[4px]">
                                            <div className="text-[10px] text-white/30 uppercase font-black mb-2">Public Exponent e</div>
                                            <div className="text-2xl font-black text-white">{result.e}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 04. Private Key */}
                        <div className="relative pb-16">
                            <div className="absolute left-5 top-0 bottom-0 w-px bg-white/10 z-0"></div>
                            <div className="flex items-start gap-8 relative z-10">
                                <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center text-xs font-black shrink-0 ring-8 ring-white/5">04</div>
                                <div className="space-y-6 flex-1 pt-1">
                                    <h3 className="text-xl font-bold text-white uppercase tracking-tighter">Private Key (Secret)</h3>
                                    <div className="p-6 bg-white/5 rounded-[4px] border border-white/5 font-mono">
                                        <div className="text-[10px] text-white/30 uppercase font-black mb-2">d = e⁻¹ mod φ(n)</div>
                                        <div className="text-sm text-white break-all leading-relaxed">{result.d}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* PANEL FOOTER */}
                        <div className="pt-8 flex justify-between items-center border-t border-white/5 opacity-60 italic">
                            <div className="text-xs font-black uppercase tracking-[0.2em]">Gen Time: {result.genTime}ms</div>
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

export default KeyGenPanel;