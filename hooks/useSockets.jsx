import { useRef } from "react";
import { io } from "socket.io-client";

const useSocket = () => {
  // const url = "http://localhost:4000/"
  const url = "https://ultrasharepro-api.onrender.com"

  let socket = useRef(
    // io("https://ultrasharepro-api.onrender.com"),
    io(url, {
      autoConnect: false,
    })
  )

  return {socket}
};

export default useSocket
