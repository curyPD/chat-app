import { auth } from "../firebase";
import { IoLogoFacebook } from "react-icons/io5";
import { FcGoogle } from "react-icons/fc";
import Overlay from "./Overlay";
import { HiXMark } from "react-icons/hi2";
import { Link } from "react-router-dom";
import PasswordInput from "./PasswordInput";

export default function SignInPopup({ fetcher, signInMethods, closePopup }) {
    const response = fetcher.data;
    const status = response?.status;
    const message = response?.message;
    if (fetcher.state === "idle" && status === "success") closePopup();

    return (
        <>
            {message && (
                <div>
                    <p>{message}</p>
                </div>
            )}
            <Overlay onClick={closePopup}>
                <div
                    onClick={(e) => e.stopPropagation()}
                    className="fixed top-1/2 left-1/2 z-50 w-5/6 max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border border-slate-200 bg-white px-4 pb-3 pt-7 shadow-md dark:border-slate-700 dark:bg-slate-800 lg:max-w-md lg:px-7 lg:pt-8"
                >
                    <button
                        className="group absolute top-0 right-0 -translate-x-2 translate-y-2"
                        onClick={closePopup}
                    >
                        <HiXMark className="h-5 w-5 text-slate-700 transition-colors group-hover:text-slate-900 dark:text-slate-400 dark:group-hover:text-slate-300 " />
                    </button>
                    <h2 className="mb-6 text-center text-lg font-bold text-slate-800 dark:text-slate-50 lg:mb-9 lg:text-xl">
                        Sign In Required
                    </h2>
                    <fetcher.Form method="post" action="/login">
                        <label
                            htmlFor="email"
                            className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-400 lg:text-sm"
                        >
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            className="mb-4 block w-full rounded-md border border-slate-300 bg-white py-1.5 px-2 text-xs text-slate-700 shadow-sm invalid:border-pink-500 invalid:text-pink-600 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-300 focus:invalid:border-pink-500 focus:invalid:ring-pink-500 disabled:bg-slate-50 disabled:text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:invalid:border-pink-500 dark:invalid:text-pink-600 dark:disabled:bg-slate-900/80 dark:disabled:text-slate-500 lg:py-2 lg:px-3 lg:text-sm"
                            defaultValue={auth.currentUser.email}
                            disabled
                        />
                        <input type="hidden" name="redirect" value="false" />
                        {signInMethods.includes("password") && (
                            <>
                                <label
                                    htmlFor="password"
                                    className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-400 lg:text-sm"
                                >
                                    Password
                                </label>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    className="mb-5 block w-full rounded-md border border-slate-300 bg-white py-1.5 px-2 text-xs text-slate-700 shadow-sm focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 lg:py-2 lg:px-3 lg:text-sm"
                                    autoComplete="current-password"
                                />
                                <div className="flex flex-col gap-4 lg:flex-row-reverse lg:items-center lg:justify-between lg:gap-0">
                                    <button className="w-full rounded-md bg-sky-500 py-2 px-4 text-xs font-semibold text-white transition-colors hover:bg-sky-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 lg:w-auto lg:px-5 lg:text-base">
                                        Log In
                                    </button>
                                    <Link
                                        to="/forgot-password"
                                        className="rounded-sm text-xs text-sky-500 underline underline-offset-2 hover:no-underline focus:no-underline focus:outline-none dark:text-sky-400 lg:text-sm"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                                <div className="my-4 flex items-center gap-3 lg:my-5">
                                    <div className="h-[1px] flex-1 bg-slate-200 dark:bg-slate-600"></div>
                                    <span className="text-sm text-slate-300 dark:text-slate-500">
                                        or
                                    </span>
                                    <div className="h-[1px] flex-1 bg-slate-200 dark:bg-slate-600"></div>
                                </div>
                            </>
                        )}
                        {signInMethods.includes("google.com") && (
                            <button
                                name="authProvider"
                                value="google"
                                className="mb-4 flex w-full items-center gap-4 rounded-md border border-slate-300 py-2 px-5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-1 focus:ring-sky-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-900/70 sm:pl-24 lg:mb-5 lg:gap-5 lg:pl-20 lg:text-sm"
                            >
                                <FcGoogle className="h-6 w-6 lg:h-7 lg:w-7" />
                                <span>Continue with Google</span>
                            </button>
                        )}
                        {signInMethods.includes("facebook.com") && (
                            <button
                                name="authProvider"
                                value="facebook"
                                className="mb-4 flex w-full items-center gap-4 rounded-md border border-slate-300 py-2 px-5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-1 focus:ring-sky-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-900/70 sm:pl-24 lg:mb-5 lg:gap-5 lg:pl-20 lg:text-sm"
                            >
                                <IoLogoFacebook className="h-6 w-6 text-blue-600 dark:text-blue-500 lg:h-7 lg:w-7" />
                                <span>Continue with Facebook</span>
                            </button>
                        )}
                    </fetcher.Form>
                </div>
            </Overlay>
        </>
    );
}
