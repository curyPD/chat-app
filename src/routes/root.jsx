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
import MobileNavLink from "../components/MobileNavLink";
import { HiMagnifyingGlass } from "react-icons/hi2";
import { HiOutlineCog6Tooth } from "react-icons/hi2";
import { HiOutlineChatBubbleOvalLeftEllipsis } from "react-icons/hi2";
import { HiOutlineUser } from "react-icons/hi2";
import logo from "../assets/logo.png";

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

    const userElements = users?.map((user) => (
        <UserLink
            key={user.uid}
            id={user.uid}
            name={user.name}
            photoURL={user.photo_url}
        />
    ));

    return !auth.currentUser || revalidator.state === "loading" ? (
        <div className="flex h-screen flex-col items-center justify-center gap-4">
            <img src={logo} alt="Logo" className="h-8 w-8 shrink-0" />
            <span className="text-sm text-slate-500">Loading...</span>
        </div>
    ) : (
        <>
            {/* MOBILE */}
            <div className="relative h-screen bg-white">
                {matchesHomePage && (
                    <>
                        <header className="fixed top-0 left-0 z-10 flex h-16 w-full items-center border-b border-slate-200 bg-slate-100 px-6 sm:px-8 md:ml-14 md:w-fixed-bar-tablet md:px-6">
                            <input
                                type="search"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="block w-full rounded-full border border-transparent bg-white py-1.5 px-4 text-sm text-slate-700 shadow placeholder:text-slate-300 focus:border-sky-300 focus:outline-none focus:ring-1 focus:ring-sky-300"
                                placeholder="Filter chats by names"
                            />
                            <div className="absolute top-1/2 right-0 -translate-y-1/2 -translate-x-8 bg-white pl-2 sm:-translate-x-10 md:-translate-x-8">
                                <HiMagnifyingGlass className="h-5 w-5 text-slate-300 " />
                            </div>
                        </header>
                        {chatElements.length ? (
                            <main className="pb-12 pt-16 md:ml-14 md:pb-0">
                                <ul className="py-5 px-5 sm:px-8 md:px-6">
                                    {chatElements}
                                </ul>
                            </main>
                        ) : (
                            <div className="flex h-full flex-col items-center justify-center gap-4">
                                <img
                                    src={logo}
                                    alt="Logo"
                                    className="h-8 w-8 shrink-0"
                                />
                                <span className="text-sm text-slate-500">
                                    No messages yet...
                                </span>
                            </div>
                        )}
                    </>
                )}

                {!matchesHomePage && <Outlet />}

                <footer className="fixed bottom-0 left-0 z-10 h-12 w-full md:h-full md:w-14 md:shadow-md">
                    <nav className="flex h-full items-center justify-evenly border-t border-slate-200 bg-slate-50 px-4 md:flex-col-reverse md:justify-end md:gap-9 md:px-0 md:pt-4">
                        <MobileNavLink text="Settings" to="/account">
                            <HiOutlineCog6Tooth className="mb-1 h-5 w-5 md:h-7 md:w-7" />
                        </MobileNavLink>
                        <MobileNavLink text="Search" to="/search">
                            <HiMagnifyingGlass className="mb-1 h-5 w-5 md:h-7 md:w-7" />
                        </MobileNavLink>
                        <MobileNavLink text="Messages" to="/">
                            <HiOutlineChatBubbleOvalLeftEllipsis className="mb-1 h-5 w-5 md:h-7 md:w-7" />
                        </MobileNavLink>
                        <MobileNavLink
                            text="Profile"
                            to={`/users/${auth.currentUser.uid}`}
                        >
                            <HiOutlineUser className="mb-1 h-5 w-5 md:h-7 md:w-7" />
                        </MobileNavLink>
                    </nav>
                </footer>
            </div>

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
