import React from 'react';

const AdminLogViewer = () => {
    // For this prototype, we'll mock logs or fetch if we had a logs endpoint
    // We can fetch all messages as a form of log
    return (
        <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
            <h3 className="text-xl font-bold mb-4">System Logs</h3>
            <div className="p-4 bg-slate-950 rounded border border-slate-800 font-mono text-xs h-64 overflow-y-auto text-slate-400">
                <p>[INFO] System initialized.</p>
                <p>[INFO] Crypto Engine loaded successfully.</p>
                <p>[INFO] User accessing Key Generation...</p>
                {/* Real implementation would fetch logs from backend */}
                <p className="text-yellow-500">[WARN] Simulation Mode Active.</p>
            </div>
        </div>
    );
};

export default AdminLogViewer;
