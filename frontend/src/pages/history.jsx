import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import HomeIcon from "@mui/icons-material/Home";
import { IconButton } from "@mui/material";
import { useNavigate } from "react-router-dom";
import "../history.css"

export default function History({ getHistory }) {

    let navigate = useNavigate();

    let [meetings, setMeetings] = useState([]);
    useEffect(() => {
        let fetchHistory = async () => {
            try {
                let history = await getHistory();
                setMeetings(history.meetings);

            } catch(err) {
                console.log("Unable to fetch history!", err.message);
            }
        } 

        fetchHistory();
    }, []);

    let formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const year = date.getFullYear();

        return `${day}/${month}/${year}`;
    }

    return (
        <div className="em-history-root">

            <div className="em-history-topbar">
                <IconButton onClick={() => navigate("/home")}>
                <HomeIcon />  
                </IconButton>
                <span className="em-history-title">Echo<span>Meet</span> — History</span>
            </div>

            <div className="em-history-content">
                <h2 className="em-history-heading">Meeting History</h2>
                <p className="em-history-sub">Your past sessions</p>

                {meetings.length !== 0 ? (
                <div className="em-cards-list">
                    {meetings.map((meeting, index) => (
                    <Card key={index} variant="outlined">
                        <CardContent>
                        <Typography gutterBottom sx={{ fontSize: 14 }}>
                            Code: {meeting.meetingCode}
                        </Typography>
                        <Typography variant="body2">
                            Date: {formatDate(meeting.createdAt)}
                        </Typography>
                        </CardContent>
                    </Card>
                    ))}
                </div>
                ) : (
                <div className="em-history-empty">
                    <div className="em-history-empty-icon">🕐</div>
                    <p>No meetings yet</p>
                </div>
                )}
            </div>

        </div>
    )
}