import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const Dashboard = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
        const res = await axios.get('/api/analytics/dashboard');
        setData(res.data);
    } catch (err) {
        console.error("Error fetching analytics", err);
    }
  };

  if (!data) return <div className="p-8 text-center text-gray-500">Loading Dashboard...</div>;

  return (
    <div className="space-y-6">
      {/* 1. Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow border-t-4 border-blue-500">
            <h3 className="text-gray-500 text-sm font-bold uppercase">Total Tasks</h3>
            <p className="text-4xl font-extrabold text-gray-800">{data.total}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-t-4 border-green-500">
            <h3 className="text-gray-500 text-sm font-bold uppercase">Completed</h3>
            <p className="text-4xl font-extrabold text-green-600">{data.completed}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-t-4 border-yellow-500">
            <h3 className="text-gray-500 text-sm font-bold uppercase">Pending</h3>
            <p className="text-4xl font-extrabold text-yellow-600">{data.pending}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 2. Priority Distribution (Pie) */}
        <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-bold mb-4 text-gray-700">Task Priorities</h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data.priority_distribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {data.priority_distribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* 3. Productivity Trend (Bar) */}
        <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-bold mb-4 text-gray-700">Tasks Completed (Last 7 Days)</h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.productivity_trend}>
                        <XAxis dataKey="date" tick={{fontSize: 12}} />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#8884d8" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
                {data.productivity_trend.length === 0 && (
                    <p className="text-center text-gray-400 text-sm mt-[-100px]">No data yet. Complete some tasks!</p>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;