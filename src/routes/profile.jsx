import { useState } from "react";
import { Link, redirect, useLoaderData, useActionData } from "react-router-dom";
import { auth, database } from "../firebase";
import { ref, get, update } from "firebase/database";
import { addNewChat, addNewMessage } from "../helpers";
import { HiOutlineUser, HiOutlineEnvelope } from "react-icons/hi2";
import { IoLogoTwitter } from "react-icons/io";
import FirstMessageDialogWindow from "../components/FirstMessageDialogWindow";
import { AnimatePresence } from "framer-motion";
import Message from "../components/Message";

export async function action({ request }) {
    const formData = await request.formData();
    const response = {};
    try {
        const message = formData.get("message");
        const partnerUid = formData.get("partnerUid");
        const partnerName = formData.get("partnerName");
        const partnerProfilePicture = formData.get("partnerProfilePicture");
        const curUserUid = formData.get("curUserUid");
        const curUserName = formData.get("curUserName");
        const curUserProfilePicture = formData.get("curUserProfilePicture");
        const updates = {};
        const newChatKey = addNewChat(
            updates,
            {
                name: curUserName,
                uid: curUserUid,
                profilePicture: curUserProfilePicture,
            },
            {
                name: partnerName,
                uid: partnerUid,
                profilePicture: partnerProfilePicture,
            }
        );
        await addNewMessage(
            newChatKey,
            message,
            auth.currentUser.uid,
            partnerUid,
            null,
            updates
        );
        await update(ref(database), updates);
        return redirect(`/chats/${newChatKey}`);
    } catch (err) {
        console.error(err);
        response.error = "Something went wrong. Please try again.";
        return response;
    }
}

export async function loader({ params }) {
    const snapshot = await get(ref(database, `users/${params.userId}`));
    if (!snapshot.exists()) {
        throw new Response("No user found", { status: 404 });
    }
    const { currentUser } = auth;
    if (!currentUser) return {};
    let curUserSnapshot;
    if (snapshot.val().uid !== currentUser.uid) {
        curUserSnapshot = await get(ref(database, `users/${currentUser.uid}`));
    }
    return {
        profileInfo: snapshot.val(),
        curUserProfileInfo: curUserSnapshot ? curUserSnapshot.val() : {},
    };
}

export default function Profile() {
    const { profileInfo, curUserProfileInfo } = useLoaderData();
    const response = useActionData();
    const error = response?.error;
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const isCurUser = auth.currentUser.uid === profileInfo.uid;
    let chatId;
    if (!isCurUser && profileInfo.chats) {
        const chatWithCurUser = Object.values(profileInfo.chats).find(
            (chat) => chat.partner_uid === auth.currentUser.uid
        );
        if (chatWithCurUser) {
            chatId = chatWithCurUser.chat_id;
        }
    }

    return (
        <div className="h-screen overflow-y-auto bg-custom-gradient pb-12 pt-24 dark:bg-custom-gradient-dark md:pb-0 lg:h-full lg:bg-none lg:pt-0 lg:dark:bg-none">
            {error && <Message error={true} text={error} />}
            <main className="relative mx-auto min-h-full max-w-lg rounded-t-3xl border border-slate-200 bg-white/50 px-6 pb-8 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/50 lg:mx-0 lg:h-full lg:min-h-0 lg:max-w-none lg:overflow-y-auto lg:rounded-2xl lg:px-8 lg:pt-6">
                {profileInfo.profile_picture ? (
                    <div className="absolute top-0 left-0 z-10 -translate-y-1/2 translate-x-6 rounded-full border-4 border-white dark:border-slate-900 dark:bg-slate-800 lg:translate-y-6 lg:border-transparent">
                        <img
                            src={profileInfo.profile_picture}
                            alt={profileInfo.name}
                            className="h-24 w-24 rounded-full object-cover sm:h-28 sm:w-28"
                        />
                    </div>
                ) : (
                    <div className="absolute top-0 left-0 flex h-24 w-24 -translate-y-1/2 translate-x-6 items-center justify-center rounded-full border-4 border-white bg-slate-100 dark:border-slate-900 dark:bg-slate-800 sm:h-28 sm:w-28 lg:translate-y-6 lg:border-transparent">
                        <HiOutlineUser className="h-10 w-10 text-slate-400 dark:text-slate-500 sm:h-12 sm:w-12 lg:h-12 lg:w-12" />
                    </div>
                )}
                <div className="mt-4 flex justify-end">
                    {isCurUser ? (
                        <Link
                            className="rounded-md bg-sky-500 py-2 px-4 text-xs font-semibold text-white transition-colors hover:bg-sky-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 lg:px-5 lg:text-sm"
                            to="/edit"
                        >
                            Edit profile
                        </Link>
                    ) : chatId ? (
                        <Link
                            className="rounded-md bg-sky-500 py-2 px-4 text-xs font-semibold text-white transition-colors hover:bg-sky-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 lg:px-5 lg:text-sm"
                            to={`/chats/${chatId}`}
                        >
                            Send message
                        </Link>
                    ) : (
                        <button
                            className="rounded-md bg-sky-500 py-2 px-4 text-xs font-semibold text-white transition-colors hover:bg-sky-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 lg:px-5 lg:text-sm"
                            onClick={() => setIsDialogOpen(true)}
                        >
                            Send message
                        </button>
                    )}
                </div>
                <h1 className="mt-8 mb-4 text-left text-lg font-bold text-slate-900 dark:text-white sm:mt-10 lg:mt-24 lg:text-xl">
                    {profileInfo.name}
                </h1>
                {profileInfo.bio && (
                    <p className="mb-4 text-xs text-slate-900 dark:text-slate-50 lg:text-sm">
                        {profileInfo.bio}
                    </p>
                )}
                <div className="flex flex-wrap items-center space-x-5">
                    {profileInfo.twitter && (
                        <div className="flex items-center gap-2">
                            <IoLogoTwitter className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                            <a
                                className="text-xs text-slate-500 transition-colors hover:text-slate-700 focus:outline-none focus-visible:text-sky-500 dark:text-slate-400 dark:hover:text-slate-500 lg:text-sm"
                                href={`https://twitter.com/${profileInfo.twitter}`}
                            >
                                @{profileInfo.twitter}
                            </a>
                        </div>
                    )}

                    {isCurUser && profileInfo.email && (
                        <div className="flex items-center gap-2">
                            <HiOutlineEnvelope className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                            <a
                                className="text-xs text-slate-500 transition-colors hover:text-slate-700 focus:outline-none focus-visible:text-sky-500 dark:text-slate-400 dark:hover:text-slate-500 lg:text-sm"
                                href={`mailto:${profileInfo.email}`}
                            >
                                {profileInfo.email}
                            </a>
                        </div>
                    )}
                </div>
            </main>
            <AnimatePresence>
                {isDialogOpen && (
                    <FirstMessageDialogWindow
                        closeDialog={() => setIsDialogOpen(false)}
                        profileInfo={profileInfo}
                        curUserProfileInfo={curUserProfileInfo}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
