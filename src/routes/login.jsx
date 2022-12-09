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
            const signInMethods = await fetchSignInMethodsForEmail(
                auth,
                err.email
            );
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
        <main className="relative grid h-screen grid-cols-1">
            <div className="hidden"></div>
            <section className="py-10 px-4">
                <div className="mx-auto max-w-xs px-4">
                    <div className="mb-10">LOGO</div>
                    <Form method="post">
                        <label
                            className="mb-1 block text-xs font-medium text-slate-700"
                            htmlFor="email"
                        >
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            className="mb-4 block w-full rounded-md border border-slate-300 bg-white py-1.5 px-2 text-xs text-slate-700 shadow-sm"
                        />
                        <label
                            className="mb-1 block text-xs font-medium text-slate-700"
                            htmlFor="password"
                        >
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            name="password"
                            className="mb-5 block w-full rounded-md border border-slate-300 bg-white py-1.5 px-2 text-xs text-slate-700 shadow-sm"
                            autoComplete="current-password"
                        />
                        <div className="flex">
                            <button className="w-full rounded-md bg-sky-500 py-2 px-4 text-xs font-semibold text-white">
                                Log In
                            </button>
                        </div>
                        <div className="my-4 flex items-center gap-3">
                            <div className="h-[1px] flex-1 bg-slate-200"></div>
                            <span className="text-sm text-slate-300">or</span>
                            <div className="h-[1px] flex-1 bg-slate-200"></div>
                        </div>
                        <button
                            name="authProvider"
                            value="google"
                            className="mb-4 flex w-full items-center gap-4 rounded-md border border-slate-300 py-2 px-5 text-xs font-medium text-slate-700"
                        >
                            <FcGoogle className="h-6 w-6" />
                            <span>Continue with Google</span>
                        </button>
                        <button
                            name="authProvider"
                            value="facebook"
                            className="mb-4 flex w-full items-center gap-4 rounded-md border border-slate-300 py-2 px-5 text-xs font-medium text-slate-700"
                        >
                            <IoLogoFacebook className="h-6 w-6 text-blue-600" />
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
                    <p className="mt-6 text-center text-xs text-slate-500">
                        Don't have an account yet?{" "}
                        <Link
                            to="/signup"
                            className="text-slate-800 underline decoration-sky-400 underline-offset-2"
                        >
                            Sign Up
                        </Link>
                    </p>
                </div>
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
