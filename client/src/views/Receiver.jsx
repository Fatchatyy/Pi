import React, { useEffect, useState, useRef } from 'react';
import { useSocket } from '../components/SocketContext';

const Receiver = () => {
  const socket = useSocket();
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const peerConnectionRef = useRef(null);
  const remoteDescriptionSet = useRef(false);
  const iceCandidatesQueue = useRef([]);

  const initializePeerConnection = async () => {
    if (peerConnectionRef.current) return;

    peerConnectionRef.current = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    peerConnectionRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('signal', { signalData: event.candidate });
      }
    };

    peerConnectionRef.current.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
      }
    };

    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    setLocalStream(stream);
    stream.getTracks().forEach((track) => {
      peerConnectionRef.current.addTrack(track, stream);
    });
  };

  const acceptCall = async () => {
    if (!incomingCall) return;
    await initializePeerConnection();
    const answer = await peerConnectionRef.current.createAnswer();
    await peerConnectionRef.current.setLocalDescription(answer);
    socket.emit('signal', { signalData: answer });
    setIncomingCall(null);
  };

  useEffect(() => {
    socket.on('signal', async (data) => {
      const { signalData } = data;

      if (!peerConnectionRef.current) {
        await initializePeerConnection();
      }

      if (signalData.type === 'offer') {
        setIncomingCall({ fromId: data.fromId });
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(signalData));
        remoteDescriptionSet.current = true;
        iceCandidatesQueue.current.forEach((candidate) => {
          peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        });
        iceCandidatesQueue.current = [];
      } else if (signalData.type === 'answer') {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(signalData));
        remoteDescriptionSet.current = true;
        iceCandidatesQueue.current.forEach((candidate) => {
          peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        });
        iceCandidatesQueue.current = [];
      } else if (signalData.candidate) {
        if (remoteDescriptionSet.current) {
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(signalData));
        } else {
          iceCandidatesQueue.current.push(signalData);
        }
      }
    });

    return () => {
      socket.off('signal');
    };
  }, [socket]);

  return (
    <div>
      <h1>Receiver</h1>
      <h1>Receiver</h1>
      <h1>Receiver</h1>
      <h1>Receiver</h1>
      <h1>Receiver</h1>
      <h1>Receiver</h1>
      {incomingCall && <button onClick={acceptCall}>Accept Call</button>}
      <div>
        <h2>Local Video</h2>
        <video autoPlay muted playsInline ref={(video) => video && localStream && (video.srcObject = localStream)} />
      </div>
      <div>
        <h2>Remote Video</h2>
        <video autoPlay playsInline ref={(video) => video && remoteStream && (video.srcObject = remoteStream)} />
      </div>
    </div>
  );
};

export default Receiver;
