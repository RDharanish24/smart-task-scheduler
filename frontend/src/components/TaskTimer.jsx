import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Play, Square, Clock } from 'lucide-react';

const TaskTimer = ({ taskId, initialActual }) => {
    const [isRunning, setIsRunning] = useState(false);
    const [seconds, setSeconds] = useState(0);
    const [totalMinutes, setTotalMinutes] = useState(initialActual || 0);

    useEffect(() => {
        let interval = null;
        if (isRunning) {
            interval = setInterval(() => {
                setSeconds(s => s + 1);
            }, 1000);
        } else {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isRunning]);

    const handleStart = async () => {
        try {
            await axios.post(`/api/productivity/timer/${taskId}/start`);
            setIsRunning(true);
        } catch (err) {
            console.error("Timer failed", err);
        }
    };

    const handleStop = async () => {
        try {
            const res = await axios.post(`/api/productivity/timer/${taskId}/stop`);
            setIsRunning(false);
            setSeconds(0);
            setTotalMinutes(res.data.total_actual);
            if (res.data.alert) alert(res.data.alert);
        } catch (err) {
            console.error("Stop failed", err);
        }
    };

    return (
        <div className="flex items-center gap-3 bg-gray-50 px-3 py-1 rounded-full border">
            <div className="text-xs font-mono text-gray-600 flex items-center gap-1">
                <Clock size={12} />
                {totalMinutes}m logged
            </div>
            
            {isRunning ? (
                <button onClick={handleStop} className="text-red-500 hover:text-red-700 animate-pulse">
                    <Square size={16} fill="currentColor" />
                </button>
            ) : (
                <button onClick={handleStart} className="text-green-500 hover:text-green-700">
                    <Play size={16} fill="currentColor" />
                </button>
            )}
            
            {isRunning && (
                <span className="text-xs font-bold text-blue-600 min-w-[40px]">
                    {new Date(seconds * 1000).toISOString().substr(14, 5)}
                </span>
            )}
        </div>
    );
};

export default TaskTimer;