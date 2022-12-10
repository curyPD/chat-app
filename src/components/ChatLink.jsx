import { NavLink } from "react-router-dom";
import { HiOutlineUser } from "react-icons/hi2";

export default function ChatLink(props) {
    return (
        <li className="group">
            <NavLink
                to={`/chats/${props.id}`}
                className="flex items-center bg-white py-3 focus:bg-slate-50 focus:outline-none group-first:pt-0 group-last:pb-0"
            >
                <div className="shrink-0">
                    {props.partnerProfilePicture ? (
                        <img
                            className="h-12 w-12 rounded-full object-cover"
                            src={props.partnerProfilePicture}
                            alt={`${props.partnerName}'s avatar`}
                        />
                    ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                            <HiOutlineUser className="h-6 w-6 text-slate-500" />
                        </div>
                    )}
                </div>
                <div className="ml-3">
                    <p className="text-sm font-medium text-slate-900">
                        {props.partnerName}
                    </p>
                    <p className="truncate text-sm font-normal text-slate-500">
                        {props.lastMessage}
                    </p>
                </div>
            </NavLink>
        </li>
    );
}
