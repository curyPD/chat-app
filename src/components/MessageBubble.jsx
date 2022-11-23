import { Link } from "react-router-dom";

export default function MessageBubble(props) {
    return (
        <div>
            <Link to={`/users/${props.senderUid}`}>
                <img src={props.senderAvatar} alt={props.senderName} />
            </Link>
            <div onClick={props.handleEditMessage}>{props.text}</div>
            <div>{props.timestamp}</div>
        </div>
    );
}
