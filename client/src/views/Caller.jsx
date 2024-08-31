import React, { useEffect, useState, useRef } from 'react';
import { useSocket } from '../components/SocketContext';

const Caller = () => {
  const socket = useSocket();
  const [targetId, setTargetId] = useState('');
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const peerConnectionRef = useRef(null);

  const initializePeerConnection = async () => {
    if (peerConnectionRef.current) return;
    console.log("2")
    peerConnectionRef.current = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });
    console.log("3",peerConnectionRef);
    peerConnectionRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('signal', { targetId, signalData: event.candidate });
      }
    };

    peerConnectionRef.current.ontrack = (event) => {
      console.log("Remote track received");
      setRemoteStream(event.streams[0]);
    };
    console.log("4 remote track received in the peerConnectionREf",peerConnectionRef);
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    console.log("5")
    setLocalStream(stream);
    console.log("6")
    stream.getTracks().forEach((track) => {
      peerConnectionRef.current.addTrack(track, stream);
    });
    console.log("7")
  };

  const startCall = async () => {
    console.log("1")
    await initializePeerConnection();
    const offer = await peerConnectionRef.current.createOffer();
    console.log("8offer created",offer)
    await peerConnectionRef.current.setLocalDescription(offer);
    console.log("9setting local description",peerConnectionRef)
    socket.emit('signal', { targetId, signalData: offer });
  };

  useEffect(() => {
    socket.on('signal', async (data) => {
        console.log("10")
      const { signalData } = data;
      console.log("11 signal data came",signalData);
      if (!peerConnectionRef.current) {
        console.log("12 initializing peer connection again")
        await initializePeerConnection();
      }

      if (signalData.type === 'answer') {
        console.log("datatype answer13" )
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(signalData));
      } else if (signalData.candidate) {
        console.log("datatype answer14" )
        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(signalData));
      }
    });

    return () => {
      socket.off('signal');
    };
  }, [socket]);

  return (
    <div>
      <h1>Caller</h1>
      <h1>Caller</h1>
      <h1>Caller</h1>
      <h1>Caller</h1>
      <h1>Caller</h1>
      <input
        type="text"
        value={targetId}
        onChange={(e) => setTargetId(e.target.value)}
        placeholder="Enter target client ID"
      />
      <button onClick={startCall}>Start Call</button>
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

export default Caller;
