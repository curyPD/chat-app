import { NavLink } from "react-router-dom";

export default function MobileNavLink(props) {
    return (
        <NavLink
            to={props.to}
            className={({ isActive }) =>
                isActive
                    ? "flex flex-col items-center text-sky-500 focus:outline-none focus-visible:text-sky-500 dark:text-sky-400 md:block"
                    : "flex flex-col items-center text-slate-700 focus:outline-none focus-visible:text-sky-500 dark:text-slate-500 md:block"
            }
        >
            {props.children}
            <span className="text-[10px] md:hidden">{props.text}</span>
        </NavLink>
    );
}
