import { useEffect } from "react";
import {
    Outlet,
    useLoaderData,
    useNavigate,
    useRevalidator,
} from "react-router-dom";
import { auth, database } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { ref, get } from "firebase/database";
import ChatLink from "../components/ChatLink";

export async function loader() {
    const { currentUser } = auth;
    if (!currentUser) return { chats: [] };
    const { uid } = currentUser;
    const snapshot = await get(ref(database, `data/chats/${uid}`));
    const val = snapshot.val();
    const valEntries = Object.entries(val);
    const chats = valEntries.map((entry) => entry[1]);
    return { chats };
}

export default function Root() {
    const { chats } = useLoaderData();
    const navigate = useNavigate();
    const revalidator = useRevalidator();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user === null) navigate("/login");
            else if (user) revalidator.revalidate();
        });
        return () => unsubscribe();
    }, []);

    const chatElements = chats?.map((chat, i) => (
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
