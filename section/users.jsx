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
import { useEffect, useRef, useState } from "react";
import { AiOutlineLogout, AiOutlinePhone, AiOutlineVideoCamera } from "react-icons/ai";

export const Users = ({users, loading, loginId, onCall}) => {

    const { logout } = useAuth();
    const { relativeTime } = useTime();

    const userId = useRef();

    useEffect(() => {
        userId.current = loginId;
    }, [loginId])


    return <section className="users">
        <div className="flex space-between items-center">
            <div className="flex col items-center">
                <Avater data={{ loginId: userId.current, is_active: true }} size={"3rem"} fontSize={"20px"} />
                <Space val={".0rem"} />
                <b>{userId.current}</b>
            </div>

            <div className="flex">

                <button className="flex items-center" onClick={() => logout(loginId)}>
                    Logout
                    <Space val={".4rem"} />
                    <AiOutlineLogout className="icon" />
                </button>
            </div>
            
        </div>
        <Space val={".4rem"} />
        <h1 className="w6">Contacts</h1>
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
