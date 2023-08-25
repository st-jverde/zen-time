import React, { useState, useEffect } from 'react';
import '../tailwind.css';

const Main = ({ selectedTime }) => {
    const [countdown, setCountdown] = useState(selectedTime * 60); // Convert to seconds
    const [isRunning, setIsRunning] = useState(false);

    useEffect(() => {
        setCountdown(selectedTime * 60);
    }, [selectedTime]);

    useEffect(() => {
        let timer;
        if (isRunning && countdown > 0) {
            timer = setInterval(() => {
                setCountdown((prevCountdown) => prevCountdown - 1);
            }, 1000);
        } else {
            setIsRunning(false);
        }
        return () => clearInterval(timer);
    }, [isRunning, countdown]);

    const startTimer = () => {
        setIsRunning(true);
    }

    const stopTimer = () => {
        setIsRunning(false);
    }

    const minutes = Math.floor(countdown / 60);
    const seconds = countdown % 60;

    return (
        <div className="flex-1 ml-64 bg-dark flex items-center justify-center">
            <div className="text-center">
                <div className="text-9xl mb-4 text-main">
                    <h1 className='text-main-1'>
                    {`${minutes}:${seconds < 10 ? '0' + seconds : seconds}`}
                    </h1>    
                </div>
                <button 
                    onClick={startTimer} 
                    className="mr-4 bg-secondary-2 hover:bg-nav text-tertiary hover:text-secondary-1 px-4 py-2 rounded"
                >
                    Start
                </button>
                <button 
                    onClick={stopTimer} 
                    className="bg-nav hover:bg-secondary-2 text-secondary-1 hover:text-tertiary px-4 py-2 rounded"
                >
                    Stop
                </button>
            </div>
        </div>
    );
};

export default Main;