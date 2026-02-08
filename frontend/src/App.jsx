import React, { useState } from 'react';
import Stats from './components/stats';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerUpdate = () => {
    // This flips a switch that tells the components to re-fetch data
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen container mx-auto p-4 md:p-8 max-w-4xl">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold text-blue-900">Smart Task Scheduler 🧠</h1>
        <p className="text-gray-600 mt-2">AI-driven prioritization for your workflow</p>
      </header>

      {/* Productivity Stats Dashboard */}
      <Stats refreshTrigger={refreshTrigger} />
      
      {/* Form to add new tasks */}
      <TaskForm onTaskAdded={triggerUpdate} />
      
      {/* List of tasks (Smart Sorted) */}
      <TaskList 
        refreshTrigger={refreshTrigger} 
        onUpdate={triggerUpdate} 
      />
    </div>
  );
}

export default App;