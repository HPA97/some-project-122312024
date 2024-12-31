import React, { useEffect, useState } from 'react'

export default function useDidMount() {
    const [didMount, setDidMount] = useState(false)
    useEffect(() => { setDidMount(true) }, [])
    return didMount
  }

export const TimerHandler = (
    timer: number, 
    setTimer: (value: React.SetStateAction<number>) => void,
    roundPartTimer: number,
    setElapsedPercentage: (value: React.SetStateAction<number>) => void
): NodeJS.Timeout | null => {
    if (timer <= 0) return null;

        const startTime = Date.now();
        const endTime = startTime + timer;

        const interval = setInterval(() => {
            const now = Date.now();
            const remainingTime = Math.max(endTime - now, 0);
            setTimer(remainingTime);
            setElapsedPercentage(roundPartTimer > 0 
                ? ((roundPartTimer - timer) / roundPartTimer) * 100 
                : 0);
            if (remainingTime === 0) {
                console.log("Timer finished!");
                setElapsedPercentage(roundPartTimer)
                clearInterval(interval);
            }
        }, 100);

        return interval;
}