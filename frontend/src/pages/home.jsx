import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IconButton, Button } from "@mui/material";
import RestoreIcon from "@mui/icons-material/Restore"
import TextField from "@mui/material/TextField";
import "../home.css"

export default function Home({ getHistory, addHistory }) {
    let navigate = useNavigate();

    let [meetingCode, setMeetingCode] = useState("");
    let handleJoinVideoCall = async () => {
        await addHistory(meetingCode);
        navigate(`/${meetingCode}`);
    }

    return (
        <div className="landingPageContainer">
            <nav>
                <div className="navHeader">
                    <h2 onClick={() => navigate("/")}>Echo<span style={{color: "#FF9839"}}>Meet</span></h2>
                </div>
                <div className="navList">
                    <IconButton onClick={() => navigate("/history") }>
                        <RestoreIcon />
                        <p className="history">History</p>
                    </IconButton>
                    <Button onClick={async () => {
                        await fetch("http://localhost:8000/logout", {
                            method: "POST",
                            credentials: "include"
                        });

                        navigate("/auth");
                    }}>
                        Logout
                    </Button>
                </div>
            </nav>

            <div className="landingMainContainer">
                <div className="left-panel">
                    <h6>Provide <em>Quality</em> Video Call Just Like <em>Quality</em> Education</h6>

                    <div className="em-join-row">
                    <TextField
                        id="outlined-basic"
                        label="Meeting Code"
                        value={meetingCode}
                        onChange={e => setMeetingCode(e.target.value)}
                        variant="outlined"
                    />
                    <Button variant="contained" onClick={handleJoinVideoCall}>Join</Button>
                    </div>
                </div>
                <div className="right-panel">
                    <img src="/calling.png" alt="" />
                </div>
            </div>

        </div>
    )
}