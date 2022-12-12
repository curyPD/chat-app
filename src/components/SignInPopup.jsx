import { auth } from "../firebase";
import { IoLogoFacebook } from "react-icons/io5";
import { FcGoogle } from "react-icons/fc";
import Overlay from "./Overlay";
import { HiXMark } from "react-icons/hi2";

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
                <div className="fixed top-1/2 left-1/2 z-30 w-5/6 max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border border-slate-200 bg-white px-4 pb-3 pt-7 shadow-md">
                    <button
                        className="absolute top-0 right-0 -translate-x-2 translate-y-2"
                        onClick={closePopup}
                    >
                        <HiXMark className="h-5 w-5 text-slate-700" />
                    </button>
                    <h2 className="mb-6 text-center text-lg font-bold text-slate-800">
                        Sign In Required
                    </h2>
                    <fetcher.Form method="post" action="/login">
                        <label
                            htmlFor="email"
                            className="mb-1 block text-xs font-medium text-slate-700"
                        >
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            className="mb-4 block w-full rounded-md border border-slate-300 bg-white py-1.5 px-2 text-xs text-slate-700 shadow-sm invalid:border-pink-500 invalid:text-pink-600 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-300 focus:invalid:border-pink-500 focus:invalid:ring-pink-500"
                            defaultValue={auth.currentUser.email}
                            disabled
                        />
                        <input type="hidden" name="redirect" value="false" />
                        {signInMethods.includes("password") && (
                            <>
                                <label
                                    htmlFor="password"
                                    className="mb-1 block text-xs font-medium text-slate-700"
                                >
                                    Password
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    name="password"
                                    className="mb-5 block w-full rounded-md border border-slate-300 bg-white py-1.5 px-2 text-xs text-slate-700 shadow-sm focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-300"
                                    autoComplete="current-password"
                                />
                                <div className="flex">
                                    <button className="w-full rounded-md bg-sky-500 py-2 px-4 text-xs font-semibold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300">
                                        Log In
                                    </button>
                                </div>
                                <div className="my-4 flex items-center gap-3">
                                    <div className="h-[1px] flex-1 bg-slate-200"></div>
                                    <span className="text-sm text-slate-300">
                                        or
                                    </span>
                                    <div className="h-[1px] flex-1 bg-slate-200"></div>
                                </div>
                            </>
                        )}
                        {signInMethods.includes("google.com") && (
                            <button
                                name="authProvider"
                                value="google"
                                className="mb-4 flex w-full items-center gap-4 rounded-md border border-slate-300 py-2 px-5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-sky-300"
                            >
                                <FcGoogle className="h-6 w-6" />
                                <span>Continue with Google</span>
                            </button>
                        )}
                        {signInMethods.includes("facebook.com") && (
                            <button
                                name="authProvider"
                                value="facebook"
                                className="mb-4 flex w-full items-center gap-4 rounded-md border border-slate-300 py-2 px-5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-sky-300"
                            >
                                <IoLogoFacebook className="h-6 w-6 text-blue-600" />
                                <span>Continue with Facebook</span>
                            </button>
                        )}
                    </fetcher.Form>
                </div>
            </Overlay>
        </>
    );
}
