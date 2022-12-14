import { Link } from "react-router-dom";
import { HiOutlineUser } from "react-icons/hi2";

export default function UserLink(props) {
    return (
        <li className="group">
            <Link
                to={`/users/${props.id}`}
                className="flex items-center bg-white py-4 focus:bg-slate-50 focus:outline-none group-first:pt-0 group-last:pb-0 lg:px-3"
            >
                <div className="shrink-0">
                    {props.photoURL ? (
                        <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={props.photoURL}
                            alt={`${props.name}'s avatar`}
                        />
                    ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                            <HiOutlineUser className="h-6 w-6 text-slate-500" />
                        </div>
                    )}
                </div>
                <p className="ml-3 text-sm font-medium text-slate-900">
                    {props.name}
                </p>
            </Link>
        </li>
    );
}
