"use client";

import { useEffect, useRef, useState } from "react";
import { Avater } from "./avater";
import { Space } from "./space";
import {
    AiOutlineArrowLeft,
    AiOutlineCamera,
    AiOutlineDesktop,
    AiOutlinePhone,
} from "react-icons/ai";

export const CallBar = ({
    callStatus,
    isInCall,
    incomingCall,
    remoteVideoRef,
    localVideoRef,
    makeCall,
    rejectCall,
    endCall,
    answerCall,
    isInScreen,
    isScreenShare,
    toggleScreenShare,
    remoteScreenRef,
    onCallCancle,
    onCall,
    localStreamRef,
    remoteStreamRef,
    remoteScreenStreamRef,
    targetUserId,
    userId,
    loginId,
}) => {
    const audioRef = useRef();

    useEffect(() => {
        if (incomingCall) {
            onCallCancle({ calling: false });
            audioRef.current?.play();
        }
    }, [incomingCall]);

    useEffect(() => {
        if (callStatus == "connected") {
            onCallCancle({ calling: false });
            localVideoRef.current.srcObject = localStreamRef.current;
            localVideoRef.current.muted = true;
            remoteVideoRef.current.srcObject = remoteStreamRef.current;
        }
    }, [callStatus, isInCall, localStreamRef, remoteStreamRef]);


    useEffect(() => {
        if (isInScreen) {
            remoteScreenRef.current.srcObject = remoteScreenStreamRef.current;
        }
    }, [isInScreen])

    if (onCall?.calling && callStatus != "connected")
        return (
            <section className="call-bar flex col call-bg">
                <div className="top">
                    <AiOutlineArrowLeft
                        className="icon"
                        onClick={() => onCallCancle({ calling: false })}
                        fontSize={40}
                    />
                </div>

                <div className="center bg-transparent">
                    <div className="flex col items-center">
                        <Avater
                            size={"10rem"}
                            fontSize={"60px"}
                            data={{ loginId: onCall?.to, is_active: false }}
                        />
                        <Space val={"1rem"} />
                        <h2>{onCall?.to}</h2>
                        <Space val={".4rem"} />
                        <small className={`center call-status ${callStatus}`}>
                            Status: {callStatus}
                        </small>
                        <Space val={"4rem"} />
                        {callStatus == "calling" ? (
                            <button
                                onClick={() => {
                                    endCall();
                                    onCallCancle({ calling: false });
                                }}
                                style={{ fontSize: "30px" }}
                                className="flex items-center bg-red"
                            >
                                &times;
                            </button>
                        ) : (
                            <button
                                onClick={() => makeCall(onCall?.from, onCall?.to)}
                                className="flex items-center bg-blue"
                            >
                                <AiOutlinePhone className="icon" fontSize={40} />
                            </button>
                        )}
                    </div>
                </div>
            </section>
        );

    if (incomingCall && callStatus != "connected")
        return (
            <section className="call-bar flex col call-bg">
                <div className="top">
                    <AiOutlineArrowLeft
                        className="icon"
                        onClick={() => {
                            onCallCancle({ calling: false });
                            rejectCall();
                        }}
                        fontSize={40}
                    />
                </div>
                <div className="center  bg-transparent">
                    <div className="flex col items-center">
                        <Avater
                            size={"10rem"}
                            fontSize={"60px"}
                            data={{ loginId: incomingCall?.from, is_active: false }}
                        />
                        <Space val={"1rem"} />

                        <h2>{incomingCall?.from}</h2>
                        <Space val={".4rem"} />
                        <small className={`center call-status ${callStatus}`}>
                            Status: {callStatus == ""? "idle": callStatus}
                        </small>
                        <Space val={"4rem"} />

                        <audio src="/call.mp3" preload="auto" autoPlay={true} ref={audioRef} loop={true} />
                        <div className="flex items-center">
                            <button
                                onClick={() => {
                                    answerCall(false);
                                    audioRef.current.pause();
                                }}
                                className="flex items-center bg-blue"
                            >
                                <AiOutlinePhone className="icon" fontSize={40} />
                            </button>
                            <Space val={".4rem"} />

                            <button
                                onClick={() => {
                                    rejectCall();
                                    audioRef.current.pause();
                                }}
                                style={{ fontSize: "30px" }}
                                className="flex items-center bg-red"
                            >
                                &times;
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        );

    return (
        <section
            className={`video-bar flex col space-between ${callStatus == "connected" ? "show" : "hide"}`}
        >
            <div className="videos">
                <div
                    className={`local ${!isInScreen ? "show" : "hide"}`}
                >
                    <video
                        ref={localVideoRef}
                        autoPlay={true}
                        controls={false}
                    />
                    <div className="bio">
                        <small>You</small>
                    </div>
                </div>
                <div className="remote">
                    <video
                        ref={remoteVideoRef}
                        autoPlay={true}
                        controls={false}
                        className={`${!isInScreen ? "show" : "hide"}`}
                    />
                    <video
                        ref={remoteScreenRef}
                        autoPlay={true}
                        controls={false}
                        className={`screen ${isInScreen ? "show" : "hide"}`}
                    />
                    <div className="bio flex">
                        <small>{targetUserId}
                            {isInScreen && " is sharing screen"}
                        </small>
                    </div>
                </div>
              
            </div>
           
            <div className="video-controls flex">
                <div className="flex items-center">
                    <button onClick={endCall} className="flex items-center bg-red">
                        <AiOutlinePhone className="icon" fontSize={40} />
                    </button>

                    <Space val={".4rem"} />
                    {!isInScreen && (
                        <button
                            onClick={() => toggleScreenShare(!isScreenShare, targetUserId, userId)}
                            className="bg-blue flex items-center"
                        >
                            {isScreenShare ? (
                                <AiOutlineCamera fontSize={40} className="icon" />
                            ) : (
                                <AiOutlineDesktop fontSize={40} className="icon" />
                            )}
                        </button>
                    )}

                    <Space val={".4rem"} />

                    <div className="flex max-w">
                        <small className={`center call-status ${callStatus}`}>
                            Status: {callStatus}
                        </small>
                    </div>
                </div>
                
                
                
            </div>
        </section>
    );
};
