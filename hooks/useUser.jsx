"use client"

import { useEffect, useState } from "react";
import useSocket from "./useSockets"
import { get } from "@/utils/helpers";

export const useUser = (socket) => {

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const loginId = get("login-id");

    useEffect(() => {
        socket.current.emit("user:signin", loginId);

        socket.current.emit("users:get")
        socket.current.on("users:get", (users) => {
            setUsers(users.filter(item => item.loginId != loginId));
            setLoading(false);
        })

        return () => {
            socket.current.off("users:get");
        }

    }, [])

    return { users, loading}
}