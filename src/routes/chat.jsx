import { useState, useEffect } from "react";
import {
    Link,
    useLoaderData,
    useFetcher,
    useFormAction,
} from "react-router-dom";
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
    const formData = await request.formData();
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
        [auth.currentUser.uid, partnerUid].forEach((uid) => {
            updates[`data/chats/${uid}/${params.chatId}/last_message_sender`] =
                auth.currentUser.uid;
            updates[`data/chats/${uid}/${params.chatId}/last_message_text`] =
                message;
            updates[`data/chats/${uid}/${params.chatId}/timestamp`] = timestamp;
        });
    } else {
        updates[`data/messages/${params.chatId}/${messageId}/text`] = message;
        if (isLastMessage === "true") {
            [auth.currentUser.uid, partnerUid].forEach((uid) => {
                updates[
                    `data/chats/${uid}/${params.chatId}/last_message_text`
                ] = message;
            });
        }
    }
    return update(ref(database), updates);
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
    const deleteMessagePath = useFormAction("delete-message");

    const isMessageSubmitting = fetcher.state === "submitting";
    const isMessageSent =
        fetcher.state === "loading" && fetcher.formData !== null;

    useEffect(() => {
        if (isMessageSubmitting) setInput("");
        if (isMessageSent) setEditedMessageId("");
    }, [isMessageSubmitting, isMessageSent]);

    useEffect(() => {
        setMessages([]);
        setInput("");
        setEditedMessageId("");
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
                        m.m_id === snapshot.val().m_id ? snapshot.val() : m
                    )
                );
            }
        );
        const childRemovedUnsubscribe = onChildRemoved(
            ref(database, `data/messages/${chatData?.chat_id}`),
            (snapshot) => {
                setMessages((prevMessages) =>
                    prevMessages.filter((m) => m.m_id !== snapshot.val().m_id)
                );
            }
        );
        return () => {
            childAddedUnsubscribe();
            childChangedUnsubscribe();
            childRemovedUnsubscribe();
        };
    }, [chatData?.chat_id]);

    useEffect(() => {
        setInput(
            editedMessageId
                ? messages.find((message) => message.m_id === editedMessageId)
                      .text
                : ""
        );
    }, [editedMessageId]);

    function handleDeleteMessage(messageId) {
        const formData = new FormData();
        formData.append("messageId", messageId);
        const isLastMessage = messages.at(-1)?.m_id === messageId;
        formData.append("isLastMessage", `${isLastMessage}`);
        if (isLastMessage) {
            const penultimateMessage = messages.at(-2);
            const { sender, text, timestamp } = penultimateMessage;
            formData.append("newLastMessageText", text);
            formData.append("newLastMessageSender", sender);
            formData.append("timestamp", timestamp);
            formData.append("partnerUid", chatData.partner_uid);
        }
        fetcher.submit(formData, {
            method: "post",
            action: deleteMessagePath,
        });
    }

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
            handleEditMessage={() => {
                setEditedMessageId(message.m_id);
            }}
            handleDeleteMessage={() => handleDeleteMessage(message.m_id)}
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
                {editedMessageId && (
                    <button
                        type="button"
                        onClick={() => setEditedMessageId("")}
                    >
                        Cancel
                    </button>
                )}
                <button type="submit">Send</button>
            </fetcher.Form>
            <div>{messageElements}</div>
        </>
    );
}
