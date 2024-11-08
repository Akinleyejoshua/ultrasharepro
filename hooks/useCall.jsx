"use client";

import { useEffect, useRef, useState } from "react";

export const useCall = (socketRef) => {

  const [userId, setUserId] = useState("");
  const [targetUserId, setTargetUserId] = useState("");
  const [incomingCall, setIncomingCall] = useState(null);
  const [isInCall, setIsInCall] = useState(false);
  const [callStatus, setCallStatus] = useState(''); // For displaying call status

  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const peerConnectionRef = useRef();
  const localStreamRef = useRef();
  const remoteStreamRef = useRef();

  useEffect(() => {
    

    // Handle incoming call
    socketRef.current?.on('call:incomming', async ({ from, offer, to }) => {
      console.log('Incoming call from:', from, 'with offer:', offer);

      setIncomingCall({
        from,
        offer,
        to
      });
      setCallStatus('incoming');
      setIsInCall(false)
      setUserId(to)
      setTargetUserId(from);
        
    },)
  

    // Handle call accepted
    socketRef.current?.on('call:accepted', async ({ answer, to }) => {
      console.log('Call accepted with answer:', answer);
      try {
        await peerConnectionRef.current.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
        setCallStatus('connected');
        setIsInCall(true)

      } catch (error) {
        console.error('Error setting remote description:', error);
      }
    });

    // Handle call rejected
    socketRef.current?.on('call:rejected', () => {

      setCallStatus('rejected');
      cleanupCall();
    });

    // Handle ICE candidates
    socketRef.current?.on('ice:call', async ({ candidate }) => {

      try {
        if (peerConnectionRef.current && candidate) {
          await peerConnectionRef.current.addIceCandidate(
            new RTCIceCandidate(candidate)
          );
          

        }
      } catch (error) {
        console.error('Error adding ICE candidate:', error);
      }
    });

    // Handle user disconnected
    socketRef.current?.on('user:disconnected', () => {
      setCallStatus('disconnected');
      cleanupCall();

    });

    return () => {
      // cleanupCall();
      setCallStatus('idle');
      setIsInCall(false);


      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [socketRef.current]);

  const initializePeerConnection = () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }

    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
      ]
    };

    peerConnectionRef.current = new RTCPeerConnection(configuration);

    // Handle ICE candidates
    peerConnectionRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('Sending ICE candidate');
        socketRef.current.emit(`ice:call`, {
          candidate: event.candidate,
          to: targetUserId || incomingCall?.from
        });
      }
    };

    // Handle connection state changes
    peerConnectionRef.current.onconnectionstatechange = () => {
      console.log('Connection state:', peerConnectionRef.current.connectionState);
      if (peerConnectionRef.current.connectionState === 'connected') {
        setCallStatus('connected');
      }
    };
    // Handle incoming tracks


    peerConnectionRef.current.ontrack = (event) => {
      console.log('Received remote track');
      remoteStreamRef.current = event.streams[0];
    };

    return peerConnectionRef.current;
  };

  const startLocalStream = async (isScreenShare) => {
    try {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }

      const stream = isScreenShare
        ? await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        })
        : await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });

      localStreamRef.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.muted = true;
      }

      return stream;


    } catch (error) {
      console.error('Error accessing media devices:', error);
      setCallStatus('error');
      throw error;
    }
  };


  const makeCall = async (from, to) => {

    try {
      setTargetUserId(to);
      setUserId(from);
      setCallStatus('calling');

      await startLocalStream(false);
      const peerConnection = initializePeerConnection(to);

      localStreamRef.current.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStreamRef.current);
      });

      // Create and set local description
      const offer = await peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });
      await peerConnection.setLocalDescription(offer);

      // Send the offer to the target user
      socketRef.current.emit(`call:start`, {
        to: to,
        from: from,
        offer: offer,
      });

      return offer;

    } catch (error) {
      console.error('Error making call:', error);
      setCallStatus('error');
      cleanupCall();
    }
  };



  const answerCall = async (isScreenShare) => {
    if (!incomingCall?.offer) {
      console.error('No valid offer found');
      return;
    }

    try {
      setCallStatus('answering');
      await startLocalStream(isScreenShare);
      const peerConnection = initializePeerConnection();

      localStreamRef.current.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStreamRef.current);
      });

      // Set remote description (offer)
      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(incomingCall?.offer)
      );

      // Create and set local description (answer)
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      // Send answer to caller
      socketRef.current.emit(`call:answer`, {
        to: incomingCall.from,
        answer: answer,
      });

      setIsInCall(true);
      setIncomingCall(null);
    } catch (error) {
      console.error('Error answering call:', error);
      setCallStatus('error');
      cleanupCall();
    }
  };


  const rejectCall = () => {
    if (incomingCall) {
      socketRef.current.emit(`call:reject`, {
        to: incomingCall.from,
        from: userId
      });
    }
    setIncomingCall(null);
    setCallStatus('idle');
  };

  const endCall = () => {
    const remoteUser = targetUserId || incomingCall?.from;
    if (remoteUser) {
      socketRef.current.emit(`call:end`, { to: remoteUser });
    }
    cleanupCall();
    setIsInCall(false)
    setIncomingCall(false)
    setCallStatus('idle');

  };

  const cleanupCall = () => {
    // Stop all tracks in local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }

    // Clean up video elements
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    // Reset states
    setIsInCall(false);
    setIncomingCall(null);
    // setCallStatus('idle');
  };

  

  return {
    userId,
    setUserId,
    targetUserId,
    setTargetUserId,
    incomingCall,
    setIncomingCall,
    isInCall,
    setIsInCall,
    localVideoRef,
    remoteVideoRef,
    peerConnectionRef,
    localStreamRef,
    remoteStreamRef,
    startLocalStream,
    socketRef,
    makeCall,
    answerCall,
    rejectCall,
    endCall,
    cleanupCall,
    setCallStatus,
    callStatus,
    socketRef,
  };
};
