'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import api from '../lib/api';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        // Assume API_URL is localhost:3001 or from env
        // We can derive it from api.defaults.baseURL or just hardcode for now based on dev environment
        // Use env var or fallback
        const URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

        const newSocket = io(URL, {
            transports: ['websocket'],
            autoConnect: true,
        });

        newSocket.on('connect', () => {
            console.log('Socket connected:', newSocket.id);
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, []);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
