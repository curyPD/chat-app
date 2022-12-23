import { useEffect } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import UserSearchBar from "../components/UserSearchBar";
import useCheckIsMobile from "../hooks/useCheckIsMobile";
export default function Search() {
    const response = useLoaderData();
    const users = response?.users;
    const searchTerm = response?.searchTerm;
    const isMobile = useCheckIsMobile();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isMobile) return navigate("/");
    }, [isMobile]);

    return (
        <main className="h-screen dark:bg-slate-900">
            <UserSearchBar searchTerm={searchTerm} users={users}>
                <div className="flex h-full flex-col items-center justify-center gap-4">
                    <img
                        src={logo}
                        alt="Logo"
                        className="h-8 w-8 shrink-0 dark:drop-shadow-lg"
                    />
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                        Time to make friends!
                    </span>
                </div>
            </UserSearchBar>
        </main>
    );
}
