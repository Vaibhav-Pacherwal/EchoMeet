import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AuthGuard = ({ children }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verifyUser = async () => {
            try {
                const res = await fetch("http://localhost:8000/verify", {
                    method: "GET",
                    credentials: "include"
                });

                if (!res.ok) {
                    navigate("/auth");
                    return;
                }

                const data = await res.json();

                if (!data.authenticated) {
                    navigate("/auth");
                } else {
                    setLoading(false);
                }

            } catch (err) {
                navigate("/auth");
            }
        };

        verifyUser();
    }, [navigate]);

    if (loading) {
        return <div>Loading...</div>;
    }

    return children;
};

export default AuthGuard;