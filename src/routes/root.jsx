import { useState, useEffect, useMemo } from "react";
import {
    Outlet,
    useNavigate,
    useRevalidator,
    Form,
    useLoaderData,
    useSubmit,
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

export async function loader({ request }) {
    const url = new URL(request.url);
    const searchTerm = url.searchParams.get("q");
    if (searchTerm === "") return {};
    const usersQuery = query(
        ref(database, `data/users`),
        orderByChild("name"),
        equalTo(searchTerm)
    );
    const snapshot = await get(usersQuery);
    if (snapshot.exists()) {
        const entries = Object.entries(snapshot.val());
        const values = entries.map((entry) => entry[1]);
        return { users: values };
    }
}

export default function Root() {
    const values = useLoaderData();
    const users = values?.users;
    const [curUser, setCurUser] = useState("");
    const [chats, setChats] = useState([]);
    const [query, setQuery] = useState("");
    console.log(users);
    const filteredChats = useMemo(() => {
        if (!query) return chats;
        return chats.filter((chat) =>
            chat.partner_name.toLowerCase().includes(query.toLowerCase())
        );
    }, [chats, query]);

    const navigate = useNavigate();
    const revalidator = useRevalidator();
    const submit = useSubmit();

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

    const chatElements = filteredChats.map((chat, i) => (
        <ChatLink
            key={i}
            id={chat.chat_id}
            partnerName={chat.partner_name}
            lastMessage={chat.last_message_text}
        />
    ));

    const userElements = users?.map((user) => (
        <div key={user.uid}>{user.name}</div>
    ));

    return !auth.currentUser || revalidator.state === "loading" ? (
        <div className="h-screen flex justify-center items-center">
            <div className="w-9 rounded-full h-9 bg-sky-400 animate-pulse"></div>
        </div>
    ) : (
        <main className="h-screen grid grid-cols-[350px_1fr]">
            <section className="bg-slate-100">
                <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <div>{chatElements}</div>
            </section>
            <section className="bg-sky-100">
                <div>
                    <Form>
                        <input
                            type="text"
                            name="q"
                            onChange={(e) => {
                                submit(e.currentTarget.form);
                            }}
                        />
                        <button>Search</button>
                    </Form>
                    {userElements && <div>{userElements}</div>}
                </div>
                <Outlet />
            </section>
        </main>
    );
}
