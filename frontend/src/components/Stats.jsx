import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Stats = ({ refreshTrigger }) => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    // Fetch stats from backend
   axios.get('/api/tasks/stats')
      .then(res => setStats(res.data))
      .catch(err => console.error(err));
  }, [refreshTrigger]);

  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white p-4 rounded shadow border-l-4 border-blue-500">
        <h3 className="text-gray-500 text-sm">Total Tasks</h3>
        <p className="text-2xl font-bold">{stats.total_tasks}</p>
      </div>
      <div className="bg-white p-4 rounded shadow border-l-4 border-green-500">
        <h3 className="text-gray-500 text-sm">Completed</h3>
        <p className="text-2xl font-bold">{stats.completed}</p>
      </div>
      <div className="bg-white p-4 rounded shadow border-l-4 border-purple-500">
        <h3 className="text-gray-500 text-sm">Efficiency</h3>
        <p className="text-2xl font-bold">{stats.completion_rate}</p>
      </div>
    </div>
  );
};

export default Stats;