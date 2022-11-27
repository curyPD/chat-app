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
    update,
} from "firebase/database";
import MessageBubble from "../components/MessageBubble";
import { addNewMessage, editMessage } from "../helpers";

export async function action({ request, params }) {
    const formData = await request.formData();
    const message = formData.get("message");
    const messageId = formData.get("messageId");
    const partnerUid = formData.get("partnerUid");
    const isLastMessage = formData.get("isLastMessage");
    const fileBaseURL = formData.get("fileBaseURL");
    const updates = {};
    if (!messageId)
        await addNewMessage(
            params.chatId,
            message,
            auth.currentUser.uid,
            partnerUid,
            fileBaseURL,
            updates
        );
    else
        await editMessage(
            params.chatId,
            message,
            messageId,
            isLastMessage,
            auth.currentUser.uid,
            partnerUid,
            fileBaseURL,
            updates
        );

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
    const [filePreviewURL, setFilePreviewURL] = useState("");

    const { chatData } = useLoaderData();
    const fetcher = useFetcher();
    const deleteMessagePath = useFormAction("delete-message");

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
        setFilePreviewURL(
            editedMessageId
                ? messages.find((message) => message.m_id === editedMessageId)
                      .file_url
                : ""
        );
    }, [editedMessageId]);

    const styles = {
        clip: "rect(0 0 0 0)",
        clipPath: "inset(50%)",
        height: "1px",
        overflow: "hidden",
        position: "absolute",
        whiteSpace: "nowrap",
        width: "1px",
    };

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

    function attachFile(e) {
        const [file] = e.target.files;
        e.target.value = "";
        const reader = new FileReader();
        reader.onload = (e) => {
            setFilePreviewURL(e.target.result);
        };
        reader.readAsDataURL(file);
    }

    function cancelFileSelect() {
        setFilePreviewURL("");
    }

    function handleFormSubmit(e) {
        if (!input && !filePreviewURL) e.preventDefault();
        setInput("");
        setEditedMessageId("");
        setFilePreviewURL("");
    }

    function cancelMessageEdit() {
        setEditedMessageId("");
    }

    function handleMessageInputChange(e) {
        setInput(e.target.value);
    }

    const messageElements = messages.map((message) => (
        <MessageBubble
            key={message.m_id}
            text={message.text}
            fileURL={message.file_url}
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

            {filePreviewURL && (
                <div>
                    <button onClick={cancelFileSelect}>X</button>
                    <img
                        src={filePreviewURL}
                        alt="Selected image"
                        className="w-16"
                    />
                </div>
            )}
            <div className="p-1 border border-rose-600">
                <label htmlFor="fileInput">Attach file</label>
                <input
                    style={styles}
                    type="file"
                    name="fileBaseURL"
                    id="fileInput"
                    onChange={attachFile}
                />
            </div>
            <fetcher.Form method="post" onSubmit={handleFormSubmit}>
                <input
                    type="text"
                    name="message"
                    id="messageInput"
                    className="border border-slate-500 block"
                    value={input}
                    onChange={handleMessageInputChange}
                />
                <input
                    type="hidden"
                    name="fileBaseURL"
                    value={filePreviewURL}
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
                    <button type="button" onClick={cancelMessageEdit}>
                        Cancel
                    </button>
                )}
                <button type="submit">Send</button>
            </fetcher.Form>
            <div>{messageElements}</div>
        </>
    );
}
