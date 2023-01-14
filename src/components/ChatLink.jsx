import { NavLink } from "react-router-dom";
import { HiOutlineUser } from "react-icons/hi2";

export default function ChatLink(props) {
    let formattedDate;
    if (props.timestamp) {
        const date = new Date(+props.timestamp);
        formattedDate = new Intl.DateTimeFormat(navigator.language, {
            timeStyle: "short",
        }).format(date);
    }

    return (
        <li className="group hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800">
            <NavLink
                to={`/chats/${props.id}`}
                className="flex items-center px-5 py-3 focus:outline-none focus-visible:bg-slate-50 dark:focus-visible:bg-slate-800 sm:px-8 md:px-6 lg:px-4"
            >
                <div className="shrink-0">
                    {props.partnerProfilePicture ? (
                        <img
                            className="h-12 w-12 rounded-full object-cover"
                            src={props.partnerProfilePicture}
                            alt={`${props.partnerName}'s avatar`}
                        />
                    ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700">
                            <HiOutlineUser className="h-6 w-6 text-slate-500 dark:text-slate-400" />
                        </div>
                    )}
                </div>
                <div className="ml-4 flex-1 overflow-hidden">
                    <p className="mb-1 text-sm font-medium text-slate-900 dark:text-white">
                        {props.partnerName}
                    </p>
                    <div className="flex items-center">
                        {props.lastMessageSender && props.lastMessage ? (
                            <p className="truncate text-sm font-normal text-slate-500 dark:text-slate-400">
                                {props.lastMessage}
                            </p>
                        ) : props.lastMessageSender && !props.lastMessage ? (
                            <p className="text-sm font-normal text-sky-400 dark:text-sky-300">
                                File
                            </p>
                        ) : (
                            <p className="text-sm font-normal text-slate-200 dark:text-slate-800 dark:group-hover:text-slate-700">
                                Nothing here...
                            </p>
                        )}
                        {formattedDate && (
                            <span className="ml-auto shrink-0 pl-3 text-xs text-slate-400 dark:text-slate-500">
                                {formattedDate}
                            </span>
                        )}
                    </div>
                </div>
            </NavLink>
        </li>
    );
}
