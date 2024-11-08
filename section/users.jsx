"use client"

import { Avater } from "@/components/avater";
import { Loader } from "@/components/loader";
import { Space } from "@/components/space"
import { useAuth } from "@/hooks/useAuth";
import { useCall } from "@/hooks/useCall";
import useSocket from "@/hooks/useSockets";
import { useTime } from "@/hooks/useTime";
import { useUser } from "@/hooks/useUser"
import { get, save } from "@/utils/helpers";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AiOutlineLogout, AiOutlinePhone, AiOutlineVideoCamera } from "react-icons/ai";

export const Users = ({users, loading, loginId, onCall}) => {

    const { socket: socketRef } = useSocket();

    const { incomingCall } = useCall(socketRef);

    const router = useRouter();

    const { logout } = useAuth();
    const { relativeTime } = useTime();

    return <section className="users">
        <div className="flex space-between">
            <h3>Users</h3>
            <button className="flex items-center" onClick={() => logout(loginId)}>
                Logout
                <Space val={".4rem"} />
                <AiOutlineLogout className="icon" />
            </button>
        </div>
        <Space val={".4rem"} />
        {loading ? <Loader size={"1.4rem"} color={"black"} bcolor={"royalblue"} /> :
            users?.map((item, i) => {

                return <div className="flex space-between items-center item" key={i}>
                    <div className="flex row items-center max-w">
                        <Avater data={item} size={"4rem"} fontSize={"30px"} />
                        <Space val={".4rem"} />
                        <div className="flex col">
                            <h3>{item?.loginId}</h3>
                            {item?.is_active ?
                                <small className="blue">Active now</small> :
                                <small className="blue">Active {relativeTime(item?.lastActive)} ago</small>
                            }
                        </div>
                    </div>

                    {item?.is_active ?
                        <div className="actions flex">
                            <button onClick={() => {
                                onCall({ from: loginId, to: item?.loginId, calling: true })
                                
                            }} className="flex items-center">
                                Call
                                <Space val={".4rem"} />
                                <AiOutlineVideoCamera className="icon" />
                            </button>
                        </div> : <small className="red">Offline</small>}


                </div>
            })
        }

        <Space val={"1rem"} />

    </section>
}