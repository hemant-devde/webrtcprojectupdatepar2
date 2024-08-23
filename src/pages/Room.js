import React, { useState, useEffect, useCallback } from "react";
import { useSocket } from "../providers/Socket";
import { usePeer } from "../providers/Peer";
import ReactPlayer from "react-player";

const UserVideo = ({
  stream,
  user,
  muted,
  isLocal,
  isAudioEnabled,
  isVideoEnabled,
}) => {
  return (
    <div className="user-video">
      {stream && (isLocal ? isVideoEnabled : true) ? (
        <ReactPlayer
          playing
          muted={muted}
          height="100%"
          width="100%"
          url={stream}
        />
      ) : (
        <div className="avatar">
          <img src="/default-avatar.png" alt={`Avatar for ${user}`} />
        </div>
      )}
      <p>
        {user} {!isAudioEnabled && isLocal && "(Muted)"}
      </p>
    </div>
  );
};

const Roompage = () => {
  const { socket } = useSocket();
  const {
 
  
    createPeer,
    createOffer,
    createAnswer,
    setRemoteAns,
    sendStream,
    addICECandidate,
    connectionStates,
    handleConnectionStateChange,
  } = usePeer();
  const [myStream, setMyStream] = useState(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [peers , setPeers] = useState(null);


  const handleNewUserJoined = useCallback(
    async (data) => {

      const { user, roomID } = data;
      console.log(`${user} join the room `);
      const peer = createPeer();
      const offer = await createOffer(peer);
      console.log("calling user ", user, " offer :", offer);
      socket.emit('call-user', { roomID, offer });
      setPeers((prevPeers) => ({
        ...prevPeers,
        [user]: { peer, stream: null },
      }));

      // peer.onicecandidate = (event) => {
      //   if (event.candidate) {
      //     socket.emit("ice-candidate", {
      //       candidate: event.candidate,
      //       to: user,
      //     });
      //   }
      // };
      peer.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", {
            candidate: event.candidate,
            to: user,
            roomID, // Add roomID here
          });
        }
      };

      peer.ontrack = (event) => {
        setPeers((prevPeers) => ({
          ...prevPeers,
          [user]: { ...prevPeers[user], stream: event.streams[0] },
        }));
      };

      peer.onconnectionstatechange = () => {
        handleConnectionStateChange(user, peer.connectionState);
      };
    },
    [createPeer, createOffer, socket, setPeers, handleConnectionStateChange]
  );

  const handleIncomingCall = useCallback(
    async (data) => {
      const { from, offer } = data;
      console.log("Incoming Call From", from, "Offer:", offer);
      const peer = createPeer();
      const answer = await createAnswer(peer, offer);
      socket.emit("call-accepted", { user: from, answer });
      setPeers((prevPeers) => ({
        ...prevPeers,
        [from]: { peer, stream: null },
      }));

      peer.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", {
            candidate: event.candidate,
            to: from,
            // roomIDAdd roomID here
          });
        }
      };

      peer.ontrack = (event) => {
        setPeers((prevPeers) => ({
          ...prevPeers,
          [from]: { ...prevPeers[from], stream: event.streams[0] },
        }));
      };

      peer.onconnectionstatechange = () => {
        handleConnectionStateChange(from, peer.connectionState);
      };
    },
    [createPeer, createAnswer, socket, setPeers, handleConnectionStateChange]
  );

  const handleCallAccepted = useCallback(
    async (data) => {
      const { user, answer } = data;
      console.log("Call accepted by", user);
      const peer = peers[user]?.peer;
      if (peer) {
        await setRemoteAns(peer, answer);
        if (myStream) {
          sendStream(peer, myStream);
        }
      }
    },
    [peers, setRemoteAns, sendStream, myStream]
  );

  useEffect(() => {
    socket.on("user-joined", handleNewUserJoined);
    socket.on("incoming-call", handleIncomingCall);
    socket.on("call-accepted", handleCallAccepted);
    socket.on("ice-candidate", async ({ candidate, from }) => {
      const peer = peers[from]?.peer;
      if (peer) {
        await addICECandidate(peer, candidate);
      }
    });
    socket.on("user-left", (user) => {
      setPeers((prevPeers) => {
        const newPeers = { ...prevPeers };
        delete newPeers[user];
        return newPeers;
      });
    });

    return () => {
      socket.off("user-joined" ,handleNewUserJoined);
      socket.off("incoming-call", handleIncomingCall);
      socket.off("call-accepted", handleCallAccepted);
      socket.off("ice-candidate");
      socket.off("user-left");
    };
  }, [
    socket,
    handleNewUserJoined,
    handleIncomingCall,
    handleCallAccepted,
    peers,
    addICECandidate,
    setPeers,
  ]);

  // ... (rest of the component remains the same)

  useEffect(() => {
    const getUserMediaStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: true,
        });
        setMyStream(stream);
      } catch (error) {
        console.error("Error accessing media devices.", error);
      }
    };
    getUserMediaStream();
  }, []);

  const toggleAudio = () => {
    if (myStream) {
      myStream
        .getAudioTracks()
        .forEach((track) => (track.enabled = !isAudioEnabled));
      setIsAudioEnabled(!isAudioEnabled);
    }
  };

  const toggleVideo = () => {
    if (myStream) {
      myStream
        .getVideoTracks()
        .forEach((track) => (track.enabled = !isVideoEnabled));
      setIsVideoEnabled(!isVideoEnabled);
    }
  };

  const joinCall = () => {
    Object.values(peers).forEach(({ peer }) => {
      if (peer && myStream) {
        sendStream(peer, myStream);
      }
    });
  };

  return (
    <div className="room-page-container">
      <div className="room-page">
        <h1>Video Room</h1>
        <div className="video-grid">
          <UserVideo
            stream={myStream}
            user="You (Me)"
            muted={true}
            isLocal={true}
            isAudioEnabled={isAudioEnabled}
            isVideoEnabled={isVideoEnabled}
          />
          {Object.entries(peers).map(([user, peerData]) => (
            <UserVideo
              key={user}
              stream={peerData.stream}
              user={user}
              muted={false}
              isLocal={false}
            />
          ))}
        </div>
        <div className="controls">
          <button onClick={toggleAudio}>
            {isAudioEnabled ? "Mute Myself" : "Unmute Myself"}
          </button>
          <button onClick={toggleVideo}>
            {isVideoEnabled ? "Turn Off My Camera" : "Turn On My Camera"}
          </button>
          <button onClick={joinCall}>Join Call</button>
        </div>
      </div>
    </div>
  );
};

export default Roompage;