import React, { useState, useEffect } from 'react';
import CryptoService from '../services/crypto.service';
import { motion } from 'framer-motion';
import { Unlock, List } from 'lucide-react';

const DecryptionPanel = () => {
    const [keys, setKeys] = useState([]);
    const [selectedKey, setSelectedKey] = useState('');
    const [ciphertexts, setCiphertexts] = useState('');
    const [result, setResult] = useState(null);

    useEffect(() => {
        loadKeys();
    }, []);

    const loadKeys = async () => {
        try {
            const res = await CryptoService.getKeys();
            setKeys(res.data);
            if (res.data.length > 0) setSelectedKey(res.data[res.data.length - 1].id);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDecrypt = async (e) => {
        e.preventDefault();
        try {
            const cList = ciphertexts.split(',').map(s => s.trim()).filter(s => s);
            const res = await CryptoService.decrypt(cList, selectedKey);
            setResult(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl h-fit">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Unlock className="w-5 h-5 text-emerald-500" />
                    CRT-Optimized Decryption
                </h3>

                <form onSubmit={handleDecrypt} className="space-y-4">
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Select Private Key</label>
                        <select
                            value={selectedKey} onChange={e => setSelectedKey(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:ring-2 focus:ring-emerald-500"
                        >
                            {keys.map(k => (
                                <option key={k.id} value={k.id}>
                                    Key #{k.id}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Ciphertext(s)</label>
                        <textarea
                            value={ciphertexts} onChange={e => setCiphertexts(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:ring-2 focus:ring-emerald-500 font-mono text-sm"
                            rows="4" placeholder="Enter ciphertext values..."
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors"
                    >
                        Decrypt
                    </button>
                </form>
            </div>

            <div className="space-y-6">
                {result && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-6 bg-slate-950 border border-slate-800 rounded-2xl"
                    >
                        <h4 className="font-bold text-white mb-4">Decrypted Result</h4>
                        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg mb-6">
                            <p className="text-emerald-400 font-mono text-xl">{result.decryptedText}</p>
                        </div>

                        {result.decryptionSteps && (
                            <div>
                                <h5 className="text-sm font-semibold text-slate-400 mb-3 flex items-center gap-2">
                                    <List className="w-4 h-4" />
                                    CRT Intermediate Steps
                                </h5>
                                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                                    {result.decryptionSteps.map((step, idx) => (
                                        <div key={idx} className="p-3 bg-slate-900 border border-slate-800 rounded text-xs font-mono text-slate-300 space-y-1">
                                            <div className="flex justify-between border-b border-slate-800 pb-1 mb-1">
                                                <span className="text-slate-500">Char #{idx + 1}</span>
                                            </div>
                                            <p><span className="text-purple-400">C:</span> {step.c.substring(0, 10)}...</p>
                                            <p><span className="text-blue-400">m1 (mod p):</span> {step.m1}</p>
                                            <p><span className="text-blue-400">m2 (mod q):</span> {step.m2}</p>
                                            <p><span className="text-orange-400">h:</span> {step.h}</p>
                                            <p><span className="text-green-400">m (Final):</span> {step.m}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

                {!result && (
                    <div className="h-full flex flex-col items-center justify-center text-slate-600 p-8 border border-white/5 rounded-2xl border-dashed">
                        <Unlock className="w-12 h-12 mb-4 opacity-20" />
                        <p>Decrypt content to view CRT steps</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DecryptionPanel;
