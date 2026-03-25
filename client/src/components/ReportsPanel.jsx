import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BarChart2, Clock, Zap } from 'lucide-react';
import ReportService from '../services/report.service';

export const saveReport = async (role, data, userId) => {
    try {
        const response = await ReportService.saveReport(role, data);
        console.log('Report saved to backend:', response.data);
        return response.data;
    } catch (err) {
        console.error('Error saving report:', err);
        throw err;
    }
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
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const isSender = role !== 'Receiver';

    useEffect(() => {
        const fetchReports = async () => {
            try {
                setLoading(true);
                const response = await ReportService.getUserReports(role);
                console.log('Fetched reports from backend:', response.data);
                setReports(response.data.reports || []);
                setError('');
            } catch (err) {
                console.error('Error fetching reports:', err);
                setError('Failed to fetch reports from server');
                setReports([]);
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchReports();
        }
    }, [role, userId]);

    // Debug logging
    console.log('ReportsPanel Debug:', {
        userId,
        role,
        isSender,
        reportsCount: reports.length,
        reports,
        loading,
        error
    });

    if (loading) {
        return (
            <div className="space-y-10">
                <h2 className="text-2xl font-black text-white tracking-tighter border-l-4 border-white pl-4 mb-6 uppercase italic">
                    Process Reports
                </h2>
                <div className="flex flex-col items-center justify-center py-32 text-center">
                    <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-8 animate-spin">
                        <BarChart2 size={40} className="text-white/20" />
                    </div>
                    <h3 className="text-2xl font-black text-white/30 uppercase tracking-tight mb-4">
                        Loading Reports...
                    </h3>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-10">
                <h2 className="text-2xl font-black text-white tracking-tighter border-l-4 border-white pl-4 mb-6 uppercase italic">
                    Process Reports
                </h2>
                <div className="flex flex-col items-center justify-center py-32 text-center">
                    <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-8">
                        <BarChart2 size={40} className="text-red-400" />
                    </div>
                    <h3 className="text-2xl font-black text-red-400 uppercase tracking-tight mb-4">
                        Error Loading Reports
                    </h3>
                    <p className="text-red-300 text-sm max-w-md">
                        {error}
                    </p>
                </div>
            </div>
        );
    }

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
            'Homomorphic Proof': r.decPhase1Time || 0,
            'Original Recovery': r.decPhase2Time || 0,
        }));
    }

    // Latest run summary
    const latestReport = reports[reports.length - 1];
    
    // Validate that we have the required timing data
    const hasValidData = isSender 
        ? latestReport.genTime !== undefined && latestReport.encTime !== undefined && latestReport.cloudExecTime !== undefined
        : latestReport.decPhase1Time !== undefined && latestReport.decPhase2Time !== undefined;
    
    if (!hasValidData) {
        console.warn('Invalid report data:', latestReport);
    }
    
    const summaryItems = isSender ? [
        { label: 'Key Generation', value: latestReport.genTime, icon: <Zap size={16} /> },
        { label: 'Encryption', value: latestReport.encTime, icon: <Zap size={16} /> },
        { label: 'Cloud Processing', value: latestReport.cloudExecTime, icon: <Zap size={16} /> },
    ] : [
        { label: 'Homomorphic Proof', value: latestReport.decPhase1Time, icon: <Zap size={16} /> },
        { label: 'Original Recovery', value: latestReport.decPhase2Time, icon: <Zap size={16} /> },
    ];

    const totalTime = summaryItems.reduce((acc, item) => acc + (item.value || 0), 0);

    return (
        <div className="space-y-10">
            <h2 className="text-2xl font-black text-white tracking-tighter border-l-4 border-white pl-4 mb-6 uppercase italic">
                Process Reports
            </h2>

            {/* Latest Run Summary Cards */}
            <div className={`grid gap-4 ${isSender ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
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
                                <>
                                    <Bar dataKey="Homomorphic Proof" fill="#818cf8" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="Original Recovery" fill="#22c55e" radius={[4, 4, 0, 0]} />
                                </>
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
                        <>
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-[#818cf8]"></div><span className="text-white/40 text-xs font-black uppercase">Homomorphic Proof</span></div>
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-[#22c55e]"></div><span className="text-white/40 text-xs font-black uppercase">Original Recovery</span></div>
                        </>
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
                                        <th className="text-right text-white/30 text-[10px] font-black uppercase tracking-widest py-3 px-4">Homomorphic Proof</th>
                                        <th className="text-right text-white/30 text-[10px] font-black uppercase tracking-widest py-3 px-4">Original Recovery</th>
                                        <th className="text-right text-white/30 text-[10px] font-black uppercase tracking-widest py-3 px-4">Total</th>
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
                                        <>
                                            <td className="text-right text-white font-mono font-bold py-3 px-4">{r.decPhase1Time != null ? r.decPhase1Time : '—'}ms</td>
                                            <td className="text-right text-white font-mono font-bold py-3 px-4">{r.decPhase2Time != null ? r.decPhase2Time : '—'}ms</td>
                                            <td className="text-right text-white font-mono font-bold py-3 px-4">{(r.decPhase1Time || 0) + (r.decPhase2Time || 0)}ms</td>
                                        </>
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
