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
    Link,
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
import DesktopNav from "../components/DesktopNav";
import {
    HiOutlineCog6Tooth,
    HiMagnifyingGlass,
    HiOutlineChatBubbleOvalLeftEllipsis,
    HiOutlineUser,
} from "react-icons/hi2";
import logo from "../assets/logo.png";
import useCheckIsMobile from "../hooks/useCheckIsMobile";

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
    const [isDesktopNavOpen, setIsDesktopNavOpen] = useState(false);
    const userSearchFieldRef = useRef(null);
    const isMobile = useCheckIsMobile();

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

    function openDesktopNav() {
        setIsDesktopNavOpen(true);
    }

    function closeDesktopNav() {
        setIsDesktopNavOpen(false);
    }

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
            {!isMobile ? (
                <>
                    <header className="fixed top-0 left-0 z-20 h-16 w-full border-b border-slate-200 bg-white/50 backdrop-blur">
                        <div className="mx-auto flex h-full max-w-screen-lg items-center justify-between px-2">
                            <div className="flex items-center gap-3">
                                <img
                                    src={logo}
                                    alt="Logo"
                                    className="h-7 w-7"
                                />
                                <p className="text-lg font-semibold tracking-tight text-slate-900">
                                    Messengr
                                </p>
                            </div>
                            <div className="relative">
                                <Form
                                    action={location.pathname}
                                    className="relative w-80 basis-auto"
                                >
                                    <input
                                        type="search"
                                        name="q"
                                        onChange={(e) => {
                                            submit(e.currentTarget.form);
                                        }}
                                        ref={userSearchFieldRef}
                                        defaultValue={searchTerm}
                                        className="w-full rounded-full border border-transparent bg-white py-1.5 px-4 pr-10 text-sm text-slate-700 shadow placeholder:text-slate-300 focus:border-sky-300 focus:outline-none focus:ring-1 focus:ring-sky-300"
                                        placeholder="Search for people by name"
                                    />
                                    <div className="absolute top-1/2 right-0 -translate-y-1/2 -translate-x-4">
                                        <HiMagnifyingGlass className="h-5 w-5 text-slate-300" />
                                    </div>
                                </Form>
                                {!searchTerm ? (
                                    <></>
                                ) : userElements?.length ? (
                                    <div className="absolute left-0 top-full z-20 w-full translate-y-3 rounded-lg border border-slate-200 bg-white py-3 shadow-lg">
                                        <ol>{userElements}</ol>
                                    </div>
                                ) : (
                                    <div className="absolute left-0 top-full z-20 flex h-52 w-full translate-y-3 flex-col items-center justify-center gap-4 rounded-lg border border-slate-200 bg-white py-2 shadow-lg">
                                        <img
                                            src={logo}
                                            alt="Logo"
                                            className="h-8 w-8 shrink-0"
                                        />
                                        <span className="text-sm text-slate-500">
                                            No users found...
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div
                                className="relative flex items-center"
                                onMouseEnter={openDesktopNav}
                                onMouseLeave={closeDesktopNav}
                            >
                                <Link to={`users/${auth.currentUser.uid}`}>
                                    <img
                                        src={auth.currentUser.photoURL}
                                        alt="Current user's avatar"
                                        className="h-11 w-11 rounded-full object-cover"
                                    />
                                </Link>

                                {isDesktopNavOpen && <DesktopNav />}
                            </div>
                        </div>
                    </header>
                    <div className="h-screen bg-custom-gradient">
                        <div className="mx-auto grid h-full max-w-screen-lg grid-cols-[360px,1fr] gap-x-5 px-2 pt-20 pb-4">
                            <div className="h-full overflow-y-auto rounded-2xl border border-slate-200 pb-6">
                                <div className="sticky top-0 left-0 w-full px-4">
                                    <div className="h-6 bg-white"></div>
                                    <div className="relative bg-white">
                                        <input
                                            type="search"
                                            value={query}
                                            onChange={(e) =>
                                                setQuery(e.target.value)
                                            }
                                            className="block w-full rounded-full border border-transparent py-1.5 px-4 pr-10 text-sm text-slate-700 shadow placeholder:text-slate-300 focus:border-sky-300 focus:outline-none focus:ring-1 focus:ring-sky-300"
                                            placeholder="Filter chats by names"
                                        />
                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 -translate-x-4">
                                            <HiMagnifyingGlass className="h-5 w-5 text-slate-300" />
                                        </div>
                                    </div>
                                    <div className="h-8 bg-gradient-to-b from-white"></div>
                                </div>
                                {chatElements.length ? (
                                    <ul>{chatElements}</ul>
                                ) : (
                                    <div className="mt-44 flex flex-col items-center justify-center gap-4">
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
                            </div>

                            <Outlet />
                        </div>
                    </div>
                </>
            ) : matchesHomePage ? (
                <>
                    <header className="fixed top-0 left-0 z-10 flex h-16 w-full items-center border-b border-slate-200 bg-white px-6 shadow-sm sm:px-8 md:ml-14 md:w-fixed-bar-tablet md:px-6">
                        <input
                            type="search"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="block w-full rounded-full border border-slate-100 bg-white py-1.5 px-4 text-sm text-slate-700 shadow placeholder:text-slate-300 focus:border-sky-300 focus:outline-none focus:ring-1 focus:ring-sky-300"
                            placeholder="Filter chats by names"
                        />
                        <div className="absolute top-1/2 right-0 -translate-y-1/2 -translate-x-8 bg-white pl-2 sm:-translate-x-10 md:-translate-x-8">
                            <HiMagnifyingGlass className="h-5 w-5 text-slate-300 " />
                        </div>
                    </header>
                    {chatElements.length ? (
                        <main className="h-screen pb-12 pt-16 md:ml-14 md:pb-0">
                            <ul className="h-full overflow-y-auto py-5">
                                {chatElements}
                            </ul>
                        </main>
                    ) : (
                        <div className="flex h-screen flex-col items-center justify-center gap-4">
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
            ) : (
                <Outlet />
            )}

            <footer className="fixed bottom-0 left-0 z-10 h-12 w-full md:h-full md:w-14 lg:hidden">
                <nav className="flex h-full items-center justify-evenly border-t border-slate-200 bg-white px-4 md:flex-col-reverse md:justify-end md:gap-9 md:border-t-0 md:border-r md:px-0 md:pt-4">
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
        </>
    );
}
