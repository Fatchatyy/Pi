import React, { useEffect, useState, useRef } from 'react';
import { useSocket } from '../components/SocketContext';
import Popup from './Popup';

const TestSocket = () => {
  const socket = useSocket();
  const [targetId, setTargetId] = useState('');
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [incomingCall, setIncomingCall] = useState(false);
  const [callerId, setCallerId] = useState('');
  const [showCallingPopup, setShowCallingPopup] = useState(false);
  const [showIncomingCallPopup, setShowIncomingCallPopup] = useState(false);
  const [callDeclined, setCallDeclined] = useState(false);
  const peerConnectionRef = useRef(null);
  const iceCandidatesQueue = useRef([]);

  const initializePeerConnection = async () => {
    if (peerConnectionRef.current) return;

    peerConnectionRef.current = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    peerConnectionRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('signal', { targetId, signalData: { candidate: event.candidate } });
      }
    };

    peerConnectionRef.current.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    setLocalStream(stream);

    stream.getTracks().forEach((track) => {
      peerConnectionRef.current.addTrack(track, stream);
    });
  };

  useEffect(() => {
    if (socket) {
      socket.on('signal', async (data) => {
        const { signalData, fromId } = data;

        try {
          if (signalData.type === 'offer') {
            setIncomingCall(true);
            setCallerId(fromId);
            await initializePeerConnection();
            await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(signalData));
            setShowIncomingCallPopup(true);
          } else if (signalData.type === 'answer') {
            await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(signalData));

            while (iceCandidatesQueue.current.length > 0) {
              const candidate = iceCandidatesQueue.current.shift();
              await peerConnectionRef.current.addIceCandidate(candidate);
            }
          } else if (signalData.candidate) {
            const candidate = new RTCIceCandidate(signalData.candidate);
            if (peerConnectionRef.current.remoteDescription) {
              await peerConnectionRef.current.addIceCandidate(candidate);
            } else {
              iceCandidatesQueue.current.push(candidate);
            }
          }
        } catch (error) {
          console.error('Error handling signal data:', error);
        }
      });

      socket.on('callDeclined', (data) => {
        console.log("hello caller id is")
        if (data.fromId === callerId) {
          setCallDeclined(true);
          setShowCallingPopup(false);
        }
      });
    }

    return () => {
      socket?.off('signal');
      socket?.off('callDeclined');
    };
  }, [socket, callerId]);

  const startCall = async () => {
    setShowCallingPopup(true);
    setCallDeclined(false);
    await initializePeerConnection();

    const offer = await peerConnectionRef.current.createOffer();
    await peerConnectionRef.current.setLocalDescription(offer);
    socket.emit('signal', { targetId, signalData: offer });
  };

  const acceptCall = async () => {
    setShowIncomingCallPopup(false);

    try {
      if (peerConnectionRef.current.signalingState === 'have-remote-offer') {
        const answer = await peerConnectionRef.current.createAnswer();
        await peerConnectionRef.current.setLocalDescription(answer);
        socket.emit('signal', { targetId: callerId, signalData: answer });

        while (iceCandidatesQueue.current.length > 0) {
          const candidate = iceCandidatesQueue.current.shift();
          await peerConnectionRef.current.addIceCandidate(candidate);
        }

        setShowCallingPopup(true);
        setRemoteStream(localStream); // To display remote stream if needed
      } else {
        console.error('No remote offer to answer.');
      }
    } catch (error) {
      console.error('Error accepting the call:', error);
    }
  };

  const declineCall = () => {
    setShowIncomingCallPopup(false);
    socket.emit('signal', { targetId: callerId, signalData: { type: 'decline' } });
  };

  return (
    <div>
      <h1>WebRTC Video Call</h1>
      <h1>WebRTC Video Call</h1>
      <h1>WebRTC Video Call</h1>
      <h1>WebRTC Video Call</h1>
      <input
        type="text"
        value={targetId}
        onChange={(e) => setTargetId(e.target.value)}
        placeholder="Enter target client ID"
      />

      <button onClick={startCall}>Start Call</button>

      {showCallingPopup && (
        <Popup isOpen={showCallingPopup} onClose={() => setShowCallingPopup(false)}>
          <h2>Calling {targetId}</h2>
          <div>
            <h3>Local Video</h3>
            <video autoPlay muted playsInline ref={(video) => video && localStream && (video.srcObject = localStream)} />
          </div>
          <div>
            <h2>Remote Video</h2>
            <video autoPlay playsInline ref={(video) => video && remoteStream && (video.srcObject = remoteStream)} />
          </div>
          {callDeclined && <p>Call was declined by the user.</p>}
        </Popup>
      )}

      {showIncomingCallPopup && (
        <Popup isOpen={showIncomingCallPopup} onClose={() => setShowIncomingCallPopup(false)}>
          <h2>Incoming call from {callerId}</h2>
          <button onClick={acceptCall}>Accept Call</button>
          <button onClick={declineCall}>Decline Call</button>
          <div>
            <h3>Local Video</h3>
            <video autoPlay muted playsInline ref={(video) => video && localStream && (video.srcObject = localStream)} />
          </div>
          <div>
            <h2>Remote Video</h2>
            <video autoPlay playsInline ref={(video) => video && remoteStream && (video.srcObject = remoteStream)} />
          </div>
        </Popup>
      )}
    </div>
  );
};

export default TestSocket;
