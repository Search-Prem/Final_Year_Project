import React, { useState } from 'react';
import CryptoService from '../services/crypto.service';
import { motion } from 'framer-motion';
import { Cloud, Zap } from 'lucide-react';

const CloudPanel = () => {
    const [ciphertexts, setCiphertexts] = useState('');
    const [n, setN] = useState('');
    const [result, setResult] = useState(null);

    const handleProcess = async (e) => {
        e.preventDefault();
        try {
            // Parse ciphertexts from input (comma separated)
            const cList = ciphertexts.split(',').map(s => s.trim()).filter(s => s);
            const res = await CryptoService.cloudMultiply(cList, n);
            setResult(res.data.result);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Cloud className="w-5 h-5 text-blue-400" />
                    Homomorphic Cloud Processing
                </h3>
                <p className="text-sm text-slate-400 mb-6">
                    Simulate an untrusted cloud environment. The cloud will multiply encrypted values
                    without ever decrypting them.
                </p>

                <form onSubmit={handleProcess} className="space-y-4">
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Public Modulus (n)</label>
                        <input
                            type="text" value={n} onChange={e => setN(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                            placeholder="Enter n from Key Generation..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Ciphertexts (Comma separated)</label>
                        <textarea
                            value={ciphertexts} onChange={e => setCiphertexts(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                            rows="4" placeholder="e.g. 1293812..., 918273..."
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        <Zap className="w-4 h-4" />
                        Execute Homomorphic Multiplication
                    </button>
                </form>

                {result && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-8 p-6 bg-blue-500/10 border border-blue-500/20 rounded-2xl"
                    >
                        <h4 className="font-bold text-blue-400 mb-2">Cloud Result (Encrypted Product)</h4>
                        <div className="font-mono text-sm break-all text-blue-100">
                            {result}
                        </div>
                        <p className="text-xs text-blue-300 mt-2">
                            * This value is the encryption of the product of the plaintexts.
                            Decrypt it to verify.
                        </p>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default CloudPanel;
