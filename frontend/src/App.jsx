import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom"
import './App.css'
import LandingPage from './pages/landing'
import Authentication from './pages/authentication'
import axios from 'axios'
import VideoMeetComponent from './pages/videoMeet'
import Home from './pages/home'
import AuthGuard from './utils/withAuth'
import History from './pages/history'

function App() {

  const router = useNavigate();

  const handleLogin = async ({ username, password }) => {
    const res = await fetch("http://localhost:8000/api/v1/users/login", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    console.log(data);

    if (res.ok) {
      router("/home");   // redirect after login
    }
  };

  const handleRegister = async (data) => {
    try {
      const res = await axios.post("http://localhost:8000/api/v1/users/register", data);
      console.log(res.data.message);
    } catch (err) {
      if (err.response?.status === 409) {
        alert("User already exists. Try another username.");
      } else {
        console.log("Something went wrong", err.message);
      }
    }
  };

  const getHistoryOfUser = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/v1/users/get_all_activity", 
        {
          withCredentials: true
        }
      );
      console.log(res.data);
      return res.data;
    } catch(err) {
      console.log("Something went wrong", err.message);
    }
  }

  const addToHistory = async (meetingCode) => {
    try {
      const res = await axios.post(
        "http://localhost:8000/api/v1/users/add_to_activity",
        { meetingCode }, 
        {
          withCredentials: true
        }
      );

      console.log(res.data.message);
    } catch (err) {
      console.log(err.response?.data || err.message);
    }
  };

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<Authentication onLogin={handleLogin} onRegister={handleRegister}/>} />
        <Route path="/:url" element={<VideoMeetComponent />} />
        <Route path="/home" element={<AuthGuard><Home addHistory={addToHistory}/></AuthGuard>}/>
        <Route path="/history" element={<History getHistory={getHistoryOfUser} />}/>
      </Routes>
    </>
  )
}

export default App
