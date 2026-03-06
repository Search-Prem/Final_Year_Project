import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BarChart2, Clock, Zap } from 'lucide-react';

const STORAGE_KEY_PREFIX = 'pell_rsa_reports';

const getStorageKey = (userId) => userId ? `${STORAGE_KEY_PREFIX}_${userId}` : STORAGE_KEY_PREFIX;

export const saveReport = (role, data, userId) => {
    const key = getStorageKey(userId);
    const reports = JSON.parse(localStorage.getItem(key) || '[]');
    reports.push({
        role,
        timestamp: new Date().toISOString(),
        ...data
    });
    // Keep last 20 entries
    if (reports.length > 20) reports.splice(0, reports.length - 20);
    localStorage.setItem(key, JSON.stringify(reports));
};

const COLORS = ['#818cf8', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4'];

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[#0f172a] border border-white/10 rounded-[4px] p-4 shadow-2xl">
                <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-2">{label}</p>
                {payload.map((p, i) => (
                    <p key={i} className="text-white font-mono text-sm">
                        <span className="text-white/50">{p.name}: </span>
                        <span className="font-black">{p.value}ms</span>
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

const ReportsPanel = ({ role, userId }) => {
    const key = getStorageKey(userId);
    const allReports = JSON.parse(localStorage.getItem(key) || '[]');
    const isSender = role !== 'Receiver';

    // Filter by role
    const reports = allReports.filter(r =>
        isSender ? r.role === 'Sender' : r.role === 'Receiver'
    );

    if (reports.length === 0) {
        return (
            <div className="space-y-10">
                <h2 className="text-2xl font-black text-white tracking-tighter border-l-4 border-white pl-4 mb-6 uppercase italic">
                    Process Reports
                </h2>
                <div className="flex flex-col items-center justify-center py-32 text-center">
                    <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-8">
                        <BarChart2 size={40} className="text-white/20" />
                    </div>
                    <h3 className="text-2xl font-black text-white/30 uppercase tracking-tight mb-4">
                        Start Process to get Reports
                    </h3>
                    <p className="text-white/20 text-sm max-w-md">
                        {isSender
                            ? 'Complete the Key Generation → Encryption → Cloud Upload pipeline to see timing reports here.'
                            : 'Complete a Decryption process to see timing reports here.'}
                    </p>
                </div>
            </div>
        );
    }

    // Build chart data
    let chartData = [];
    let latestReport = reports[reports.length - 1];

    if (isSender) {
        // Process time breakdown for each run
        chartData = reports.slice(-10).map((r, i) => ({
            name: `Run ${i + 1}`,
            'Key Gen': r.genTime || 0,
            'Encryption': r.encTime || 0,
            'Cloud Process': r.cloudExecTime || 0,
        }));
    } else {
        chartData = reports.slice(-10).map((r, i) => ({
            name: `Run ${i + 1}`,
            'Decryption': r.decTime || 0,
        }));
    }

    // Latest run summary
    const summaryItems = isSender ? [
        { label: 'Key Generation', value: latestReport.genTime, icon: <Zap size={16} /> },
        { label: 'Encryption', value: latestReport.encTime, icon: <Zap size={16} /> },
        { label: 'Cloud Processing', value: latestReport.cloudExecTime, icon: <Zap size={16} /> },
    ] : [
        { label: 'Decryption', value: latestReport.decTime, icon: <Zap size={16} /> },
    ];

    const totalTime = summaryItems.reduce((acc, item) => acc + (item.value || 0), 0);

    return (
        <div className="space-y-10">
            <h2 className="text-2xl font-black text-white tracking-tighter border-l-4 border-white pl-4 mb-6 uppercase italic">
                Process Reports
            </h2>

            {/* Latest Run Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {summaryItems.map((item, i) => (
                    <div key={i} className="p-6 bg-white/5 border border-white/10 rounded-[4px] group hover:border-white/20 transition-all">
                        <div className="flex items-center gap-2 text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-3">
                            {item.icon} {item.label}
                        </div>
                        <div className="text-3xl font-black text-white font-mono">
                            {item.value != null ? item.value : '—'}<span className="text-lg text-white/30 ml-1">ms</span>
                        </div>
                    </div>
                ))}
                <div className="p-6 bg-white/5 border border-white/10 rounded-[4px] group hover:border-white/20 transition-all">
                    <div className="flex items-center gap-2 text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-3">
                        <Clock size={16} /> Total Time
                    </div>
                    <div className="text-3xl font-black text-white font-mono">
                        {totalTime}<span className="text-lg text-white/30 ml-1">ms</span>
                    </div>
                </div>
            </div>

            {/* Timing Chart */}
            <div className="p-8 bg-white/5 border border-white/10 rounded-[4px]">
                <div className="flex items-center gap-3 text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-8">
                    <BarChart2 size={16} /> Process Timing History (Last {chartData.length} Runs)
                </div>
                <div style={{ width: '100%', height: 350 }}>
                    <ResponsiveContainer>
                        <BarChart data={chartData} barGap={4} barCategoryGap="20%">
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis
                                dataKey="name"
                                tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: 900 }}
                                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: 900 }}
                                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                                tickLine={false}
                                label={{
                                    value: 'Time (ms)',
                                    angle: -90,
                                    position: 'insideLeft',
                                    style: { fill: 'rgba(255,255,255,0.2)', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }
                                }}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                            {isSender ? (
                                <>
                                    <Bar dataKey="Key Gen" fill="#818cf8" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="Encryption" fill="#22c55e" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="Cloud Process" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                                </>
                            ) : (
                                <Bar dataKey="Decryption" fill="#818cf8" radius={[4, 4, 0, 0]} />
                            )}
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center gap-8 mt-6">
                    {isSender ? (
                        <>
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-[#818cf8]"></div><span className="text-white/40 text-xs font-black uppercase">Key Gen</span></div>
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-[#22c55e]"></div><span className="text-white/40 text-xs font-black uppercase">Encryption</span></div>
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-[#f59e0b]"></div><span className="text-white/40 text-xs font-black uppercase">Cloud Process</span></div>
                        </>
                    ) : (
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-[#818cf8]"></div><span className="text-white/40 text-xs font-black uppercase">Decryption</span></div>
                    )}
                </div>
            </div>

            {/* Run History Table */}
            <div className="p-8 bg-white/5 border border-white/10 rounded-[4px]">
                <div className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-6">Run History</div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-white/10">
                                <th className="text-left text-white/30 text-[10px] font-black uppercase tracking-widest py-3 px-4">#</th>
                                <th className="text-left text-white/30 text-[10px] font-black uppercase tracking-widest py-3 px-4">Timestamp</th>
                                {isSender ? (
                                    <>
                                        <th className="text-right text-white/30 text-[10px] font-black uppercase tracking-widest py-3 px-4">Key Gen</th>
                                        <th className="text-right text-white/30 text-[10px] font-black uppercase tracking-widest py-3 px-4">Encrypt</th>
                                        <th className="text-right text-white/30 text-[10px] font-black uppercase tracking-widest py-3 px-4">Cloud</th>
                                        <th className="text-right text-white/30 text-[10px] font-black uppercase tracking-widest py-3 px-4">Total</th>
                                    </>
                                ) : (
                                    <>
                                        <th className="text-right text-white/30 text-[10px] font-black uppercase tracking-widest py-3 px-4">Decrypt</th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {reports.slice(-10).reverse().map((r, i) => (
                                <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="text-white/50 font-mono py-3 px-4">{reports.length - i}</td>
                                    <td className="text-white/50 font-mono py-3 px-4">{new Date(r.timestamp).toLocaleString()}</td>
                                    {isSender ? (
                                        <>
                                            <td className="text-right text-white font-mono font-bold py-3 px-4">{r.genTime != null ? r.genTime : '—'}ms</td>
                                            <td className="text-right text-white font-mono font-bold py-3 px-4">{r.encTime != null ? r.encTime : '—'}ms</td>
                                            <td className="text-right text-white font-mono font-bold py-3 px-4">{r.cloudExecTime != null ? r.cloudExecTime : '—'}ms</td>
                                            <td className="text-right text-white font-mono font-bold py-3 px-4">{(r.genTime || 0) + (r.encTime || 0) + (r.cloudExecTime || 0)}ms</td>
                                        </>
                                    ) : (
                                        <td className="text-right text-white font-mono font-bold py-3 px-4">{r.decTime != null ? r.decTime : '—'}ms</td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ReportsPanel;
