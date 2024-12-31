'use client';
import React, { useContext, useState } from 'react'
import { ConnectionInfoContext, UserContext } from './App';

const Login = () => {
    const { setUsername, setLoggedIn } = useContext(UserContext);
    
    const [inputValue, setInputValue] = useState("");

    const LoginAction = () => {
        setUsername(inputValue);
        setLoggedIn(true);
    }

    return (
        <>
            <h2>Login</h2>
            <input
                type="text"
                placeholder="Enter your username"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)} // Update input value
            />
            <button
                onClick={() => LoginAction()}
            >
            Login
            </button>
        </>
      );
}

export default Login