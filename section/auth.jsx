"use client"

import { Button } from "@/components/button"
import { Space } from "@/components/space"
import { useAuth } from "@/hooks/useAuth"
import { AiOutlineLogin } from "react-icons/ai"

export const Auth = () => {
    const { setLoginId, msg, msgError, signin, loading } = useAuth();

    return <section className="auth flex col">
        <h1>Auto Create Account & Sign in</h1>
        <p>
            Enter any Login credentials you prefer & it would automatically asign it to you
        </p>
        <p>
            has your own Login ID, You will use that same Login ID to Sign in your personal account
        </p>
        <p>Your Login ID could be a name, number or anything that we or you can use to identify it's you</p>
        <p>e.g format: <b>name/password: john/doe</b></p>
        <Space val={".4rem"} />
        <small className={`msg ${msgError ? "error" : "success"}`}>{msg}</small>
        <Space val={".4rem"} />
        <input type="text" placeholder="Login ID" onChange={e => setLoginId(e.target.value)} />
        <Space val={".4rem"} />

        <Button onCLick={signin} text={"Signin"} icon={<>
            <Space val={".4rem"} />
            <AiOutlineLogin className="icon" />
        </>} loading={loading} />
    </section>
}