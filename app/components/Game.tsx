import React, { createContext, useContext, useState, useEffect } from 'react'
import Board from './Board';
import { UserContext, ConnectionInfoContext } from './App';
import { Socket } from 'socket.io-client';
import useDidMount from './Utils';
import {
    UserType, RoomType, 
    ServerResponse, ServerResponseMatter,
    RoundState
} from '../../common/types';
import './styles/BoardStyles.css';
import GameInfoBottom from './GameInfoBottom';

const SocketCommunicationSetup = (socket: Socket | null, ServerEvents: (response: ServerResponse) => void) => {    
    if(!socket) console.error("SetupRoom: Expected socket to be valid");
    socket!.on("response", (response: ServerResponse) => {
        ServerEvents(response);
    });
}

export const RoomContext = createContext<RoomType | null>(null);

const Game = () => {
    const didMount = useDidMount()
    const {userId, username} = useContext(UserContext);
    const {socket} = useContext(ConnectionInfoContext);

    const [isGameConnected, setIsGameConnected] = useState<boolean>(false);
    const [userInfo, setUserInfo] = useState<UserType>({id: userId, username: username ?? ""})
    const [roomInfo, setRoomInfo] = useState<RoomType | null>(null);
    const [waiting, setWaiting] = useState<Boolean>(false);

    useEffect(() => {
        if(didMount) {
            SocketCommunicationSetup(socket, ServerEvents);
        }     
    }, [roomInfo]);

    const JoinGameRequest = () => {
        setWaiting(true);
        console.log("Bro wants to join a game...");
        socket!.emit("join-game-request", ServerEvents);
    }

    const ServerEvents = (response: ServerResponse) => {
        //console.log("RESPONSE: " + JSON.stringify(response));
        switch(response.matter) {
            case ServerResponseMatter.NEW_ROOM_SETUP: {
                SetupRoom(response);
                break;
            }
            case ServerResponseMatter.NEXT_ROUND_PART: {
                NextRoundState(response);
                break;
            }
            default: {
               console.error("Unrecognized ServerResponseMatter: " + response.matter);
               break;
            }
         }         
    }

    const SetupRoom = (response: ServerResponse) => {
        if(!response.newRoom) return;
        const newRoom: RoomType = response.newRoom;
        //console.log("Server has set this room: " + JSON.stringify(newRoom) + " for us");
        setRoomInfo(newRoom);
        setWaiting(false);
    }

    const NextRoundState = (response: ServerResponse) => {
        if(!roomInfo || !response.newRoom) return;
        console.log("From round state: " + RoundState[roomInfo!.matchState.roundState] + " to: " + RoundState[response.newRoom!.matchState.roundState]);
        setRoomInfo(response.newRoom);
    }

    return (
        <div className='bg-gray-300 border-black border-spacing-4'>
            <div className="heading">Game</div>
            <div className="text-lg mb-4">
                Welcome, <span className="font-semibold">{username}</span> with ID: <span className="font-semibold">{userId}</span>!{' '}
                {isGameConnected ? (
                    <span className="status-connected">Connected to server.</span>
                ) : (
                    <span className="status-disconnected">Not connected.</span>
                )}
            </div>
            <button
                hidden={isGameConnected}
                onClick={() => {
                    setIsGameConnected(true);
                    JoinGameRequest();
                }}
                className="button button-primary"
            >
                Search for game
            </button>
            {waiting ? <h2 className="waiting-text">Waiting for a match...</h2> : null}   
            {isGameConnected 
                ? <RoomContext.Provider value={roomInfo}>                    
                    <Board />
                    <GameInfoBottom />
                </RoomContext.Provider>                 
                : null}                     
        </div>
    );
}

export default Game