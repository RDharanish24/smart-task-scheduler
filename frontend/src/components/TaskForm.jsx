import React, { useState } from 'react';
import axios from 'axios';
import { PlusCircle } from 'lucide-react';

const TaskForm = ({ onTaskAdded }) => {
  const [formData, setFormData] = useState({
    title: '',
    priority: 'low',
    deadline: '',
    is_locked: false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const payload = { ...formData };
        if (!payload.deadline) delete payload.deadline; // Don't send empty deadline

        await axios.post('/api/tasks/', payload);
        
        // Reset form
        setFormData({ title: '', priority: 'low', deadline: '', is_locked: false });
        onTaskAdded(); // Refresh list
    } catch (error) {
        alert("Error creating task. Is backend running?");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow mb-6">
      <div className="flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="block text-sm font-medium text-gray-700">Task Title</label>
          <input 
            type="text" 
            required
            className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
          />
        </div>
        
        <div className="w-full md:w-32">
            <label className="block text-sm font-medium text-gray-700">Priority</label>
            <select 
                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2"
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value})}
            >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
            </select>
        </div>

        <div className="w-full md:w-48">
            <label className="block text-sm font-medium text-gray-700">Deadline</label>
            <input 
                type="datetime-local"
                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2"
                value={formData.deadline}
                onChange={(e) => setFormData({...formData, deadline: e.target.value})}
            />
        </div>

        <div className="flex items-center pb-3">
            <input 
                type="checkbox" 
                className="h-4 w-4 text-blue-600 rounded"
                checked={formData.is_locked}
                onChange={(e) => setFormData({...formData, is_locked: e.target.checked})}
            />
            <label className="ml-2 text-sm text-gray-900">Lock</label>
        </div>

        <button type="submit" className="w-full md:w-auto bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center justify-center gap-2">
            <PlusCircle size={18} /> Add
        </button>
      </div>
    </form>
  );
};

export default TaskForm;