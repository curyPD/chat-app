import { useState } from "react";
import { Form, Link, redirect, useLoaderData } from "react-router-dom";
import { auth, database } from "../firebase";
import { ref, get, update } from "firebase/database";
import { HiOutlineUserCircle } from "react-icons/hi";
import { addNewChat, addNewMessage } from "../helpers";

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
        <>
            <h1>{profileInfo.name}'s profile</h1>
            <div>
                {profileInfo.photo_url ? (
                    <img src={profileInfo.photo_url} alt={profileInfo.name} />
                ) : (
                    <div className="w-16 h-16 rounded-full border-2 border-sky-400 flex items-center justify-center">
                        <HiOutlineUserCircle className="h-12 w-12" />
                    </div>
                )}
            </div>
            {isCurUser ? (
                <Link to="/edit">Edit profile</Link>
            ) : chatId ? (
                <Link to={`/chats/${chatId}`}>Send message</Link>
            ) : (
                <button onClick={() => setIsDialogOpen(true)}>
                    Send message
                </button>
            )}
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
                            className="border border-slate-500 block"
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
        </>
    );
}
