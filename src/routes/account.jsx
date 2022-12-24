import { useState, useEffect } from "react";
import {
    useFetcher,
    useLoaderData,
    useActionData,
    Form,
} from "react-router-dom";
import { auth } from "../firebase";
import {
    fetchSignInMethodsForEmail,
    EmailAuthProvider,
    reauthenticateWithCredential,
    updateEmail,
    updatePassword,
    linkWithPopup,
    unlink,
} from "firebase/auth";
import SignInPopup from "../components/SignInPopup";
import { IoLogoFacebook } from "react-icons/io5";
import { FcGoogle } from "react-icons/fc";
import { HiOutlinePencil, HiOutlineUser } from "react-icons/hi2";
import {
    getAuthProviderObject,
    getProviderIdFromResult,
    getProviderId,
} from "../helpers";
import ThemeSelectMenu from "../components/ThemeSelectMenu";

export async function action({ request }) {
    const formData = await request.formData();
    const response = {};
    try {
        if (formData.has("newEmail")) {
            const newEmail = formData.get("newEmail");
            if (newEmail === auth.currentUser.email) return;
            await updateEmail(auth.currentUser, email);
            response.message = "Email successfully updated🎉";
            return response;
        } else if (formData.has("oldPassword")) {
            const oldPassword = formData.get("oldPassword");
            const newPassword = formData.get("newPassword");
            const confirmPassword = formData.get("confirmPassword");
            if (newPassword !== confirmPassword) {
                response.incorrectFields = ["confirmPassword", "newPassword"];
                response.error = "Passwords do not match.";
                return response;
            }
            const credential = EmailAuthProvider.credential(
                auth.currentUser.email,
                oldPassword
            );
            const userCredential = await reauthenticateWithCredential(
                auth.currentUser,
                credential
            );
            await updatePassword(userCredential.user, newPassword);
            response.message = "Password successfully updated🎉";
            return response;
        } else if (formData.has("linkProvider")) {
            const linkProvider = formData.get("linkProvider");
            const providerObject = getAuthProviderObject(linkProvider);
            const result = await linkWithPopup(
                auth.currentUser,
                providerObject
            );
            const providerId = getProviderIdFromResult(linkProvider, result);
            response.message = `Connected to ${providerId} successfully.`;
            return response;
        } else if (formData.has("unlinkProvider")) {
            const unlinkProvider = formData.get("unlinkProvider");
            const providerId = getProviderId(unlinkProvider);
            await unlink(auth.currentUser, providerId);
            response.message = `Disconnected successfully.`;
            return response;
        }
    } catch (err) {
        console.error(err, err.code);
        if (err.code === "auth/invalid-email") {
            response.error = "The email you used is invalid.";
        } else if (err.code === "auth/email-already-in-use") {
            response.error = "The email is already used by another user.";
        } else if (err.code === "auth/requires-recent-login") {
            response.error =
                "Please sign in again in order to update your email.";
            response.displaySignInPopup = true;
        } else if (
            err.code === "auth/wrong-password" ||
            err.code === "auth/invalid-credential" ||
            err.code === "auth/user-mismatch"
        ) {
            response.error = "Incorrect password. Please try again.";
        } else if (err.code === "auth/weak-password") {
            response.error = "The new password is not strong enough.";
        } else {
            response.error = "Something went wrong.";
        }
        return response;
    }
}

export async function loader() {
    const { currentUser } = auth;
    if (!currentUser) return {};
    const { email } = currentUser;
    const signInMethods = await fetchSignInMethodsForEmail(auth, email);
    return { signInMethods };
}

export default function Account() {
    const { signInMethods } = useLoaderData();
    const fetcher = useFetcher();

    const response = useActionData();
    const message = response?.message;
    const error = response?.error;
    const displaySignInPopup = response?.displaySignInPopup;

    const [allowEditEmail, setAllowEditEmail] = useState(false);
    const [allowEditPassword, setAllowEditPassword] = useState(false);
    const [signInPopupOpen, setSignInPopupOpen] = useState(
        displaySignInPopup || false
    );

    useEffect(() => {
        if (typeof displaySignInPopup === "boolean")
            return setSignInPopupOpen(displaySignInPopup);
    }, [displaySignInPopup]);

    return (
        <div className="h-screen overflow-y-auto bg-custom-gradient pb-12 pt-24 dark:bg-custom-gradient-dark md:pb-0 lg:h-full lg:bg-none lg:pt-0 lg:dark:bg-none">
            {error && (
                <div>
                    <p>{error}</p>
                </div>
            )}
            {message && (
                <div>
                    <p>{message}</p>
                </div>
            )}
            {fetcher.data?.error && (
                <div>
                    <p>{fetcher.data.error}</p>
                </div>
            )}

            {signInPopupOpen && (
                <SignInPopup
                    fetcher={fetcher}
                    signInMethods={signInMethods}
                    closePopup={() => setSignInPopupOpen(false)}
                />
            )}
            <main className="relative mx-auto min-h-full max-w-lg rounded-t-3xl border border-slate-200 bg-white/50 px-6 pb-8 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/50 lg:mx-0 lg:h-full lg:min-h-0 lg:max-w-none lg:overflow-y-auto lg:rounded-2xl lg:px-8 lg:pt-6">
                {!auth.currentUser.photoURL ? (
                    <div className="absolute top-0 left-0 z-10 -translate-y-1/2 translate-x-6 rounded-full border-4 border-white bg-slate-100 dark:border-slate-900 dark:bg-slate-800 lg:hidden">
                        <img
                            src={auth.currentUser.photoURL}
                            alt={auth.currentUser.displayName}
                            className="h-24 w-24 rounded-full object-cover sm:h-28 sm:w-28 lg:h-32 lg:w-32"
                        />
                    </div>
                ) : (
                    <div className="absolute top-0 left-0 flex h-24 w-24 -translate-y-1/2 translate-x-6 items-center justify-center rounded-full border-4 border-white bg-slate-100 dark:border-slate-900 dark:bg-slate-800 sm:h-28 sm:w-28 lg:hidden">
                        <HiOutlineUser className="h-10 w-10 text-slate-400 dark:text-slate-500 sm:h-12 sm:w-12 lg:h-16 lg:w-16" />
                    </div>
                )}
                <h1 className="mt-20 mb-4 text-left text-lg font-bold text-slate-900 dark:text-white lg:hidden">
                    {auth.currentUser.displayName}
                </h1>
                <h1 className="mb-8 hidden text-2xl font-bold text-slate-900 dark:text-white lg:block">
                    Settings
                </h1>
                <section className="mb-5">
                    <Form method="post">
                        <label
                            htmlFor="newEmail"
                            className="mb-1 inline-block text-xs font-medium text-slate-700 dark:text-slate-500 lg:text-sm"
                        >
                            Email
                        </label>
                        <div
                            className={`flex ${
                                !allowEditEmail
                                    ? "flex-row items-center gap-4"
                                    : "flex-col gap-3"
                            }`}
                        >
                            <input
                                type="email"
                                defaultValue={auth.currentUser.email}
                                name="newEmail"
                                id="newEmail"
                                disabled={!allowEditEmail}
                                className="block w-full rounded-md border border-slate-300 bg-white py-1.5 px-2 text-xs text-slate-700 shadow-sm invalid:border-pink-500 invalid:text-pink-600 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-300 focus:invalid:border-pink-500 focus:invalid:ring-pink-500 disabled:bg-slate-50 disabled:text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:invalid:border-pink-500 dark:invalid:text-pink-600 dark:disabled:bg-slate-800/80 dark:disabled:text-slate-500 lg:py-2 lg:px-3 lg:text-sm"
                            />
                            {!allowEditEmail ? (
                                <button
                                    type="button"
                                    onClick={() => setAllowEditEmail(true)}
                                    className="group focus:outline-none"
                                >
                                    <HiOutlinePencil className="h-5 w-5 text-slate-500 transition-colors hover:text-sky-500 group-focus:text-sky-500 dark:text-slate-400 dark:hover:text-sky-400 dark:group-focus:text-sky-400" />
                                </button>
                            ) : (
                                <div className="flex items-center justify-end gap-2">
                                    <button
                                        className="rounded-md py-1 px-2 text-xs font-medium text-slate-900 transition-colors hover:bg-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-300 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100 lg:px-3 lg:py-1.5 lg:text-sm"
                                        type="button"
                                        onClick={() => setAllowEditEmail(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button className="rounded-md bg-sky-500 py-1 px-2 text-xs font-medium text-white transition-colors hover:bg-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-300 lg:py-1.5 lg:px-3 lg:text-sm">
                                        Submit
                                    </button>
                                </div>
                            )}
                        </div>
                    </Form>
                </section>

                <section className="mb-5">
                    <Form method="post" className="mb-4 last:mb-0">
                        <label
                            htmlFor="google"
                            className="mb-1 inline-block text-xs font-medium text-slate-700 dark:text-slate-500 lg:text-sm"
                        >
                            Google ID
                        </label>
                        <button
                            name={
                                signInMethods?.includes("google.com")
                                    ? "unlinkProvider"
                                    : "linkProvider"
                            }
                            value="google"
                            id="google"
                            className="flex w-full items-center justify-center gap-3 rounded-md border border-slate-300 bg-white py-2 px-2 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-1 focus:ring-sky-300 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
                        >
                            {signInMethods?.includes("google.com") ? (
                                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                    Disconnect
                                </span>
                            ) : (
                                <>
                                    <FcGoogle className="h-6 w-6" />
                                    <span className="mr-5 text-sm font-semibold text-slate-900 dark:text-slate-100">
                                        Connect
                                    </span>
                                </>
                            )}
                        </button>
                    </Form>
                    <Form method="post" className="mb-4 last:mb-0">
                        <label
                            htmlFor="facebook"
                            className="mb-1 inline-block text-xs font-medium text-slate-700 dark:text-slate-500 lg:text-sm"
                        >
                            Facebook ID
                        </label>
                        <button
                            name={
                                signInMethods?.includes("facebook.com")
                                    ? "unlinkProvider"
                                    : "linkProvider"
                            }
                            value="facebook"
                            id="facebook"
                            className="flex w-full items-center justify-center gap-3 rounded-md border border-slate-300 bg-white py-2 px-2 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-1 focus:ring-sky-300 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
                        >
                            {signInMethods?.includes("facebook.com") ? (
                                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                    Disconnect
                                </span>
                            ) : (
                                <>
                                    <IoLogoFacebook className="h-6 w-6 text-blue-600" />
                                    <span className="mr-5 text-sm font-semibold text-slate-900 dark:text-slate-100">
                                        Connect
                                    </span>
                                </>
                            )}
                        </button>
                    </Form>
                </section>

                {signInMethods?.includes("password") && (
                    <section className="mb-5">
                        {allowEditPassword ? (
                            <Form method="post">
                                <label
                                    htmlFor="oldPassword"
                                    className="mb-1 inline-block text-xs font-medium text-slate-700 dark:text-slate-500 lg:text-sm"
                                >
                                    Old Password
                                </label>
                                <input
                                    type="password"
                                    name="oldPassword"
                                    id="oldPassword"
                                    autoComplete="current-password"
                                    required
                                    className="mb-4 block w-full rounded-md border border-slate-300 bg-white py-1.5 px-2 text-xs text-slate-700 shadow-sm focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 lg:py-2 lg:px-3 lg:text-sm"
                                />
                                <label
                                    htmlFor="newPassword"
                                    className="mb-1 inline-block text-xs font-medium text-slate-700 dark:text-slate-500 lg:text-sm"
                                >
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    id="newPassword"
                                    autoComplete="new-password"
                                    required
                                    className="mb-4 block w-full rounded-md border border-slate-300 bg-white py-1.5 px-2 text-xs text-slate-700 shadow-sm focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 lg:py-2 lg:px-3 lg:text-sm"
                                />
                                <label
                                    htmlFor="confirmPassword"
                                    className="mb-1 inline-block text-xs font-medium text-slate-700 dark:text-slate-500 lg:text-sm"
                                >
                                    Confirm Password
                                </label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    id="confirmPassword"
                                    autoComplete="new-password"
                                    required
                                    className="mb-4 block w-full rounded-md border border-slate-300 bg-white py-1.5 px-2 text-xs text-slate-700 shadow-sm focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 lg:py-2 lg:px-3 lg:text-sm"
                                />

                                <div className="flex items-center justify-end gap-2">
                                    <button
                                        className="rounded-md py-1 px-2 text-xs font-medium text-slate-900 transition-colors hover:bg-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-300 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100 lg:px-3 lg:py-1.5 lg:text-sm"
                                        type="button"
                                        onClick={() =>
                                            setAllowEditPassword(false)
                                        }
                                    >
                                        Cancel
                                    </button>
                                    <button className="rounded-md bg-sky-500 py-1 px-2 text-xs font-medium text-white transition-colors hover:bg-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-300 lg:py-1.5 lg:px-3 lg:text-sm">
                                        Confirm
                                    </button>
                                </div>
                            </Form>
                        ) : (
                            <div>
                                <h2 className="mb-1 inline-block text-xs font-medium text-slate-700 dark:text-slate-500 lg:text-sm">
                                    Password
                                </h2>
                                <button
                                    onClick={() => setAllowEditPassword(true)}
                                    className="w-full rounded-md border border-slate-300 bg-white py-2 px-2 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-1 focus:ring-sky-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                                >
                                    Update Password
                                </button>
                            </div>
                        )}
                    </section>
                )}
                <section className="mb-5">
                    <h2 className="mb-1 inline-block text-xs font-medium text-slate-700 dark:text-slate-500 lg:text-sm">
                        Switch theme
                    </h2>
                    <ThemeSelectMenu />
                </section>
                <fetcher.Form method="post" action="/signOut" className="mt-7">
                    <button className="rounded-md py-1 text-sm font-semibold text-red-600 transition-colors hover:text-red-500 focus:outline-none focus:ring-1 focus:ring-red-200 dark:text-red-500 dark:hover:text-red-400">
                        Sign Out
                    </button>
                </fetcher.Form>
            </main>
        </div>
    );
}
