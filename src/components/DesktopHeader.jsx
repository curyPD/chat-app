import { useState } from "react";
import { auth } from "../firebase";
import UserSearchBar from "./UserSearchBar";
import DesktopNav from "./DesktopNav";
import logo from "../assets/logo.png";
import { Link, useFetcher } from "react-router-dom";
import { HiOutlineUser } from "react-icons/hi2";
import { AnimatePresence } from "framer-motion";
import Message from "./Message";

export default function DesktopHeader({ users, searchTerm }) {
    const [isDesktopNavOpen, setIsDesktopNavOpen] = useState(false);
    const fetcher = useFetcher();
    const error = fetcher.data?.error;

    function openDesktopNav() {
        setIsDesktopNavOpen(true);
    }

    function closeDesktopNav() {
        setIsDesktopNavOpen(false);
    }

    return (
        <>
            {error && <Message error={true} text={error} />}
            <header className="fixed top-0 left-0 z-20 h-16 w-full border-b border-slate-200 bg-white/50 backdrop-blur dark:border-slate-800 dark:bg-transparent">
                <div className="mx-auto flex h-full max-w-screen-lg items-center justify-between px-2">
                    <div className="flex items-center gap-3">
                        <img
                            src={logo}
                            alt="Logo"
                            className="h-7 w-7 dark:drop-shadow-lg"
                        />
                        <p className="text-lg font-semibold text-slate-900 dark:text-white">
                            Messengr
                        </p>
                    </div>
                    <div className="relative">
                        <UserSearchBar users={users} searchTerm={searchTerm}>
                            <></>
                        </UserSearchBar>
                    </div>
                    <div
                        className="relative flex items-center"
                        onMouseEnter={openDesktopNav}
                        onMouseLeave={closeDesktopNav}
                    >
                        <Link
                            to={`users/${auth.currentUser.uid}`}
                            className="group focus:outline-none"
                        >
                            {auth.currentUser.photoURL ? (
                                <img
                                    src={auth.currentUser.photoURL}
                                    alt="Current user's avatar"
                                    className="h-11 w-11 rounded-full object-cover group-focus:ring group-focus:ring-sky-300"
                                />
                            ) : (
                                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                                    <HiOutlineUser className="h-7 w-7 text-slate-400 dark:text-slate-500" />
                                </div>
                            )}
                        </Link>
                        <AnimatePresence>
                            {isDesktopNavOpen && (
                                <DesktopNav fetcher={fetcher} />
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </header>
        </>
    );
}
