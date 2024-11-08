import { Loader } from "./loader"

export const Button = ({ onCLick, text, icon, loading }) => {
    return <button onClick={onCLick} className="flex items-center">
        {!loading ? <>
            {text}
            {icon}
        </> : <Loader size={"1.4rem"} />
        }
    </button>
}