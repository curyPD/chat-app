import { useEffect, useRef } from "react";
import logo from "../assets/logo.png";
import { Form, useSubmit, useLocation } from "react-router-dom";
import { HiMagnifyingGlass } from "react-icons/hi2";
import UserLink from "./UserLink";

export default function UserSearchBar({ searchTerm, users, children }) {
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
            <div className="fixed top-0 left-0 z-10 w-full border-b border-slate-200 bg-white px-6 shadow-sm sm:px-8 md:ml-14 md:w-fixed-bar-tablet md:px-6 lg:relative lg:top-auto lg:left-auto lg:z-auto lg:ml-0 lg:w-auto lg:basis-auto lg:border-none lg:bg-transparent lg:px-0 lg:shadow-none">
                <Form
                    action={location.pathname}
                    className="flex h-16 items-center lg:relative lg:block lg:h-auto lg:w-80"
                >
                    <input
                        type="search"
                        name="q"
                        onChange={(e) => {
                            submit(e.currentTarget.form);
                        }}
                        ref={userSearchFieldRef}
                        defaultValue={searchTerm}
                        className="w-full rounded-full border border-slate-100 bg-white py-1.5 px-4 pr-10 text-sm text-slate-700 shadow placeholder:text-slate-300 focus:border-sky-300 focus:outline-none focus:ring-1 focus:ring-sky-300 lg:pr-11"
                        placeholder="Search for people by name"
                    />
                    <div className="absolute top-1/2 right-0 -translate-y-1/2 -translate-x-9 bg-white pl-2 sm:-translate-x-12 md:-translate-x-10 lg:-translate-x-4">
                        <HiMagnifyingGlass className="h-5 w-5 text-slate-300 " />
                    </div>
                </Form>
            </div>
            {!searchTerm ? (
                children
            ) : userElements?.length ? (
                <div className="pb-12 pt-16 md:ml-14 md:pb-0 lg:absolute lg:left-0 lg:top-full lg:z-20 lg:ml-0 lg:w-full lg:translate-y-3 lg:rounded-lg lg:border lg:border-slate-200 lg:bg-white lg:py-3 lg:shadow-lg">
                    <ol className="py-6 lg:py-0">{userElements}</ol>
                </div>
            ) : (
                <div className="flex h-full flex-col items-center justify-center gap-4 lg:absolute lg:left-0 lg:top-full lg:z-20 lg:h-52 lg:w-full lg:translate-y-3 lg:rounded-lg lg:border lg:border-slate-200 lg:bg-white lg:py-2 lg:shadow-lg">
                    <img src={logo} alt="Logo" className="h-8 w-8 shrink-0" />
                    <span className="text-sm text-slate-500">
                        No users found...
                    </span>
                </div>
            )}
        </>
    );
}
