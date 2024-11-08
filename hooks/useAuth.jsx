"use client";

import { useEffect, useState } from "react";
import useSocket from "./useSockets";
import { get, save } from "@/utils/helpers";
import { useRouter } from "next/navigation";

export const useAuth = () => {
    const [loginId, setLoginId] = useState("");
    const [msg, setMsg] = useState("");
    const [msgError, setMsgError] = useState(null);
    const [authenticated, setAuthenticated] = useState(false);
    const [loading, setLoading] = useState(false);

    const { socket } = useSocket();
    const router = useRouter();

    const isAuth = () => {
        const loginId = get("login-id");
        if (loginId == "null" || loginId == undefined) {
            return false;
        } else {
            return true
        }
    }

    const authenticate = () => {
        if (!isAuth()) {
            if (location.pathname != "/") {
                save("prev-url", location.href);
                
            }
            router.push("/")
            return false;
        } else {
            const prevUrl = get("prev-url");
            if (prevUrl == "null" || prevUrl == undefined) {
                
                router.push("/home")
            } else {
                router.replace(prevUrl);
            }
            return true;
        }
    }

    const redirect = () => {
        const prevUrl = get("prev-url");
        if (prevUrl == "null" || prevUrl == undefined) {

            router.push("/home")
        } else {
            router.replace(prevUrl);
        }
    }


    const logout = (loginId) => {
        socket.current.emit("user:logout", loginId);
    }


    useEffect(() => {
        socket.current.connect();

        socket.current.on("user:logout", () => {
            save("login-id", null);
            router.push("/")
        })

        socket.current.on("auth:access-granted", (loginId) => {
            setAuthenticated(true);
            setMsg("Access Granted!");
            setMsgError(false)
            setLoading(false);
            save("login-id", loginId);
            redirect();
            
        });

        return () => {
            socket.current.off("auth:access-granted");
        };
    }, []);

    const signin = () => {
        if (loginId == "") {
            setMsg("Login ID Required!");
            setMsgError(true);
        } else {
            setMsg("");
            setMsgError(null);
            socket.current.emit("user:signin", loginId);
            setLoading(true)
        }
    };

    return {
        loginId,
        setLoginId,
        msg,
        setMsg,
        msgError,
        setMsgError,
        signin,
        loading,
        authenticate,
        logout,
    };
};
