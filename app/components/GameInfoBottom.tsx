import React, {useContext, useState, useEffect} from 'react'
import { RoomContext } from './Game';
import {RoundState, GameRules, PlayerHand, Card} from '../../common/types';
import {TimerHandler} from './Utils';

const GameInfo: () => React.JSX.Element | null = () => {
    const roomInfo = useContext(RoomContext);    
    const matchState = roomInfo?.matchState;        
    const timerHurryMarginPercentageOfMax = 5;
    const isPlayerA = matchState ? matchState.playerAHands ? true : false : null;
    const points = matchState ? isPlayerA ? matchState.playerAHands : matchState.playerBHands : -1;        
    
    const [round, setRound] = useState<number>(-1);
    const [roundState, setRoundState] = useState<RoundState>(0);
    const [roundPartTimer, setRoundPartTimer] = useState<number>(0);
    const [timer, setTimer] = useState<number>(0);
    const [elapsedPercentage, setElapsedPercentage] = useState<number>(0);
    const [roundPartTrigger, setRoundPartTrigger] = useState<number>(0);

    useEffect(() => {
        if(!roomInfo) return;
        setRound(roomInfo!.matchState.round);
        setRoundState(roomInfo!.matchState.roundState);
        setRoundPartTimer(roomInfo!.matchState.roundPartTimerMilliseconds);
        setRoundPartTrigger((prev) => prev + 1);
    }, [roomInfo])

    useEffect(() => {        
        setTimer(roundPartTimer - ((roundPartTimer / 100) * timerHurryMarginPercentageOfMax));
    }, [roundPartTrigger]);

    useEffect(() => {
        const interval = TimerHandler(timer, setTimer, roundPartTimer, setElapsedPercentage);
        if(interval) return () => clearInterval(interval);        
    }, [timer]);

    return (
        roomInfo ? (
            <div className="min-w-board-min-width max-w-board-max-width p-4">
                <h3 className="text-lg font-semibold mb-2">
                    {`IsPlayerA: ${isPlayerA}`}
                </h3>
                <h3 className="text-lg font-semibold mb-2">
                    {`ROUND: ${round} [${RoundState[roundState]}]`}
                </h3>
                <div className="w-full h-6 bg-gray-300 rounded-lg overflow-hidden">
                    <div
                        className="h-full bg-orange-400 transition-all duration-100 ease-linear"
                        style={{ width: `${elapsedPercentage}%` }}
                    ></div>
                </div>
                <p className="text-center mt-2 text-sm font-medium text-gray-700">
                    {Math.ceil(timer / 1000)}s remaining
                </p>
            </div>
        ) : null
    );
}

export default GameInfo