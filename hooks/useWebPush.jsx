import { get } from "@/utils/helpers";
import { useEffect, useState } from "react";

export const useWebPush = (socketRef) => {
    const [webPushKeys, setWebPushKeys] = useState({
        public_key: "BMLvozRig_IwhhYl26ws_AcFl9O1TVgbb1GMTR5vyKFaSveTTsqgXzHU_2nLRq-SRDkTXZ8skO665K9Zm4MPVmE",
        private_key: "4BQSfnl8IvM7qE6Ayg6Hn_UYh3e14uG56BzSbmPlYh4"
    });

    const loginID = get("login-id");

    useEffect(() => {
        
        // socketRef.current?.emit("site:vapidkeys:save", {...webPushKeys});
        if ("serviceWorker" in navigator) {
            const handleServiceWorker = async () => {
                const register = await navigator.serviceWorker.register("/sw.js");

                const subscription = await register.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: webPushKeys.public_key,
                });

                socketRef.current?.emit("webpush:sub:set", { body: JSON.stringify(subscription), to: loginID });
            };
            handleServiceWorker();
        }
    }, [socketRef])

   
    return {}
}