import { useState, useEffect, useRef } from "react";
import {
    Link,
    useLoaderData,
    useActionData,
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
import {
    HiOutlineUser,
    HiArrowLeft,
    HiOutlineCamera,
    HiOutlinePaperAirplane,
    HiXMark,
} from "react-icons/hi2";
import { resizeFile } from "../helpers";
import Message from "../components/Message";

export async function action({ request, params }) {
    const formData = await request.formData();
    const response = {};
    try {
        const message = formData.get("message");
        const messageId = formData.get("messageId");
        const partnerUid = formData.get("partnerUid");
        const isLastMessage = formData.get("isLastMessage");
        const fileBaseURL = formData.get("fileBaseURL");
        const prevAttachedFile = formData.get("prevAttachedFile");
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
                prevAttachedFile,
                updates
            );

        return update(ref(database), updates);
    } catch (err) {
        console.error(err);
        response.error = "Something went wrong. Please try again.";
        return response;
    }
}

export async function loader({ params }) {
    const { currentUser } = auth;
    if (!currentUser) return {};
    const { uid } = currentUser;
    const chatShapshot = await get(
        ref(database, `chats/${uid}/${params.chatId}`)
    );
    if (!chatShapshot.exists())
        throw new Response("No chat found", { status: 404 });
    const curUserSnapshot = await get(ref(database, `users/${uid}`));
    if (!curUserSnapshot.exists())
        throw new Response("No user information found", { status: 404 });
    const chatVal = chatShapshot.val();
    const curUserVal = curUserSnapshot.val();
    return {
        chatData: chatVal,
        curUserData: curUserVal,
    };
}

export default function Chat() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [editedMessageId, setEditedMessageId] = useState("");
    const [filePreviewURL, setFilePreviewURL] = useState("");
    const olRef = useRef(null);

    const response = useActionData();
    const error = response?.error;
    const { chatData, curUserData } = useLoaderData();
    const fetcher = useFetcher();
    const deleteMessagePath = useFormAction("delete-message");

    useEffect(() => {
        olRef.current.lastElementChild?.scrollIntoView({
            block: "start",
            inline: "nearest",
        });
    }, [messages]);

    useEffect(() => {
        setMessages([]);
        setInput("");
        setEditedMessageId("");
        setFilePreviewURL("");
        const childAddedUnsubscribe = onChildAdded(
            ref(database, `messages/${chatData?.chat_id}`),
            (snapshot) => {
                setMessages((prevMessages) => [
                    ...prevMessages,
                    snapshot.val(),
                ]);
            }
        );
        const childChangedUnsubscribe = onChildChanged(
            ref(database, `messages/${chatData?.chat_id}`),
            (snapshot) => {
                setMessages((prevMessages) =>
                    prevMessages.map((m) =>
                        m.m_id === snapshot.val().m_id ? snapshot.val() : m
                    )
                );
            }
        );
        const childRemovedUnsubscribe = onChildRemoved(
            ref(database, `messages/${chatData?.chat_id}`),
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
            formData.append("partnerUid", chatData?.partner_uid);
        }
        fetcher.submit(formData, {
            method: "post",
            action: deleteMessagePath,
        });
    }

    async function attachFile(e) {
        const [file] = e.target.files;
        e.target.value = "";
        const imageURL = await resizeFile(file, 768, 1920, 80);
        setFilePreviewURL(imageURL);
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
                    ? curUserData?.profile_picture_sm
                    : chatData?.partner_profile_picture
            }
            senderName={
                message.sender === auth.currentUser.uid
                    ? auth.currentUser.displayName
                    : chatData?.partner_name
            }
            senderUid={message.sender}
            isCurUser={message.sender === auth.currentUser.uid}
            handleEditMessage={() => {
                setEditedMessageId(message.m_id);
            }}
            handleDeleteMessage={() => handleDeleteMessage(message.m_id)}
        />
    ));
    return (
        <>
            {error && <Message text={error} error={true} />}
            {fetcher.data?.error && (
                <Message text={fetcher.data?.error} error={true} />
            )}
            <div className="pt-14 pb-24 dark:bg-slate-900 md:pb-12 lg:relative lg:h-full lg:overflow-y-auto lg:rounded-2xl lg:border lg:border-slate-200 lg:pb-0 lg:pt-0 lg:dark:border-slate-800 lg:dark:bg-transparent">
                <header className="fixed top-0 left-0 z-10 flex h-14 w-full items-center justify-between border-b border-slate-200 bg-white px-3 shadow dark:border-slate-800 dark:bg-slate-900 md:ml-14 md:w-fixed-bar-tablet lg:sticky lg:ml-0 lg:w-full lg:justify-end lg:shadow-none">
                    <Link
                        to=".."
                        className="group focus:outline-none lg:hidden"
                    >
                        <HiArrowLeft className="h-5 w-5 text-slate-600 group-focus-visible:text-sky-500 dark:text-slate-400 dark:group-focus-visible:text-sky-400" />
                    </Link>
                    <Link
                        to={`/users/${chatData?.partner_uid}`}
                        className="group mr-2 flex flex-row-reverse items-center focus:outline-none"
                    >
                        <div className="shrink-0 ">
                            {chatData?.partner_profile_picture ? (
                                <img
                                    className="h-9 w-9 rounded-full object-cover group-focus:ring group-focus:ring-sky-300"
                                    src={chatData?.partner_profile_picture}
                                    alt={`${chatData?.partner_name}'s avatar`}
                                />
                            ) : (
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700">
                                    <HiOutlineUser className="h-6 w-6 text-slate-500 dark:text-slate-400" />
                                </div>
                            )}
                        </div>
                        <p className="mr-3 text-sm font-semibold text-slate-900 dark:text-white">
                            {chatData?.partner_name}
                        </p>
                    </Link>
                </header>

                <main className="min-h-[calc(100%-101px)] bg-white/50 dark:bg-slate-900 md:ml-14 lg:ml-0 lg:dark:bg-slate-900/50">
                    <ol className="flex flex-col px-3 py-5" ref={olRef}>
                        {messageElements}
                    </ol>
                </main>

                {filePreviewURL && (
                    <div className="fixed bottom-0 left-0 z-10 mb-[92px] w-full border-t border-slate-200 bg-slate-100 py-2 px-4 dark:border-slate-700 dark:bg-slate-800 md:mb-11 md:ml-14 md:w-fixed-bar-tablet lg:sticky lg:bottom-11 lg:top-10 lg:mb-0 lg:ml-0 lg:w-full">
                        <div className="relative inline-block">
                            <button
                                className="absolute top-0 right-0 flex h-4 w-4 -translate-y-1.5 translate-x-1.5 items-center justify-center rounded-full bg-slate-600 transition-colors hover:bg-slate-800 dark:bg-slate-500 dark:hover:bg-slate-600"
                                onClick={cancelFileSelect}
                            >
                                <HiXMark className="h-3 w-3 text-white" />
                            </button>
                            <img
                                src={filePreviewURL}
                                alt="Selected image"
                                className="w-16"
                            />
                        </div>
                    </div>
                )}
                <div className="fixed bottom-0 left-0 z-10 mb-12 w-full md:mb-0 md:ml-14 md:w-fixed-bar-tablet lg:sticky lg:ml-0 lg:w-full lg:border-t-transparent">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 translate-x-2 md:translate-x-3">
                        <label
                            htmlFor="fileInput"
                            className="group cursor-pointer"
                        >
                            <HiOutlineCamera className="h-6 w-6 text-slate-400 transition-colors group-hover:text-slate-500" />
                        </label>
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
                            className="block w-full border-t border-slate-200 bg-white py-3 pl-11 pr-12 text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:placeholder:text-slate-500 md:pl-12 md:pr-14"
                            value={input}
                            onChange={handleMessageInputChange}
                            placeholder="Send a message..."
                        />
                        <input
                            type="hidden"
                            name="fileBaseURL"
                            value={filePreviewURL}
                        />
                        <input
                            type="hidden"
                            name="messageId"
                            value={editedMessageId}
                        />
                        <input
                            type="hidden"
                            name="prevAttachedFile"
                            value={
                                messages.find((m) => m.m_id === editedMessageId)
                                    ?.file_url ?? ""
                            }
                        />
                        <input
                            type="hidden"
                            name="partnerUid"
                            value={chatData?.partner_uid}
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
                                onClick={cancelMessageEdit}
                                className="absolute right-0 top-1/2 -translate-y-1/2 -translate-x-11 rounded bg-white p-1 text-xs font-semibold text-sky-500 transition-colors hover:bg-sky-100 focus:outline-none focus-visible:ring focus-visible:ring-sky-300 dark:bg-transparent dark:text-sky-400 dark:hover:bg-sky-500 dark:hover:text-white md:-translate-x-12"
                            >
                                Cancel
                            </button>
                        )}
                        <button
                            type="submit"
                            className="group absolute right-0 top-1/2 -translate-y-1/2 -translate-x-3 focus:outline-none md:-translate-x-4"
                        >
                            <HiOutlinePaperAirplane className="h-6 w-6 text-slate-400 transition-colors group-hover:text-slate-500 group-focus-visible:text-sky-500" />
                        </button>
                    </fetcher.Form>
                </div>
            </div>
        </>
    );
}
