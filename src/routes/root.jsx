import { useState, useEffect } from "react";
import { Outlet, useNavigate, useRevalidator } from "react-router-dom";
import { auth, database } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { ref, onChildAdded, onChildChanged } from "firebase/database";
import ChatLink from "../components/ChatLink";

export default function Root() {
    const [curUser, setCurUser] = useState("");
    const [chats, setChats] = useState([]);

    const navigate = useNavigate();
    const revalidator = useRevalidator();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user === null) navigate("/login");
            else if (user) {
                setCurUser(user);
                revalidator.revalidate();
            }
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!curUser) return;
        const childAddedUnsubscribe = onChildAdded(
            ref(database, `data/chats/${curUser.uid}`),
            (snapshot) => {
                setChats((prevChats) => [...prevChats, snapshot.val()]);
            }
        );
        const childChangedUnsubscribe = onChildChanged(
            ref(database, `data/chats/${curUser.uid}`),
            (snapshot) => {
                setChats((prevChats) =>
                    prevChats.map((chat) =>
                        chat.chat_id === snapshot.val().chat_id
                            ? snapshot.val()
                            : chat
                    )
                );
            }
        );
        return () => {
            childAddedUnsubscribe();
            childChangedUnsubscribe();
        };
    }, [curUser]);

    const chatElements = chats.map((chat, i) => (
        <ChatLink
            key={i}
            id={chat.chat_id}
            partnerName={chat.partner_name}
            lastMessage={chat.last_message_text}
        />
    ));

    return !auth.currentUser || revalidator.state === "loading" ? (
        <div className="h-screen flex justify-center items-center">
            <div className="w-9 rounded-full h-9 bg-sky-400 animate-pulse"></div>
        </div>
    ) : (
        <main className="h-screen grid grid-cols-[350px_1fr]">
            <section className="bg-slate-100">{chatElements}</section>
            <section className="bg-sky-100">
                <Outlet />
            </section>
        </main>
    );
}
