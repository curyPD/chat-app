import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function Root() {
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            console.log(user);
            if (user === null) navigate("/login");
            else if (user) navigate("/chats");
        });
        return () => unsubscribe();
    }, []);

    return (
        <div className="h-screen flex justify-center items-center">
            <div className="w-9 rounded-full h-9 bg-sky-400 animate-pulse"></div>
        </div>
    );
}
