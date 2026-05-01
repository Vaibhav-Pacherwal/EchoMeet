import React, { useEffect, useRef, useState, useCallback } from "react";
import { Button, TextField } from '@mui/material';
import VideoCamIcon from "@mui/icons-material/Videocam";
import VideoCamOffIcon from "@mui/icons-material/VideocamOff";
import { IconButton, Badge } from "@mui/material";
import CallEndIcon from "@mui/icons-material/CallEnd";
import MicOnIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import StopScreenShareIcon from "@mui/icons-material/StopScreenShare";
import ChatIcon from "@mui/icons-material/Chat"
import { io } from "socket.io-client";
import "../videoComponent.css"
import { useNavigate } from "react-router-dom";

const server_url = "http://localhost:8000";
var connections = {};
const peerConfigConnections = {
    "iceServers": [
        {"urls": "stun:stun.l.google.com:19302"},
        {
            urls: "turn:openrelay.metered.ca:80",
            username: "openrelayproject",
            credential: "openrelayproject"
        }
    ]
}

export default function VideoMeetComponent() {

    const routeTo = useNavigate("/home");

    let socketRef = useRef();
    let socketIdRef = useRef();
    let localVideoRef = useRef();
    let [videoAvailable, setVideoAvailable] = useState(true);
    let [audioAvailable, setAudioAvailable] = useState(true);
    let [showModal, setShowModal] = useState(false);
    let [video, setVideo] = useState();
    let [audio, setAudio] = useState();
    let [screen, setScreen] = useState();
    let [model, setModel] = useState();
    let [screenAvailable, setScreenAvailable] = useState();
    let [messages, setMessages] = useState([]);
    let [message, setMessage] = useState("");
    let [newMessages, setNewMessages] = useState(0);
    let [askForUsername, setAskForUsername] = useState(true);
    let [username, setUsername] = useState("");
    let videoRef = useRef([]);
    let [videos, setVideos] = useState([]);
    let [myId, setMyId] = useState(null);
    const remoteStreams = useRef({});
    const videoRefs = useRef({});
    const iceQueue = useRef({});
    const appliedAnswers = useRef({});

    const getPermission = async () => {
        try {
            const videoPermission = await navigator.mediaDevices.getUserMedia({video: true});
            if(videoPermission) {
                setVideoAvailable(true);
            } else {
                setVideoAvailable(false);
            }

            const audioPermission = await navigator.mediaDevices.getUserMedia({audio: true});
            if(audioPermission) {
                setAudioAvailable(true);
            } else {
                setAudioAvailable(false);
            }

            if(navigator.mediaDevices.getDisplayMedia) {
                setScreenAvailable(true);
            } else {
                setScreenAvailable(false);
            }

            if(videoAvailable || audioAvailable) {
                const userMediaStream = await navigator.mediaDevices.getUserMedia({video: videoAvailable, audio: audioAvailable});

                if(userMediaStream) {
                    window.localStream = userMediaStream;
                    if(localVideoRef.current) {
                        localVideoRef.current.srcObject = userMediaStream;
                    }
                }
            }

        } catch(err) {
            console.log(err);
        }
    }

    useEffect(() => {
        getPermission();
    }, []);

    const attachStreamOnce = (pc, stream) => {
        if (pc._tracksAdded) return;
        pc._tracksAdded = true;

        stream.getTracks().forEach(track => {
            pc.addTrack(track, stream);
        });
    };

    const gotMessageFromServer = async (fromId, message) => {
        if (!fromId || !message) return;
        const signal = typeof message === "string" ? JSON.parse(message) : message;

        if (!connections[fromId]) {
            createPeer(fromId, true, false);
        }

        const pc = connections[fromId];
        if (!pc) return;

        if (signal.sdp) {
            const offerCollision =
                signal.sdp.type === "offer" &&
                (pc._makingOffer || pc.signalingState !== "stable");

            if (!pc._polite && offerCollision) {
                console.log("Impolite peer ignoring colliding offer from", fromId);
                return;
            }

            try {
                if (offerCollision && pc._polite) {
                    await pc.setLocalDescription({ type: "rollback" });
                    pc._makingOffer = false;
                }

                if (signal.sdp.type === "offer" && pc._polite && !pc._tracksAdded) {
                    const stream = window.localStream;
                    if (stream) attachStreamOnce(pc, stream);
                }

                await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));

                if (iceQueue.current[fromId]) {
                    for (const candidate of iceQueue.current[fromId]) {
                        try { await pc.addIceCandidate(new RTCIceCandidate(candidate)); }
                        catch (e) { console.log("queued ICE error:", e); }
                    }
                    delete iceQueue.current[fromId];
                }

                if (signal.sdp.type === "offer") {
                    await pc.setLocalDescription();
                    socketRef.current.emit("signal", fromId, JSON.stringify({
                        sdp: pc.localDescription
                    }));
                }
            } catch (err) {
                console.warn("SDP error:", err);
            }
        }

        if (signal.ice) {
            try {
                if (!pc.remoteDescription) {
                    if (!iceQueue.current[fromId]) iceQueue.current[fromId] = [];
                    iceQueue.current[fromId].push(signal.ice);
                    return;
                }
                await pc.addIceCandidate(new RTCIceCandidate(signal.ice));
            } catch (e) { console.log("ICE error:", e); }
        }
    };

    const addMessage = (message, sender, socketIdSender) => {
        setMessages((prev) => [
            ...prev, {sender: sender, data: message}
        ]);

        if(socketIdSender !== socketIdRef.current) {
            setNewMessages((prev) => prev + 1);
        }
    }

    useEffect(() => {
        if (myId) {
            console.log("Updated myId:", myId);
        }
    }, [myId]);

    const createPeer = (socketListId, isPolite, addTracks = true) => {
        if (connections[socketListId]) {
            connections[socketListId].close();
            delete connections[socketListId];
        }

        const pc = new RTCPeerConnection(peerConfigConnections);
        connections[socketListId] = pc;

        pc._polite = isPolite;
        pc._makingOffer = false;
        pc._suppressNegotiation = false;

        if (addTracks) {
            const stream = window.localStream;
            if (stream) attachStreamOnce(pc, stream);
        }

        pc.onconnectionstatechange = () => {
            console.log(`[${socketListId}] STATE:`, {
                ice: pc.iceConnectionState,
                conn: pc.connectionState,
                signal: pc.signalingState
            });
            if (pc.connectionState === "failed") {
                setTimeout(() => {
                    if (pc.connectionState === "failed") {
                        pc.close();
                        delete connections[socketListId];
                    }
                }, 2000);
            }
        };

        const sentCandidates = new Set();
        pc.onicecandidate = (event) => {
            if (!event.candidate) return;
            const key = event.candidate.candidate;
            if (sentCandidates.has(key)) return;
            sentCandidates.add(key);
            socketRef.current.emit("signal", socketListId, JSON.stringify({
                ice: event.candidate
            }));
        };

        pc.ontrack = (event) => {
            const stream = event.streams[0];
            if (!stream) return;

            console.log("STREAM ATTACHED:", socketListId, stream.getTracks());
            remoteStreams.current[socketListId] = stream;

            const videoEl = videoRefs.current[socketListId];
            if (videoEl) {
                videoEl.srcObject = stream;
                videoEl.play().catch(() => {});
            }

            setVideos(prev => {
                const exists = prev.find(v => v.socketId === socketListId);
                if (exists) return prev; 
                return [...prev, { socketId: socketListId }];
            });
        };

        pc.onnegotiationneeded = async () => {
            try {
                if (pc._makingOffer) return;
                if (pc.signalingState !== "stable") return;
                if (pc._suppressNegotiation) return;

                pc._makingOffer = true;
                await pc.setLocalDescription();

                socketRef.current.emit("signal", socketListId, JSON.stringify({
                    sdp: pc.localDescription
                }));
            } catch (e) {
                if (e.name !== "InvalidStateError") console.log("onnegotiationneeded error:", e);
            } finally {
                pc._makingOffer = false;
            }
        };

        return pc;
    
    };

    const connectToSocketServer = () => {
        socketRef.current = io.connect(server_url, {secure: false});

        socketRef.current.on("signal", gotMessageFromServer);

        socketRef.current.once("connect", () => {
            socketIdRef.current = socketRef.current.id;
            setMyId(socketRef.current.id);
            socketRef.current.emit("join-call", window.location.href);
        });

        socketRef.current.on("chat-message", addMessage);

        socketRef.current.on("user-left", (id) => {
            if (connections[id]) {
                connections[id].close();
                delete connections[id];
            }
            if (remoteStreams.current[id]) delete remoteStreams.current[id];
            setVideos(prev => prev.filter(v => v.socketId !== id));
        });

        socketRef.current.on("user-connected", (newSocketId, clients) => {
            const mySocketId = socketIdRef.current;

            if (mySocketId === newSocketId) {
                clients
                    .filter(id => id !== mySocketId)
                    .forEach(existingId => {
                        createPeer(existingId, false, true);
                    });
            }
        });
    };

    const addTracksToPeer = (pc, stream) => {
        const audioTrack = stream.getAudioTracks()[0];
        const videoTrack = stream.getVideoTracks()[0];

        const senders = pc.getSenders();

        if (audioTrack && !senders.find(s => s.track === audioTrack)) {
            pc.addTrack(audioTrack, stream);
        }

        if (videoTrack && !senders.find(s => s.track === videoTrack)) {
            pc.addTrack(videoTrack, stream);
        }
    };

    const getUserMediaSuccess = (stream) => {
        try {
            if (window.localStream) {
                window.localStream.getTracks().forEach(track => track.stop());
            }
        } catch (e) {
            console.log(e);
        }

        window.localStream = stream;

        if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
        }

        Object.keys(connections).forEach(id => {
            const pc = connections[id];
            addTracksToPeer(pc, stream);
        });
    };

    let silence = () => {
        let ctx = new AudioContext();
        let oscillator = ctx.createOscillator();
        let dst = oscillator.connect(ctx.createMediaStreamDestination());
        oscillator.start();
        ctx.resume();
        return Object.assign(dst.stream.getAudioTracks()[0], {enabled: false})
    }

    let black = ({width = 640, height = 480} = {}) => {
        let canvas = Object.assign(document.createElement("canvas"), {width, height});
        canvas.getContext('2d').fillRect(0, 0, width, height);
        let stream = canvas.captureStream();
        return Object.assign(stream.getVideoTracks()[0], {enabled: false});
    }

    const stopTracks = () => {
        try {
            const stream = localVideoRef.current?.srcObject;

            if (stream) {
                stream.getTracks().forEach(track => track.stop());
                localVideoRef.current.srcObject = null;
            }

            window.localStream = null;

        } catch (err) {
            console.log(err);
        }
    };

    const getUserMedia = async () => {
        try {
            const constraints = {
                video: videoAvailable && video,
                audio: audioAvailable && audio
            };

            if (!constraints.video && !constraints.audio) {
                stopTracks();
                return;
            }

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            getUserMediaSuccess(stream);

        } catch (e) {
            console.log("getUserMedia error:", e);
        }
    };

    useEffect(() => {
        if(video !== undefined && audio !== undefined) {
            getUserMedia();
        }
    }, [audio, video]);

    const getMedia = () => {
        setVideo(videoAvailable);
        setAudio(audioAvailable);
        connectToSocketServer();
    }

    const connect = () => {
        setAskForUsername(false);
        getMedia();
    }

    const setVideoRef = useCallback((el, socketId) => {
        if (!el) return;
        videoRefs.current[socketId] = el;
        
        const stream = remoteStreams.current[socketId];
        if (stream) {
            el.srcObject = stream;
            el.play().catch(() => {});
        }
    }, []);

    const handleVideo = () => {
        setVideo(!video);
    }

    const handleAudio = () => {
        setAudio(!audio);
    }

    const handleScreen = () => {
        setScreen(!screen);
    }

    const handleChat = () => {
        setShowModal(!showModal);
    }

    const handleEndCall = () => {
        try {
            let tracks = localVideoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop());
        } catch(err) {
            console.log(err);
        }

        routeTo("/home");
    }

    const sendMessage = () => {
        socketRef.current.emit("chat-message", message, username);
        setMessage("");
    }

    const getDisplayMediaSuccess = async (stream) => {
        try {
            window.localStream.getTracks().forEach(track => track.stop());
        } catch(err) {
            console.log(err);
        }

        window.localStream = stream;
        if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
        }

        for (let id in connections) {
            const pc = connections[id];
            const senders = pc.getSenders();

            stream.getTracks().forEach(track => {
                const sender = senders.find(s => s.track && s.track.kind === track.kind);
                if (sender) {
                    sender.replaceTrack(track);
                } else {
                    pc.addTrack(track, stream);
                }
            });

            // ✅ Force renegotiation so remote peer gets new track
            try {
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                socketRef.current.emit("signal", id, JSON.stringify({
                    sdp: pc.localDescription
                }));
            } catch(e) {
                console.log("renegotiation error:", e);
            }

            stream.getVideoTracks()[0].onended = () => {
                setScreen(false);
                navigator.mediaDevices.getUserMedia({
                    video: videoAvailable,
                    audio: audioAvailable
                }).then(cameraStream => {
                    getUserMediaSuccess(cameraStream);
                }).catch(console.log);
            };
        }
    };

    const getDisplayMedia = () => {
        if (screen) {
            if (navigator.mediaDevices.getDisplayMedia) {
                // ✅ Warn user not to share this tab
                const confirmed = window.confirm(
                    "Tip: Do not share this browser tab to avoid infinite mirror effect. Share a different window or your entire screen."
                );
                if (!confirmed) {
                    setScreen(false);
                    return;
                }

                navigator.mediaDevices.getDisplayMedia({ 
                    video: true, 
                    audio: true,
                    selfBrowserSurface: "exclude" // Chrome 107+ excludes current tab from picker
                })
                .then(getDisplayMediaSuccess)
                .catch(err => console.log(err));
            }
        }
    };

    useEffect(() => {
        if (screen !== undefined) {
            getDisplayMedia();
        }
    }, [screen]);

    return (
        <div className="em-meet-root">

            { askForUsername === true ?

                <div className="em-lobby">
                    <h2>Enter into lobby</h2>
                    <TextField 
                        id="outlined-basic" 
                        label="Username" 
                        value={username} 
                        onChange={e => setUsername(e.target.value)} 
                        variant="outlined" 
                    />
                    <Button variant="contained" onClick={connect}>Connect</Button>

                    <div className="em-preview-wrap">
                        <video ref={localVideoRef} autoPlay muted playsInline />
                    </div>
                </div>

            : <div className="em-call">

                {showModal === true ? (
                    <div className="em-chat-room">
                        <div className="em-chat-room-container">     
                        <h1>Chat</h1>                             

                        {messages.length > 0 ? (
                            <div className="em-messages">
                            {messages.map((item, index) => (
                                <div key={index}>
                                <p style={{ fontWeight: "bold" }}>{item.sender}</p> 
                                <p>{item.data}</p>                                    
                                </div>
                            ))}
                            </div>
                        ) : (
                            <div className="em-empty-chatbox">No messages yet. Start the conversation</div>
                        )}

                        <div className="em-typing-area">          
                            <TextField
                            id="outlined-basic"
                            label="Enter Message"
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            variant="outlined"
                            />
                            <Button variant="contained" onClick={sendMessage}>Send</Button>
                        </div>
                        </div>
                    </div>
                    ) : <></>}

                <div className="em-call-button-container">
                    <IconButton onClick={handleVideo} style={{color: "white"}}>
                        {(video === true) ? <VideoCamIcon /> : <VideoCamOffIcon />}
                    </IconButton>
                    <IconButton onClick={handleEndCall} style={{color: "red"}}>
                        <CallEndIcon />
                    </IconButton>
                    <IconButton onClick={handleAudio} style={{color: "white"}}>
                        {(audio === true) ? <MicOnIcon /> : <MicOffIcon />}
                    </IconButton>
                    { screenAvailable === true ?
                    <IconButton onClick={handleScreen} disabled style={{color: "white"}}>
                        {(screen === true) ? <ScreenShareIcon /> : <StopScreenShareIcon />}
                    </IconButton> : <></>}

                    <Badge badgeContent={newMessages} max={999} color="secondary">
                        <IconButton onClick={handleChat} style={{color: "white"}}>
                            <ChatIcon />
                        </IconButton>
                    </Badge>
                </div>

                <div className="em-local-video-wrap">
                    <video ref={localVideoRef} autoPlay muted />
                </div>

                <div className="em-remote-grid">
                    {videos.map(({ socketId }) => (
                    <div key={socketId} className="em-tile">
                        {socketId !== socketIdRef.current && <h2>{username}</h2>}
                        <video
                        ref={el => setVideoRef(el, socketId)}
                        autoPlay
                        playsInline
                        muted={false}
                        />
                    </div>
                    ))}
                </div>

              </div>}

        </div>
    )
}