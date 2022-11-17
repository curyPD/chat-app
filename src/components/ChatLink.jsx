import { NavLink } from "react-router-dom";
import { HiOutlineUserCircle } from "react-icons/hi2";

export default function ChatLink(props) {
    return (
        <NavLink to={`/chats/${props.id}`}>
            <div className="flex">
                <div>
                    <HiOutlineUserCircle />
                </div>
                <div>
                    <p>{props.partnerName}</p>
                    <p>{props.lastMessage}</p>
                </div>
            </div>
        </NavLink>
    );
}
