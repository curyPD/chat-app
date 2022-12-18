import { auth } from "../firebase";
import MobileNavLink from "./MobileNavLink";
import {
    HiOutlineCog6Tooth,
    HiMagnifyingGlass,
    HiOutlineChatBubbleOvalLeftEllipsis,
    HiOutlineUser,
} from "react-icons/hi2";

export default function MobileNav() {
    return (
        <footer className="fixed bottom-0 left-0 z-10 h-12 w-full md:h-full md:w-14 lg:hidden">
            <nav className="flex h-full items-center justify-evenly border-t border-slate-200 bg-white px-4 md:flex-col-reverse md:justify-end md:gap-9 md:border-t-0 md:border-r md:px-0 md:pt-4">
                <MobileNavLink text="Settings" to="/account">
                    <HiOutlineCog6Tooth className="mb-1 h-5 w-5 md:h-7 md:w-7" />
                </MobileNavLink>
                <MobileNavLink text="Search" to="/search">
                    <HiMagnifyingGlass className="mb-1 h-5 w-5 md:h-7 md:w-7" />
                </MobileNavLink>
                <MobileNavLink text="Messages" to="/">
                    <HiOutlineChatBubbleOvalLeftEllipsis className="mb-1 h-5 w-5 md:h-7 md:w-7" />
                </MobileNavLink>
                <MobileNavLink
                    text="Profile"
                    to={`/users/${auth.currentUser.uid}`}
                >
                    <HiOutlineUser className="mb-1 h-5 w-5 md:h-7 md:w-7" />
                </MobileNavLink>
            </nav>
        </footer>
    );
}
