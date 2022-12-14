import { auth, database } from "../firebase";
import {
    createUserWithEmailAndPassword,
    updateProfile,
    signInWithPopup,
} from "firebase/auth";
import { ref, update } from "firebase/database";
import { Form, Link, redirect, useActionData } from "react-router-dom";
import { IoLogoFacebook } from "react-icons/io5";
import { FcGoogle } from "react-icons/fc";
import { getAuthProviderObject } from "../helpers";
import logo from "../assets/logo.png";
import PasswordInput from "../components/PasswordInput";
import Message from "../components/Message";

export async function action({ request }) {
    const formData = await request.formData();
    const response = {};
    try {
        if (formData.has("authProvider")) {
            console.log("Auth provider sign up");
            const authProvider = formData.get("authProvider");
            console.log(authProvider);
            const providerObject = getAuthProviderObject(authProvider);
            const userCredential = await signInWithPopup(auth, providerObject);
            const { user } = userCredential;
            const updates = {};
            updates[`users/${user.uid}/uid`] = user.uid;
            updates[`users/${user.uid}/name`] = user.displayName;
            updates[`users/${user.uid}/email`] = user.email;
            updates[`users/${user.uid}/profile_picture`] = user.photoURL;
            updates[`users/${user.uid}/profile_picture_sm`] = user.photoURL;
            await update(ref(database), updates);
        } else {
            console.log("Password sign up");
            const incorrectFields = [];
            for (const entry of formData) {
                if (entry[1] === "") incorrectFields.push(entry[0]);
            }
            if (incorrectFields.length > 0) {
                response.incorrectFields = incorrectFields;
                response.error =
                    "Please fill out all the fields or continue with Google or Facebook.";
                return response;
            }
            const userName = formData.get("name");
            const email = formData.get("email");
            const password = formData.get("password");
            const confirmPassword = formData.get("confirmPassword");
            if (password !== confirmPassword) {
                response.incorrectFields = ["password", "confirmPassword"];
                response.error = "Passwords do not match.";
                return response;
            }
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );
            const { user } = userCredential;
            await updateProfile(user, { displayName: userName });
            const updates = {};
            updates[`users/${user.uid}/uid`] = user.uid;
            updates[`users/${user.uid}/name`] = user.displayName;
            updates[`users/${user.uid}/email`] = user.email;
            updates[`users/${user.uid}/profile_picture`] = "";
            updates[`users/${user.uid}/profile_picture_sm`] = "";
            updates[`users/${user.uid}/bio`] = "";
            updates[`users/${user.uid}/twitter`] = "";
            await update(ref(database), updates);
        }
        return redirect(`/edit`);
    } catch (err) {
        console.error(err);
        if (
            err.code === "auth/email-already-in-use" ||
            err.code === "auth/account-exists-with-different-credential"
        ) {
            response.error =
                "There already exists an account with the given email address.";
        } else if (err.code === "auth/invalid-email") {
            response.error = "The email address is not valid.";
        } else if (err.code === "auth/weak-password") {
            response.error = "The password is too weak.";
        } else {
            response.error = "Failed to sign up. Please try again.";
        }
        return response;
    }
}

export default function Signup() {
    const response = useActionData();
    const error = response?.error;
    const incorrectFields = response?.incorrectFields;

    return (
        <main className="relative h-screen overflow-y-auto bg-custom-gradient py-16 dark:bg-custom-gradient-dark md:py-20">
            <section className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white/50 px-8 py-6 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/50 md:max-w-lg lg:py-8 lg:px-12">
                <div className="mb-8 lg:mb-6">
                    <img
                        src={logo}
                        alt="Logo"
                        className="mx-auto block h-10 w-10 dark:drop-shadow-lg lg:mx-0"
                    />
                </div>
                <h1 className="mb-6 text-center text-lg font-bold text-slate-800 dark:text-slate-50 lg:mb-9 lg:text-left lg:text-xl">
                    Create a new account
                </h1>
                <Form method="post">
                    <label
                        htmlFor="name"
                        className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-400 lg:text-sm"
                    >
                        Name
                    </label>
                    <input
                        id="name"
                        type="text"
                        name="name"
                        className={`mb-4 block w-full rounded-md border dark:bg-slate-800 dark:text-slate-300 ${
                            incorrectFields?.includes("name")
                                ? "border-pink-500 dark:border-pink-500"
                                : " border-slate-300 dark:border-slate-700"
                        } bg-white py-1.5 px-2 text-xs text-slate-700 shadow-sm focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-300 lg:py-2 lg:px-3 lg:text-sm`}
                    />
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
                        className={`mb-4 block w-full rounded-md border dark:bg-slate-800 dark:text-slate-300 ${
                            incorrectFields?.includes("email")
                                ? "border-pink-500 dark:border-pink-500"
                                : " border-slate-300 dark:border-slate-700"
                        } bg-white py-1.5 px-2 text-xs text-slate-700 shadow-sm invalid:border-pink-500 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-300 focus:invalid:ring-pink-500 dark:invalid:border-pink-500 dark:focus:invalid:border-pink-500 lg:py-2 lg:px-3 lg:text-sm`}
                    />
                    <label
                        htmlFor="password"
                        className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-400 lg:text-sm"
                    >
                        Password
                    </label>
                    <PasswordInput
                        id="password"
                        name="password"
                        autoComplete="new-password"
                        className={
                            incorrectFields?.includes("password")
                                ? "mb-4 block w-full rounded-md border border-pink-500 bg-white py-1.5 px-2 text-xs text-slate-700 shadow-sm focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-300 dark:border-pink-500 dark:bg-slate-800 dark:text-slate-300 lg:py-2 lg:px-3 lg:text-sm"
                                : "mb-4 block w-full rounded-md border border-slate-300 bg-white py-1.5 px-2 text-xs text-slate-700 shadow-sm focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 lg:py-2 lg:px-3 lg:text-sm"
                        }
                    />
                    <label
                        htmlFor="confirmPassword"
                        className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-400 lg:text-sm"
                    >
                        Confirm password
                    </label>
                    <PasswordInput
                        id="confirmPassword"
                        name="confirmPassword"
                        autoComplete="new-password"
                        className={
                            incorrectFields?.includes("confirmPassword")
                                ? "mb-4 block w-full rounded-md border border-pink-500 bg-white py-1.5 px-2 text-xs text-slate-700 shadow-sm focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-300 dark:border-pink-500 dark:bg-slate-800 dark:text-slate-300 lg:py-2 lg:px-3 lg:text-sm"
                                : "mb-4 block w-full rounded-md border border-slate-300 bg-white py-1.5 px-2 text-xs text-slate-700 shadow-sm focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 lg:py-2 lg:px-3 lg:text-sm"
                        }
                    />
                    <div className="flex lg:justify-end">
                        <button className="w-full rounded-md bg-sky-500 py-2 px-4 text-xs font-semibold text-white transition-colors hover:bg-sky-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 lg:w-auto lg:px-5 lg:text-base">
                            Sign Up
                        </button>
                    </div>
                    <div className="my-4 flex items-center gap-3 lg:my-5">
                        <div className="h-[1px] flex-1 bg-slate-200 dark:bg-slate-600"></div>
                        <span className="text-sm text-slate-300 dark:text-slate-500">
                            or
                        </span>
                        <div className="h-[1px] flex-1 bg-slate-200 dark:bg-slate-600"></div>
                    </div>
                    <button
                        name="authProvider"
                        value="google"
                        className="mb-4 flex w-full items-center gap-4 rounded-md border border-slate-300 py-2 px-5 pl-10 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-1 focus:ring-sky-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 sm:pl-24 md:pl-32 lg:mb-5 lg:gap-5 lg:pl-20 lg:text-sm"
                    >
                        <FcGoogle className="h-6 w-6 lg:h-7 lg:w-7" />
                        <span>Continue with Google</span>
                    </button>
                    <button
                        name="authProvider"
                        value="facebook"
                        className="mb-4 flex w-full items-center gap-4 rounded-md border border-slate-300 py-2 px-5 pl-10 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-1 focus:ring-sky-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 sm:pl-24 md:pl-32 lg:mb-5 lg:gap-5 lg:pl-20 lg:text-sm"
                    >
                        <IoLogoFacebook className="h-6 w-6 text-blue-600 dark:text-blue-500 lg:h-7 lg:w-7" />
                        <span>Continue with Facebook</span>
                    </button>
                </Form>
                <p className="mt-6 text-center text-xs text-slate-500 lg:mt-9 lg:text-sm">
                    Already have an account?{" "}
                    <Link
                        to="/login"
                        className="text-slate-800 underline decoration-sky-400 underline-offset-2 hover:no-underline focus:no-underline focus:outline-none dark:text-slate-300"
                    >
                        Log In
                    </Link>
                </p>
                {error && <Message text={error} error={true} />}
            </section>
        </main>
    );
}
