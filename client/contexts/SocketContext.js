'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import api from '../lib/api';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        // Use current origin if in production/unified, else use env or localhost
        let URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        
        if (typeof window !== 'undefined') {
            const hostname = window.location.hostname;
            if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
                URL = window.location.origin;
                console.log('[SOCKET] Connecting to Unified Origin:', URL);
            }
        }

        const newSocket = io(URL, {
            transports: ['websocket', 'polling'], // Allow polling for better compatibility
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
