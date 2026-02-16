import React, { useState, useEffect } from 'react';
import CryptoService from '../services/crypto.service';
import { motion } from 'framer-motion';
import { Lock, ArrowDown } from 'lucide-react';

const EncryptionPanel = () => {
    const [keys, setKeys] = useState([]);
    const [selectedKey, setSelectedKey] = useState('');
    const [message, setMessage] = useState('');
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

    const handleEncrypt = async (e) => {
        e.preventDefault();
        try {
            const res = await CryptoService.encrypt(message, selectedKey);
            setResult(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-secondary" />
                    Encrypt Message
                </h3>

                <form onSubmit={handleEncrypt} className="space-y-4">
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Select Key Pair</label>
                        <select
                            value={selectedKey} onChange={e => setSelectedKey(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:ring-2 focus:ring-secondary"
                        >
                            {keys.map(k => (
                                <option key={k.id} value={k.id}>
                                    Key #{k.id} (n ends in ...{k.n.slice(-4)})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Message (Plaintext)</label>
                        <textarea
                            value={message} onChange={e => setMessage(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:ring-2 focus:ring-secondary"
                            rows="3" placeholder="Enter secret message..."
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-2 bg-secondary hover:bg-secondary/90 text-white rounded-lg font-medium transition-colors"
                    >
                        Encrypt Data
                    </button>
                </form>
            </div>

            {result && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 bg-slate-950 border border-slate-800 rounded-2xl relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-1 h-full bg-green-500" />
                    <h4 className="font-bold text-lg mb-4 text-green-400">Encryption Result</h4>

                    <div className="space-y-3">
                        <div className="p-3 bg-slate-900 rounded border border-slate-800">
                            <p className="text-xs text-slate-500 mb-1">Ciphertext Values (BigInt)</p>
                            <div className="font-mono text-xs text-slate-300 break-all max-h-40 overflow-y-auto">
                                [{result.ciphertext.join(', ')}]
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default EncryptionPanel;
