import React, { useState, useRef } from 'react';
import CryptoService from '../services/crypto.service';
import { CheckCircle2, AlertCircle, ArrowRight, FileText, Type, Upload } from 'lucide-react';

const EncryptionPanel = ({ keyId, onComplete, onNext, onBack }) => {

    const [message, setMessage] = useState('');
    const [inputMode, setInputMode] = useState('text'); // 'text' or 'file'
    const [fileName, setFileName] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setFileName(file.name);
        const reader = new FileReader();
        reader.onload = (ev) => {
            setMessage(ev.target.result);
        };
        reader.onerror = () => {
            setError('Failed to read file');
        };
        reader.readAsText(file);
    };

    const handleEncrypt = async (e) => {
        e.preventDefault();
        if (!keyId) {
            setError('Please generate keys first');
            return;
        }
        if (!message.trim()) {
            setError('Please provide a message to encrypt');
            return;
        }

        setLoading(true);
        setError('');
        setResult(null);

        try {
            const res = await CryptoService.encrypt(message, keyId);
            setResult(res.data);
            if (onComplete) onComplete({ messageId: res.data.messageId, ciphertext: res.data.ciphertext, encTime: res.data.encTime });
        } catch (err) {
            setError(err.response?.data?.message || 'Encryption failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-10">
            <h2 className="text-2xl font-black text-white tracking-tighter border-l-4 border-white pl-4 mb-6 uppercase italic">
                Step 2 – Encryption
            </h2>

            {!keyId && (
                <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-[4px] text-white font-black flex items-center gap-4">
                    <AlertCircle /> Please complete Step 1 (Key Generation) first.
                </div>
            )}

            <form onSubmit={handleEncrypt} className="space-y-8 max-w-2xl">
                {/* Input Mode Toggle */}
                <div className="flex gap-0 border border-white/10 rounded-[4px] overflow-hidden w-fit">
                    <button
                        type="button"
                        onClick={() => setInputMode('text')}
                        className={`flex items-center gap-2 px-6 py-3 text-xs font-black uppercase tracking-widest transition-all ${inputMode === 'text'
                            ? 'bg-white text-black'
                            : 'bg-transparent text-white/50 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <Type size={14} /> Text Input
                    </button>
                    <button
                        type="button"
                        onClick={() => setInputMode('file')}
                        className={`flex items-center gap-2 px-6 py-3 text-xs font-black uppercase tracking-widest transition-all ${inputMode === 'file'
                            ? 'bg-white text-black'
                            : 'bg-transparent text-white/50 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <FileText size={14} /> File Upload
                    </button>
                </div>

                {inputMode === 'text' ? (
                    <div className="flex flex-col gap-3">
                        <label className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] italic">Plaintext Message</label>
                        <textarea
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            placeholder="Enter the message to secure..."
                            className="bg-transparent border border-white/10 rounded-[4px] px-6 py-4 text-xl w-full min-h-[120px] focus:ring-2 focus:ring-white/20 transition-all text-white"
                            required
                        />
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        <label className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] italic">Upload Text File</label>
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-white/10 rounded-[4px] p-10 text-center cursor-pointer hover:border-white/30 hover:bg-white/5 transition-all group"
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".txt,.text"
                                onChange={handleFileUpload}
                                className="hidden"
                            />
                            <Upload size={32} className="mx-auto mb-4 text-white/20 group-hover:text-white/50 transition-colors" />
                            {fileName ? (
                                <>
                                    <div className="text-white font-black text-lg">{fileName}</div>
                                    <div className="text-white/30 text-xs mt-2 font-mono">Click to change file</div>
                                </>
                            ) : (
                                <>
                                    <div className="text-white/50 font-black text-lg">Click to upload a .txt file</div>
                                    <div className="text-white/20 text-xs mt-2">The file contents will be used as plaintext</div>
                                </>
                            )}
                        </div>
                        {message && fileName && (
                            <div className="p-4 bg-white/5 border border-white/10 rounded-[4px]">
                                <div className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-2">File Preview</div>
                                <div className="text-white/70 text-sm font-mono max-h-[120px] overflow-y-auto whitespace-pre-wrap">
                                    {message.length > 500 ? message.substring(0, 500) + '...' : message}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <button type="submit" disabled={loading || !keyId || !message.trim()} className="btn-primary w-full">
                    {loading ? 'Encrypting...' : 'Encrypt Message'}
                </button>
            </form>

            {error && (
                <div className="text-white flex items-center gap-4 font-black text-lg p-4 bg-red-500/10 rounded-[4px] border border-red-500/20 shadow-lg">
                    <AlertCircle size={24} /> {error}
                </div>
            )}

            {result && (
                <div className="mt-20 p-12 border border-white/10 rounded-[4px] bg-white/5 backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
                    <div className="flex items-center gap-4 text-white text-2xl font-black uppercase tracking-tight mb-16 relative z-10">
                        <CheckCircle2 size={32} /> Encryption Complete
                    </div>

                    <div className="relative z-10 space-y-0">
                        {/* 01. ASCII Mapping */}
                        <div className="relative pb-16">
                            <div className="absolute left-5 top-10 bottom-0 w-px bg-white/10 z-0"></div>
                            <div className="flex items-start gap-8 relative z-10">
                                <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center text-xs font-black shrink-0 ring-8 ring-white/5">01</div>
                                <div className="space-y-6 flex-1 pt-1">
                                    <h3 className="text-xl font-bold text-white uppercase tracking-tighter">ASCII Character Mapping</h3>
                                    <div className="grid grid-cols-4 gap-3 font-mono">
                                        {result.asciiTable && result.asciiTable.map((row, i) => (
                                            <div key={i} className="p-4 bg-white/5 border border-white/5 rounded-[4px] text-center">
                                                <div className="text-lg font-black text-white">'{row.char}'</div>
                                                <div className="text-sm text-white/30 mt-1">→ {row.code}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 02. Encryption Formula */}
                        <div className="relative pb-16">
                            <div className="absolute left-5 top-0 bottom-0 w-px bg-white/10 z-0"></div>
                            <div className="flex items-start gap-8 relative z-10">
                                <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center text-xs font-black shrink-0 ring-8 ring-white/5">02</div>
                                <div className="space-y-6 flex-1 pt-1">
                                    <h3 className="text-xl font-bold text-white uppercase tracking-tighter">Encryption Formula</h3>
                                    <div className="p-8 bg-white/5 rounded-[4px] border border-white/5 group-hover:border-white/10 transition-colors text-center font-mono">
                                        <div className="text-2xl text-white/80">
                                            C = M<sup>e</sup> mod n
                                        </div>
                                        {result.expandedArithmetic && (
                                            <div className="mt-4 text-sm text-white/40">{result.expandedArithmetic.formula}</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 03. Ciphertext Vector */}
                        <div className="relative pb-16">
                            <div className="absolute left-5 top-0 bottom-0 w-px bg-white/10 z-0"></div>
                            <div className="flex items-start gap-8 relative z-10">
                                <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center text-xs font-black shrink-0 ring-8 ring-white/5">03</div>
                                <div className="space-y-6 flex-1 pt-1">
                                    <h3 className="text-xl font-bold text-white uppercase tracking-tighter">Ciphertext Vector</h3>
                                    <div className="p-6 bg-white/5 rounded-[4px] border border-white/5 group-hover:border-white/10 transition-colors font-mono">
                                        <div className="text-sm text-white break-all leading-relaxed">
                                            [{result.ciphertext && result.ciphertext.join(', ')}]
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SHARE WITH RECEIVER – Message ID */}
                        <div className="relative pb-16">
                            <div className="absolute left-5 top-0 bottom-0 w-px bg-green-500/30 z-0"></div>
                            <div className="flex items-start gap-8 relative z-10">
                                <div className="w-10 h-10 rounded-full bg-green-500 text-black flex items-center justify-center text-xs font-black shrink-0 ring-8 ring-green-500/10">📤</div>
                                <div className="space-y-4 flex-1 pt-1">
                                    <h3 className="text-xl font-bold text-green-400 uppercase tracking-tighter">Share with Receiver</h3>
                                    <p className="text-white/50 text-sm">The receiver needs this Message ID to retrieve and decrypt the data.</p>
                                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-[4px] font-mono">
                                        <div className="text-sm text-green-400/60 uppercase font-black mb-1">Message ID</div>
                                        <div className="text-sm font-black text-green-300 break-all select-all">{result.messageId}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* PANEL FOOTER */}
                        <div className="pt-8 flex justify-between items-center border-t border-white/5 opacity-60 italic">
                            <div className="flex items-center gap-6">
                                {onBack && (
                                    <button onClick={onBack} className="flex items-center gap-2 hover:-translate-x-2 transition-transform font-black uppercase text-xs tracking-widest text-white">
                                        <ArrowRight size={16} className="rotate-180" /> Previous Step
                                    </button>
                                )}
                                <div className="text-xs font-black uppercase tracking-[0.2em]">Encryption Latency: {result.encTime}ms</div>
                            </div>
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

export default EncryptionPanel;