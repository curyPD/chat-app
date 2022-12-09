import { useState, useEffect, useMemo, useRef } from "react";
import {
    Outlet,
    useNavigate,
    useRevalidator,
    Form,
    useLoaderData,
    useSubmit,
    useLocation,
    useMatch,
    NavLink,
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
import UserLink from "../components/UserLink";

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
    const userSearchFieldRef = useRef(null);

    const filteredChats = useMemo(() => {
        if (!query) return chats;
        return chats.filter((chat) =>
            chat.partner_name.toLowerCase().includes(query.toLowerCase())
        );
    }, [chats, query]);

    const navigate = useNavigate();
    const revalidator = useRevalidator();
    const submit = useSubmit();
    const location = useLocation();
    const matchesHomePage = useMatch("/");

    useEffect(() => {
        if (userSearchFieldRef.current)
            userSearchFieldRef.current.value = searchTerm;
    }, [searchTerm]);

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

    const userElements = users?.map((user, i) => (
        <UserLink
            key={i}
            id={user.uid}
            name={user.name}
            photoURL={user.photo_url}
        />
    ));

    return !auth.currentUser || revalidator.state === "loading" ? (
        <div className="flex h-screen items-center justify-center">
            <p>Loading...</p>
        </div>
    ) : (
        <>
            {/* MOBILE */}
            <main className="grid h-screen grid-cols-1 grid-rows-[1fr_44px]">
                {matchesHomePage && (
                    <section>
                        <input
                            type="search"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        <div>{chatElements}</div>
                    </section>
                )}

                {!matchesHomePage && (
                    <section>
                        <Outlet />
                    </section>
                )}

                <footer>
                    <nav className="flex h-full items-center justify-center gap-4 border-t border-slate-200 bg-slate-50 px-4">
                        <NavLink to="/account">Settings</NavLink>
                        <NavLink to="/">Messages</NavLink>
                        <NavLink to="/search">Search</NavLink>
                        <NavLink to={`/users/${auth.currentUser.uid}`}>
                            Profile
                        </NavLink>
                    </nav>
                </footer>
            </main>

            {/* DESKTOP */}
            <div className="hidden">
                <section className=" bg-slate-100">
                    <input
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <div>{chatElements}</div>
                </section>
                <main className=" bg-sky-200">
                    <div>
                        <Form action={location.pathname}>
                            <input
                                type="text"
                                name="q"
                                onChange={(e) => {
                                    submit(e.currentTarget.form);
                                }}
                                ref={userSearchFieldRef}
                                defaultValue={searchTerm}
                            />
                        </Form>
                        {userElements && <div>{userElements}</div>}
                    </div>
                    <Outlet />
                </main>
            </div>
        </>
    );
}
