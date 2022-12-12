import { useState } from "react";
import { Form, Link, redirect, useLoaderData } from "react-router-dom";
import { auth, database } from "../firebase";
import { ref, get, update } from "firebase/database";
import { addNewChat, addNewMessage } from "../helpers";
import { HiOutlineUser, HiOutlineEnvelope } from "react-icons/hi2";
import { IoLogoTwitter } from "react-icons/io";

export async function action({ request }) {
    const formData = await request.formData();
    const message = formData.get("message");
    const partnerUid = formData.get("partnerUid");
    const partnerName = formData.get("partnerName");
    const partnerProfilePicture = formData.get("partnerProfilePicture");
    const updates = {};
    const newChatKey = addNewChat(
        updates,
        {
            name: auth.currentUser.displayName,
            uid: auth.currentUser.uid,
            profilePicture: auth.currentUser.photoURL,
        },
        {
            name: partnerName,
            uid: partnerUid,
            profilePicture: partnerProfilePicture,
        }
    );
    addNewMessage(
        newChatKey,
        message,
        auth.currentUser.uid,
        partnerUid,
        updates
    );
    await update(ref(database), updates);
    return redirect(`/chats/${newChatKey}`);
}

export async function loader({ params }) {
    const snapshot = await get(ref(database, `data/users/${params.userId}`));
    if (!snapshot.exists())
        throw new Response("No user found", { status: 404 });
    return { profileInfo: snapshot.val() };
}

export default function Profile() {
    const { profileInfo } = useLoaderData();
    const [input, setInput] = useState("");
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
        <div className="h-full overflow-y-auto bg-custom-gradient pb-12 pt-24">
            <main className="relative min-h-full rounded-3xl border border-slate-200 bg-white/50 px-6 pb-8 backdrop-blur-md">
                <div className="mx-auto min-h-full max-w-md">
                    {profileInfo.profile_picture ? (
                        <div className="absolute top-0 left-1/2 z-10 -translate-y-1/2 -translate-x-1/2 rounded-full border-4 border-white bg-slate-100">
                            <img
                                src={profileInfo.profile_picture}
                                alt={profileInfo.name}
                                className="h-24 w-24 rounded-full object-cover"
                            />
                        </div>
                    ) : (
                        <div className="absolute top-0 left-1/2 flex h-24 w-24 -translate-y-1/2 -translate-x-1/2 items-center justify-center rounded-full border-4 border-white bg-slate-100">
                            <HiOutlineUser className="h-12 w-12 text-slate-400" />
                        </div>
                    )}
                    <h1 className="mt-16 mb-4 text-center text-lg font-bold text-slate-800">
                        {profileInfo.name}
                    </h1>
                    {profileInfo.bio && (
                        <p className="mb-5 text-sm text-slate-800">
                            {profileInfo.bio}
                        </p>
                    )}
                    {isCurUser ? (
                        <Link
                            className="mb-6 block w-full rounded-md bg-sky-500 py-2 px-4 text-center text-xs font-semibold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
                            to="/edit"
                        >
                            Edit profile
                        </Link>
                    ) : chatId ? (
                        <Link
                            className="mb-6 block w-full rounded-md bg-sky-500 py-2 px-4 text-center text-xs font-semibold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
                            to={`/chats/${chatId}`}
                        >
                            Send message
                        </Link>
                    ) : (
                        <button
                            className="mb-6 block w-full rounded-md bg-sky-500 py-2 px-4 text-center text-xs font-semibold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
                            onClick={() => setIsDialogOpen(true)}
                        >
                            Send message
                        </button>
                    )}

                    {profileInfo.twitter && (
                        <div className="mb-4 flex items-center gap-3">
                            <IoLogoTwitter className="h-5 w-5 text-slate-500" />
                            <a
                                className="text-sm text-slate-900 focus:outline-none focus-visible:text-sky-500"
                                href={`https://twitter.com/${profileInfo.twitter}`}
                            >
                                @{profileInfo.twitter}
                            </a>
                        </div>
                    )}

                    {isCurUser && profileInfo.email && (
                        <div className="mb-4 flex items-center gap-3">
                            <HiOutlineEnvelope className="h-5 w-5 text-slate-500" />
                            <a
                                className="text-sm text-slate-900 focus:outline-none focus-visible:text-sky-500"
                                href={`mailto:${profileInfo.email}`}
                            >
                                {profileInfo.email}
                            </a>
                        </div>
                    )}
                </div>
            </main>
            {isDialogOpen && (
                <div>
                    <button onClick={() => setIsDialogOpen(false)}>X</button>
                    <Form
                        method="post"
                        onSubmit={(e) => {
                            if (!input) e.preventDefault();
                        }}
                    >
                        <h3>Send message to {profileInfo.name}</h3>
                        <input
                            type="text"
                            name="message"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="block border border-slate-500"
                        />
                        <input
                            type="hidden"
                            name="partnerUid"
                            value={profileInfo.uid}
                        />
                        <input
                            type="hidden"
                            name="partnerName"
                            value={profileInfo.name}
                        />
                        <input
                            type="hidden"
                            name="partnerProfilePicture"
                            value={profileInfo.profile_picture}
                        />
                    </Form>
                </div>
            )}
        </div>
    );
}
