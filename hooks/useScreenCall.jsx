"use client"

import { useEffect, useRef, useState } from "react";

export const useScreenCall = (socketRef) => {

    const [screenUserId, setScreenUserId] = useState("");
    const [screenTargetUserId, setScreenTargetUserId] = useState("");
    const [isScreenShare, setIsScreenShare] = useState(false)
    const [isInScreen, setIsInScreen] = useState(false);
    const [callStatus, setCallStatus] = useState(''); // For displaying call status


    const remoteScreenRef = useRef();
    const remoteScreenStreamRef = useRef();
    const peerConnectionRef = useRef();
    const localStreamRef = useRef();


    useEffect(() => {

        socketRef.current?.on('screen:incomming', async ({ from, offer }) => {
            console.log('Incoming screen call from:', from, 'with offer:', offer);
            const peerConnection = initializePeerConnection(from);
            // Set remote description (offer)
            await peerConnection.setRemoteDescription(
                new RTCSessionDescription(offer)
            );

            // Create and set local description (answer)
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);

            // Send answer to caller
            socketRef.current.emit(`call:screen:answer`, {
                to: from,
                answer: answer,
            });

            // setIsInScreen(isScreenShare)

        });

        // Handle call accepted

        socketRef.current?.on("call:screen:accepted", async ({ answer }) => {
            console.log('Screen Call accepted with answer:', answer);
            try {
                await peerConnectionRef.current.setRemoteDescription(
                    new RTCSessionDescription(answer)
                );
                setIsScreenShare(prevState => !prevState);

            } catch (error) {
                console.error('Error setting remote description:', error);
            }
        });

        socketRef.current?.on('screen:disconnected', () => {

            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => track.stop());
                localStreamRef.current = null;
            }

            if (remoteScreenRef.current) {
                remoteScreenRef.current.srcObject = null;
            }

            console.log("Screen Sharing Ended")

            setIsScreenShare(false);
            setIsInScreen(false)
        });


        // Handle ICE candidates

        socketRef.current?.on('ice:screen', async ({ candidate }) => {
            console.log("Screen Candidating", candidate)
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



        return () => {

            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, []);

    const cleanupCall = () => {
        // Stop all tracks in local stream
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
            localStreamRef.current = null;
        }

        if (remoteScreenRef.current) {
            remoteScreenRef.current.srcObject = null;
        }

        // Close peer connection
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
        }

        // Reset states
        setIsInCall(false);
        // setCallStatus('idle');
    };

    const startLocalStream = async () => {
        try {
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => track.stop());
            }

            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: {
                    noiseSuppression: true
                }
            })


            localStreamRef.current = stream;
            if (remoteScreenRef.current) {
                remoteScreenRef.current.srcObject = stream;
                remoteScreenRef.current.muted = true;
            }

            return stream;


        } catch (error) {
            console.error('Error accessing media devices:', error);
            setCallStatus('error');
            throw error;
        }
    };

    const initializePeerConnection = (to) => {
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

                socketRef.current.emit(`ice:screen`, {
                    candidate: event.candidate,
                    to: to
                });
            }
        };

        // Handle connection state changes
        peerConnectionRef.current.onconnectionstatechange = () => {
            console.log('Connection state:', peerConnectionRef.current.connectionState);
            if (peerConnectionRef.current.connectionState === 'connected') {
            }
        };
        // Handle incoming tracks


        peerConnectionRef.current.ontrack = (event) => {
            console.log('Received remote track');
            remoteScreenStreamRef.current = event.streams[0];
            setIsInScreen(true)
            setIsScreenShare(true);

        };

        return peerConnectionRef.current;
    };

    const makeCall = async (isScreenShare, from, to) => {

        try {

            if (isScreenShare) {
                await startLocalStream();

                const peerConnection = initializePeerConnection(from);

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
                setScreenTargetUserId(to);
                setScreenUserId(from)
                socketRef.current.emit(`call:screen:start`, {
                    to: from,
                    from: to,
                    offer: offer,
                    isScreenShare,
                });

                return offer;

            } else {

                if (remoteScreenRef.current) {
                    remoteScreenRef.current.srcObject = null;
                    setIsInScreen(false)
                    setIsScreenShare(false);
                }

                socketRef.current.emit(`screen:end`, {
                    to: from,
                    from: to,
                    isScreenShare: false,
                });
            }


        } catch (error) {
            console.error('Error making call:', error);
        }
    };



    const toggleScreenShare = async (isScreenShare, from, to) => {
        try {
            await makeCall(isScreenShare, from, to);
        } catch (error) {
            console.error('Error toggling screen share:', error);
        }
    };

    return {
        toggleScreenShare,
        isInScreen,
        isScreenShare,
        remoteScreenRef,
        socketRef,
        callStatus,
        setScreenUserId,
        setScreenTargetUserId,
        remoteScreenStreamRef,
    }
}
