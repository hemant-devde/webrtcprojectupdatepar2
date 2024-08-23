import React from "react";

import { Routes , Route } from "react-router-dom";
import Homepage from "./pages/Home";
import './App.css'
import { SocketProvider } from "./providers/Socket";
import { PeerProvider } from "./providers/Peer";
import Roompage from "./pages/Room";





const App = ()=>{


  return  (

<div className="App-cantainer">  
<SocketProvider> 
  <PeerProvider>
<Routes>
<Route path="/" element={ <Homepage/>}/>
<Route path="/h" element={ <h1> routes wokrking fine</h1>}/>
<Route path="/room/:roomid" element={<Roompage/> }/>

</Routes>
</PeerProvider>
</SocketProvider>


</div>

  )
}
export default App;