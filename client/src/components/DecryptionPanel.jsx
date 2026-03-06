import React, { useState, useRef } from 'react';
import CryptoService from '../services/crypto.service';
import { Unlock, CheckCircle2, AlertCircle, KeyRound, Upload, FileText } from 'lucide-react';

const DecryptionPanel = ({ onDecryptComplete }) => {

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [messageId, setMessageId] = useState('');
    const [privateKeyD, setPrivateKeyD] = useState('');
    const [privateKeyP, setPrivateKeyP] = useState('');
    const [privateKeyQ, setPrivateKeyQ] = useState('');
    const [uploadedFileName, setUploadedFileName] = useState('');
    const fileInputRef = useRef(null);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadedFileName(file.name);
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const content = ev.target.result;
                // Parse the TXT file format exported by sender
                const lines = content.split('\n').map(l => l.trim());

                for (const line of lines) {
                    if (line.startsWith('Message ID:')) {
                        setMessageId(line.replace('Message ID:', '').trim());
                    } else if (line.startsWith('Private Key (d):')) {
                        setPrivateKeyD(line.replace('Private Key (d):', '').trim());
                    } else if (line.startsWith('Prime p:')) {
                        setPrivateKeyP(line.replace('Prime p:', '').trim());
                    } else if (line.startsWith('Prime q:')) {
                        setPrivateKeyQ(line.replace('Prime q:', '').trim());
                    }
                }
            } catch (parseErr) {
                setError('Failed to parse file. Ensure it is a valid Pell-RSA export file.');
            }
        };
        reader.onerror = () => {
            setError('Failed to read file');
        };
        reader.readAsText(file);
    };

    const handleDecrypt = async () => {
        if (!messageId || !privateKeyD || !privateKeyP || !privateKeyQ) {
            setError('Please provide the Message ID and all private key components (d, p, q)');
            return;
        }

        setLoading(true);
        setError('');
        setResult(null);

        try {
            const res = await CryptoService.decrypt(messageId, null, {
                d: privateKeyD,
                p: privateKeyP,
                q: privateKeyQ
            });
            setResult(res.data);
            if (onDecryptComplete) onDecryptComplete({ decTime: res.data.decTime });
        } catch (err) {
            setError(err.response?.data?.message || 'Decryption failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-10">
            <h2 className="text-2xl font-black text-white tracking-tighter border-l-4 border-white pl-4 mb-6 uppercase italic">
                Step 1 – Secure Decryption
            </h2>

            <div className="max-w-2xl space-y-8">

                {/* File Upload Section */}
                <div className="p-8 bg-white/5 border border-white/10 rounded-[4px] space-y-4">
                    <div className="flex items-center gap-3 text-white/60 text-sm font-black uppercase tracking-[0.2em]">
                        <Upload size={18} />
                        Upload Sender's Export File
                    </div>
                    <p className="text-white/30 text-xs">
                        Upload the .txt file exported by the sender to auto-fill all fields below.
                    </p>
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-white/10 rounded-[4px] p-8 text-center cursor-pointer hover:border-white/30 hover:bg-white/5 transition-all group"
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".txt,.text"
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                        <FileText size={28} className="mx-auto mb-3 text-white/20 group-hover:text-white/50 transition-colors" />
                        {uploadedFileName ? (
                            <>
                                <div className="text-green-400 font-black text-sm">{uploadedFileName}</div>
                                <div className="text-green-400/50 text-xs mt-1">✓ Fields populated from file</div>
                            </>
                        ) : (
                            <>
                                <div className="text-white/40 font-black text-sm">Click to upload pell-rsa-data.txt</div>
                                <div className="text-white/20 text-xs mt-1">Or enter values manually below</div>
                            </>
                        )}
                    </div>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-4">
                    <div className="flex-1 h-px bg-white/10"></div>
                    <span className="text-white/20 text-[10px] font-black uppercase tracking-widest">Or enter manually</span>
                    <div className="flex-1 h-px bg-white/10"></div>
                </div>

                {/* Message ID Input */}
                <div className="flex flex-col gap-3">
                    <label className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] italic">Encrypted Message ID</label>
                    <input
                        value={messageId}
                        onChange={e => setMessageId(e.target.value)}
                        placeholder="Enter the Message ID from the sender..."
                        className="bg-transparent border border-white/10 rounded-[4px] px-6 py-4 text-lg w-full focus:ring-2 focus:ring-white/20 transition-all text-white font-mono"
                    />
                </div>

                {/* Private Key Section */}
                <div className="p-8 bg-white/5 border border-white/10 rounded-[4px] space-y-6">
                    <div className="flex items-center gap-3 text-white/60 text-sm font-black uppercase tracking-[0.2em]">
                        <KeyRound size={18} />
                        Private Key Components
                    </div>

                    <div className="flex flex-col gap-3">
                        <label className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] italic">Private Key (d)</label>
                        <input
                            value={privateKeyD}
                            onChange={e => setPrivateKeyD(e.target.value)}
                            placeholder="Enter private key d..."
                            className="bg-transparent border border-white/10 rounded-[4px] px-6 py-4 text-lg w-full focus:ring-2 focus:ring-white/20 transition-all text-white font-mono"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-3">
                            <label className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] italic">Prime p</label>
                            <input
                                value={privateKeyP}
                                onChange={e => setPrivateKeyP(e.target.value)}
                                placeholder="Enter prime p..."
                                className="bg-transparent border border-white/10 rounded-[4px] px-6 py-4 text-lg w-full focus:ring-2 focus:ring-white/20 transition-all text-white font-mono"
                            />
                        </div>
                        <div className="flex flex-col gap-3">
                            <label className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] italic">Prime q</label>
                            <input
                                value={privateKeyQ}
                                onChange={e => setPrivateKeyQ(e.target.value)}
                                placeholder="Enter prime q..."
                                className="bg-transparent border border-white/10 rounded-[4px] px-6 py-4 text-lg w-full focus:ring-2 focus:ring-white/20 transition-all text-white font-mono"
                            />
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleDecrypt}
                    disabled={loading || !messageId || !privateKeyD || !privateKeyP || !privateKeyQ}
                    className="btn-primary w-full h-16"
                >
                    {loading ? 'Reconstructing Plaintext...' : 'Decrypt Final Product'}
                </button>
            </div>

            {error && (
                <div className="text-white flex items-center gap-4 font-black text-lg p-4 bg-red-500/10 rounded-[4px] border border-red-500/20 shadow-lg">
                    <AlertCircle size={24} /> {error}
                </div>
            )}

            {result && (
                <div className="mt-20 p-12 border border-white/10 rounded-[4px] bg-white/5 backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
                    <div className="flex items-center gap-4 text-white text-2xl font-black uppercase tracking-tight mb-16 relative z-10">
                        <CheckCircle2 size={32} /> Decryption & Verification Verified
                    </div>

                    <div className="relative z-10 space-y-0">

                        {/* 01. CRT Theoretical Breakdown */}
                        <div className="relative pb-16">
                            <div className="absolute left-5 top-10 bottom-0 w-px bg-white/10 z-0"></div>
                            <div className="flex items-start gap-8 relative z-10">
                                <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center text-xs font-black shrink-0 ring-8 ring-white/5">01</div>
                                <div className="space-y-6 flex-1 pt-1">
                                    <h3 className="text-xl font-bold text-white uppercase tracking-tighter">CRT Theoretical Reconstruction</h3>
                                    <div className="p-8 bg-white/5 rounded-[4px] border border-white/5 font-mono text-center space-y-4">
                                        <div className="text-xl text-white italic">M = (M₁·q·[q⁻¹]ₚ + M₂·p·[p⁻¹]ᵩ) mod n</div>
                                        <div className="text-sm text-white/30 pt-4 border-t border-white/5">
                                            Applying Chinese Remainder Theorem for optimized decryption...
                                        </div>
                                        {result.decryptionSteps && result.decryptionSteps.length > 0 && (
                                            <div className="text-left mt-4 space-y-3">
                                                {result.decryptionSteps.map((step, i) => (
                                                    <div key={i} className="text-xs text-white/40 font-mono p-3 bg-white/5 rounded-[4px] border border-white/5 grid grid-cols-2 gap-x-6 gap-y-1">
                                                        {Object.entries(step).map(([key, val]) => (
                                                            <div key={key}>
                                                                <span className="text-white/20 uppercase">{key}:</span>{' '}
                                                                <span className="text-white/60">{String(val)}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 02. Proof of Homomorphism */}
                        <div className="relative pb-16">
                            <div className="absolute left-5 top-0 bottom-0 w-px bg-white/10 z-0"></div>
                            <div className="flex items-start gap-8 relative z-10">
                                <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center text-xs font-black shrink-0 ring-8 ring-white/5">02</div>
                                <div className="space-y-6 flex-1 pt-1">
                                    <h3 className="text-xl font-bold text-white uppercase tracking-tighter">Proof of Homomorphic Consistency</h3>
                                    <div className="grid grid-cols-2 gap-4 font-mono">
                                        <div className="p-6 bg-white/5 border border-white/5 rounded-[4px]">
                                            <div className="text-[10px] text-white/30 uppercase font-black mb-2">Decrypted Product</div>
                                            <div className="text-xl font-black text-white">{result.decryptedResult}</div>
                                        </div>
                                        <div className="p-6 bg-white/5 border border-white/5 rounded-[4px]">
                                            <div className="text-[10px] text-white/30 uppercase font-black mb-2">Expected M × M</div>
                                            <div className="text-xl font-black text-white">{result.expectedResult}</div>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-white/5 text-center text-sm font-black uppercase text-white border border-white/10 rounded-[4px] tracking-widest">
                                        Status: {result.isVerified ? '✓ Values Match Exactly' : '✗ DISCREPANCY DETECTED'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 03. Recovered Original Text */}
                        {result.recoveredText && (
                            <div className="relative pb-16">
                                <div className="absolute left-5 top-0 bottom-0 w-px bg-green-500/30 z-0"></div>
                                <div className="flex items-start gap-8 relative z-10">
                                    <div className="w-10 h-10 rounded-full bg-green-500 text-black flex items-center justify-center text-xs font-black shrink-0 ring-8 ring-green-500/10">03</div>
                                    <div className="space-y-6 flex-1 pt-1">
                                        <h3 className="text-xl font-bold text-green-400 uppercase tracking-tighter">Recovered Original Text</h3>
                                        <p className="text-white/50 text-sm">Each ciphertext value was individually decrypted using CRT, converting back to ASCII codes and then to the original characters.</p>

                                        {/* ASCII mapping reverse */}
                                        {result.recoveredChars && (
                                            <div className="grid grid-cols-4 gap-3 font-mono">
                                                {result.recoveredChars.map((item, i) => (
                                                    <div key={i} className="p-4 bg-white/5 border border-white/5 rounded-[4px] text-center">
                                                        <div className="text-[10px] text-white/30 mb-1">ASCII {item.asciiCode}</div>
                                                        <div className="text-lg font-black text-green-300">'{item.char}'</div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Final recovered text */}
                                        <div className="p-6 bg-green-500/10 border border-green-500/20 rounded-[4px]">
                                            <div className="text-[10px] text-green-400/60 uppercase font-black mb-2">Decrypted Original Message</div>
                                            <div className="text-xl font-black text-green-300 break-all select-all">{result.recoveredText}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* PANEL FOOTER */}
                        <div className="pt-8 flex justify-between items-center border-t border-white/5 opacity-60 italic">
                            <div className="text-xs font-black uppercase tracking-[0.2em]">Decryption Latency: {result.decTime}ms</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DecryptionPanel;