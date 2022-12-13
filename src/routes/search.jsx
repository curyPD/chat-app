import { useRef, useEffect } from "react";
import { useLoaderData, Form, useSubmit, useLocation } from "react-router-dom";
import UserLink from "../components/UserLink";
import { HiMagnifyingGlass } from "react-icons/hi2";
import logo from "../assets/logo.png";

export default function Search() {
    const response = useLoaderData();
    const users = response?.users;
    const searchTerm = response?.searchTerm;
    const userSearchFieldRef = useRef(null);

    const submit = useSubmit();
    const location = useLocation();

    useEffect(() => {
        if (userSearchFieldRef.current)
            userSearchFieldRef.current.value = searchTerm;
    }, [searchTerm]);

    const userElements = users?.map((user, i) => (
        <UserLink
            key={i}
            id={user.uid}
            name={user.name}
            photoURL={user.photo_url}
        />
    ));
    return (
        <>
            <header className="fixed top-0 left-0 z-10 w-full border-b border-slate-200 bg-slate-100 px-6 sm:px-8 md:ml-14 md:w-fixed-bar-tablet md:px-6">
                <Form
                    action={location.pathname}
                    className="flex h-16 items-center"
                >
                    <input
                        type="search"
                        name="q"
                        onChange={(e) => {
                            submit(e.currentTarget.form);
                        }}
                        ref={userSearchFieldRef}
                        defaultValue={searchTerm}
                        className="w-full rounded-full border border-transparent bg-white py-1.5 px-4 text-sm text-slate-700 shadow placeholder:text-slate-300 focus:border-sky-300 focus:outline-none focus:ring-1 focus:ring-sky-300"
                        placeholder="Search for people by name"
                    />
                    <div className="absolute top-1/2 right-0 -translate-y-1/2 -translate-x-8 bg-white pl-2 sm:-translate-x-10 md:-translate-x-8">
                        <HiMagnifyingGlass className="h-5 w-5 text-slate-300 " />
                    </div>
                </Form>
            </header>
            {!searchTerm ? (
                <div className="flex h-full flex-col items-center justify-center gap-4">
                    <img src={logo} alt="Logo" className="h-8 w-8 shrink-0" />
                    <span className="text-sm text-slate-500">
                        Time to make friends!
                    </span>
                </div>
            ) : userElements?.length ? (
                <main className="pb-12 pt-16 md:ml-14 md:pb-0">
                    <ol className="divide-y divide-slate-200 p-6">
                        {userElements}
                    </ol>
                </main>
            ) : (
                <div className="flex h-full flex-col items-center justify-center gap-4">
                    <img src={logo} alt="Logo" className="h-8 w-8 shrink-0" />
                    <span className="text-sm text-slate-500">
                        No users found...
                    </span>
                </div>
            )}
        </>
    );
}
