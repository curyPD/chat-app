import { NavLink } from "react-router-dom";
import { HiOutlineUser } from "react-icons/hi2";

export default function ChatLink(props) {
    const date = new Date(+props.timestamp);
    const formattedDate = new Intl.DateTimeFormat(navigator.language, {
        timeStyle: "short",
    }).format(date);

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
                <div className="ml-4 flex-1 overflow-hidden">
                    <p className="text-sm font-medium text-slate-900">
                        {props.partnerName}
                    </p>
                    <div className="flex items-center">
                        <p className="truncate text-sm font-normal text-slate-500">
                            {props.lastMessage}
                        </p>
                        <span className="ml-auto shrink-0 pl-3 text-xs text-slate-300">
                            {formattedDate}
                        </span>
                    </div>
                </div>
            </NavLink>
        </li>
    );
}
