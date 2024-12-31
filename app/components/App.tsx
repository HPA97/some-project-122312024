'use client';
import React from 'react'
import { createContext, useState, useRef, useEffect} from "react";
import { io, Socket } from 'socket.io-client';
import Login from './Login';
import Game from './Game';
import useDidMount from './Utils';

type UserInfoType = {
  userId: string;
  setUserId: (userId: string) => void;
  username: string | null;
  setUsername: (username: string) => void;
  loggedIn: boolean;
  setLoggedIn: (loggedIn: boolean) => void;
};

const DefaultUserInfo: UserInfoType = {
  userId: '0',
  setUserId: () => {},
  username: null,
  setUsername: () => {},
  loggedIn: false,
  setLoggedIn: () => {},
};

type ConnectionInfoType = {
  socket: Socket | null;
  setSocket: React.Dispatch<React.SetStateAction<Socket | null>>;
  isConnected: boolean;
};

const DefaultConnectionInfoType = {
  socket: null,
  setSocket: () => {},
  isConnected: false
}

export const UserContext= createContext<UserInfoType>(DefaultUserInfo);
export const ConnectionInfoContext= createContext<ConnectionInfoType>(DefaultConnectionInfoType);

const ConnectToServer = (
  socket: Socket | null, 
  setSocket: React.Dispatch<React.SetStateAction<Socket | null>>,
  setUserId: React.Dispatch<React.SetStateAction<string>>,
  setIsConnected: React.Dispatch<React.SetStateAction<boolean>>,
  username: String | null,
  callback: (socket: Socket | null, userId: String, username: String) => void
  ) => {
  if (!socket) {
    console.log('Connecting to game server');
    const newSocket = io('http://localhost:9000');
    
    setSocket(newSocket);

    newSocket.on('connect', () => {
      if (newSocket.id) {
      console.log('Client connected as id: ' + newSocket.id);
      setUserId(newSocket.id);
      setIsConnected(true);
      console.log('Connected to server');
      callback(newSocket, newSocket.id, username ?? "");
    } else {
      console.error('Socket ID is undefined');
    }
  });
  } else {
    console.warn('Already connected or connecting.');
    return;
  }  
}

const RegisterUsername = (
  socket: Socket | null,
  userId: String,
  username: String
  ) => {
  if (socket) {
    console.log('Registering user');    
    socket.emit("register-user", userId, username)
  } else {
    console.error('RegisterUsername: Socket not connected or non existent when it was supposed to');
    return;
  }
}

const App = () => {    
  const didMount = useDidMount();
  const [userId, setUserId] = useState<string>('0');
  const [username, setUsername] = useState<string | null>(null);
  const [loggedIn, setLoggedIn] = useState<boolean>(false);

  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    if(didMount) {
      console.log("Username changed to: " + username)
      ConnectToServer(socket, setSocket, setUserId, setIsConnected, username, RegisterUsername); 
    }    
  }, [username, loggedIn]);

  const connectToServer = () => {
    console.log("connectToServer");
  };

  return (
    <ConnectionInfoContext.Provider
      value={{
        socket,
        setSocket,
        isConnected
      }}
    >
      <UserContext.Provider
        value={{
          userId,
          setUserId,
          username,
          setUsername,
          loggedIn,
          setLoggedIn,
        }}
      >
        {!loggedIn ? (
          <Login />
        ) : (
          <Game />
        )}
      </UserContext.Provider>
    </ConnectionInfoContext.Provider>
  );
};

export default App