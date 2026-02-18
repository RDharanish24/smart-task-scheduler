import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, Clock, CheckCircle } from 'lucide-react';
import ProductivityWidget from './ProductivityWidget';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [worklog, setWorklog] = useState([]); // <--- NEW STATE

  useEffect(() => {
    fetchAnalytics();
    fetchWorklog(); // <--- NEW CALL
  }, []);

  const fetchAnalytics = async () => {
    try {
        const res = await axios.get('/api/analytics/dashboard');
        setData(res.data);
    } catch (err) {
        console.error("Error fetching analytics", err);
    }
  };

  const fetchWorklog = async () => {
    try {
        const res = await axios.get('/api/analytics/worklog');
        setWorklog(res.data);
    } catch (err) {
        console.error("Error fetching worklog", err);
    }
  };

  // Helper to format minutes to "1h 30m" format
  const formatTime = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0 && m > 0) return `${h}h ${m}m`;
    if (h > 0) return `${h}h`;
    return `${m}m`;
  };

  if (!data) return <div className="p-8 text-center text-gray-500">Loading Dashboard...</div>;

  return (
    <div className="space-y-6">
      
      {/* 0. Productivity Widget */}
      <ProductivityWidget />

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

      {/* --- NEW: WORKLOG SECTION (Super Productivity Style) --- */}
      <div className="mt-8">
        <h2 className="text-2xl font-extrabold text-gray-800 mb-6 flex items-center gap-2">
            <Calendar className="text-blue-600" /> Worklog Activity
        </h2>
        
        <div className="space-y-6">
            {worklog.length === 0 ? (
                <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500 border border-gray-100">
                    No completed tasks found in your worklog yet.
                </div>
            ) : (
                worklog.map((day) => (
                    <div key={day.date} className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
                        
                        {/* Day Header */}
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-gray-800 text-lg">{day.display_date}</h3>
                            <div className="flex gap-4 text-sm font-semibold text-gray-600">
                                <span className="flex items-center gap-1 bg-white px-3 py-1 rounded-full border">
                                    <CheckCircle size={14} className="text-green-500" /> {day.tasks_count} tasks
                                </span>
                                <span className="flex items-center gap-1 bg-white px-3 py-1 rounded-full border">
                                    <Clock size={14} className="text-blue-500" /> {formatTime(day.total_time)}
                                </span>
                            </div>
                        </div>

                        {/* Tasks List for that Day */}
                        <div className="divide-y divide-gray-50">
                            {day.tasks.map(task => (
                                <div key={task.id} className="px-6 py-3 flex justify-between items-center hover:bg-gray-50 transition">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${task.priority === 'high' ? 'bg-red-500' : task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                                        <span className="text-gray-700 font-medium">{task.title}</span>
                                    </div>
                                    <div className="text-gray-500 text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                                        {formatTime(task.time_spent)}
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>
                ))
            )}
        </div>
      </div>
      {/* --- END WORKLOG --- */}

    </div>
  );
};

export default Dashboard;