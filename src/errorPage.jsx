import { useRouteError, isRouteErrorResponse, Link } from "react-router-dom";
import logo from "./assets/logo.png";
export default function ErrorPage() {
    const error = useRouteError();
    if (isRouteErrorResponse(error)) {
        if (error.status === 404) {
            return (
                <main className="flex h-screen items-center justify-center bg-custom-gradient dark:bg-custom-gradient-dark">
                    <div className="-mt-16 max-w-screen-lg px-8 text-center">
                        <div className="mb-8 lg:mb-10">
                            <img
                                src={logo}
                                className="mx-auto block h-10 w-10 dark:drop-shadow-lg lg:h-12 lg:w-12"
                                alt="Logo"
                            />
                        </div>
                        <p className="mb-7 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-7xl font-black text-transparent dark:from-teal-500 dark:via-sky-500 dark:to-indigo-500 lg:text-8xl">
                            {error.status}
                        </p>
                        <h2 className="mb-12 text-lg font-bold text-slate-900 dark:text-slate-50 lg:mb-14 lg:text-xl">
                            Oops! Looks like we landed at the wrong airport!
                        </h2>
                        <Link
                            className="rounded-md bg-sky-500 py-2 px-4 text-xs font-semibold text-white transition-colors hover:bg-sky-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 lg:px-5 lg:text-sm"
                            to="/"
                        >
                            Go back home
                        </Link>
                    </div>
                </main>
            );
        }
        return (
            <main className="flex h-screen items-center justify-center bg-custom-gradient dark:bg-custom-gradient-dark">
                <div className="-mt-16 max-w-screen-lg px-8 text-center">
                    <div className="mb-8 lg:mb-10">
                        <img
                            src={logo}
                            className="mx-auto block h-10 w-10 lg:h-12 lg:w-12"
                            alt="Logo"
                        />
                    </div>
                    <h1 className="mb-6 text-xl font-bold text-slate-900 dark:text-slate-50">
                        Oops!
                    </h1>
                    <h2 className="mb-4 text-lg font-medium text-slate-900 dark:text-slate-50">
                        {error.status}
                    </h2>
                    <p className="mb-8 text-sm font-medium text-slate-700 dark:text-slate-300">
                        {error.statusText}
                    </p>
                    <Link
                        className="rounded-md bg-sky-500 py-2 px-4 text-xs font-semibold text-white transition-colors hover:bg-sky-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 lg:px-5 lg:text-sm"
                        to="/"
                    >
                        Go back home
                    </Link>
                </div>
            </main>
        );
    } else {
        return (
            <div className="flex h-screen items-center justify-center bg-custom-gradient px-8 dark:bg-custom-gradient-dark ">
                <h1 className="mb-8 text-lg font-bold text-slate-900 dark:text-slate-50">
                    Oops! Something went wrong
                </h1>
            </div>
        );
    }
}
