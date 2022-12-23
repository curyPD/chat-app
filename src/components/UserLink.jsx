import { Link } from "react-router-dom";
import { HiOutlineUser } from "react-icons/hi2";

export default function UserLink(props) {
    return (
        <li className="group">
            <Link
                to={`/users/${props.id}`}
                className="flex items-center bg-white py-4 px-6 focus:outline-none focus-visible:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 dark:focus-visible:bg-slate-800 lg:px-3 lg:dark:bg-slate-800 lg:dark:hover:bg-slate-700 lg:dark:focus-visible:bg-slate-700"
            >
                <div className="shrink-0">
                    {props.photoURL ? (
                        <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={props.photoURL}
                            alt={`${props.name}'s avatar`}
                        />
                    ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700">
                            <HiOutlineUser className="h-6 w-6 text-slate-500 dark:text-slate-400" />
                        </div>
                    )}
                </div>
                <p className="ml-3 text-sm font-medium text-slate-900 dark:text-white">
                    {props.name}
                </p>
            </Link>
        </li>
    );
}
