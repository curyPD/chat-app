import { useState, useEffect, useMemo } from "react";
import {
    Outlet,
    useNavigate,
    useRevalidator,
    useLoaderData,
    useMatch,
} from "react-router-dom";
import { auth, database } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
    ref,
    onChildAdded,
    onChildChanged,
    get,
    query,
    orderByChild,
    equalTo,
} from "firebase/database";
import ChatLink from "../components/ChatLink";
import useCheckIsMobile from "../hooks/useCheckIsMobile";
import LoadingScreen from "../components/LoadingScreen";
import DesktopHeader from "../components/DesktopHeader";
import MobileNav from "../components/MobileNav";
import ChatFilterInput from "../components/ChatFilterInput";
import NoMessagesScreen from "../components/NoMessagesScreen";

export async function loader({ request }) {
    const url = new URL(request.url);
    const searchTerm = url.searchParams.get("q");
    if (searchTerm === "" || !searchTerm) return { users: null, searchTerm };
    const usersQuery = query(
        ref(database, `data/users`),
        orderByChild("name"),
        equalTo(searchTerm.trim())
    );
    const snapshot = await get(usersQuery);
    if (snapshot.exists()) {
        const entries = Object.entries(snapshot.val());
        const values = entries.map((entry) => entry[1]);
        return { users: values, searchTerm };
    } else return { users: null, searchTerm };
}

export default function Root() {
    const response = useLoaderData();
    const users = response?.users;
    const searchTerm = response?.searchTerm;
    const [curUser, setCurUser] = useState("");
    const [chats, setChats] = useState([]);
    const [query, setQuery] = useState("");
    const isMobile = useCheckIsMobile();

    const filteredChats = useMemo(() => {
        if (!query) return chats;
        return chats.filter((chat) =>
            chat.partner_name.toLowerCase().includes(query.toLowerCase())
        );
    }, [chats, query]);

    const navigate = useNavigate();
    const revalidator = useRevalidator();
    const matchesHomePage = useMatch("/");

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

    const chatElements = filteredChats.map((chat) => (
        <ChatLink
            key={chat.chat_id}
            id={chat.chat_id}
            partnerName={chat.partner_name}
            partnerProfilePicture={chat.partner_profile_picture}
            lastMessage={chat.last_message_text}
            timestamp={chat.timestamp}
        />
    ));

    return !auth.currentUser || revalidator.state === "loading" ? (
        <LoadingScreen />
    ) : (
        <>
            {!isMobile ? (
                <>
                    <DesktopHeader users={users} searchTerm={searchTerm} />
                    <div className="h-screen bg-custom-gradient">
                        <div className="mx-auto grid h-full max-w-screen-lg grid-cols-[360px,1fr] gap-x-5 px-2 pt-20 pb-4">
                            <div className="h-full overflow-y-auto rounded-2xl border border-slate-200 pb-6">
                                <div className="sticky top-0 left-0 w-full px-4">
                                    <div className="h-6 bg-white"></div>
                                    <div className="relative bg-white">
                                        <ChatFilterInput
                                            query={query}
                                            setQuery={setQuery}
                                        />
                                    </div>
                                    <div className="h-8 bg-gradient-to-b from-white"></div>
                                </div>
                                {chatElements.length ? (
                                    <ul>{chatElements}</ul>
                                ) : (
                                    <NoMessagesScreen />
                                )}
                            </div>

                            <Outlet />
                        </div>
                    </div>
                </>
            ) : matchesHomePage ? (
                <>
                    <header className="fixed top-0 left-0 z-10 flex h-16 w-full items-center border-b border-slate-200 bg-white px-6 shadow-sm sm:px-8 md:ml-14 md:w-fixed-bar-tablet md:px-6">
                        <ChatFilterInput query={query} setQuery={setQuery} />
                    </header>
                    {chatElements.length ? (
                        <main className="h-screen pb-12 pt-16 md:ml-14 md:pb-0">
                            <ul className="h-full overflow-y-auto py-5">
                                {chatElements}
                            </ul>
                        </main>
                    ) : (
                        <NoMessagesScreen />
                    )}
                </>
            ) : (
                <Outlet />
            )}

            <MobileNav />
        </>
    );
}
