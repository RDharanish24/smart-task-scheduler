import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Activity, Zap, AlertTriangle } from 'lucide-react';

const ProductivityWidget = () => {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get('/api/productivity/dashboard');
                setStats(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchStats();
    }, []);

    if (!stats) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* 1. Score Card */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 rounded-xl text-white shadow-lg flex items-center justify-between">
                <div>
                    <p className="text-indigo-100 text-sm font-medium">Productivity Score</p>
                    <h2 className="text-4xl font-bold">{stats.productivity_score}</h2>
                </div>
                <Activity size={40} className="opacity-50" />
            </div>

            {/* 2. Time Card */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-1">
                    <Zap className="text-yellow-500" size={18} />
                    <span className="text-gray-500 text-sm font-medium">Focus Time</span>
                </div>
                <div className="flex justify-between items-end">
                    <div>
                        <span className="text-2xl font-bold text-gray-800">{stats.time_stats.hours_today}</span>
                        <span className="text-xs text-gray-400 ml-1">hrs today</span>
                    </div>
                    <div className="text-right">
                        <span className="text-lg font-semibold text-gray-600">{stats.time_stats.hours_week}</span>
                        <span className="text-xs text-gray-400 ml-1">hrs week</span>
                    </div>
                </div>
            </div>

            {/* 3. Burnout Alert (Conditional) */}
            <div className={`p-4 rounded-xl border shadow-sm flex items-center gap-3 ${stats.burnout_risk.detected ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                {stats.burnout_risk.detected ? (
                    <>
                        <AlertTriangle className="text-red-500" size={32} />
                        <div>
                            <p className="text-red-800 font-bold text-sm">Burnout Risk Detected</p>
                            <p className="text-red-600 text-xs">{stats.burnout_risk.reason}</p>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="bg-green-100 p-2 rounded-full">
                            <span className="text-xl">🌿</span>
                        </div>
                        <div>
                            <p className="text-green-800 font-bold text-sm">Healthy Balance</p>
                            <p className="text-green-600 text-xs">Keep up the good pace!</p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ProductivityWidget;