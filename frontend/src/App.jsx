import React, { useState } from 'react';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import Dashboard from './components/dashboard';
import { LayoutDashboard, ListTodo } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('list'); // 'list' or 'dashboard'
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerUpdate = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold text-blue-900">Smart Scheduler 🧠</h1>
            <p className="text-gray-600">AI-driven productivity</p>
          </div>
          
          {/* Navigation Tabs */}
          <div className="flex bg-white rounded-lg shadow p-1">
            <button 
                onClick={() => setActiveTab('list')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition ${activeTab === 'list' ? 'bg-blue-100 text-blue-700 font-bold' : 'text-gray-500 hover:bg-gray-50'}`}
            >
                <ListTodo size={20} /> Tasks
            </button>
            <button 
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition ${activeTab === 'dashboard' ? 'bg-blue-100 text-blue-700 font-bold' : 'text-gray-500 hover:bg-gray-50'}`}
            >
                <LayoutDashboard size={20} /> Analytics
            </button>
          </div>
        </header>

        {activeTab === 'list' ? (
            <>
                {/* We can remove the old Stats component since we have a full dashboard now */}
                <TaskForm onTaskAdded={triggerUpdate} />
                <TaskList refreshTrigger={refreshTrigger} onUpdate={triggerUpdate} />
            </>
        ) : (
            <Dashboard />
        )}
      </div>
    </div>
  );
}

export default App;