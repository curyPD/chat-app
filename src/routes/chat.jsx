import { useState, useEffect } from "react";
import { Link, useLoaderData, useFetcher } from "react-router-dom";
import { auth, database } from "../firebase";
import {
    ref,
    get,
    onChildAdded,
    onChildChanged,
    onChildRemoved,
    push,
    update,
} from "firebase/database";
import MessageBubble from "../components/MessageBubble";

export async function action({ request, params }) {
    const formData = request.formData();
    const message = formData.get("message");
    const messageId = formData.get("messageId");
    const partnerUid = formData.get("partnerUid");
    const isLastMessage = formData.get("isLastMessage");
    const updates = {};
    if (!messageId) {
        const newMessageRef = push(
            ref(database, `data/messages/${params.chatId}`)
        );
        const date = new Date();
        const timestamp = date.getTime();
        updates[`data/messages/${params.chatId}/${newMessageRef.key}`] = {
            m_id: newMessageRef.key,
            text: message,
            timestamp,
            sender: auth.currentUser.uid,
        };
        [(auth.currentUser.uid, partnerUid)].forEach((uid) => {
            updates[`data/chats/${uid}/${params.chatId}/last_message_sender`] =
                auth.currentUser.uid;
            updates[`data/chats/${uid}/${params.chatId}/last_message_text`] =
                message;
            updates[`data/chats/${uid}/${params.chatId}/timestamp`] = timestamp;
        });
        return update(ref(database), updates);
    } else {
        updates[`data/messages/${params.chatId}/${messageId}/text`] = message;
        if (isLastMessage === "true") {
            [(auth.currentUser.uid, partnerUid)].forEach((uid) => {
                updates[
                    `data/chats/${uid}/${params.chatId}/last_message_text`
                ] = message;
            });
        }
        return update(ref(database), updates);
    }
}

export async function loader({ params }) {
    const { currentUser } = auth;
    if (!currentUser) return {};
    const { uid } = currentUser;
    const chatShapshot = await get(
        ref(database, `data/chats/${uid}/${params.chatId}`)
    );
    if (!chatShapshot.exists())
        throw new Response("No chat found", { status: 404 });
    const chatVal = chatShapshot.val();
    console.log(chatVal);
    return {
        chatData: chatVal,
    };
}

export default function Chat() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [editedMessageId, setEditedMessageId] = useState("");

    const { chatData } = useLoaderData();
    const fetcher = useFetcher();

    useEffect(() => {
        const childAddedUnsubscribe = onChildAdded(
            ref(database, `data/messages/${chatData?.chat_id}`),
            (snapshot) => {
                setMessages((prevMessages) => [
                    ...prevMessages,
                    snapshot.val(),
                ]);
            }
        );
        const childChangedUnsubscribe = onChildChanged(
            ref(database, `data/messages/${chatData?.chat_id}`),
            (snapshot) => {
                setMessages((prevMessages) =>
                    prevMessages.map((m) =>
                        m.m_id === snapshot.m_id ? snapshot.val() : m
                    )
                );
            }
        );
        const childRemovedUnsubscribe = onChildRemoved(
            ref(database, `data/messages/${chatData?.chat_id}`),
            (snapshot) => {
                setMessages((prevMessages) =>
                    prevMessages.filter((m) => m.m_id !== snapshot.m_id)
                );
            }
        );
        return () => {
            childAddedUnsubscribe();
            childChangedUnsubscribe();
            childRemovedUnsubscribe();
        };
    }, [chatData?.chat_id]);

    const messageElements = messages.map((message) => (
        <MessageBubble
            key={message.m_id}
            text={message.text}
            timestamp={message.timestamp}
            senderAvatar={
                message.sender === auth.currentUser.uid
                    ? auth.currentUser.photoURL
                    : chatData.partner_profile_picture
            }
            senderName={
                message.sender === auth.currentUser.uid
                    ? auth.currentUser.displayName
                    : chatData.partner_name
            }
            senderUid={message.sender}
        />
    ));

    return (
        <>
            <Link to={`/users/${chatData.partner_uid}`}>
                {chatData.partner_name}
            </Link>
            <fetcher.Form
                method="post"
                onSubmit={(e) => {
                    if (!input) e.preventDefault();
                }}
            >
                <input
                    type="text"
                    name="message"
                    id="messageInput"
                    className="border border-slate-500 block"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />
                <input type="hidden" name="messageId" value={editedMessageId} />
                <input
                    type="hidden"
                    name="partnerUid"
                    value={chatData.partner_uid}
                />
                <input
                    type="hidden"
                    name="isLastMessage"
                    value={
                        editedMessageId === messages.at(-1)?.m_id
                            ? "true"
                            : "false"
                    }
                />
                <button>Send</button>
            </fetcher.Form>
            <div>{messageElements}</div>
        </>
    );
}
