import React, { useState } from 'react';
import CryptoService from '../services/crypto.service';
import { motion } from 'framer-motion';
import { RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';

const KeyGenPanel = () => {
    const [p, setP] = useState('');
    const [q, setQ] = useState('');
    const [D, setD] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    const handleGenerate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setResult(null);

        try {
            const res = await CryptoService.generateKeys(p, q, D);
            setResult(res.data);
            // Store keys in local storage if needed or just rely on backend DB
        } catch (err) {
            setError(err.response?.data?.message || 'Key generation failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Input Section */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-6 bg-white/5 border border-white/10 rounded-2xl"
                >
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <RefreshCw className="w-5 h-5 text-primary" />
                        Pell-Based Key Generation
                    </h3>
                    <form onSubmit={handleGenerate} className="space-y-4">
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Prime p</label>
                            <input
                                type="number" value={p} onChange={e => setP(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:ring-2 focus:ring-primary"
                                placeholder="Example: 61" required
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Prime q</label>
                            <input
                                type="number" value={q} onChange={e => setQ(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:ring-2 focus:ring-primary"
                                placeholder="Example: 53" required
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Non-square Integer D</label>
                            <input
                                type="number" value={D} onChange={e => setD(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:ring-2 focus:ring-primary"
                                placeholder="Example: 2" required
                            />
                        </div>

                        <button
                            type="submit" disabled={loading}
                            className="w-full py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Solving Pell Equation...' : 'Generate Keys'}
                        </button>
                    </form>

                    {error && (
                        <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}
                </motion.div>

                {/* Results Section */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                >
                    {result && (
                        <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                            <h3 className="text-xl font-bold mb-4 text-green-400 flex items-center gap-2">
                                <CheckCircle className="w-5 h-5" />
                                Keys Generated Successfully
                            </h3>

                            <div className="space-y-4">
                                <div className="p-4 bg-slate-950 rounded-lg border border-slate-800">
                                    <p className="text-sm text-slate-400">Public Key (n, e)</p>
                                    <div className="font-mono text-xs mt-1 break-all text-slate-200">
                                        n = {result.publicKey.n} <br />
                                        e = {result.publicKey.e}
                                    </div>
                                </div>

                                <div className="p-4 bg-slate-950 rounded-lg border border-slate-800">
                                    <p className="text-sm text-slate-400">Pell Equation Metadata</p>
                                    <div className="mt-2 space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Solution Index used:</span>
                                            <span className="text-primary font-mono">{result.metadata.solutionIndex}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Pell Solution (x, y):</span>
                                            <span className="text-slate-300 font-mono text-xs truncate max-w-[150px]">
                                                ({result.metadata.pellStep.x}, {result.metadata.pellStep.y})
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-600 mt-2">
                                            x was used as the private exponent d candidate (checked against Wiener bound).
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {!result && !loading && (
                        <div className="h-full flex flex-col items-center justify-center text-slate-500 p-8 border border-white/5 rounded-2xl border-dashed">
                            <RefreshCw className="w-12 h-12 mb-4 opacity-20" />
                            <p>Generate keys to view details</p>
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Visualizer (if time permits, I'd add a step-by-step animation of recursive Pell solution, but for now metadata display suffices) */}
        </div>
    );
};

export default KeyGenPanel;
