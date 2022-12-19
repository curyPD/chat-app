import { auth } from "../firebase";
import {
    signInWithEmailAndPassword,
    signInWithPopup,
    fetchSignInMethodsForEmail,
    linkWithCredential,
    EmailAuthProvider,
} from "firebase/auth";
import { Form, Link, redirect, useActionData } from "react-router-dom";
import { IoLogoFacebook } from "react-icons/io5";
import { FcGoogle } from "react-icons/fc";
import {
    getAuthProviderObject,
    getAuthToken,
    getProviderIdFromError,
    getAuthCredential,
} from "../helpers";
import logo from "../assets/logo.png";

export async function action({ request }) {
    const formData = await request.formData();
    const response = {};
    let user;
    try {
        if (formData.has("authProvider")) {
            console.log("Auth provider sign in");
            const authProvider = formData.get("authProvider");
            console.log(authProvider);
            const providerObject = getAuthProviderObject(authProvider);
            const userCredential = await signInWithPopup(auth, providerObject);
            user = userCredential.user;
        } else {
            console.log("Password sign in");
            const email = formData.get("email");
            const password = formData.get("password");
            const userCredential = await signInWithEmailAndPassword(
                auth,
                email,
                password
            );
            user = userCredential.user;
        }
        if (formData.has("providerToken")) {
            console.log("Second try");
            const providerToken = formData.get("providerToken");
            const providerId = formData.get("providerId");
            const credential = getAuthCredential(providerId, providerToken);
            const userCredential = await linkWithCredential(user, credential);
            console.log(userCredential);
        }
        if (formData.has("newPassword")) {
            console.log("Second try");
            const newPassword = formData.get("newPassword");
            const email = user.email;
            const credential = EmailAuthProvider.credential(email, newPassword);
            const userCredential = await linkWithCredential(user, credential);
            console.log(userCredential);
        }
        let shouldRedirect = true;
        if (formData.has("redirect")) {
            const redirect = formData.get("redirect");
            shouldRedirect = redirect === "true" ? true : false;
        }
        return shouldRedirect ? redirect("/") : { status: "success" };
    } catch (err) {
        console.error(err);
        if (
            formData.has("authProvider") &&
            err.code === "auth/account-exists-with-different-credential"
        ) {
            const authProvider = formData.get("authProvider");
            response.providerToken = getAuthToken(authProvider, err);
            response.providerId = getProviderIdFromError(authProvider, err);
            const signInMethods = await fetchSignInMethodsForEmail(
                auth,
                err.customData.email
            );
            response.signInMethods = signInMethods;
            return response;
        } else if (err.code === "auth/wrong-password") {
            const email = formData.get("email");
            const signInMethods = await fetchSignInMethodsForEmail(auth, email);
            if (signInMethods.includes("password")) {
                response.error = "Incorrect password. Please try again.";
                return response;
            }
            const password = formData.get("password");
            response.newPassword = password;
            response.signInMethods = signInMethods;
            return response;
        } else {
            response.error = "Failed to log in. Please try again.";
            return response;
        }
    }
}

export default function Login() {
    const response = useActionData();
    const providerToken = response?.providerToken;
    const providerId = response?.providerId;
    const newPassword = response?.newPassword;
    const signInMethods = response?.signInMethods;
    const error = response?.error;

    return (
        <main className="relative h-screen overflow-y-auto bg-custom-gradient py-16 md:py-20">
            <section className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white/50 px-8 py-6 backdrop-blur-md md:max-w-lg md:px-12 lg:py-8">
                <div className="mb-8 lg:mb-6">
                    <img
                        src={logo}
                        alt="Logo"
                        className="mx-auto block h-10 w-10 lg:mx-0"
                    />
                </div>
                <h1 className="mb-6 text-center text-lg font-bold text-slate-800 lg:mb-9 lg:text-left lg:text-xl">
                    Login to your account
                </h1>
                <Form method="post">
                    <label
                        className="mb-1 block text-xs font-medium text-slate-700 lg:text-sm"
                        htmlFor="email"
                    >
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        name="email"
                        className="mb-4 block w-full rounded-md border border-slate-300 bg-white py-1.5 px-2 text-xs text-slate-700 shadow-sm invalid:border-pink-500 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-300 lg:py-2 lg:px-3 lg:text-sm"
                    />
                    <label
                        className="mb-1 block text-xs font-medium text-slate-700 lg:text-sm"
                        htmlFor="password"
                    >
                        Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        name="password"
                        className="mb-5 block w-full rounded-md border border-slate-300 bg-white py-1.5 px-2 text-xs text-slate-700 shadow-sm focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-300 lg:py-2 lg:px-3 lg:text-sm"
                        autoComplete="current-password"
                    />
                    <div className="flex flex-col gap-4 lg:flex-row-reverse lg:items-center lg:justify-between lg:gap-0">
                        <button className="w-full rounded-md bg-sky-500 py-2 px-4 text-xs font-semibold text-white transition-colors hover:bg-sky-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 lg:w-auto lg:px-5 lg:text-base">
                            Log In
                        </button>
                        <Link
                            to="/forgot-password"
                            className="rounded-sm text-xs text-sky-500 underline underline-offset-2 hover:no-underline focus:no-underline focus:outline-none lg:text-sm"
                        >
                            Forgot password?
                        </Link>
                    </div>
                    <div className="my-4 flex items-center gap-3 lg:my-5">
                        <div className="h-[1px] flex-1 bg-slate-200"></div>
                        <span className="text-sm text-slate-300">or</span>
                        <div className="h-[1px] flex-1 bg-slate-200"></div>
                    </div>
                    <button
                        name="authProvider"
                        value="google"
                        className="mb-4 flex w-full items-center gap-4 rounded-md border border-slate-300 py-2 px-5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-1 focus:ring-sky-300 sm:pl-24 lg:mb-5 lg:gap-5 lg:pl-20 lg:text-sm"
                    >
                        <FcGoogle className="h-6 w-6 lg:h-7 lg:w-7" />
                        <span>Continue with Google</span>
                    </button>
                    <button
                        name="authProvider"
                        value="facebook"
                        className="mb-4 flex w-full items-center gap-4 rounded-md border border-slate-300 py-2 px-5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-1 focus:ring-sky-300 sm:pl-24 lg:mb-5 lg:gap-5 lg:pl-20 lg:text-sm"
                    >
                        <IoLogoFacebook className="h-6 w-6 text-blue-600 lg:h-7 lg:w-7" />
                        <span>Continue with Facebook</span>
                    </button>
                    {providerToken && (
                        <>
                            <input
                                type="hidden"
                                name="providerToken"
                                value={providerToken}
                            />
                            <input
                                type="hidden"
                                name="providerId"
                                value={providerId}
                            />
                        </>
                    )}
                    {newPassword && (
                        <input
                            type="hidden"
                            name="newPassword"
                            value={newPassword}
                        />
                    )}
                </Form>
                <p className="mt-6 text-center text-xs text-slate-500 lg:mt-9 lg:text-sm">
                    Don't have an account yet?{" "}
                    <Link
                        to="/signup"
                        className="rounded-sm text-slate-800 underline decoration-sky-400 underline-offset-2 hover:no-underline focus:no-underline focus:outline-none"
                    >
                        Sign Up
                    </Link>
                </p>
            </section>
            {signInMethods && (
                <div className="absolute">
                    Please sign in using{" "}
                    {signInMethods.length > 1
                        ? "one of the methods"
                        : "the method"}{" "}
                    you've used before:{" "}
                    {signInMethods.map(
                        (method, i, arr) =>
                            `${method}${i === arr.length - 1 ? "" : ","}`
                    )}
                    . We'll link{" "}
                    {providerId ? providerId : "the password you entered"} to
                    your account automatically.{" "}
                    {newPassword &&
                        "You'll be able to change it later on your account page."}
                </div>
            )}
            {error && (
                <div className="absolute">
                    <p>{error}</p>
                </div>
            )}
        </main>
    );
}
