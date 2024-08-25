import React, { useEffect } from 'react';
import { useSocket } from '../components/SocketContext';

const TestSocket = () => {
  const socket = useSocket();

  useEffect(() => {
    console.log("testing the socketssssssssss")
    if (socket) {
      console.log('Socket instance:', socket);

      socket.on('connect', () => {
        console.log('Connected to server');
      });

      socket.on('disconnect', () => {
        console.log('Disconnected from server');
      });
    }

    // Cleanup on component unmount
    return () => {
      if (socket) {
        socket.off('connect');
        socket.off('disconnect');
      }
    };
  }, [socket]);

  return <div>Check the console for socket events!</div>;
};

export default TestSocket;
