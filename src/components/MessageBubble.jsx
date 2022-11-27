import { useState } from "react";
import { Link } from "react-router-dom";
import { HiOutlineTrash } from "react-icons/hi";

export default function MessageBubble(props) {
    const [isPopupOpen, setIsPopupOpen] = useState(false);

    return (
        <>
            {isPopupOpen && (
                <MessageDeletePopup
                    setIsPopupOpen={setIsPopupOpen}
                    handleDeleteMessage={props.handleDeleteMessage}
                />
            )}
            <div>
                <Link to={`/users/${props.senderUid}`}>
                    <img
                        src={props.senderAvatar}
                        alt={props.senderName}
                        className="w-12 h-12 rounded-full object-cover"
                    />
                </Link>
                <div onClick={props.handleEditMessage}>{props.text}</div>
                <div>{props.timestamp}</div>
                {props.fileURL && <img src={props.fileURL} alt="" />}
                <button
                    onClick={() => setIsPopupOpen((prevState) => !prevState)}
                >
                    <HiOutlineTrash />
                </button>
            </div>
        </>
    );
}

function MessageDeletePopup(props) {
    return (
        <div>
            <button onClick={() => props.setIsPopupOpen(false)}>X</button>
            <p>Delete message???</p>
            <button onClick={props.handleDeleteMessage}>Delete</button>
            <button onClick={() => props.setIsPopupOpen(false)}>Cancel</button>
        </div>
    );
}
