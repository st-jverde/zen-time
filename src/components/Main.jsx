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

    const toggleTimer = () => {
        setIsRunning(!isRunning);
    }

    const resetTimer = () => {
        setIsRunning(false);
        setCountdown(selectedTime * 60);
    }

    const minutes = Math.floor(countdown / 60);
    const seconds = countdown % 60;

    return (
        <div className="flex-1 ml-64 bg-dark flex items-center justify-center">
            <div className="text-center">
                <div className="text-9xl mb-4 text-main">
                    <h1 className='text-main'>
                    {`${minutes}:${seconds < 10 ? '0' + seconds : seconds}`}
                    </h1>
                </div>
                <button
                    onClick={toggleTimer}
                    className="mr-4 bg-sec hover:bg-ter text-ter hover:text-sec px-4 py-2 rounded"
                >
                    {isRunning ? 'Pause' : 'Start'}
                </button>
                <button
                    onClick={resetTimer}
                    className="bg-ter hover:bg-sec text-sec hover:text-ter px-4 py-2 rounded"
                >
                    Reset
                </button>
            </div>
        </div>
    );
};

export default Main;
