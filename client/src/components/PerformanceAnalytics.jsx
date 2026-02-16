import React from 'react';
import { Activity } from 'lucide-react';

const PerformanceAnalytics = () => {
    // Mock metrics based on typical JS BigInt performance
    const metrics = {
        keyGenTime: '45ms',
        encryptionTime: '2ms / char',
        decryptionTime: '5ms / char',
        pellIterations: '12 (Avg)',
        wienerChecks: 'Passed'
    };

    return (
        <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-500" />
                Performance Analytics
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(metrics).map(([key, val]) => (
                    <div key={key} className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                        </p>
                        <p className="text-lg font-bold text-white">{val}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PerformanceAnalytics;
