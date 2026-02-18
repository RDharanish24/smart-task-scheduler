import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Play, CheckCircle, X, Clock, Award } from 'lucide-react';

const FocusModal = ({ task, onClose, onUpdate }) => {
    const [status, setStatus] = useState('prep'); 
    const [estimate, setEstimate] = useState(task.estimated_duration || 30);
    
    // FIX 1: Ensure it doesn't turn into NaN (Not a Number) if actual_duration is missing
    const [elapsed, setElapsed] = useState((task.actual_duration || 0) * 60); 
    const [result, setResult] = useState(null);

    useEffect(() => {
        let interval;
        if (status === 'running') {
            interval = setInterval(() => setElapsed(e => e + 1), 1000);
        }
        return () => clearInterval(interval);
    }, [status]);

    const handleStart = async () => {
        try {
            // FIX 2: Better error catching
            await axios.post(`/api/productivity/timer/${task.id}/start`);
            setStatus('running');
        } catch (err) {
            console.error("Start Timer Error:", err);
            alert("Backend Error! Did you add the productivity router to main.py? Check your backend terminal.");
            
            // Optional: Force the UI to run anyway so you can test the visuals
            // setStatus('running'); 
        }
    };

    const handleFinish = async () => {
        try {
            const res = await axios.post(`/api/productivity/tasks/${task.id}/finish-focus`);
            setResult(res.data);
            setStatus('result');
            onUpdate(); 
        } catch (err) {
            console.error(err);
            alert("Failed to finish task. Check backend terminal.");
        }
    };

    const formatTime = (secs) => {
        const m = Math.floor(secs / 60).toString().padStart(2, '0');
        const s = (secs % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

// ... keep the return (...) statement exactly the same as before ...

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden relative">
                
                {/* Close Button */}
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <X size={24} />
                </button>

                {/* --- STATE 1: PREP --- */}
                {status === 'prep' && (
                    <div className="p-8 text-center">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Play size={32} className="text-blue-600 ml-1" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">{task.title}</h2>
                        <p className="text-gray-500 mb-6">Ready to enter flow state?</p>
                        
                        <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Estimated Time (Mins)</label>
                            <input 
                                type="number" 
                                value={estimate} 
                                onChange={(e) => setEstimate(parseInt(e.target.value))}
                                className="w-full text-3xl font-mono font-bold bg-transparent border-b-2 border-blue-200 focus:border-blue-500 outline-none"
                            />
                        </div>

                        <button 
                            onClick={handleStart}
                            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-lg shadow-lg transform transition hover:scale-[1.02]"
                        >
                            START FOCUS TIMER
                        </button>
                    </div>
                )}

                {/* --- STATE 2: RUNNING --- */}
                {status === 'running' && (
                    <div className="p-8 text-center bg-gray-900 text-white">
                        <div className="animate-pulse mb-4">
                            <div className="inline-block px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-bold tracking-widest uppercase">
                                ● Live Recording
                            </div>
                        </div>
                        
                        <div className="text-7xl font-mono font-bold tracking-tighter mb-8 tabular-nums">
                            {formatTime(elapsed)}
                        </div>

                        <p className="text-gray-400 mb-8 text-lg">{task.title}</p>

                        <button 
                            onClick={handleFinish}
                            className="w-full py-4 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold text-lg shadow-lg flex items-center justify-center gap-2"
                        >
                            <CheckCircle /> FINISHED TASK
                        </button>
                    </div>
                )}

                {/* --- STATE 3: RESULT --- */}
                {status === 'result' && result && (
                    <div className="p-8 text-center">
                        <div className="mb-4 flex justify-center">
                            {result.type === 'success' ? (
                                <Award size={64} className="text-yellow-500 drop-shadow-lg" />
                            ) : (
                                <Clock size={64} className="text-orange-500" />
                            )}
                        </div>
                        
                        <h2 className="text-3xl font-extrabold text-gray-800 mb-2">
                            {result.points_earned > 0 ? `+${result.points_earned} Points` : `${result.points_earned} Points`}
                        </h2>
                        
                        <p className={`text-lg font-medium mb-6 ${result.type === 'success' ? 'text-green-600' : 'text-orange-600'}`}>
                            {result.message}
                        </p>

                        <div className="bg-gray-50 rounded-lg p-4 mb-6 flex justify-between text-sm">
                            <div className="text-center">
                                <span className="block text-gray-400 uppercase text-xs">Estimated</span>
                                <span className="font-bold text-gray-700 text-lg">{estimate}m</span>
                            </div>
                            <div className="text-center border-l pl-4">
                                <span className="block text-gray-400 uppercase text-xs">Actual</span>
                                <span className={`font-bold text-lg ${result.final_duration > estimate ? 'text-red-500' : 'text-green-500'}`}>
                                    {result.final_duration}m
                                </span>
                            </div>
                        </div>

                        <button 
                            onClick={onClose}
                            className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-bold"
                        >
                            Close
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FocusModal;