"use client"

import { CallBar } from "@/components/call-bar";
import { Header } from "@/components/header"
import { Space } from "@/components/space"
import { useAuth } from "@/hooks/useAuth";
import { useCall } from "@/hooks/useCall";
import { useScreenCall } from "@/hooks/useScreenCall";
import useSocket from "@/hooks/useSockets";
import { useUser } from "@/hooks/useUser";
import { Users } from "@/section/users"
import { get, save } from "@/utils/helpers";
import { useEffect, useState } from "react";

export default function Home() {
    const { authenticate } = useAuth();
    const { socket: socketRef } = useSocket();
    const callHook = useCall(socketRef);
    const userHook = useUser(socketRef);
    const screenCallHook = useScreenCall(socketRef);
    const loginId = get("login-id");
    const [onCall, setOnCall] = useState({});

    useEffect(() => {
        save("prev-url", location.href);

        if (authenticate()) {
            socketRef.current.connect();
            if (loginId != "") {
                socketRef.current.emit("user:signin", loginId);
            }
        }
    }, [])

    return <main className="home">
        <Header />
        <Space val={"1rem"} />
        <Users {...userHook} loginId={loginId} onCall={(val) => setOnCall(val)}/>
        <CallBar loginId={loginId} {...screenCallHook} {...callHook} onCallCancle={(val) => setOnCall(val)} onCall={onCall}/>
    </main>
}
