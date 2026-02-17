import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { CheckCircle, Trash2, Lock, AlertCircle, PlayCircle } from 'lucide-react';
import TaskTimer from './TaskTimer';
import FocusModal from './FocusModal'; // <--- Import Modal

const TaskList = ({ refreshTrigger, onUpdate }) => {
  const [tasks, setTasks] = useState([]);
  const [viewMode, setViewMode] = useState('smart');
  const [selectedTask, setSelectedTask] = useState(null); // <--- For Modal

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

  const handleDelete = async (e, id) => {
    e.stopPropagation(); // Prevent opening modal
    await axios.delete(`/api/tasks/${id}`);
    onUpdate();
  };

  const getPriorityColor = (p) => {
    if (p === 'high') return 'bg-red-100 text-red-800';
    if (p === 'medium') return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  return (
    <>
        <div className="bg-white rounded shadow p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
                {viewMode === 'smart' ? '✨ Smart Schedule' : '📋 All Tasks'}
            </h2>
            <div className="flex gap-2 text-sm">
                <button onClick={() => setViewMode('smart')} className={`px-3 py-1 rounded ${viewMode === 'smart' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>Smart Sort</button>
                <button onClick={() => setViewMode('all')} className={`px-3 py-1 rounded ${viewMode === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>Raw List</button>
            </div>
          </div>

          <div className="space-y-3">
            {tasks.map((task) => (
              <div 
                key={task.id} 
                onClick={() => !task.is_completed && setSelectedTask(task)} // <--- CLICK TO OPEN MODAL
                className={`group flex items-center justify-between p-4 border rounded-xl hover:shadow-lg hover:border-blue-300 transition cursor-pointer ${task.is_completed ? 'opacity-50 bg-gray-50' : 'bg-white'}`}
              >
                
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded uppercase font-bold ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                        </span>
                        <span className={`font-medium text-lg ${task.is_completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                            {task.title}
                        </span>
                    </div>
                    {task.deadline && (
                        <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <AlertCircle size={12} /> Due: {new Date(task.deadline).toLocaleString()}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    {/* Hover Hint */}
                    {!task.is_completed && (
                        <div className="hidden group-hover:flex items-center gap-1 text-blue-600 text-sm font-bold bg-blue-50 px-3 py-1 rounded-full">
                            <PlayCircle size={16} /> Start
                        </div>
                    )}

                    {/* Delete Button */}
                    <button onClick={(e) => handleDelete(e, task.id)} className="text-gray-400 hover:text-red-500 p-2">
                        <Trash2 size={20} />
                    </button>
                </div>

              </div>
            ))}
            {tasks.length === 0 && <p className="text-center text-gray-500 py-4">No tasks found. Add one! 🚀</p>}
          </div>
        </div>

        {/* --- MODAL POPUP --- */}
        {selectedTask && (
            <FocusModal 
                task={selectedTask} 
                onClose={() => setSelectedTask(null)} 
                onUpdate={() => {
                    setSelectedTask(null);
                    onUpdate();
                    fetchTasks(); // Refresh list to show it moved to completed
                }} 
            />
        )}
    </>
  );
};

export default TaskList;