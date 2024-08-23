

import React, { useMemo } from "react";
import { io } from "socket.io-client";


const SocektContext = React.createContext(null);

export const  useSocket = ()=>{

    return React.useContext(SocektContext);

}



 export const SocketProvider = (props)=>{
    const socket = useMemo(()=>io('http://localhost:8000/'));

    return (
    <SocektContext.Provider value={{socket}}>
        {props.children}
    </SocektContext.Provider>
    )

}

