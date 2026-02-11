import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { CheckCircle, Trash2, Lock, AlertCircle } from 'lucide-react';
import TaskTimer from './TaskTimer'; // <--- NEW IMPORT

const TaskList = ({ refreshTrigger, onUpdate }) => {
  const [tasks, setTasks] = useState([]);
  const [viewMode, setViewMode] = useState('smart'); // 'smart' or 'all'

  useEffect(() => {
    fetchTasks();
  }, [refreshTrigger, viewMode]);

  const fetchTasks = async () => {
    try {
        const endpoint = viewMode === 'smart' ? 'smart-order' : '';
        const res = await axios.get(`/api/tasks/${endpoint}`);
        setTasks(res.data);
    } catch (err) {
        console.error("Failed to fetch tasks", err);
    }
  };

  const handleComplete = async (id) => {
    await axios.post(`/api/tasks/${id}/complete`);
    onUpdate();
  };

  const handleDelete = async (id) => {
    await axios.delete(`/api/tasks/${id}`);
    onUpdate();
  };

  const getPriorityColor = (p) => {
    if (p === 'high') return 'bg-red-100 text-red-800';
    if (p === 'medium') return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  return (
    <div className="bg-white rounded shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
            {viewMode === 'smart' ? '✨ Smart Schedule' : '📋 All Tasks'}
        </h2>
        <div className="flex gap-2 text-sm">
            <button 
                onClick={() => setViewMode('smart')}
                className={`px-3 py-1 rounded ${viewMode === 'smart' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
            >
                Smart Sort
            </button>
            <button 
                onClick={() => setViewMode('all')}
                className={`px-3 py-1 rounded ${viewMode === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
            >
                Raw List
            </button>
        </div>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <div key={task.id} className={`flex items-center justify-between p-3 border rounded hover:shadow-md transition ${task.is_completed ? 'opacity-50 bg-gray-50' : ''}`}>
            
            {/* Left Side: Task Info */}
            <div className="flex-1">
                <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded uppercase font-bold ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                    </span>
                    {task.is_locked && <Lock size={14} className="text-gray-400" title="Locked from Auto-Reschedule" />}
                    <span className={`font-medium ${task.is_completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                        {task.title}
                    </span>
                </div>
                {task.deadline && (
                    <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <AlertCircle size={12} /> Due: {new Date(task.deadline).toLocaleString()}
                    </div>
                )}
            </div>

            {/* Right Side: Actions */}
            <div className="flex items-center gap-4">
                
                {/* 1. TIMER WIDGET (Only for pending tasks) */}
                {!task.is_completed && (
                    <TaskTimer taskId={task.id} initialActual={task.actual_duration} />
                )}

                {/* 2. Action Buttons */}
                <div className="flex gap-2">
                    {!task.is_completed && (
                        <button onClick={() => handleComplete(task.id)} className="text-green-600 hover:text-green-800 p-1">
                            <CheckCircle size={20} />
                        </button>
                    )}
                    <button onClick={() => handleDelete(task.id)} className="text-red-500 hover:text-red-700 p-1">
                        <Trash2 size={20} />
                    </button>
                </div>
            </div>

          </div>
        ))}
        {tasks.length === 0 && <p className="text-center text-gray-500 py-4">No tasks found. Add one! 🚀</p>}
      </div>
    </div>
  );
};

export default TaskList;