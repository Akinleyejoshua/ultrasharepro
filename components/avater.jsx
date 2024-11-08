""

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";



export const Avater = ({ data, size, fontSize, pad }) => {
    const colors = ["red", "royalblue", "black", "var(--green)"]
    
    const router = useRouter();
    const [bgColor, setBgColor] = useState("royalblue");


    useEffect(() => {
        const randCol = Math.floor(Math.random() * colors.length);

        setBgColor(colors[randCol]);
    }, [])

    return (
        <div
            className="avater flex items-center"
            style={{
                backgroundColor: bgColor,
                padding: pad,
                maxHeight: size,
                minHeight: size,
                maxWidth: size,
                minWidth: size,
                fontSize: fontSize,
                borderRadius: "50%",
                color: "white",
            }}
        >
            {(data?.img !== "" && data?.img !== undefined && data?.img !== null)
                ?
                <Image src={data?.img} alt="" height={3} width={3} />
                :
                data?.loginId?.charAt(0)
            }

            {data?.is_active && <div className="active"></div>}
        </div>
    );
};
