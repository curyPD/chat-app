import { useState } from "react";
import { Link } from "react-router-dom";
import MessagePopup from "./MessagePopup";
import MessageDeletePopup from "./MessageDeletePopup";

export default function MessageBubble(props) {
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);

    const date = new Date(+props.timestamp);
    const formattedDate = new Intl.DateTimeFormat(navigator.language, {
        timeStyle: "short",
    }).format(date);

    return (
        <>
            <li
                className={`${
                    props.isCurUser ? "self-end" : "self-start"
                } mb-6 max-w-xs lg:mb-7 lg:max-w-sm`}
            >
                <div
                    className={`flex items-start gap-2 lg:gap-3 ${
                        props.isCurUser ? "flex-row-reverse" : "flex-row"
                    }`}
                >
                    <Link
                        to={`/users/${props.senderUid}`}
                        className="group shrink-0 focus:outline-none"
                    >
                        <img
                            src={props.senderAvatar}
                            alt={props.senderName}
                            className="h-10 w-10 rounded-full object-cover group-focus:ring group-focus:ring-sky-300"
                        />
                    </Link>

                    <div
                        onClick={() => setIsPopupOpen(true)}
                        className="relative flex flex-col"
                    >
                        {props.text && (
                            <p
                                className={`${
                                    props.isCurUser
                                        ? "self-end bg-sky-500 text-white"
                                        : "self-start bg-slate-200 text-slate-900"
                                } rounded-2xl py-2 px-3 text-xs font-medium lg:rounded-3xl lg:px-4 lg:text-sm`}
                            >
                                {props.text}
                            </p>
                        )}
                        {props.fileURL && (
                            <div>
                                <img
                                    src={props.fileURL}
                                    alt=""
                                    className={`${
                                        props.text && "mt-4 block"
                                    } rounded-xl`}
                                />
                            </div>
                        )}
                        <span
                            className={`${
                                props.isCurUser ? "text-left" : "text-right"
                            } absolute top-full mt-1.5 block w-full text-[10px] text-slate-400`}
                        >
                            {formattedDate}
                        </span>
                    </div>
                </div>
            </li>
            {isPopupOpen && (
                <MessagePopup
                    closePopup={() => setIsPopupOpen(false)}
                    handleEditMessage={() => {
                        setIsPopupOpen(false);
                        props.handleEditMessage();
                    }}
                    openDeletePopup={() => {
                        console.log("Opening delete popup");
                        setIsPopupOpen(false);
                        setIsDeletePopupOpen(true);
                    }}
                />
            )}
            {isDeletePopupOpen && (
                <MessageDeletePopup
                    closePopup={() => setIsDeletePopupOpen(false)}
                    handleDeleteMessage={() => {
                        props.handleDeleteMessage();
                        setIsDeletePopupOpen(false);
                    }}
                />
            )}
        </>
    );
}
