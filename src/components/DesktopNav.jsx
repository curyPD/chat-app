import { auth } from "../firebase";
import { NavLink, Link } from "react-router-dom";
import {
    HiOutlineUser,
    HiChevronRight,
    HiOutlineCog6Tooth,
    HiArrowRightOnRectangle,
} from "react-icons/hi2";
export default function DesktopNav() {
    return (
        <div className="absolute top-full right-0 z-20 translate-x-1 -translate-y-1 pt-3">
            <div className="w-72 rounded-lg border border-slate-200 bg-white py-2 shadow-lg">
                <div className="relative">
                    <NavLink
                        to={`users/${auth.currentUser.uid}`}
                        className={({ isActive }) =>
                            isActive
                                ? "flex items-center gap-4 bg-slate-50 py-3 px-4 font-medium text-sky-500 hover:text-sky-500 focus:outline-none focus-visible:bg-slate-50"
                                : "flex items-center gap-4 bg-white py-3 px-4 font-medium text-slate-700 hover:text-sky-500 focus:outline-none focus-visible:bg-slate-50"
                        }
                    >
                        <HiOutlineUser className="h-7 w-7" />

                        <span className="text-sm">
                            {auth.currentUser.displayName}
                        </span>
                    </NavLink>
                    <Link
                        to="/edit"
                        className="group absolute top-1/2 right-0 ml-auto flex -translate-y-1/2 -translate-x-2 gap-1 rounded-full py-1.5 px-3 transition-colors hover:bg-slate-200 focus:outline-none focus-visible:bg-slate-200"
                    >
                        <span className="text-xs text-slate-500 transition-colors group-hover:text-slate-600 group-focus-visible:text-slate-600">
                            Edit
                        </span>
                        <HiChevronRight className="h-4 w-4 text-slate-500 transition-transform group-hover:translate-x-0.5 group-focus-visible:translate-x-0.5" />
                    </Link>
                </div>
                <NavLink
                    to="/account"
                    className={({ isActive }) =>
                        isActive
                            ? "flex items-center gap-4 bg-slate-50 py-3 px-4 font-medium text-sky-500 hover:text-sky-500 focus:outline-none focus-visible:bg-slate-50"
                            : "flex items-center gap-4 bg-white py-3 px-4 font-medium text-slate-700 hover:text-sky-500 focus:outline-none focus-visible:bg-slate-50"
                    }
                >
                    <HiOutlineCog6Tooth className="h-7 w-7" />

                    <span className="text-sm">Settings</span>
                </NavLink>
                <NavLink
                    to="/login"
                    className={({ isActive }) =>
                        isActive
                            ? "flex items-center gap-4 bg-slate-50 py-3 px-4 font-medium text-sky-500 hover:text-sky-500 focus:outline-none focus-visible:bg-slate-50"
                            : "flex items-center gap-4 bg-white py-3 px-4 font-medium text-slate-700 hover:text-sky-500 focus:outline-none focus-visible:bg-slate-50"
                    }
                >
                    <HiArrowRightOnRectangle className="h-7 w-7" />

                    <span className="text-sm">Sign Out</span>
                </NavLink>
            </div>
        </div>
    );
}
